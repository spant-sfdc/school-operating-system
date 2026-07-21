import { searchStudents, type StudentSearchFilters } from "@/repositories/student";
import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { studentSearchInputSchema, type StudentSearchInput } from "@/lib/validations/student";
import {
  toStudentDirectoryRowDTO,
  type StudentDirectoryResultDTO,
} from "@/services/student/studentDirectory.dto";

/**
 * Student Directory — Sprint E1's own "understand everything about one
 * student in under 30 seconds" workflow starts with finding them fast.
 * A read-composition service, not a new table: reuses
 * searchStudents() (student.repository.ts) and
 * findCurrentAcademicYear() (academicYear.repository.ts) unchanged.
 * `academicYearId` always resolves to a real value before reaching the
 * repository — an unfiltered search still needs to know which year's
 * class/section to display per row, defaulting to "this year."
 */
export async function searchStudentDirectory(
  schoolId: string,
  input: StudentSearchInput,
): Promise<StudentDirectoryResultDTO> {
  const validated = studentSearchInputSchema.parse(input);

  const academicYearId =
    validated.academicYearId ?? (await findCurrentAcademicYear(schoolId))?.id ?? null;

  if (!academicYearId) {
    // No academic year configured yet — a genuinely empty result, not an
    // error; the Directory page renders this as "no academic year
    // configured" rather than crashing.
    return { items: [], total: 0, page: 1, pageSize: 20, academicYearId: "" };
  }

  const filters: StudentSearchFilters = {
    schoolId,
    query: validated.query,
    status: validated.status,
    schoolClassId: validated.schoolClassId,
    sectionId: validated.sectionId,
    academicYearId,
    sortBy: validated.sortBy,
    sortDir: validated.sortDir,
    page: validated.page,
  };

  const result = await searchStudents(filters);

  return {
    items: result.items.map(toStudentDirectoryRowDTO),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    academicYearId,
  };
}
