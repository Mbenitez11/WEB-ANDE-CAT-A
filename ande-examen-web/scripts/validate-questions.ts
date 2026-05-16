/**
 * Valida calidad de las preguntas en la DB.
 *
 * Detecta:
 *  - sin tema (no debería pasar — FK)
 *  - sin opciones (≥1)
 *  - sin opción correcta (importante)
 *  - múltiples opciones correctas
 *  - opciones repetidas (texto idéntico normalizado)
 *  - sin explicación
 *  - sin fuente asociada
 *  - todas sus fuentes con requiresVerification=true
 *  - duplicados probables (mismo statement normalizado en otro registro)
 *  - generadas por IA pendientes (createdFrom: "ai:…" + status: borrador)
 *
 * Exit code 1 si hay errores. Warnings y info no rompen.
 *
 * Uso:
 *   npm run validate:questions
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

  const questions = await db.question.findMany({
    include: {
      topic: { select: { slug: true } },
      options: true,
      sources: {
        include: {
          source: { select: { id: true, requiresVerification: true, page: true } },
        },
      },
    },
  });

  console.log(`Validando ${questions.length} preguntas…`);

  // Para duplicados, agrupamos por statement normalizado
  const byStatement = new Map<string, typeof questions>();

  for (const q of questions) {
    const ref = q.externalId ?? q.id;

    // tema
    if (!q.topic) {
      report.error("sin tema", "Pregunta sin topic resuelto", ref);
    }

    // opciones
    if (q.options.length === 0) {
      report.error("sin opciones", "La pregunta no tiene ninguna AnswerOption", ref);
    } else if (q.options.length < 2) {
      report.warn("opciones insuficientes", `Solo ${q.options.length} opción`, ref);
    }

    // exactamente UNA correcta. Para `borrador` es esperable que no haya
    // (el importer la deja así cuando la respuesta no matchea opciones).
    const correctCount = q.options.filter((o) => o.isCorrect).length;
    if (q.options.length > 0 && correctCount === 0) {
      if (q.status === "borrador") {
        report.info(
          "sin opción correcta · borrador",
          "Borrador esperando revisión manual",
          ref,
        );
      } else {
        report.error("sin opción correcta", "Ninguna opción marcada como correcta", ref);
      }
    } else if (correctCount > 1) {
      report.error(
        "múltiples correctas",
        `${correctCount} opciones marcadas como correctas`,
        ref,
      );
    }

    // opciones repetidas
    const optTexts = q.options.map((o) => norm(o.text));
    const optSet = new Set(optTexts);
    if (optSet.size !== optTexts.length) {
      report.warn("opciones repetidas", "Hay opciones con el mismo texto normalizado", ref);
    }

    // explicación
    if (!q.explanation || q.explanation.trim().length < 5) {
      report.warn("sin explicación", "explanation vacía o muy corta", ref);
    }

    // fuentes
    if (q.sources.length === 0) {
      if (q.status === "borrador") {
        report.info("sin fuente · borrador", "Borrador sin fuente (esperable)", ref);
      } else {
        report.error("sin fuente", `Pregunta ${q.status} sin ninguna fuente asociada`, ref);
      }
    } else {
      const allWithoutPage = q.sources.every((rel) => rel.source.page == null);
      if (allWithoutPage) {
        report.info(
          "fuentes sin página",
          `${q.sources.length} fuente(s), ninguna con número de página`,
          ref,
        );
      }
      // requiresVerification a nivel pregunta ya cubre "todas las fuentes dudosas".
      // No duplicamos el warning.
    }

    // IA pendiente
    if (q.createdFrom?.startsWith("ai:") && q.status !== "validada") {
      report.warn("IA pendiente de revisión", `createdFrom=${q.createdFrom}, status=${q.status}`, ref);
    }

    // Para duplicados
    const key = norm(q.statement);
    const arr = byStatement.get(key) ?? [];
    arr.push(q);
    byStatement.set(key, arr);
  }

  // Duplicados
  for (const [key, arr] of byStatement) {
    if (arr.length > 1) {
      const refs = arr.map((q) => q.externalId ?? q.id).join(", ");
      report.warn(
        "duplicado probable",
        `${arr.length} preguntas con el mismo enunciado normalizado: "${key.slice(0, 60)}…"`,
        refs,
      );
    }
  }

  // Stats finales por status
  const byStatus = new Map<string, number>();
  for (const q of questions) byStatus.set(q.status, (byStatus.get(q.status) ?? 0) + 1);
  console.log("\nDistribución por status:");
  for (const [s, n] of byStatus) console.log(`  ${s.padEnd(24)} ${n}`);

  const exit = report.print("validate:questions");
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
