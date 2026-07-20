import type { ImportRow } from "@/generated/prisma/client";

export interface ImportRowError {
  field: string;
  message: string;
}

export interface ImportRowDTO {
  id: string;
  importBatchId: string;
  rowNumber: number;
  rawData: Record<string, unknown>;
  status: ImportRow["status"];
  validationErrors: ImportRowError[] | null;
  entityId: string | null;
  committedAt: string | null;
}

export function toImportRowDTO(row: ImportRow): ImportRowDTO {
  return {
    id: row.id,
    importBatchId: row.importBatchId,
    rowNumber: row.rowNumber,
    rawData: row.rawData as Record<string, unknown>,
    status: row.status,
    validationErrors: (row.validationErrors as ImportRowError[] | null) ?? null,
    entityId: row.entityId,
    committedAt: row.committedAt?.toISOString() ?? null,
  };
}

export interface ImportRowListDTO {
  items: ImportRowDTO[];
  total: number;
  page: number;
  pageSize: number;
}
