/**
 * Accesores server-side a la DB para Server Components.
 *
 * No exponer estas funciones desde rutas API (ya existen `/api/topics`, etc.);
 * estos helpers viven acá para que las pages compongan datos sin doble round-trip.
 */
import { db } from "@/lib/db";

const TOPIC_ORDER_TO_CODE: Record<string, string> = {
  "reglamento-baja-tension": "01",
  "reglamento-media-tension": "02",
  "pliego-tarifas": "03",
  "norma-paraguaya-np-2028": "04",
  "laboratorio-taa": "05",
  "saee": "06",
};

export type TopicWithStats = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  code: string;
  questionCount: number;
  progress: number; // 0..1
  accuracy: number; // 0..1
};

export async function getTopicsWithStats(userId?: string | null): Promise<TopicWithStats[]> {
  const topics = await db.topic.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { questions: { where: { status: { not: "descartada" } } } } },
    },
  });

  const progressByTopic = userId
    ? Object.fromEntries(
        (
          await db.userTopicProgress.findMany({
            where: { userId },
            select: { topicId: true, answeredCount: true, accuracy: true },
          })
        ).map((p) => [p.topicId, p]),
      )
    : {};

  return topics.map((t) => {
    const p = progressByTopic[t.id] as
      | { answeredCount: number; accuracy: number }
      | undefined;
    const answered = p?.answeredCount ?? 0;
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description,
      code: TOPIC_ORDER_TO_CODE[t.slug] ?? String(t.order).padStart(2, "0"),
      questionCount: t._count.questions,
      progress: t._count.questions === 0 ? 0 : Math.min(1, answered / t._count.questions),
      accuracy: p?.accuracy ?? 0,
    };
  });
}

export async function getTopicBySlug(slug: string) {
  return db.topic.findUnique({
    where: { slug },
    include: { _count: { select: { questions: true } } },
  });
}

export async function getQuestionsForTopic(
  topicSlug: string,
  opts: { limit?: number; includeUnverified?: boolean } = {},
) {
  return db.question.findMany({
    where: {
      topic: { slug: topicSlug },
      status: { in: ["validada", ...(opts.includeUnverified ? ["requiere_verificacion"] : [])] },
      ...(opts.includeUnverified ? {} : { requiresVerification: false }),
    },
    take: opts.limit ?? 5,
    orderBy: { createdAt: "asc" },
    include: {
      options: { orderBy: { order: "asc" } },
      sources: {
        include: {
          source: {
            include: { document: { select: { externalId: true, name: true, publicUrl: true } } },
          },
        },
      },
    },
  });
}

export async function getSourceDocuments() {
  return db.sourceDocument.findMany({
    where: { duplicateOfId: null },
    orderBy: [
      { publicUrl: { sort: "desc", nulls: "last" } }, // priorizar canónicos
      { externalId: "asc" },
    ],
    include: {
      _count: { select: { duplicates: true, sources: true, ocrFlags: true } },
    },
  });
}

export async function getUserProgress(userId: string) {
  const [progress, attempts, saved] = await Promise.all([
    db.userTopicProgress.findMany({
      where: { userId },
      include: { topic: { select: { slug: true, name: true } } },
      orderBy: { lastStudiedAt: "desc" },
    }),
    db.quizAttempt.findMany({
      where: { userId, finishedAt: { not: null } },
      orderBy: { finishedAt: "desc" },
      take: 8,
      include: { topic: { select: { slug: true, name: true } } },
    }),
    db.savedQuestion.count({ where: { userId } }),
  ]);

  const totalAnswered = progress.reduce((s, p) => s + p.answeredCount, 0);
  const totalCorrect = progress.reduce((s, p) => s + p.correctCount, 0);
  const overallAccuracy = totalAnswered === 0 ? 0 : totalCorrect / totalAnswered;

  const weakTopics = [...progress]
    .filter((p) => p.answeredCount >= 5)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);
  const strongTopics = [...progress]
    .filter((p) => p.answeredCount >= 5)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3);

  return {
    totalAnswered,
    totalCorrect,
    overallAccuracy,
    attemptsCount: attempts.length,
    savedCount: saved,
    attempts,
    progress,
    weakTopics,
    strongTopics,
  };
}

export type SourceChipData = {
  id: string;
  externalId: string; // del documento
  documentName: string;
  page: number | null;
  section?: string;
  requiresVerification: boolean;
  publicUrl?: string | null;
};

export function toSourceChips(
  rels: Array<{
    source: {
      id: string;
      page: number | null;
      section: string | null;
      requiresVerification: boolean;
      document: { externalId: string; name: string; publicUrl?: string | null };
    };
  }>,
): SourceChipData[] {
  return rels.map((rel) => ({
    id: rel.source.id,
    externalId: rel.source.document.externalId,
    documentName: rel.source.document.name,
    page: rel.source.page,
    section: rel.source.section ?? undefined,
    requiresVerification: rel.source.requiresVerification,
    publicUrl: rel.source.document.publicUrl ?? null,
  }));
}
