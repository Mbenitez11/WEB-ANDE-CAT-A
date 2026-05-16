import { AlertTriangle, ExternalLink, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export type SourceChipProps = {
  externalId: string;
  documentName: string;
  page?: number | null;
  section?: string;
  requiresVerification?: boolean;
  /** URL pública del documento original. Si está presente, el chip es un <a>. */
  publicUrl?: string | null;
  className?: string;
  /** Si true, dibuja el icono de cita a la izquierda. */
  withIcon?: boolean;
  /** Visual emphasis. */
  size?: "sm" | "md";
};

/**
 * SourceChip — la firma visual del proyecto. Cita estilo journal reference.
 * Mono externalId + hairline divider + serif title + page badge + OCR warning.
 * Si tiene `publicUrl`, se renderiza como <a> que abre el PDF en pestaña nueva.
 */
export function SourceChip({
  externalId,
  documentName,
  page,
  section,
  requiresVerification = false,
  publicUrl,
  className,
  withIcon = false,
  size = "md",
}: SourceChipProps) {
  const hasLink = !!publicUrl;
  const Tag = hasLink ? "a" : "span";

  const content = (
    <>
      {withIcon ? (
        <Quote className="size-3 shrink-0 text-muted-foreground" strokeWidth={1.5} />
      ) : null}
      <span className="font-mono uppercase tracking-wider text-muted-foreground">
        {externalId}
      </span>
      <span className="h-3 w-px bg-border" aria-hidden />
      <span className="font-display tracking-tight text-foreground/90 truncate">
        {documentName}
      </span>
      {page != null ? (
        <span className="ml-0.5 shrink-0 rounded-xs border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
          p.&nbsp;{page}
        </span>
      ) : null}
      {requiresVerification ? (
        <AlertTriangle
          className="size-3 shrink-0 text-warning"
          strokeWidth={1.5}
          aria-label="Fuente pendiente de verificación OCR"
        />
      ) : null}
      {hasLink ? (
        <ExternalLink
          className="size-3 shrink-0 text-muted-foreground/70 transition-colors group-hover/chip:text-primary"
          strokeWidth={1.5}
          aria-hidden
        />
      ) : null}
    </>
  );

  const className_ = cn(
    "group/chip inline-flex max-w-full items-center gap-2.5 rounded-sm border bg-card transition-colors",
    size === "md" ? "px-2.5 py-1 text-2xs" : "px-2 py-0.5 text-[10px]",
    "shadow-xs",
    hasLink && "hover:border-primary hover:bg-primary/[0.04]",
    !hasLink && "hover:border-border-strong hover:bg-muted/60",
    requiresVerification
      ? "border-warning/50 bg-warning-subtle/30"
      : "border-border",
    className,
  );

  const title = section ? `${documentName} — ${section}` : documentName;

  if (hasLink) {
    return (
      <a
        href={publicUrl!}
        target="_blank"
        rel="noreferrer noopener"
        className={className_}
        title={`${title}\nAbrir en nueva pestaña`}
      >
        {content}
      </a>
    );
  }

  return (
    <span className={className_} title={title}>
      {content}
    </span>
  );
}
