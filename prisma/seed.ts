// Runs standalone via `tsx` (see prisma.config.ts's `migrations.seed`), not
// through Next.js's build pipeline — load .env.local/.env explicitly rather
// than relying on Next's auto-loading, which doesn't apply here.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { SCHOOL } from "../src/config/school";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

// Indian schools' academic year runs April–March; used here as the seed's
// current-year window since src/config/school.ts's `academicSession` is
// still an unconfirmed placeholder — see docs/PRODUCT_REQUIREMENTS.md § 11
// Open Product Questions. Replace with the real session once School Admin
// confirms it.
function currentAcademicYearWindow(now = new Date()) {
  const aprilIndex = 3; // Date months are 0-indexed
  const startYear = now.getMonth() >= aprilIndex ? now.getFullYear() : now.getFullYear() - 1;
  const startDate = new Date(Date.UTC(startYear, aprilIndex, 1));
  const endDate = new Date(Date.UTC(startYear + 1, aprilIndex, 0));
  const label = `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
  return { label, startDate, endDate };
}

async function main() {
  const school = await db.school.upsert({
    where: { schoolId: "seed-school" },
    update: {},
    create: {
      schoolId: "seed-school",
      name: SCHOOL.name,
      shortName: SCHOOL.shortName,
      // affiliationBoard/udiseCode intentionally left null — SCHOOL.affiliation
      // is still an unconfirmed bracketed placeholder, not a real value to store.
    },
  });

  const { label, startDate, endDate } = currentAcademicYearWindow();

  await db.academicYear.upsert({
    where: { schoolId_label: { schoolId: school.schoolId, label } },
    update: {},
    create: {
      schoolId: school.schoolId,
      label,
      startDate,
      endDate,
      isCurrent: true,
      // Not yet confirmed by School Admin — see docs/PRODUCT_REQUIREMENTS.md
      // § 11 Open Product Questions ("Examination grading model" /
      // "Academic year start month and term structure"). A real policy value
      // must replace this before promotion logic (Migration 010) depends on it.
      promotionPolicy: {
        configured: false,
        note: "Pending School Admin confirmation — see docs/PRODUCT_REQUIREMENTS.md § 11",
      },
    },
  });

  console.log(`Seeded school "${school.name}" with academic year ${label}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
