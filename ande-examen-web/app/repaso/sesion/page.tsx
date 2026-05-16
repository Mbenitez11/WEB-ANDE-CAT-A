import Link from "next/link";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { selectQuestionsForAttempt, shouldShowSourcesDuringAttempt } from "@/lib/quiz-engine";

export default async function RepasoSesionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/repaso/sesion");

  const questions = await selectQuestionsForAttempt(session.user.id, {
    mode: "repaso",
    questionCount: 10,
    includeUnverified: false,
  });

  if (!questions.length) {
    return (
      <>
        <Topbar />
        <main className="mx-auto max-w-3xl px-6 pb-24 pt-12 lg:px-10">
          <h1 className="display-headline text-3xl text-foreground">Cola vacía</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Todavía no hay preguntas falladas ni guardadas para repasar.
          </p>
          <Button asChild className="mt-6">
            <Link href="/temas">Empezar a estudiar</Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  const attempt = await db.quizAttempt.create({
    data: {
      userId: session.user.id,
      mode: "repaso",
      totalQuestions: questions.length,
    },
    select: { id: true, mode: true, totalQuestions: true, createdAt: true },
  });

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
            Repaso
          </span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            {questions.length} preguntas
          </span>
        </div>
        <h1 className="display-section mt-5 text-3xl text-foreground">Sesión de repaso</h1>

        <div className="mt-10">
          <QuizRunner
            attempt={{
              id: attempt.id,
              mode: "repaso",
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
            showSourcesDuringAttempt={shouldShowSourcesDuringAttempt("repaso")}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
