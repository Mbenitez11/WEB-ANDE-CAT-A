import { readFileSync, existsSync } from "node:fs";
import { readFile as readFileAsync } from "node:fs/promises";
import path from "node:path";

/**
 * Carga variables de `.env` (junto a package.json) en process.env si aún no
 * están definidas. Suficiente para scripts locales — nada de dotenv como dep.
 */
export function loadDotenv(envPath = path.resolve(process.cwd(), ".env")): void {
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m) continue;
    const [, key, rawVal] = m;
    if (process.env[key] !== undefined) continue;
    const val = rawVal.replace(/^["']|["']$/g, "");
    process.env[key] = val;
  }
}

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta variable de entorno: ${name}`);
  return v;
}

export function requirePath(p: string, label: string): string {
  const abs = path.resolve(p);
  if (!existsSync(abs)) throw new Error(`No existe ${label}: ${abs}`);
  return abs;
}

export async function readText(p: string): Promise<string> {
  return readFileAsync(p, "utf8");
}

/**
 * Parser CSV minimalista: campos separados por coma, comillas dobles para campos con coma.
 * No soporta escape de comillas dentro de comillas (no aparece en INVENTARIO_ARCHIVOS.csv).
 */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.length > 0);
  if (!lines.length) return [];
  const header = splitCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let c = 0; c < header.length; c++) row[header[c]] = (cells[c] ?? "").trim();
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

export class ImportLogger {
  private counts = new Map<string, number>();
  constructor(public readonly scope: string) {}

  bump(key: string, n = 1) {
    this.counts.set(key, (this.counts.get(key) ?? 0) + n);
  }

  print() {
    const entries = [...this.counts.entries()];
    if (!entries.length) return;
    const w = Math.max(...entries.map(([k]) => k.length));
    console.log(`\n── ${this.scope} ──`);
    for (const [k, v] of entries) console.log(`  ${k.padEnd(w)}  ${v}`);
  }
}
