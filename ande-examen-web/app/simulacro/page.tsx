import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTopicsWithStats } from "@/lib/data";
import { SimulacroForm } from "@/components/quiz/simulacro-form";

export const metadata = { title: "Simulacro" };

export default async function SimulacroPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/simulacro");

  const topics = await getTopicsWithStats(session.user.id);
  const available = topics.filter((t) => t.questionCount > 0);
  const totalAvailable = available.reduce((s, t) => s + t.questionCount, 0);

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12 lg:px-10">
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
        <p className="mt-4 text-md leading-relaxed text-muted-foreground">
          Sin feedback inmediato durante la prueba. Las fuentes y explicaciones se muestran
          al finalizar.
        </p>

        <section className="mt-10">
          <SimulacroForm
            topics={available.map((t) => ({
              slug: t.slug,
              name: t.name,
              questionCount: t.questionCount,
            }))}
            totalAvailable={totalAvailable}
          />
        </section>

        <section className="mt-12">
          <div className="eyebrow text-muted-foreground">Disponibles ahora</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {available.map((t) => (
              <Badge key={t.slug} variant="neutral">
                {t.name} · {t.questionCount}
              </Badge>
            ))}
          </div>
        </section>

        <section className="mt-10 flex items-start gap-3 rounded-sm border-l-2 border-l-warning border-border bg-warning-subtle/20 p-5">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" strokeWidth={1.5} />
          <div>
            <div className="text-sm font-medium text-foreground">Aviso</div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Este simulacro es una herramienta de estudio y no representa necesariamente al
              examen oficial de la ANDE.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
