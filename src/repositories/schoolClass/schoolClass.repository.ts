import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findSchoolClassById(id: string) {
  return db.schoolClass.findUnique({ where: { id } });
}

export async function findSchoolClassByName(schoolId: string, name: string) {
  return db.schoolClass.findFirst({ where: { schoolId, name, deletedAt: null } });
}

export async function listSchoolClassesBySchool(schoolId: string) {
  return db.schoolClass.findMany({
    where: { schoolId, deletedAt: null },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createSchoolClass(
  input: Prisma.SchoolClassCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.schoolClass.create({ data: input });
}

// Sprint E12 — the GradeScale-assignment write, closing the gap Sprint
// E10 named. A plain single-field update, not a general SchoolClass edit
// capability (no Admin UI exists for this yet — a named, unbuilt future
// gap, matching TeacherAssignment's own create/reassign UI precedent).
export async function assignGradeScaleToSchoolClass(
  schoolClassId: string,
  gradeScaleId: string | null,
  tx: Prisma.TransactionClient = db,
) {
  return tx.schoolClass.update({ where: { id: schoolClassId }, data: { gradeScaleId } });
}
