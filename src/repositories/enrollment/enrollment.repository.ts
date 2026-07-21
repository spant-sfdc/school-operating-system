import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// Included consistently across every read below — Enrollment is the
// temporal hub every year-scoped fact keys off (DOMAIN_MODEL.md § 6.1,
// D-022), and every consumer of it (starting with the service-layer DTO
// mapper) needs the student/section/class/year it composes, not just the
// bare FK ids.
const ENROLLMENT_INCLUDE = {
  student: true,
  academicYear: true,
  section: { include: { schoolClass: true } },
} satisfies Prisma.EnrollmentInclude;

// Optional `tx` — a plain findUnique()+include is a single, non-decomposed
// query, so it's safe to call from inside a still-open transaction that
// just created the row, via that same `tx` — see createEnrollment()'s own
// comment for why the create itself can't carry the same include.
export async function findEnrollmentById(id: string, tx: Prisma.TransactionClient = db) {
  return tx.enrollment.findUnique({ where: { id }, include: ENROLLMENT_INCLUDE });
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

// Deliberately no `include` here — matches
// src/repositories/teacherAssignment/teacherAssignment.repository.ts's
// createTeacherAssignment(): Prisma's query engine decomposes a
// `create()+include` call into multiple physical queries even for a single
// client call, and issuing those from inside an open interactive
// transaction (`tx`) risks the same "client already executing a query"
// warning found and fixed for Teacher/Attendance in Sprint D4 (D-046).
// Callers needing the full relational shape should call
// findEnrollmentById(id, tx) — the same tx, still inside the transaction —
// as a separate, single-query read.
export async function createEnrollment(
  input: Prisma.EnrollmentCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.enrollment.create({ data: input });
}
