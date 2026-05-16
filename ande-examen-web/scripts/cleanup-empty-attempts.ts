/**
 * Limpia intentos vacíos (sin respuestas y sin finishedAt) más viejos de N horas.
 * Útil después de testear el flujo del quiz — esos intentos sucios ensucian el dashboard.
 *
 * Uso: npx tsx scripts/cleanup-empty-attempts.ts
 */
import { PrismaClient } from "@prisma/client";
import { loadDotenv } from "./lib/io";

loadDotenv();
const db = new PrismaClient();

async function main() {
  // Aceptar parámetro --minutes=N (default 5 min)
  const arg = process.argv.find((a) => a.startsWith("--minutes="));
  const minutes = arg ? Number(arg.split("=")[1]) : 5;
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  console.log(`Cutoff: intentos vacíos más viejos de ${minutes} min`);

  const empty = await db.quizAttempt.findMany({
    where: {
      finishedAt: null,
      createdAt: { lt: cutoff },
      answers: { none: {} },
    },
    select: { id: true, mode: true, createdAt: true, totalQuestions: true },
  });

  console.log(`Intentos vacíos (>1h, sin respuestas, sin finalizar): ${empty.length}`);
  for (const a of empty) {
    console.log(`  ${a.id.slice(-8)}  mode=${a.mode}  total=${a.totalQuestions}  ${a.createdAt.toISOString()}`);
  }

  if (empty.length > 0) {
    const r = await db.quizAttempt.deleteMany({
      where: { id: { in: empty.map((a) => a.id) } },
    });
    console.log(`\n✓ Borrados ${r.count} intentos`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
