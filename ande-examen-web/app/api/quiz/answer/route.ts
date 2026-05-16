import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { answerQuizSchema } from "@/lib/zod/quiz";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const raw = await req.json().catch(() => null);
  const parsed = answerQuizSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { attemptId, questionId, selectedOptionId, timeSpentSeconds } = parsed.data;

  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    select: { id: true, userId: true, finishedAt: true },
  });
  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Intento no encontrado" }, { status: 404 });
  }
  if (attempt.finishedAt) {
    return NextResponse.json({ error: "El intento ya finalizó" }, { status: 409 });
  }

  let isCorrect = false;
  if (selectedOptionId) {
    const opt = await db.answerOption.findUnique({
      where: { id: selectedOptionId },
      select: { id: true, isCorrect: true, questionId: true },
    });
    if (!opt || opt.questionId !== questionId) {
      return NextResponse.json({ error: "Opción inválida para la pregunta" }, { status: 400 });
    }
    isCorrect = opt.isCorrect;
  }

  const answer = await db.quizAnswer.create({
    data: { attemptId, questionId, selectedOptionId: selectedOptionId ?? null, isCorrect, timeSpentSeconds },
    select: { id: true, isCorrect: true },
  });

  return NextResponse.json({ answer });
}
