import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

const CLASS_SUBJECT_INCLUDE = {
  subject: true,
  schoolClass: true,
} satisfies Prisma.ClassSubjectInclude;

export async function findClassSubject(schoolClassId: string, subjectId: string) {
  return db.classSubject.findUnique({
    where: { schoolClassId_subjectId: { schoolClassId, subjectId } },
  });
}

// "Which subjects does this class study" — Structure Health's own
// "Classes missing subjects" check and the Class Detail page's own
// Subjects panel both read this.
export async function listSubjectsForClass(schoolClassId: string) {
  return db.classSubject.findMany({
    where: { schoolClassId, deletedAt: null },
    include: CLASS_SUBJECT_INCLUDE,
    orderBy: { subject: { name: "asc" } },
  });
}

// "Which classes study this subject" — the Subject Directory's own
// per-subject class-count column.
export async function listClassesForSubject(subjectId: string) {
  return db.classSubject.findMany({
    where: { subjectId, deletedAt: null },
    include: CLASS_SUBJECT_INCLUDE,
    orderBy: { schoolClass: { sortOrder: "asc" } },
  });
}

// Bulk count for the Class Directory's own "Subjects" column — one query
// for every class in the school, not one query per class.
export async function countSubjectsByClass(schoolClassIds: string[]) {
  if (schoolClassIds.length === 0) return new Map<string, number>();
  const rows = await db.classSubject.groupBy({
    by: ["schoolClassId"],
    where: { schoolClassId: { in: schoolClassIds }, deletedAt: null },
    _count: { schoolClassId: true },
  });
  return new Map(rows.map((r) => [r.schoolClassId, r._count.schoolClassId]));
}

export async function createClassSubject(
  input: Prisma.ClassSubjectCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.classSubject.create({ data: input });
}

export async function deactivateClassSubject(id: string, tx: Prisma.TransactionClient = db) {
  return tx.classSubject.update({ where: { id }, data: { deletedAt: new Date() } });
}

// The "toggle back on" path — reconciliation (assignSubjectToClasses())
// reactivates a previously-removed link rather than creating a duplicate
// row, since `@@unique([schoolClassId, subjectId])` permits only one row
// per pair regardless of its own deletedAt history.
export async function reactivateClassSubject(id: string, tx: Prisma.TransactionClient = db) {
  return tx.classSubject.update({ where: { id }, data: { deletedAt: null } });
}
