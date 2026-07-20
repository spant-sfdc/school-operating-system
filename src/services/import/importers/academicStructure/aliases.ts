import { suggestColumnMapping, getSavedColumnMapping } from "@/services/import/columnMapping";
import { ACADEMIC_STRUCTURE_PROFILE } from "@/services/import/profiles";
import type { ColumnMappingSuggestion } from "@/services/import/extension-points";

/**
 * Academic Structure's own thin wrapper around Sprint D3's generalized,
 * profile-driven column mapping — kept for call-site convenience (nothing
 * here duplicates D3's logic; both functions immediately delegate,
 * pre-filled with ACADEMIC_STRUCTURE_PROFILE). Originally built directly
 * in Sprint D2 with a hardcoded alias dictionary; that dictionary is now
 * ACADEMIC_STRUCTURE_PROFILE.aliases (src/services/import/profiles.ts),
 * the single source every importer's own Detection/Mapping/Template code
 * reads, per Sprint D3's own "must be reusable across all importers"
 * instruction.
 */
export function suggestAcademicStructureColumnMapping(
  sourceColumns: string[],
): ColumnMappingSuggestion[] {
  return suggestColumnMapping(sourceColumns, ACADEMIC_STRUCTURE_PROFILE);
}

export async function getAcademicStructureColumnMappingTemplate(
  schoolId: string,
  sourceColumns: string[] = ACADEMIC_STRUCTURE_PROFILE.expectedColumns,
): Promise<Record<string, string>> {
  return getSavedColumnMapping(
    schoolId,
    "ACADEMIC_STRUCTURE",
    sourceColumns,
    ACADEMIC_STRUCTURE_PROFILE,
  );
}
