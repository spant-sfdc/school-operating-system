import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { AttendanceStatus } from "@/generated/prisma/enums";

// The pre-transaction existence/previous-value check — resolved by the
// service before opening db.$transaction(), per
// docs/engineering/ENGINEERING_PRINCIPLES.md § 4, so the audit entry can
// record a correct beforeValue on an update.
export async function findAttendanceRecordBySessionAndEnrollment(
  sessionId: string,
  enrollmentId: string,
) {
  return db.attendanceRecord.findUnique({
    where: { sessionId_enrollmentId: { sessionId, enrollmentId } },
  });
}

// The read a service uses to build a DTO after upsertAttendanceRecord() —
// same reasoning as findTeacherAssignmentById()'s own comment: a plain
// findUnique()+include is a single query, safe to call via the same `tx`
// from inside the still-open transaction that just wrote the row.
export async function findAttendanceRecordById(id: string, tx: Prisma.TransactionClient = db) {
  return tx.attendanceRecord.findUnique({
    where: { id },
    include: { enrollment: { include: { student: true } } },
  });
}

// "This student's attendance history" / a session's full roster of marked
// records — used to build the reopenAttendance()/submitAttendance() DTOs.
export async function listAttendanceRecordsForSession(sessionId: string) {
  return db.attendanceRecord.findMany({
    where: { sessionId },
    include: { enrollment: { include: { student: true } } },
    orderBy: { createdAt: "asc" },
  });
}

// Upsert, not create — docs/database/TRANSACTION_BOUNDARIES.md § 5: the
// (sessionId, enrollmentId) unique constraint, not an application-level
// check, is what actually prevents duplicate attendance. An upsert resolves
// the race cleanly regardless of request ordering, matching that
// document's own explicit recommendation for this exact table. Deliberately
// no `include` on either branch, same reasoning as
// createAttendanceSession()'s own comment.
export async function upsertAttendanceRecord(
  sessionId: string,
  enrollmentId: string,
  status: AttendanceStatus,
  tx: Prisma.TransactionClient = db,
) {
  return tx.attendanceRecord.upsert({
    where: { sessionId_enrollmentId: { sessionId, enrollmentId } },
    create: {
      session: { connect: { id: sessionId } },
      enrollment: { connect: { id: enrollmentId } },
      status,
    },
    update: { status },
  });
}
