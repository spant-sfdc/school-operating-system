"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requirePermission, canEnterMarks, canSubmitMarks } from "@/lib/authorization";
import { findTeacherByUserId } from "@/repositories/teacher";
import {
  saveDraftMarksGrid,
  submitMarksGrid,
  MarksAuthorizationError,
  MarksLockedError,
} from "@/services/marks";
import { MarksValidationError } from "@/services/marks/marks.service";

const gridPayloadSchema = z.object({
  scheduleId: z.string().min(1),
  sectionId: z.string().min(1),
  records: z
    .array(z.object({ enrollmentId: z.string().min(1), marksObtained: z.number().min(0) }))
    .min(1),
});

/**
 * Save Draft — the one Server Action for partial work. Composes
 * saveDraftMarksGrid() (which itself composes the existing, unchanged
 * saveDraftMarks()) — no new business logic here beyond payload
 * validation and typed-error translation, mirroring
 * submitAttendanceGridAction()'s own shape exactly (Sprint E2).
 */
export async function saveDraftMarksAction(payload: unknown): Promise<{ error: string } | never> {
  const session = await requirePermission(canEnterMarks);
  const validated = gridPayloadSchema.parse(payload);

  const teacher = await findTeacherByUserId(session.userId);

  try {
    await saveDraftMarksGrid(
      {
        examSubjectScheduleId: validated.scheduleId,
        sectionId: validated.sectionId,
        records: validated.records,
      },
      session.userId,
      session.schoolId,
      session.accessLevel,
      teacher?.id ?? null,
    );
  } catch (error) {
    if (error instanceof MarksLockedError) {
      return { error: error.message };
    }
    if (error instanceof MarksAuthorizationError) {
      return { error: "You are not authorized to enter marks for this subject/section." };
    }
    if (error instanceof MarksValidationError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect(`/teacher/marks/${validated.scheduleId}/${validated.sectionId}?saved=1`);
}

/**
 * Submit — the one Server Action for final submission. Composes
 * submitMarksGrid() (which itself composes the existing, unchanged
 * submitMarks()) — the "missing marks" / "locked examination" / "already
 * submitted" / "unauthorized teacher" checks all happen inside that
 * function, not duplicated here.
 */
export async function submitMarksGridAction(payload: unknown): Promise<{ error: string } | never> {
  const session = await requirePermission(canSubmitMarks);
  const validated = gridPayloadSchema.parse(payload);

  const teacher = await findTeacherByUserId(session.userId);

  try {
    await submitMarksGrid(
      {
        examSubjectScheduleId: validated.scheduleId,
        sectionId: validated.sectionId,
        records: validated.records,
      },
      session.userId,
      session.schoolId,
      session.accessLevel,
      teacher?.id ?? null,
    );
  } catch (error) {
    if (error instanceof MarksLockedError) {
      return { error: error.message };
    }
    if (error instanceof MarksAuthorizationError) {
      return { error: "You are not authorized to submit marks for this subject/section." };
    }
    if (error instanceof MarksValidationError) {
      return { error: error.message };
    }
    if (error instanceof Error && error.message.includes("missing marks")) {
      return { error: error.message };
    }
    throw error;
  }

  redirect(`/teacher/marks/${validated.scheduleId}/${validated.sectionId}?submitted=1`);
}
