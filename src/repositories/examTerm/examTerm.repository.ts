import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findExamTermById(id: string) {
  return db.examTerm.findUnique({ where: { id } });
}

export async function findExamTermByName(academicYearId: string, name: string) {
  return db.examTerm.findFirst({ where: { academicYearId, name, deletedAt: null } });
}

export async function listExamTermsByAcademicYear(academicYearId: string) {
  return db.examTerm.findMany({
    where: { academicYearId, deletedAt: null },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createExamTerm(
  input: Prisma.ExamTermCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.examTerm.create({ data: input });
}

// Ends an ExamTerm once no Examination remains scheduled against it, per
// DOMAIN_MODEL.md § 8.1's own stated rule — the guard itself (counting
// Examinations) lives in examination.repository.ts, composed at the
// service layer (examination/examTerm.service.ts), not imported here:
// repositories never call repositories.
export async function deactivateExamTerm(id: string, tx: Prisma.TransactionClient = db) {
  return tx.examTerm.update({ where: { id }, data: { deletedAt: new Date() } });
}
