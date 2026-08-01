import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { MarksSubmissionStatus } from "@/generated/prisma/enums";

// Included consistently across every read below — the service-layer DTO
// mapper needs the schedule/subject/section a MarksSubmission composes,
// not just bare foreign keys. Same-query Prisma `include`, not a call
// into another repository's exported functions.
const MARKS_SUBMISSION_INCLUDE = {
  examSubjectSchedule: { include: { subject: true } },
  section: { include: { schoolClass: true } },
} satisfies Prisma.MarksSubmissionInclude;

// The "does a submission already exist for this (schedule, section)"
// check — mirrors findAttendanceSessionBySectionAndDate()'s own
// existence-check shape. Used both to decide CREATE vs. RESUBMIT and by
// the Teacher Grid to surface current review state.
export async function findMarksSubmissionByScheduleAndSection(
  examSubjectScheduleId: string,
  sectionId: string,
  tx: Prisma.TransactionClient = db,
) {
  return tx.marksSubmission.findUnique({
    where: { examSubjectScheduleId_sectionId: { examSubjectScheduleId, sectionId } },
    include: MARKS_SUBMISSION_INCLUDE,
  });
}

export async function findMarksSubmissionById(id: string, tx: Prisma.TransactionClient = db) {
  return tx.marksSubmission.findUnique({ where: { id }, include: MARKS_SUBMISSION_INCLUDE });
}

// The Principal/Admin Result Dashboard's own primary read — grouped by
// status at the database layer, per this sprint's own explicit Q18 scale
// requirement ("must not load every MarksRecord... to show a dashboard").
// Bounded by [ExamSubjectSchedule x Section] cardinality (a few hundred
// rows at most, even at 2,500 students), never [Student] cardinality.
export async function listMarksSubmissionsForExamination(examinationId: string) {
  return db.marksSubmission.findMany({
    where: { examinationId },
    include: MARKS_SUBMISSION_INCLUDE,
  });
}

export async function countMarksSubmissionsByStatusForExamination(
  examinationId: string,
): Promise<Record<MarksSubmissionStatus, number>> {
  const grouped = await db.marksSubmission.groupBy({
    by: ["status"],
    where: { examinationId },
    _count: { status: true },
  });
  const counts: Record<MarksSubmissionStatus, number> = { SUBMITTED: 0, RETURNED: 0, APPROVED: 0 };
  for (const row of grouped) {
    counts[row.status] = row._count.status;
  }
  return counts;
}

// Deliberately no `include` here — matches every other create() in this
// codebase's own established avoidance of the create()+include
// decomposition warning inside an open transaction (D-046). Callers
// needing the full relational shape call findMarksSubmissionById(id, tx)
// — same tx, still inside the transaction — as a separate, single-query
// read.
export async function createMarksSubmission(
  input: Prisma.MarksSubmissionCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.marksSubmission.create({ data: input });
}

// Resubmission — SUBMITTED again after RETURNED, incrementing
// resubmissionCount. A plain field update, no create()+include concern.
export async function markMarksSubmissionResubmitted(
  id: string,
  submittedByUserId: string,
  tx: Prisma.TransactionClient = db,
) {
  return tx.marksSubmission.update({
    where: { id },
    data: {
      status: "SUBMITTED",
      submittedByUserId,
      submittedAt: new Date(),
      resubmissionCount: { increment: 1 },
    },
  });
}

export async function returnMarksSubmission(
  id: string,
  reviewedByUserId: string,
  returnReason: string,
  tx: Prisma.TransactionClient = db,
) {
  return tx.marksSubmission.update({
    where: { id },
    data: { status: "RETURNED", reviewedByUserId, reviewedAt: new Date(), returnReason },
  });
}

export async function approveMarksSubmission(
  id: string,
  reviewedByUserId: string,
  tx: Prisma.TransactionClient = db,
) {
  return tx.marksSubmission.update({
    where: { id },
    data: { status: "APPROVED", reviewedByUserId, reviewedAt: new Date() },
  });
}
