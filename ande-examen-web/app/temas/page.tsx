import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { TopicCard } from "@/components/topic-card";
import { auth } from "@/auth";
import { getTopicsWithStats } from "@/lib/data";

export const metadata = { title: "Temas" };

export default async function TemasPage() {
  const session = await auth();
  const topics = await getTopicsWithStats(session?.user?.id ?? null);

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
            §
          </span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            Temario · Categoría A
          </span>
        </div>
        <h1 className="display-headline mt-6 text-4xl text-foreground sm:text-5xl">
          Temas del examen
        </h1>
        <p className="mt-4 max-w-2xl text-md leading-relaxed text-muted-foreground">
          Seis bloques alineados con el temario sugerido por ANDE y los bancos
          curados de la bóveda LLM-Wiki del proyecto.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <TopicCard
              key={t.slug}
              code={t.code}
              slug={t.slug}
              name={t.name}
              description={t.description ?? ""}
              questionCount={t.questionCount}
              progress={t.progress}
            />
          ))}
        </div>

        {topics.every((t) => t.questionCount === 0) ? (
          <p className="mt-12 rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
            La base de datos no tiene preguntas todavía. Corré{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              npm run import:obsidian
            </code>{" "}
            desde <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">ande-examen-web/</code>.
          </p>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
