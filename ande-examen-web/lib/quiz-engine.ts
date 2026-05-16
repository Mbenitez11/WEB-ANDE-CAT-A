import { db } from "@/lib/db";
import type { StartQuizInput } from "@/lib/zod/quiz";

export type QuizQuestion = {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  requiresVerification: boolean;
  topic: { slug: string; name: string };
  options: { id: string; text: string; order: number }[];
};

const SHOW_SOURCES_IMMEDIATELY: Record<StartQuizInput["mode"], boolean> = {
  practica: true,
  tema: true,
  repaso: true,
  simulacro: false,
};

export function shouldShowSourcesDuringAttempt(mode: StartQuizInput["mode"]) {
  return SHOW_SOURCES_IMMEDIATELY[mode];
}

/**
 * Selecciona preguntas según el modo. Reglas:
 *  - status: validada (excepto repaso que también acepta requiere_verificacion).
 *  - simulacro excluye requiresVerification:true salvo opt-in.
 *  - repaso prioriza preguntas que el usuario falló o guardó.
 */
export async function selectQuestionsForAttempt(
  userId: string,
  input: StartQuizInput,
): Promise<QuizQuestion[]> {
  const { mode, topicSlug, difficulty, questionCount, includeUnverified } = input;

  if (mode === "repaso") {
    const wrong = await db.quizAnswer.findMany({
      where: { isCorrect: false, attempt: { userId } },
      distinct: ["questionId"],
      orderBy: { createdAt: "desc" },
      take: questionCount * 3,
      select: { questionId: true },
    });
    const saved = await db.savedQuestion.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: questionCount,
      select: { questionId: true },
    });
    const ids = [...new Set([...wrong.map((w) => w.questionId), ...saved.map((s) => s.questionId)])];
    if (!ids.length) return [];

    const rows = await db.question.findMany({
      where: { id: { in: ids } },
      include: {
        topic: { select: { slug: true, name: true } },
        options: { orderBy: { order: "asc" }, select: { id: true, text: true, order: true } },
      },
    });
    return shuffle(rows).slice(0, questionCount).map(toQuiz);
  }

  const where = {
    status: "validada",
    ...(topicSlug ? { topic: { slug: topicSlug } } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(mode === "simulacro" && !includeUnverified ? { requiresVerification: false } : {}),
    ...(mode !== "simulacro" && !includeUnverified ? { requiresVerification: false } : {}),
  };

  const pool = await db.question.findMany({
    where,
    take: questionCount * 4,
    orderBy: { createdAt: "desc" },
    include: {
      topic: { select: { slug: true, name: true } },
      options: { orderBy: { order: "asc" }, select: { id: true, text: true, order: true } },
    },
  });

  return shuffle(pool).slice(0, questionCount).map(toQuiz);
}

function toQuiz(q: {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  requiresVerification: boolean;
  topic: { slug: string; name: string };
  options: { id: string; text: string; order: number }[];
}): QuizQuestion {
  return {
    id: q.id,
    statement: q.statement,
    type: q.type,
    difficulty: q.difficulty,
    requiresVerification: q.requiresVerification,
    topic: q.topic,
    options: shuffle(q.options).map((o, i) => ({ ...o, order: i })),
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
