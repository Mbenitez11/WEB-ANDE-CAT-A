import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { startQuizSchema } from "@/lib/zod/quiz";
import { selectQuestionsForAttempt, shouldShowSourcesDuringAttempt } from "@/lib/quiz-engine";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const raw = await req.json().catch(() => null);
  const parsed = startQuizSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const input = parsed.data;
  const questions = await selectQuestionsForAttempt(session.user.id, input);
  if (!questions.length) {
    return NextResponse.json({ error: "No hay preguntas disponibles para esta configuración" }, { status: 404 });
  }

  const topic = input.topicSlug
    ? await db.topic.findUnique({ where: { slug: input.topicSlug }, select: { id: true } })
    : null;

  // En modo simulacro: 90 segundos por pregunta (estándar holgado). null para otros modos.
  const timeLimitSeconds = input.mode === "simulacro" ? questions.length * 90 : null;

  const attempt = await db.quizAttempt.create({
    data: {
      userId: session.user.id,
      mode: input.mode,
      topicId: topic?.id ?? null,
      totalQuestions: questions.length,
      assignedQuestionIds: questions.map((q) => q.id).join(","),
      timeLimitSeconds,
    },
    select: { id: true, mode: true, createdAt: true, totalQuestions: true, timeLimitSeconds: true },
  });

  return NextResponse.json({
    attempt,
    questions,
    showSourcesDuringAttempt: shouldShowSourcesDuringAttempt(input.mode),
  });
}
