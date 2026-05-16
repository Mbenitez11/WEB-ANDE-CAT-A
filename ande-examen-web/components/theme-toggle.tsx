"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const current = mounted ? resolvedTheme ?? theme : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      aria-label="Cambiar tema"
      className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-card text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
    >
      <Sun className="size-3.5 dark:hidden" strokeWidth={1.5} />
      <Moon className="hidden size-3.5 dark:block" strokeWidth={1.5} />
    </button>
  );
}
