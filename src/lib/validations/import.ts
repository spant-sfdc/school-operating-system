import { z } from "zod";

const importEntityTypeSchema = z.enum([
  "STUDENT",
  "TEACHER",
  "GUARDIAN",
  "SCHOOL_CLASS",
  "SECTION",
  "SUBJECT",
  "ATTENDANCE",
  "ADMISSION",
  "RESULT",
  "FEE",
  "TRANSPORT",
]);

const importFileFormatSchema = z.enum(["CSV", "XLSX", "ODS"]);

// Upload stage — file parsing itself is out of this sprint's scope (per its
// own "do not implement parsing beyond what this sprint genuinely
// requires" instruction); this validates the batch's own metadata once a
// caller has already determined the file's name/type/hash/row count some
// other way.
export const createImportBatchInputSchema = z.object({
  schoolId: z.string().min(1),
  importType: importEntityTypeSchema,
  sourceFileName: z.string().min(1).max(255),
  sourceFileType: importFileFormatSchema,
  sourceFileHash: z.string().min(1).max(128).optional(),
});
export type CreateImportBatchInput = z.input<typeof createImportBatchInputSchema>;

// Map stage — one row's already-parsed, already-mapped data. rawData's
// actual shape depends entirely on the target entity type (unknown to this
// entity-agnostic foundation, by design), so it's validated only as "a
// plain object," not against any specific field list — a future
// entity-specific importer's own ImportRowValidator (see
// src/services/import/extension-points.ts) is what checks the real fields.
const importRowInputSchema = z.object({
  rowNumber: z.number().int().min(1),
  rawData: z.record(z.string(), z.unknown()),
});

export const ingestImportRowsInputSchema = z.object({
  importBatchId: z.string().min(1),
  rows: z.array(importRowInputSchema).min(1),
  columnMapping: z.record(z.string(), z.string()),
});
export type IngestImportRowsInput = z.input<typeof ingestImportRowsInputSchema>;

export const searchImportBatchesInputSchema = z.object({
  schoolId: z.string().min(1),
  importType: importEntityTypeSchema.optional(),
  status: z
    .enum([
      "UPLOADED",
      "DETECTED",
      "MAPPED",
      "VALIDATED",
      "PREVIEWED",
      "COMMITTING",
      "COMPLETED",
      "FAILED",
      "PARTIALLY_COMPLETED",
    ])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export type SearchImportBatchesInput = z.input<typeof searchImportBatchesInputSchema>;
