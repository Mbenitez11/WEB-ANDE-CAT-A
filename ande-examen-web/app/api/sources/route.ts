import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const document = url.searchParams.get("document");

  const sources = await db.source.findMany({
    where: document ? { document: { externalId: document.toUpperCase() } } : {},
    take: 200,
    orderBy: [{ document: { name: "asc" } }, { page: "asc" }],
    include: {
      document: { select: { externalId: true, name: true, documentType: true } },
      _count: { select: { questions: true, chunks: true } },
    },
  });
  return NextResponse.json({ sources });
}
