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
