import { z } from "zod";

// Setup Wizard Step 2 — School Verification's "allow editing if necessary."
// Deliberately narrow: name, board, and the current Academic Year's label
// are the fields actually displayed and plausibly wrong at first-deployment
// time. startDate/endDate/promotionPolicy/status are not exposed here —
// editing those is a real business decision (closing a year, changing a
// promotion policy) out of this wizard's "first-time setup" scope, not a
// data-entry correction.
export const updateSchoolDetailsInputSchema = z.object({
  schoolId: z.string().min(1),
  name: z.string().min(1).max(200),
  affiliationBoard: z.string().max(100).optional(),
  academicYearId: z.string().min(1),
  academicYearLabel: z.string().min(1).max(20),
});
export type UpdateSchoolDetailsInput = z.infer<typeof updateSchoolDetailsInputSchema>;
