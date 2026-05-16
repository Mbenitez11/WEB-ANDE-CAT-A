"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import type { QuestionMock } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SourceChip } from "@/components/source-chip";
import { OcrWarning } from "@/components/ocr-warning";

type Props = {
  question: QuestionMock;
  /** Número de pregunta dentro del intento actual (1-based). */
  index: number;
  /** Mostrar feedback inmediato tras seleccionar. */
  immediateFeedback?: boolean;
};

const difficultyMap = {
  basica: { label: "Básica", variant: "muted" as const },
  media: { label: "Media", variant: "neutral" as const },
  dificil: { label: "Difícil", variant: "warning" as const },
  examen: { label: "Examen", variant: "destructive" as const },
};

export function QuestionCard({ question, index, immediateFeedback = true }: Props) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [revealed, setRevealed] = React.useState(false);

  const correctOption = question.options.find((o) => o.isCorrect)!;
  const isCorrect = selected === correctOption.id;

  function handleSelect(id: string) {
    if (revealed) return;
    setSelected(id);
    if (immediateFeedback) setRevealed(true);
  }

  return (
    <article className="group relative overflow-hidden rounded-md border border-border bg-card shadow-sm">
      {question.requiresVerification ? <OcrWarning /> : null}

      <div className="grid grid-cols-[64px_1fr] lg:grid-cols-[80px_1fr]">
        <aside className="flex flex-col items-center border-r border-border py-6 text-muted-foreground">
          <span className="font-mono text-2xs uppercase tracking-widest">
            {String(index).padStart(3, "0")}
          </span>
          <span className="mt-4 block h-full w-px bg-border" />
        </aside>

        <div className="p-6 lg:p-8">
          <header className="mb-5 flex flex-wrap items-center gap-2">
            <Badge variant="primary">{question.topicShort}</Badge>
            <Badge variant={difficultyMap[question.difficulty].variant}>
              {difficultyMap[question.difficulty].label}
            </Badge>
            {question.repetition === "alta" ? (
              <Badge variant="warning">Repetida-alta</Badge>
            ) : null}
            <span className="ml-auto font-mono text-2xs uppercase tracking-wider text-muted-foreground">
              {question.externalId}
            </span>
          </header>

          <h2 className="display-statement text-xl leading-snug text-foreground">
            {question.statement}
          </h2>

          <ul className="mt-6 space-y-2">
            {question.options.map((opt) => {
              const isSelected = selected === opt.id;
              const showCorrect = revealed && opt.isCorrect;
              const showWrong = revealed && isSelected && !opt.isCorrect;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    disabled={revealed}
                    className={cn(
                      "group/option flex w-full items-start gap-4 border-l py-3 pl-4 pr-3 text-left text-sm transition-all",
                      "hover:bg-muted/40",
                      isSelected
                        ? "border-l-[3px] border-l-primary bg-primary/[0.04]"
                        : "border-l-border",
                      showCorrect &&
                        "border-l-[3px] border-l-success bg-success-subtle/40",
                      showWrong &&
                        "border-l-[3px] border-l-destructive bg-destructive-subtle/40",
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
                        opt.letter
                      )}
                    </span>
                    <span className="leading-relaxed text-foreground">
                      {opt.text}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Citation strip */}
          <div className="mt-8 border-t border-border pt-5">
            <div className="mb-2 eyebrow text-muted-foreground">Fuentes</div>
            <div className="flex flex-wrap gap-2">
              {question.sources.map((s) => (
                <SourceChip
                  key={s.id}
                  externalId={s.externalId}
                  documentName={s.documentName}
                  page={s.page}
                  section={s.section}
                  requiresVerification={s.requiresVerification}
                />
              ))}
            </div>
          </div>

          {/* Explanation panel */}
          {revealed ? (
            <div
              className={cn(
                "mt-6 rounded-sm border bg-muted/30 p-5",
                isCorrect
                  ? "border-l-2 border-l-success border-border"
                  : "border-l-2 border-l-destructive border-border",
              )}
            >
              <div className="mb-2 eyebrow">
                {isCorrect ? (
                  <span className="text-success">Respuesta correcta</span>
                ) : (
                  <span className="text-destructive">Respuesta incorrecta</span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {question.explanation}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
