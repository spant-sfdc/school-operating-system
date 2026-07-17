// Runs standalone via `tsx` (see prisma.config.ts's `migrations.seed`), not
// through Next.js's build pipeline — load .env.local/.env explicitly rather
// than relying on Next's auto-loading, which doesn't apply here.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { SCHOOL } from "../src/config/school";

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

// Generic Nursery–Class 8 progression — a real, well-established Indian
// schooling convention (docs/domain/DOMAIN_MODEL.md § 3.2), not a fact
// specific to Pant Public School. Index doubles as `sortOrder`; ordinal,
// not assumed alphabetical, per DOMAIN_MODEL.md § 3.2's own note.
const GENERIC_CLASS_NAMES = [
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
];

const GENERIC_SECTION_NAMES = ["A", "B"];

// Common, generic Indian K-8 school subjects (docs/domain/DOMAIN_MODEL.md
// § 3.4's own examples) — not Pant-Public-School-specific.
const GENERIC_SUBJECT_NAMES = [
  "English",
  "Hindi",
  "Mathematics",
  "Environmental Studies",
  "Science",
  "Social Studies",
  "Computer Science",
  "Art & Craft",
  "Physical Education",
  "General Knowledge",
];

// No real User exists yet (Sprint 1 seeds roles only, never users) —
// AuditLog.actorUserId has no FK constraint (Migration 000 predates User by
// design), so a plain sentinel string is safe here.
const SEED_ACTOR_USER_ID = "system-seed";

async function main() {
  // Dynamic imports, not static ones: these transitively import
  // src/lib/db → src/lib/env, which parses process.env at module
  // evaluation time. ESM hoists static imports ahead of this file's own
  // loadEnv() calls above, so a static import here would evaluate env.ts
  // before dotenv has run. Deferring to dynamic imports (evaluated when
  // this line actually executes, not at module load) avoids that ordering
  // trap while still routing every write through the repository/service
  // layer, not raw Prisma.
  const { upsertSchool } = await import("../src/repositories/school");
  const { upsertAcademicYear } = await import("../src/repositories/academicYear");
  const { createRole, findRoleByName } = await import("../src/repositories/role");
  const { findSchoolClassByName } = await import("../src/repositories/schoolClass");
  const { findSubjectByName } = await import("../src/repositories/subject");
  const { createSchoolClassWithSections, createAcademicSubject } =
    await import("../src/services/academic");

  const school = await upsertSchool("seed-school", {
    schoolId: "seed-school",
    name: SCHOOL.name,
    shortName: SCHOOL.shortName,
    // affiliationBoard/udiseCode intentionally left null — SCHOOL.affiliation
    // is still an unconfirmed bracketed placeholder, not a real value to store.
  });

  const { label, startDate, endDate } = currentAcademicYearWindow();

  const academicYear = await upsertAcademicYear(school.schoolId, label, {
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
    school: { connect: { schoolId: school.schoolId } },
  });

  console.log(`Seeded school "${school.name}" with academic year ${label}.`);

  // Sprint 1 — Identity Foundation. Roles only, no users — see
  // docs/DECISIONS.md's Sprint 1 entry: "Administrator" and "Principal" are
  // two distinct job-title Role rows that both grant ADMIN-tier access,
  // matching PROJECT_CONTEXT.md § 4's "Admin: Principal / Management /
  // School Office" framing rather than introducing a fourth permission tier.
  const roleSeeds = [
    { name: "Administrator", accessLevel: "ADMIN" as const },
    { name: "Principal", accessLevel: "ADMIN" as const },
    { name: "Teacher", accessLevel: "TEACHER" as const },
  ];

  for (const roleSeed of roleSeeds) {
    const existing = await findRoleByName(roleSeed.name);
    if (existing) continue;
    await createRole(roleSeed);
  }

  console.log(`Seeded roles: ${roleSeeds.map((r) => r.name).join(", ")}.`);

  // Sprint 2 — Academic Foundation. Classes + sections + subjects only, all
  // generic (see the constants above) — never Pant-Public-School-specific.
  for (let index = 0; index < GENERIC_CLASS_NAMES.length; index++) {
    const className = GENERIC_CLASS_NAMES[index];
    const existing = await findSchoolClassByName(school.schoolId, className);
    if (existing) continue;
    await createSchoolClassWithSections(
      {
        schoolId: school.schoolId,
        academicYearId: academicYear.id,
        className,
        sortOrder: index,
        sectionNames: GENERIC_SECTION_NAMES,
      },
      SEED_ACTOR_USER_ID,
    );
  }

  console.log(
    `Seeded ${GENERIC_CLASS_NAMES.length} classes, each with sections: ${GENERIC_SECTION_NAMES.join(", ")}.`,
  );

  for (const name of GENERIC_SUBJECT_NAMES) {
    const existing = await findSubjectByName(school.schoolId, name);
    if (existing) continue;
    await createAcademicSubject({ schoolId: school.schoolId, name }, SEED_ACTOR_USER_ID);
  }

  console.log(`Seeded subjects: ${GENERIC_SUBJECT_NAMES.join(", ")}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { db } = await import("../src/lib/db");
    await db.$disconnect();
  });
