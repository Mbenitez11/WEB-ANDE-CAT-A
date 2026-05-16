import { AlertTriangle, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export type SourceChipProps = {
  externalId: string;
  documentName: string;
  page?: number | null;
  section?: string;
  requiresVerification?: boolean;
  className?: string;
  /** Si true, dibuja el icono de cita a la izquierda. */
  withIcon?: boolean;
  /** Visual emphasis. */
  size?: "sm" | "md";
};

/**
 * SourceChip — la firma visual del proyecto. Cita estilo journal reference.
 * Mono externalId + hairline divider + serif title + page badge + OCR warning.
 */
export function SourceChip({
  externalId,
  documentName,
  page,
  section,
  requiresVerification = false,
  className,
  withIcon = false,
  size = "md",
}: SourceChipProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2.5 rounded-sm border bg-card transition-colors",
        size === "md" ? "px-2.5 py-1 text-2xs" : "px-2 py-0.5 text-[10px]",
        "shadow-xs hover:border-border-strong hover:bg-muted/60",
        requiresVerification
          ? "border-warning/50 bg-warning-subtle/30"
          : "border-border",
        className,
      )}
      title={section ? `${documentName} — ${section}` : documentName}
    >
      {withIcon ? (
        <Quote
          className="size-3 shrink-0 text-muted-foreground"
          strokeWidth={1.5}
        />
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
    </span>
  );
}
