"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Check, ChevronRight, Clock, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SourceChip } from "@/components/source-chip";
import { OcrWarning } from "@/components/ocr-warning";
import { cn } from "@/lib/utils";

export type QuizMode = "practica" | "tema" | "simulacro" | "repaso";

export type RunnerOption = { id: string; text: string; order: number };

export type RunnerQuestion = {
  id: string;
  externalId: string | null;
  statement: string;
  type: string;
  difficulty: string;
  requiresVerification: boolean;
  topic: { slug: string; name: string };
  options: RunnerOption[];
};

export type RunnerAttempt = {
  id: string;
  mode: QuizMode;
  totalQuestions: number;
  createdAt: string;
  /** Si > 0, muestra temporizador y auto-finaliza al llegar a 0. */
  timeLimitSeconds?: number | null;
};

type Props = {
  attempt: RunnerAttempt;
  questions: RunnerQuestion[];
  showSourcesDuringAttempt: boolean;
  /** En modo simulacro queremos cerrar la sesión recién al final */
  finishOnComplete?: boolean;
};

type AnswerResult = {
  isCorrect: boolean;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  explanation: string | null;
  sources: Array<{
    id: string;
    externalId: string;
    documentName: string;
    page: number | null;
    section?: string;
    requiresVerification: boolean;
  }>;
};

function formatClock(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const DIFF_LABEL: Record<string, string> = {
  basica: "Básica",
  media: "Media",
  dificil: "Difícil",
  examen: "Examen",
};
const DIFF_VARIANT: Record<string, "muted" | "neutral" | "warning" | "destructive"> = {
  basica: "muted",
  media: "neutral",
  dificil: "warning",
  examen: "destructive",
};

export function QuizRunner({
  attempt,
  questions,
  showSourcesDuringAttempt,
  finishOnComplete = true,
}: Props) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [revealed, setRevealed] = React.useState<AnswerResult | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [finishing, setFinishing] = React.useState(false);
  const [stats, setStats] = React.useState({ correct: 0, wrong: 0 });
  const [startedAt] = React.useState(() => Date.now());
  const [secondsLeft, setSecondsLeft] = React.useState<number | null>(
    attempt.timeLimitSeconds && attempt.timeLimitSeconds > 0 ? attempt.timeLimitSeconds : null,
  );

  // Timer
  React.useEffect(() => {
    if (secondsLeft == null) return;
    if (secondsLeft <= 0) {
      void finishAttempt();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s == null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const question = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  async function submitAnswer() {
    if (!question || !selected || submitting) return;
    setSubmitting(true);
    const timeSpentSeconds = Math.floor((Date.now() - startedAt) / 1000);
    try {
      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: attempt.id,
          questionId: question.id,
          selectedOptionId: selected,
          timeSpentSeconds: Math.min(timeSpentSeconds, 36000),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body?.error ?? "No se pudo guardar la respuesta");
        setSubmitting(false);
        return;
      }
      const { answer } = (await res.json()) as { answer: { isCorrect: boolean } };

      // En modo simulacro NO revelamos respuesta. Solo avanzamos.
      if (attempt.mode === "simulacro") {
        setStats((s) => (answer.isCorrect ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 }));
        advanceOrFinish();
        return;
      }

      // Obtener detalles de la pregunta (respuesta correcta, explicación, fuentes)
      const detailsRes = await fetch(`/api/questions/${question.id}`);
      const details = detailsRes.ok ? await detailsRes.json() : null;
      const correctOpt = details?.question?.options?.find((o: { isCorrect: boolean }) => o.isCorrect);
      const sources =
        details?.question?.sources?.map(
          (rel: {
            source: {
              id: string;
              page: number | null;
              section: string | null;
              requiresVerification: boolean;
              document: { externalId: string; name: string };
            };
          }) => ({
            id: rel.source.id,
            externalId: rel.source.document.externalId,
            documentName: rel.source.document.name,
            page: rel.source.page,
            section: rel.source.section ?? undefined,
            requiresVerification: rel.source.requiresVerification,
          }),
        ) ?? [];

      setStats((s) =>
        answer.isCorrect ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 },
      );
      setRevealed({
        isCorrect: answer.isCorrect,
        selectedOptionId: selected,
        correctOptionId: correctOpt?.id ?? null,
        explanation: details?.question?.explanation ?? null,
        sources,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function advanceOrFinish() {
    if (isLast) {
      void finishAttempt();
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelected(null);
    setRevealed(null);
  }

  async function finishAttempt() {
    if (finishing) return;
    setFinishing(true);
    const durationSeconds = Math.floor((Date.now() - startedAt) / 1000);
    try {
      const res = await fetch("/api/quiz/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.id, durationSeconds }),
      });
      if (!res.ok) {
        toast.error("No se pudo cerrar el intento");
        setFinishing(false);
        return;
      }
      router.push(`/quiz/resultado/${attempt.id}` as Route);
    } catch {
      setFinishing(false);
    }
  }

  if (!question) {
    return (
      <p className="rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
        Esta sesión no tiene preguntas.
      </p>
    );
  }

  const progress = ((currentIdx + (revealed ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header de progreso */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <div className="eyebrow text-muted-foreground">
            Pregunta {currentIdx + 1} de {questions.length}
          </div>
          <div className="mt-1 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            Modo: {attempt.mode}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {secondsLeft != null ? (
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xs border px-2 py-1 font-mono text-xs tabular-nums",
                secondsLeft <= 60
                  ? "border-destructive bg-destructive-subtle/40 text-destructive"
                  : secondsLeft <= 300
                    ? "border-warning bg-warning-subtle/40 text-warning"
                    : "border-border bg-card text-muted-foreground",
              )}
              title="Tiempo restante"
            >
              <Clock className="size-3.5" strokeWidth={1.5} />
              {formatClock(secondsLeft)}
            </div>
          ) : null}
          <div className="text-right font-mono text-xs tabular-nums text-muted-foreground">
            <span className="text-success">{stats.correct}</span>
            <span className="mx-1">·</span>
            <span className="text-destructive">{stats.wrong}</span>
          </div>
        </div>
      </header>

      <div className="h-px w-full bg-border">
        <div
          className="h-px bg-primary transition-all duration-300"
          style={{ width: `${Math.max(2, progress)}%` }}
        />
      </div>

      {/* Card de pregunta */}
      <article className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
        {question.requiresVerification ? <OcrWarning /> : null}

        <div className="p-6 lg:p-8">
          <header className="mb-5 flex flex-wrap items-center gap-2">
            <Badge variant="primary">{question.topic.name}</Badge>
            <Badge variant={DIFF_VARIANT[question.difficulty] ?? "neutral"}>
              {DIFF_LABEL[question.difficulty] ?? question.difficulty}
            </Badge>
            {question.externalId ? (
              <span className="ml-auto font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                {question.externalId}
              </span>
            ) : null}
          </header>

          <h2 className="display-statement text-xl leading-snug text-foreground">
            {question.statement}
          </h2>

          <ul className="mt-6 space-y-2">
            {question.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i); // A, B, C, D
              const isSelected = selected === opt.id;
              const showCorrect = revealed && opt.id === revealed.correctOptionId;
              const showWrong = revealed && isSelected && opt.id !== revealed.correctOptionId;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => !revealed && !submitting && setSelected(opt.id)}
                    disabled={!!revealed || submitting}
                    className={cn(
                      "group/option flex w-full items-start gap-4 border-l py-3 pl-4 pr-3 text-left text-sm transition-all",
                      "hover:bg-muted/40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                      isSelected
                        ? "border-l-[3px] border-l-primary bg-primary/[0.04]"
                        : "border-l-border",
                      showCorrect && "border-l-[3px] border-l-success bg-success-subtle/40",
                      showWrong && "border-l-[3px] border-l-destructive bg-destructive-subtle/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center border font-mono text-2xs uppercase tracking-wider",
                        showCorrect
                          ? "border-success bg-success text-success-foreground"
                          : showWrong
                            ? "border-destructive bg-destructive text-destructive-foreground"
                            : "border-border-strong text-muted-foreground group-hover/option:text-foreground",
                      )}
                    >
                      {showCorrect ? (
                        <Check className="size-3" strokeWidth={2} />
                      ) : showWrong ? (
                        <X className="size-3" strokeWidth={2} />
                      ) : (
                        letter
                      )}
                    </span>
                    <span className="leading-relaxed text-foreground">{opt.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Footer: explicación + fuentes (post-reveal) */}
          {revealed ? (
            <div
              className={cn(
                "mt-8 rounded-sm border bg-muted/30 p-5",
                revealed.isCorrect
                  ? "border-l-2 border-l-success border-border"
                  : "border-l-2 border-l-destructive border-border",
              )}
            >
              <div className="mb-2 eyebrow">
                {revealed.isCorrect ? (
                  <span className="text-success">Respuesta correcta</span>
                ) : (
                  <span className="text-destructive">Respuesta incorrecta</span>
                )}
              </div>
              {revealed.explanation ? (
                <p className="text-sm leading-relaxed text-foreground/90">
                  {revealed.explanation}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  Sin explicación textual. Revisá las fuentes citadas.
                </p>
              )}
              {showSourcesDuringAttempt && revealed.sources.length > 0 ? (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="mb-2 eyebrow text-muted-foreground">Fuentes</div>
                  <div className="flex flex-wrap gap-2">
                    {revealed.sources.map((s) => (
                      <SourceChip key={s.id} {...s} size="sm" />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>

      {/* Botón principal */}
      <div className="flex justify-end gap-3">
        {revealed || attempt.mode === "simulacro" ? (
          <Button onClick={advanceOrFinish} disabled={finishing || (!revealed && !selected)} size="lg">
            {finishing ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Cerrando…
              </>
            ) : isLast ? (
              <>Finalizar</>
            ) : (
              <>
                Siguiente <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={submitAnswer} disabled={!selected || submitting} size="lg">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : "Responder"}
          </Button>
        )}
      </div>
    </div>
  );
}
