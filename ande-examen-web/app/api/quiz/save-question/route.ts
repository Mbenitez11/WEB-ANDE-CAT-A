import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { saveQuestionSchema } from "@/lib/zod/quiz";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const saved = await db.savedQuestion.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      question: {
        include: { topic: { select: { slug: true, name: true } } },
      },
    },
  });
  return NextResponse.json({ saved });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const raw = await req.json().catch(() => null);
  const parsed = saveQuestionSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const saved = await db.savedQuestion.upsert({
    where: { userId_questionId: { userId: session.user.id, questionId: parsed.data.questionId } },
    create: { userId: session.user.id, questionId: parsed.data.questionId, note: parsed.data.note ?? null },
    update: { note: parsed.data.note ?? null },
  });
  return NextResponse.json({ saved }, { status: 201 });
}
