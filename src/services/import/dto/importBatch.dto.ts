import type { ImportBatch } from "@/generated/prisma/client";

export interface ImportBatchDTO {
  id: string;
  schoolId: string;
  importType: ImportBatch["importType"];
  status: ImportBatch["status"];
  sourceFileName: string;
  sourceFileType: ImportBatch["sourceFileType"];
  columnMapping: Record<string, string> | null;
  totalRows: number | null;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  createdByUserId: string;
  createdAt: string;
  completedAt: string | null;
}

export function toImportBatchDTO(row: ImportBatch): ImportBatchDTO {
  return {
    id: row.id,
    schoolId: row.schoolId,
    importType: row.importType,
    status: row.status,
    sourceFileName: row.sourceFileName,
    sourceFileType: row.sourceFileType,
    columnMapping: (row.columnMapping as Record<string, string> | null) ?? null,
    totalRows: row.totalRows,
    successCount: row.successCount,
    errorCount: row.errorCount,
    skippedCount: row.skippedCount,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  };
}

export interface ImportBatchListDTO {
  items: ImportBatchDTO[];
  total: number;
  page: number;
  pageSize: number;
}
