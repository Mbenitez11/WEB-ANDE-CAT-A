import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const topics = await db.topic.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { questions: true, chunks: true } },
    },
  });
  return NextResponse.json({ topics });
}
