import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

export type TopicChartRow = {
  slug: string;
  name: string;
  answeredCount: number;
  correctCount: number;
  accuracy: number; // 0..1
  questionCount: number; // total preguntas disponibles del tema
};

/**
 * Gráfico horizontal de progreso por tema. CSS puro, sin librería.
 *
 * Cada fila tiene dos barras superpuestas:
 *  - barra ancha (gris) = preguntas respondidas / total
 *  - barra angosta dentro (color) = porcentaje de aciertos sobre lo respondido
 *
 * Color de la barra de accuracy:
 *  - verde si accuracy >= 0.75
 *  - ámbar si 0.50 <= accuracy < 0.75
 *  - rojo  si accuracy < 0.50
 */
export function TopicChart({ rows }: { rows: TopicChartRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
        Todavía no respondiste preguntas. Empezá un quiz para ver tu progreso por tema.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left">
            <th className="px-4 py-3 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
              Tema
            </th>
            <th className="px-4 py-3 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
              Cobertura / aciertos
            </th>
            <th className="px-4 py-3 text-right font-mono text-2xs uppercase tracking-widest text-muted-foreground">
              Accuracy
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const coverage = r.questionCount === 0 ? 0 : (r.answeredCount / r.questionCount) * 100;
            const accuracyPct = r.accuracy * 100;
            const tone =
              r.accuracy >= 0.75 ? "success" : r.accuracy >= 0.5 ? "warning" : "destructive";
            return (
              <tr
                key={r.slug}
                className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-4">
                  <Link
                    href={`/temas/${r.slug}` as Route}
                    className="font-display text-foreground tracking-tight hover:text-primary"
                  >
                    {r.name}
                  </Link>
                  <div className="mt-0.5 font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                    {r.answeredCount}/{r.questionCount} respondidas
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="relative h-5 w-full overflow-hidden rounded-xs bg-muted/60">
                    <div
                      className="absolute inset-y-0 left-0 bg-border-strong/50"
                      style={{ width: `${coverage}%` }}
                      aria-hidden
                    />
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0",
                        tone === "success" && "bg-success/80",
                        tone === "warning" && "bg-warning/80",
                        tone === "destructive" && "bg-destructive/80",
                      )}
                      style={{ width: `${(coverage * (r.accuracy || 0))}%` }}
                      aria-hidden
                    />
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span
                    className={cn(
                      "font-mono text-sm tabular-nums",
                      tone === "success" && "text-success",
                      tone === "warning" && "text-warning",
                      tone === "destructive" && "text-destructive",
                      r.answeredCount === 0 && "text-muted-foreground",
                    )}
                  >
                    {r.answeredCount === 0 ? "—" : `${Math.round(accuracyPct)}%`}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
