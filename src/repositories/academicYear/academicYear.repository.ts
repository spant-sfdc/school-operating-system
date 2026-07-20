import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findCurrentAcademicYear(schoolId: string) {
  return db.academicYear.findFirst({ where: { schoolId, isCurrent: true } });
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
