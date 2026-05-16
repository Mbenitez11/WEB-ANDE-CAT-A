/**
 * Parser de bancos de preguntas Obsidian. Formato esperado de cada bloque:
 *
 *   ## BT-001 | Enunciado de la pregunta
 *
 *   - Opciones: A / B / C / D
 *   - **Respuesta: B**
 *   - Explicacion: texto libre.
 *   - Tema: [[reglamento-baja-tension]] | Dificultad: baja | Fuente: F0092, F0004 p.10 | Repeticion: alta
 *
 * Estricto en lo crítico (id, statement, opciones, respuesta) y tolerante
 * en lo opcional (explicación, repetición). Si falta algo crítico devuelve
 * null + razón; el importer lo cuenta como rechazado.
 */

export type ParsedQuestionSource = {
  externalId: string; // F0092
  page: number | null;
};

export type ParsedQuestion = {
  externalId: string;
  statement: string;
  options: string[];
  correctAnswer: string;
  /** false cuando la respuesta no matchea ninguna opción — entra como `borrador` */
  correctMatched: boolean;
  explanation: string | null;
  topicRaw: string | null;
  difficultyRaw: string;
  repetition: string | null;
  sources: ParsedQuestionSource[];
  reject?: string;
};

const HEADING_RE = /^## ([\w-]+)\s*\|\s*(.+?)\s*$/;

export function splitQuestionBlocks(body: string): string[] {
  const lines = body.split(/\r?\n/);
  const blocks: string[] = [];
  let current: string[] | null = null;

  for (const line of lines) {
    if (HEADING_RE.test(line)) {
      if (current) blocks.push(current.join("\n"));
      current = [line];
    } else if (current) {
      current.push(line);
    }
  }
  if (current) blocks.push(current.join("\n"));
  return blocks;
}

export function parseQuestionBlock(block: string): ParsedQuestion | null {
  const lines = block.split(/\r?\n/);
  const headMatch = lines[0]?.match(HEADING_RE);
  if (!headMatch) return null;

  const externalId = headMatch[1].trim();
  const statement = stripTrailingColon(headMatch[2].trim());

  const opciones = findLine(lines, "Opciones:");
  const respuesta = findLine(lines, "Respuesta");
  const explicacion = findLine(lines, "Explicacion:") ?? findLine(lines, "Explicación:");
  const tema = findLine(lines, "Tema:");

  if (!opciones) {
    return { ...empty(externalId, statement), reject: "sin Opciones" };
  }
  if (!respuesta) {
    return { ...empty(externalId, statement), reject: "sin Respuesta" };
  }

  // El separador entre opciones es " / " (slash con espacios). Usar split por
  // "/" pelado rompe valores que contienen unidades tipo "Gs/mes", "mm2/m", etc.
  const options = opciones
    .split(/\s+\/\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (options.length < 2) {
    return { ...empty(externalId, statement), reject: "menos de 2 opciones" };
  }

  const correctAnswer = respuesta.replace(/\*\*/g, "").trim();
  // tolerar "Respuesta: X" o "**Respuesta: X**"
  const correctClean = correctAnswer.replace(/^Respuesta\s*:?\s*/i, "").trim();

  if (!correctClean) {
    return { ...empty(externalId, statement), reject: "respuesta vacía" };
  }

  // que la respuesta coincida con alguna opción. Estrategia en cascada:
  //  1. match exacto normalizado
  //  2. match parcial: la opción está incluida en la respuesta o viceversa
  // Si nada matchea, NO rechazamos: dejamos correctAnswer en bruto y matchIdx=-1
  // → el importer la marca como `borrador` y un reviewer la corrige.
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  let matchIdx = options.findIndex((o) => norm(o) === norm(correctClean));
  if (matchIdx === -1) {
    matchIdx = options.findIndex(
      (o) => norm(correctClean).includes(norm(o)) || norm(o).includes(norm(correctClean)),
    );
  }

  // tema y metadata: "Tema: [[slug]] | Dificultad: media | Fuente: F0092 p.10, F0004 | Repeticion: alta"
  let topicRaw: string | null = null;
  let difficultyRaw = "media";
  let repetition: string | null = null;
  const sources: ParsedQuestionSource[] = [];

  if (tema) {
    const parts = tema.split("|").map((p) => p.trim());
    // El primer segmento es el slug del tema (findLine ya removió "Tema:")
    const first = parts[0] ?? "";
    const topicMatch = first.match(/\[\[([\w-]+)\]\]/);
    topicRaw = topicMatch ? topicMatch[1] : first.replace(/[\[\]]/g, "").trim() || null;

    // El resto tiene formato "key: value"
    for (const part of parts.slice(1)) {
      const [k, ...rest] = part.split(":");
      const key = k.toLowerCase().trim();
      const val = rest.join(":").trim();
      if (key === "dificultad") {
        difficultyRaw = val;
      } else if (key === "fuente") {
        for (const tok of val.split(",").map((s) => s.trim()).filter(Boolean)) {
          const m = tok.match(/(F\d{4,})(?:\s*p\.?\s*(\d+))?/i);
          if (m) sources.push({ externalId: m[1].toUpperCase(), page: m[2] ? Number(m[2]) : null });
        }
      } else if (key.startsWith("repeticion") || key.startsWith("repetición")) {
        repetition = val;
      }
    }
  }

  return {
    externalId,
    statement,
    options,
    correctAnswer: matchIdx >= 0 ? options[matchIdx] : correctClean,
    correctMatched: matchIdx >= 0,
    explanation: explicacion ? explicacion.replace(/^Explicaci[oó]n\s*:?\s*/i, "").trim() : null,
    topicRaw,
    difficultyRaw,
    repetition,
    sources,
  };
}

function findLine(lines: string[], needle: string): string | null {
  for (const raw of lines) {
    // strippear bullet "- " o "* " y luego markdown bold "**"
    const t = raw.replace(/^\s*[-*]\s*/, "").replace(/\*\*/g, "").trim();
    if (t.toLowerCase().startsWith(needle.toLowerCase())) {
      return t.slice(needle.length).replace(/^\s*:?\s*/, "").trim();
    }
  }
  return null;
}

function stripTrailingColon(s: string): string {
  return s.replace(/[:：]\s*$/, "");
}

function empty(externalId: string, statement: string): ParsedQuestion {
  return {
    externalId,
    statement,
    options: [],
    correctAnswer: "",
    correctMatched: false,
    explanation: null,
    topicRaw: null,
    difficultyRaw: "media",
    repetition: null,
    sources: [],
  };
}
