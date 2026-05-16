"use client";

import Link from "next/link";
import type { Route } from "next";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function UserMenu() {
  const { data, status } = useSession();

  if (status === "loading") {
    return <div className="size-8 animate-pulse rounded-sm bg-muted" aria-hidden />;
  }

  if (status !== "authenticated") {
    return (
      <>
        <Link
          href="/login"
          className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="hidden h-8 items-center justify-center rounded-sm border border-border-strong bg-card px-3 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
        >
          Crear cuenta
        </Link>
      </>
    );
  }

  const name = data.user?.name ?? data.user?.email ?? "usuario";
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <Link
        href={"/profile" as Route}
        className="hidden items-center gap-2 rounded-sm px-2 py-1 text-sm text-foreground transition-colors hover:bg-muted sm:inline-flex"
        title={`Perfil de ${name}`}
      >
        <span className="flex size-7 items-center justify-center rounded-sm bg-primary/15 font-mono text-xs text-primary">
          {initial}
        </span>
        <span className="hidden md:inline">{name}</span>
        {data.user?.role && data.user.role !== "student" ? (
          <span className="hidden rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:inline">
            {data.user.role}
          </span>
        ) : null}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border-strong bg-card px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title="Cerrar sesión"
      >
        <LogOut className="size-3.5" strokeWidth={1.5} />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </div>
  );
}
