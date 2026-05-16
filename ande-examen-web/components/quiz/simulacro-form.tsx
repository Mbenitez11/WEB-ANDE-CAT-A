"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  topics: Array<{ slug: string; name: string; questionCount: number }>;
  totalAvailable: number;
};

export function SimulacroForm({ topics, totalAvailable }: Props) {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = React.useState<Set<string>>(
    () => new Set(topics.map((t) => t.slug)),
  );
  const [count, setCount] = React.useState(Math.min(20, totalAvailable));
  const [includeUnverified, setIncludeUnverified] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const allSelected = selectedTopics.size === topics.length;

  function toggleTopic(slug: string) {
    setSelectedTopics((cur) => {
      const next = new Set(cur);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function startSimulacro() {
    if (submitting) return;
    if (selectedTopics.size === 0) {
      toast.error("Seleccioná al menos un tema");
      return;
    }
    setSubmitting(true);

    // Si se eligieron TODOS los temas, no enviamos topicSlug → engine elige de todos
    const topicSlug = allSelected ? undefined : Array.from(selectedTopics)[0];

    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "simulacro",
          topicSlug,
          questionCount: count,
          includeUnverified,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body?.error ?? "No se pudo iniciar el simulacro");
        setSubmitting(false);
        return;
      }
      const { attempt } = (await res.json()) as { attempt: { id: string } };
      router.push(`/simulacro/${attempt.id}` as Route);
    } catch {
      toast.error("Error de red");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-px bg-border md:grid-cols-2">
        <Field label="Cantidad de preguntas">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={Math.max(5, Math.min(50, totalAvailable))}
              step={5}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-16 text-right font-mono text-md tabular-nums text-foreground">
              {count}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Hay {totalAvailable} preguntas validadas disponibles en total.
          </p>
        </Field>

        <Field label="Preguntas con OCR dudoso">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={includeUnverified}
              onChange={(e) => setIncludeUnverified(e.target.checked)}
              className="size-4"
            />
            <span className="text-muted-foreground">Incluir</span>
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            Por defecto se excluyen del simulacro las preguntas con fuente pendiente de
            verificación.
          </p>
        </Field>
      </div>

      <div className="rounded-md border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="eyebrow text-muted-foreground">Temas incluidos</div>
          <button
            type="button"
            className="text-2xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
            onClick={() =>
              setSelectedTopics(allSelected ? new Set() : new Set(topics.map((t) => t.slug)))
            }
          >
            {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {topics.map((t) => {
            const checked = selectedTopics.has(t.slug);
            return (
              <label
                key={t.slug}
                className="flex cursor-pointer items-start gap-3 rounded-sm border border-border bg-background px-3 py-2.5 transition-colors hover:border-border-strong"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTopic(t.slug)}
                  className="mt-0.5 size-4"
                />
                <div className="flex-1">
                  <div className="text-sm text-foreground">{t.name}</div>
                  <div className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                    {t.questionCount} preguntas
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={startSimulacro} disabled={submitting} size="lg">
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Preparando…
            </>
          ) : (
            <>
              <Play className="size-4" /> Iniciar simulacro
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-card p-6">
      <div className="eyebrow text-muted-foreground">{label}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
