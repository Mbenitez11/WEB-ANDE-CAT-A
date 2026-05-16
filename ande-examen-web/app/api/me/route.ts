import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ user: null }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
      profile: true,
    },
  });
  return NextResponse.json({ user });
}

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  profile: z
    .object({
      displayName: z.string().trim().max(80).nullish(),
      career: z.string().trim().max(120).nullish(),
      studyGoal: z.string().trim().max(280).nullish(),
      preferredDifficulty: z.enum(["basica", "media", "dificil", "examen"]).optional(),
    })
    .optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const raw = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, profile } = parsed.data;
  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(profile
        ? {
            profile: {
              upsert: {
                create: profile,
                update: profile,
              },
            },
          }
        : {}),
    },
    select: { id: true, name: true, email: true, role: true, profile: true },
  });
  return NextResponse.json({ user });
}
