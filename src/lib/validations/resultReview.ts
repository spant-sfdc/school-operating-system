import { z } from "zod";

// Result Review & Publication (Sprint E9) — mirrors this file's own
// established siblings (validations/marks.ts, validations/examination.ts)
// exactly: narrow, purpose-built input schemas per lifecycle transition.

export const returnSubmissionInputSchema = z.object({
  examSubjectScheduleId: z.string().min(1),
  sectionId: z.string().min(1),
  // Return must require a reason — this sprint's own explicit
  // requirement, enforced here (not left as an optional field a caller
  // could omit).
  reason: z.string().min(1).max(500),
});
export type ReturnSubmissionInput = z.infer<typeof returnSubmissionInputSchema>;

export const approveSubmissionInputSchema = z.object({
  examSubjectScheduleId: z.string().min(1),
  sectionId: z.string().min(1),
});
export type ApproveSubmissionInput = z.infer<typeof approveSubmissionInputSchema>;

export const publishExaminationResultsInputSchema = z.object({
  examinationId: z.string().min(1),
});
export type PublishExaminationResultsInput = z.infer<typeof publishExaminationResultsInputSchema>;
