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
// "no duplicated validation logic" rule. Covers both Business Validation
// (field-level, the row's own data) and Database Validation (does a
// referenced value resolve to a real row — e.g. does className already
// exist, does academicYearLabel resolve to a real AcademicYear) in one
// pass, since IMPORT_ENGINE_STRATEGY.md § 2.3 runs both in the same Validate
// stage; File/Column validation already happened before a row reaches this
// stage. Returns a Promise — Sprint D1 originally specified this
// synchronous, but Sprint D2's own Academic Structure importer (the first
// real implementation) found that Database Validation is not optional for
// a real importer (duplicate-detection, reference resolution both require a
// query) — see docs/DECISIONS.md's Sprint D2 entry.
export interface ImportRowValidator {
  validateRow(
    rawData: Record<string, unknown>,
  ): ImportRowValidationResult | Promise<ImportRowValidationResult>;
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
