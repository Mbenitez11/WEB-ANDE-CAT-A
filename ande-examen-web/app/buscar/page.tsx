import Link from "next/link";
import type { Route } from "next";
import { FileText, Search } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";

export const metadata = { title: "Buscar" };

type Result = {
  query: string;
  questions: Array<{
    id: string;
    externalId: string | null;
    statement: string;
    status: string;
    difficulty: string;
    requiresVerification: boolean;
    topic: { slug: string; name: string };
  }>;
  topics: Array<{ id: string; slug: string; name: string; description: string | null }>;
  documents: Array<{
    id: string;
    externalId: string;
    name: string;
    documentType: string;
    topicGuess: string | null;
    totalPages: number | null;
  }>;
  sources: Array<{
    id: string;
    page: number | null;
    section: string | null;
    quote: string | null;
    requiresVerification: boolean;
    document: { externalId: string; name: string };
  }>;
};

async function runSearch(q: string): Promise<Result | null> {
  if (!q || q.trim().length === 0) return null;
  const query = q.trim().slice(0, 200);
  const qLower = query.toLowerCase();
  const limit = 10;

  const [questions, topics, documents, sources] = await Promise.all([
    db.question.findMany({
      where: {
        OR: [
          { statement: { contains: query } },
          { statement: { contains: qLower } },
          { externalId: { contains: query.toUpperCase() } },
          { explanation: { contains: query } },
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
        OR: [{ name: { contains: query } }, { name: { contains: qLower } }, { description: { contains: query } }],
      },
      take: limit,
      orderBy: { order: "asc" },
      select: { id: true, slug: true, name: true, description: true },
    }),
    db.sourceDocument.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { name: { contains: qLower } },
          { externalId: { contains: query.toUpperCase() } },
          { topicGuess: { contains: query } },
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
        OR: [{ quote: { contains: query } }, { section: { contains: query } }],
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

  return { query, questions, topics, documents, sources };
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const result = await runSearch(q ?? "");
  const total =
    (result?.questions.length ?? 0) +
    (result?.topics.length ?? 0) +
    (result?.documents.length ?? 0) +
    (result?.sources.length ?? 0);

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
            ⌕
          </span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            Buscador interno
          </span>
        </div>
        <h1 className="display-headline mt-6 text-4xl text-foreground sm:text-5xl">
          Buscar en la base
        </h1>
        <p className="mt-4 max-w-2xl text-md leading-relaxed text-muted-foreground">
          Coincidencia de texto sobre preguntas, temas, documentos y citas. La búsqueda
          semántica con IA llega en Fase 14.
        </p>

        <form action="/buscar" method="get" className="mt-8 flex gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.5}
            />
            <input
              type="search"
              name="q"
              defaultValue={result?.query ?? ""}
              placeholder="Buscar tasa de conexión, F0018, reglamento BT…"
              autoFocus
              className="h-11 w-full rounded-sm border border-border bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="h-11 rounded-sm border border-border-strong bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Buscar
          </button>
        </form>

        {!result ? (
          <p className="mt-12 rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
            Ingresá una palabra o código para buscar en la base. Por ejemplo:{" "}
            <code className="font-mono text-foreground">tasa</code>,{" "}
            <code className="font-mono text-foreground">F0018</code>,{" "}
            <code className="font-mono text-foreground">acometida</code>.
          </p>
        ) : total === 0 ? (
          <p className="mt-12 rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
            No se encontraron resultados para{" "}
            <code className="font-mono text-foreground">{result.query}</code>.
          </p>
        ) : (
          <div className="mt-10 space-y-12">
            <ResultsSection title="Preguntas" count={result.questions.length}>
              {result.questions.map((q) => (
                <li key={q.id} className="rounded-sm border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary">{q.topic.name}</Badge>
                    {q.externalId ? (
                      <span className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                        {q.externalId}
                      </span>
                    ) : null}
                    {q.requiresVerification ? <Badge variant="warning">OCR dudoso</Badge> : null}
                    {q.status !== "validada" ? (
                      <Badge variant="muted">{q.status}</Badge>
                    ) : null}
                  </div>
                  <Link
                    href={`/temas/${q.topic.slug}` as Route}
                    className="mt-2 block font-display text-md leading-snug text-foreground hover:text-primary"
                  >
                    {q.statement}
                  </Link>
                </li>
              ))}
            </ResultsSection>

            <ResultsSection title="Temas" count={result.topics.length}>
              {result.topics.map((t) => (
                <li key={t.id} className="rounded-sm border border-border bg-card p-4">
                  <Link
                    href={`/temas/${t.slug}` as Route}
                    className="font-display text-md text-foreground hover:text-primary"
                  >
                    {t.name}
                  </Link>
                  {t.description ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ResultsSection>

            <ResultsSection title="Documentos fuente" count={result.documents.length}>
              {result.documents.map((d) => (
                <li key={d.id} className="rounded-sm border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                    <span className="font-mono text-2xs uppercase tracking-wider text-foreground">
                      {d.externalId}
                    </span>
                    <span className="font-display text-foreground">{d.name}</span>
                  </div>
                  {d.topicGuess ? (
                    <div className="mt-1 text-2xs text-muted-foreground">{d.topicGuess}</div>
                  ) : null}
                </li>
              ))}
            </ResultsSection>

            <ResultsSection title="Citas" count={result.sources.length}>
              {result.sources.map((s) => (
                <li key={s.id} className="rounded-sm border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-2xs uppercase tracking-wider text-foreground">
                      {s.document.externalId}
                    </span>
                    <span className="font-display text-foreground">{s.document.name}</span>
                    {s.page != null ? (
                      <Badge variant="neutral">p. {s.page}</Badge>
                    ) : null}
                    {s.requiresVerification ? <Badge variant="warning">OCR dudoso</Badge> : null}
                  </div>
                  {s.section ? (
                    <div className="mt-1 text-sm text-muted-foreground">{s.section}</div>
                  ) : null}
                  {s.quote ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/80">
                      “{s.quote}”
                    </p>
                  ) : null}
                </li>
              ))}
            </ResultsSection>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function ResultsSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="display-section text-xl text-foreground">{title}</h2>
        <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
          {count} resultado{count === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="mt-4 space-y-2">{children}</ul>
    </section>
  );
}
