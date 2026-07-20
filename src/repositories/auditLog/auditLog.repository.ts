import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { AuditAction } from "@/generated/prisma/enums";

// The write side — previously a direct db.$transaction-scoped Prisma call
// inside src/lib/db-utils.ts's writeAuditLog(), a real (if long-tolerated)
// exception to "no direct Prisma outside repositories" from before this
// model had a repository at all. Moved here now that one exists;
// writeAuditLog() itself is unchanged in signature and now simply
// delegates — every one of its ~27 existing call sites across every
// service needed zero changes. See docs/DECISIONS.md's Sprint B4 entry.
export async function createAuditLog(
  input: Prisma.AuditLogCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.auditLog.create({ data: input });
}

export async function findAuditLogById(id: string) {
  return db.auditLog.findUnique({ where: { id } });
}

export interface AuditLogSearchFilters {
  schoolId: string;
  startDate?: Date;
  endDate?: Date;
  action?: AuditAction;
  entityType?: string;
  actorUserId?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}

// Mirrors src/repositories/user/user.repository.ts's searchUsers() shape
// (same filter/pagination pattern, reused deliberately, not reinvented) —
// see docs/DECISIONS.md's Sprint B4 entry.
export async function searchAuditLogs(filters: AuditLogSearchFilters) {
  const {
    schoolId,
    startDate,
    endDate,
    action,
    entityType,
    actorUserId,
    query,
    page = 1,
    pageSize = 25,
  } = filters;

  const where: Prisma.AuditLogWhereInput = {
    schoolId,
    ...(action ? { action } : {}),
    ...(entityType ? { entityType } : {}),
    ...(actorUserId ? { actorUserId } : {}),
    ...(startDate || endDate
      ? {
          timestamp: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { entityId: { contains: query, mode: "insensitive" } },
            { entityType: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.auditLog.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

// Powers the Filters panel's Entity Type dropdown — entityType is a free
// string (every service names its own, e.g. "User", "AttendanceSession"),
// not a schema enum, so the real, currently-occurring set is queried
// directly rather than hardcoded and risking drift from what services
// actually write.
export async function listDistinctEntityTypes(schoolId: string): Promise<string[]> {
  const rows = await db.auditLog.findMany({
    where: { schoolId },
    select: { entityType: true },
    distinct: ["entityType"],
    orderBy: { entityType: "asc" },
  });
  return rows.map((row) => row.entityType);
}

// Developer Information's "Audit Log Entries" count — see
// src/app/admin/system/page.tsx.
export async function countAuditLogs(schoolId: string): Promise<number> {
  return db.auditLog.count({ where: { schoolId } });
}
