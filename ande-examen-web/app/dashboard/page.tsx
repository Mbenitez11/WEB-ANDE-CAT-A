import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { StatTile } from "@/components/stat-tile";
import { TopicCard } from "@/components/topic-card";
import { MOCK_STATS, MOCK_TOPICS } from "@/lib/mock-data";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const weak = MOCK_TOPICS.filter((t) =>
    MOCK_STATS.weakTopics.includes(t.slug),
  );

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
            Progreso · vista personal
          </span>
        </div>
        <h1 className="display-headline mt-6 text-4xl text-foreground sm:text-5xl">
          Dashboard
        </h1>

        <div className="mt-10 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          <StatTile
            label="Respondidas"
            value={MOCK_STATS.answered}
            suffix={`/${MOCK_STATS.totalQuestions}`}
            hint={`${Math.round(
              (MOCK_STATS.answered / MOCK_STATS.totalQuestions) * 100,
            )}% del banco`}
          />
          <StatTile
            label="Aciertos"
            value={MOCK_STATS.correct}
            intent="success"
            hint={`${Math.round(MOCK_STATS.accuracy * 100)}% accuracy`}
          />
          <StatTile
            label="Errores"
            value={MOCK_STATS.wrong}
            intent="destructive"
            hint="cola de repaso activa"
          />
          <StatTile
            label="Simulacros"
            value={MOCK_STATS.attempts}
            intent="primary"
            hint="último: hace 2 días"
          />
        </div>

        <section className="mt-16">
          <div className="flex items-end justify-between">
            <div>
              <div className="eyebrow text-muted-foreground">Recomendación</div>
              <h2 className="display-section mt-3 text-2xl text-foreground">
                Temas débiles para reforzar esta semana
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {weak.map((t) => (
              <TopicCard key={t.slug} {...t} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
