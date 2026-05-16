/**
 * Helpers compartidos por los validadores. Mantienen formato uniforme:
 *  - "issues" tienen severidad + categoría + mensaje + referencia
 *  - el report final agrupa por categoría y muestra contadores tipo dashboard
 */

export type Severity = "error" | "warning" | "info";

export type Issue = {
  severity: Severity;
  category: string;
  message: string;
  /** Referencia al recurso afectado (externalId, slug, etc.) */
  ref?: string;
};

export class ValidationReport {
  readonly issues: Issue[] = [];

  add(issue: Issue) {
    this.issues.push(issue);
  }

  error(category: string, message: string, ref?: string) {
    this.add({ severity: "error", category, message, ref });
  }
  warn(category: string, message: string, ref?: string) {
    this.add({ severity: "warning", category, message, ref });
  }
  info(category: string, message: string, ref?: string) {
    this.add({ severity: "info", category, message, ref });
  }

  /** Imprime y devuelve exit code (1 si hay errores). */
  print(title: string): number {
    const errors = this.issues.filter((i) => i.severity === "error");
    const warnings = this.issues.filter((i) => i.severity === "warning");
    const infos = this.issues.filter((i) => i.severity === "info");

    console.log(`\n══════ ${title} ══════`);

    const byCategory = new Map<string, Issue[]>();
    for (const it of this.issues) {
      const list = byCategory.get(it.category) ?? [];
      list.push(it);
      byCategory.set(it.category, list);
    }

    for (const [cat, items] of [...byCategory.entries()].sort()) {
      const e = items.filter((i) => i.severity === "error").length;
      const w = items.filter((i) => i.severity === "warning").length;
      const i = items.filter((i) => i.severity === "info").length;
      const tag =
        e > 0 ? "✖" : w > 0 ? "⚠" : "·";
      console.log(`\n${tag} ${cat}  (errors:${e}  warnings:${w}  info:${i})`);
      for (const item of items.slice(0, 50)) {
        const sev = item.severity === "error" ? "ERR " : item.severity === "warning" ? "WARN" : "INFO";
        const ref = item.ref ? `[${item.ref}]` : "";
        console.log(`    ${sev} ${ref ? ref + " " : ""}${item.message}`);
      }
      if (items.length > 50) {
        console.log(`    … (+${items.length - 50} más, truncadas)`);
      }
    }

    console.log("\n── Resumen ──");
    console.log(`  errors    ${errors.length}`);
    console.log(`  warnings  ${warnings.length}`);
    console.log(`  info      ${infos.length}`);

    return errors.length > 0 ? 1 : 0;
  }
}
