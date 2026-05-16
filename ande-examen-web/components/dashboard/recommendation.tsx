import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type RecommendationProps = {
  weakTopics: Array<{
    slug: string;
    name: string;
    accuracy: number;
    answeredCount: number;
  }>;
  overallAccuracy: number;
  totalAnswered: number;
};

/**
 * Tarjeta de recomendación de estudio. Reglas:
 *  - Si no hay datos (totalAnswered < 5) → mensaje de bienvenida.
 *  - Si overallAccuracy >= 0.85 → felicitación + sugerencia de simulacro.
 *  - Si hay temas débiles → recomienda el peor con CTA al quiz.
 */
export function RecommendationCard({
  weakTopics,
  overallAccuracy,
  totalAnswered,
}: RecommendationProps) {
  if (totalAnswered < 5) {
    return (
      <Card
        title="Empezá por reglamento BT"
        body="Es el tema con más preguntas en la base. Respondé al menos 5 para que el dashboard pueda detectar tus debilidades."
        href="/quiz/reglamento-baja-tension"
        ctaLabel="Quiz BT"
        tone="info"
      />
    );
  }

  if (overallAccuracy >= 0.85) {
    return (
      <Card
        title="Vas bien · probá un simulacro"
        body={`Tu accuracy general es ${Math.round(overallAccuracy * 100)}%. Probá un simulacro de 20 preguntas mixtas para validar bajo presión.`}
        href="/simulacro"
        ctaLabel="Iniciar simulacro"
        tone="success"
      />
    );
  }

  if (weakTopics.length > 0) {
    const worst = weakTopics[0];
    return (
      <Card
        title={`Reforzar: ${worst.name}`}
        body={`Tu accuracy en este tema es ${Math.round(worst.accuracy * 100)}% sobre ${worst.answeredCount} respuestas. Un quiz dirigido te ayuda a cerrar la brecha.`}
        href={`/quiz/${worst.slug}`}
        ctaLabel="Repasar este tema"
        tone="warning"
      />
    );
  }

  return (
    <Card
      title="Seguí practicando"
      body={`Llevás ${totalAnswered} preguntas respondidas con ${Math.round(overallAccuracy * 100)}% de accuracy. Aumentá el volumen para que aparezcan recomendaciones específicas.`}
      href="/temas"
      ctaLabel="Ver temas"
      tone="neutral"
    />
  );
}

function Card({
  title,
  body,
  href,
  ctaLabel,
  tone,
}: {
  title: string;
  body: string;
  href: string;
  ctaLabel: string;
  tone: "info" | "success" | "warning" | "neutral";
}) {
  const toneClass = {
    info: "border-l-info",
    success: "border-l-success",
    warning: "border-l-warning",
    neutral: "border-l-border-strong",
  }[tone];

  const variant: "info" | "success" | "warning" | "neutral" = tone;

  return (
    <div
      className={`rounded-md border border-l-4 ${toneClass} border-border bg-card p-6`}
    >
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 size-4 shrink-0 text-primary" strokeWidth={1.5} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant={variant}>Recomendación</Badge>
          </div>
          <h3 className="display-section mt-3 text-xl text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          <Link
            href={href as Route}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            {ctaLabel} <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
