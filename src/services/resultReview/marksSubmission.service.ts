import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import { findUserById } from "@/repositories/user";
import {
  findMarksSubmissionByScheduleAndSection,
  findMarksSubmissionById,
  createMarksSubmission,
  markMarksSubmissionResubmitted,
  returnMarksSubmission as returnMarksSubmissionRow,
  approveMarksSubmission as approveMarksSubmissionRow,
} from "@/repositories/marksSubmission";
import { revertMarksRecordsToDraft } from "@/repositories/marksRecord";
import { getExamSubjectScheduleById, getExaminationById } from "@/services/examination";
import {
  submitMarksGrid,
  getMarksEntryWorkspace,
  type MarksGridSaveInput,
  MarksAuthorizationError,
  MarksLockedError,
} from "@/services/marks";
import {
  returnSubmissionInputSchema,
  approveSubmissionInputSchema,
  type ReturnSubmissionInput,
  type ApproveSubmissionInput,
} from "@/lib/validations/resultReview";
import {
  toMarksSubmissionDTO,
  type MarksSubmissionDTO,
} from "@/services/resultReview/dto/marksSubmission.dto";

export { MarksAuthorizationError, MarksLockedError };
export class SubmissionNotReturnedError extends Error {}
export class SubmissionNotSubmittedError extends Error {}

/**
 * Submits (or resubmits) marks for review — the one lifecycle function
 * that turns Sprint E8's own MarksRecord batch into a first-class,
 * reviewable MarksSubmission. Reuses submitMarksGrid() (marks entry
 * validation: authorization, examination-ACTIVE, not-already-locked,
 * no-missing-marks) completely unchanged, as a genuinely separate,
 * self-contained transaction — NOT one shared with the MarksSubmission
 * write below.
 *
 * An earlier revision tried sharing one transaction across both writes
 * (threading an optional `tx` through submitMarksGrid()) to close the
 * "orphaned state" gap where a crash between the two writes leaves
 * MarksRecords SUBMITTED with no MarksSubmission row. Live-verified
 * against the real Neon connection, that approach corrupted the shared
 * `pg` connection: getMarksEntryWorkspace() (called internally by
 * submitMarksGrid(), both before and after its own write) composes half a
 * dozen repositories, none tx-aware, so it always issues plain, non-tx
 * reads — doing that while an outer db.$transaction() held the connection
 * open triggered "Client already executing a query" and produced
 * silently-null writes downstream. Reverted — see submitMarksGrid()'s own
 * comment (marksEntryWorkspace.service.ts).
 *
 * Instead, the narrow crash window is closed with an idempotent recovery
 * check, not shared atomicity: if every row in this (schedule, section)
 * is already SUBMITTED (submitMarksGrid() already ran to completion in a
 * prior, crashed attempt), skip re-calling it — it would only reject with
 * MarksLockedError — and proceed straight to creating/advancing the
 * MarksSubmission row. A retry after a crash self-heals; it does not need
 * cross-transaction atomicity to do so.
 *
 * CREATE vs. resubmit is decided by whether a MarksSubmission already
 * exists for this (schedule, section) — the same row is reused across a
 * Return -> correct -> resubmit cycle (resubmissionCount increments),
 * never a second row per this sprint's own "unique per (schedule,
 * section)" design.
 */
export async function submitMarksForReview(
  input: MarksGridSaveInput,
  actorUserId: string,
  schoolId: string,
  actorAccessLevel: string,
  actorTeacherId: string | null,
): Promise<{
  workspace: Awaited<ReturnType<typeof getMarksEntryWorkspace>>;
  submission: MarksSubmissionDTO;
}> {
  const schedule = await getExamSubjectScheduleById(input.examSubjectScheduleId);
  if (!schedule) {
    throw new Error(`Exam subject schedule not found: ${input.examSubjectScheduleId}`);
  }
  const examination = await getExaminationById(schedule.examinationId);
  if (!examination) {
    throw new Error(`Examination not found: ${schedule.examinationId}`);
  }

  // Authorization is checked here, first — getMarksEntryWorkspace() runs
  // assertCanEnterMarksForScheduleAndSection() (Sprint E8, unchanged)
  // internally regardless of this section's own lock/review state, so an
  // unauthorized caller is always rejected with MarksAuthorizationError
  // before ever learning whether the section is locked, returned, or
  // approved — no state information leaks to a caller who has no business
  // looking at this section at all.
  const before = await getMarksEntryWorkspace(
    input.examSubjectScheduleId,
    input.sectionId,
    schoolId,
    actorAccessLevel,
    actorTeacherId,
  );
  if (!before) {
    throw new Error(`Marks entry workspace not found for schedule ${input.examSubjectScheduleId}.`);
  }

  const existing = await findMarksSubmissionByScheduleAndSection(
    input.examSubjectScheduleId,
    input.sectionId,
  );
  if (existing && existing.status !== "RETURNED") {
    throw new MarksLockedError(
      `This section's marks are already ${existing.status === "APPROVED" ? "approved" : "submitted and awaiting review"} — nothing to resubmit.`,
    );
  }

  const alreadyFullySubmitted =
    before.rows.length > 0 && before.rows.every((row) => row.status === "SUBMITTED");

  if (!alreadyFullySubmitted) {
    await submitMarksGrid(input, actorUserId, schoolId, actorAccessLevel, actorTeacherId);
  }

  const run = async (t: Prisma.TransactionClient) => {
    let submissionRow;
    if (existing) {
      submissionRow = await markMarksSubmissionResubmitted(existing.id, actorUserId, t);
      await writeAuditLog(t, {
        schoolId,
        entityType: "MarksSubmission",
        entityId: existing.id,
        actorUserId,
        action: "UPDATE",
        beforeValue: { status: "RETURNED" },
        afterValue: { status: "SUBMITTED", resubmissionCount: existing.resubmissionCount + 1 },
      });
    } else {
      submissionRow = await createMarksSubmission(
        {
          school: { connect: { schoolId } },
          examination: { connect: { id: examination.id } },
          examSubjectSchedule: { connect: { id: input.examSubjectScheduleId } },
          section: { connect: { id: input.sectionId } },
          submittedByUserId: actorUserId,
          submittedAt: new Date(),
        },
        t,
      );
      await writeAuditLog(t, {
        schoolId,
        entityType: "MarksSubmission",
        entityId: submissionRow.id,
        actorUserId,
        action: "CREATE",
        afterValue: {
          examSubjectScheduleId: input.examSubjectScheduleId,
          sectionId: input.sectionId,
          status: "SUBMITTED",
        },
      });
    }

    const reloaded = await findMarksSubmissionById(submissionRow.id, t);
    if (!reloaded) {
      throw new Error(`Failed to load submitted MarksSubmission: ${submissionRow.id}`);
    }
    return reloaded;
  };

  const submissionResult = await db.$transaction(run);

  const workspace = await getMarksEntryWorkspace(
    input.examSubjectScheduleId,
    input.sectionId,
    schoolId,
    actorAccessLevel,
    actorTeacherId,
  );

  return { workspace, submission: toMarksSubmissionDTO(submissionResult) };
}

/**
 * Returns a submission for correction — the Principal/Admin's own
 * "something is wrong, fix it" action. Requires a reason (validated by
 * returnSubmissionInputSchema's own min-length rule). Reverts every
 * MarksRecord in this (schedule, section) scope back to DRAFT
 * (revertMarksRecordsToDraft(), Sprint E9's own new repository function)
 * — the entire mechanism that re-opens Sprint E8's own already-built
 * teacher-edit guard, no duplicate lock-check logic written.
 */
export async function returnForCorrection(
  input: ReturnSubmissionInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<MarksSubmissionDTO> {
  const validated = returnSubmissionInputSchema.parse(input);

  const existing = await findMarksSubmissionByScheduleAndSection(
    validated.examSubjectScheduleId,
    validated.sectionId,
  );
  if (!existing) {
    throw new Error("No submission exists for this subject/section — nothing to return.");
  }
  if (existing.status !== "SUBMITTED") {
    throw new SubmissionNotSubmittedError(
      `Cannot return a submission in "${existing.status}" status — it must be SUBMITTED first.`,
    );
  }

  const actor = await findUserById(actorUserId);
  if (!actor) {
    throw new Error(`User not found: ${actorUserId}`);
  }

  const run = async (t: Prisma.TransactionClient) => {
    await revertMarksRecordsToDraft(validated.examSubjectScheduleId, validated.sectionId, t);

    const updated = await returnMarksSubmissionRow(existing.id, actorUserId, validated.reason, t);

    await writeAuditLog(t, {
      schoolId: actor.schoolId,
      entityType: "MarksSubmission",
      entityId: existing.id,
      actorUserId,
      action: "UPDATE",
      beforeValue: { status: "SUBMITTED" },
      afterValue: { status: "RETURNED", returnReason: validated.reason },
    });

    const reloaded = await findMarksSubmissionById(updated.id, t);
    if (!reloaded) {
      throw new Error(`Failed to load returned MarksSubmission: ${updated.id}`);
    }
    return toMarksSubmissionDTO(reloaded);
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Approves a submission — the Principal/Admin's own "this is correct"
 * action. Deliberately does NOT touch MarksRecord.status (it stays
 * SUBMITTED) — this is precisely what "prevent accidental Teacher edits
 * afterward" means in practice: Sprint E8's own resolveAndValidateBatch()
 * guard already blocks any write once a record's status is SUBMITTED, so
 * simply never reverting it to DRAFT (the way Return does) is the entire
 * mechanism, not a second lock to build.
 */
export async function approveSubmission(
  input: ApproveSubmissionInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<MarksSubmissionDTO> {
  const validated = approveSubmissionInputSchema.parse(input);

  const existing = await findMarksSubmissionByScheduleAndSection(
    validated.examSubjectScheduleId,
    validated.sectionId,
  );
  if (!existing) {
    throw new Error("No submission exists for this subject/section — nothing to approve.");
  }
  if (existing.status !== "SUBMITTED") {
    throw new SubmissionNotSubmittedError(
      `Cannot approve a submission in "${existing.status}" status — it must be SUBMITTED first.`,
    );
  }

  const actor = await findUserById(actorUserId);
  if (!actor) {
    throw new Error(`User not found: ${actorUserId}`);
  }

  const run = async (t: Prisma.TransactionClient) => {
    const updated = await approveMarksSubmissionRow(existing.id, actorUserId, t);

    await writeAuditLog(t, {
      schoolId: actor.schoolId,
      entityType: "MarksSubmission",
      entityId: existing.id,
      actorUserId,
      action: "UPDATE",
      beforeValue: { status: "SUBMITTED" },
      afterValue: { status: "APPROVED" },
    });

    const reloaded = await findMarksSubmissionById(updated.id, t);
    if (!reloaded) {
      throw new Error(`Failed to load approved MarksSubmission: ${updated.id}`);
    }
    return toMarksSubmissionDTO(reloaded);
  };

  return tx ? run(tx) : db.$transaction(run);
}
