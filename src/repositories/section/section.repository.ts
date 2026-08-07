import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findSectionById(id: string) {
  return db.section.findUnique({ where: { id } });
}

export async function listSectionsByClassAndYear(schoolClassId: string, academicYearId: string) {
  return db.section.findMany({
    where: { schoolClassId, academicYearId, deletedAt: null },
    orderBy: { name: "asc" },
  });
}

// Sprint E13 — the Class Detail page's own Section list: same reasoning as
// listAllSchoolClassesBySchool() above, a deactivated Section must stay
// visible (and reactivate-able) on the page that manages it.
export async function listAllSectionsByClassAndYear(schoolClassId: string, academicYearId: string) {
  return db.section.findMany({
    where: { schoolClassId, academicYearId },
    orderBy: { name: "asc" },
  });
}

// The Principal Workspace's own Attendance/Teacher Overview (Sprint E4) —
// the first caller needing every section in the school for a year, not
// one class's worth. Section carries no own `schoolId` (scoped
// transitively via SchoolClass, per DATABASE_SCHEMA.md § 9's own
// documented convention), so this joins through `schoolClass.schoolId`
// rather than duplicating that scoping decision.
export async function listSectionsBySchoolAndYear(schoolId: string, academicYearId: string) {
  return db.section.findMany({
    where: { academicYearId, deletedAt: null, schoolClass: { schoolId, deletedAt: null } },
    include: { schoolClass: true },
    orderBy: [{ schoolClass: { sortOrder: "asc" } }, { name: "asc" }],
  });
}

export async function createSection(
  input: Prisma.SectionCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.section.create({ data: input });
}

// Sprint E13 — Academic Administration's own edit (name, capacity) and
// deactivate/reactivate — matching every other entity's own "deactivate,
// never delete" precedent (SchoolClass, above). No "merge" operation
// exists — not documented anywhere as a real requirement, per this
// sprint's own Q4 answer; a school retiring a section deactivates it and
// creates a fresh one for the next year instead.
export async function updateSection(
  sectionId: string,
  input: Prisma.SectionUpdateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.section.update({ where: { id: sectionId }, data: input });
}

export async function deactivateSection(sectionId: string, tx: Prisma.TransactionClient = db) {
  return tx.section.update({ where: { id: sectionId }, data: { deletedAt: new Date() } });
}

export async function reactivateSection(sectionId: string, tx: Prisma.TransactionClient = db) {
  return tx.section.update({ where: { id: sectionId }, data: { deletedAt: null } });
}
