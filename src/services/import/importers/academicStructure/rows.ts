// Row shapes for the Academic Structure Importer — the reference
// implementation for every future importer (Student, Teacher, Attendance,
// Admission, Result). Deliberately format-agnostic: this module receives
// already-parsed, already-column-mapped plain rows (CSV/XLSX/ODS parsing,
// and any future API source, all live outside this importer entirely, per
// this sprint's own "do not tie the importer to CSV" instruction) — nothing
// here imports a parsing library or knows what file format the data came
// from.

// One row per source spreadsheet line, already mapped from whatever the
// source file's own column headers were (see aliases.ts) to these
// canonical field names. A row describes either a class+section (className
// present) or a subject (subjectName present) — never both; a school's
// real spreadsheet naturally has one row per section and one row per
// subject, not a "kind" column no real spreadsheet has.
export interface RawAcademicStructureRow {
  rowNumber: number;
  academicYearLabel: string;
  className?: string;
  sectionName?: string;
  sortOrder?: number;
  subjectName?: string;
  subjectCode?: string;
}

export interface ClassSectionGroupRow {
  kind: "CLASS_SECTION";
  sourceRowNumbers: number[];
  academicYearLabel: string;
  className: string;
  sortOrder: number;
  sectionNames: string[];
  // Section names that appeared more than once for this class in the
  // source file — deduped in sectionNames above, but named here so
  // Validate/Report can still warn about the file's own quality.
  duplicateSectionNames: string[];
}

export interface SubjectGroupRow {
  kind: "SUBJECT";
  sourceRowNumbers: number[];
  academicYearLabel: string;
  subjectName: string;
  subjectCode?: string;
}

export type AcademicStructureGroupRow = ClassSectionGroupRow | SubjectGroupRow;

/**
 * Groups raw, one-row-per-spreadsheet-line input into one row per unique
 * class (carrying its full section list) and one row per subject — the
 * shape createSchoolClassWithSections()/createAcademicSubject() actually
 * expect. Grouping happens *before* ingestion (not at Commit time) so each
 * resulting ImportRow maps to exactly one atomic commit unit, matching
 * Sprint D1's per-row-transaction commit model — a class with 3 sections
 * becomes 3 raw rows but exactly 1 ImportRow, not 3 competing attempts to
 * "create" the same class. Sort order is taken from the first contributing
 * row's own sortOrder if present, else falls back to the row's position
 * among unique classes encountered (first class seen = 0, etc.) — a
 * reasonable default when a source file has no explicit ordering column.
 */
export function groupAcademicStructureRows(
  rows: RawAcademicStructureRow[],
): AcademicStructureGroupRow[] {
  const classGroups = new Map<
    string,
    {
      sourceRowNumbers: number[];
      academicYearLabel: string;
      className: string;
      sortOrder: number | undefined;
      sectionNames: string[];
      seenSectionNames: Set<string>;
      duplicateSectionNames: string[];
    }
  >();
  const subjectGroups = new Map<string, SubjectGroupRow>();
  let nextDefaultSortOrder = 0;

  for (const row of rows) {
    if (row.className) {
      const key = `${row.academicYearLabel}::${row.className}`;
      let group = classGroups.get(key);
      if (!group) {
        group = {
          sourceRowNumbers: [],
          academicYearLabel: row.academicYearLabel,
          className: row.className,
          sortOrder: row.sortOrder,
          sectionNames: [],
          seenSectionNames: new Set(),
          duplicateSectionNames: [],
        };
        group.sortOrder ??= nextDefaultSortOrder++;
        classGroups.set(key, group);
      }
      group.sourceRowNumbers.push(row.rowNumber);

      if (row.sectionName) {
        if (group.seenSectionNames.has(row.sectionName)) {
          group.duplicateSectionNames.push(row.sectionName);
        } else {
          group.seenSectionNames.add(row.sectionName);
          group.sectionNames.push(row.sectionName);
        }
      }
    } else if (row.subjectName) {
      const key = `${row.academicYearLabel}::${row.subjectName}`;
      const existing = subjectGroups.get(key);
      if (existing) {
        existing.sourceRowNumbers.push(row.rowNumber);
      } else {
        subjectGroups.set(key, {
          kind: "SUBJECT",
          sourceRowNumbers: [row.rowNumber],
          academicYearLabel: row.academicYearLabel,
          subjectName: row.subjectName,
          subjectCode: row.subjectCode,
        });
      }
    }
  }

  const classSectionRows: ClassSectionGroupRow[] = [...classGroups.values()].map((group) => ({
    kind: "CLASS_SECTION",
    sourceRowNumbers: group.sourceRowNumbers,
    academicYearLabel: group.academicYearLabel,
    className: group.className,
    sortOrder: group.sortOrder ?? 0,
    sectionNames: group.sectionNames,
    duplicateSectionNames: group.duplicateSectionNames,
  }));

  return [...classSectionRows, ...subjectGroups.values()];
}
