/**
 * Valida calidad del catálogo de fuentes.
 *
 * Detecta:
 *  - SourceDocuments huérfanos (sin Source ni preguntas ni chunks)
 *  - Documentos marcados como duplicados (duplicateGroup) sin canonical (duplicateOfId)
 *  - Documentos con processingState que sugiere problema (sin texto, error, justificado)
 *  - SourceDocuments sin sha256 (puntero o procesamiento incompleto)
 *  - Sources sin página y sin sección (cita vacía)
 *  - OcrFlags con confidence muy baja (< 0.5)
 *
 * Uso:
 *   npm run validate:sources
 */
import { PrismaClient } from "@prisma/client";
import { loadDotenv } from "./lib/io";
import { ValidationReport } from "./lib/validate";

loadDotenv();
const db = new PrismaClient();

async function main() {
  const report = new ValidationReport();

  const [docs, sources, ocrFlags] = await Promise.all([
    db.sourceDocument.findMany({
      include: {
        _count: { select: { sources: true, ocrFlags: true } },
      },
    }),
    db.source.findMany({
      include: {
        _count: { select: { questions: true, chunks: true } },
        document: { select: { externalId: true } },
      },
    }),
    db.ocrFlag.findMany({
      include: { document: { select: { externalId: true } } },
    }),
  ]);

  console.log(`Validando ${docs.length} SourceDocument · ${sources.length} Source · ${ocrFlags.length} OcrFlag…`);

  // -------- SourceDocument --------
  for (const d of docs) {
    const ref = d.externalId;

    if (d.duplicateGroup && !d.duplicateOfId && d.duplicateGroup !== d.externalId) {
      // Puede ser la canónica del grupo — chequeamos
      const canonicalsInGroup = docs.filter(
        (x) => x.duplicateGroup === d.duplicateGroup && !x.duplicateOfId,
      );
      if (canonicalsInGroup.length !== 1) {
        report.error(
          "grupo de duplicados sin canónica única",
          `Grupo ${d.duplicateGroup} tiene ${canonicalsInGroup.length} candidatos canónicos`,
          ref,
        );
      }
    }

    const state = (d.processingState ?? "").toLowerCase();
    if (state.includes("error") || state.includes("no se pudo")) {
      report.warn("documento con error de procesamiento", d.processingState ?? "", ref);
    }
    if (state.includes("justificado")) {
      report.info("documento justificado", d.processingState ?? "", ref);
    }
    if (!d.sha256 && d.documentType !== "gdoc" && d.documentType !== "archive") {
      report.warn("documento sin sha256", `tipo=${d.documentType}`, ref);
    }

    if (
      d._count.sources === 0 &&
      d._count.ocrFlags === 0 &&
      !d.duplicateOfId
    ) {
      report.info(
        "documento sin uso",
        "No tiene Source ni OcrFlag (no es citado por ninguna pregunta)",
        ref,
      );
    }
  }

  // -------- Source --------
  for (const s of sources) {
    const ref = `${s.document.externalId}#${s.id.slice(-6)}`;
    if (s.page == null && !s.section) {
      report.info(
        "cita sin página ni sección",
        "Source genérico — referencia a documento completo",
        ref,
      );
    }
    if (s.confidence != null && s.confidence < 0.5 && !s.requiresVerification) {
      report.warn(
        "confidence baja sin requiresVerification",
        `confidence=${s.confidence.toFixed(2)}`,
        ref,
      );
    }
    if (s._count.questions === 0 && s._count.chunks === 0) {
      report.info("Source no usada", "Sin preguntas ni chunks asociados", ref);
    }
  }

  // -------- OcrFlag --------
  let lowConf = 0;
  for (const f of ocrFlags) {
    if (f.confidence != null && f.confidence < 0.5) {
      lowConf++;
    }
  }
  if (lowConf > 0) {
    report.warn(
      "OCR flags con confidence < 0.5",
      `${lowConf} flag(s) con confianza muy baja`,
    );
  }

  // -------- Stats --------
  const byType = new Map<string, number>();
  for (const d of docs) byType.set(d.documentType, (byType.get(d.documentType) ?? 0) + 1);
  console.log("\nDocumentos por tipo:");
  for (const [t, n] of byType) console.log(`  ${t.padEnd(12)} ${n}`);

  const canonicals = docs.filter((d) => !d.duplicateOfId).length;
  const dups = docs.length - canonicals;
  console.log(`\nCanónicos: ${canonicals} · Duplicados: ${dups}`);

  const exit = report.print("validate:sources");
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
