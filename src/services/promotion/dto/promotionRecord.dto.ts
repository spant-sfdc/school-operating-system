import type {
  AcademicYear,
  Enrollment,
  PromotionRecord,
  Section,
  SchoolClass,
} from "@/generated/prisma/client";
import type { PromotionOutcome, PromotionBasis } from "@/generated/prisma/enums";

export interface PromotionRecordDTO {
  id: string;
  studentId: string;
  sourceEnrollmentId: string;
  sourceAcademicYearLabel: string;
  sourceSchoolClassName: string;
  sourceSectionName: string;
  resultingEnrollmentId: string | null;
  targetAcademicYearLabel: string | null;
  targetSchoolClassName: string | null;
  targetSectionName: string | null;
  targetRollNumber: string | null;
  outcome: PromotionOutcome;
  basis: PromotionBasis;
  decidedByUserId: string;
  decidedAt: string;
}

type PromotionRecordWithRelations = PromotionRecord & {
  sourceEnrollment: Enrollment & {
    section: Section & { schoolClass: SchoolClass };
    academicYear: AcademicYear;
  };
  resultingEnrollment:
    | (Enrollment & { section: Section & { schoolClass: SchoolClass }; academicYear: AcademicYear })
    | null;
};

export function toPromotionRecordDTO(record: PromotionRecordWithRelations): PromotionRecordDTO {
  return {
    id: record.id,
    studentId: record.studentId,
    sourceEnrollmentId: record.sourceEnrollmentId,
    sourceAcademicYearLabel: record.sourceEnrollment.academicYear.label,
    sourceSchoolClassName: record.sourceEnrollment.section.schoolClass.name,
    sourceSectionName: record.sourceEnrollment.section.name,
    resultingEnrollmentId: record.resultingEnrollmentId,
    targetAcademicYearLabel: record.resultingEnrollment?.academicYear.label ?? null,
    targetSchoolClassName: record.resultingEnrollment?.section.schoolClass.name ?? null,
    targetSectionName: record.resultingEnrollment?.section.name ?? null,
    targetRollNumber: record.resultingEnrollment?.rollNumber ?? null,
    outcome: record.outcome,
    basis: record.basis,
    decidedByUserId: record.decidedByUserId,
    decidedAt: record.createdAt.toISOString(),
  };
}
