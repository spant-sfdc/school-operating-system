import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { listSchoolClassesBySchool } from "@/repositories/schoolClass";
import { listSectionsBySchoolAndYear } from "@/repositories/section";
import { listEnrollmentsBySection } from "@/repositories/enrollment";
import {
  findClassTeacherForSection,
  listAssignmentsForSection,
} from "@/repositories/teacherAssignment";
import { countSubjectsByClass } from "@/repositories/classSubject";
import type {
  ClassHealthIssueDTO,
  SectionHealthIssueDTO,
  StructureHealthDTO,
} from "@/services/structureHealth/structureHealth.dto";

/**
 * Structure Health (Sprint E13, Phase 8) — deterministic checks only, no
 * AI, no heuristics: every flag below is computed from a real, already-
 * existing relationship (ClassSubject, TeacherAssignment, Enrollment,
 * AcademicYear), not inferred. "Duplicate subject assignments" (a
 * capability named as an *example* by this sprint's own task prompt) is
 * deliberately not one of the checks below — `ClassSubject`'s own
 * `@@unique([schoolClassId, subjectId])` constraint makes that state
 * structurally impossible to reach in the first place, so there is
 * nothing for a health check to ever find (see docs/DECISIONS.md's
 * Sprint E13 entry).
 *
 * A read-composition service, same shape as
 * src/services/principal/principalWorkspace.service.ts: no new table, no
 * caching — a school's structure is small (a handful of classes/sections),
 * so recomputing on every read is deliberate, matching that file's own
 * "small N, not a scan" tolerance.
 */
export async function getStructureHealth(schoolId: string): Promise<StructureHealthDTO> {
  const currentAcademicYear = await findCurrentAcademicYear(schoolId);

  if (!currentAcademicYear) {
    return {
      academicYearId: null,
      academicYearLabel: null,
      academicYearStatus: null,
      hasCurrentAcademicYear: false,
      classes: [],
      sections: [],
      issueCount: 1,
      isHealthy: false,
    };
  }

  const [schoolClasses, allSections] = await Promise.all([
    listSchoolClassesBySchool(schoolId),
    listSectionsBySchoolAndYear(schoolId, currentAcademicYear.id),
  ]);
  const subjectCounts = await countSubjectsByClass(schoolClasses.map((c) => c.id));

  const classes: ClassHealthIssueDTO[] = schoolClasses.map((schoolClass) => {
    const sectionCount = allSections.filter((s) => s.schoolClassId === schoolClass.id).length;
    const subjectCount = subjectCounts.get(schoolClass.id) ?? 0;
    const hasGradeScale = schoolClass.gradeScaleId !== null;
    return {
      schoolClassId: schoolClass.id,
      name: schoolClass.name,
      sectionCount,
      subjectCount,
      hasGradeScale,
      noSections: sectionCount === 0,
      noSubjects: subjectCount === 0,
      noGradeScale: !hasGradeScale,
    };
  });

  const classNameById = new Map(schoolClasses.map((c) => [c.id, c.name]));

  const sections: SectionHealthIssueDTO[] = await Promise.all(
    allSections.map(async (section) => {
      const [classTeacher, subjectAssignments, enrollments] = await Promise.all([
        findClassTeacherForSection(section.id, currentAcademicYear.id),
        listAssignmentsForSection(section.id, currentAcademicYear.id),
        listEnrollmentsBySection(section.id, currentAcademicYear.id),
      ]);
      return {
        sectionId: section.id,
        sectionName: section.name,
        schoolClassId: section.schoolClassId,
        schoolClassName: classNameById.get(section.schoolClassId) ?? "—",
        enrollmentCount: enrollments.length,
        noClassTeacher: !classTeacher,
        noSubjectTeacher: subjectAssignments.length === 0,
        isEmpty: enrollments.length === 0,
      };
    }),
  );

  const issueCount =
    classes.filter((c) => c.noSections || c.noSubjects || c.noGradeScale).length +
    sections.filter((s) => s.noClassTeacher || s.noSubjectTeacher || s.isEmpty).length +
    (currentAcademicYear.status !== "ACTIVE" ? 1 : 0);

  return {
    academicYearId: currentAcademicYear.id,
    academicYearLabel: currentAcademicYear.label,
    academicYearStatus: currentAcademicYear.status,
    hasCurrentAcademicYear: true,
    classes,
    sections,
    issueCount,
    isHealthy: issueCount === 0,
  };
}
