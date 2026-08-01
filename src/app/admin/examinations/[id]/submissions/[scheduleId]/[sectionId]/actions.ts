"use server";

import { redirect } from "next/navigation";

import { requirePermission, canReviewSubmissions } from "@/lib/authorization";
import { approveSubmission, returnForCorrection } from "@/services/resultReview";

/**
 * Approve — reuses approveSubmission()
 * (src/services/resultReview/marksSubmission.service.ts) unchanged. No new
 * business logic here beyond typed-error -> user-facing-message
 * translation, mirroring every other admin actions.ts in this codebase.
 */
export async function approveSubmissionAction(
  examinationId: string,
  scheduleId: string,
  sectionId: string,
): Promise<void> {
  const session = await requirePermission(canReviewSubmissions);

  try {
    await approveSubmission({ examSubjectScheduleId: scheduleId, sectionId }, session.userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve submission.";
    redirect(
      `/admin/examinations/${examinationId}/submissions/${scheduleId}/${sectionId}?error=${encodeURIComponent(message)}`,
    );
  }

  redirect(`/admin/examinations/${examinationId}?approved=1`);
}

/**
 * Return for Correction — reuses returnForCorrection() unchanged. The
 * reason is required (returnSubmissionInputSchema's own min-length rule
 * enforces this server-side; the disabled-until-filled Submit button is
 * only a UI courtesy).
 */
export async function returnSubmissionAction(
  examinationId: string,
  scheduleId: string,
  sectionId: string,
  formData: FormData,
): Promise<void> {
  const session = await requirePermission(canReviewSubmissions);
  const reason = formData.get("reason");

  try {
    await returnForCorrection(
      {
        examSubjectScheduleId: scheduleId,
        sectionId,
        reason: typeof reason === "string" ? reason : "",
      },
      session.userId,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to return submission.";
    redirect(
      `/admin/examinations/${examinationId}/submissions/${scheduleId}/${sectionId}?error=${encodeURIComponent(message)}`,
    );
  }

  redirect(`/admin/examinations/${examinationId}?returned=1`);
}
