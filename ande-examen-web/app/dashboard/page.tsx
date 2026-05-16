import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { StatTile } from "@/components/stat-tile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getTopicsWithStats, getUserProgress } from "@/lib/data";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  const userId = session.user.id;

  const [progress, topics, totalQuestions] = await Promise.all([
    getUserProgress(userId),
    getTopicsWithStats(userId),
    db.question.count({ where: { status: "validada" } }),
  ]);

  const totalWrong = progress.totalAnswered - progress.totalCorrect;
  const lastAttempt = progress.attempts[0];

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-12 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
            ✦
          </span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            {session.user.name ? `Hola, ${session.user.name}` : "Tu progreso"}
          </span>
        </div>
        <h1 className="display-headline mt-6 text-4xl text-foreground sm:text-5xl">
          Dashboard
        </h1>

        <div className="mt-10 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          <StatTile
            label="Respondidas"
            value={progress.totalAnswered}
            suffix={`/${totalQuestions}`}
            hint={
              totalQuestions === 0
                ? "Sin preguntas en la DB"
                : `${Math.round((progress.totalAnswered / totalQuestions) * 100)}% del banco`
            }
          />
          <StatTile
            label="Aciertos"
            value={progress.totalCorrect}
            intent="success"
            hint={`${Math.round(progress.overallAccuracy * 100)}% accuracy`}
          />
          <StatTile
            label="Errores"
            value={totalWrong}
            intent="destructive"
            hint={totalWrong > 0 ? "cola de repaso activa" : "sin errores"}
          />
          <StatTile
            label="Simulacros"
            value={progress.attemptsCount}
            intent="primary"
            hint={
              lastAttempt?.finishedAt
                ? `último: ${new Date(lastAttempt.finishedAt).toLocaleDateString("es-PY", {
                    day: "numeric",
                    month: "short",
                  })}`
                : "ninguno todavía"
            }
          />
        </div>

        {progress.weakTopics.length > 0 ? (
          <section className="mt-16">
            <div className="eyebrow text-muted-foreground">Recomendación</div>
            <h2 className="display-section mt-3 text-2xl text-foreground">
              Temas débiles para reforzar
            </h2>
            <ul className="mt-6 space-y-3">
              {progress.weakTopics.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-border bg-card p-5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">
                        {Math.round(p.accuracy * 100)}% accuracy
                      </Badge>
                      <span className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                        {p.answeredCount} respondidas · {p.wrongCount} errores
                      </span>
                    </div>
                    <p className="mt-2 font-display text-lg text-foreground">{p.topic.name}</p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/quiz/${p.topic.slug}` as Route}>
                      Repasar <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-16">
          <div className="eyebrow text-muted-foreground">Temario completo</div>
          <h2 className="display-section mt-3 text-2xl text-foreground">Progreso por tema</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => (
              <Link
                key={t.slug}
                href={`/temas/${t.slug}` as Route}
                className="group rounded-md border border-border bg-card p-5 transition-all hover:border-border-strong"
              >
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-muted-foreground">{t.code}</span>
                  <span className="font-mono text-2xs tabular-nums text-muted-foreground">
                    {Math.round(t.progress * 100)}%
                  </span>
                </div>
                <p className="mt-3 font-display text-md text-foreground">{t.name}</p>
                <div className="mt-4 h-px w-full bg-border">
                  <div
                    className="h-px bg-primary transition-all"
                    style={{ width: `${Math.max(2, t.progress * 100)}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-2xs text-muted-foreground">
                  <span>{t.questionCount} preguntas</span>
                  <span className="font-medium text-foreground/80 transition-colors group-hover:text-primary">
                    Abrir →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {progress.attempts.length > 0 ? (
          <section className="mt-16">
            <div className="eyebrow text-muted-foreground">Historial</div>
            <h2 className="display-section mt-3 text-2xl text-foreground">Últimos intentos</h2>
            <ul className="mt-6 divide-y divide-border rounded-md border border-border bg-card">
              {progress.attempts.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 p-4 px-5">
                  <div className="flex items-center gap-3">
                    <Badge variant="neutral">{a.mode}</Badge>
                    <div>
                      <div className="text-sm text-foreground">
                        {a.topic?.name ?? "Mixto"}
                      </div>
                      <div className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                        {a.correctCount}/{a.totalQuestions} correctas
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/quiz/resultado/${a.id}` as Route}
                    className="text-2xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary"
                  >
                    Ver →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
