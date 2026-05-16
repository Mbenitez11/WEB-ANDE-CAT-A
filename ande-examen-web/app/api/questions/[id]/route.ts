import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await db.question.findUnique({
    where: { id },
    include: {
      topic: { select: { slug: true, name: true } },
      options: { orderBy: { order: "asc" } },
      sources: {
        include: {
          source: {
            include: {
              document: {
                select: { externalId: true, name: true, documentType: true, publicUrl: true },
              },
            },
          },
        },
      },
    },
  });
  if (!question) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ question });
}
