import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// Included consistently across every read below — the service-layer DTO
// mapper needs the section/class context and each record's enrollment, not
// just bare foreign keys. Same-query Prisma `include`, not a call into
// another repository's exported functions.
const SESSION_INCLUDE = {
  section: { include: { schoolClass: true } },
  records: { include: { enrollment: { include: { student: true } } } },
} satisfies Prisma.AttendanceSessionInclude;

// Optional `tx` — a plain findUnique()+include is a single, non-decomposed
// query (unlike createAttendanceSession()'s create()+include, see its own
// comment), so it's safe to call from inside the still-open transaction
// that just created/updated the row, via that same `tx`.
export async function findAttendanceSessionById(id: string, tx: Prisma.TransactionClient = db) {
  return tx.attendanceSession.findUnique({ where: { id }, include: SESSION_INCLUDE });
}

// "Has today's session already been marked" — the unique-index-backed
// existence check per docs/domain/WORKFLOWS.md § 2 and
// docs/domain/BUSINESS_RULES.md § 4.
export async function findAttendanceSessionBySectionAndDate(sectionId: string, date: Date) {
  return db.attendanceSession.findUnique({
    where: { sectionId_date: { sectionId, date } },
    include: SESSION_INCLUDE,
  });
}

// Deliberately no `include` here — matches
// src/repositories/teacherAssignment/teacherAssignment.repository.ts's
// createTeacherAssignment(), avoiding Prisma's create()+include
// decomposition inside an open transaction. Callers read back via
// findAttendanceSessionById(id, tx) — same tx, still inside the
// transaction — for the full relational shape.
export async function createAttendanceSession(
  input: Prisma.AttendanceSessionCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.attendanceSession.create({ data: input });
}

export async function updateAttendanceSessionEditMeta(
  id: string,
  editedByUserId: string,
  tx: Prisma.TransactionClient = db,
) {
  return tx.attendanceSession.update({
    where: { id },
    data: { lastEditedByUserId: editedByUserId, lastEditedAt: new Date() },
  });
}
