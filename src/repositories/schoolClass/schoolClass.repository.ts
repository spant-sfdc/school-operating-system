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

// Sprint E13 — the Class Directory's own listing: an already-deactivated
// class must still be visible (and reactivate-able) somewhere, or
// deactivation would be a one-way door with no UI path back — the same
// reasoning every other Admin Directory (Student, Teacher) already
// resolves via a `status: "ALL"` filter option. SchoolClass has no status
// field, only `deletedAt`, so this is the plain "no filter" counterpart to
// listSchoolClassesBySchool() above.
export async function listAllSchoolClassesBySchool(schoolId: string) {
  return db.schoolClass.findMany({ where: { schoolId }, orderBy: { sortOrder: "asc" } });
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

// Sprint E13 — Academic Administration's own general edit (name,
// sortOrder) — the gap assignGradeScaleToSchoolClass()'s own comment
// named as unbuilt. A permanent, non-year-scoped row: renaming a class
// is a live edit that affects how every year's own historical Enrollment/
// Academic History/Promotion displays that class's name (Sprint E13's
// own Q11 answer) — already true of this entity's design since Sprint 2,
// not a new consequence introduced here.
export async function updateSchoolClass(
  schoolClassId: string,
  input: Prisma.SchoolClassUpdateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.schoolClass.update({ where: { id: schoolClassId }, data: input });
}

// Soft delete/restore only — matches this entity's own existing
// `deletedAt` field and every other "deactivate, never delete" precedent
// in this codebase (Teacher, Student, ExamTerm, GradeScale). Historical
// Sections/Enrollments/Examinations that reference a deactivated class
// are entirely unaffected — deactivation only hides it from *future*
// selection (`listSchoolClassesBySchool()`'s own `deletedAt: null`
// filter), never corrupts what already exists.
export async function deactivateSchoolClass(
  schoolClassId: string,
  tx: Prisma.TransactionClient = db,
) {
  return tx.schoolClass.update({ where: { id: schoolClassId }, data: { deletedAt: new Date() } });
}

export async function reactivateSchoolClass(
  schoolClassId: string,
  tx: Prisma.TransactionClient = db,
) {
  return tx.schoolClass.update({ where: { id: schoolClassId }, data: { deletedAt: null } });
}

// Structure Health's own "Classes missing sections"/count displays — one
// query per class is acceptable here (a school has a handful of classes,
// never a high-volume table), matching this codebase's own established
// "small N, not a scan" tolerance (e.g. Principal Workspace's own
// per-section loop).
export async function countSectionsForClassAndYear(schoolClassId: string, academicYearId: string) {
  return db.section.count({ where: { schoolClassId, academicYearId, deletedAt: null } });
}

export async function countEnrollmentsForClassAndYear(
  schoolClassId: string,
  academicYearId: string,
) {
  return db.enrollment.count({
    where: { academicYearId, section: { schoolClassId, deletedAt: null } },
  });
}
