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

// Sprint E13 — the Subject Directory's own listing, same reasoning as
// listAllSchoolClassesBySchool() (schoolClass.repository.ts).
export async function listAllSubjectsBySchool(schoolId: string) {
  return db.subject.findMany({ where: { schoolId }, orderBy: { name: "asc" } });
}

export async function createSubject(
  input: Prisma.SubjectCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.subject.create({ data: input });
}

// Sprint E13 — edit (name, code) and deactivate/reactivate, matching
// every other entity's own "deactivate, never delete" precedent.
export async function updateSubject(
  subjectId: string,
  input: Prisma.SubjectUpdateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.subject.update({ where: { id: subjectId }, data: input });
}

export async function deactivateSubject(subjectId: string, tx: Prisma.TransactionClient = db) {
  return tx.subject.update({ where: { id: subjectId }, data: { deletedAt: new Date() } });
}

export async function reactivateSubject(subjectId: string, tx: Prisma.TransactionClient = db) {
  return tx.subject.update({ where: { id: subjectId }, data: { deletedAt: null } });
}
