import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceChip } from "@/components/source-chip";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { toSourceChips } from "@/lib/data";

export default async function ResultadoPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { attemptId } = await params;
  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      topic: { select: { slug: true, name: true } },
      answers: {
        include: {
          question: {
            include: {
              topic: { select: { slug: true, name: true } },
              options: { orderBy: { order: "asc" } },
              sources: {
                include: { source: { include: { document: { select: { externalId: true, name: true } } } } },
              },
            },
          },
          selectedOption: true,
        },
      },
    },
  });

  if (!attempt || attempt.userId !== session.user.id) notFound();

  const pct = Math.round(attempt.score);
  const minutes = Math.floor(attempt.durationSeconds / 60);
  const seconds = attempt.durationSeconds % 60;

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-12 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
            Resultado
          </span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            {attempt.topic?.name ?? `Modo: ${attempt.mode}`}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Puntaje" value={`${pct}%`} accent />
          <Stat label="Correctas" value={String(attempt.correctCount)} tone="success" />
          <Stat label="Incorrectas" value={String(attempt.wrongCount)} tone="destructive" />
          <Stat label="Tiempo" value={`${minutes}:${String(seconds).padStart(2, "0")}`} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/temas">Seguir estudiando</Link>
          </Button>
          {attempt.wrongCount > 0 ? (
            <Button asChild variant="outline">
              <Link href="/repaso">Repasar errores</Link>
            </Button>
          ) : null}
          <Button asChild variant="ghost">
            <Link href="/dashboard">Ver dashboard</Link>
          </Button>
        </div>

        <section className="mt-12">
          <h2 className="display-section text-2xl text-foreground">Revisión</h2>
          <ul className="mt-6 space-y-4">
            {attempt.answers.map((a, i) => {
              const correct = a.question.options.find((o) => o.isCorrect);
              const sources = toSourceChips(a.question.sources);
              return (
                <li key={a.id} className="rounded-md border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-sm border border-border-strong font-mono text-2xs text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        {a.isCorrect ? (
                          <Badge variant="success">
                            <CheckCircle2 className="size-3" /> Correcta
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="size-3" /> Incorrecta
                          </Badge>
                        )}
                        {a.question.requiresVerification ? (
                          <Badge variant="warning">OCR dudoso</Badge>
                        ) : null}
                      </div>
                      <p className="font-display text-md leading-snug text-foreground">
                        {a.question.statement}
                      </p>
                      <div className="space-y-1.5 text-sm">
                        <p>
                          <span className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                            Tu respuesta:
                          </span>{" "}
                          <span className={a.isCorrect ? "text-success" : "text-destructive"}>
                            {a.selectedOption?.text ?? "(sin responder)"}
                          </span>
                        </p>
                        {!a.isCorrect && correct ? (
                          <p>
                            <span className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                              Correcta:
                            </span>{" "}
                            <span className="text-success">{correct.text}</span>
                          </p>
                        ) : null}
                      </div>
                      {a.question.explanation ? (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {a.question.explanation}
                        </p>
                      ) : null}
                      {sources.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {sources.map((s) => (
                            <SourceChip key={s.id} {...s} size="sm" />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({
  label,
  value,
  tone,
  accent,
}: {
  label: string;
  value: string;
  tone?: "success" | "destructive";
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-md border border-border bg-card p-4" +
        (accent ? " border-primary/40" : "")
      }
    >
      <div className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "mt-2 font-display text-3xl tabular-nums " +
          (tone === "success"
            ? "text-success"
            : tone === "destructive"
              ? "text-destructive"
              : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}
