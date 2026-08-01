export type PublicationBlockingReason = "NOT_SUBMITTED" | "RETURNED" | "AWAITING_APPROVAL";

export interface PublicationBlockingIssueDTO {
  examSubjectScheduleId: string;
  subjectName: string;
  sectionId: string;
  sectionName: string;
  reason: PublicationBlockingReason;
}

export interface PublicationReadinessDTO {
  examinationId: string;
  examinationStatus: string;
  // The Examination must be COMPLETED before anything else is checked —
  // surfaced as its own flag so the UI can show "finish the exam period
  // first" distinctly from "N submissions still need attention."
  examinationNotCompleted: boolean;
  totalExpectedSubmissions: number;
  approvedCount: number;
  blockingIssues: PublicationBlockingIssueDTO[];
  canPublish: boolean;
}
