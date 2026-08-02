// Sprint E10 — Student Academic History. Deliberately NOT a "universal
// result object" (this sprint's own Q12 warning) — a purpose-built read
// shape for "what did this student's published results look like, year
// by year," nothing more. No overall total/percentage/rank (Q7 — deferred,
// subject-level only, per this sprint's own explicit permission), no
// computed grade (Q6 — GradeScale has no link to Examination/
// ExamSubjectSchedule anywhere in the schema, so a trustworthy grade
// cannot be computed today; `available: false` is the honest state, not a
// fabricated one).

export interface AcademicHistorySubjectResultDTO {
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  passMarks: number;
  passed: boolean;
}

export interface AcademicHistoryExaminationDTO {
  examinationId: string;
  examinationName: string;
  examTermName: string;
  publishedAt: string;
  subjects: AcademicHistorySubjectResultDTO[];
}

export interface AcademicHistoryYearDTO {
  academicYearId: string;
  academicYearLabel: string;
  schoolClassName: string;
  sectionName: string;
  rollNumber: string;
  examinations: AcademicHistoryExaminationDTO[];
}

export interface StudentAcademicHistoryDTO {
  studentId: string;
  studentName: string;
  years: AcademicHistoryYearDTO[];
}

// The Student 360 "Academic Summary" panel's own shape — a compact
// derivation from the same underlying history (no second query), never a
// trend/chart (Q8 — deferred to a future Analytics epic). `latestResult`
// is the most recent published examination across every year, or `null`
// if none exist yet — an honest empty state, not a fabricated one.
export interface AcademicSummaryDTO {
  publishedExaminationCount: number;
  latestExamination: AcademicHistoryExaminationDTO | null;
  latestSubjectsPassed: number;
  latestSubjectsRequiringAttention: number;
}

export function buildAcademicSummary(history: StudentAcademicHistoryDTO): AcademicSummaryDTO {
  const allExaminations = history.years.flatMap((year) => year.examinations);
  const publishedExaminationCount = allExaminations.length;
  // Selected by latest publishedAt directly — not by array position. The
  // service orders years most-recent-first but examinations *within* a
  // year chronologically (Half-Yearly before Final), so "first in the
  // array" is not always "most recently published"; comparing the actual
  // timestamp is correct regardless of how the display ordering is
  // organized.
  const latestExamination = allExaminations.reduce<AcademicHistoryExaminationDTO | null>(
    (latest, exam) => (!latest || exam.publishedAt > latest.publishedAt ? exam : latest),
    null,
  );
  const latestSubjectsPassed = latestExamination
    ? latestExamination.subjects.filter((s) => s.passed).length
    : 0;
  const latestSubjectsRequiringAttention = latestExamination
    ? latestExamination.subjects.filter((s) => !s.passed).length
    : 0;

  return {
    publishedExaminationCount,
    latestExamination,
    latestSubjectsPassed,
    latestSubjectsRequiringAttention,
  };
}
