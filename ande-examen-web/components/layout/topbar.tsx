import Link from "next/link";
import type { Route } from "next";
import { Activity, BookOpen, FileText, ListChecks, RotateCcw, Search, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/temas", label: "Temas", icon: BookOpen },
  { href: "/simulacro", label: "Simulacro", icon: ListChecks },
  { href: "/repaso", label: "Repaso", icon: RotateCcw },
  { href: "/fuentes", label: "Fuentes", icon: FileText },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/agente", label: "Agente", icon: Sparkles },
] as const;

export function Topbar({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-8 px-6 lg:px-10">
        <Link
          href="/"
          className="flex items-baseline gap-2 transition-opacity hover:opacity-80"
        >
          <span className="display-section text-md leading-none tracking-tight">
            ande
          </span>
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            examen · cat A
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href as Route}
              className="inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <item.icon className="size-3.5" strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <UserMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
