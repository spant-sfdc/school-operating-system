import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findStudentById(id: string) {
  return db.student.findUnique({ where: { id } });
}

export async function findStudentByAdmissionNumber(schoolId: string, admissionNumber: string) {
  return db.student.findUnique({
    where: { schoolId_admissionNumber: { schoolId, admissionNumber } },
  });
}

export async function listActiveStudentsBySchool(schoolId: string) {
  return db.student.findMany({
    where: { schoolId, status: "ACTIVE" },
    orderBy: { admissionNumber: "asc" },
  });
}

export async function createStudent(
  input: Prisma.StudentCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.student.create({ data: input });
}

// StudentGuardian has no dedicated repository — it isn't in this sprint's
// named repository list. Its data access lives here, on the Student side,
// since "list guardians for a student" is DATABASE_REVIEW.md § 3's
// first-listed query pattern for the join table.

export async function linkGuardianToStudent(
  input: Prisma.StudentGuardianCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.studentGuardian.create({ data: input });
}

export async function listGuardiansForStudent(studentId: string) {
  return db.studentGuardian.findMany({
    where: { studentId, deletedAt: null },
    include: { guardian: true },
  });
}
