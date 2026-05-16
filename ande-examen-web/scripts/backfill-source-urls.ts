/**
 * One-off: rellena publicUrl/indexUrl en SourceDocuments existentes según
 * el mapeo canónico en `lib/source-urls.ts`.
 *
 * Idempotente: solo escribe si el valor cambió.
 *
 * Uso: npx tsx scripts/backfill-source-urls.ts
 */
import { PrismaClient } from "@prisma/client";
import { loadDotenv } from "./lib/io";
import { resolvePublicUrl } from "./lib/source-urls";

loadDotenv();
const db = new PrismaClient();

async function main() {
  const docs = await db.sourceDocument.findMany({
    select: { id: true, externalId: true, publicUrl: true, indexUrl: true },
  });
  let updated = 0;
  for (const d of docs) {
    const { publicUrl, indexUrl } = resolvePublicUrl(d.externalId);
    if (d.publicUrl === publicUrl && d.indexUrl === indexUrl) continue;
    await db.sourceDocument.update({
      where: { id: d.id },
      data: { publicUrl, indexUrl },
    });
    updated++;
  }
  console.log(`URLs públicas actualizadas: ${updated}/${docs.length}`);
  const withUrl = await db.sourceDocument.count({ where: { publicUrl: { not: null } } });
  console.log(`SourceDocument con publicUrl: ${withUrl}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
