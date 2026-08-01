import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findGradeScaleById(id: string) {
  return db.gradeScale.findUnique({ where: { id } });
}

export async function findGradeScaleByName(schoolId: string, name: string) {
  return db.gradeScale.findFirst({ where: { schoolId, name, deletedAt: null } });
}

export async function listGradeScalesBySchool(schoolId: string) {
  return db.gradeScale.findMany({
    where: { schoolId, deletedAt: null },
    orderBy: { name: "asc" },
  });
}

export async function createGradeScale(
  input: Prisma.GradeScaleCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.gradeScale.create({ data: input });
}

// No reference guard yet (unlike deactivateExamTerm()'s own
// count-before-deactivate pattern) — nothing references GradeScale this
// sprint (MarksRecord, its future consumer, is explicitly out of Sprint
// E7's scope). A future sprint building MarksRecord should add the same
// guard shape here once that dependency exists — named, not silently
// assumed safe forever.
export async function deactivateGradeScale(id: string, tx: Prisma.TransactionClient = db) {
  return tx.gradeScale.update({ where: { id }, data: { deletedAt: new Date() } });
}
