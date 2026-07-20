import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { ImportEntityType, ImportStatus } from "@/generated/prisma/enums";

export async function createImportBatch(
  input: Prisma.ImportBatchCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.importBatch.create({ data: input });
}

export async function findImportBatchById(id: string) {
  return db.importBatch.findUnique({ where: { id } });
}

export async function updateImportBatch(
  id: string,
  input: Prisma.ImportBatchUpdateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.importBatch.update({ where: { id }, data: input });
}

export interface ImportBatchSearchFilters {
  schoolId: string;
  importType?: ImportEntityType;
  status?: ImportStatus;
  page?: number;
  pageSize?: number;
}

// Mirrors searchAuditLogs()/searchUsers()'s established filter/pagination
// shape, reused deliberately — the History stage (/admin/imports) needs
// exactly this pattern, not a bespoke one.
export async function searchImportBatches(filters: ImportBatchSearchFilters) {
  const { schoolId, importType, status, page = 1, pageSize = 25 } = filters;

  const where: Prisma.ImportBatchWhereInput = {
    schoolId,
    ...(importType ? { importType } : {}),
    ...(status ? { status } : {}),
  };

  const [items, total] = await Promise.all([
    db.importBatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.importBatch.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

// Duplicate-import detection (Security Review § "duplicate imports") — the
// most recent batch of the same file, for the same school, if one exists.
// Not a hard block (a school may legitimately re-import the same file on
// purpose), just the fact a future Upload UI can surface as a warning.
export async function findMostRecentBatchByFileHash(schoolId: string, sourceFileHash: string) {
  return db.importBatch.findFirst({
    where: { schoolId, sourceFileHash },
    orderBy: { createdAt: "desc" },
  });
}

// The saved-mapping reuse IMPORT_ENGINE_STRATEGY.md § 2.2 names — the most
// recent completed batch of the same entity type is the natural source for
// a future importer's "pre-fill this mapping" suggestion.
export async function findMostRecentBatchByType(schoolId: string, importType: ImportEntityType) {
  return db.importBatch.findFirst({
    where: { schoolId, importType, columnMapping: { not: Prisma.DbNull } },
    orderBy: { createdAt: "desc" },
  });
}
