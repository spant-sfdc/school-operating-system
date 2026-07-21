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

export interface AttendanceSessionSearchFilters {
  sectionIds: string[];
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
}

// Attendance History (Sprint E2) — scoped to a caller-resolved set of
// section ids (a Teacher's own assigned sections; PERMISSION_MATRIX.md § 5
// "Teacher: CRU, assigned sections only"), never a school-wide scan. Does
// not include `records` — History shows per-status counts (via a separate
// countAttendanceBySession() call per row, small page sizes), not the full
// roster, so pulling every AttendanceRecord here would be unused I/O.
export async function searchAttendanceSessions(filters: AttendanceSessionSearchFilters) {
  const { sectionIds, dateFrom, dateTo, page = 1, pageSize = 20 } = filters;

  if (sectionIds.length === 0) {
    return { items: [], total: 0, page, pageSize };
  }

  const where: Prisma.AttendanceSessionWhereInput = {
    sectionId: { in: sectionIds },
    ...(dateFrom || dateTo
      ? {
          date: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.attendanceSession.findMany({
      where,
      include: { section: { include: { schoolClass: true } } },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.attendanceSession.count({ where }),
  ]);

  return { items, total, page, pageSize };
}
