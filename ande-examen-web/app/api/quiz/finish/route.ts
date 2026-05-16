import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { finishQuizSchema } from "@/lib/zod/quiz";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const raw = await req.json().catch(() => null);
  const parsed = finishQuizSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { attemptId, durationSeconds } = parsed.data;

  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: { select: { isCorrect: true, questionId: true, question: { select: { topicId: true } } } } },
  });
  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Intento no encontrado" }, { status: 404 });
  }

  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
  const answeredCount = attempt.answers.length;
  const wrongCount = answeredCount - correctCount;
  const blankCount = Math.max(0, attempt.totalQuestions - answeredCount);
  const score = attempt.totalQuestions === 0 ? 0 : (correctCount / attempt.totalQuestions) * 100;

  const updated = await db.quizAttempt.update({
    where: { id: attemptId },
    data: {
      correctCount,
      wrongCount,
      blankCount,
      score,
      durationSeconds,
      finishedAt: new Date(),
    },
  });

  // Actualizar progreso por tema (agregado simple)
  const byTopic = new Map<string, { ok: number; bad: number }>();
  for (const a of attempt.answers) {
    if (!a.question.topicId) continue;
    const cur = byTopic.get(a.question.topicId) ?? { ok: 0, bad: 0 };
    if (a.isCorrect) cur.ok++;
    else cur.bad++;
    byTopic.set(a.question.topicId, cur);
  }
  for (const [topicId, { ok, bad }] of byTopic) {
    const existing = await db.userTopicProgress.findUnique({
      where: { userId_topicId: { userId: session.user.id, topicId } },
    });
    const answered = (existing?.answeredCount ?? 0) + ok + bad;
    const correct = (existing?.correctCount ?? 0) + ok;
    const wrong = (existing?.wrongCount ?? 0) + bad;
    await db.userTopicProgress.upsert({
      where: { userId_topicId: { userId: session.user.id, topicId } },
      create: {
        userId: session.user.id,
        topicId,
        answeredCount: answered,
        correctCount: correct,
        wrongCount: wrong,
        accuracy: answered === 0 ? 0 : correct / answered,
        lastStudiedAt: new Date(),
      },
      update: {
        answeredCount: answered,
        correctCount: correct,
        wrongCount: wrong,
        accuracy: answered === 0 ? 0 : correct / answered,
        lastStudiedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ attempt: updated });
}
