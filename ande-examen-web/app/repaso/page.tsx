import Link from "next/link";
import type { Route } from "next";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SourceChip } from "@/components/source-chip";
import { toSourceChips } from "@/lib/data";

export const metadata = { title: "Repaso" };

export default async function RepasoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/repaso");

  const userId = session.user.id;

  const [wrongAnswers, saved] = await Promise.all([
    db.quizAnswer.findMany({
      where: { isCorrect: false, attempt: { userId } },
      distinct: ["questionId"],
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        question: {
          include: {
            topic: { select: { slug: true, name: true } },
            sources: {
              include: {
                source: { include: { document: { select: { externalId: true, name: true } } } },
              },
            },
          },
        },
      },
    }),
    db.savedQuestion.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        question: {
          include: {
            topic: { select: { slug: true, name: true } },
            sources: {
              include: {
                source: { include: { document: { select: { externalId: true, name: true } } } },
              },
            },
          },
        },
      },
    }),
  ]);

  const totalQueue = wrongAnswers.length + saved.length;
  const wrongCount = wrongAnswers.length;
  const savedCount = saved.length;

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-12 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
            ⟲
          </span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            Cola de repaso
          </span>
        </div>
        <h1 className="display-headline mt-6 text-4xl text-foreground sm:text-5xl">
          Repasar errores
        </h1>
        <p className="mt-4 max-w-2xl text-md leading-relaxed text-muted-foreground">
          Preguntas que respondiste mal y preguntas guardadas. Priorizadas por fecha reciente.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="primary">Falladas · {wrongCount}</Badge>
          <Badge variant="info">Guardadas · {savedCount}</Badge>
        </div>

        {totalQueue === 0 ? (
          <p className="mt-12 rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
            Tu cola de repaso está vacía. Cuando falles preguntas o las guardes desde un quiz,
            aparecerán acá.
          </p>
        ) : (
          <>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={"/repaso/sesion" as Route}>
                  <Play className="size-4" /> Iniciar repaso
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/temas">
                  <RotateCcw className="size-4" /> Estudiar tema
                </Link>
              </Button>
            </div>

            <section className="mt-12 space-y-3">
              <h2 className="display-section text-2xl text-foreground">Cola actual</h2>
              <ul className="space-y-3">
                {[
                  ...wrongAnswers.map((a) => ({
                    key: `w-${a.id}`,
                    kind: "falla" as const,
                    question: a.question,
                  })),
                  ...saved.map((s) => ({
                    key: `s-${s.id}`,
                    kind: "guardada" as const,
                    question: s.question,
                  })),
                ]
                  .slice(0, 20)
                  .map((item) => {
                    const sources = toSourceChips(item.question.sources);
                    return (
                      <li
                        key={item.key}
                        className="rounded-sm border border-border bg-card p-5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {item.kind === "falla" ? (
                            <Badge variant="destructive">Fallada</Badge>
                          ) : (
                            <Badge variant="info">Guardada</Badge>
                          )}
                          <Badge variant="neutral">{item.question.topic.name}</Badge>
                          {item.question.requiresVerification ? (
                            <Badge variant="warning">OCR dudoso</Badge>
                          ) : null}
                        </div>
                        <p className="mt-3 font-display text-md leading-snug text-foreground">
                          {item.question.statement}
                        </p>
                        {sources.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {sources.map((s) => (
                              <SourceChip key={s.id} {...s} size="sm" />
                            ))}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
              </ul>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
