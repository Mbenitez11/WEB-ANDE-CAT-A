"use client";

import * as React from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Difficulty = "basica" | "media" | "dificil" | "examen";

type Initial = {
  name: string;
  email: string;
  displayName: string;
  career: string;
  studyGoal: string;
  preferredDifficulty: Difficulty;
};

export function ProfileForm({ initial }: { initial: Initial }) {
  const [pending, setPending] = React.useState(false);
  const [state, setState] = React.useState({
    name: initial.name,
    displayName: initial.displayName,
    career: initial.career,
    studyGoal: initial.studyGoal,
    preferredDifficulty: initial.preferredDifficulty,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name.trim() || undefined,
          profile: {
            displayName: state.displayName.trim() || null,
            career: state.career.trim() || null,
            studyGoal: state.studyGoal.trim() || null,
            preferredDifficulty: state.preferredDifficulty,
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body?.error ?? "No se pudo guardar el perfil");
        return;
      }
      toast.success("Perfil actualizado");
    } catch {
      toast.error("Error de red");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre">
          <input
            type="text"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Email" hint="No editable por ahora">
          <input
            type="email"
            value={initial.email}
            disabled
            className="input disabled:cursor-not-allowed disabled:opacity-60"
          />
        </Field>
      </div>

      <Field label="Nombre visible">
        <input
          type="text"
          value={state.displayName}
          onChange={(e) => setState({ ...state, displayName: e.target.value })}
          placeholder="Cómo querés que te mencionen en la app"
          className="input"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Carrera / formación">
          <input
            type="text"
            value={state.career}
            onChange={(e) => setState({ ...state, career: e.target.value })}
            placeholder="ej. Ing. Electromecánica"
            className="input"
          />
        </Field>
        <Field label="Dificultad preferida">
          <select
            value={state.preferredDifficulty}
            onChange={(e) =>
              setState({ ...state, preferredDifficulty: e.target.value as Difficulty })
            }
            className="input"
          >
            <option value="basica">Básica</option>
            <option value="media">Media</option>
            <option value="dificil">Difícil</option>
            <option value="examen">Examen</option>
          </select>
        </Field>
      </div>

      <Field label="Objetivo de estudio">
        <textarea
          value={state.studyGoal}
          onChange={(e) => setState({ ...state, studyGoal: e.target.value })}
          placeholder="ej. Aprobar el examen ANDE Cat A en agosto."
          rows={3}
          className="input resize-y"
        />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} size="lg">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Guardando…
            </>
          ) : (
            <>
              <Save className="size-4" /> Guardar cambios
            </>
          )}
        </Button>
      </div>

      <style>{`
        .input {
          height: 2.5rem;
          width: 100%;
          border-radius: 4px;
          border: 1px solid var(--border);
          background: var(--card);
          padding: 0 0.75rem;
          font-size: 0.875rem;
          color: var(--foreground);
        }
        textarea.input { height: auto; padding: 0.5rem 0.75rem; }
        .input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block font-mono text-2xs uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-1 text-2xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
