import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const querySchema = z.object({
  topic: z.string().optional(),
  difficulty: z.enum(["basica", "media", "dificil", "examen"]).optional(),
  status: z.enum(["borrador", "validada", "requiere_verificacion", "descartada"]).optional(),
  includeUnverified: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => v === "true"),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Query inválida", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { topic, difficulty, status, includeUnverified, limit = 50 } = parsed.data;

  const questions = await db.question.findMany({
    where: {
      ...(topic ? { topic: { slug: topic } } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(status ? { status } : { status: "validada" }),
      ...(includeUnverified ? {} : { requiresVerification: false }),
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      topic: { select: { slug: true, name: true } },
      options: { orderBy: { order: "asc" }, select: { id: true, text: true, order: true } },
      sources: {
        include: {
          source: {
            include: {
              document: { select: { name: true, documentType: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ questions });
}
