import { redirect } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { ProfileForm } from "@/components/profile/profile-form";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/profile");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
  if (!user) redirect("/login");

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
            👤
          </span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            Cuenta · {user.role}
          </span>
        </div>
        <h1 className="display-headline mt-6 text-4xl text-foreground sm:text-5xl">
          Tu perfil
        </h1>
        <p className="mt-4 max-w-2xl text-md leading-relaxed text-muted-foreground">
          Ajustá tu nombre visible y los datos de estudio. Tu progreso, simulacros y
          conversaciones con el agente quedan vinculados a esta cuenta.
        </p>

        <section className="mt-10 rounded-md border border-border bg-card p-6 lg:p-8">
          <ProfileForm
            initial={{
              name: user.name ?? "",
              email: user.email,
              displayName: user.profile?.displayName ?? "",
              career: user.profile?.career ?? "",
              studyGoal: user.profile?.studyGoal ?? "",
              preferredDifficulty:
                (user.profile?.preferredDifficulty as
                  | "basica"
                  | "media"
                  | "dificil"
                  | "examen") ?? "media",
            }}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
