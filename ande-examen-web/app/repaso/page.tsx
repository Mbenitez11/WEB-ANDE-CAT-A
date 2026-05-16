import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { QuestionCard } from "@/components/question-card";
import { MOCK_QUESTIONS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Repaso" };

export default function RepasoPage() {
  // Mock: tomamos las preguntas con OCR dudoso o difíciles
  const cola = MOCK_QUESTIONS.filter(
    (q) => q.difficulty === "dificil" || q.requiresVerification,
  );
  const all = cola.length ? cola : MOCK_QUESTIONS;

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12 lg:px-10">
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
          Preguntas falladas, marcadas y aquellas cuya fuente quedó pendiente de
          verificación. Priorizadas por última fecha de error.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="primary">Falladas</Badge>
          <Badge variant="warning">OCR dudoso</Badge>
          <Badge variant="info">Marcadas</Badge>
          <Badge variant="muted">Contradicciones</Badge>
        </div>

        <div className="mt-10 space-y-6">
          {all.map((q, i) => (
            <QuestionCard key={q.id} question={q} index={i + 1} immediateFeedback={false} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
