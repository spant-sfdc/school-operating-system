import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// Included consistently across every read below — the service-layer DTO
// mapper needs the student a MarksRecord composes, not just its bare
// enrollmentId. Same-query Prisma `include`, not a call into another
// repository's exported functions.
const MARKS_RECORD_INCLUDE = {
  enrollment: { include: { student: true } },
} satisfies Prisma.MarksRecordInclude;

// Sprint E10 — Academic History's own single read: every MarksRecord
// belonging to any of this student's enrollments (all years), scoped to
// `examination.status === "PUBLISHED"` at the database level, never
// filtered in application code. This is the authoritative boundary
// (Sprint E10's own Q1) — a PUBLISHED Examination's own publish gate
// (Sprint E9's getPublicationReadiness()) already required every
// (schedule, section) pair to be an APPROVED MarksSubmission before the
// status flip could happen, so re-checking MarksSubmission.status here
// would be pure duplication, not additional safety. One query, not one
// per record or per examination — bounded by
// [enrollments x subjects-per-exam] cardinality for a single student
// (small, even across 10-15 years), never a table scan.
const PUBLISHED_MARKS_RECORD_INCLUDE = {
  examSubjectSchedule: {
    include: {
      subject: true,
      examination: { include: { examTerm: true } },
    },
  },
} satisfies Prisma.MarksRecordInclude;

export async function listPublishedMarksRecordsByEnrollments(enrollmentIds: string[]) {
  if (enrollmentIds.length === 0) return [];
  return db.marksRecord.findMany({
    where: {
      enrollmentId: { in: enrollmentIds },
      examSubjectSchedule: { examination: { status: "PUBLISHED" } },
    },
    include: PUBLISHED_MARKS_RECORD_INCLUDE,
  });
}

// Sprint E12 — the Report Card's own single read: one student's one
// examination's worth of PUBLISHED subjects, not the full multi-year
// scan listPublishedMarksRecordsByEnrollments() does. Same authoritative
// `examination.status === "PUBLISHED"` boundary, enforced at the database
// level, per Sprint E10's own Q1 answer — never re-checked in application
// code, never re-validated against MarksSubmission.status (Sprint E9's
// own publish gate already structurally guarantees it).
export async function listPublishedMarksRecordsForEnrollmentAndExamination(
  enrollmentId: string,
  examinationId: string,
) {
  return db.marksRecord.findMany({
    where: {
      enrollmentId,
      examSubjectSchedule: { examinationId, examination: { status: "PUBLISHED" } },
    },
    include: PUBLISHED_MARKS_RECORD_INCLUDE,
  });
}

// The pre-transaction existence/previous-value check — resolved by the
// service before opening db.$transaction(), per
// docs/engineering/ENGINEERING_PRINCIPLES.md § 4, mirroring
// findAttendanceRecordBySessionAndEnrollment()'s own precedent exactly.
export async function findMarksRecordByEnrollmentAndSchedule(
  enrollmentId: string,
  examSubjectScheduleId: string,
) {
  return db.marksRecord.findUnique({
    where: { enrollmentId_examSubjectScheduleId: { enrollmentId, examSubjectScheduleId } },
  });
}

export async function findMarksRecordById(id: string, tx: Prisma.TransactionClient = db) {
  return tx.marksRecord.findUnique({ where: { id }, include: MARKS_RECORD_INCLUDE });
}

// "This subject's marks, for one section" — joins through Enrollment
// (which carries sectionId) since MarksRecord itself has no sectionId of
// its own (ExamSubjectSchedule is class-wide, not section-scoped — see
// the Prisma schema's own Sprint E7 migration-header comment). The Grid's
// own read, and the "how many students already have a SUBMITTED mark"
// derivation both use this.
export async function listMarksRecordsForScheduleAndSection(
  examSubjectScheduleId: string,
  sectionId: string,
) {
  return db.marksRecord.findMany({
    where: { examSubjectScheduleId, enrollment: { sectionId } },
    include: MARKS_RECORD_INCLUDE,
  });
}

// Upsert, not create — the same reasoning
// docs/database/TRANSACTION_BOUNDARIES.md § 5 already established for
// AttendanceRecord: the (enrollmentId, examSubjectScheduleId) unique
// constraint, not an application-level check, is what actually prevents a
// duplicate mark. `enteredByUserId` is set only on the CREATE branch —
// never overwritten on an update, so "who originally entered this" stays
// distinct from "who last edited it" (`lastEditedByUserId`/
// `lastEditedAt`), mirroring MarksRecord's own certified field shape
// (DOMAIN_MODEL.md § 8.5). Deliberately no `include` on either branch,
// same reasoning as upsertAttendanceRecord()'s own comment.
export async function upsertMarksRecord(
  enrollmentId: string,
  examSubjectScheduleId: string,
  schoolId: string,
  marksObtained: number,
  actorUserId: string,
  tx: Prisma.TransactionClient = db,
) {
  return tx.marksRecord.upsert({
    where: { enrollmentId_examSubjectScheduleId: { enrollmentId, examSubjectScheduleId } },
    create: {
      school: { connect: { schoolId } },
      enrollment: { connect: { id: enrollmentId } },
      examSubjectSchedule: { connect: { id: examSubjectScheduleId } },
      marksObtained,
      enteredByUserId: actorUserId,
    },
    update: { marksObtained, lastEditedByUserId: actorUserId, lastEditedAt: new Date() },
  });
}

// The one, atomic status transition submitMarks() uses — bulk-flips every
// named enrollment's MarksRecord for this schedule from DRAFT to
// SUBMITTED. Scoped to an explicit enrollmentId list (the section's own
// roster, resolved by the caller), not "every record for this schedule
// across every section" — submission is per-section, per
// this sprint's own workflow ("Select Subject -> Select Section -> Grid").
export async function markMarksRecordsSubmitted(
  examSubjectScheduleId: string,
  enrollmentIds: string[],
  tx: Prisma.TransactionClient = db,
) {
  return tx.marksRecord.updateMany({
    where: { examSubjectScheduleId, enrollmentId: { in: enrollmentIds } },
    data: { status: "SUBMITTED" },
  });
}

// Sprint E9's own "Return for Correction" wiring point — the mirror image
// of markMarksRecordsSubmitted() above. Reverting every record in this
// (schedule, section) scope back to DRAFT is what re-opens Sprint E8's own
// already-built teacher-edit guard (saveDraftMarks()'s own
// resolveAndValidateBatch() rejects writes only when status === SUBMITTED)
// — no new teacher-side lock-check logic was written for this sprint;
// this one repository call is the entire mechanism.
export async function revertMarksRecordsToDraft(
  examSubjectScheduleId: string,
  sectionId: string,
  tx: Prisma.TransactionClient = db,
) {
  return tx.marksRecord.updateMany({
    where: { examSubjectScheduleId, enrollment: { sectionId } },
    data: { status: "DRAFT" },
  });
}
