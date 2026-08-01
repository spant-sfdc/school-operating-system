import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { listExaminationsBySchool } from "@/services/examination";
import { getPublicationReadiness } from "@/services/resultReview/examinationPublication.service";
import type { ResultReviewDashboardDTO } from "@/services/resultReview/resultReviewDashboard.dto";

/**
 * Principal/Admin Result Dashboard — "What is blocking this examination
 * from being published?" (this sprint's own explicit design goal, not
 * decorative analytics). Lists every non-DRAFT, non-SCHEDULED examination
 * this academic year (ACTIVE/COMPLETED/PUBLISHED — a DRAFT or SCHEDULED
 * examination has no submissions to review yet, nothing useful to show)
 * with its own completeness counts, reusing getPublicationReadiness()
 * once per examination — bounded by examination count (a handful at a
 * time per school, this sprint's own Q18 scale requirement), never by
 * student or MarksRecord count.
 */
export async function getResultReviewDashboard(
  schoolId: string,
): Promise<ResultReviewDashboardDTO> {
  const currentAcademicYear = await findCurrentAcademicYear(schoolId);
  if (!currentAcademicYear) {
    return { academicYearLabel: "—", examinations: [] };
  }

  const examinations = await listExaminationsBySchool(schoolId, {
    academicYearId: currentAcademicYear.id,
  });
  const relevant = examinations.filter((e) =>
    ["ACTIVE", "COMPLETED", "PUBLISHED"].includes(e.status),
  );

  const summaries = await Promise.all(
    relevant.map(async (examination) => {
      const readiness = await getPublicationReadiness(examination.id);
      const notSubmittedCount =
        readiness?.blockingIssues.filter((i) => i.reason === "NOT_SUBMITTED").length ?? 0;
      const returnedCount =
        readiness?.blockingIssues.filter((i) => i.reason === "RETURNED").length ?? 0;
      const awaitingReviewCount =
        readiness?.blockingIssues.filter((i) => i.reason === "AWAITING_APPROVAL").length ?? 0;

      return {
        examinationId: examination.id,
        examinationName: examination.name,
        schoolClassName: examination.schoolClassName,
        examTermName: examination.examTermName,
        status: examination.status,
        totalExpectedSubmissions: readiness?.totalExpectedSubmissions ?? 0,
        notSubmittedCount,
        awaitingReviewCount,
        returnedCount,
        approvedCount: readiness?.approvedCount ?? 0,
        readyToPublish: readiness?.canPublish ?? false,
      };
    }),
  );

  return { academicYearLabel: currentAcademicYear.label, examinations: summaries };
}
