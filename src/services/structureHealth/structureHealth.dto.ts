import type { AcademicYearStatus } from "@/generated/prisma/enums";

export interface ClassHealthIssueDTO {
  schoolClassId: string;
  name: string;
  sectionCount: number;
  subjectCount: number;
  hasGradeScale: boolean;
  noSections: boolean;
  noSubjects: boolean;
  noGradeScale: boolean;
}

export interface SectionHealthIssueDTO {
  sectionId: string;
  sectionName: string;
  schoolClassId: string;
  schoolClassName: string;
  enrollmentCount: number;
  noClassTeacher: boolean;
  noSubjectTeacher: boolean;
  isEmpty: boolean;
}

export interface StructureHealthDTO {
  academicYearId: string | null;
  academicYearLabel: string | null;
  academicYearStatus: AcademicYearStatus | null;
  hasCurrentAcademicYear: boolean;
  classes: ClassHealthIssueDTO[];
  sections: SectionHealthIssueDTO[];
  issueCount: number;
  isHealthy: boolean;
}
