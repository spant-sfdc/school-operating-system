import { z } from "zod";

// Promotion Engine (Sprint E11) — mirrors this file's established siblings
// exactly: a narrow, purpose-built input schema per real write, not a
// generic "partial model" shape. `outcome` is deliberately restricted to
// PROMOTED/DETAINED here — PromotionOutcome the Prisma enum also reserves
// TRANSFERRED_OUT/WITHDRAWN (schema completeness, matching
// docs/domain/DATABASE_SCHEMA.md's own illustrative shape), but no UI/
// service path this sprint ever writes them, per Sprint E11's own Q18
// answer (see docs/DECISIONS.md).
export const finalizePromotionDecisionInputSchema = z.object({
  sourceEnrollmentId: z.string().min(1),
  outcome: z.enum(["PROMOTED", "DETAINED"]),
  basis: z.enum(["NO_DETENTION_POLICY", "EXAM_RESULT", "RE_EXAM"]),
  targetAcademicYearId: z.string().min(1),
  targetSchoolClassId: z.string().min(1),
  targetSectionId: z.string().min(1),
  targetRollNumber: z.string().min(1).max(20),
});
export type FinalizePromotionDecisionInput = z.infer<typeof finalizePromotionDecisionInputSchema>;
