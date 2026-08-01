import { z } from "zod";

// Marks Entry (Sprint E8) — mirrors validations/attendance.ts's own shape
// exactly (a single-row primitive schema + a batch/grid schema). The
// dynamic "cannot exceed this schedule's own maxMarks" rule is NOT
// enforced here — maxMarks varies per ExamSubjectSchedule, a fact Zod
// can't see; that check happens in the service layer, where the schedule
// is already loaded (see marks.service.ts's own comment).

const marksRowSchema = z.object({
  enrollmentId: z.string().min(1),
  marksObtained: z.number().min(0),
});

// A single-row correction — the primitive a "reopen and fix one student"
// flow would use, mirroring markAttendanceInputSchema's own shape.
export const saveDraftMarkInputSchema = z.object({
  examSubjectScheduleId: z.string().min(1),
  enrollmentId: z.string().min(1),
  marksObtained: z.number().min(0),
});
export type SaveDraftMarkInput = z.infer<typeof saveDraftMarkInputSchema>;

// The Grid's own batch save — partial is fine, "Save Draft" explicitly
// allows incomplete work, per this sprint's own instruction.
export const saveDraftMarksInputSchema = z.object({
  examSubjectScheduleId: z.string().min(1),
  sectionId: z.string().min(1),
  records: z.array(marksRowSchema).min(1),
});
export type SaveDraftMarksInput = z.infer<typeof saveDraftMarksInputSchema>;

// The real teacher-facing submission — unlike Attendance's own
// submitAttendanceInputSchema (partial submission allowed), Marks Entry's
// own "Submit" requires every enrolled student to already have a mark;
// enforced in the service layer (where the section's full roster is
// known), not here — this schema only validates the shape of what's sent.
export const submitMarksInputSchema = z.object({
  examSubjectScheduleId: z.string().min(1),
  sectionId: z.string().min(1),
  records: z.array(marksRowSchema).min(1),
});
export type SubmitMarksInput = z.infer<typeof submitMarksInputSchema>;
