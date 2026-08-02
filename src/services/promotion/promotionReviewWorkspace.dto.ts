import type {
  PromotionRecommendationDTO,
  PromotionExaminationResultDTO,
} from "@/services/promotion/promotionRecommendation";
import type { PromotionOutcome, PromotionBasis } from "@/generated/prisma/enums";

export interface PromotionExistingDecisionDTO {
  id: string;
  outcome: PromotionOutcome;
  basis: PromotionBasis;
  targetSchoolClassName: string | null;
  targetSectionName: string | null;
  targetRollNumber: string | null;
  decidedByUserId: string;
  decidedAt: string;
}

export interface PromotionReviewRowDTO {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  sourceEnrollmentId: string;
  rollNumber: string;
  publishedExaminations: PromotionExaminationResultDTO[];
  recommendation: PromotionRecommendationDTO;
  existingDecision: PromotionExistingDecisionDTO | null;
}

export interface PromotionReviewWorkspaceDTO {
  sourceAcademicYearId: string;
  sourceAcademicYearLabel: string;
  schoolClassId: string;
  schoolClassName: string;
  sectionId: string;
  sectionName: string;
  rows: PromotionReviewRowDTO[];
}
