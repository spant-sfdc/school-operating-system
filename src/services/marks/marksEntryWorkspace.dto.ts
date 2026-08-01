import type { MarksRecordStatus } from "@/generated/prisma/enums";

export interface MarksGridRowDTO {
  enrollmentId: string;
  studentId: string;
  fullName: string;
  admissionNumber: string;
  rollNumber: string;
  marksObtained: number | null;
  status: MarksRecordStatus | null;
}

export interface MarksEntrySummaryDTO {
  totalStudents: number;
  enteredCount: number;
  submittedCount: number;
}

export interface MarksEntryWorkspaceDTO {
  examSubjectScheduleId: string;
  examinationId: string;
  examinationName: string;
  examinationStatus: string;
  subjectName: string;
  maxMarks: number;
  passMarks: number;
  sectionId: string;
  schoolClassName: string;
  sectionName: string;
  academicYearLabel: string;
  rows: MarksGridRowDTO[];
  summary: MarksEntrySummaryDTO;
  // True once every enrolled student's mark is SUBMITTED — mirrors
  // AttendanceSessionWorkspaceDTO.locked's own derived-not-stored
  // precedent, computed from the same rows this DTO already carries.
  locked: boolean;
  // True when the parent Examination is not ACTIVE — a second, distinct
  // reason marks entry can be blocked, independent of `locked` (a fully
  // submitted section is `locked`; a DRAFT/SCHEDULED/COMPLETED/ARCHIVED
  // examination is `examinationInactive`, regardless of any single
  // section's own submission state). See marksEntryWorkspace.service.ts's
  // own comment on Sprint E7's status lifecycle.
  examinationInactive: boolean;
}

export function buildMarksEntrySummary(
  totalStudents: number,
  enteredCount: number,
  submittedCount: number,
): MarksEntrySummaryDTO {
  return { totalStudents, enteredCount, submittedCount };
}
