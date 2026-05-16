import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { QuestionCard } from "@/components/question-card";
import { MOCK_QUESTIONS, MOCK_TOPICS } from "@/lib/mock-data";

type Params = { topic: string };

export default async function QuizPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { topic } = await params;
  const topicData = MOCK_TOPICS.find((t) => t.slug === topic);
  if (!topicData) notFound();

  // En FASE 6 reemplazaremos por motor real; por ahora mostramos las preguntas mock
  // del tema o, si el tema no tiene mock, todas.
  const questions = MOCK_QUESTIONS.filter(
    (q) => q.topicSlug === topic,
  );
  const shown = questions.length ? questions : MOCK_QUESTIONS;

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
            Tema {topicData.code}
          </span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            Quiz · feedback inmediato
          </span>
        </div>
        <h1 className="display-section mt-5 text-3xl text-foreground">
          {topicData.name}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {topicData.description}
        </p>

        <div className="mt-10 space-y-6">
          {shown.map((q, i) => (
            <QuestionCard key={q.id} question={q} index={i + 1} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
