import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Strip amber con leyenda. Se ubica arriba de cualquier elemento cuyo dato
 * provenga de OCR dudoso o de una fuente sin verificar.
 */
export function OcrWarning({
  label = "Fuente pendiente de verificación OCR",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-t-2 border-warning bg-warning-subtle/30 px-4 py-2",
        className,
      )}
    >
      <AlertTriangle className="size-3.5 text-warning" strokeWidth={1.5} />
      <span className="font-mono text-2xs uppercase tracking-widest text-warning-foreground/90 dark:text-warning">
        {label}
      </span>
    </div>
  );
}
