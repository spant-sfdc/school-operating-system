export type TeacherExaminationRowState = "NOT_STARTED" | "PENDING" | "COMPLETED";

export interface TeacherExaminationRowDTO {
  examinationId: string;
  examinationName: string;
  schoolClassName: string;
  examSubjectScheduleId: string;
  subjectName: string;
  sectionId: string;
  sectionName: string;
  maxMarks: number;
  totalStudents: number;
  enteredCount: number;
  submittedCount: number;
  state: TeacherExaminationRowState;
}

export interface TeacherExaminationsHomeDTO {
  academicYearLabel: string;
  rows: TeacherExaminationRowDTO[];
  quickResume: { examSubjectScheduleId: string; sectionId: string } | null;
}

export function deriveExaminationRowState(
  submittedCount: number,
  enteredCount: number,
  totalStudents: number,
): TeacherExaminationRowState {
  if (totalStudents > 0 && submittedCount === totalStudents) return "COMPLETED";
  if (enteredCount > 0) return "PENDING";
  return "NOT_STARTED";
}
