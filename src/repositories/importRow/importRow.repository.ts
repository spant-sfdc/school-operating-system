import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { ImportRowStatus } from "@/generated/prisma/enums";

// Bulk insert for the Detect/Map stage — one call per batch, not one insert
// per row, since a large import can genuinely produce thousands of rows
// (DATABASE_REVIEW.md § 11's precedent for why ImportRow uses a
// time-ordered UUIDv7 id). createMany does not return the created rows —
// callers that need them (e.g. to immediately validate) re-query via
// findImportRowsByBatchId().
export async function createImportRows(
  rows: Prisma.ImportRowCreateManyInput[],
  tx: Prisma.TransactionClient = db,
) {
  return tx.importRow.createMany({ data: rows });
}

export interface ImportRowListFilters {
  status?: ImportRowStatus;
  page?: number;
  pageSize?: number;
}

export async function findImportRowsByBatchId(
  importBatchId: string,
  filters: ImportRowListFilters = {},
) {
  const { status, page = 1, pageSize = 50 } = filters;

  const where: Prisma.ImportRowWhereInput = {
    importBatchId,
    ...(status ? { status } : {}),
  };

  const [items, total] = await Promise.all([
    db.importRow.findMany({
      where,
      orderBy: { rowNumber: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.importRow.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

// The resumability query this table exists for (see the schema's own
// comment) — the next chunk of a batch's still-uncommitted valid rows,
// ordered by rowNumber so a resumed commit continues where it left off
// rather than in an arbitrary order.
export async function findNextChunkToCommit(importBatchId: string, chunkSize: number) {
  return db.importRow.findMany({
    where: { importBatchId, status: "VALID" },
    orderBy: { rowNumber: "asc" },
    take: chunkSize,
  });
}

export async function updateImportRow(
  id: string,
  input: Prisma.ImportRowUpdateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.importRow.update({ where: { id }, data: input });
}

// Bulk status transition (e.g. every row in a validated batch moving from
// PENDING to VALID/INVALID) — one statement, not N updates in a loop.
export async function updateImportRowsStatus(
  ids: string[],
  status: ImportRowStatus,
  tx: Prisma.TransactionClient = db,
) {
  return tx.importRow.updateMany({ where: { id: { in: ids } }, data: { status } });
}

// Progress/report counts — { PENDING: 3, VALID: 40, INVALID: 2, ... }. Used
// by both Preview (before commit) and Report (after) — the same query
// answers both, since a batch's row-status distribution is the report.
export async function countImportRowsByStatus(
  importBatchId: string,
): Promise<Record<ImportRowStatus, number>> {
  const grouped = await db.importRow.groupBy({
    by: ["status"],
    where: { importBatchId },
    _count: { _all: true },
  });

  const counts: Record<ImportRowStatus, number> = {
    PENDING: 0,
    VALID: 0,
    INVALID: 0,
    SKIPPED: 0,
    COMMITTED: 0,
    FAILED: 0,
  };
  for (const row of grouped) {
    counts[row.status] = row._count._all;
  }
  return counts;
}
