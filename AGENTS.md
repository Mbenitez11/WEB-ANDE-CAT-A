# AGENTS.md — Reglas para agentes en `ANDE WEB`

Este archivo describe cómo deben comportarse los agentes automáticos (Claude Code, Codex CLI,
scripts con LLM, el agente IA *de la app misma*) cuando trabajan dentro de este repositorio.

> Para guía orientada a Claude Code sobre el proyecto en general, ver [CLAUDE.md](./CLAUDE.md).

---

## 1. Identidad del proyecto

- **Proyecto:** WEB ANDE CAT A — plataforma de estudio para el examen ANDE Categoría A.
- **App:** [ande-examen-web/](ande-examen-web/) (Next.js 15 + Prisma + NextAuth + Vercel AI SDK).
- **Base de datos fuente:** `g:\Mi unidad\FIUNA BROZ\ANDE EXAMEN\` (read-only desde la perspectiva
  de la app — los PDFs, OCR y la wiki Obsidian viven ahí).

---

## 2. Principio rector: **trazabilidad por encima de fluidez**

Mejor responder *"no tengo fuente"* que inventar una respuesta plausible.

Toda salida de un agente que afecte a usuarios finales (preguntas, respuestas del tutor, contenido
del simulacro) debe poder rastrearse a un `Source` con `documentName`, `page` y `section`. Si la
fuente tiene `requiresVerification: true`, eso se muestra al usuario.

---

## 3. Reglas duras

1. **No inventar normativa, artículos, páginas, cifras, fórmulas ni jurisprudencia.**
2. **No afirmar vigencia** de un reglamento si no hay fuente que la respalde.
3. **Marcar OCR dudoso.** Cualquier extracción con confianza < 0.7, página estimada o fragmentos
   con caracteres dañados va con `requiresVerification: true` y *no* se usa en modo simulacro por
   defecto.
4. **Contradicciones**: cuando dos fuentes digan cosas distintas, crear un registro `Contradiction`
   con ambos enunciados. Nunca elegir un "ganador" sin que un `reviewer` lo apruebe.
5. **Preguntas generadas por IA** entran SIEMPRE como `status: borrador` y `createdFrom: "ai:…"`.
6. **No tocar el material fuente** en `g:\…\ANDE EXAMEN\`. Lectura solamente.
7. **No eliminar** archivos, migraciones, `dev.db`, ni `data/imported/*` sin permiso explícito del
   usuario.
8. **Secretos**: ni leer ni mostrar valores de `.env`/`.env.local`. Pedir al usuario que los rote
   si se filtran por error.
9. **Logs limpios**: nunca loggear `passwordHash`, tokens, cookies de sesión, ni el body crudo de
   respuestas de IA con `Authorization` headers.

---

## 4. Reglas específicas para el **agente IA dentro de la app** (`/agente`)

El tutor expuesto al usuario sigue además estas reglas, encoded en el system prompt
(ver `lib/ai/prompts.ts` cuando exista):

1. Responde **solo con la base del proyecto** (`KnowledgeChunk` + `Source`). No usa conocimiento
   general como si fuera normativa.
2. **Toda respuesta normativa cita fuente.** Si la herramienta `searchKnowledge` no devuelve
   resultados con fuente, responde:
   > *"No encontré una fuente suficiente en la base para confirmarlo."*
3. **Advierte OCR dudoso** explícitamente:
   > *"Fuente pendiente de verificación OCR."*
4. **No elige bando en contradicciones.** Muestra ambas posturas con sus fuentes.
5. **Separa explicación didáctica de evidencia documental.** La primera puede usar lenguaje
   pedagógico; la segunda es cita textual + referencia.
6. **Cálculos**: muestra procedimiento paso a paso, con las constantes y unidades de la base.
7. Preguntas multiple-choice: explica *por qué la correcta es correcta y por qué las otras no*,
   solo si hay datos.
8. Mini quizzes generados se devuelven al usuario como **borrador**; nunca se persisten como
   `validada` sin paso por panel de revisión.

---

## 5. Reglas para **importadores y validadores**

Scripts en `scripts/` que leen la wiki Obsidian / CSVs / Markdown:

1. **Idempotentes**: corren N veces sin duplicar registros. Usar `externalId` o `(filePath, page,
   section)` como clave natural antes de `INSERT`.
2. **No destructivos por defecto**: si un chunk existe y cambió el contenido, actualizar y
   conservar versión anterior en `notes` o un log; no borrar.
3. **Reportar al final**:
   ```
   Total chunks: N
   Nuevos: A   Actualizados: B   Sin cambios: C
   Con fuente: X   Sin fuente: Y (→ requiresVerification:true)
   Contradicciones detectadas: Z
   ```
4. **Fallar fuerte y temprano** si el `OBSIDIAN_VAULT_PATH` no existe — no crear datos vacíos en
   silencio.
5. **Marcar `requiresVerification: true`** si: no hay número de página, la confianza OCR < 0.7, el
   archivo origen está en una carpeta `raw/dudas-ocr/`, o el chunk fue inferido por heurística (no
   por encabezado explícito).

---

## 6. Reglas para **agentes que escriben código** (Claude Code, Codex)

Heredan todo lo de [CLAUDE.md](./CLAUDE.md) más:

1. **Trabajar por fases.** No saltar a Fase 8 si la Fase 5 no está hecha. Confirmar con el usuario
   al cerrar cada fase.
2. **No introducir dependencias** sin justificación. Antes de agregar un paquete:
   - ver si shadcn/Radix ya lo cubre,
   - ver si el AI SDK ya expone esa primitiva,
   - preguntar al usuario si la diferencia es grande.
3. **No reescribir** lo que ya funciona. Si un componente con mocks anda, conectarlo al backend en
   vez de rehacerlo.
4. **Migraciones Prisma**: cada cambio de schema lleva su `prisma migrate dev --name <verbo-objeto>`
   con nombre descriptivo. No usar `prisma db push` en este proyecto.
5. **Tests para el motor de quiz y el importador.** No para todo el UI.
6. **Si una tarea toca >10 archivos**, hacer commit intermedio con descripción clara antes de
   seguir, para que el usuario pueda revisar.

---

## 7. Cuándo escalar al usuario

Detener y preguntar cuando:

- una migración requiere `--force` o reset de `dev.db`;
- el proveedor de IA cambia (Anthropic ↔ OpenAI ↔ Google) o el modelo por defecto cambia;
- el importador detecta una **estructura nueva** en la wiki Obsidian que no estaba documentada;
- se encuentran **>5 contradicciones nuevas** en un solo import — puede indicar versiones mezcladas;
- una pregunta del usuario es ambigua entre dos rutas razonables.

---

## 8. Archivos y carpetas sagradas

No tocar sin permiso explícito:

- `ande-examen-web/prisma/dev.db` y `dev.db-journal`
- `ande-examen-web/data/imported/` (snapshots del último import)
- `g:\Mi unidad\FIUNA BROZ\ANDE EXAMEN\**` (el material fuente, vive fuera del repo)
- `.env`, `.env.local`, `.env.production`

---

## 9. Glosario rápido

| Término               | Significado                                                            |
|-----------------------|------------------------------------------------------------------------|
| **Fuente**            | `Source` = documento + página + sección + cita + confianza.            |
| **Chunk**             | `KnowledgeChunk` = fragmento de texto indexable para el agente IA.     |
| **OCR dudoso**        | Texto cuya extracción del PDF/imagen tiene confianza < 0.7.            |
| **Borrador**          | `status: borrador` — la pregunta existe pero no entra a quizzes serios.|
| **Validada**          | Aprobada por un `reviewer`. Apta para simulacro.                       |
| **Requiere verif.**   | Marcada por el sistema/IA como sospechosa; un humano debe revisar.     |
| **Contradicción**     | Dos fuentes con afirmaciones incompatibles; entidad de primera clase.  |
