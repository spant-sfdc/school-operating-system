import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import type { AttendanceStatus } from "@/generated/prisma/enums";
import { findUserById } from "@/repositories/user";
import { findSectionById } from "@/repositories/section";
import { findSchoolClassById } from "@/repositories/schoolClass";
import { findEnrollmentById } from "@/repositories/enrollment";
import {
  createAttendanceSession,
  findAttendanceSessionById,
  findAttendanceSessionBySectionAndDate,
  updateAttendanceSessionEditMeta,
} from "@/repositories/attendanceSession";
import {
  findAttendanceRecordById,
  findAttendanceRecordBySessionAndEnrollment,
  upsertAttendanceRecord,
} from "@/repositories/attendanceRecord";
import {
  openAttendanceSessionInputSchema,
  markAttendanceInputSchema,
  submitAttendanceInputSchema,
  reopenAttendanceInputSchema,
  type OpenAttendanceSessionInput,
  type MarkAttendanceInput,
  type SubmitAttendanceInput,
  type ReopenAttendanceInput,
} from "@/lib/validations/attendance";
import {
  toAttendanceSessionDTO,
  type AttendanceSessionDTO,
} from "@/services/attendance/dto/attendanceSession.dto";
import {
  toAttendanceRecordDTO,
  type AttendanceRecordDTO,
} from "@/services/attendance/dto/attendanceRecord.dto";

/**
 * Gets or creates a section's AttendanceSession for one day — matches
 * docs/domain/WORKFLOWS.md § 2's own "session exists? / create" branch.
 * Idempotent: calling this twice for the same (sectionId, date) returns the
 * existing session rather than throwing — "today's session is already
 * open" is a valid, expected state, not an error.
 *
 * Optional `tx` — same passthrough pattern as
 * src/services/academic/academic.service.ts's createSchoolClassWithSections()
 * (see docs/DECISIONS.md's Sprint D2 entry). The post-create read-back
 * happens via findAttendanceSessionById(id, t) — the same transaction, not
 * a separate post-commit call — since that read is a single
 * findUnique()+include, not a create()+include, and so doesn't hit the
 * decomposition issue createAttendanceSession()'s own comment describes.
 */
export async function openAttendanceSession(
  input: OpenAttendanceSessionInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<AttendanceSessionDTO> {
  const validated = openAttendanceSessionInputSchema.parse(input);

  const section = await findSectionById(validated.sectionId);
  if (!section) {
    throw new Error(`Section not found: ${validated.sectionId}`);
  }
  const schoolClass = await findSchoolClassById(section.schoolClassId);
  if (!schoolClass) {
    throw new Error(`School class not found: ${section.schoolClassId}`);
  }

  const markedByUser = await findUserById(validated.markedByUserId);
  if (!markedByUser) {
    throw new Error(`User not found: ${validated.markedByUserId}`);
  }

  const existing = await findAttendanceSessionBySectionAndDate(validated.sectionId, validated.date);
  if (existing) {
    return toAttendanceSessionDTO(existing);
  }

  const run = async (t: Prisma.TransactionClient) => {
    const session = await createAttendanceSession(
      {
        school: { connect: { schoolId: schoolClass.schoolId } },
        section: { connect: { id: validated.sectionId } },
        date: validated.date,
        markedByUserId: validated.markedByUserId,
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: schoolClass.schoolId,
      entityType: "AttendanceSession",
      entityId: session.id,
      actorUserId,
      action: "CREATE",
      afterValue: { sectionId: validated.sectionId, date: validated.date.toISOString() },
    });

    const created = await findAttendanceSessionById(session.id, t);
    if (!created) {
      throw new Error(`Failed to load newly-created attendance session: ${session.id}`);
    }
    return toAttendanceSessionDTO(created);
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Corrects a single student's AttendanceRecord within an already-opened
 * session — the primitive a "reopen and fix one student" flow uses.
 * Enforces "Attendance Session must exist before marking attendance" and
 * "Attendance belongs to Enrollment" (docs/domain/BUSINESS_RULES.md § 4) by
 * checking the enrollment's sectionId matches the session's, not just that
 * the enrollment exists at all.
 *
 * Optional `tx`, same passthrough pattern as openAttendanceSession() above.
 */
export async function markAttendance(
  input: MarkAttendanceInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<AttendanceRecordDTO> {
  const validated = markAttendanceInputSchema.parse(input);

  const session = await findAttendanceSessionById(validated.sessionId);
  if (!session) {
    throw new Error(`Attendance session not found: ${validated.sessionId}`);
  }

  const markedByUser = await findUserById(validated.markedByUserId);
  if (!markedByUser) {
    throw new Error(`User not found: ${validated.markedByUserId}`);
  }

  const enrollment = await findEnrollmentById(validated.enrollmentId);
  if (!enrollment) {
    throw new Error(`Enrollment not found: ${validated.enrollmentId}`);
  }
  if (enrollment.sectionId !== session.sectionId) {
    throw new Error(
      `Enrollment ${validated.enrollmentId} is not enrolled in section ${session.sectionId} — cannot mark attendance for it on this session.`,
    );
  }

  const existing = await findAttendanceRecordBySessionAndEnrollment(
    validated.sessionId,
    validated.enrollmentId,
  );

  const run = async (t: Prisma.TransactionClient) => {
    // Upsert, not create — docs/database/TRANSACTION_BOUNDARIES.md § 5's own
    // "prevent duplicate attendance" guidance: the (sessionId, enrollmentId)
    // unique constraint is the real guard, not this pre-check.
    const record = await upsertAttendanceRecord(
      validated.sessionId,
      validated.enrollmentId,
      validated.status,
      t,
    );

    await writeAuditLog(t, {
      schoolId: session.schoolId,
      entityType: "AttendanceRecord",
      entityId: record.id,
      actorUserId,
      action: existing ? "UPDATE" : "CREATE",
      beforeValue: existing ? { status: existing.status } : undefined,
      afterValue: { status: validated.status },
    });

    await updateAttendanceSessionEditMeta(validated.sessionId, validated.markedByUserId, t);

    const created = await findAttendanceRecordById(record.id, t);
    if (!created) {
      throw new Error(`Failed to load newly-upserted attendance record: ${record.id}`);
    }
    return toAttendanceRecordDTO(created);
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * The real teacher-facing submission — a whole section's roster (up to
 * ~40 students) upserted together in one transaction, per
 * docs/database/TRANSACTION_BOUNDARIES.md § 2's "Daily attendance
 * submission" row (AttendanceRecord × N upsert + AuditLog × (N+1), the
 * "+1" being this session's own lastEditedByUserId/lastEditedAt update).
 * Enforces "Teacher/User must exist before attendance is submitted" and
 * "Attendance belongs to Enrollment" the same way markAttendance() does,
 * for every record in the batch.
 *
 * Optional `tx`, same passthrough pattern as openAttendanceSession() above.
 */
export async function submitAttendance(
  input: SubmitAttendanceInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<AttendanceSessionDTO> {
  const validated = submitAttendanceInputSchema.parse(input);

  const session = await findAttendanceSessionById(validated.sessionId);
  if (!session) {
    throw new Error(`Attendance session not found: ${validated.sessionId}`);
  }

  const submittedByUser = await findUserById(validated.submittedByUserId);
  if (!submittedByUser) {
    throw new Error(`User not found: ${validated.submittedByUserId}`);
  }

  // Resolve every enrollment + its previous record status before opening
  // the transaction — docs/engineering/ENGINEERING_PRINCIPLES.md § 4.
  const resolved: {
    enrollmentId: string;
    status: AttendanceStatus;
    previousStatus: AttendanceStatus | null;
  }[] = [];
  for (const record of validated.records) {
    const enrollment = await findEnrollmentById(record.enrollmentId);
    if (!enrollment) {
      throw new Error(`Enrollment not found: ${record.enrollmentId}`);
    }
    if (enrollment.sectionId !== session.sectionId) {
      throw new Error(
        `Enrollment ${record.enrollmentId} is not enrolled in section ${session.sectionId} — cannot submit attendance for it on this session.`,
      );
    }
    const existing = await findAttendanceRecordBySessionAndEnrollment(
      validated.sessionId,
      record.enrollmentId,
    );
    resolved.push({
      enrollmentId: record.enrollmentId,
      status: record.status,
      previousStatus: existing?.status ?? null,
    });
  }

  const run = async (t: Prisma.TransactionClient) => {
    for (const record of resolved) {
      const written = await upsertAttendanceRecord(
        validated.sessionId,
        record.enrollmentId,
        record.status,
        t,
      );

      await writeAuditLog(t, {
        schoolId: session.schoolId,
        entityType: "AttendanceRecord",
        entityId: written.id,
        actorUserId,
        action: record.previousStatus ? "UPDATE" : "CREATE",
        beforeValue: record.previousStatus ? { status: record.previousStatus } : undefined,
        afterValue: { status: record.status },
      });
    }

    const updatedSession = await updateAttendanceSessionEditMeta(
      validated.sessionId,
      validated.submittedByUserId,
      t,
    );

    await writeAuditLog(t, {
      schoolId: session.schoolId,
      entityType: "AttendanceSession",
      entityId: updatedSession.id,
      actorUserId,
      action: "UPDATE",
      afterValue: {
        lastEditedByUserId: validated.submittedByUserId,
        recordCount: resolved.length,
      },
    });

    const updated = await findAttendanceSessionById(validated.sessionId, t);
    if (!updated) {
      throw new Error(`Failed to load attendance session after submission: ${validated.sessionId}`);
    }
    return toAttendanceSessionDTO(updated);
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Loads an already-opened session (with its records, pre-filled) for
 * correction — matches docs/domain/WORKFLOWS.md § 2's "load existing
 * AttendanceSession + records, pre-filled" branch. A pure read: there is no
 * separate open/closed status on AttendanceSession to toggle
 * (docs/domain/DOMAIN_MODEL.md § 7.1), so "reopening" is loading the
 * existing session for a subsequent markAttendance()/submitAttendance()
 * call, not a state transition of its own — no AuditLog entry for a read.
 */
export async function reopenAttendance(
  input: ReopenAttendanceInput,
): Promise<AttendanceSessionDTO> {
  const validated = reopenAttendanceInputSchema.parse(input);

  const session = await findAttendanceSessionBySectionAndDate(validated.sectionId, validated.date);
  if (!session) {
    throw new Error(
      `No attendance session exists for section ${validated.sectionId} on ${validated.date.toISOString()} — nothing to reopen.`,
    );
  }

  return toAttendanceSessionDTO(session);
}
