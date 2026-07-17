import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findSubjectById(id: string) {
  return db.subject.findUnique({ where: { id } });
}

export async function findSubjectByName(schoolId: string, name: string) {
  return db.subject.findFirst({ where: { schoolId, name, deletedAt: null } });
}

export async function listSubjectsBySchool(schoolId: string) {
  return db.subject.findMany({
    where: { schoolId, deletedAt: null },
    orderBy: { name: "asc" },
  });
}

export async function createSubject(
  input: Prisma.SubjectCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.subject.create({ data: input });
}
