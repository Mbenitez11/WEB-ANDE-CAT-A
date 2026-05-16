/**
 * Orquestador del importador Obsidian.
 *
 * Corre, en orden:
 *   1. import:sources    → SourceDocument + OcrFlag
 *   2. import:questions  → Question + AnswerOption + Source + QuestionSource
 *
 * Idempotente: re-ejecutar es seguro.
 *
 * Uso:
 *   npm run import:obsidian
 *
 * Requiere en .env:
 *   ANDE_DATABASE_PATH=…/Database
 *   OBSIDIAN_VAULT_PATH=…/Obsidian/ANDE CAT A
 */
import { spawnSync } from "node:child_process";

function runNpmScript(script: string) {
  const r = spawnSync("npm", ["run", script], { stdio: "inherit", shell: true });
  if (r.status !== 0) {
    console.error(`\n✖ npm run ${script} falló (exit ${r.status}). Abortando.`);
    process.exit(r.status ?? 1);
  }
}

console.log("══════ import-obsidian ══════");
runNpmScript("import:sources");
runNpmScript("import:questions");
console.log("\n✓ Importador completo");
