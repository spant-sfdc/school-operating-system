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

export async function createSection(
  input: Prisma.SectionCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.section.create({ data: input });
}
