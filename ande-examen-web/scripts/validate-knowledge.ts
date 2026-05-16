/**
 * Valida calidad de KnowledgeChunk (la base que alimentará el agente IA — Fase 14).
 *
 * Hoy todavía no hay chunks importados, así que el script reporta el estado
 * vacío. Cuando el importer de chunks exista, se ampliará con:
 *  - chunks sin source
 *  - chunks sin topic
 *  - chunks demasiado largos (>4000 chars — limpiar antes de embeddings)
 *  - chunks duplicados (mismo title + content normalizado)
 *  - contradicciones sin status resuelto pero referenciadas como definitivas
 *
 * Uso:
 *   npm run validate:knowledge
 */
import { PrismaClient } from "@prisma/client";
import { loadDotenv } from "./lib/io";
import { ValidationReport } from "./lib/validate";

loadDotenv();
const db = new PrismaClient();

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

async function main() {
  const report = new ValidationReport();

  const [chunks, contradictions] = await Promise.all([
    db.knowledgeChunk.findMany({
      include: { source: { select: { id: true, requiresVerification: true } }, topic: { select: { slug: true } } },
    }),
    db.contradiction.findMany(),
  ]);

  console.log(`Validando ${chunks.length} chunks · ${contradictions.length} contradicciones…`);

  if (chunks.length === 0) {
    report.info(
      "sin chunks",
      "KnowledgeChunk está vacío — falta correr scripts/import-chunks.ts (Fase 14)",
    );
  }

  const byContent = new Map<string, typeof chunks>();
  for (const c of chunks) {
    const ref = c.id.slice(-8);

    if (!c.topic) report.warn("chunk sin topic", `chunkType=${c.chunkType}`, ref);
    if (!c.source) {
      if (c.requiresVerification) {
        report.info("chunk sin fuente · marcado", "esperable mientras esté en revisión", ref);
      } else {
        report.error("chunk sin fuente", "Sin source asociada y sin marca de verificación", ref);
      }
    }

    if (c.content.length > 4000) {
      report.warn("chunk largo", `${c.content.length} chars (> 4000)`, ref);
    }
    if (c.content.trim().length < 30) {
      report.warn("chunk muy corto", `${c.content.length} chars (< 30)`, ref);
    }

    const key = norm(c.content);
    const arr = byContent.get(key) ?? [];
    arr.push(c);
    byContent.set(key, arr);
  }

  for (const [, arr] of byContent) {
    if (arr.length > 1) {
      report.warn(
        "chunk duplicado",
        `${arr.length} chunks con el mismo contenido normalizado`,
        arr.map((c) => c.id.slice(-8)).join(", "),
      );
    }
  }

  // Contradicciones
  for (const c of contradictions) {
    if (c.status === "resuelta" && !c.resolution) {
      report.error(
        "contradicción resuelta sin resolution",
        `id=${c.id.slice(-8)}: "${c.title}"`,
      );
    }
    if (c.status === "firme" && (!c.sourceAId || !c.sourceBId)) {
      report.warn(
        "contradicción firme sin ambas fuentes",
        `id=${c.id.slice(-8)}: "${c.title}"`,
      );
    }
  }

  // Stats por tipo
  if (chunks.length > 0) {
    const byType = new Map<string, number>();
    for (const c of chunks) byType.set(c.chunkType, (byType.get(c.chunkType) ?? 0) + 1);
    console.log("\nChunks por tipo:");
    for (const [t, n] of byType) console.log(`  ${t.padEnd(20)} ${n}`);
  }

  const exit = report.print("validate:knowledge");
  process.exit(exit);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
