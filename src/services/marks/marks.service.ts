import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import { findUserById } from "@/repositories/user";
import { findEnrollmentById } from "@/repositories/enrollment";
import {
  findMarksRecordByEnrollmentAndSchedule,
  findMarksRecordById,
  upsertMarksRecord,
  markMarksRecordsSubmitted,
} from "@/repositories/marksRecord";
import { getExamSubjectScheduleById } from "@/services/examination";
import {
  saveDraftMarksInputSchema,
  submitMarksInputSchema,
  type SaveDraftMarksInput,
  type SubmitMarksInput,
} from "@/lib/validations/marks";
import { toMarksRecordDTO, type MarksRecordDTO } from "@/services/marks/dto/marksRecord.dto";

export class MarksValidationError extends Error {}
export class MarksLockedError extends Error {}

/**
 * Resolves and validates every row of a batch against the schedule's own
 * maxMarks and each enrollment's own section — shared by
 * saveDraftMarks()/submitMarks() below. Per BUSINESS_RULES.md § 5:
 * `marksObtained` must be `>= 0` (Zod's own job) `<= maxMarks` (this
 * function's job, since maxMarks varies per schedule, not a static rule
 * Zod can express). Also rejects any row already SUBMITTED — "after
 * submission, teacher cannot modify" (this sprint's own explicit
 * instruction) — resolved before opening a transaction, per
 * docs/engineering/ENGINEERING_PRINCIPLES.md § 4.
 */
async function resolveAndValidateBatch(
  examSubjectScheduleId: string,
  sectionId: string,
  records: { enrollmentId: string; marksObtained: number }[],
  maxMarks: number,
) {
  const resolved: {
    enrollmentId: string;
    marksObtained: number;
    existingId: string | null;
  }[] = [];

  for (const record of records) {
    const enrollment = await findEnrollmentById(record.enrollmentId);
    if (!enrollment) {
      throw new Error(`Enrollment not found: ${record.enrollmentId}`);
    }
    if (enrollment.sectionId !== sectionId) {
      throw new Error(
        `Enrollment ${record.enrollmentId} is not enrolled in section ${sectionId} — cannot enter marks for it here.`,
      );
    }
    if (record.marksObtained > maxMarks) {
      throw new MarksValidationError(
        `Marks obtained (${record.marksObtained}) cannot exceed the maximum marks (${maxMarks}) for this subject.`,
      );
    }

    const existing = await findMarksRecordByEnrollmentAndSchedule(
      record.enrollmentId,
      examSubjectScheduleId,
    );
    if (existing?.status === "SUBMITTED") {
      throw new MarksLockedError(
        `Marks for enrollment ${record.enrollmentId} have already been submitted and cannot be modified.`,
      );
    }

    resolved.push({
      enrollmentId: record.enrollmentId,
      marksObtained: record.marksObtained,
      existingId: existing?.id ?? null,
    });
  }

  return resolved;
}

/**
 * Saves partially-completed marks entry — "Save Draft," no submission,
 * per this sprint's own explicit requirement. A whole section's worth of
 * rows upserted in one transaction, mirroring submitAttendance()'s own
 * batch shape (docs/database/TRANSACTION_BOUNDARIES.md § 2/§ 3's "one
 * transaction per save action" guidance) — rows stay `status: DRAFT`
 * (upsertMarksRecord() never touches status on its own; only
 * markMarksRecordsSubmitted() does).
 *
 * Optional `tx`, the same passthrough pattern every write in this codebase
 * uses — so a future Marks/Results importer's commit handler can call
 * this inside its own per-row transaction.
 */
export async function saveDraftMarks(
  input: SaveDraftMarksInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<MarksRecordDTO[]> {
  const validated = saveDraftMarksInputSchema.parse(input);

  const schedule = await getExamSubjectScheduleById(validated.examSubjectScheduleId);
  if (!schedule) {
    throw new Error(`Exam subject schedule not found: ${validated.examSubjectScheduleId}`);
  }

  const actor = await findUserById(actorUserId);
  if (!actor) {
    throw new Error(`User not found: ${actorUserId}`);
  }

  const resolved = await resolveAndValidateBatch(
    validated.examSubjectScheduleId,
    validated.sectionId,
    validated.records,
    schedule.maxMarks,
  );

  const run = async (t: Prisma.TransactionClient) => {
    const written: MarksRecordDTO[] = [];
    for (const record of resolved) {
      const row = await upsertMarksRecord(
        record.enrollmentId,
        validated.examSubjectScheduleId,
        actor.schoolId,
        record.marksObtained,
        actorUserId,
        t,
      );

      await writeAuditLog(t, {
        schoolId: actor.schoolId,
        entityType: "MarksRecord",
        entityId: row.id,
        actorUserId,
        action: record.existingId ? "UPDATE" : "CREATE",
        afterValue: { marksObtained: record.marksObtained, status: "DRAFT" },
      });

      const reloaded = await findMarksRecordById(row.id, t);
      if (!reloaded) {
        throw new Error(`Failed to load newly-saved marks record: ${row.id}`);
      }
      written.push(toMarksRecordDTO(reloaded));
    }
    return written;
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Submits marks — the real teacher-facing final action. Requires every
 * enrolled student in the batch to already have a resolvable value ("no
 * missing marks," this sprint's own explicit validation requirement) —
 * enforced by the caller (marksEntryWorkspace.service.ts) passing the
 * section's own full roster, not by this function guessing who's missing.
 * One atomic transaction: every row upserted, then the whole batch's
 * status flipped DRAFT -> SUBMITTED via markMarksRecordsSubmitted(), each
 * write audit-logged, matching submitAttendance()'s own shape exactly
 * (per-record AuditLog entries plus one summary entry).
 *
 * Optional `tx`, same passthrough pattern as saveDraftMarks() above.
 */
export async function submitMarks(
  input: SubmitMarksInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<MarksRecordDTO[]> {
  const validated = submitMarksInputSchema.parse(input);

  const schedule = await getExamSubjectScheduleById(validated.examSubjectScheduleId);
  if (!schedule) {
    throw new Error(`Exam subject schedule not found: ${validated.examSubjectScheduleId}`);
  }

  const actor = await findUserById(actorUserId);
  if (!actor) {
    throw new Error(`User not found: ${actorUserId}`);
  }

  const resolved = await resolveAndValidateBatch(
    validated.examSubjectScheduleId,
    validated.sectionId,
    validated.records,
    schedule.maxMarks,
  );

  const run = async (t: Prisma.TransactionClient) => {
    const written: { id: string }[] = [];
    for (const record of resolved) {
      const row = await upsertMarksRecord(
        record.enrollmentId,
        validated.examSubjectScheduleId,
        actor.schoolId,
        record.marksObtained,
        actorUserId,
        t,
      );

      await writeAuditLog(t, {
        schoolId: actor.schoolId,
        entityType: "MarksRecord",
        entityId: row.id,
        actorUserId,
        action: record.existingId ? "UPDATE" : "CREATE",
        afterValue: { marksObtained: record.marksObtained },
      });

      written.push({ id: row.id });
    }

    await markMarksRecordsSubmitted(
      validated.examSubjectScheduleId,
      resolved.map((r) => r.enrollmentId),
      t,
    );

    await writeAuditLog(t, {
      schoolId: actor.schoolId,
      entityType: "ExamSubjectSchedule",
      entityId: validated.examSubjectScheduleId,
      actorUserId,
      action: "UPDATE",
      afterValue: {
        event: "MarksSubmitted",
        sectionId: validated.sectionId,
        recordCount: resolved.length,
      },
    });

    const reloaded: MarksRecordDTO[] = [];
    for (const row of written) {
      const found = await findMarksRecordById(row.id, t);
      if (!found) {
        throw new Error(`Failed to load submitted marks record: ${row.id}`);
      }
      reloaded.push(toMarksRecordDTO(found));
    }
    return reloaded;
  };

  return tx ? run(tx) : db.$transaction(run);
}
