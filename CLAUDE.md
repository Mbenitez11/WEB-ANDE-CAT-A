# CLAUDE.md — Guía para Claude Code en `ANDE WEB`

Este archivo describe el proyecto y las reglas que **Claude debe seguir** al trabajar dentro de
`c:\Users\Mathias\Documents\GitHub\ANDE WEB`.

> Para reglas orientadas a otros agentes (Codex, agentes locales, scripts), ver [AGENTS.md](./AGENTS.md).

---

## 1. Qué es este proyecto

**WEB ANDE CAT A** — Plataforma web de estudio para el examen **ANDE Categoría A** (ingeniería
eléctrica / electromecánica). Es una reescritura moderna del prototipo `simulacros-ande/`.

- Repositorio GitHub: <https://github.com/Mbenitez11/WEB-ANDE-CAT-A>
- Carpeta de la app: [ande-examen-web/](ande-examen-web/)
- Proyecto fuente de datos (NO está en este repo, vive aparte):
  `g:\Mi unidad\FIUNA BROZ\ANDE EXAMEN\` — contiene PDFs, OCR, la wiki Obsidian
  (`Database/Obsidian/ANDE CAT A/`) y la base procesada por `Agente codex/`.

### Objetivos funcionales

1. Estudio por temas, quizzes por tema, simulacro tipo examen, repaso de errores.
2. Cada pregunta muestra **fuente exacta** (documento + página + sección + confianza).
3. Registro/login de usuarios con progreso personal.
4. Agente IA tutor (Vercel AI SDK) que responde **solo con la base** y cita fuentes.
5. Panel de revisión para `reviewer`/`admin`.

---

## 2. Stack

| Capa            | Tecnología                                                            |
|-----------------|-----------------------------------------------------------------------|
| Framework       | Next.js 15 (App Router) + React 19 + TypeScript                       |
| Estilos         | Tailwind v4 (beta) + shadcn/ui (Radix) + lucide-react + motion        |
| Base de datos   | Prisma 5 + SQLite (dev) → preparado para PostgreSQL en prod           |
| Auth            | NextAuth (Auth.js v5 beta) — credenciales locales; OAuth preparado    |
| Validación      | Zod                                                                   |
| IA              | Vercel AI SDK (`ai`) — streaming + tool calling + RAG simple          |
| Importación     | `gray-matter` para Markdown Obsidian                                  |
| Tests           | Vitest                                                                |
| Runtime scripts | `tsx`                                                                 |

---

## 3. Estructura

```
ANDE WEB/
├── CLAUDE.md                        ← este archivo
├── AGENTS.md                        ← reglas para agentes (lo que ven Codex/etc.)
├── README.md                        ← README público del repo
└── ande-examen-web/                 ← la app Next.js
    ├── app/                         ← rutas (App Router)
    │   ├── api/                     ← endpoints (a crear en Fase 5)
    │   ├── dashboard/ login/ register/ quiz/ simulacro/ temas/ fuentes/ repaso/ agente/
    │   └── layout.tsx page.tsx
    ├── components/
    │   ├── ui/                      ← shadcn primitives
    │   ├── layout/                  ← topbar, footer
    │   ├── question-card.tsx  source-chip.tsx  ocr-warning.tsx  topic-card.tsx  stat-tile.tsx
    │   └── theme-provider.tsx  theme-toggle.tsx
    ├── lib/
    │   ├── db.ts utils.ts mock-data.ts
    │   └── (pendiente: auth.ts quiz-engine.ts ai/* importers/*)
    ├── prisma/
    │   ├── schema.prisma            ← modelo completo (User/Topic/Question/Source/KnowledgeChunk/AI…)
    │   └── seed.ts
    ├── data/seed/                   ← JSON/MD para sembrar dev
    └── scripts/                     ← (a crear: import-obsidian, validate-*, generate-embeddings)
```

---

## 4. Reglas duras (no negociables)

Estas reglas vienen del prompt fundacional del proyecto. Romperlas degrada la utilidad de la app.

1. **Nunca inventes normativa, páginas, artículos, citas o cifras.** Si no hay fuente, marcá la
   pregunta/respuesta como `requires_verificacion` y la fuente con `requiresVerification: true`.
2. **Toda pregunta debe tener fuente** cuando sea posible. Si no, queda en estado `borrador`.
3. **Fuentes con OCR dudoso** llevan badge ⚠ visible y `requiresVerification: true`. No las uses
   como fuente definitiva ni en modo `simulacro` por defecto.
4. **Contradicciones normativas** se modelan como tales (`Contradiction`); no elegir "ganador" sin
   evidencia explícita. Mostrar advertencia al usuario.
5. **El agente IA no es autoridad.** Cuando no haya evidencia en la base, debe responder
   literalmente: *"No encontré una fuente suficiente en la base para confirmarlo"*.
6. **Preguntas generadas por IA** entran como `status: borrador` hasta validación por `reviewer`.
7. **Nunca exponer `passwordHash`** en responses, logs ni en `select` por defecto.
8. **No subir secretos.** `.env*` está en `.gitignore`. Sólo `.env.example` se versiona.
9. **No eliminar archivos del usuario** sin pedir confirmación explícita. La base de datos `dev.db`,
   los `data/imported/` y cualquier seed con datos reales son intocables sin permiso.
10. **No tocar el material fuente en `g:\…\ANDE EXAMEN\`** salvo lectura. Esa carpeta es el "raw"
    y vive fuera de este repo.

---

## 5. Convenciones de código

- **TypeScript estricto.** Nada de `any` salvo en bordes muy puntuales con comentario `// reason:`.
- **Validar en bordes** con Zod (request bodies, query params, importadores). Confiar en tipos
  internos.
- **Schemas Prisma** ya están definidos (ver [prisma/schema.prisma](ande-examen-web/prisma/schema.prisma)).
  Cualquier cambio de modelo va por migración (`pnpm prisma migrate dev --name <nombre>`), nunca
  editando `dev.db` a mano.
- **Enums** se modelan como `String` + validación Zod (SQLite no soporta enums). Valores aceptados
  están documentados en los comentarios del schema.
- **Componentes**: usar shadcn/ui antes que escribir primitivas. Si falta una primitiva, generarla
  vía CLI shadcn, no copiarla a mano.
- **No agregar comentarios** que repitan el código. Comentar solo el *por qué* no-obvio.
- **No crear archivos `.md` nuevos** salvo que el usuario lo pida o sea uno de los archivos
  fundacionales (este, AGENTS.md, README.md).

---

## 6. Cómo trabajar por fases

El proyecto avanza en fases ordenadas (ver el prompt original guardado por el usuario). Estado al
**2026-05-16**:

| Fase | Tema                                | Estado       |
|------|-------------------------------------|--------------|
| 1    | Análisis del proyecto existente     | ✅ hecho     |
| 2    | Arquitectura propuesta              | ✅ hecho     |
| 3    | Modelo de datos Prisma              | ✅ hecho     |
| 4    | Frontend con mocks                  | ✅ hecho     |
| 5    | Backend / API + NextAuth real       | 🔜 siguiente |
| 6    | Motor de quizzes                    | pendiente    |
| 7    | Importador Obsidian                 | pendiente    |
| 8    | Generador/validador de preguntas    | pendiente    |
| 9–10 | Diseño avanzado + dashboard         | pendiente    |
| 11   | Buscador de conocimiento            | pendiente    |
| 12   | Modo examen avanzado                | pendiente    |
| 13   | Registro/login/roles                | parcial (UI) |
| 14   | Agente IA (Vercel AI SDK)           | pendiente    |
| 15   | Panel de revisión admin             | pendiente    |
| 20   | Scripts de validación               | pendiente    |
| 21   | Tests                               | pendiente    |
| 22–23| Docs + despliegue                   | pendiente    |

**Regla**: no saltar fases sin avisar al usuario. Cuando termines una, resumí qué cambió y proponé
arrancar la siguiente.

---

## 7. Comandos frecuentes

Desde `ande-examen-web/`:

```bash
npm run dev                 # next dev
npm run typecheck
npm run lint
npm run prisma:migrate      # prisma migrate dev
npm run db:seed
npm run import:obsidian     # lee g:\…\ANDE EXAMEN\Database\Obsidian
npm run validate:questions
npm run test
```

Para apuntar a la base de datos de desarrollo, `DATABASE_URL="file:./dev.db"` en `.env`.

---

## 8. Variables de entorno

Ver [ande-examen-web/.env.example](ande-examen-web/.env.example) para la lista completa. Mínimo:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
AI_PROVIDER="anthropic"        # o "openai" / "google"
AI_API_KEY=""
OBSIDIAN_VAULT_PATH="g:/Mi unidad/FIUNA BROZ/ANDE EXAMEN/agente codex/Database/Obsidian/ANDE CAT A"
```

---

## 9. Cuándo preguntar al usuario

- Antes de **borrar** archivos, migraciones o resetear `dev.db`.
- Antes de elegir **proveedor de IA** o cambiar el modelo por defecto.
- Antes de **commitear/pushear** a `main` algo que no fue pedido.
- Cuando el importador encuentre **>20% de chunks sin fuente** — puede indicar un cambio de
  estructura en la wiki.
- Cuando una pregunta del usuario sea **ambigua** (ej. "mejorá el dashboard" sin objetivo claro):
  ofrecer 2-3 caminos cortos.

Para todo lo demás (typos, refactors triviales, ajustes de UI dentro de la página que estás
tocando), avanzar sin preguntar.
