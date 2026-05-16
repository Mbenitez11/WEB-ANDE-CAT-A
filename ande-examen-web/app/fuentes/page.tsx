import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { MOCK_SOURCES } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Fuentes" };

export default function FuentesPage() {
  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-12 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
            §F
          </span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            Documentos fuente
          </span>
        </div>
        <h1 className="display-headline mt-6 text-4xl text-foreground sm:text-5xl">
          Fuentes normativas
        </h1>
        <p className="mt-4 max-w-2xl text-md leading-relaxed text-muted-foreground">
          Documentos curados desde la bóveda Obsidian del proyecto. Cada documento
          tiene su código F#### y enlaza a las preguntas que lo citan.
        </p>

        <div className="mt-12 overflow-hidden rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="px-4 py-3 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
                  Código
                </th>
                <th className="px-4 py-3 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
                  Documento
                </th>
                <th className="px-4 py-3 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
                  Páginas
                </th>
                <th className="px-4 py-3 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
                  Estado
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {MOCK_SOURCES.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-4 font-mono text-2xs uppercase tracking-wider text-foreground">
                    {s.externalId}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-display text-foreground tracking-tight">
                      {s.documentName}
                    </div>
                    {s.section ? (
                      <div className="mt-0.5 text-2xs text-muted-foreground">
                        {s.section}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 font-mono text-2xs tabular-nums text-muted-foreground">
                    {s.totalPages ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    {s.requiresVerification ? (
                      <Badge variant="warning">OCR dudoso</Badge>
                    ) : (
                      <Badge variant="success">Verificada</Badge>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/fuentes/${s.externalId.toLowerCase()}`}
                      className="inline-flex items-center gap-1 text-2xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
                    >
                      <FileText className="size-3" strokeWidth={1.5} />
                      Abrir <ArrowUpRight className="size-3" strokeWidth={1.5} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
