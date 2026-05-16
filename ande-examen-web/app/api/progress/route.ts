import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const userId = session.user.id;

  const [progress, attempts, saved] = await Promise.all([
    db.userTopicProgress.findMany({
      where: { userId },
      include: { topic: { select: { slug: true, name: true } } },
      orderBy: { lastStudiedAt: "desc" },
    }),
    db.quizAttempt.findMany({
      where: { userId, finishedAt: { not: null } },
      orderBy: { finishedAt: "desc" },
      take: 10,
      include: { topic: { select: { slug: true, name: true } } },
    }),
    db.savedQuestion.count({ where: { userId } }),
  ]);

  const totalAnswered = progress.reduce((s, p) => s + p.answeredCount, 0);
  const totalCorrect = progress.reduce((s, p) => s + p.correctCount, 0);
  const overallAccuracy = totalAnswered === 0 ? 0 : totalCorrect / totalAnswered;

  const weak = [...progress]
    .filter((p) => p.answeredCount >= 5)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map((p) => ({ slug: p.topic.slug, name: p.topic.name, accuracy: p.accuracy }));

  const strong = [...progress]
    .filter((p) => p.answeredCount >= 5)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3)
    .map((p) => ({ slug: p.topic.slug, name: p.topic.name, accuracy: p.accuracy }));

  return NextResponse.json({
    summary: {
      totalAnswered,
      totalCorrect,
      overallAccuracy,
      attemptsCount: attempts.length,
      savedCount: saved,
    },
    weakTopics: weak,
    strongTopics: strong,
    progress,
    recentAttempts: attempts,
  });
}
