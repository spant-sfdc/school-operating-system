export type AttendanceSectionState = "NOT_STARTED" | "PENDING" | "COMPLETED";

export interface AttendanceHomeSectionDTO {
  sectionId: string;
  schoolClassName: string;
  sectionName: string;
  state: AttendanceSectionState;
  markedCount: number;
  totalStudents: number;
}

export interface AttendanceHomeDTO {
  academicYearLabel: string;
  date: string;
  sections: AttendanceHomeSectionDTO[];
  // The single best next action — the first NOT_STARTED or PENDING
  // section, falling back to the first COMPLETED one if every section is
  // already done. Null only when the teacher is Class Teacher of nothing.
  quickResumeSectionId: string | null;
}
