import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import {
  createImportBatch as createImportBatchRow,
  findImportBatchById,
  updateImportBatch,
  searchImportBatches as searchImportBatchesRepo,
  findMostRecentBatchByFileHash,
} from "@/repositories/importBatch";
import {
  createImportRows,
  findImportRowsByBatchId,
  findNextChunkToCommit,
  updateImportRow,
  updateImportRowsStatus,
  countImportRowsByStatus,
} from "@/repositories/importRow";
import {
  createImportBatchInputSchema,
  ingestImportRowsInputSchema,
  searchImportBatchesInputSchema,
  type CreateImportBatchInput,
  type IngestImportRowsInput,
  type SearchImportBatchesInput,
} from "@/lib/validations/import";
import type {
  ImportRowValidator,
  ImportRowCommitHandler,
} from "@/services/import/extension-points";
import {
  toImportBatchDTO,
  toImportRowDTO,
  buildImportReport,
  type ImportBatchDTO,
  type ImportBatchListDTO,
  type ImportRowListDTO,
  type ImportReportDTO,
  type ImportErrorGroup,
  type ImportRowError,
} from "@/services/import/dto";

const ENTITY_TYPE = "ImportBatch";
const DEFAULT_CHUNK_SIZE = 50;

/**
 * Upload stage. Creates the one ImportBatch row a whole import run is
 * tracked against — the provenance record IMPORT_ENGINE_STRATEGY.md § 2.6
 * requires. Entity-agnostic: knows nothing about what a Student or Teacher
 * row looks like, only that some entity type of some file is being
 * imported. File parsing itself is the caller's concern (out of this
 * sprint's own scope) — this only records the file's metadata.
 */
export async function createImportBatch(
  input: CreateImportBatchInput,
  actorUserId: string,
): Promise<ImportBatchDTO> {
  const validated = createImportBatchInputSchema.parse(input);

  const batch = await db.$transaction(async (tx) => {
    const created = await createImportBatchRow(
      {
        school: { connect: { schoolId: validated.schoolId } },
        importType: validated.importType,
        sourceFileName: validated.sourceFileName,
        sourceFileType: validated.sourceFileType,
        sourceFileHash: validated.sourceFileHash,
        createdByUserId: actorUserId,
      },
      tx,
    );

    await writeAuditLog(tx, {
      schoolId: validated.schoolId,
      entityType: ENTITY_TYPE,
      entityId: created.id,
      actorUserId,
      action: "CREATE",
      afterValue: {
        importType: created.importType,
        sourceFileName: created.sourceFileName,
        status: created.status,
      },
    });

    return created;
  });

  return toImportBatchDTO(batch);
}

/**
 * Security Review — duplicate-import detection. Not a hard block; returns
 * the most recent prior batch of the same file (by hash) if one exists, so
 * a future Upload UI can warn the Admin before they create a second batch
 * for a file already imported.
 */
export async function findPriorBatchForFile(
  schoolId: string,
  sourceFileHash: string,
): Promise<ImportBatchDTO | null> {
  const prior = await findMostRecentBatchByFileHash(schoolId, sourceFileHash);
  return prior ? toImportBatchDTO(prior) : null;
}

/**
 * Map stage. Persists the confirmed column mapping and the file's
 * already-parsed row data (rawData, already translated to target field
 * names by the caller) as ImportRow records — PENDING until Validate runs.
 * One bulk insert, not one insert per row (a large import can genuinely
 * produce thousands of rows).
 */
export async function ingestImportRows(
  input: IngestImportRowsInput,
  actorUserId: string,
): Promise<ImportBatchDTO> {
  const validated = ingestImportRowsInputSchema.parse(input);
  const batch = await findImportBatchById(validated.importBatchId);
  if (!batch) throw new Error(`ImportBatch not found: ${validated.importBatchId}`);

  const updated = await db.$transaction(async (tx) => {
    await createImportRows(
      validated.rows.map((row) => ({
        importBatchId: validated.importBatchId,
        rowNumber: row.rowNumber,
        rawData: row.rawData as Prisma.InputJsonValue,
      })),
      tx,
    );

    const result = await updateImportBatch(
      validated.importBatchId,
      {
        columnMapping: validated.columnMapping,
        totalRows: validated.rows.length,
        status: "MAPPED",
      },
      tx,
    );

    await writeAuditLog(tx, {
      schoolId: batch.schoolId,
      entityType: ENTITY_TYPE,
      entityId: batch.id,
      actorUserId,
      action: "UPDATE",
      beforeValue: { status: batch.status },
      afterValue: { status: "MAPPED", totalRows: validated.rows.length },
    });

    return result;
  });

  return toImportBatchDTO(updated);
}

/**
 * Validate stage — Business Validation (see extension-points.ts's own
 * doc). Runs every PENDING row through the caller-supplied validator (a
 * future entity-specific importer's own thin wrapper around its existing
 * Zod schema) and records VALID/INVALID per row — a full pass over every
 * row before any commit begins, per IMPORT_ENGINE_STRATEGY.md § 2.3's
 * "dry-run pass, not fail-fast" requirement, so Preview can show every
 * problem at once.
 */
export async function validateImportBatch(
  batchId: string,
  validator: ImportRowValidator,
  actorUserId: string,
): Promise<ImportBatchDTO> {
  const batch = await findImportBatchById(batchId);
  if (!batch) throw new Error(`ImportBatch not found: ${batchId}`);

  const { items: pendingRows } = await findImportRowsByBatchId(batchId, {
    status: "PENDING",
    pageSize: Number.MAX_SAFE_INTEGER,
  });

  const validIds: string[] = [];
  const invalidUpdates: Array<{ id: string; errors: ImportRowError[] }> = [];

  for (const row of pendingRows) {
    const result = await validator.validateRow(row.rawData as Record<string, unknown>);
    if (result.valid) {
      validIds.push(row.id);
    } else {
      invalidUpdates.push({ id: row.id, errors: result.errors });
    }
  }

  await db.$transaction(async (tx) => {
    if (validIds.length > 0) {
      await updateImportRowsStatus(validIds, "VALID", tx);
    }
    for (const invalid of invalidUpdates) {
      await updateImportRow(
        invalid.id,
        { status: "INVALID", validationErrors: invalid.errors as unknown as Prisma.InputJsonValue },
        tx,
      );
    }

    await updateImportBatch(
      batchId,
      { status: "VALIDATED", errorCount: invalidUpdates.length },
      tx,
    );

    await writeAuditLog(tx, {
      schoolId: batch.schoolId,
      entityType: ENTITY_TYPE,
      entityId: batch.id,
      actorUserId,
      action: "UPDATE",
      beforeValue: { status: batch.status },
      afterValue: {
        status: "VALIDATED",
        validCount: validIds.length,
        invalidCount: invalidUpdates.length,
      },
    });
  });

  const updated = await findImportBatchById(batchId);
  return toImportBatchDTO(updated!);
}

async function computeErrorGroups(batchId: string): Promise<ImportErrorGroup[]> {
  const { items: invalidRows } = await findImportRowsByBatchId(batchId, {
    status: "INVALID",
    pageSize: Number.MAX_SAFE_INTEGER,
  });

  const groups = new Map<string, ImportErrorGroup>();
  for (const row of invalidRows) {
    const errors = toImportRowDTO(row).validationErrors ?? [];
    for (const error of errors) {
      const key = `${error.field}::${error.message}`;
      const existing = groups.get(key);
      if (existing) {
        existing.count++;
        if (existing.sampleRowNumbers.length < 5) existing.sampleRowNumbers.push(row.rowNumber);
      } else {
        groups.set(key, {
          field: error.field,
          message: error.message,
          count: 1,
          sampleRowNumbers: [row.rowNumber],
        });
      }
    }
  }
  return [...groups.values()].sort((a, b) => b.count - a.count);
}

/**
 * Preview stage — the mandatory gate before commit, per
 * IMPORT_ENGINE_STRATEGY.md § 2.4: "there is no direct upload-and-commit
 * path." Pure read (plus the batch's own status transition) — returns the
 * one reusable ImportReportDTO shape (see dto/importReport.dto.ts) an
 * Admin reviews before deciding whether to proceed.
 */
export async function previewImportBatch(batchId: string): Promise<ImportReportDTO> {
  const batch = await findImportBatchById(batchId);
  if (!batch) throw new Error(`ImportBatch not found: ${batchId}`);

  if (batch.status === "VALIDATED") {
    await updateImportBatch(batchId, { status: "PREVIEWED" });
  }

  const [rowCounts, errorGroups, updated] = await Promise.all([
    countImportRowsByStatus(batchId),
    computeErrorGroups(batchId),
    findImportBatchById(batchId),
  ]);

  return buildImportReport(toImportBatchDTO(updated!), rowCounts, errorGroups);
}

/**
 * The Preview→Commit decision IMPORT_ENGINE_STRATEGY.md § 2.4 names:
 * "proceed with only the clean rows" — every INVALID row in the batch
 * becomes SKIPPED (never silently dropped; still visible in the batch's
 * own row history), so only VALID rows remain eligible for
 * commitImportBatchChunk().
 */
export async function skipInvalidRows(
  batchId: string,
  actorUserId: string,
): Promise<ImportBatchDTO> {
  const batch = await findImportBatchById(batchId);
  if (!batch) throw new Error(`ImportBatch not found: ${batchId}`);

  const { items: invalidRows } = await findImportRowsByBatchId(batchId, {
    status: "INVALID",
    pageSize: Number.MAX_SAFE_INTEGER,
  });

  const updated = await db.$transaction(async (tx) => {
    if (invalidRows.length > 0) {
      await updateImportRowsStatus(
        invalidRows.map((row) => row.id),
        "SKIPPED",
        tx,
      );
    }
    const result = await updateImportBatch(batchId, { skippedCount: invalidRows.length }, tx);

    await writeAuditLog(tx, {
      schoolId: batch.schoolId,
      entityType: ENTITY_TYPE,
      entityId: batch.id,
      actorUserId,
      action: "UPDATE",
      afterValue: { skippedCount: invalidRows.length },
    });

    return result;
  });

  return toImportBatchDTO(updated);
}

export interface CommitChunkResult {
  committed: number;
  failed: number;
  remaining: number;
  batch: ImportBatchDTO;
}

/**
 * Commit stage — chunked and resumable, per
 * TRANSACTION_BOUNDARIES.md § 4's Academic Year Rollover precedent (the
 * same shape of problem as a large batch operation, not a 40-row
 * attendance submission): each row commits in its **own** transaction, not
 * a shared chunk-wide transaction, so one bad row's failure never rolls
 * back already-successful rows in the same chunk. Call repeatedly — by a
 * future Server Action re-invoked from the client, or eventually a
 * background job — until `remaining` reaches 0; an interruption between
 * calls loses nothing, since already-COMMITTED rows are excluded from the
 * next call's chunk by findNextChunkToCommit()'s own WHERE status = VALID.
 * `handler` is a future entity-specific importer's own commitRow()
 * wrapper around its existing lifecycle service (registerStudent(), etc.)
 * — this sprint provides no real implementation, only the orchestration
 * loop and the contract.
 */
export async function commitImportBatchChunk(
  batchId: string,
  handler: ImportRowCommitHandler,
  actorUserId: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
): Promise<CommitChunkResult> {
  const batch = await findImportBatchById(batchId);
  if (!batch) throw new Error(`ImportBatch not found: ${batchId}`);

  if (batch.status === "PREVIEWED") {
    await updateImportBatch(batchId, { status: "COMMITTING" });
  }

  const rows = await findNextChunkToCommit(batchId, chunkSize);

  let committed = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      await db.$transaction(async (tx) => {
        const { entityId } = await handler.commitRow(
          row.rawData as Record<string, unknown>,
          actorUserId,
          tx,
        );
        await updateImportRow(
          row.id,
          { status: "COMMITTED", entityId, committedAt: new Date() },
          tx,
        );
      });
      committed++;
    } catch (error) {
      await updateImportRow(row.id, {
        status: "FAILED",
        validationErrors: [
          {
            field: "_row",
            message: error instanceof Error ? error.message : "Unknown commit error",
          },
        ] as unknown as Prisma.InputJsonValue,
      });
      failed++;
    }
  }

  const counts = await countImportRowsByStatus(batchId);
  const remaining = counts.VALID;
  const nextStatus =
    remaining > 0 ? "COMMITTING" : counts.FAILED > 0 ? "PARTIALLY_COMPLETED" : "COMPLETED";

  const updatedBatch = await db.$transaction(async (tx) => {
    const result = await updateImportBatch(
      batchId,
      {
        status: nextStatus,
        successCount: counts.COMMITTED,
        errorCount: counts.FAILED,
        ...(remaining === 0 ? { completedAt: new Date() } : {}),
      },
      tx,
    );

    if (remaining === 0) {
      await writeAuditLog(tx, {
        schoolId: batch.schoolId,
        entityType: ENTITY_TYPE,
        entityId: batch.id,
        actorUserId,
        action: "UPDATE",
        afterValue: {
          status: nextStatus,
          successCount: counts.COMMITTED,
          errorCount: counts.FAILED,
        },
      });
    }

    return result;
  });

  return { committed, failed, remaining, batch: toImportBatchDTO(updatedBatch) };
}

/** Report stage — reusable outside an in-progress commit too (a completed
 * batch's own permanent record). Same shape previewImportBatch() returns.
 */
export async function getImportReport(batchId: string): Promise<ImportReportDTO> {
  return previewImportBatch(batchId);
}

/** History stage — /admin/imports' list view. */
export async function listImportBatches(
  input: SearchImportBatchesInput,
): Promise<ImportBatchListDTO> {
  const validated = searchImportBatchesInputSchema.parse(input);
  const result = await searchImportBatchesRepo(validated);
  return {
    items: result.items.map(toImportBatchDTO),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

/** History stage — one batch's detail, including its rows. */
export async function getImportBatchDetail(
  batchId: string,
  rowPage = 1,
  rowPageSize = 50,
): Promise<{ batch: ImportBatchDTO; rows: ImportRowListDTO } | null> {
  const batch = await findImportBatchById(batchId);
  if (!batch) return null;

  const rows = await findImportRowsByBatchId(batchId, { page: rowPage, pageSize: rowPageSize });

  return {
    batch: toImportBatchDTO(batch),
    rows: {
      items: rows.items.map(toImportRowDTO),
      total: rows.total,
      page: rows.page,
      pageSize: rows.pageSize,
    },
  };
}
