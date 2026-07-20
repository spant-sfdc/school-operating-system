import type { ImportEntityType } from "@/generated/prisma/enums";
import type {
  ImportRowValidator,
  ImportRowCommitHandler,
} from "@/services/import/extension-points";
import {
  groupAcademicStructureRows,
  createAcademicStructureValidator,
  createAcademicStructureCommitHandler,
  type RawAcademicStructureRow,
} from "@/services/import/importers/academicStructure";

/**
 * The one place that answers "is this import type actually wired up to a
 * real importer today" — a small, explicit map, not a dynamic plugin
 * system (this sprint's own "do not over-engineer" instruction, extended
 * from column aliases to this too). Adding a future StudentImporter is
 * exactly one new entry here, nothing else in the Upload/Mapping/Preview
 * pages needs to change — they already read entirely through this
 * registry, never importing an entity-specific module by name.
 */
export interface ImporterRegistration {
  // Raw, parsed-but-unmapped rows (one per source line, already translated
  // to canonical field names by the confirmed column mapping) -> the
  // shape ingestImportRows() expects (grouped, for importers that need
  // grouping; a straight pass-through for ones that don't).
  group: (rows: Array<{ rowNumber: number; rawData: Record<string, unknown> }>) => Array<{
    rowNumber: number;
    rawData: Record<string, unknown>;
  }>;
  createValidator: (schoolId: string) => ImportRowValidator;
  createCommitHandler: (schoolId: string) => ImportRowCommitHandler;
}

function identityGroup(
  rows: Array<{ rowNumber: number; rawData: Record<string, unknown> }>,
): Array<{ rowNumber: number; rawData: Record<string, unknown> }> {
  return rows;
}

const IMPORTER_REGISTRY: Partial<Record<ImportEntityType, ImporterRegistration>> = {
  ACADEMIC_STRUCTURE: {
    group: (rows) => {
      const rawRows = rows.map(
        (row) =>
          ({ rowNumber: row.rowNumber, ...row.rawData }) as unknown as RawAcademicStructureRow,
      );
      const grouped = groupAcademicStructureRows(rawRows);
      return grouped.map((row) => ({
        rowNumber: row.sourceRowNumbers[0],
        rawData: row as unknown as Record<string, unknown>,
      }));
    },
    createValidator: createAcademicStructureValidator,
    createCommitHandler: createAcademicStructureCommitHandler,
  },
};

export function getImporterRegistration(
  importType: ImportEntityType,
): ImporterRegistration | undefined {
  return IMPORTER_REGISTRY[importType];
}

export function isImportTypeSupported(importType: ImportEntityType): boolean {
  return importType in IMPORTER_REGISTRY;
}

export { identityGroup };
