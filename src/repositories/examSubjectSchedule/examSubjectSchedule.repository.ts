import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// Included consistently across every read below — the service-layer DTO
// mapper needs the subject/teacher an ExamSubjectSchedule composes, not
// just bare foreign keys. Same-query Prisma `include`, not a call into
// another repository's exported functions.
const SCHEDULE_INCLUDE = {
  subject: true,
  teacher: true,
} satisfies Prisma.ExamSubjectScheduleInclude;

// Optional `tx` — a plain findUnique()+include is a single, non-decomposed
// query, safe to call from inside a still-open transaction via that same
// `tx` — see createExamSubjectSchedule()'s own comment.
export async function findExamSubjectScheduleById(id: string, tx: Prisma.TransactionClient = db) {
  return tx.examSubjectSchedule.findUnique({ where: { id }, include: SCHEDULE_INCLUDE });
}

// The "is this subject already scheduled for this examination" duplicate
// check — mirrors the Prisma-native @@unique([examinationId, subjectId]).
export async function findExamSubjectSchedule(examinationId: string, subjectId: string) {
  return db.examSubjectSchedule.findUnique({
    where: { examinationId_subjectId: { examinationId, subjectId } },
    include: SCHEDULE_INCLUDE,
  });
}

export async function listSubjectSchedulesForExamination(examinationId: string) {
  return db.examSubjectSchedule.findMany({
    where: { examinationId, deletedAt: null },
    include: SCHEDULE_INCLUDE,
    orderBy: { examDate: "asc" },
  });
}

// "Has any subject been scheduled yet" — publishExamination()'s own
// belt-and-suspenders check, and scheduleSubjectExam()'s own "is this the
// first subject" check (which drives the DRAFT -> SCHEDULED bump).
export async function countSubjectSchedulesForExamination(examinationId: string) {
  return db.examSubjectSchedule.count({ where: { examinationId, deletedAt: null } });
}

// Deliberately no `include` here — matches
// src/repositories/teacherAssignment/teacherAssignment.repository.ts's
// createTeacherAssignment(): avoids the create()+include decomposition
// warning inside an open transaction (see D-046). Callers needing the full
// relational shape should call findExamSubjectScheduleById(id, tx) — same
// tx, still inside the transaction — as a separate, single-query read.
export async function createExamSubjectSchedule(
  input: Prisma.ExamSubjectScheduleCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.examSubjectSchedule.create({ data: input });
}
