import type { Metadata } from "next";
import "./globals.css";
import { fontDisplay, fontMono, fontSans } from "./fonts";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "ANDE Examen · Categoría A",
    template: "%s · ANDE Examen",
  },
  description:
    "Plataforma de preparación para el examen ANDE Categoría A. Quizzes, simulacros, agente IA y fuentes normativas trazables.",
  applicationName: "ANDE Examen",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <Providers>
          {children}
          <Toaster position="top-right" theme="system" richColors />
        </Providers>
      </body>
    </html>
  );
}
