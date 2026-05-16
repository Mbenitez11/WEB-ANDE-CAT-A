import { Sparkles, Send, Copy, Quote } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { SourceChip } from "@/components/source-chip";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Agente IA" };

/**
 * UI estática del agente para FASE 4. El streaming real se conecta en FASE 14
 * (Vercel AI SDK + tool calling + RAG). El layout (chat + rail de fuentes) ya
 * está modelado para que la página final reemplace estos mocks sin tocar CSS.
 */
export default function AgentePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />
      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-0 px-0 lg:grid-cols-[1fr_320px]">
        {/* CHAT */}
        <section className="flex flex-col border-r border-border">
          <header className="flex items-center justify-between border-b border-border px-6 py-4 lg:px-10">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" strokeWidth={1.5} />
              <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
                Tutor ANDE · streaming
              </span>
            </div>
            <Badge variant="muted">v0.1 mock</Badge>
          </header>

          <div className="flex-1 space-y-8 px-6 py-10 lg:px-10">
            {/* Quick prompts */}
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "Explicame la tasa de conexión según el Pliego de Tarifas.",
                "Haceme 5 preguntas difíciles sobre Reglamento BT.",
                "¿Qué datos numéricos debo memorizar para el examen?",
                "Compará esta respuesta con la fuente original.",
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  className="rounded-sm border border-border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-border-strong hover:bg-muted/40 hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* User msg */}
            <div className="flex justify-end">
              <div className="max-w-[68ch] rounded-sm border border-border bg-muted px-4 py-3 text-sm text-foreground">
                ¿Dónde se establece la tasa de conexión y cuál es el valor base?
              </div>
            </div>

            {/* Assistant msg */}
            <article className="max-w-[68ch] space-y-4">
              <div className="flex items-center gap-2 text-2xs uppercase tracking-widest text-muted-foreground">
                <Sparkles className="size-3 text-primary" strokeWidth={1.5} />
                <span>Asistente</span>
              </div>
              <div className="prose-anchor font-display text-md leading-relaxed text-foreground"
                   style={{ fontVariationSettings: '"opsz" 18, "SOFT" 30, "wght" 420' }}>
                La tasa de conexión se encuentra establecida dentro del{" "}
                <em>Pliego de Tarifas Nro. 21</em>, en la sección
                correspondiente a tasas y cargos aplicables.
                <sup className="ml-1 inline-flex translate-y-[-2px] items-center rounded-xs border border-border bg-card px-1 py-px font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  F0018·p11
                </sup>
                {" "}El valor exacto depende de la categoría tarifaria y la
                potencia solicitada; el documento define la fórmula con K, K1 y
                K2 según el caso.
              </div>

              <div className="rounded-sm border-l-2 border-l-info border-border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
                <strong className="font-medium text-foreground">Nota: </strong>
                respuesta basada en el Pliego vigente cargado en el proyecto. Para
                un valor numérico definitivo, conviene confirmar el coeficiente
                aplicado contra la versión oficial actualizada.
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-7 items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 text-2xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Copy className="size-3" strokeWidth={1.5} /> Copiar
                </button>
                <button
                  type="button"
                  className="inline-flex h-7 items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 text-2xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Quote className="size-3" strokeWidth={1.5} /> Generar mini quiz
                </button>
              </div>
            </article>
          </div>

          {/* Composer */}
          <div className="border-t border-border px-6 py-4 lg:px-10">
            <form className="flex items-end gap-3">
              <textarea
                rows={2}
                placeholder="Escribí una pregunta. El agente cita siempre la fuente."
                className="flex-1 resize-none rounded-sm border border-border bg-card px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Enviar <Send className="size-3.5" strokeWidth={1.5} />
              </button>
            </form>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              El agente no responde como autoridad normativa. Declara cuando no
              tiene evidencia suficiente.
            </p>
          </div>
        </section>

        {/* SOURCES RAIL */}
        <aside className="hidden flex-col gap-4 border-l border-border px-6 py-10 lg:flex">
          <div className="eyebrow text-muted-foreground">Fuentes citadas</div>
          <ul className="space-y-3">
            <li>
              <SourceChip
                externalId="F0018"
                documentName="Pliego de Tarifas Nro. 21"
                page={11}
                section="Tasa de conexión"
                withIcon
              />
            </li>
            <li>
              <SourceChip
                externalId="F0004"
                documentName="ANDE TAAs"
                page={8}
                section="Banco TAA"
                withIcon
              />
            </li>
            <li>
              <SourceChip
                externalId="F0095"
                documentName="Reglamento MT — ANDE"
                page={100}
                requiresVerification
                withIcon
              />
            </li>
          </ul>

          <div className="mt-6 border-t border-border pt-6">
            <div className="eyebrow text-muted-foreground">Sugerencias</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="text-muted-foreground">
                <span className="text-foreground">→</span> Cómo calcular K, K1, K2
              </li>
              <li className="text-muted-foreground">
                <span className="text-foreground">→</span> Categorías tarifarias
              </li>
              <li className="text-muted-foreground">
                <span className="text-foreground">→</span> Demanda media vs máxima
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
