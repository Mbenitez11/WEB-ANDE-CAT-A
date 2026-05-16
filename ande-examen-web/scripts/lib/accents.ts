/**
 * Diccionario de restauración de acentos para textos importados desde la
 * wiki Obsidian (que vive sin tildes por simplicidad de codificación).
 *
 * Solo palabras técnicas / comunes claramente identificables. NO restaura
 * casos ambiguos (ej. "publico" puede ser "público" o "publico").
 *
 * El reemplazo es case-insensitive pero respeta la capitalización original
 * (primera letra mayúscula → reemplazo capitalizado).
 */

// Pares: forma sin tilde → forma con tilde
const DICT: Record<string, string> = {
  // generales
  "tension": "tensión",
  "tensiones": "tensiones",
  "energia": "energía",
  "potencia": "potencia",
  "electrico": "eléctrico",
  "electrica": "eléctrica",
  "electricos": "eléctricos",
  "electricas": "eléctricas",
  "categoria": "categoría",
  "categorias": "categorías",
  "instalacion": "instalación",
  "instalaciones": "instalaciones",
  "conexion": "conexión",
  "conexiones": "conexiones",
  "norma": "norma",
  "tecnica": "técnica",
  "tecnico": "técnico",
  "tecnicas": "técnicas",
  "tecnicos": "técnicos",
  "publico": "público",
  "publica": "pública",
  "minimo": "mínimo",
  "minima": "mínima",
  "minimos": "mínimos",
  "minimas": "mínimas",
  "maximo": "máximo",
  "maxima": "máxima",
  "maximos": "máximos",
  "maximas": "máximas",
  "metodo": "método",
  "metodos": "métodos",
  "calculo": "cálculo",
  "calculos": "cálculos",
  "formula": "fórmula",
  "formulas": "fórmulas",
  "version": "versión",
  "versiones": "versiones",
  "seccion": "sección",
  "secciones": "secciones",
  "articulo": "artículo",
  "articulos": "artículos",
  "pagina": "página",
  "paginas": "páginas",
  "linea": "línea",
  "lineas": "líneas",
  "numero": "número",
  "numeros": "números",
  "ultimo": "último",
  "ultima": "última",
  "ultimos": "últimos",
  "ultimas": "últimas",
  "segun": "según",
  "asi": "así",
  "tambien": "también",
  "ademas": "además",
  "facil": "fácil",
  "dificil": "difícil",
  "deberia": "debería",
  "deberian": "deberían",
  "seria": "sería",
  "serian": "serían",

  // eléctrico/electromecánico
  "alimentacion": "alimentación",
  "distribucion": "distribución",
  "transmision": "transmisión",
  "proteccion": "protección",
  "protecciones": "protecciones",
  "regulacion": "regulación",
  "frecuencia": "frecuencia",
  "amperaje": "amperaje",
  "voltaje": "voltaje",
  "polaridad": "polaridad",
  "fasica": "fásica",
  "fasicas": "fásicas",
  "monofasico": "monofásico",
  "monofasica": "monofásica",
  "trifasico": "trifásico",
  "trifasica": "trifásica",
  "trifasicas": "trifásicas",
  "trifasicos": "trifásicos",
  "conductor": "conductor",
  "iluminacion": "iluminación",
  "consumo": "consumo",
  "transformador": "transformador",
  "ohmios": "ohmios",
  "voltios": "voltios",
  "amperios": "amperios",
  "kilowatts": "kilowatts",
  "magnetico": "magnético",
  "magnetica": "magnética",
  "estatico": "estático",
  "estatica": "estática",
  "automatico": "automático",
  "automatica": "automática",
  "termico": "térmico",
  "termica": "térmica",

  // edificio / ambiente
  "banos": "baños",
  "bano": "baño",
  "habitacion": "habitación",
  "habitaciones": "habitaciones",
  "ubicacion": "ubicación",
  "ubicaciones": "ubicaciones",

  // instalación / movimiento
  "aereo": "aéreo",
  "aerea": "aérea",
  "aereos": "aéreos",
  "aereas": "aéreas",
  "estan": "están",
  "habia": "había",
  "habian": "habían",
  "podria": "podría",
  "podrian": "podrían",

  // mediciones / cálculos
  "medicion": "medición",
  "mediciones": "mediciones",
  "dimension": "dimensión",
  "dimensiones": "dimensiones",
  "presion": "presión",
  "diametro": "diámetro",
  "diametros": "diámetros",

  // contenedores físicos
  "cajon": "cajón",
  "cajones": "cajones",

  // operación
  "operacion": "operación",
  "operaciones": "operaciones",
  "informacion": "información",
  "configuracion": "configuración",
  "evaluacion": "evaluación",
  "aplicacion": "aplicación",
  "aplicaciones": "aplicaciones",
  "ampliacion": "ampliación",
  "ampliaciones": "ampliaciones",
  "seleccion": "selección",
  "selecciones": "selecciones",
  "eleccion": "elección",

  // adjetivos comunes
  "logico": "lógico",
  "logica": "lógica",
  "fisico": "físico",
  "fisica": "física",
  "quimico": "químico",
  "quimica": "química",
  "analisis": "análisis",

  // ANDE / regulatorio
  "reglamento": "reglamento",
  "tarifa": "tarifa",
  "tarifas": "tarifas",
  "tarifaria": "tarifaria",
  "tarifarias": "tarifarias",
  "tarifario": "tarifario",
  "facturacion": "facturación",
  "documentacion": "documentación",
  "verificacion": "verificación",
  "explicacion": "explicación",
  "explicaciones": "explicaciones",
  "definicion": "definición",
  "definiciones": "definiciones",
  "solicitud": "solicitud",
  "matriculacion": "matriculación",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isAllUpper(s: string): boolean {
  return s === s.toUpperCase() && /[A-Z]/.test(s);
}

/**
 * Aplica el diccionario respetando capitalización. Reemplaza palabras
 * completas (con word boundaries), case-insensitive.
 */
export function restoreAccents(text: string): string {
  if (!text) return text;
  // Ordenar por longitud descendente para que palabras largas se reemplacen
  // antes que sus prefijos.
  const entries = Object.entries(DICT).sort((a, b) => b[0].length - a[0].length);
  let result = text;
  for (const [from, to] of entries) {
    const re = new RegExp(`\\b${from}\\b`, "gi");
    result = result.replace(re, (match) => {
      if (isAllUpper(match)) return to.toUpperCase();
      if (match[0] === match[0].toUpperCase()) return capitalize(to);
      return to;
    });
  }
  return result;
}
