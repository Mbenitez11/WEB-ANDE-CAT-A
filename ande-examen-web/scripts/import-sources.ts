/**
 * Importa SourceDocument + OcrFlag desde el material fuente.
 *
 * Lee:
 *   $ANDE_DATABASE_PATH/INVENTARIO_ARCHIVOS.csv     -> SourceDocument
 *   $ANDE_DATABASE_PATH/DUDAS_OCR_TRANSCRIPCION.md  -> OcrFlag
 *
 * Idempotente: upsert por externalId.
 *
 * Reglas:
 *  - duplicateOfId se resuelve en una segunda pasada (porque la fuente canónica
 *    puede aparecer después en el CSV).
 *  - Documentos con processing state que contiene "OCR" o "imagen" se marcan
 *    como sospechosos por defecto: se prioriza chequear OCR flags.
 *  - Nunca borramos documentos existentes en la base.
 */
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { ImportLogger, loadDotenv, parseCsv, readText, requireEnv, requirePath } from "./lib/io";

loadDotenv();

const db = new PrismaClient();
const log = new ImportLogger("import-sources");

function detectDocType(tipoExt: string): string {
  const t = tipoExt.replace(".", "").toLowerCase();
  if (t === "pdf") return "pdf";
  if (t === "docx" || t === "doc") return "docx";
  if (t === "jpeg" || t === "jpg" || t === "png") return "image";
  if (t === "md") return "md";
  if (t === "gdoc") return "gdoc";
  if (t === "zip" || t === "rar") return "archive";
  return "other";
}

function parsePages(raw: string): number | null {
  if (!raw) return null;
  const m = raw.match(/^(\d+)/);
  return m ? Number(m[1]) : null;
}

async function importInventory(databasePath: string) {
  const csvPath = path.join(databasePath, "INVENTARIO_ARCHIVOS.csv");
  const text = await readText(csvPath);
  const rows = parseCsv(text);
  log.bump("filas leídas", rows.length);

  // Pasada 1: upsert sin duplicateOfId
  for (const row of rows) {
    if (!row.id) continue;
    await db.sourceDocument.upsert({
      where: { externalId: row.id },
      create: {
        externalId: row.id,
        name: row.nombre || row.id,
        filePath: row.ruta || row.nombre || row.id,
        documentType: detectDocType(row.tipo || ""),
        sha256: row.sha256 || null,
        totalPages: parsePages(row.paginas),
        topicGuess: row.tema_probable || null,
        processingState: row.estado_procesamiento || null,
        duplicateGroup: row.grupo_duplicado || null,
        notes: row.notas || null,
      },
      update: {
        name: row.nombre || row.id,
        filePath: row.ruta || row.nombre || row.id,
        documentType: detectDocType(row.tipo || ""),
        sha256: row.sha256 || null,
        totalPages: parsePages(row.paginas),
        topicGuess: row.tema_probable || null,
        processingState: row.estado_procesamiento || null,
        duplicateGroup: row.grupo_duplicado || null,
        notes: row.notas || null,
      },
    });
    log.bump("documentos upsert");
  }

  // Pasada 2: resolver duplicateOf
  const byExt = new Map<string, string>();
  const all = await db.sourceDocument.findMany({ select: { id: true, externalId: true } });
  for (const d of all) byExt.set(d.externalId, d.id);

  for (const row of rows) {
    if (!row.id || !row.fuente_canonica || row.fuente_canonica === row.id) continue;
    const targetId = byExt.get(row.fuente_canonica);
    if (!targetId) continue;
    await db.sourceDocument.update({
      where: { externalId: row.id },
      data: { duplicateOfId: targetId },
    });
    log.bump("duplicateOf linkeados");
  }
}

async function importOcrFlags(databasePath: string) {
  const mdPath = path.join(databasePath, "DUDAS_OCR_TRANSCRIPCION.md");
  const text = await readText(mdPath);

  // Tabla markdown: `| Fuente | Pagina/imagen | Confianza | Fragmento |`
  const rows = text.split(/\r?\n/).filter((l) => l.startsWith("|"));
  if (rows.length < 3) {
    log.bump("DUDAS_OCR no tiene tabla");
    return;
  }
  // saltamos header (línea 0) y separador (línea 1)
  const dataRows = rows.slice(2);

  // Recreamos los flags no revisados desde cero (idempotencia robusta).
  // Conservamos los marcados como `reviewed: true` — son acciones humanas.
  await db.ocrFlag.deleteMany({ where: { reviewed: false } });

  for (const line of dataRows) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 4) continue;
    const fuenteCell = cells[0]; // "`F0010` EXAMEN SAEE ANDE.pdf"
    const m = fuenteCell.match(/F\d{4,}/);
    if (!m) continue;
    const externalId = m[0];

    const pagCell = cells[1].toLowerCase();
    const page = (() => {
      const pm = pagCell.match(/(\d+)/);
      return pm ? Number(pm[1]) : null;
    })();
    const confidence = (() => {
      const cc = cells[2].replace(",", ".").match(/[\d.]+/);
      if (!cc) return null;
      const n = Number(cc[0]);
      return Number.isFinite(n) ? Math.min(1, n / 100) : null;
    })();
    const fragment = cells[3];

    const doc = await db.sourceDocument.findUnique({ where: { externalId }, select: { id: true } });
    if (!doc) {
      log.bump("OCR flag sin documento");
      continue;
    }

    await db.ocrFlag.create({
      data: { documentId: doc.id, page, confidence, fragment },
    });
    log.bump("OCR flag creado");
  }
}

async function main() {
  const databasePath = requirePath(
    process.env.ANDE_DATABASE_PATH ?? requireEnv("ANDE_DATABASE_PATH"),
    "ANDE_DATABASE_PATH",
  );
  await importInventory(databasePath);
  await importOcrFlags(databasePath);
  log.print();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
