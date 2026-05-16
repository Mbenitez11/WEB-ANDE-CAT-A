/**
 * Datos mock para la FASE 4 (UI). Reflejan la estructura real del esquema Prisma
 * pero viven en memoria. Cuando se integre el importador Obsidian (FASE 7),
 * estos arrays se reemplazan por consultas a la DB sin tocar la UI.
 */

export type Difficulty = "basica" | "media" | "dificil" | "examen";
export type QuestionStatus =
  | "borrador"
  | "validada"
  | "requiere_verificacion"
  | "descartada";

export type TopicMock = {
  slug: string;
  name: string;
  description: string;
  questionCount: number;
  progress: number; // 0..1
  /** Etiqueta corta tipo "01", "02" para eyebrow. */
  code: string;
};

export type SourceMock = {
  id: string;
  externalId: string; // "F0018"
  documentName: string;
  page: number | null;
  section?: string;
  requiresVerification: boolean;
};

export type OptionMock = {
  id: string;
  letter: "A" | "B" | "C" | "D" | "E";
  text: string;
  isCorrect: boolean;
};

export type QuestionMock = {
  id: string;
  externalId: string; // "BT-001"
  topicSlug: string;
  topicShort: string;
  statement: string;
  difficulty: Difficulty;
  status: QuestionStatus;
  repetition: "alta" | "media" | "baja" | null;
  requiresVerification: boolean;
  options: OptionMock[];
  explanation: string;
  sources: SourceMock[];
};

// ----------------------------------------------------------------------------
// TEMAS (espejo de wiki/temas/* en la bóveda Obsidian)
// ----------------------------------------------------------------------------

export const MOCK_TOPICS: TopicMock[] = [
  {
    code: "01",
    slug: "reglamento-baja-tension",
    name: "Reglamento de Baja Tensión",
    description:
      "Acometidas, medidores, cargas, circuitos, puesta a tierra, canalizaciones y seguridad.",
    questionCount: 48,
    progress: 0.4,
  },
  {
    code: "02",
    slug: "reglamento-media-tension",
    name: "Reglamento de Media Tensión",
    description:
      "Acometida MT, puestos de transformación, puestas a tierra, distancias y protecciones.",
    questionCount: 36,
    progress: 0.22,
  },
  {
    code: "03",
    slug: "pliego-tarifas",
    name: "Pliego de Tarifas Nro. 21",
    description:
      "Categorías 141/142/343/372/373/412/620/640/732, horarios, factor de potencia y cargos.",
    questionCount: 52,
    progress: 0.31,
  },
  {
    code: "04",
    slug: "norma-paraguaya-np-2028",
    name: "Norma Paraguaya NP 2 028",
    description:
      "Instalaciones de baja tensión: tableros, tomas, conductores y protección diferencial.",
    questionCount: 28,
    progress: 0.14,
  },
  {
    code: "05",
    slug: "laboratorio-taa",
    name: "Laboratorio y TAA",
    description:
      "Banco TAA, tasa de conexión, obras por terceros, PD tipo ANDE, Ley 7300/24.",
    questionCount: 42,
    progress: 0.55,
  },
  {
    code: "06",
    slug: "saee",
    name: "SAEE — Solicitud de Abastecimiento",
    description:
      "Solicitud, selección tarifaria, potencia reservada, horarios y factura mensual esperada.",
    questionCount: 34,
    progress: 0.68,
  },
];

// ----------------------------------------------------------------------------
// FUENTES (espejo de wiki/fuentes/* + INVENTARIO_ARCHIVOS.csv)
// ----------------------------------------------------------------------------

export const MOCK_SOURCES: Array<
  SourceMock & { totalPages: number | null; processingState: string }
> = [
  {
    id: "src-pliego-21",
    externalId: "F0018",
    documentName: "Pliego de Tarifas Nro. 21",
    page: 11,
    section: "Tasa de conexión",
    requiresVerification: false,
    totalPages: 32,
    processingState: "texto embebido",
  },
  {
    id: "src-reglamento-bt",
    externalId: "F0092",
    documentName: "Reglamento Baja Tensión — ANDE",
    page: 14,
    section: "Acometidas y servicios",
    requiresVerification: false,
    totalPages: 74,
    processingState: "texto embebido",
  },
  {
    id: "src-reglamento-mt",
    externalId: "F0095",
    documentName: "Reglamento Media Tensión — ANDE",
    page: 100,
    section: "Distancias y protecciones",
    requiresVerification: true,
    totalPages: 114,
    processingState: "texto embebido + OCR (dudoso)",
  },
  {
    id: "src-np-2028",
    externalId: "F0097",
    documentName: "Norma Paraguaya NP 2 028 — INTN",
    page: 42,
    section: "Protección diferencial",
    requiresVerification: false,
    totalPages: 96,
    processingState: "texto embebido",
  },
  {
    id: "src-taa",
    externalId: "F0004",
    documentName: "ANDE TAAs",
    page: 8,
    section: "Banco TAA Categoría A",
    requiresVerification: false,
    totalPages: 26,
    processingState: "texto embebido",
  },
  {
    id: "src-saee-1",
    externalId: "F0003",
    documentName: "SAEE Examen Categoría A",
    page: 3,
    section: "Cálculo de demanda",
    requiresVerification: false,
    totalPages: 7,
    processingState: "texto embebido",
  },
];

// ----------------------------------------------------------------------------
// PREGUNTAS (subset reducido para mostrar la UI)
// ----------------------------------------------------------------------------

export const MOCK_QUESTIONS: QuestionMock[] = [
  {
    id: "q-bt-003",
    externalId: "BT-003",
    topicSlug: "reglamento-baja-tension",
    topicShort: "BT",
    statement: "La acometida en BT comprende:",
    difficulty: "basica",
    status: "validada",
    repetition: "alta",
    requiresVerification: false,
    options: [
      { id: "o1", letter: "A", text: "Servicio, entrada y medición", isCorrect: true },
      { id: "o2", letter: "B", text: "Solo el tablero principal", isCorrect: false },
      {
        id: "o3",
        letter: "C",
        text: "Transformador y banco de capacitores",
        isCorrect: false,
      },
      { id: "o4", letter: "D", text: "Solamente el medidor", isCorrect: false },
    ],
    explanation:
      "El Reglamento BT define la acometida como el conjunto compuesto por servicio, entrada y medición. Dato repetido en exámenes recientes.",
    sources: [
      {
        id: "src-reglamento-bt",
        externalId: "F0092",
        documentName: "Reglamento Baja Tensión — ANDE",
        page: 14,
        section: "Acometidas y servicios",
        requiresVerification: false,
      },
    ],
  },
  {
    id: "q-pliego-001",
    externalId: "PLIEGO-001",
    topicSlug: "pliego-tarifas",
    topicShort: "Pliego",
    statement:
      "Según el Pliego de Tarifas Nro. 21, ¿dónde se establece la tasa de conexión?",
    difficulty: "media",
    status: "validada",
    repetition: "media",
    requiresVerification: false,
    options: [
      {
        id: "o1",
        letter: "A",
        text: "En la sección de tasas de conexión del propio Pliego",
        isCorrect: true,
      },
      { id: "o2", letter: "B", text: "En el Reglamento de Media Tensión", isCorrect: false },
      { id: "o3", letter: "C", text: "En la Norma Paraguaya NP 2 028", isCorrect: false },
      { id: "o4", letter: "D", text: "En el formulario SAEE", isCorrect: false },
    ],
    explanation:
      "La tasa de conexión se establece directamente en el Pliego de Tarifas, en la sección correspondiente a tasas y cargos aplicables.",
    sources: [
      {
        id: "src-pliego-21",
        externalId: "F0018",
        documentName: "Pliego de Tarifas Nro. 21",
        page: 11,
        section: "Tasa de conexión",
        requiresVerification: false,
      },
    ],
  },
  {
    id: "q-mt-014",
    externalId: "MT-014",
    topicSlug: "reglamento-media-tension",
    topicShort: "MT",
    statement:
      "Distancia mínima de paramento a línea aérea de media tensión 23 kV (valor más usado en exámenes):",
    difficulty: "dificil",
    status: "requiere_verificacion",
    repetition: "media",
    requiresVerification: true,
    options: [
      { id: "o1", letter: "A", text: "2,30 m", isCorrect: false },
      { id: "o2", letter: "B", text: "3,00 m", isCorrect: true },
      { id: "o3", letter: "C", text: "1,80 m", isCorrect: false },
      { id: "o4", letter: "D", text: "5,00 m", isCorrect: false },
    ],
    explanation:
      "Valor recurrente en TAA. La fuente original presenta OCR de baja confianza, por lo que el valor exacto debe confirmarse contra el documento oficial antes de usarlo como definitivo.",
    sources: [
      {
        id: "src-reglamento-mt",
        externalId: "F0095",
        documentName: "Reglamento Media Tensión — ANDE",
        page: 100,
        section: "Distancias mínimas",
        requiresVerification: true,
      },
    ],
  },
];

export const MOCK_STATS = {
  totalQuestions: 240,
  answered: 87,
  correct: 64,
  wrong: 23,
  accuracy: 0.736,
  attempts: 12,
  weakTopics: ["pliego-tarifas", "reglamento-media-tension"],
};
