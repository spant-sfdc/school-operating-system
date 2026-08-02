"use server";

import { redirect } from "next/navigation";

import { requirePermission, canManageReportCards } from "@/lib/authorization";
import { generateReportCard, ReportCardTargetNotFoundError } from "@/services/reportCard";

/**
 * Generates (persists) a Report Card — Admin/Principal only, matching
 * PERMISSION_MATRIX.md's own "ReportCard | Admin: CRUD | Teacher: R"
 * split. Idempotent — calling this on an already-generated card is a
 * no-op success, not an error (see reportCard.service.ts's own comment).
 */
export async function generateReportCardAction(
  studentId: string,
  examinationId: string,
): Promise<void> {
  const session = await requirePermission(canManageReportCards);

  try {
    await generateReportCard(studentId, examinationId, session.userId, session.schoolId);
  } catch (error) {
    const message =
      error instanceof ReportCardTargetNotFoundError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Failed to generate report card.";
    redirect(
      `/admin/students/${studentId}/report-cards/${examinationId}?error=${encodeURIComponent(message)}`,
    );
  }

  redirect(`/admin/students/${studentId}/report-cards/${examinationId}?generated=1`);
}
