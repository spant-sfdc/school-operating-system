import { findAcademicYearByLabel } from "@/repositories/academicYear";
import { buildDataProfile, type DataProfile } from "@/services/import/profiling";
import type { RawAcademicStructureRow } from "@/services/import/importers/academicStructure/rows";

/**
 * Data Profiling — runs on the *raw*, ungrouped rows (before
 * groupAcademicStructureRows() collapses multiple section rows into one
 * class row), since "these 2 raw rows both claim Class 1 Section A" is a
 * real file-quality signal worth surfacing even though grouping later
 * absorbs it without error. Resolves "known" academic year labels from the
 * database once, up front, then hands them to the generic, pure
 * buildDataProfile() — the only database-aware part of profiling lives
 * here, in the entity-specific importer, not in the reusable foundation.
 */
export async function buildAcademicStructureProfile(
  schoolId: string,
  rows: RawAcademicStructureRow[],
): Promise<DataProfile> {
  const distinctLabels = [...new Set(rows.map((row) => row.academicYearLabel).filter(Boolean))];
  const knownLabels = new Set<string>();
  for (const label of distinctLabels) {
    const year = await findAcademicYearByLabel(schoolId, label);
    if (year) knownLabels.add(label);
  }

  return buildDataProfile(rows as unknown as Record<string, unknown>[], {
    keyFields: ["academicYearLabel", "className", "sectionName", "subjectName"],
    requiredFields: ["academicYearLabel"],
    knownValues: { academicYearLabel: knownLabels },
  });
}
