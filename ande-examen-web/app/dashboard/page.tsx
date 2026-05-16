import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { StatTile } from "@/components/stat-tile";
import { Badge } from "@/components/ui/badge";
import { TopicChart, type TopicChartRow } from "@/components/dashboard/topic-chart";
import { RecommendationCard } from "@/components/dashboard/recommendation";
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

  const chartRows: TopicChartRow[] = topics.map((t) => {
    const p = progress.progress.find((p) => p.topic.slug === t.slug);
    return {
      slug: t.slug,
      name: t.name,
      answeredCount: p?.answeredCount ?? 0,
      correctCount: p?.correctCount ?? 0,
      accuracy: p?.accuracy ?? 0,
      questionCount: t.questionCount,
    };
  });

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
                : `${Math.round((progress.totalAnswered / Math.max(1, totalQuestions)) * 100)}% del banco`
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

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <RecommendationCard
              weakTopics={progress.weakTopics.map((p) => ({
                slug: p.topic.slug,
                name: p.topic.name,
                accuracy: p.accuracy,
                answeredCount: p.answeredCount,
              }))}
              overallAccuracy={progress.overallAccuracy}
              totalAnswered={progress.totalAnswered}
            />
          </div>
          <div className="lg:col-span-2">
            <div className="eyebrow text-muted-foreground">Progreso por tema</div>
            <h2 className="display-section mt-3 text-2xl text-foreground">
              Cobertura y aciertos
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              La franja oscura es cobertura (respondidas sobre el total del banco). La franja
              de color superpuesta marca aciertos.
            </p>
            <div className="mt-4">
              <TopicChart rows={chartRows} />
            </div>
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
                        {a.correctCount}/{a.totalQuestions} correctas ·{" "}
                        {Math.round(a.score)}%
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
