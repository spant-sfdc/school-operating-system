"use server";

import { redirect } from "next/navigation";

import { requirePermission, canPublishExaminationResults } from "@/lib/authorization";
import { publishExaminationResults } from "@/services/resultReview";

/**
 * Publish — the one Server Action that flips an Examination COMPLETED ->
 * PUBLISHED. Re-validates readiness itself (publishExaminationResults()
 * never trusts this page's own already-rendered "ready" state) — a
 * PublicationNotReadyError surfaces as a plain redirected error message,
 * the same typed-error -> user-facing-message translation every other
 * Server Action in this codebase already uses.
 */
export async function publishExaminationResultsAction(examinationId: string): Promise<void> {
  const session = await requirePermission(canPublishExaminationResults);

  try {
    await publishExaminationResults({ examinationId }, session.userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish results.";
    redirect(`/admin/examinations/${examinationId}?error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin/examinations/${examinationId}?published=1`);
}
