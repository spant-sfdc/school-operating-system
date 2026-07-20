import type { ImportEntityType, ImportFileFormat } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import { findImportBatchById, updateImportBatch } from "@/repositories/importBatch";
import {
  createImportBatch,
  findPriorBatchForFile,
  ingestImportRows,
  validateImportBatch,
} from "@/services/import/import.service";
import { toImportBatchDTO, type ImportBatchDTO } from "@/services/import/dto";
import { parseImportFile, FileParseError } from "@/services/import/parsing";
import { validateUploadedFile, computeFileHash } from "@/services/import/fileValidation";
import { detectImportType } from "@/services/import/detection";
import { buildDataProfile, type DataProfile } from "@/services/import/profiling";
import { buildImportHealthSummary, type ImportHealthSummary } from "@/services/import/importHealth";
import { getImportProfile } from "@/services/import/profiles";
import { getSavedColumnMapping } from "@/services/import/columnMapping";
import {
  getImporterRegistration,
  identityGroup,
  isImportTypeSupported,
} from "@/services/import/importerRegistry";

export class UploadValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super(errors.join(" "));
    this.name = "UploadValidationError";
  }
}

export interface UploadImportFileResult {
  batch: ImportBatchDTO;
  profile: DataProfile;
  health: ImportHealthSummary;
  detectedImportType: ImportEntityType | null;
  detectionConfidence: number;
  priorDuplicateBatch: ImportBatchDTO | null;
  suggestedColumnMapping: Record<string, string>;
}

/**
 * Upload + Detect + Data Profiling, in one call — the reference flow this
 * sprint's own instruction asks every future importer to reuse. File
 * Validation (type/empty/size) runs first, before any parsing is
 * attempted; a parser failure (FileParseError — a corrupted file, or a
 * renamed-extension mismatch) is caught and re-thrown as the same
 * UploadValidationError shape, so the Upload page's error handling is one
 * code path, not two. The ImportBatch is created immediately (status
 * DETECTED) with the parsed-but-unmapped file contents stored in
 * `rawFileData` — Mapping is a separate page navigation, so this data must
 * survive between requests; see prisma/schema.prisma's own comment on
 * why that's an additive column on ImportBatch, not a new table.
 */
export async function uploadImportFile(
  input: {
    schoolId: string;
    fileName: string;
    fileBuffer: Buffer;
  },
  actorUserId: string,
): Promise<UploadImportFileResult> {
  const validation = validateUploadedFile(input.fileName, input.fileBuffer.byteLength);
  if (!validation.valid || !validation.format) {
    throw new UploadValidationError(validation.errors);
  }
  const format: ImportFileFormat = validation.format;

  const sourceFileHash = computeFileHash(input.fileBuffer);
  const priorBatchRow = await findPriorBatchForFile(input.schoolId, sourceFileHash);

  let parsed;
  try {
    parsed = await parseImportFile(input.fileBuffer, format);
  } catch (error) {
    if (error instanceof FileParseError) {
      throw new UploadValidationError([error.message]);
    }
    throw new UploadValidationError([
      `This file could not be read — it may be corrupted or not actually a ${format} file.`,
    ]);
  }
  if (parsed.rows.length === 0) {
    throw new UploadValidationError(["The file has a header row but no data rows."]);
  }

  const detection = detectImportType(parsed.columns);
  const profile = buildDataProfile(parsed.rows, {
    keyFields: parsed.columns,
    requiredFields: [],
  });
  const health = buildImportHealthSummary(profile);

  const initialImportType: ImportEntityType = detection.importType ?? "ACADEMIC_STRUCTURE";
  const profileForMapping = getImportProfile(initialImportType);
  const suggestedColumnMapping = profileForMapping
    ? await getSavedColumnMapping(
        input.schoolId,
        initialImportType,
        parsed.columns,
        profileForMapping,
      )
    : {};

  const created = await createImportBatch(
    {
      schoolId: input.schoolId,
      importType: initialImportType,
      sourceFileName: input.fileName,
      sourceFileType: format,
      sourceFileHash,
    },
    actorUserId,
  );
  const withRawData = await updateImportBatch(created.id, {
    status: "DETECTED",
    rawFileData: { columns: parsed.columns, rows: parsed.rows } as unknown as Prisma.InputJsonValue,
  });

  return {
    batch: toImportBatchDTO(withRawData),
    profile,
    health,
    detectedImportType: detection.importType,
    detectionConfidence: detection.confidence,
    priorDuplicateBatch: priorBatchRow,
    suggestedColumnMapping,
  };
}

/**
 * Map confirm — reads the batch's own stored rawFileData, applies the
 * confirmed column mapping (a generic rename, entity-agnostic), then hands
 * the mapped rows to the importer registry's own grouping function (an
 * identity pass-through for an importer that doesn't need one). Clears
 * rawFileData once ingestImportRows() has durably persisted the real
 * ImportRow records, then immediately runs that importer's own validator —
 * Validate is not a separate manual step in this flow, matching
 * IMPORT_ENGINE_STRATEGY.md § 2.3's "every row validated before Preview."
 */
export async function confirmImportMapping(
  input: {
    batchId: string;
    schoolId: string;
    importType: ImportEntityType;
    columnMapping: Record<string, string>;
  },
  actorUserId: string,
): Promise<ImportBatchDTO> {
  const batch = await findImportBatchById(input.batchId);
  if (!batch) throw new Error(`ImportBatch not found: ${input.batchId}`);
  if (!batch.rawFileData) {
    throw new Error("This batch has no pending file data to map — it may already be mapped.");
  }
  if (!isImportTypeSupported(input.importType)) {
    throw new Error(
      `Import type ${input.importType} does not have a working importer yet — Academic Structure is the only one built so far.`,
    );
  }

  const rawFileData = batch.rawFileData as unknown as {
    columns: string[];
    rows: Record<string, unknown>[];
  };

  const mappedRows = rawFileData.rows.map((row, index) => {
    const rawData: Record<string, unknown> = {};
    for (const [sourceColumn, targetField] of Object.entries(input.columnMapping)) {
      if (targetField) rawData[targetField] = row[sourceColumn];
    }
    return { rowNumber: index + 1, rawData };
  });

  const registration = getImporterRegistration(input.importType);
  const grouped = registration ? registration.group(mappedRows) : identityGroup(mappedRows);

  await updateImportBatch(input.batchId, { importType: input.importType });

  await ingestImportRows(
    { importBatchId: input.batchId, columnMapping: input.columnMapping, rows: grouped },
    actorUserId,
  );
  await updateImportBatch(input.batchId, { rawFileData: Prisma.DbNull });

  const validator = registration?.createValidator(input.schoolId);
  if (validator) {
    return validateImportBatch(input.batchId, validator, actorUserId);
  }

  const refreshed = await findImportBatchById(input.batchId);
  return toImportBatchDTO(refreshed ?? batch);
}

export interface PendingImportPreview {
  batch: ImportBatchDTO;
  columns: string[];
  rowCount: number;
  sampleRow: Record<string, unknown> | null;
  profile: DataProfile;
  health: ImportHealthSummary;
}

/**
 * The Mapping page's own read — deliberately narrow: exposes only the
 * column list and one sample row for the mapping UI's benefit (never the
 * full row set; showing a school's entire uploaded roster on a mapping
 * screen would be both unnecessary and a real over-exposure), recomputed
 * fresh from `rawFileData` rather than trusting a stale stored profile.
 * Returns null once mapping has already been confirmed (`rawFileData`
 * cleared) — the Mapping page redirects to Preview in that case rather
 * than showing a stale form.
 */
export async function getPendingImportPreview(
  batchId: string,
): Promise<PendingImportPreview | null> {
  const batch = await findImportBatchById(batchId);
  if (!batch || !batch.rawFileData) return null;

  const rawFileData = batch.rawFileData as unknown as {
    columns: string[];
    rows: Record<string, unknown>[];
  };
  const profile = buildDataProfile(rawFileData.rows, {
    keyFields: rawFileData.columns,
    requiredFields: [],
  });

  return {
    batch: toImportBatchDTO(batch),
    columns: rawFileData.columns,
    rowCount: rawFileData.rows.length,
    sampleRow: rawFileData.rows[0] ?? null,
    profile,
    health: buildImportHealthSummary(profile),
  };
}
