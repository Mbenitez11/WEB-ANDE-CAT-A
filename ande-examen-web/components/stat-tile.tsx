import { cn } from "@/lib/utils";

type StatTileProps = {
  label: string;
  value: React.ReactNode;
  suffix?: React.ReactNode;
  hint?: React.ReactNode;
  intent?: "neutral" | "success" | "warning" | "destructive" | "primary";
  className?: string;
};

const intentText = {
  neutral: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  primary: "text-primary",
} as const;

export function StatTile({
  label,
  value,
  suffix,
  hint,
  intent = "neutral",
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "border border-border bg-card p-6 transition-colors hover:border-border-strong",
        className,
      )}
    >
      <span className="eyebrow text-muted-foreground">{label}</span>
      <div className="mt-4 flex items-baseline gap-1.5 font-display tracking-tightest leading-none text-foreground"
           style={{ fontVariationSettings: '"opsz" 60, "SOFT" 20, "wght" 400' }}>
        <span className="text-5xl tabular-nums">{value}</span>
        {suffix ? (
          <span className="text-2xl text-muted-foreground tabular-nums">
            {suffix}
          </span>
        ) : null}
      </div>
      <div className="mt-4 h-px bg-border" />
      {hint ? (
        <span className={cn("mt-2 block text-2xs", intentText[intent])}>
          {hint}
        </span>
      ) : (
        <span className="mt-2 block h-3" />
      )}
    </div>
  );
}
