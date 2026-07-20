import type { ImportRowStatus } from "@/generated/prisma/enums";
import type { ImportBatchDTO } from "@/services/import/dto/importBatch.dto";

// Grouped by (field, message) — "12 rows have a duplicate admission
// number," not 12 separate identical-looking error lines — per
// IMPORT_ENGINE_STRATEGY.md § 4's "groupable by type" requirement, so an
// Admin fixing a spreadsheet can fix a whole column-level mistake once.
export interface ImportErrorGroup {
  field: string;
  message: string;
  count: number;
  sampleRowNumbers: number[];
}

// The one reusable report shape — Preview (before commit) and Report
// (after) both render this same structure; a future CSV/PDF export of a
// completed batch's results would serialize this shape too, not invent its
// own. Duration is null until completedAt is set (Preview-time reports
// describe a batch that hasn't finished committing yet).
export interface ImportReportDTO {
  batch: ImportBatchDTO;
  rowCounts: Record<ImportRowStatus, number>;
  errorGroups: ImportErrorGroup[];
  durationMs: number | null;
}

export function buildImportReport(
  batch: ImportBatchDTO,
  rowCounts: Record<ImportRowStatus, number>,
  errorGroups: ImportErrorGroup[],
): ImportReportDTO {
  const durationMs =
    batch.completedAt != null
      ? new Date(batch.completedAt).getTime() - new Date(batch.createdAt).getTime()
      : null;

  return { batch, rowCounts, errorGroups, durationMs };
}
