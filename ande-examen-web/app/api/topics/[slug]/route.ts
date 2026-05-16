import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await db.topic.findUnique({
    where: { slug },
    include: { _count: { select: { questions: true, chunks: true } } },
  });
  if (!topic) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ topic });
}
