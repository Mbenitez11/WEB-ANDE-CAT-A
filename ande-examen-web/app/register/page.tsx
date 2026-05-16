"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/lib/zod/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      confirmPassword: String(fd.get("confirmPassword")),
    };
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors({
        name: fe.name?.[0] ?? "",
        email: fe.email?.[0] ?? "",
        password: fe.password?.[0] ?? "",
        confirmPassword: fe.confirmPassword?.[0] ?? "",
      });
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body?.error ?? "No se pudo crear la cuenta");
        return;
      }
      const signed = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      if (signed?.error) {
        toast.success("Cuenta creada. Iniciá sesión.");
        router.push("/login");
        return;
      }
      toast.success("¡Bienvenido!");
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <>
      <Topbar />
      <main className="mx-auto flex max-w-md flex-col px-6 pb-24 pt-16 lg:px-10">
        <div className="eyebrow text-muted-foreground">Acceso · alta</div>
        <h1 className="display-section mt-4 text-3xl text-foreground">Crear cuenta</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Tu progreso, preguntas guardadas y conversaciones con el agente quedarán asociados a esta cuenta.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5" noValidate>
          <Field label="Nombre" name="name" type="text" autoComplete="name" error={errors.name} />
          <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
          <Field
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="new-password"
            error={errors.password}
          />
          <Field
            label="Confirmar contraseña"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Creando…" : "Crear cuenta"}
          </Button>
        </form>

        <p className="mt-8 text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Iniciar sesión
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
