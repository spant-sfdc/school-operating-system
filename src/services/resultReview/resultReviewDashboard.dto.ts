export interface ResultReviewExaminationSummaryDTO {
  examinationId: string;
  examinationName: string;
  schoolClassName: string;
  examTermName: string;
  status: string;
  totalExpectedSubmissions: number;
  notSubmittedCount: number;
  awaitingReviewCount: number;
  returnedCount: number;
  approvedCount: number;
  readyToPublish: boolean;
}

export interface ResultReviewDashboardDTO {
  academicYearLabel: string;
  examinations: ResultReviewExaminationSummaryDTO[];
}
