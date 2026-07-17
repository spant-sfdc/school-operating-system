import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findSchoolById(schoolId: string) {
  return db.school.findUnique({ where: { schoolId } });
}

export async function upsertSchool(
  schoolId: string,
  input: Prisma.SchoolCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.school.upsert({
    where: { schoolId },
    update: {},
    create: input,
  });
}
