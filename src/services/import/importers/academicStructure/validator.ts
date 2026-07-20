import { findAcademicYearByLabel } from "@/repositories/academicYear";
import { findSchoolClassByName } from "@/repositories/schoolClass";
import { findSubjectByName } from "@/repositories/subject";
import type {
  ImportRowValidator,
  ImportRowValidationResult,
} from "@/services/import/extension-points";
import type { AcademicStructureGroupRow } from "@/services/import/importers/academicStructure/rows";

/**
 * Business + Database Validation for the Academic Structure importer — the
 * reference implementation of the ImportRowValidator contract (Sprint D1,
 * widened async this sprint specifically because this validation needs
 * real queries). A factory, not a plain object, for symmetry with
 * createAcademicStructureCommitHandler() and to leave room for a future
 * cross-row check without changing the ImportRowValidator contract again —
 * though today's checks are all genuinely single-row: grouping
 * (rows.ts's groupAcademicStructureRows()) already guarantees at most one
 * ClassSectionGroupRow per (year, class) and one SubjectGroupRow per
 * (year, subject) — an intra-file repeat is silently merged before a row
 * ever reaches Validate, not a validation failure. Intra-file duplicates
 * are still visible to the Admin, just as a Data Profiling *warning*
 * (profile.ts), not a blocking error — a school listing "Class 1, Section
 * A" twice in their own spreadsheet is a harmless data-quality note, not a
 * reason to reject the file. Per IMPORT_ENGINE_STRATEGY.md § 2.3, every
 * row is validated — never fail-fast on the first error — and every error
 * names its field and a plain-language reason.
 */
export function createAcademicStructureValidator(schoolId: string): ImportRowValidator {
  return {
    async validateRow(rawData): Promise<ImportRowValidationResult> {
      const row = rawData as unknown as AcademicStructureGroupRow;
      const errors: ImportRowValidationResult["errors"] = [];

      if (!row.academicYearLabel) {
        errors.push({ field: "academicYearLabel", message: "Academic year is required." });
      } else {
        const year = await findAcademicYearByLabel(schoolId, row.academicYearLabel);
        if (!year) {
          errors.push({
            field: "academicYearLabel",
            message: `Academic year "${row.academicYearLabel}" was not found — it must already exist before importing academic structure into it.`,
          });
        }
      }

      if (row.kind === "CLASS_SECTION") {
        if (!row.className) {
          errors.push({ field: "className", message: "Class name is required." });
        } else {
          const existing = await findSchoolClassByName(schoolId, row.className);
          if (existing) {
            errors.push({
              field: "className",
              message: `A class named "${row.className}" already exists at this school.`,
            });
          }
        }
        if (row.sectionNames.length === 0) {
          errors.push({
            field: "sectionName",
            message: `Class "${row.className}" has no sections in this file.`,
          });
        }
      } else {
        if (!row.subjectName) {
          errors.push({ field: "subjectName", message: "Subject name is required." });
        } else {
          const existing = await findSubjectByName(schoolId, row.subjectName);
          if (existing) {
            errors.push({
              field: "subjectName",
              message: `A subject named "${row.subjectName}" already exists at this school.`,
            });
          }
        }
      }

      return { valid: errors.length === 0, errors };
    },
  };
}
