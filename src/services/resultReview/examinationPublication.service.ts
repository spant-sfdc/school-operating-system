import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import { findUserById } from "@/repositories/user";
import { listSectionsByClassAndYear } from "@/repositories/section";
import { publishExaminationRecord } from "@/repositories/examination";
import { listMarksSubmissionsForExamination } from "@/repositories/marksSubmission";
import { getExaminationById, listSubjectSchedulesForExamination } from "@/services/examination";
import {
  publishExaminationResultsInputSchema,
  type PublishExaminationResultsInput,
} from "@/lib/validations/resultReview";
import type {
  PublicationReadinessDTO,
  PublicationBlockingIssueDTO,
} from "@/services/resultReview/examinationPublication.dto";

export class PublicationNotReadyError extends Error {}

/**
 * The completeness gate (this sprint's own Q8) — computed, never stored.
 * "Expected" submissions = every ExamSubjectSchedule of this Examination
 * crossed with every Section of its own SchoolClass+AcademicYear (the
 * exact same assumption computeSectionStates()/getTeacherExaminationsHome()
 * already make: a class's sections all sit the same class-wide schedules,
 * per Sprint E7's own ExamSubjectSchedule design). A pair is "ready" only
 * once an APPROVED MarksSubmission exists for it — which, by
 * submitMarks()'s own already-enforced "no missing marks" rule (Sprint
 * E8, unchanged), transitively guarantees every enrolled student in that
 * section already has a mark. No separate "missing marks" re-check is
 * needed here — it would be duplicating a guarantee that already holds.
 *
 * Bounded by [ExamSubjectSchedule x Section] cardinality (Q18's own scale
 * requirement) — never scans MarksRecord.
 */
export async function getPublicationReadiness(
  examinationId: string,
): Promise<PublicationReadinessDTO | null> {
  const examination = await getExaminationById(examinationId);
  if (!examination) return null;

  const [schedules, sections, submissions] = await Promise.all([
    listSubjectSchedulesForExamination(examinationId),
    listSectionsByClassAndYear(examination.schoolClassId, examination.academicYearId),
    listMarksSubmissionsForExamination(examinationId),
  ]);

  const submissionByKey = new Map(
    submissions.map((s) => [`${s.examSubjectScheduleId}:${s.sectionId}`, s]),
  );

  const blockingIssues: PublicationBlockingIssueDTO[] = [];
  let approvedCount = 0;
  const totalExpectedSubmissions = schedules.length * sections.length;

  for (const schedule of schedules) {
    for (const section of sections) {
      const submission = submissionByKey.get(`${schedule.id}:${section.id}`);
      if (!submission) {
        blockingIssues.push({
          examSubjectScheduleId: schedule.id,
          subjectName: schedule.subjectName,
          sectionId: section.id,
          sectionName: section.name,
          reason: "NOT_SUBMITTED",
        });
      } else if (submission.status === "RETURNED") {
        blockingIssues.push({
          examSubjectScheduleId: schedule.id,
          subjectName: schedule.subjectName,
          sectionId: section.id,
          sectionName: section.name,
          reason: "RETURNED",
        });
      } else if (submission.status === "SUBMITTED") {
        blockingIssues.push({
          examSubjectScheduleId: schedule.id,
          subjectName: schedule.subjectName,
          sectionId: section.id,
          sectionName: section.name,
          reason: "AWAITING_APPROVAL",
        });
      } else {
        approvedCount++;
      }
    }
  }

  const examinationNotCompleted = examination.status !== "COMPLETED";

  return {
    examinationId,
    examinationStatus: examination.status,
    examinationNotCompleted,
    totalExpectedSubmissions,
    approvedCount,
    blockingIssues,
    canPublish: !examinationNotCompleted && blockingIssues.length === 0,
  };
}

/**
 * Publishes an Examination's results — COMPLETED -> PUBLISHED, the
 * authoritative signal every downstream consumer (Student Academic
 * History, Report Cards, Promotion) reads instead of guessing whether
 * marks are final (this sprint's own Q15). Re-validates readiness inside
 * the same transaction as the actual write (never trusts a client-side
 * "ready" flag alone — ARCHITECTURE.md § 7's own server-side-enforcement
 * principle) — genuinely atomic: the Examination's own status flip is a
 * single-row update, so "partial publication" is structurally impossible
 * once the gate passes.
 */
export async function publishExaminationResults(
  input: PublishExaminationResultsInput,
  actorUserId: string,
): Promise<{ examinationId: string; publishedAt: string }> {
  const validated = publishExaminationResultsInputSchema.parse(input);

  const readiness = await getPublicationReadiness(validated.examinationId);
  if (!readiness) {
    throw new Error(`Examination not found: ${validated.examinationId}`);
  }
  if (!readiness.canPublish) {
    const reasons = readiness.examinationNotCompleted
      ? [`Examination status is "${readiness.examinationStatus}", not COMPLETED.`]
      : readiness.blockingIssues.map(
          (issue) => `${issue.subjectName} — ${issue.sectionName}: ${issue.reason}`,
        );
    throw new PublicationNotReadyError(
      `Cannot publish — ${reasons.length} blocking issue(s): ${reasons.join("; ")}`,
    );
  }

  const actor = await findUserById(actorUserId);
  if (!actor) {
    throw new Error(`User not found: ${actorUserId}`);
  }

  const run = async (t: Prisma.TransactionClient) => {
    const updated = await publishExaminationRecord(validated.examinationId, actorUserId, t);

    await writeAuditLog(t, {
      schoolId: actor.schoolId,
      entityType: "Examination",
      entityId: validated.examinationId,
      actorUserId,
      action: "UPDATE",
      beforeValue: { status: "COMPLETED" },
      afterValue: {
        status: "PUBLISHED",
        publishedByUserId: actorUserId,
        approvedSubmissionCount: readiness.approvedCount,
      },
    });

    return updated;
  };

  const updated = await db.$transaction(run);

  return {
    examinationId: updated.id,
    publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : new Date().toISOString(),
  };
}
