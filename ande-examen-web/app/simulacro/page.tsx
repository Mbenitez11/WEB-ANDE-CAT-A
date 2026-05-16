import Link from "next/link";
import { Clock, ListChecks, ShieldAlert } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_TOPICS } from "@/lib/mock-data";

export const metadata = { title: "Simulacro" };

export default function SimulacroPage() {
  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
            ◇
          </span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            Modo examen
          </span>
        </div>
        <h1 className="display-headline mt-6 text-4xl text-foreground sm:text-5xl">
          Configurar simulacro
        </h1>
        <p className="mt-4 max-w-2xl text-md leading-relaxed text-muted-foreground">
          Modo orientado a condiciones de examen. Sin feedback inmediato, fuentes ocultas
          hasta finalizar, temporizador opcional.
        </p>

        <div className="mt-12 grid gap-px bg-border md:grid-cols-3">
          <Config label="Cantidad" value="30 preguntas" />
          <Config label="Tiempo" value="40 minutos" icon={Clock} />
          <Config label="Temas" value="todos" />
        </div>

        <section className="mt-10 rounded-md border border-border bg-card p-6 lg:p-8">
          <div className="eyebrow text-muted-foreground">Temas incluidos</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {MOCK_TOPICS.map((t) => (
              <Badge key={t.slug} variant="neutral">
                {t.code} · {t.name.split(" ").slice(0, 3).join(" ")}
              </Badge>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/quiz/reglamento-baja-tension">
                <ListChecks className="size-4" />
                Iniciar simulacro
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/temas">Ajustar parámetros</Link>
            </Button>
          </div>
        </section>

        <section className="mt-8 flex items-start gap-3 rounded-sm border-l-2 border-l-warning border-border bg-warning-subtle/20 p-5">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" strokeWidth={1.5} />
          <div>
            <div className="text-sm font-medium text-foreground">Aviso</div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Este simulacro es una herramienta de estudio y no representa
              necesariamente al examen oficial de la ANDE.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Config({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div className="bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-muted-foreground">{label}</span>
        {Icon ? <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.5} /> : null}
      </div>
      <div className="display-section mt-4 text-xl text-foreground">{value}</div>
    </div>
  );
}
