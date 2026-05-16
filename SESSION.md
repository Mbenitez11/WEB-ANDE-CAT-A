# SESSION.md — Estado para retomar el proyecto

> **Cómo usar este archivo**: cuando arranques una sesión nueva, abrí Claude Code en este repo y
> decile *"leé SESSION.md y seguimos por donde quedamos"*. Este archivo se mantiene actualizado al
> cerrar cada fase.

Última actualización: **2026-05-16** · Sesión cerrada al final de **Fase 5**.

---

## 1. Identidad rápida

- **Proyecto:** `WEB ANDE CAT A` — plataforma de estudio para examen ANDE Categoría A.
- **Repo GitHub:** <https://github.com/Mbenitez11/WEB-ANDE-CAT-A>
- **Carpeta repo (local):** `c:\Users\Mathias\Documents\GitHub\ANDE WEB`
- **Carpeta app:** `c:\Users\Mathias\Documents\GitHub\ANDE WEB\ande-examen-web`
- **Material fuente (READ-ONLY, FUERA del repo):** `g:\Mi unidad\FIUNA BROZ\ANDE EXAMEN`
  - Wiki Obsidian: `g:\Mi unidad\FIUNA BROZ\ANDE EXAMEN\Agente codex\Database\Obsidian\ANDE CAT A`
  - DB procesada: `g:\Mi unidad\FIUNA BROZ\ANDE EXAMEN\Agente codex\Database`

---

## 2. Stack confirmado

Next.js 15.1 · React 19 · TypeScript (`strict`) · Tailwind v4 beta · shadcn/ui · Prisma 5 +
SQLite · NextAuth v5 beta (`5.0.0-beta.25`) · Zod · Vercel AI SDK (no instalado todavía) ·
Vitest · `tsx` para scripts. **`typedRoutes: true`** en `next.config.ts`.

⚠ **Next 15.1.0 tiene CVE-2025-66478.** Actualizar antes de desplegar:
`npm i next@latest`.

---

## 3. Mapa de fases (estado actual)

| Fase | Tema                              | Estado          |
|------|-----------------------------------|-----------------|
| 1    | Análisis del proyecto             | ✅ hecho        |
| 2    | Arquitectura propuesta            | ✅ hecho        |
| 3    | Modelo Prisma                     | ✅ hecho        |
| 4    | Frontend con mocks                | ✅ hecho        |
| 5    | Backend / API + NextAuth          | ✅ hecho (2026-05-16) |
| 6    | Motor de quizzes — UI conectada   | 🔜 **siguiente** |
| 7    | Importador Obsidian               | 🔜 **siguiente** (decisión pendiente: cuál arrancar primero) |
| 8    | Generador/validador de preguntas  | pendiente       |
| 9–10 | Diseño avanzado + dashboard real  | pendiente       |
| 11   | Buscador de conocimiento          | pendiente       |
| 12   | Modo examen avanzado              | pendiente       |
| 13   | Roles avanzados / perfil          | parcial         |
| 14   | Agente IA (Vercel AI SDK)         | pendiente       |
| 15   | Panel admin de revisión           | pendiente       |
| 20   | Scripts de validación             | pendiente       |
| 21   | Tests                             | pendiente       |
| 22–23| Docs + despliegue                 | pendiente       |

---

## 4. Lo último que se hizo (Fase 5 — auth + API)

### Archivos nuevos / clave

- [`auth.ts`](ande-examen-web/auth.ts) — NextAuth v5 (Credentials + JWT). `session.user.role` tipado como `student | reviewer | admin`.
- [`middleware.ts`](ande-examen-web/middleware.ts) — protege `/dashboard /quiz /simulacro /repaso /agente /profile /settings`. Redirige logueados fuera de `/login /register`. `/admin/*` exige rol `admin` o `reviewer`.
- [`components/providers.tsx`](ande-examen-web/components/providers.tsx) — `SessionProvider` + `ThemeProvider` montados en `app/layout.tsx`. `Toaster` (sonner) global.
- [`components/layout/user-menu.tsx`](ande-examen-web/components/layout/user-menu.tsx) — avatar/rol/salir.
- [`lib/zod/auth.ts`](ande-examen-web/lib/zod/auth.ts), [`lib/zod/quiz.ts`](ande-examen-web/lib/zod/quiz.ts) — schemas de validación.
- [`lib/quiz-engine.ts`](ande-examen-web/lib/quiz-engine.ts) — `selectQuestionsForAttempt(userId, input)`, `shouldShowSourcesDuringAttempt(mode)`. Maneja modo `repaso` (errores+saved) y filtra `requiresVerification:true` salvo opt-in.

### Endpoints API ya creados

| Ruta | Método | Auth | Qué hace |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | — | handlers NextAuth |
| `/api/auth/register` | POST | público | crea User + UserProfile, hash bcrypt(10) |
| `/api/me` | GET, PATCH | sesión | datos propios y edición de perfil |
| `/api/topics` | GET | público | lista temas (orderBy `order` asc) con `_count` |
| `/api/topics/[slug]` | GET | público | un tema |
| `/api/questions` | GET | público | filtros: `?topic=&difficulty=&status=&includeUnverified=&limit=` |
| `/api/questions/[id]` | GET | público | una pregunta con options + sources |
| `/api/sources` | GET | público | filtra `?document=F0018` |
| `/api/sources/[id]` | GET | público | una fuente + preguntas asociadas |
| `/api/quiz/start` | POST | sesión | crea `QuizAttempt`, devuelve preguntas |
| `/api/quiz/answer` | POST | sesión | guarda `QuizAnswer`, calcula `isCorrect` |
| `/api/quiz/finish` | POST | sesión | cierra intento, recalcula `UserTopicProgress` |
| `/api/quiz/attempts` | GET | sesión | historial (30 últimos) |
| `/api/quiz/review/[attemptId]` | GET | sesión | revisión completa post-intento |
| `/api/quiz/save-question` | GET, POST | sesión | guardar/listar preguntas marcadas |
| `/api/quiz/save-question/[id]` | DELETE | sesión | quitar guardado |
| `/api/progress` | GET | sesión | resumen + temas débiles/fuertes (>=5 respuestas) |

### Base de datos

- `dev.db` creado con `npx prisma migrate dev --name init`. Migración: `prisma/migrations/20260516054957_init/`.
- Seeded con `npm run db:seed`:
  - **6 temas raíz** (`reglamento-baja-tension`, `reglamento-media-tension`, `pliego-tarifas`, `norma-paraguaya-np-2028`, `laboratorio-taa`, `saee`).
  - **Admin de dev**: `admin@ande.local` / `admin1234`.
- ⚠ No hay preguntas todavía. El frontend de quiz sigue usando `lib/mock-data.ts` hasta que corra el importador.

### Git

- Branch: `main`. Último commit pusheado: hash `499f8d7` ("Fase 5: backend/API + NextAuth credentials").
- `.env` creado localmente (NO commiteado). `AUTH_SECRET` ya está generado.
- `dev.db` está en `.gitignore` — cada dev corre `prisma migrate dev` + `db:seed` localmente.

### Estado del typecheck

`npm run typecheck` pasa limpio al cierre de la sesión.

---

## 5. Decisión pendiente al retomar

El frontend ya tiene UI de quiz/temas con mocks, pero la DB todavía no tiene preguntas. Hay dos
caminos razonables:

### Opción A — Fase 7 primero (importador Obsidian) **[recomendado]**
Llenar la DB con preguntas/chunks/fuentes reales desde la wiki antes de conectar el frontend.
- Crear `ande-examen-web/scripts/import-obsidian.ts` que lea `OBSIDIAN_VAULT_PATH`.
- Usar `gray-matter` para Markdown (ya está instalado).
- Reglas duras: idempotente, sin inventar páginas, marcar `requiresVerification:true` si no hay
  página, persistir contradicciones detectadas, NO eliminar nada.
- Cuando termine, hacer reset/seed + reimport: `npm run prisma:reset && npm run db:seed && npm run import:obsidian`.

### Opción B — Conectar frontend a la API primero (Fase 6 parcial)
Reemplazar mocks en `/temas` por fetch a `/api/topics` (los 6 temas seed). Útil para ver que
el cableado funciona, pero `/quiz/[topic]` seguirá mostrando vacío hasta que haya preguntas.

**Mi sugerencia para la próxima sesión:** Opción A.

---

## 6. Cómo retomar (comandos)

```powershell
cd "C:\Users\Mathias\Documents\GitHub\ANDE WEB\ande-examen-web"

# Sanity check
git pull
npm install                      # por si cambió package.json en otra máquina
npm run typecheck

# DB
npx prisma migrate dev           # aplica migraciones nuevas si hay
npm run db:seed                  # idempotente

# Dev server
npm run dev                      # http://localhost:3000

# Login con el admin sembrado
# admin@ande.local / admin1234
```

---

## 7. Reglas duras vigentes (resumen, ver CLAUDE.md y AGENTS.md)

1. **No inventar normativa, páginas, artículos ni citas.**
2. **Toda pregunta lleva fuente** o entra como `borrador`.
3. **OCR dudoso** → `requiresVerification: true` + badge ⚠ visible. Excluido de simulacro por defecto.
4. **Contradicciones** se modelan, no se resuelven sin permiso.
5. **Preguntas generadas por IA** entran como `status: borrador`.
6. **Nunca exponer `passwordHash`**, ni en logs ni en responses.
7. **No tocar archivos en `g:\…\ANDE EXAMEN\`** salvo lectura.
8. **No borrar** `dev.db`, migraciones, `data/imported/` sin permiso explícito.
9. **Trabajar por fases**, confirmar al cerrar cada una.

---

## 8. Notas técnicas que conviene recordar

- **Credentials + Prisma adapter** = obligatorio JWT strategy (no database sessions). Ya está así.
- En `auth.ts`, las JWT augmentations vía `declare module "next-auth/jwt"` fallaban porque
  next-auth v5 beta exporta el módulo distinto. Se resolvió con cast `as Record<string, unknown>`
  dentro de los callbacks. Si actualizamos next-auth a stable y rompe, ahí mirar primero.
- `typedRoutes: true` obliga a castear strings dinámicos a `Route`: `router.push(callbackUrl as Route)`.
- `next.config.ts` tiene `serverExternalPackages: ["@prisma/client", "bcryptjs"]` — no tocar.
- Schema Prisma usa `String` en lugar de enums (SQLite no soporta enums). Validación con Zod.
- `String[]` se simula como CSV en SQLite — está documentado en el comment del schema.
- `Embedding.vector` está como `Bytes` (Float32Array serializado). Si pasamos a Postgres,
  migrar a `pgvector` (ya está pensado).
