import { notFound, redirect } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function SimulacroActivoPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { attemptId } = await params;
  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      mode: true,
      totalQuestions: true,
      createdAt: true,
      userId: true,
      finishedAt: true,
      assignedQuestionIds: true,
      timeLimitSeconds: true,
    },
  });
  if (!attempt || attempt.userId !== session.user.id) notFound();
  if (attempt.finishedAt) redirect(`/quiz/resultado/${attemptId}`);

  // El set de preguntas se persistió al crear el intento — lo cargamos en
  // el orden original para que el refresh no cambie las preguntas.
  const ids = (attempt.assignedQuestionIds ?? "").split(",").filter(Boolean);
  if (ids.length === 0) {
    // Intento legacy sin set asignado: re-seleccionamos (compat).
    const { selectQuestionsForAttempt } = await import("@/lib/quiz-engine");
    const questions = await selectQuestionsForAttempt(session.user.id, {
      mode: "simulacro",
      questionCount: attempt.totalQuestions,
      includeUnverified: false,
    });
    return renderRunner(attempt, questions);
  }

  const dbQuestions = await db.question.findMany({
    where: { id: { in: ids } },
    include: {
      topic: { select: { slug: true, name: true } },
      options: { orderBy: { order: "asc" }, select: { id: true, text: true, order: true } },
    },
  });
  // Re-ordenar según el orden persistido (findMany no garantiza orden)
  const byId = new Map(dbQuestions.map((q) => [q.id, q]));
  const questions = ids.map((id) => byId.get(id)!).filter(Boolean);

  return renderRunner(attempt, questions);
}

type Q = {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  requiresVerification: boolean;
  topic: { slug: string; name: string };
  options: { id: string; text: string; order: number }[];
};

function renderRunner(
  attempt: {
    id: string;
    totalQuestions: number;
    createdAt: Date;
    timeLimitSeconds: number | null;
  },
  questions: Q[],
) {
  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
            Simulacro
          </span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            {attempt.totalQuestions} preguntas
            {attempt.timeLimitSeconds
              ? ` · ${Math.round(attempt.timeLimitSeconds / 60)} min`
              : null}
          </span>
        </div>
        <h1 className="display-section mt-5 text-3xl text-foreground">Modo examen</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Las fuentes y explicaciones aparecen al finalizar. Si el tiempo se agota, el
          intento se cierra automáticamente con las respuestas guardadas.
        </p>

        <div className="mt-10">
          <QuizRunner
            attempt={{
              id: attempt.id,
              mode: "simulacro",
              totalQuestions: attempt.totalQuestions,
              createdAt: attempt.createdAt.toISOString(),
              timeLimitSeconds: attempt.timeLimitSeconds ?? null,
            }}
            questions={questions.map((q) => ({
              id: q.id,
              externalId: null,
              statement: q.statement,
              type: q.type,
              difficulty: q.difficulty,
              requiresVerification: q.requiresVerification,
              topic: q.topic,
              options: q.options,
            }))}
            showSourcesDuringAttempt={false}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
