import type { Metadata } from "next";
import "./globals.css";
import { fontDisplay, fontMono, fontSans } from "./fonts";
import { ThemeProvider } from "@/components/theme-provider";

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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
