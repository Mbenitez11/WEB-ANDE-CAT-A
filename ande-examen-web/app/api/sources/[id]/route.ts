import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const source = await db.source.findUnique({
    where: { id },
    include: {
      document: true,
      questions: {
        include: { question: { select: { id: true, statement: true, status: true } } },
      },
    },
  });
  if (!source) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ source });
}
