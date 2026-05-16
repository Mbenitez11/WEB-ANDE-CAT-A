import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <>
      <Topbar />
      <main className="mx-auto flex max-w-md flex-col px-6 pb-24 pt-16 lg:px-10">
        <div className="eyebrow text-muted-foreground">Acceso · usuarios</div>
        <h1 className="display-section mt-4 text-3xl text-foreground">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          La autenticación real se conecta en FASE 13 (Auth.js v5 + credenciales).
          Esta pantalla muestra los campos definitivos.
        </p>

        <form className="mt-10 space-y-5">
          <Field label="Email" type="email" autoComplete="email" />
          <Field label="Contraseña" type="password" autoComplete="current-password" />
          <Button type="button" size="lg" className="w-full">
            Entrar
          </Button>
        </form>

        <p className="mt-8 text-sm text-muted-foreground">
          ¿Sin cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Crear una
          </Link>
        </p>
      </main>
    </>
  );
}

function Field({
  label,
  type,
  autoComplete,
}: {
  label: string;
  type: string;
  autoComplete?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-mono text-2xs uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        className="mt-2 h-10 w-full rounded-sm border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
