import { ExternalLink, FileText } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { getSourceDocuments } from "@/lib/data";
import { ANDE_MESA_EXAMINADORA } from "@/scripts/lib/source-urls";

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
          Documentos curados desde la bóveda Obsidian del proyecto. Los archivos oficiales
          (reglamentos, pliego, normas, decretos) linkean a la{" "}
          <a
            href={ANDE_MESA_EXAMINADORA}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 underline-offset-4 hover:text-foreground hover:underline"
          >
            Mesa Examinadora de la ANDE
            <ExternalLink className="size-3" strokeWidth={1.5} />
          </a>
          . Cada documento tiene su código F#### y los duplicados se agrupan bajo la fuente
          canónica.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="neutral">{docs.length} documentos canónicos</Badge>
          <Badge variant="info">{linkedTotal} citas indexadas</Badge>
          <Badge variant="success">
            {docs.filter((d) => d.publicUrl).length} con link oficial
          </Badge>
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
                <th className="px-4 py-3 font-mono text-2xs uppercase tracking-widest text-muted-foreground text-right">
                  Link
                </th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => {
                const hasOcrFlags = d._count.ocrFlags > 0;
                const stateText = d.processingState ?? "";
                const isImage = d.documentType === "image";
                const nameContent = (
                  <div className="flex items-center gap-2">
                    <FileText className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                    <span className="font-display text-foreground tracking-tight">
                      {d.name}
                    </span>
                    {d.publicUrl ? (
                      <ExternalLink
                        className="size-3 shrink-0 text-muted-foreground/60"
                        strokeWidth={1.5}
                      />
                    ) : null}
                  </div>
                );
                return (
                  <tr
                    key={d.id}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-4 font-mono text-2xs uppercase tracking-wider text-foreground">
                      {d.externalId}
                    </td>
                    <td className="px-4 py-4">
                      {d.publicUrl ? (
                        <a
                          href={d.publicUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="block hover:text-primary"
                        >
                          {nameContent}
                        </a>
                      ) : (
                        nameContent
                      )}
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
                    <td className="px-4 py-4 text-right">
                      {d.publicUrl ? (
                        <a
                          href={d.publicUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-2xs font-medium uppercase tracking-wider text-primary hover:text-primary-hover"
                        >
                          PDF <ExternalLink className="size-3" strokeWidth={1.5} />
                        </a>
                      ) : (
                        <span className="font-mono text-2xs text-muted-foreground/50">—</span>
                      )}
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
