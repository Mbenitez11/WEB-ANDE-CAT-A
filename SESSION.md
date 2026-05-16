# SESSION.md — Estado para retomar el proyecto

> **Cómo usar este archivo**: cuando arranques una sesión nueva, abrí Claude Code en este repo y
> decile *"leé SESSION.md y seguimos por donde quedamos"*. Este archivo se mantiene actualizado al
> cerrar cada fase.

Última actualización: **2026-05-16** · Sesión cerrada al final de **Fase 8** (validadores).

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
| 6    | Motor de quizzes — UI conectada   | ✅ hecho (2026-05-16) |
| 7    | Importador Obsidian               | ✅ hecho (2026-05-16) |
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

## 4. Lo último que se hizo (Fase 8 — validadores de calidad)

Tres scripts para auditar la calidad de la DB sin hacer cambios — útiles antes de un
release o después de cada `import:obsidian`.

### Scripts nuevos

- [`scripts/lib/validate.ts`](ande-examen-web/scripts/lib/validate.ts) — `ValidationReport` con `error/warn/info`, agrupa por categoría e imprime un dashboard. Exit code 1 si hay errores.
- [`scripts/validate-questions.ts`](ande-examen-web/scripts/validate-questions.ts) — chequea: sin tema, sin opciones, sin opción correcta (salvo borrador), múltiples correctas, opciones repetidas, sin explicación, sin fuente, fuentes sin página, IA pendiente de revisión, duplicados por statement normalizado.
- [`scripts/validate-sources.ts`](ande-examen-web/scripts/validate-sources.ts) — chequea: grupos de duplicados sin canónica única, documentos con error de procesamiento, sin sha256, sin uso, Sources sin página ni sección, OCR flags con confidence < 0.5.
- [`scripts/validate-knowledge.ts`](ande-examen-web/scripts/validate-knowledge.ts) — stub para `KnowledgeChunk` (aún vacío) + valida contradicciones existentes.

### Resultado del primer run en la DB actual

```
validate:questions
  errors    1   ← TAA-006 sin fuente asociada (caso real de la wiki)
  warnings  2   ← SAEE-015 opciones repetidas, SAEE-010 sin explicación
  info     83   ← 79 "fuentes sin página" (esperable) + 4 borrador

validate:sources
  errors    0
  warnings  1   ← OCR flags con confidence < 0.5
  info     68   ← documentos no citados todavía (la mayoría son TAACATA fotos)

validate:knowledge
  info      1   ← KnowledgeChunk vacío (esperable hasta Fase 14)
```

### Reglas codificadas

- `borrador` no falla por "sin opción correcta" — es justamente lo que define el status.
- `requiere_verificacion` SÍ falla si no tiene fuente (la pregunta promete una cita).
- `requiresVerification` a nivel `Question` ya cubre "todas las fuentes dudosas"; el validador no duplica el warning.
- `confidence < 0.5` sin `requiresVerification:true` es bug (inconsistencia interna).
- Duplicados por statement normalizado: warning (a veces son variantes legítimas, requieren ojo humano).

---

## 4-bis. Lo hecho en Fase 6 (UI conectada al backend)

Reemplazo total de `lib/mock-data.ts` (queda en el repo por compatibilidad temporal, pero ya
ningún page lo importa). Todas las páginas son Server Components que leen de Prisma directo
vía [`lib/data.ts`](ande-examen-web/lib/data.ts); el quiz es un Client Component que llama
a los endpoints REST.

### Páginas conectadas

| Ruta | Renderizado | Fuente de datos |
|---|---|---|
| `/temas` | Server | `getTopicsWithStats(userId?)` |
| `/temas/[slug]` | Server | `getTopicBySlug` + `getQuestionsForTopic` |
| `/quiz/[topic]` | Server + Client `QuizRunner` | `selectQuestionsForAttempt` + crea `QuizAttempt` |
| `/quiz/resultado/[attemptId]` | Server | review completo del intento |
| `/simulacro` | Server + Client `SimulacroForm` | config form → `POST /api/quiz/start` |
| `/simulacro/[attemptId]` | Server + `QuizRunner` modo simulacro | sin feedback inmediato |
| `/repaso` | Server | wrong answers + saved questions |
| `/repaso/sesion` | Server + `QuizRunner` modo repaso | `selectQuestionsForAttempt({mode:"repaso"})` |
| `/dashboard` | Server | `getUserProgress` + temas débiles + historial |
| `/fuentes` | Server | `getSourceDocuments` (99 documentos canónicos) |

### Componentes nuevos

- [`components/quiz/quiz-runner.tsx`](ande-examen-web/components/quiz/quiz-runner.tsx) — Client component que orquesta el flujo: muestra pregunta, captura selección, `POST /api/quiz/answer`, en modo no-simulacro carga `/api/questions/[id]` para revelar la respuesta correcta + explicación + fuentes, avanza a la siguiente o finaliza con `/api/quiz/finish`. Maneja stats en vivo (correct/wrong) y barra de progreso.
- [`components/quiz/simulacro-form.tsx`](ande-examen-web/components/quiz/simulacro-form.tsx) — Form de configuración (cantidad, temas, includeUnverified) que llama a `/api/quiz/start` y redirige a `/simulacro/[attemptId]`.

### Helpers nuevos

- [`lib/data.ts`](ande-examen-web/lib/data.ts) — accesores server-side a la DB para que los Server Components compongan sus datos sin doble round-trip por la API.
  - `getTopicsWithStats(userId?)` — temas con `questionCount` y `progress` (0..1) si hay usuario
  - `getTopicBySlug`, `getQuestionsForTopic`
  - `getSourceDocuments` (filtra duplicados)
  - `getUserProgress` — resumen + temas débiles/fuertes + últimos intentos
  - `toSourceChips(rels)` — adapta el shape de Prisma al de `<SourceChip>`

### Reglas de UX aplicadas

- **Modo `practica`/`tema`/`repaso`**: feedback inmediato. Fuentes visibles tras responder.
- **Modo `simulacro`**: NO revela respuesta. Fuentes y explicación recién en `/quiz/resultado/[id]`.
- **Badge ⚠ "OCR dudoso"** se muestra automáticamente cuando `question.requiresVerification === true`.
- **Si el tema no tiene preguntas validadas**, la página muestra un mensaje con el comando `npm run import:obsidian`.
- **Las rutas privadas redirigen a `/login?callbackUrl=...`** (ya lo hacía el middleware; las pages también validan `session` server-side antes de crear `QuizAttempt`).

### Pendientes conocidos

- El simulacro re-selecciona las preguntas en `/simulacro/[attemptId]` cada vez que se entra a la URL en lugar de persistir el set asignado al intento. Si el usuario refresca, le aparecen preguntas distintas. Fix: persistir las preguntas asignadas (tabla `QuizAttemptQuestion` o JSON en `metadata`).
- "Guardar pregunta" / "marcar para repaso" desde el quiz: el endpoint `POST /api/quiz/save-question` existe pero el botón en el `QuizRunner` no está. Próxima iteración.
- Confetti / celebración al terminar bien un intento: no implementado (low prio).

---

## 4-bis. Lo hecho en Fase 7 (importador Obsidian)

### Scripts nuevos

- [`scripts/lib/io.ts`](ande-examen-web/scripts/lib/io.ts) — `loadDotenv`, `parseCsv`, `ImportLogger`, helpers de paths.
- [`scripts/lib/parse-question.ts`](ande-examen-web/scripts/lib/parse-question.ts) — parser de bloques `## <ID> | <enunciado>` de los bancos Obsidian. Tolerante a `**bold**` markdown, matching de respuesta con cascada (exacto → parcial → borrador).
- [`scripts/lib/topic-resolver.ts`](ande-examen-web/scripts/lib/topic-resolver.ts) — mapeo de slugs Obsidian (incl. sub-temas/aliases) a los 6 temas raíz.
- [`scripts/import-sources.ts`](ande-examen-web/scripts/import-sources.ts) — lee `INVENTARIO_ARCHIVOS.csv` (99 docs) + `DUDAS_OCR_TRANSCRIPCION.md` (18 flags). Upsert por `externalId`. Resuelve `duplicateOfId` en 2 pasadas.
- [`scripts/import-questions.ts`](ande-examen-web/scripts/import-questions.ts) — lee `wiki/preguntas/banco-preguntas-*.md`. Crea/actualiza Question + AnswerOption + Source + QuestionSource. Idempotente por `externalId`.
- [`scripts/import-obsidian.ts`](ande-examen-web/scripts/import-obsidian.ts) — orquestador: spawnSync `npm run import:sources` + `npm run import:questions`.
- [`scripts/db-stats.ts`](ande-examen-web/scripts/db-stats.ts) — helper para verificar contadores rápidos.

### Reglas de negocio aplicadas por el importer

| Condición | Resultado |
|---|---|
| Respuesta no matchea ninguna opción | `status: borrador`, sin opción `isCorrect: true` |
| Tema resuelto + ≥1 fuente | `status: validada` |
| Sin tema mapeado o sin fuentes | `status: requiere_verificacion` |
| Fuente sin página o doc con `processingState` que contiene "OCR"/"imagen" | `Source.requiresVerification: true` |
| Todas las fuentes de la pregunta son `requiresVerification: true` | `Question.requiresVerification: true` |
| Documento marcado como duplicado (DUP* en CSV) | `duplicateOfId` linkea a la fuente canónica |
| OCR flags con `reviewed: true` | NO se borran (acción humana persistente) |

### Estado de la DB después del importer

```
SourceDocument : 99
OcrFlag        : 18
Source         : 12
Question       : 84   (79 validada, 4 borrador, 1 requiere_verificacion)
AnswerOption   : 334
QuestionSource : 89

Questions by topic:
  reglamento-baja-tension      31
  reglamento-media-tension     15
  pliego-tarifas               29
  norma-paraguaya-np-2028       5
  laboratorio-taa               2
  saee                          2
```

### Pendientes conocidos (no rompen nada, son TODOs reales)

- **5 preguntas no entran (4 borrador + 1 rechazada)**: formato de respuesta multi-formato (ej. "3,77 A, aproximadamente 4 A") que no matchea con opciones tipo "3,77 A". Reviewer humano debe corregir manualmente.
- **NP-006** sin opciones (línea malformada en la wiki original). Reportar al usuario o saltar.
- **saee/laboratorio-taa quedaron con 2 preguntas cada uno** — la mayoría de bancos SAEE/TAA son casos numéricos con respuestas que no matchean opciones exactas (caen a `borrador`). Es esperable y refleja los datos reales.
- **KnowledgeChunk no se importa todavía** — los chunks para RAG son Fase 14 (agente IA). Si querés que el buscador funcione antes, conviene agregar un importer simple que lea `wiki/temas/*.md` y `wiki/datos/*.md`.
- **Contradicciones**: no se importaron desde `wiki/contradicciones/*.md`. Pendiente para Fase 15 o cuando se trabaje el panel de revisión.

---

## 4-bis. Lo hecho en Fase 5 (auth + API)

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

## 5. Decisión pendiente al retomar (post Fase 8)

Siguiendo el orden numérico del prompt fundacional:

- **Fase 9-10 — Diseño avanzado + dashboard de progreso personalizado**: sidebar, gráfico de
  desempeño por tema, recomendaciones automáticas, más componentes shadcn (Dialog, Sheet, Tabs),
  modal de fuente. El dashboard ya está parcialmente, falta el gráfico y la tarjeta de
  recomendación tipo "tu rendimiento en Pliego es bajo, te sugerimos…".
- **Fase 11 — Buscador de conocimiento**: input global que busca en `Question`, `Source`,
  `SourceDocument`, `Topic`. Página `/buscar?q=...` con resultados agrupados por tipo.
- **Fase 12 — Modo examen avanzado**: temporizador, persistencia del set asignado al intento
  (resuelve el bug de refresh actual), bloqueo de "atrás" del navegador opcional.
- **Fase 13 — Perfil/settings/roles**: `/profile`, `/settings`, middleware para `/admin/*` ya
  existe pero faltan las pages.
- **Fase 14 — Agente IA** (donde dejaste explícito que va en su número).
- **Fase 15 — Panel de revisión admin** para los 4 `borrador` + 1 `requiere_verificacion`.

**Próximo paso:** Fase 9-10. El sidebar y el gráfico son los que más mejoran la sensación de
"app seria" sin necesidad de IA.

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

# Importar contenido de la wiki Obsidian a la DB (idempotente)
npm run import:obsidian          # corre import:sources + import:questions

# Validar calidad de la DB (no muta nada)
npm run validate:questions
npm run validate:sources
npm run validate:knowledge

# Verificar contadores en la DB
npx tsx scripts/db-stats.ts

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
