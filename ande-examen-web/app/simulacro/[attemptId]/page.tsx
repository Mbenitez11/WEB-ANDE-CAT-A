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
    },
  });
  if (!attempt || attempt.userId !== session.user.id) notFound();
  if (attempt.finishedAt) redirect(`/quiz/resultado/${attemptId}`);

  // Para simulacro generamos un set una sola vez y lo persistimos via answers.
  // En este flujo simple: re-seleccionamos preguntas según el filtro original guardado.
  // (FASE futura: persistir el set de preguntas asignadas al intento)
  const { selectQuestionsForAttempt } = await import("@/lib/quiz-engine");
  const questions = await selectQuestionsForAttempt(session.user.id, {
    mode: "simulacro",
    questionCount: attempt.totalQuestions,
    includeUnverified: false,
  });

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
          </span>
        </div>
        <h1 className="display-section mt-5 text-3xl text-foreground">Modo examen</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Las fuentes y explicaciones aparecen al finalizar. No volvás atrás.
        </p>

        <div className="mt-10">
          <QuizRunner
            attempt={{
              id: attempt.id,
              mode: "simulacro",
              totalQuestions: attempt.totalQuestions,
              createdAt: attempt.createdAt.toISOString(),
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
