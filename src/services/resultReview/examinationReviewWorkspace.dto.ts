import type { PublicationReadinessDTO } from "@/services/resultReview/examinationPublication.dto";

export type ExaminationReviewCellState = "NOT_SUBMITTED" | "SUBMITTED" | "RETURNED" | "APPROVED";

export interface ExaminationReviewCellDTO {
  examSubjectScheduleId: string;
  subjectName: string;
  teacherName: string | null;
  sectionId: string;
  sectionName: string;
  state: ExaminationReviewCellState;
  submittedAt: string | null;
  reviewedAt: string | null;
  returnReason: string | null;
}

export interface ExaminationReviewWorkspaceDTO {
  examinationId: string;
  examinationName: string;
  examTermName: string;
  schoolClassName: string;
  academicYearLabel: string;
  status: string;
  publishedAt: string | null;
  cells: ExaminationReviewCellDTO[];
  readiness: PublicationReadinessDTO;
}
