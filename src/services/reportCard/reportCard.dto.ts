// Sprint E12 — Report Card. An OUTPUT/PROJECTION over already-authoritative
// data (MarksRecord under a PUBLISHED Examination, GradeScale, Enrollment,
// PromotionRecord), never a second academic record system (this sprint's
// own explicit architectural boundary). This DTO shape is also exactly
// what gets persisted into `ReportCard.snapshot` once generated (see the
// schema's own migration-header comment) — rendering code never needs to
// know whether it's reading a live composition or a frozen one.

export interface ReportCardSchoolDTO {
  name: string;
  logoUrl: string | null;
  affiliationBoard: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface ReportCardStudentDTO {
  fullName: string;
  admissionNumber: string;
  dateOfBirth: string;
  rollNumber: string;
  schoolClassName: string;
  sectionName: string;
  academicYearLabel: string;
}

export interface ReportCardExaminationDTO {
  examinationName: string;
  examTermName: string;
  publishedAt: string;
}

export interface ReportCardSubjectDTO {
  subjectName: string;
  maxMarks: number;
  passMarks: number;
  marksObtained: number;
  percentage: number;
  passed: boolean;
  // null when the class has no GradeScale assigned (SchoolClass.gradeScaleId)
  // or the assigned scale is MARKS_BASED — an honest absence, never a
  // fabricated grade (Sprint E10's own Q6 precedent, now resolved for
  // classes that DO have a scale assigned — see gradeStrategy.ts).
  grade: string | null;
}

export interface ReportCardSummaryDTO {
  totalMaxMarks: number;
  totalMarksObtained: number;
  overallPercentage: number;
  overallGrade: string | null;
}

export interface ReportCardAttendanceDTO {
  academicYearLabel: string;
  totalMarked: number;
  presentCount: number;
  attendancePercent: number;
}

export interface ReportCardPromotionDTO {
  outcome: string;
  basis: string;
}

export interface ReportCardDataDTO {
  school: ReportCardSchoolDTO;
  student: ReportCardStudentDTO;
  examination: ReportCardExaminationDTO;
  subjects: ReportCardSubjectDTO[];
  summary: ReportCardSummaryDTO;
  // null when no attendance has been recorded at all — an honest empty
  // state (Q11's own "if the model cannot determine reliably, leave off"
  // resolved the *period* question; this resolves the *no data yet*
  // case identically to Sprint E1's own AttendanceSummaryDTO precedent).
  attendance: ReportCardAttendanceDTO | null;
  // null until a Promotion decision (Sprint E11) has actually been
  // recorded for this student's this-year Enrollment — never inferred.
  promotion: ReportCardPromotionDTO | null;
}

export type StudentReportCardDTO =
  | {
      available: true;
      data: ReportCardDataDTO;
      // Whether this is reading a persisted, frozen ReportCard.snapshot
      // (generated: true) or a live composition that has not been
      // generated/persisted yet (generated: false) — the Preview page's
      // own "Generate" action is what flips this, per the schema's own
      // "should not silently change if a mark is corrected afterward"
      // reasoning (DOMAIN_MODEL.md § 8.6).
      generated: boolean;
      generatedAt: string | null;
      generatedByUserId: string | null;
    }
  | { available: false; reason: string };
