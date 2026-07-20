import type { ImportFileFormat } from "@/generated/prisma/enums";
import {
  createImportBatch,
  ingestImportRows,
  validateImportBatch,
  commitImportBatchChunk,
  type ImportBatchDTO,
  type CommitChunkResult,
} from "@/services/import";
import type { DataProfile } from "@/services/import/profiling";
import {
  groupAcademicStructureRows,
  type RawAcademicStructureRow,
} from "@/services/import/importers/academicStructure/rows";
import { buildAcademicStructureProfile } from "@/services/import/importers/academicStructure/profile";
import { createAcademicStructureValidator } from "@/services/import/importers/academicStructure/validator";
import { createAcademicStructureCommitHandler } from "@/services/import/importers/academicStructure/commitHandler";

/**
 * The Academic Structure Importer's own top-level orchestration — the
 * reference shape a future StudentImporter/TeacherImporter/
 * AttendanceImporter follows. Every stage below either calls straight
 * through to Sprint D1's generic Import Engine functions (Upload,
 * Preview, Skip, Report, History — genuinely no special handling needed)
 * or wraps them with exactly the entity-specific glue this importer's own
 * row/validator/handler modules provide (Detect/Map's grouping, Validate's
 * factory-built validator, Commit's handler) — never reimplementing
 * anything the foundation already does.
 */

export interface StartAcademicStructureImportInput {
  schoolId: string;
  sourceFileName: string;
  sourceFileType: ImportFileFormat;
  sourceFileHash?: string;
  columnMapping: Record<string, string>;
  rows: RawAcademicStructureRow[];
}

/**
 * Upload + Detect + Map, in one call: profiles the raw rows (Data
 * Profiling, before Preview, per this sprint's own requirement), creates
 * the ImportBatch (Upload), groups raw rows into one ImportRow per class
 * and one per subject (Detect/Map — the entity-specific step D1's
 * foundation deliberately doesn't know how to do), and ingests them.
 */
export async function startAcademicStructureImport(
  input: StartAcademicStructureImportInput,
  actorUserId: string,
): Promise<{ batch: ImportBatchDTO; profile: DataProfile }> {
  const profile = await buildAcademicStructureProfile(input.schoolId, input.rows);

  const created = await createImportBatch(
    {
      schoolId: input.schoolId,
      importType: "ACADEMIC_STRUCTURE",
      sourceFileName: input.sourceFileName,
      sourceFileType: input.sourceFileType,
      sourceFileHash: input.sourceFileHash,
    },
    actorUserId,
  );

  const grouped = groupAcademicStructureRows(input.rows);
  const batch = await ingestImportRows(
    {
      importBatchId: created.id,
      columnMapping: input.columnMapping,
      rows: grouped.map((row) => ({
        rowNumber: row.sourceRowNumbers[0],
        rawData: row as unknown as Record<string, unknown>,
      })),
    },
    actorUserId,
  );

  return { batch, profile };
}

/** Validate stage — delegates straight to D1's generic
 * validateImportBatch(); grouping already guarantees each row is unique
 * within the batch, so no sibling context is needed here. */
export async function validateAcademicStructureImport(
  batchId: string,
  schoolId: string,
  actorUserId: string,
): Promise<ImportBatchDTO> {
  const validator = createAcademicStructureValidator(schoolId);
  return validateImportBatch(batchId, validator, actorUserId);
}

/** Commit stage — one chunk at a time, per D1's own resumable design;
 * call repeatedly until `remaining` is 0. */
export async function commitAcademicStructureImportChunk(
  batchId: string,
  schoolId: string,
  actorUserId: string,
  chunkSize?: number,
): Promise<CommitChunkResult> {
  const handler = createAcademicStructureCommitHandler(schoolId);
  return commitImportBatchChunk(batchId, handler, actorUserId, chunkSize);
}
