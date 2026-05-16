import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type TopicCardProps = {
  code: string;
  slug: string;
  name: string;
  description: string;
  questionCount: number;
  progress: number; // 0..1
  className?: string;
};

export function TopicCard({
  code,
  slug,
  name,
  description,
  questionCount,
  progress,
  className,
}: TopicCardProps) {
  const pct = Math.round(progress * 100);
  return (
    <Link
      href={`/temas/${slug}` as `/temas/${string}`}
      className={cn(
        "group relative block overflow-hidden rounded-md border border-border bg-card p-6 transition-all hover:border-border-strong hover:shadow-md",
        className,
      )}
    >
      <span className="absolute inset-y-0 left-0 w-[3px] bg-primary/30 transition-colors group-hover:bg-primary" />

      <div className="flex items-baseline justify-between">
        <span className="eyebrow text-muted-foreground">
          Tema&nbsp;{code} · <span className="text-foreground/70">{name.split(" ").slice(-2).join(" ").slice(0, 18)}</span>
        </span>
        <span className="font-mono text-2xs tabular-nums text-muted-foreground">
          {Math.round(progress * questionCount)}/{questionCount}
        </span>
      </div>

      <h3 className="display-section mt-4 text-2xl text-foreground">{name}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="mt-6 h-px w-full bg-border">
        <div
          className="h-px bg-primary transition-all"
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-2xs text-muted-foreground">
        <span className="font-mono uppercase tracking-wider">
          {pct}% completado
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-foreground/80 transition-colors group-hover:text-primary">
          Estudiar <ArrowUpRight className="size-3" strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}
