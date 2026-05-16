# WEB ANDE CAT A

Plataforma web de estudio para el examen **ANDE Categoría A** (ingeniería eléctrica /
electromecánica). Reescritura moderna del prototipo `simulacros-ande/`.

- App: [`ande-examen-web/`](ande-examen-web/) — Next.js 15 + Prisma + NextAuth + Vercel AI SDK.
- Reglas para agentes: [AGENTS.md](AGENTS.md)
- Guía para Claude Code: [CLAUDE.md](CLAUDE.md)

## Características

- Estudio por temas, quizzes por tema, simulacro tipo examen, repaso de errores.
- Cada pregunta muestra **fuente exacta** (documento + página + sección + confianza).
- Marca preguntas/fuentes con OCR dudoso como `requiere_verificacion`.
- Registro/login con progreso personal por usuario.
- Agente IA tutor que responde **solo con la base** y cita fuentes (Vercel AI SDK).
- Panel de revisión para `reviewer` / `admin`.

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Prisma 5 · SQLite (dev) ·
NextAuth v5 · Zod · Vercel AI SDK · Vitest.

## Quick start

```bash
cd ande-examen-web
npm install
cp .env.example .env.local        # completar NEXTAUTH_SECRET y AI_API_KEY
npm run prisma:migrate
npm run db:seed
npm run dev
```

App disponible en <http://localhost:3000>.

## Comandos

```bash
npm run dev                  # next dev
npm run typecheck            # tsc --noEmit
npm run lint
npm run prisma:migrate       # prisma migrate dev
npm run prisma:studio        # GUI de la DB
npm run db:seed              # seed inicial
npm run import:obsidian      # importa la wiki desde OBSIDIAN_VAULT_PATH
npm run validate:questions   # valida calidad de preguntas
npm run test                 # vitest
```

## Estado del proyecto

Ver el cuadro de fases en [CLAUDE.md §6](CLAUDE.md#6-cómo-trabajar-por-fases). Fases 1–4
completadas (análisis, arquitectura, schema, frontend con mocks); Fase 5 en curso (backend /
API real + NextAuth).

## Material fuente

Los PDFs, OCR y la wiki Obsidian que alimentan la base de datos viven **fuera** de este
repositorio, en `g:\Mi unidad\FIUNA BROZ\ANDE EXAMEN\`. Esa carpeta es read-only desde la app.

## Licencia

Uso académico personal. No oficial de la ANDE.
