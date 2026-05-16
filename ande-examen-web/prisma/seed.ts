/**
 * Seed mínimo. La carga real de temas, preguntas y fuentes la hace el
 * importador Obsidian (scripts/import-obsidian.ts) en FASE 7.
 *
 * Este seed crea:
 *  - Un usuario admin local de desarrollo (email: admin@ande.local / admin1234).
 *  - Los 6 temas raíz alineados con la bóveda Obsidian.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TOPICS = [
  {
    slug: "reglamento-baja-tension",
    name: "Reglamento de Baja Tensión",
    description:
      "Acometidas, medidores, cargas, circuitos, puesta a tierra, canalizaciones y seguridad.",
    order: 1,
  },
  {
    slug: "reglamento-media-tension",
    name: "Reglamento de Media Tensión",
    description:
      "Acometida MT, puestos de transformación, puestas a tierra, distancias y protecciones.",
    order: 2,
  },
  {
    slug: "pliego-tarifas",
    name: "Pliego de Tarifas Nro. 21",
    description:
      "Categorías, horarios, factor de potencia, potencia reservada, cargos y formulas.",
    order: 3,
  },
  {
    slug: "norma-paraguaya-np-2028",
    name: "Norma Paraguaya NP 2 028",
    description:
      "Instalaciones de baja tensión: tableros, tomas, conductores, protección diferencial.",
    order: 4,
  },
  {
    slug: "laboratorio-taa",
    name: "Laboratorio y TAA",
    description:
      "Banco TAA, tasa de conexión, obras por terceros, PD tipo ANDE, Ley 7300/24.",
    order: 5,
  },
  {
    slug: "saee",
    name: "SAEE — Solicitud de Abastecimiento",
    description:
      "Solicitud, selección tarifaria, potencia reservada, horarios y factura mensual.",
    order: 6,
  },
];

async function main() {
  for (const t of TOPICS) {
    await prisma.topic.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
  }

  const adminEmail = "admin@ande.local";
  const adminPass = "admin1234";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin Local",
      role: "admin",
      passwordHash: await bcrypt.hash(adminPass, 10),
      profile: {
        create: {
          displayName: "Admin Local",
          career: "Ingeniería Electromecánica",
          targetExam: "ANDE Categoría A",
        },
      },
    },
  });

  console.log("Seed OK · 6 temas creados/actualizados");
  console.log(`Admin de dev: ${adminEmail} / ${adminPass}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
