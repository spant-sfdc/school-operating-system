"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  requirePermission,
  canSubmitAttendance,
  canOverrideAttendanceLock,
} from "@/lib/authorization";
import { findTeacherByUserId } from "@/repositories/teacher";
import { attendanceStatusSchema } from "@/lib/validations/attendance";
import {
  submitAttendanceGrid,
  AttendanceAuthorizationError,
  AttendanceLockedError,
} from "@/services/attendance/attendanceSessionWorkspace.service";

const submitPayloadSchema = z.object({
  sectionId: z.string().min(1),
  sessionId: z.string().min(1),
  records: z
    .array(z.object({ enrollmentId: z.string().min(1), status: attendanceStatusSchema }))
    .min(1),
});

/**
 * The one real Server Action this sprint adds — everything else in the
 * Grid (bulk mark, search, sort, reset) is client-side-only state, never a
 * round trip. Composes submitAttendanceGrid() (which itself composes the
 * existing, unchanged submitAttendance()) — no new business logic beyond
 * the lock re-check that function already performs. Called directly from
 * AttendanceGrid.tsx's own submit handler, not through a native
 * `<form action>` — the payload is a structured array, not FormData.
 */
export async function submitAttendanceGridAction(
  payload: unknown,
): Promise<{ error: string } | never> {
  const session = await requirePermission(canSubmitAttendance);
  const validated = submitPayloadSchema.parse(payload);

  const teacher = await findTeacherByUserId(session.userId);

  try {
    await submitAttendanceGrid(
      validated,
      session.userId,
      session.schoolId,
      session.accessLevel,
      teacher?.id ?? null,
      canOverrideAttendanceLock(session),
    );
  } catch (error) {
    if (error instanceof AttendanceLockedError) {
      return { error: error.message };
    }
    if (error instanceof AttendanceAuthorizationError) {
      return { error: "You are not authorized to submit attendance for this section." };
    }
    throw error;
  }

  redirect(`/teacher/attendance/${validated.sectionId}?submitted=1`);
}
