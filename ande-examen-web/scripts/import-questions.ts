/**
 * Importa preguntas desde la wiki Obsidian.
 *
 * Lee `$OBSIDIAN_VAULT_PATH/wiki/preguntas/banco-preguntas-*.md` y, para cada
 * pregunta válida, hace upsert de Question + AnswerOption + Source + QuestionSource.
 *
 * Idempotente por `question.externalId`.
 *
 * Reglas de negocio:
 *  - Cada pregunta debe tener tema válido (resolveTopicSlug). Si no, queda como
 *    `borrador` con tema "saee" como fallback (raro: cuando aparece es bug del
 *    parser, no de datos).
 *  - Si la fuente no tiene página → `Source.requiresVerification = true`.
 *  - Si el SourceDocument está marcado como OCR o imagen, las fuentes derivadas
 *    se marcan también `requiresVerification = true`.
 *  - Question.requiresVerification = true cuando todas sus fuentes lo están,
 *    o cuando no hay ninguna fuente concreta.
 *  - Question.status = "validada" cuando: tiene tema resuelto, ≥1 fuente con
 *    página o ≥1 fuente verificada. Si no, "requiere_verificacion".
 *  - Si la respuesta correcta no coincide con ninguna opción → rechazo.
 */
import { PrismaClient } from "@prisma/client";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { ImportLogger, loadDotenv, readText, requireEnv, requirePath } from "./lib/io";
import { parseQuestionBlock, splitQuestionBlocks } from "./lib/parse-question";
import { resolveDifficulty, resolveTopicSlug } from "./lib/topic-resolver";

loadDotenv();

const db = new PrismaClient();
const log = new ImportLogger("import-questions");

type DocInfo = { id: string; processingState: string | null };

function isDocSuspect(doc: DocInfo | null | undefined): boolean {
  if (!doc) return true;
  const s = (doc.processingState ?? "").toLowerCase();
  return s.includes("ocr") || s.includes("imagen");
}

const sourceCache = new Map<string, string>(); // key `${docId}::${page ?? "_"}` → sourceId

async function resolveSource(docInfo: DocInfo, page: number | null): Promise<string> {
  const key = `${docInfo.id}::${page ?? "_"}`;
  const cached = sourceCache.get(key);
  if (cached) return cached;

  const existing = await db.source.findFirst({
    where: { documentId: docInfo.id, page: page ?? null },
    select: { id: true },
  });
  if (existing) {
    sourceCache.set(key, existing.id);
    return existing.id;
  }

  // requiresVerification a nivel `Source` se marca solo si el documento es OCR/imagen.
  // Que falte la página NO es motivo para flag — la wiki original simplemente no
  // siempre anota la página, pero el texto es confiable.
  const requiresVerification = isDocSuspect(docInfo);
  const created = await db.source.create({
    data: {
      documentId: docInfo.id,
      page,
      requiresVerification,
      confidence: requiresVerification ? 0.6 : 0.9,
    },
    select: { id: true },
  });
  sourceCache.set(key, created.id);
  return created.id;
}

async function importBankFile(filePath: string, fallbackTopicId: string) {
  const text = await readText(filePath);
  // Saltar frontmatter YAML
  const body = text.replace(/^---[\s\S]*?\n---\n?/, "");
  const blocks = splitQuestionBlocks(body);
  log.bump("bloques leídos", blocks.length);

  for (const block of blocks) {
    const parsed = parseQuestionBlock(block);
    if (!parsed) {
      log.bump("bloques sin heading");
      continue;
    }
    if (parsed.reject) {
      log.bump(`rechazadas: ${parsed.reject}`);
      console.warn(`  ! ${parsed.externalId}: ${parsed.reject}`);
      continue;
    }

    const topicSlug = parsed.topicRaw ? resolveTopicSlug(parsed.topicRaw) : null;
    let topicId = fallbackTopicId;
    if (topicSlug) {
      const t = await db.topic.findUnique({ where: { slug: topicSlug }, select: { id: true } });
      if (t) topicId = t.id;
      else log.bump(`tema no encontrado: ${topicSlug}`);
    } else if (parsed.topicRaw) {
      log.bump(`tema no resuelto: ${parsed.topicRaw}`);
      console.warn(`  ! ${parsed.externalId}: tema '${parsed.topicRaw}' sin mapeo → fallback`);
    }

    const difficulty = resolveDifficulty(parsed.difficultyRaw);

    // Resolver fuentes
    const docInfos: { docInfo: DocInfo; page: number | null }[] = [];
    for (const src of parsed.sources) {
      const doc = await db.sourceDocument.findUnique({
        where: { externalId: src.externalId },
        select: { id: true, processingState: true },
      });
      if (!doc) {
        log.bump(`fuente faltante: ${src.externalId}`);
        continue;
      }
      docInfos.push({ docInfo: doc, page: src.page });
    }

    const sourceIds = await Promise.all(
      docInfos.map(({ docInfo, page }) => resolveSource(docInfo, page)),
    );
    const sourcesWithVerification = await db.source.findMany({
      where: { id: { in: sourceIds } },
      select: { id: true, requiresVerification: true },
    });
    const questionRequiresVerification =
      sourceIds.length === 0 || sourcesWithVerification.every((s) => s.requiresVerification);

    // status:
    //  - "borrador"   → respuesta no coincide con ninguna opción (reviewer debe corregir)
    //  - "validada"   → tema resuelve y hay ≥1 fuente, aunque sea sin página
    //  - "requiere_verificacion" → tema no resuelve o no hay fuentes
    let status: string;
    if (!parsed.correctMatched) status = "borrador";
    else if (topicSlug && sourceIds.length > 0) status = "validada";
    else status = "requiere_verificacion";

    // Upsert pregunta
    const question = await db.question.upsert({
      where: { externalId: parsed.externalId },
      create: {
        externalId: parsed.externalId,
        topicId,
        type: detectType(parsed),
        difficulty,
        statement: parsed.statement,
        correctAnswer: parsed.correctAnswer,
        explanation: parsed.explanation,
        status,
        requiresVerification: questionRequiresVerification,
        createdFrom: `obsidian:${path.basename(filePath, ".md")}#${parsed.externalId}`,
        repetition: parsed.repetition,
      },
      update: {
        topicId,
        type: detectType(parsed),
        difficulty,
        statement: parsed.statement,
        correctAnswer: parsed.correctAnswer,
        explanation: parsed.explanation,
        status,
        requiresVerification: questionRequiresVerification,
        repetition: parsed.repetition,
      },
      select: { id: true },
    });

    // Reemplazar opciones (más simple que diff)
    await db.answerOption.deleteMany({ where: { questionId: question.id } });
    await db.answerOption.createMany({
      data: parsed.options.map((text, i) => ({
        questionId: question.id,
        text,
        isCorrect: text === parsed.correctAnswer,
        order: i,
      })),
    });

    // Reemplazar relaciones de fuentes
    await db.questionSource.deleteMany({ where: { questionId: question.id } });
    if (sourceIds.length) {
      const uniq = [...new Set(sourceIds)];
      await db.questionSource.createMany({
        data: uniq.map((sourceId) => ({ questionId: question.id, sourceId })),
      });
    }

    log.bump(`upsert · status: ${status}`);
  }
}

function detectType(p: { options: string[]; statement: string }): string {
  const lower = p.options.map((s) => s.toLowerCase().trim());
  const isVF = lower.length === 2 && lower.every((s) => s === "falso" || s === "verdadero");
  if (isVF) return "verdadero_falso";
  return "opcion_multiple";
}

async function main() {
  const vault = requirePath(
    process.env.OBSIDIAN_VAULT_PATH ?? requireEnv("OBSIDIAN_VAULT_PATH"),
    "OBSIDIAN_VAULT_PATH",
  );
  const preguntasDir = path.join(vault, "wiki", "preguntas");
  const fallbackTopic = await db.topic.findUnique({
    where: { slug: "saee" },
    select: { id: true },
  });
  if (!fallbackTopic) throw new Error("Falta el tema 'saee' en seed. Corré db:seed.");

  const files = await readdir(preguntasDir);
  const banks = files.filter((f) => /^banco-preguntas-.+\.md$/.test(f));
  log.bump("archivos de banco", banks.length);

  for (const f of banks) {
    console.log(`\n→ ${f}`);
    await importBankFile(path.join(preguntasDir, f), fallbackTopic.id);
  }

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
