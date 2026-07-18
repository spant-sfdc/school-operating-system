import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// Included consistently across every read below — Enrollment is the
// aggregate root (docs/database/DATABASE_REVIEW.md § 1/§ 8), and every
// consumer of it (starting with the service-layer DTO mapper) needs the
// student/section/class/year it composes, not just the bare FK ids.
const ENROLLMENT_INCLUDE = {
  student: true,
  academicYear: true,
  section: { include: { schoolClass: true } },
} satisfies Prisma.EnrollmentInclude;

export async function findEnrollmentById(id: string) {
  return db.enrollment.findUnique({ where: { id }, include: ENROLLMENT_INCLUDE });
}

export async function findEnrollmentByStudentAndYear(studentId: string, academicYearId: string) {
  return db.enrollment.findUnique({
    where: { studentId_academicYearId: { studentId, academicYearId } },
    include: ENROLLMENT_INCLUDE,
  });
}

// "This section's roster" — docs/database/DATABASE_REVIEW.md § 8's
// highest-frequency query against this table.
export async function listEnrollmentsBySection(sectionId: string, academicYearId: string) {
  return db.enrollment.findMany({
    where: { sectionId, academicYearId },
    include: ENROLLMENT_INCLUDE,
    orderBy: { rollNumber: "asc" },
  });
}

export async function createEnrollment(
  input: Prisma.EnrollmentCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.enrollment.create({ data: input, include: ENROLLMENT_INCLUDE });
}
