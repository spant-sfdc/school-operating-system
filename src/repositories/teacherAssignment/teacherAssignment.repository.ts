import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// Included consistently across every read below — the service-layer DTO
// mapper needs the teacher/section/class/subject/year an assignment
// composes, not just its bare foreign keys. This is a same-query Prisma
// `include` across tables, not a call into another repository's exported
// functions — repositories may join tables, they may not call each other.
const ASSIGNMENT_INCLUDE = {
  teacher: true,
  academicYear: true,
  section: { include: { schoolClass: true } },
  subject: true,
} satisfies Prisma.TeacherAssignmentInclude;

export async function findTeacherAssignmentById(id: string) {
  return db.teacherAssignment.findUnique({ where: { id }, include: ASSIGNMENT_INCLUDE });
}

// The "is this section already assigned this subject this year" duplicate
// check — mirrors the Prisma-native @@unique([academicYearId, sectionId,
// subjectId]).
export async function findSubjectAssignment(
  academicYearId: string,
  sectionId: string,
  subjectId: string,
) {
  return db.teacherAssignment.findFirst({
    where: { academicYearId, sectionId, subjectId, deletedAt: null },
  });
}

// The "does this section already have a Class Teacher this year" check —
// mirrors the hand-added partial unique index (WHERE is_class_teacher = true).
export async function findClassTeacherForSection(sectionId: string, academicYearId: string) {
  return db.teacherAssignment.findFirst({
    where: { sectionId, academicYearId, isClassTeacher: true, deletedAt: null },
  });
}

// "What am I teaching" — a teacher's own schedule, per
// docs/database/DATABASE_REVIEW.md § 7 query pattern (a).
export async function listAssignmentsForTeacher(teacherId: string, academicYearId: string) {
  return db.teacherAssignment.findMany({
    where: { teacherId, academicYearId, deletedAt: null },
    include: ASSIGNMENT_INCLUDE,
  });
}

// "Who teaches this section" — the permission-check query, per
// docs/database/DATABASE_REVIEW.md § 7 query pattern (b).
export async function listAssignmentsForSection(sectionId: string, academicYearId: string) {
  return db.teacherAssignment.findMany({
    where: { sectionId, academicYearId, deletedAt: null },
    include: ASSIGNMENT_INCLUDE,
  });
}

// Deliberately no `include` here, unlike the reads above — Prisma's query
// engine decomposes a `create()+include` call into multiple physical
// queries even for a single client call, and issuing those from inside an
// open interactive transaction (`tx`) triggers a real, reproducible
// "client already executing a query" warning (confirmed against this
// project's own already-shipped src/repositories/enrollment/ code too, not
// something Sprint 4 introduced — see docs/DECISIONS.md's Sprint 4 entry).
// Callers needing the full relational shape should call
// findTeacherAssignmentById() as a separate, standalone read after the
// transaction that created the row has committed.
export async function createTeacherAssignment(
  input: Prisma.TeacherAssignmentCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.teacherAssignment.create({ data: input });
}

// Ends an assignment without destroying the historical fact "Teacher X
// taught Section Y in year Z" — docs/database/DATABASE_REVIEW.md § 7's own
// reasoning for why reassignment must soft-delete, never mutate in place.
export async function deactivateTeacherAssignment(id: string, tx: Prisma.TransactionClient = db) {
  return tx.teacherAssignment.update({ where: { id }, data: { deletedAt: new Date() } });
}
