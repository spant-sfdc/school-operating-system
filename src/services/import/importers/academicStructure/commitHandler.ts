import { findAcademicYearByLabel } from "@/repositories/academicYear";
import { createSchoolClassWithSections, createAcademicSubject } from "@/services/academic";
import type { ImportRowCommitHandler } from "@/services/import/extension-points";
import type { AcademicStructureGroupRow } from "@/services/import/importers/academicStructure/rows";

/**
 * Commit stage — the reference implementation of ImportRowCommitHandler.
 * Calls the *existing*, unmodified lifecycle services
 * (createSchoolClassWithSections(), createAcademicSubject()) — never a
 * bulk-insert bypass, per IMPORT_ENGINE_STRATEGY.md § 2.5. Both services
 * gained an optional `tx` parameter this sprint (see
 * docs/DECISIONS.md's Sprint D2 entry) specifically so their writes and
 * this row's own ImportRow status update land in the *same* transaction
 * commitImportBatchChunk() opens per row — a crash between "class created"
 * and "row marked COMMITTED" can never happen, and a retry after any other
 * failure is always safe (the class either exists, in which case the
 * validator already caught it before Commit, or it doesn't).
 */
export function createAcademicStructureCommitHandler(schoolId: string): ImportRowCommitHandler {
  return {
    async commitRow(rawData, actorUserId, tx) {
      const row = rawData as unknown as AcademicStructureGroupRow;

      if (row.kind === "CLASS_SECTION") {
        const academicYear = await findAcademicYearByLabel(schoolId, row.academicYearLabel);
        if (!academicYear) {
          throw new Error(`Academic year "${row.academicYearLabel}" no longer resolves.`);
        }

        const { schoolClass } = await createSchoolClassWithSections(
          {
            schoolId,
            academicYearId: academicYear.id,
            className: row.className,
            sortOrder: row.sortOrder,
            sectionNames: row.sectionNames,
          },
          actorUserId,
          tx,
        );

        return { entityId: schoolClass.id };
      }

      const subject = await createAcademicSubject(
        { schoolId, name: row.subjectName, code: row.subjectCode },
        actorUserId,
        tx,
      );

      return { entityId: subject.id };
    },
  };
}
