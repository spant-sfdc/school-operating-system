"use server";

import { z } from "zod";

import { requirePermission, canManagePromotions } from "@/lib/authorization";
import {
  finalizePromotionDecision,
  PromotionAlreadyDecidedError,
  PromotionTargetNotFoundError,
  PromotionTargetConflictError,
} from "@/services/promotion/promotionFinalization.service";

const decisionPayloadSchema = z.object({
  sourceEnrollmentId: z.string().min(1),
  studentName: z.string().min(1),
  outcome: z.enum(["PROMOTED", "DETAINED"]),
  basis: z.enum(["NO_DETENTION_POLICY", "EXAM_RESULT", "RE_EXAM"]),
  targetAcademicYearId: z.string().min(1),
  targetSchoolClassId: z.string().min(1),
  targetSectionId: z.string().min(1),
  targetRollNumber: z.string().min(1),
});
const batchPayloadSchema = z.array(decisionPayloadSchema).min(1);

export interface FinalizePromotionsResult {
  succeeded: { sourceEnrollmentId: string; studentName: string }[];
  failed: { sourceEnrollmentId: string; studentName: string; error: string }[];
}

/**
 * Finalizes a batch of promotion decisions — one Server Action call from
 * the client, but each student is processed through
 * finalizePromotionDecision() (src/services/promotion/promotionFinalization.service.ts)
 * as its own independent, atomic transaction, exactly matching this
 * sprint's own "resemble the Import Engine philosophy" instruction: a
 * failure for one student is caught and reported per-row, never rolls
 * back another student's already-committed decision (Q15/Q22), and never
 * aborts the remaining loop iterations.
 */
export async function finalizePromotionsAction(
  payload: unknown,
): Promise<FinalizePromotionsResult> {
  const session = await requirePermission(canManagePromotions);
  const decisions = batchPayloadSchema.parse(payload);

  const result: FinalizePromotionsResult = { succeeded: [], failed: [] };

  for (const decision of decisions) {
    try {
      await finalizePromotionDecision(
        {
          sourceEnrollmentId: decision.sourceEnrollmentId,
          outcome: decision.outcome,
          basis: decision.basis,
          targetAcademicYearId: decision.targetAcademicYearId,
          targetSchoolClassId: decision.targetSchoolClassId,
          targetSectionId: decision.targetSectionId,
          targetRollNumber: decision.targetRollNumber,
        },
        session.userId,
        session.schoolId,
      );
      result.succeeded.push({
        sourceEnrollmentId: decision.sourceEnrollmentId,
        studentName: decision.studentName,
      });
    } catch (error) {
      let message = "Failed to finalize this student's promotion.";
      if (
        error instanceof PromotionAlreadyDecidedError ||
        error instanceof PromotionTargetNotFoundError ||
        error instanceof PromotionTargetConflictError
      ) {
        message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      result.failed.push({
        sourceEnrollmentId: decision.sourceEnrollmentId,
        studentName: decision.studentName,
        error: message,
      });
    }
  }

  return result;
}
