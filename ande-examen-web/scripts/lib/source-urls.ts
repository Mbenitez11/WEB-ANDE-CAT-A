/**
 * URLs canónicas de los documentos fuente.
 *
 * La página oficial donde la ANDE publica los reglamentos y materiales para
 * matriculación de electricistas:
 *
 *   https://www.ande.gov.py/mesa_examinadora.php
 *
 * Cada PDF tiene un URL directo bajo `/documentos/mesa_examinadora/<archivo>`.
 * Para los archivos cuyo origen NO es la página oficial (apuntes personales,
 * imágenes, simulacros viejos), no se asigna URL pública.
 */

export const ANDE_MESA_EXAMINADORA = "https://www.ande.gov.py/mesa_examinadora.php";

/**
 * Mapeo F#### → URL pública directa al PDF.
 * Construido a partir de los nombres del INVENTARIO_ARCHIVOS.csv que coinciden
 * con archivos publicados en mesa_examinadora.php.
 */
export const SOURCE_PUBLIC_URLS: Record<string, string> = {
  // Pliego de Tarifas Nro. 21 (versión actualizada 27-11-2024)
  F0018:
    "https://www.ande.gov.py/documentos/mesa_examinadora/Pliego%20de%20Tarifas%20NRO%2021%20Version%20Actualizada%2027-11-2024.pdf",
  // Reglamento de Baja Tensión ANDE
  F0092:
    "https://www.ande.gov.py/documentos/mesa_examinadora/Reglamento%20de%20Baja%20Tension%20ANDE.pdf",
  // Reglamento de Media Tensión ANDE
  F0095:
    "https://www.ande.gov.py/documentos/mesa_examinadora/Reglamento%20MT%20de%20la%20ANDE.pdf",
  // Norma Paraguaya NP 2 028 INTN
  F0097:
    "https://www.ande.gov.py/documentos/mesa_examinadora/RP46876%20ANEXO%20-Manual%20de%20Calculo%20de%20laTasa%20de%20Conexion%20ID25485544.pdf",
  // Ley 7300/24 (Integridad del Sistema Eléctrico)
  F0098:
    "https://www.ande.gov.py/documentos/mesa_examinadora/Ley%207300%20-%20Que%20protege%20la%20integridad%20del%20Sistema%20Electrico.pdf",
  // Decreto 7551/2017 - Tarifas Industrias Electrointensivas
  F0099:
    "https://www.ande.gov.py/documentos/mesa_examinadora/DECRETO_Nro_7551_08082017_Tarifas%20para%20Industrias%20Electrointensivas.pdf",
  // Decreto 7824/2022 - Consumo intensivo especial
  F0100:
    "https://www.ande.gov.py/documentos/mesa_examinadora/Decreto_7824_2022_Consumo%20intensivo%20especial.pdf",
  // IDI-05 PD en SED - Obras Terceros
  F0101:
    "https://www.ande.gov.py/documentos/mesa_examinadora/IDI-05%20INST.%20PD%20EN%20EL%20SED%20-%20OBRAS%20TERCEROS%20-PDTIPOANDE.PDF",
  // Manual de Garantía
  F0102:
    "https://www.ande.gov.py/documentos/mesa_examinadora/Manual_de_Garantia.pdf",
  // RP49238 Tarifas GCIE 2024
  F0103:
    "https://www.ande.gov.py/documentos/mesa_examinadora/RP49238%20Actualizacion%20de%20las%20Tarifas%20de%20Energiia%20Electrica%20GCIE-2024.pdf",
  // Solicitud de Carnet de Electricista Particular
  F0104:
    "https://www.ande.gov.py/documentos/mesa_examinadora/Solicitud%20de%20Carnet%20de%20Electricista%20Particular.pdf",
  // Temario para examen
  F0105:
    "https://www.ande.gov.py/documentos/mesa_examinadora/TEMARIO%20PARA%20EXAMEN%20DE%20MATRICULACION%20DE%20ELECTRISISTAS%20ANDE.PDF",
};

/**
 * Resuelve la URL pública canónica para un externalId, o el índice oficial
 * si no hay link directo conocido. Documentos personales (apuntes, imágenes,
 * simulacros viejos) devuelven null — no se exhiben con link.
 */
export function resolvePublicUrl(externalId: string): {
  publicUrl: string | null;
  indexUrl: string | null;
} {
  const direct = SOURCE_PUBLIC_URLS[externalId];
  if (direct) {
    return { publicUrl: direct, indexUrl: ANDE_MESA_EXAMINADORA };
  }
  return { publicUrl: null, indexUrl: null };
}
