import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const querySchema = z.object({
  q: z.string().trim().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

/**
 * Búsqueda interna sin embeddings — pattern matching de Prisma sobre los
 * campos relevantes. Cuando se active RAG (Fase 14), esta ruta seguirá
 * sirviendo búsquedas "rápidas" y la búsqueda semántica vivirá en /api/ai/*.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "query inválida", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { q, limit } = parsed.data;

  // SQLite con Prisma no soporta `mode: insensitive`. Usamos `contains` que
  // por defecto es case-insensitive en SQLite con collation BINARY-NOCASE.
  // Para mayor robustez, también buscamos en lowercase.
  const qLower = q.toLowerCase();

  const [questions, topics, documents, sources] = await Promise.all([
    db.question.findMany({
      where: {
        OR: [
          { statement: { contains: q } },
          { statement: { contains: qLower } },
          { externalId: { contains: q.toUpperCase() } },
          { explanation: { contains: q } },
        ],
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        externalId: true,
        statement: true,
        status: true,
        difficulty: true,
        requiresVerification: true,
        topic: { select: { slug: true, name: true } },
      },
    }),
    db.topic.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { name: { contains: qLower } },
          { description: { contains: q } },
        ],
      },
      take: limit,
      orderBy: { order: "asc" },
      select: { id: true, slug: true, name: true, description: true },
    }),
    db.sourceDocument.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { name: { contains: qLower } },
          { externalId: { contains: q.toUpperCase() } },
          { topicGuess: { contains: q } },
        ],
      },
      take: limit,
      orderBy: { externalId: "asc" },
      select: {
        id: true,
        externalId: true,
        name: true,
        documentType: true,
        topicGuess: true,
        totalPages: true,
      },
    }),
    db.source.findMany({
      where: {
        OR: [
          { quote: { contains: q } },
          { section: { contains: q } },
        ],
      },
      take: limit,
      select: {
        id: true,
        page: true,
        section: true,
        quote: true,
        requiresVerification: true,
        document: { select: { externalId: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    query: q,
    counts: {
      questions: questions.length,
      topics: topics.length,
      documents: documents.length,
      sources: sources.length,
    },
    questions,
    topics,
    documents,
    sources,
  });
}
