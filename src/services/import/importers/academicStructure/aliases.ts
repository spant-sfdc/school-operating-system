import { findMostRecentBatchByType } from "@/repositories/importBatch";
import {
  suggestColumnMappings,
  type ColumnMappingSuggestion,
} from "@/services/import/extension-points";

// A reusable alias dictionary — common source-column spellings a real
// school spreadsheet uses, mapped to this importer's canonical field
// names. Deliberately small (per this sprint's own "do not over-engineer"
// instruction) — covers the exact examples this sprint names, not a
// speculative exhaustive list. Keys are normalized (lowercase, spaces
// stripped) at lookup time, not stored pre-normalized, so the dictionary
// itself stays readable.
const COLUMN_ALIASES: Record<string, string> = {
  class: "className",
  std: "className",
  standard: "className",
  classname: "className",
  section: "sectionName",
  division: "sectionName",
  sectionname: "sectionName",
  subject: "subjectName",
  course: "subjectName",
  subjectname: "subjectName",
  subjectcode: "subjectCode",
  code: "subjectCode",
  academicyear: "academicYearLabel",
  year: "academicYearLabel",
  session: "academicYearLabel",
  academicyearlabel: "academicYearLabel",
  order: "sortOrder",
  sortorder: "sortOrder",
};

const CANONICAL_FIELDS = [
  "academicYearLabel",
  "className",
  "sectionName",
  "sortOrder",
  "subjectName",
  "subjectCode",
];

function normalize(column: string): string {
  return column
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

/**
 * Detect stage — Academic Structure's own column-mapping suggestion.
 * Checks the curated alias dictionary first (a real school's spreadsheet
 * almost certainly uses one of these exact spellings, so this is a
 * higher-confidence match than a generic exact-match fallback), then falls
 * back to the Import Engine foundation's generic suggestColumnMappings()
 * (exact match against the canonical field names themselves) for any
 * column the dictionary doesn't recognize. Not AI — a deterministic
 * lookup, per this sprint's "do not over-engineer" instruction; the
 * "future smart mapping" this prepares for is a later, separately-scoped
 * decision (see Sprint D1's own extension-points.ts).
 */
export function suggestAcademicStructureColumnMapping(
  sourceColumns: string[],
): ColumnMappingSuggestion[] {
  const generic = suggestColumnMappings(sourceColumns, CANONICAL_FIELDS);

  return sourceColumns.map((sourceColumn, index) => {
    const aliasMatch = COLUMN_ALIASES[normalize(sourceColumn)];
    if (aliasMatch) {
      return { sourceColumn, suggestedField: aliasMatch, confidence: 1 };
    }
    return generic[index];
  });
}

/**
 * Import Template support — architecture only, no UI. Sprint D1 already
 * built the storage (`ImportBatch.columnMapping`, persisted per batch) and
 * the lookup (`findMostRecentBatchByType()`, unused until now); this is
 * the first real caller. A school's second Academic Structure import
 * (e.g. importing Class 5-8 this week, Class 1-4 next week) reuses its own
 * prior mapping automatically rather than asking the Admin to re-map
 * columns that mean the same thing every time — IMPORT_ENGINE_STRATEGY.md
 * § 2.2's own "saved mapping" requirement. Falls back to an identity
 * mapping (every canonical field maps to a same-named column) when no
 * prior batch exists yet, a reasonable default for a first-time import
 * whose source file already used this importer's own field names.
 */
export async function getAcademicStructureColumnMappingTemplate(
  schoolId: string,
): Promise<Record<string, string>> {
  const priorBatch = await findMostRecentBatchByType(schoolId, "ACADEMIC_STRUCTURE");
  if (priorBatch?.columnMapping) {
    return priorBatch.columnMapping as Record<string, string>;
  }
  return Object.fromEntries(CANONICAL_FIELDS.map((field) => [field, field]));
}
