import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  FileText,
  ListChecks,
  Quote,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { SourceChip } from "@/components/source-chip";
import { StatTile } from "@/components/stat-tile";
import { Badge } from "@/components/ui/badge";

const CAPABILITIES = [
  {
    code: "01",
    href: "/temas",
    icon: BookOpen,
    title: "Estudiar por tema",
    body: "Reglamento BT, MT, Pliego, NP 2 028, Laboratorio, SAEE. Cada tema con su banco curado.",
  },
  {
    code: "02",
    href: "/quiz/reglamento-baja-tension",
    icon: ListChecks,
    title: "Quiz rápido",
    body: "Sesiones cortas de 10–20 preguntas con feedback inmediato y explicación.",
  },
  {
    code: "03",
    href: "/simulacro",
    icon: ListChecks,
    title: "Simulacro completo",
    body: "Modo examen con temporizador, sin feedback, fuentes ocultas hasta finalizar.",
  },
  {
    code: "04",
    href: "/repaso",
    icon: RotateCcw,
    title: "Repasar errores",
    body: "Cola priorizada de preguntas falladas, guardadas y casos repetidos en exámenes.",
  },
  {
    code: "05",
    href: "/fuentes",
    icon: FileText,
    title: "Fuentes normativas",
    body: "Pliego, reglamentos y NP indexados por documento, página y sección.",
  },
  {
    code: "06",
    href: "/dashboard",
    icon: Activity,
    title: "Progreso",
    body: "Aciertos por tema, temas débiles, recomendaciones y evolución reciente.",
  },
  {
    code: "07",
    href: "/agente",
    icon: Sparkles,
    title: "Agente IA",
    body: "Tutor con streaming y citación obligatoria de fuentes; declara cuando no tiene evidencia.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <Topbar />

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-blueprint opacity-70" aria-hidden />
        <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-20 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:pt-28">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
                01
              </span>
              <span className="h-px w-8 bg-border-strong" />
              <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
                Preparación · Categoría A
              </span>
            </div>

            <h1 className="display-headline mt-8 text-5xl leading-[0.96] sm:text-6xl lg:text-7xl">
              Estudiar para el examen{" "}
              <span
                className="block italic text-primary"
                style={{
                  fontVariationSettings:
                    '"opsz" 96, "SOFT" 20, "WONK" 1, "wght" 380',
                }}
              >
                ANDE Categoría A
              </span>
              <span className="text-foreground">con fuentes.</span>
            </h1>

            <p className="mt-8 max-w-xl text-md leading-relaxed text-muted-foreground">
              Plataforma de preparación profesional para ingenieros eléctricos y
              electromecánicos. Cada respuesta cita su fuente —Pliego, Reglamento
              BT/MT, NP&nbsp;2&nbsp;028, TAA— con página y sección. Las preguntas
              con OCR dudoso quedan marcadas como pendientes de verificación.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/simulacro">
                  Iniciar simulacro <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/temas">Explorar temas</Link>
              </Button>
              <Link
                href="/agente"
                className="ml-2 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Sparkles className="size-4 text-primary" strokeWidth={1.5} />
                Probar agente IA
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-3">
              <span className="eyebrow text-muted-foreground">
                Citas como esta en cada respuesta
              </span>
              <SourceChip
                externalId="F0018"
                documentName="Pliego de Tarifas Nro. 21"
                page={11}
                section="Tasa de conexión"
                withIcon
              />
              <SourceChip
                externalId="F0095"
                documentName="Reglamento MT — ANDE"
                page={100}
                requiresVerification
              />
            </div>
          </div>

          {/* Stats slab */}
          <aside className="lg:col-span-5 lg:border-l lg:border-border lg:pl-10">
            <div className="grid grid-cols-2 gap-px bg-border">
              <StatTile
                label="Preguntas curadas"
                value="240"
                hint="banco inicial · obsidian + simulacro"
              />
              <StatTile
                label="Fuentes indexadas"
                value="34"
                hint="pdf · docx · imagen"
                intent="primary"
              />
              <StatTile
                label="Datos numéricos"
                value="350"
                hint="valor · unidad · vigencia"
              />
              <StatTile
                label="OCR pendiente"
                value="18"
                hint="fragmentos a verificar"
                intent="warning"
              />
            </div>
          </aside>
        </div>
      </section>

      {/* CAPABILITY GRID */}
      <section id="capacidades" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow text-muted-foreground">
              02 · Capacidades
            </div>
            <h2 className="display-section mt-4 max-w-2xl text-3xl text-foreground sm:text-4xl">
              Siete formas de prepararse, sin perder de vista la fuente.
            </h2>
          </div>
          <Badge variant="primary" className="hidden sm:inline-flex">
            v0.1
          </Badge>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <Link
              key={c.code}
              href={c.href as never}
              className="group relative flex flex-col bg-card p-6 transition-colors hover:bg-muted/40 lg:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
                  · {c.code}
                </span>
                <c.icon
                  className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="display-section mt-8 text-xl text-foreground">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {c.body}
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-2xs font-medium uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary">
                Abrir <ArrowRight className="size-3" strokeWidth={1.5} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* TRACEABILITY STRIP */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:px-10">
          <div>
            <div className="eyebrow text-muted-foreground">03 · Trazabilidad</div>
            <h2 className="display-section mt-4 text-3xl text-foreground">
              Cada afirmación con su cita.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              No usamos respuestas inventadas. Cada pregunta validada está atada a un
              documento, página y sección. Si el OCR es dudoso, lo marcamos. Si hay
              contradicción entre normas, lo decimos antes de proponer la respuesta.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3 rounded-sm border border-border bg-card p-4">
              <Quote className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.5} />
              <div>
                <div className="text-sm font-medium">Fuente verificada</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Documento original con página y sección legible.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-sm border-2 border-t-warning border-border bg-card p-4">
              <Quote className="mt-0.5 size-4 shrink-0 text-warning" strokeWidth={1.5} />
              <div>
                <div className="text-sm font-medium">
                  Fuente pendiente de verificación OCR
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  El extracto proviene de un OCR con baja confianza. El valor debe
                  confirmarse antes de usarlo como definitivo.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-sm border border-border bg-card p-4">
              <Quote className="mt-0.5 size-4 shrink-0 text-info" strokeWidth={1.5} />
              <div>
                <div className="text-sm font-medium">Contradicción detectada</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Dos fuentes difieren. Se muestran ambas y se marca el impacto en
                  el examen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
