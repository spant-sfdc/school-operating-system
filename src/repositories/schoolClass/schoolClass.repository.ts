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
