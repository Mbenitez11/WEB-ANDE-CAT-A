/**
 * Resuelve slugs Obsidian (algunos son sub-temas o aliases) a uno de los
 * 6 temas raíz sembrados en `prisma/seed.ts`.
 *
 * No inventa temas: si un slug no resuelve, devuelve null y el importer
 * deja la pregunta como `borrador` con warning.
 */
export const ROOT_TOPIC_SLUGS = new Set([
  "reglamento-baja-tension",
  "reglamento-media-tension",
  "pliego-tarifas",
  "norma-paraguaya-np-2028",
  "laboratorio-taa",
  "saee",
]);

const ALIASES: Record<string, string> = {
  // ya son raíz
  "reglamento-baja-tension": "reglamento-baja-tension",
  "reglamento-media-tension": "reglamento-media-tension",
  "pliego-tarifas": "pliego-tarifas",
  "norma-paraguaya-np-2028": "norma-paraguaya-np-2028",
  "laboratorio-taa": "laboratorio-taa",
  "saee": "saee",

  // sub-temas → raíz pedagógica
  "valores-bt-mt": "reglamento-baja-tension",
  "factor-potencia": "reglamento-baja-tension",
  "calculo-potencia-demanda-transformador": "reglamento-media-tension",
  "instalacion-media-tension": "reglamento-media-tension",
  "pd-tipo-ande": "reglamento-media-tension",

  "categorias-tarifarias": "pliego-tarifas",
  "tasa-conexion": "pliego-tarifas",
  "facturacion-ande": "pliego-tarifas",
  "valores-pliego-tarifas": "pliego-tarifas",
  "consumo-intensivo-especial": "pliego-tarifas",
  "industrias-electrointensivas": "pliego-tarifas",

  "ley-7300-24": "laboratorio-taa",
  "obras-por-terceros": "laboratorio-taa",

  "formulario-saee": "saee",
  "valores-saee": "saee",

  // casos prácticos (aparecen como tema de pregunta en algunos bancos)
  "calculo-potencia": "reglamento-baja-tension",
  "calculo-demanda": "reglamento-baja-tension",
  "seleccion-transformador": "reglamento-media-tension",
  "facturacion": "pliego-tarifas",
  "recomendacion-categoria-tarifaria": "pliego-tarifas",
};

export function resolveTopicSlug(raw: string): string | null {
  const slug = raw.trim().toLowerCase().replace(/^\[\[|\]\]$/g, "");
  return ALIASES[slug] ?? (ROOT_TOPIC_SLUGS.has(slug) ? slug : null);
}

export function resolveDifficulty(raw: string): "basica" | "media" | "dificil" | "examen" {
  const d = raw.trim().toLowerCase();
  if (d === "baja" || d === "basica" || d === "básica") return "basica";
  if (d === "alta" || d === "dificil" || d === "difícil") return "dificil";
  if (d === "examen") return "examen";
  return "media";
}
