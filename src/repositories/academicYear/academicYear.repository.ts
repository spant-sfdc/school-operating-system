import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findCurrentAcademicYear(schoolId: string) {
  return db.academicYear.findFirst({ where: { schoolId, isCurrent: true } });
}

// Sprint E11 — Promotion's own "does the target academic year actually
// exist" read (Q13); the Directory/Detail id-based lookup every other
// entity in this codebase already has, that AcademicYear itself never
// needed until now.
export async function findAcademicYearById(id: string) {
  return db.academicYear.findUnique({ where: { id } });
}

// The Academic Year filter dropdown on the Student Directory (Sprint E1) —
// the first caller that needs every year, not just the current one.
export async function listAcademicYearsBySchool(schoolId: string) {
  return db.academicYear.findMany({ where: { schoolId }, orderBy: { startDate: "desc" } });
}

export async function findAcademicYearByLabel(schoolId: string, label: string) {
  return db.academicYear.findUnique({ where: { schoolId_label: { schoolId, label } } });
}

export async function updateAcademicYear(
  id: string,
  input: Prisma.AcademicYearUpdateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.academicYear.update({ where: { id }, data: input });
}

export async function upsertAcademicYear(
  schoolId: string,
  label: string,
  input: Prisma.AcademicYearCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.academicYear.upsert({
    where: { schoolId_label: { schoolId, label } },
    update: {},
    create: input,
  });
}
