export interface PromotionSubjectResultDTO {
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  passMarks: number;
  passed: boolean;
}

export interface PromotionExaminationResultDTO {
  examinationId: string;
  examinationName: string;
  examTermName: string;
  subjects: PromotionSubjectResultDTO[];
}

export type PromotionRecommendation = "MANUAL_REVIEW_REQUIRED";

export interface PromotionRecommendationDTO {
  recommendation: PromotionRecommendation;
  reason: string;
}

/**
 * The recommendation engine (Sprint E11) — deliberately conservative, per
 * this sprint's own explicit instruction: no AI, no probabilistic
 * scoring, only deterministic rules the school's own configuration
 * genuinely supports. Today that configuration doesn't exist:
 * `AcademicYear.promotionPolicy` is a JSON blob (`Json`, per
 * BUSINESS_RULES.md § 6) that every real school in this deployment
 * currently holds as `{ configured: false, ... }` (see prisma/seed.ts) —
 * no school has ever set it to a real, decision-driving value. The only
 * honest recommendation under that condition is "Manual Review Required."
 *
 * This function deliberately returns MANUAL_REVIEW_REQUIRED
 * unconditionally this sprint — not because the `configured` flag isn't
 * checked (it is), but because even a hypothetical `configured: true`
 * policy has no further documented JSON shape anywhere in this codebase
 * (grepped docs/PRODUCT_REQUIREMENTS.md, docs/CONFIGURATION_GUIDE.md — no
 * hits) beyond the *concept* that no-detention vs. exam-based promotion
 * varies per class. Inventing that deeper shape now — before any real
 * school has confirmed their actual policy — would be exactly the kind
 * of silent policy invention this sprint's own instructions forbid.
 * A future sprint, once a school defines a real, documented
 * `promotionPolicy` shape, is the correct place to make this function
 * genuinely deterministic beyond "always manual."
 *
 * The recommendation returned here is NEVER persisted anywhere —
 * `PromotionRecord` has no column for it (see the schema's own migration
 * header comment) — so "the recommendation must never silently become
 * the official decision" (this sprint's own Q5 requirement) holds
 * structurally, not just by convention.
 */
export function computePromotionRecommendation(
  promotionPolicy: unknown,
  publishedExaminations: PromotionExaminationResultDTO[],
): PromotionRecommendationDTO {
  if (!isPolicyConfigured(promotionPolicy)) {
    return {
      recommendation: "MANUAL_REVIEW_REQUIRED",
      reason:
        "This school's promotion policy has not been configured yet — every decision requires manual review.",
    };
  }
  if (publishedExaminations.length === 0) {
    return {
      recommendation: "MANUAL_REVIEW_REQUIRED",
      reason: "No published examination results exist for this student this academic year.",
    };
  }
  return {
    recommendation: "MANUAL_REVIEW_REQUIRED",
    reason: "Automatic recommendation is not yet supported — review the published results below.",
  };
}

function isPolicyConfigured(promotionPolicy: unknown): boolean {
  return (
    typeof promotionPolicy === "object" &&
    promotionPolicy !== null &&
    (promotionPolicy as { configured?: unknown }).configured === true
  );
}
