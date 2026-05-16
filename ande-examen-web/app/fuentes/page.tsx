import { FileText } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { getSourceDocuments } from "@/lib/data";

export const metadata = { title: "Fuentes" };

const DOC_TYPE_LABEL: Record<string, string> = {
  pdf: "PDF",
  docx: "DOCX",
  image: "Imagen",
  md: "Markdown",
  gdoc: "Google Doc",
  archive: "ZIP/RAR",
  other: "Otro",
};

export default async function FuentesPage() {
  const docs = await getSourceDocuments();
  const ocrTotal = docs.reduce((s, d) => s + d._count.ocrFlags, 0);
  const linkedTotal = docs.reduce((s, d) => s + d._count.sources, 0);

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
          Documentos curados desde la bóveda Obsidian del proyecto. Cada documento tiene su
          código F#### y enlaza a las preguntas que lo citan. Los duplicados se agrupan bajo
          la fuente canónica.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="neutral">{docs.length} documentos canónicos</Badge>
          <Badge variant="info">{linkedTotal} citas indexadas</Badge>
          {ocrTotal > 0 ? <Badge variant="warning">{ocrTotal} flags OCR</Badge> : null}
        </div>

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
                  Tipo
                </th>
                <th className="px-4 py-3 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
                  Páginas
                </th>
                <th className="px-4 py-3 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
                  Estado
                </th>
                <th className="px-4 py-3 font-mono text-2xs uppercase tracking-widest text-muted-foreground text-right">
                  Citas
                </th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => {
                const hasOcrFlags = d._count.ocrFlags > 0;
                const stateText = d.processingState ?? "";
                const isImage = d.documentType === "image";
                return (
                  <tr
                    key={d.id}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-4 font-mono text-2xs uppercase tracking-wider text-foreground">
                      {d.externalId}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                        <span className="font-display text-foreground tracking-tight">
                          {d.name}
                        </span>
                      </div>
                      {d.topicGuess ? (
                        <div className="mt-0.5 text-2xs text-muted-foreground">
                          {d.topicGuess}
                        </div>
                      ) : null}
                      {d._count.duplicates > 0 ? (
                        <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          +{d._count.duplicates} duplicados
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                      {DOC_TYPE_LABEL[d.documentType] ?? d.documentType}
                    </td>
                    <td className="px-4 py-4 font-mono text-2xs tabular-nums text-muted-foreground">
                      {d.totalPages ?? (isImage ? "img" : "—")}
                    </td>
                    <td className="px-4 py-4">
                      {hasOcrFlags ? (
                        <Badge variant="warning">{d._count.ocrFlags} flag(s) OCR</Badge>
                      ) : stateText.includes("OCR") ? (
                        <Badge variant="neutral">OCR aplicado</Badge>
                      ) : (
                        <Badge variant="success">Texto embebido</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-2xs tabular-nums text-muted-foreground">
                      {d._count.sources}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
