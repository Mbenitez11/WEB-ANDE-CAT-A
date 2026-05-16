import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const [docs, ocrFlags, sources, questions, options, qs, byStatus, byTopic] = await Promise.all([
    db.sourceDocument.count(),
    db.ocrFlag.count(),
    db.source.count(),
    db.question.count(),
    db.answerOption.count(),
    db.questionSource.count(),
    db.question.groupBy({ by: ["status"], _count: true }),
    db.question.groupBy({ by: ["topicId"], _count: true }),
  ]);
  console.log("SourceDocument :", docs);
  console.log("OcrFlag        :", ocrFlags);
  console.log("Source         :", sources);
  console.log("Question       :", questions);
  console.log("AnswerOption   :", options);
  console.log("QuestionSource :", qs);
  console.log("\nQuestions by status:");
  for (const s of byStatus) console.log(`  ${s.status.padEnd(24)} ${s._count}`);
  console.log("\nQuestions by topic:");
  for (const t of byTopic) {
    const topic = await db.topic.findUnique({ where: { id: t.topicId }, select: { slug: true } });
    console.log(`  ${(topic?.slug ?? "??").padEnd(28)} ${t._count}`);
  }
}

main().finally(() => db.$disconnect());
