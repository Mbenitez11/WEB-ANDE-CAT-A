"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/lib/zod/auth";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/dashboard";
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const data = { email: String(fd.get("email")), password: String(fd.get("password")) };
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors({ email: fe.email?.[0] ?? "", password: fe.password?.[0] ?? "" });
      return;
    }
    startTransition(async () => {
      const res = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("El correo o la contraseña no son correctos.");
        return;
      }
      toast.success("Sesión iniciada");
      router.push(callbackUrl as Route);
      router.refresh();
    });
  }

  return (
    <>
      <Topbar />
      <main className="mx-auto flex max-w-md flex-col px-6 pb-24 pt-16 lg:px-10">
        <div className="eyebrow text-muted-foreground">Acceso · usuarios</div>
        <h1 className="display-section mt-4 text-3xl text-foreground">Iniciar sesión</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ingresá con tu cuenta para guardar progreso, simulacros y conversaciones con el agente.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5" noValidate>
          <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
          <Field
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="current-password"
            error={errors.password}
          />
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="mt-8 text-sm text-muted-foreground">
          ¿Sin cuenta?{" "}
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            Crear una
          </Link>
        </p>
      </main>
    </>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block font-mono text-2xs uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="mt-2 h-10 w-full rounded-sm border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
