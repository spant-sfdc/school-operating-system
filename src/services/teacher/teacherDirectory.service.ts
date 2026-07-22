import { searchTeachers, type TeacherSearchFilters } from "@/repositories/teacher";
import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { teacherSearchInputSchema, type TeacherSearchInput } from "@/lib/validations/teacher";
import {
  toTeacherDirectoryRowDTO,
  type TeacherDirectoryResultDTO,
} from "@/services/teacher/teacherDirectory.dto";

/**
 * Teacher Directory (Sprint E5) — "find a teacher quickly," this sprint's
 * own Business Workflow Review's first requirement. A read-composition
 * service, exactly like Student Directory (Sprint E1): reuses
 * searchTeachers() (teacher.repository.ts) and findCurrentAcademicYear()
 * (academicYear.repository.ts, unchanged) — not a new table.
 * `academicYearId` always resolves to a real value before reaching the
 * repository, defaulting to "this year," matching
 * searchStudentDirectory()'s own precedent exactly.
 */
export async function searchTeacherDirectory(
  schoolId: string,
  input: TeacherSearchInput,
): Promise<TeacherDirectoryResultDTO> {
  const validated = teacherSearchInputSchema.parse(input);

  const academicYearId =
    validated.academicYearId ?? (await findCurrentAcademicYear(schoolId))?.id ?? null;

  if (!academicYearId) {
    // No academic year configured yet — a genuinely empty result, not an
    // error, matching searchStudentDirectory()'s own handling.
    return { items: [], total: 0, page: 1, pageSize: 20, academicYearId: "" };
  }

  const filters: TeacherSearchFilters = {
    schoolId,
    query: validated.query,
    status: validated.status,
    classTeacherOnly: validated.classTeacherOnly,
    subjectTeacherOnly: validated.subjectTeacherOnly,
    qualificationType: validated.qualificationType,
    schoolClassId: validated.schoolClassId,
    sectionId: validated.sectionId,
    academicYearId,
    sortBy: validated.sortBy,
    sortDir: validated.sortDir,
    page: validated.page,
  };

  const result = await searchTeachers(filters);

  return {
    items: result.items.map(toTeacherDirectoryRowDTO),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    academicYearId,
  };
}
