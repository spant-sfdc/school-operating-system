import { z } from "zod";

// Fixed, universal set — docs/domain/DOMAIN_MODEL.md § 7.2 states this is
// not school-configurable, matching docs/database/ENUM_STRATEGY.md § 2's
// native-enum recommendation.
export const attendanceStatusSchema = z.enum(["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"]);

// Get-or-create a section's attendance session for a given day — per
// docs/domain/WORKFLOWS.md § 2's own "session exists? / create" branch.
export const openAttendanceSessionInputSchema = z.object({
  sectionId: z.string().min(1),
  date: z.coerce.date(),
  markedByUserId: z.string().min(1),
});
export type OpenAttendanceSessionInput = z.infer<typeof openAttendanceSessionInputSchema>;

// A single-record correction against an already-opened session — the
// primitive reopenAttendance() callers use to fix one student's status.
export const markAttendanceInputSchema = z.object({
  sessionId: z.string().min(1),
  enrollmentId: z.string().min(1),
  status: attendanceStatusSchema,
  markedByUserId: z.string().min(1),
});
export type MarkAttendanceInput = z.infer<typeof markAttendanceInputSchema>;

// The real teacher-facing batch submission — one whole section's roster in
// one call, per docs/database/TRANSACTION_BOUNDARIES.md § 2/§ 3.
export const submitAttendanceInputSchema = z.object({
  sessionId: z.string().min(1),
  submittedByUserId: z.string().min(1),
  records: z
    .array(
      z.object({
        enrollmentId: z.string().min(1),
        status: attendanceStatusSchema,
      }),
    )
    .min(1),
});
export type SubmitAttendanceInput = z.infer<typeof submitAttendanceInputSchema>;

export const reopenAttendanceInputSchema = z.object({
  sectionId: z.string().min(1),
  date: z.coerce.date(),
});
export type ReopenAttendanceInput = z.infer<typeof reopenAttendanceInputSchema>;
