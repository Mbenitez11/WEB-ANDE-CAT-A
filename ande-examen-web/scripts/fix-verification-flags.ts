/**
 * One-off: re-aplicar la regla actualizada de `requiresVerification` a
 * Source y Question existentes. La regla nueva (post-bugfix) es:
 *   Source.requiresVerification = (document.processingState contiene "OCR" o "imagen")
 *   Question.requiresVerification = (todas sus Source tienen requiresVerification=true OR no tiene fuentes)
 *
 * Idempotente. Correr una sola vez después del bugfix; futuros imports ya
 * aplican la regla correcta directamente.
 *
 * Uso: npx tsx scripts/fix-verification-flags.ts
 */
import { PrismaClient } from "@prisma/client";
import { loadDotenv } from "./lib/io";

loadDotenv();
const db = new PrismaClient();

function isDocSuspect(state: string | null): boolean {
  const s = (state ?? "").toLowerCase();
  return s.includes("ocr") || s.includes("imagen");
}

async function main() {
  // 1. Recalcular Source.requiresVerification
  const sources = await db.source.findMany({
    include: { document: { select: { processingState: true } } },
  });
  let sourceUpdates = 0;
  for (const s of sources) {
    const expected = isDocSuspect(s.document.processingState);
    if (s.requiresVerification !== expected) {
      await db.source.update({
        where: { id: s.id },
        data: {
          requiresVerification: expected,
          confidence: expected ? 0.6 : 0.9,
        },
      });
      sourceUpdates++;
    }
  }
  console.log(`Source actualizados: ${sourceUpdates}/${sources.length}`);

  // 2. Recalcular Question.requiresVerification
  const questions = await db.question.findMany({
    include: { sources: { include: { source: { select: { requiresVerification: true } } } } },
  });
  let questionUpdates = 0;
  for (const q of questions) {
    const expected =
      q.sources.length === 0 ||
      q.sources.every((rel) => rel.source.requiresVerification);
    if (q.requiresVerification !== expected) {
      await db.question.update({
        where: { id: q.id },
        data: { requiresVerification: expected },
      });
      questionUpdates++;
    }
  }
  console.log(`Question actualizados: ${questionUpdates}/${questions.length}`);

  // Stats finales
  const verifFalse = await db.question.count({
    where: { status: "validada", requiresVerification: false },
  });
  const verifTrue = await db.question.count({
    where: { status: "validada", requiresVerification: true },
  });
  console.log(`\nValidadas con requiresVerification:false → ${verifFalse}`);
  console.log(`Validadas con requiresVerification:true  → ${verifTrue}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
