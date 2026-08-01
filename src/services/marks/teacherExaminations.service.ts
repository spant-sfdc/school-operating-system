import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { listAssignmentsForTeacher } from "@/repositories/teacherAssignment";
import { listEnrollmentsBySection } from "@/repositories/enrollment";
import { listMarksRecordsForScheduleAndSection } from "@/repositories/marksRecord";
import {
  listExaminationsBySchool,
  listSubjectSchedulesForExamination,
} from "@/services/examination";
import {
  deriveExaminationRowState,
  type TeacherExaminationsHomeDTO,
  type TeacherExaminationRowDTO,
} from "@/services/marks/teacherExaminations.dto";

/**
 * "My Examinations" — Teacher Dashboard's own entry point into Marks Entry
 * (this sprint's own workflow: Teacher Dashboard -> My Examinations ->
 * Select Examination -> Select Subject -> Grid). Collapses "Select
 * Examination" and "Select Subject" into one flat, pre-filtered list —
 * the same design choice Attendance Home already made for "select
 * section" (src/services/attendance/attendanceDashboard.service.ts):
 * a teacher's own TeacherAssignment set is already the effective filter,
 * so a multi-step picker over an already-narrow list adds clicks without
 * adding clarity. Each row is one (Examination, Subject, Section) the
 * teacher may enter marks for, already permission-scoped —
 * "Teacher sees ONLY examinations where TeacherAssignment authorizes
 * them," this sprint's own explicit requirement.
 *
 * Only `subjectId !== null` assignments count — a pure Class Teacher
 * designation (no subject) carries no marks-entry authority on its own,
 * per PERMISSION_MATRIX.md § 6's own "assigned subjects/sections only"
 * scoping (broader than Attendance's Class-Teacher-only rule, narrower
 * than "any assignment at all").
 *
 * Composed entirely from already-existing, unmodified reads
 * (listAssignmentsForTeacher(), listExaminationsBySchool(),
 * listSubjectSchedulesForExamination(), listMarksRecordsForScheduleAndSection(),
 * listEnrollmentsBySection()) — small N in practice (a handful of active
 * examinations × a teacher's own handful of subject assignments), the
 * same "small N" reasoning teacherWorkspace.service.ts's own per-section
 * loop already established (Sprint E3).
 */
export async function getTeacherExaminationsHome(
  teacherId: string,
  schoolId: string,
): Promise<TeacherExaminationsHomeDTO> {
  const currentAcademicYear = await findCurrentAcademicYear(schoolId);
  if (!currentAcademicYear) {
    return { academicYearLabel: "—", rows: [], quickResume: null };
  }

  const assignments = await listAssignmentsForTeacher(teacherId, currentAcademicYear.id);
  const subjectAssignments = assignments.filter((a) => a.subjectId !== null);

  const activeExaminations = await listExaminationsBySchool(schoolId, {
    academicYearId: currentAcademicYear.id,
    status: "ACTIVE",
  });

  const rows: TeacherExaminationRowDTO[] = [];

  for (const examination of activeExaminations) {
    const relevantAssignments = subjectAssignments.filter(
      (a) => a.section.schoolClassId === examination.schoolClassId,
    );
    if (relevantAssignments.length === 0) continue;

    const schedules = await listSubjectSchedulesForExamination(examination.id);

    for (const assignment of relevantAssignments) {
      const schedule = schedules.find((s) => s.subjectId === assignment.subjectId);
      if (!schedule) continue;

      const [enrollments, records] = await Promise.all([
        listEnrollmentsBySection(assignment.sectionId, currentAcademicYear.id),
        listMarksRecordsForScheduleAndSection(schedule.id, assignment.sectionId),
      ]);

      const enteredCount = records.length;
      const submittedCount = records.filter((r) => r.status === "SUBMITTED").length;

      rows.push({
        examinationId: examination.id,
        examinationName: examination.name,
        schoolClassName: examination.schoolClassName,
        examSubjectScheduleId: schedule.id,
        subjectName: schedule.subjectName,
        sectionId: assignment.sectionId,
        sectionName: assignment.section.name,
        maxMarks: schedule.maxMarks,
        totalStudents: enrollments.length,
        enteredCount,
        submittedCount,
        state: deriveExaminationRowState(submittedCount, enteredCount, enrollments.length),
      });
    }
  }

  const quickResumeRow = rows.find((r) => r.state !== "COMPLETED") ?? null;

  return {
    academicYearLabel: currentAcademicYear.label,
    rows,
    quickResume: quickResumeRow
      ? {
          examSubjectScheduleId: quickResumeRow.examSubjectScheduleId,
          sectionId: quickResumeRow.sectionId,
        }
      : null,
  };
}
