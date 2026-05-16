import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { attemptId } = await params;
  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      topic: { select: { slug: true, name: true } },
      answers: {
        include: {
          question: {
            include: {
              topic: { select: { slug: true, name: true } },
              options: { orderBy: { order: "asc" } },
              sources: {
                include: {
                  source: { include: { document: { select: { name: true } } } },
                },
              },
            },
          },
          selectedOption: true,
        },
      },
    },
  });
  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Intento no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ attempt });
}
