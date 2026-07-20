import type { Prisma } from "@/generated/prisma/client";
import type { ImportRowError } from "@/services/import/dto/importRow.dto";

// The two contracts a future entity-specific importer (StudentImporter,
// TeacherImporter, AttendanceImporter, ...) implements — this sprint
// defines and orchestrates around them (see import.service.ts's
// validateImportBatch()/commitImportBatchChunk()), it does not implement
// either for any real entity. Deliberately plain function-shaped
// interfaces, not a class hierarchy or a registry — a future importer
// passes its own implementation directly into the generic service
// functions, so this foundation stays entity-agnostic with zero embedded
// knowledge of what a Student or Teacher record even looks like.

export interface ImportRowValidationResult {
  valid: boolean;
  errors: ImportRowError[];
}

// Wraps a future importer's own existing Zod schema (registerStudentInputSchema,
// registerTeacherInputSchema, ...) — reusing the exact same validation the
// manual Admin-form path already uses, per IMPORT_ENGINE_STRATEGY.md § 2.3's
// "no duplicated validation logic" rule. This is Business Validation in this
// sprint's Validation Strategy (see docs/DECISIONS.md's Sprint D1 entry) —
// File/Column validation already happened before a row reaches this stage;
// Database validation (does the row's className/sectionName resolve to a
// real SchoolClass/Section) is a future importer's own concern too, since it
// requires entity-specific repository knowledge this foundation doesn't have.
export interface ImportRowValidator {
  validateRow(rawData: Record<string, unknown>): ImportRowValidationResult;
}

// Wraps a future importer's own existing lifecycle service call
// (registerStudent(), registerTeacher(), assignTeacher(), ...) so a
// committed import row gets the exact same business-rule enforcement and
// AuditLog coverage a manually-entered row gets — per
// IMPORT_ENGINE_STRATEGY.md § 2.5's "never a bulk-insert bypass" principle.
// Runs inside commitImportBatchChunk()'s own per-row transaction; throwing
// marks that one row FAILED without affecting any other row in the chunk.
export interface ImportRowCommitHandler {
  commitRow(
    rawData: Record<string, unknown>,
    actorUserId: string,
    tx: Prisma.TransactionClient,
  ): Promise<{ entityId: string }>;
}

export interface ColumnMappingSuggestion {
  sourceColumn: string;
  suggestedField: string | null;
  // 0 (no match) to 1 (exact match). This sprint only ever returns 0 or 1 —
  // the range is reserved so a future AI-backed implementation (see
  // docs/DECISIONS.md's Sprint D1 entry, "AI Preparation") can return a
  // genuine partial-confidence score as a drop-in replacement, same
  // signature, same return shape.
  confidence: number;
}

// The Detect stage's own column-mapping helper — naive, deterministic,
// case-insensitive exact-match only. Not AI, per this sprint's explicit
// "Do NOT implement AI mapping" instruction; a real "column suggestions"
// or "data quality analysis" feature is a named-but-unimplemented future
// extension point, not built here.
export function suggestColumnMappings(
  sourceColumns: string[],
  targetFields: string[],
): ColumnMappingSuggestion[] {
  const normalizedTargets = new Map(
    targetFields.map((field) => [field.trim().toLowerCase(), field]),
  );

  return sourceColumns.map((sourceColumn) => {
    const match = normalizedTargets.get(sourceColumn.trim().toLowerCase());
    return { sourceColumn, suggestedField: match ?? null, confidence: match ? 1 : 0 };
  });
}
