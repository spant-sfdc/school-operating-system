import { listSectionsByClassAndYear } from "@/repositories/section";
import { listMarksSubmissionsForExamination } from "@/repositories/marksSubmission";
import { getExaminationById, listSubjectSchedulesForExamination } from "@/services/examination";
import { getPublicationReadiness } from "@/services/resultReview/examinationPublication.service";
import type {
  ExaminationReviewWorkspaceDTO,
  ExaminationReviewCellDTO,
  ExaminationReviewCellState,
} from "@/services/resultReview/examinationReviewWorkspace.dto";

/**
 * Examination Review Workspace — "for an Examination show: Exam Term,
 * Class, Status, Subjects, Sections, Assigned Teachers, Submission State,
 * Review State, Completion, Blocking Issues" (this sprint's own required
 * shape). One cell per (ExamSubjectSchedule x Section) — the same
 * completeness grain getPublicationReadiness() already computes, reused
 * here rather than reimplemented (one call, not two independent
 * traversals of the same schedules x sections cross product).
 */
export async function getExaminationReviewWorkspace(
  examinationId: string,
  schoolId: string,
): Promise<ExaminationReviewWorkspaceDTO | null> {
  const examination = await getExaminationById(examinationId);
  if (!examination || examination.schoolId !== schoolId) return null;

  const [schedules, sections, submissions, readiness] = await Promise.all([
    listSubjectSchedulesForExamination(examinationId),
    listSectionsByClassAndYear(examination.schoolClassId, examination.academicYearId),
    listMarksSubmissionsForExamination(examinationId),
    getPublicationReadiness(examinationId),
  ]);

  const submissionByKey = new Map(
    submissions.map((s) => [`${s.examSubjectScheduleId}:${s.sectionId}`, s]),
  );

  const cells: ExaminationReviewCellDTO[] = [];
  for (const schedule of schedules) {
    for (const section of sections) {
      const submission = submissionByKey.get(`${schedule.id}:${section.id}`);
      const state: ExaminationReviewCellState = submission ? submission.status : "NOT_SUBMITTED";
      cells.push({
        examSubjectScheduleId: schedule.id,
        subjectName: schedule.subjectName,
        teacherName: schedule.teacherName,
        sectionId: section.id,
        sectionName: section.name,
        state,
        submittedAt: submission ? submission.submittedAt.toISOString() : null,
        reviewedAt: submission?.reviewedAt ? submission.reviewedAt.toISOString() : null,
        returnReason: submission?.returnReason ?? null,
      });
    }
  }

  return {
    examinationId: examination.id,
    examinationName: examination.name,
    examTermName: examination.examTermName,
    schoolClassName: examination.schoolClassName,
    academicYearLabel: examination.academicYearLabel,
    status: examination.status,
    publishedAt: examination.publishedAt,
    cells,
    readiness: readiness!,
  };
}
