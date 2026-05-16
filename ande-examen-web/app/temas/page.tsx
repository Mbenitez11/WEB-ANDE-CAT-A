import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { TopicCard } from "@/components/topic-card";
import { MOCK_TOPICS } from "@/lib/mock-data";

export const metadata = { title: "Temas" };

export default function TemasPage() {
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
          {MOCK_TOPICS.map((t) => (
            <TopicCard key={t.slug} {...t} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
