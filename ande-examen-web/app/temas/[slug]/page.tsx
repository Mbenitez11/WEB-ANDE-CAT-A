import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, ListChecks } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceChip } from "@/components/source-chip";
import { getQuestionsForTopic, getTopicBySlug, toSourceChips } from "@/lib/data";

const TOPIC_ORDER_TO_CODE: Record<string, string> = {
  "reglamento-baja-tension": "01",
  "reglamento-media-tension": "02",
  "pliego-tarifas": "03",
  "norma-paraguaya-np-2028": "04",
  "laboratorio-taa": "05",
  "saee": "06",
};

const TOPIC_SHORT: Record<string, string> = {
  "reglamento-baja-tension": "BT",
  "reglamento-media-tension": "MT",
  "pliego-tarifas": "Pliego",
  "norma-paraguaya-np-2028": "NP 2028",
  "laboratorio-taa": "TAA",
  "saee": "SAEE",
};

export default async function TemaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();

  const questions = await getQuestionsForTopic(slug, { limit: 5 });
  const code = TOPIC_ORDER_TO_CODE[slug] ?? String(topic.order).padStart(2, "0");
  const short = TOPIC_SHORT[slug] ?? topic.name.slice(0, 6);

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
            Tema {code}
          </span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            {topic._count.questions} preguntas
          </span>
        </div>
        <h1 className="display-headline mt-6 text-4xl text-foreground sm:text-5xl">
          {topic.name}
        </h1>
        <p className="mt-4 max-w-2xl text-md leading-relaxed text-muted-foreground">
          {topic.description}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href={`/quiz/${topic.slug}` as Route}>
              <ListChecks className="size-4" /> Empezar quiz
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/temas">← Volver a temas</Link>
          </Button>
        </div>

        <section className="mt-16">
          <div className="eyebrow text-muted-foreground">Vista previa</div>
          <h2 className="display-section mt-3 text-2xl text-foreground">
            Preguntas en este tema
          </h2>
          {questions.length === 0 ? (
            <p className="mt-6 rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
              Este tema no tiene preguntas validadas todavía. Corré{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                npm run import:obsidian
              </code>{" "}
              o revisá <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">/admin/revision</code>{" "}
              para validar borradores.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {questions.map((q) => {
                const sources = toSourceChips(q.sources);
                return (
                  <li
                    key={q.id}
                    className="flex flex-col gap-3 rounded-sm border border-border bg-card p-5 transition-colors hover:border-border-strong sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="primary">{short}</Badge>
                        {q.requiresVerification ? (
                          <Badge variant="warning">OCR dudoso</Badge>
                        ) : null}
                        <span className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                          {q.externalId}
                        </span>
                      </div>
                      <p className="mt-2 font-display text-md leading-snug text-foreground">
                        {q.statement}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {sources.map((s) => (
                          <SourceChip key={s.id} {...s} size="sm" />
                        ))}
                      </div>
                    </div>
                    <Link
                      href={`/quiz/${slug}` as Route}
                      className="inline-flex shrink-0 items-center gap-1 text-2xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
                    >
                      Practicar <ArrowUpRight className="size-3" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
