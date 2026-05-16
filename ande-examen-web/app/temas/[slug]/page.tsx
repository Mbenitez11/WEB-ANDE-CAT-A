import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ListChecks } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_QUESTIONS, MOCK_TOPICS } from "@/lib/mock-data";
import { SourceChip } from "@/components/source-chip";

export default async function TemaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = MOCK_TOPICS.find((t) => t.slug === slug);
  if (!topic) notFound();

  const questions = MOCK_QUESTIONS.filter((q) => q.topicSlug === slug);

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
            Tema {topic.code}
          </span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            {topic.questionCount} preguntas
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
            <Link href={`/quiz/${topic.slug}` as never}>
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
              Aún no hay preguntas mock para este tema. Cuando corra el importador
              Obsidian (FASE 7) aparecerán acá las preguntas validadas.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {questions.map((q) => (
                <li
                  key={q.id}
                  className="flex flex-col gap-3 rounded-sm border border-border bg-card p-5 transition-colors hover:border-border-strong sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary">{q.topicShort}</Badge>
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
                      {q.sources.map((s) => (
                        <SourceChip key={s.id} {...s} size="sm" />
                      ))}
                    </div>
                  </div>
                  <Link
                    href={`/quiz/${slug}` as never}
                    className="inline-flex shrink-0 items-center gap-1 text-2xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
                  >
                    Practicar <ArrowUpRight className="size-3" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
