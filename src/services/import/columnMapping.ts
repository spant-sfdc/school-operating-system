import { findMostRecentBatchByType } from "@/repositories/importBatch";
import {
  suggestColumnMappings,
  type ColumnMappingSuggestion,
} from "@/services/import/extension-points";
import type { ImportProfile } from "@/services/import/profiles";
import type { ImportEntityType } from "@/generated/prisma/enums";

function normalize(column: string): string {
  return column
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

/**
 * Smart Column Mapping — generalized from Sprint D2's
 * academicStructure-only `suggestAcademicStructureColumnMapping()` into a
 * profile-driven function every importer's own alias dictionary reuses
 * (this sprint's own "must be reusable across all importers" instruction).
 * Checks the profile's curated alias dictionary first (a real school's
 * spreadsheet almost certainly uses one of these exact spellings, so this
 * is a higher-confidence match than a generic exact-match fallback), then
 * falls back to Sprint D1's generic exact-match suggestColumnMappings()
 * for any column the profile's own dictionary doesn't recognize.
 * Deterministic — not AI, per this sprint's own instruction; the "future
 * smart mapping" this prepares for (Sprint D1's own extension-points.ts
 * comment) is a later, separately-scoped decision.
 */
export function suggestColumnMapping(
  sourceColumns: string[],
  profile: ImportProfile,
): ColumnMappingSuggestion[] {
  const generic = suggestColumnMappings(sourceColumns, profile.expectedColumns);

  return sourceColumns.map((sourceColumn, index) => {
    const aliasMatch = profile.aliases[normalize(sourceColumn)];
    if (aliasMatch) {
      return { sourceColumn, suggestedField: aliasMatch, confidence: 1 };
    }
    return generic[index];
  });
}

/**
 * Saved Mapping Templates — architecture only, per this sprint's own
 * instruction, generalized from Sprint D2's
 * `getAcademicStructureColumnMappingTemplate()`. Sprint D1 already built
 * the storage (`ImportBatch.columnMapping`, persisted per batch) and the
 * lookup (`findMostRecentBatchByType()`); this is the one, profile-driven
 * caller every importer's Mapping page uses. A school's second import of
 * the same type (this year's Academic Structure update, or next year's)
 * reuses its own prior mapping automatically — IMPORT_ENGINE_STRATEGY.md
 * § 2.2's "saved mapping" requirement — rather than asking the Admin to
 * re-map columns that mean the same thing every time. Falls back to the
 * profile's own alias-dictionary-derived suggestion when no prior batch of
 * this type exists yet (a first-time import).
 */
export async function getSavedColumnMapping(
  schoolId: string,
  importType: ImportEntityType,
  sourceColumns: string[],
  profile: ImportProfile,
): Promise<Record<string, string>> {
  const priorBatch = await findMostRecentBatchByType(schoolId, importType);
  if (priorBatch?.columnMapping) {
    return priorBatch.columnMapping as Record<string, string>;
  }

  const suggestions = suggestColumnMapping(sourceColumns, profile);
  return Object.fromEntries(
    suggestions
      .filter((suggestion) => suggestion.suggestedField)
      .map((suggestion) => [suggestion.sourceColumn, suggestion.suggestedField as string]),
  );
}
