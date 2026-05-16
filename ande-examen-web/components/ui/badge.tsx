import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge — usa el patrón "hairline border + accent left bar" en vez de fill macizo.
 * Mantiene la superficie calma y deja el color como señal.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border bg-card px-2 py-0.5 font-mono text-2xs uppercase tracking-widest text-foreground/85 rounded-xs border-l-2",
  {
    variants: {
      variant: {
        neutral: "border-border border-l-border-strong",
        primary: "border-border border-l-primary text-primary",
        success: "border-border border-l-success text-success",
        warning: "border-border border-l-warning text-warning-foreground",
        destructive: "border-border border-l-destructive text-destructive",
        info: "border-border border-l-info text-info",
        muted: "border-border border-l-muted-foreground text-muted-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
