import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { listAssignmentsForTeacher } from "@/repositories/teacherAssignment";
import { findAttendanceSessionBySectionAndDate } from "@/repositories/attendanceSession";
import { listEnrollmentsBySection } from "@/repositories/enrollment";
import type {
  AttendanceHomeDTO,
  AttendanceHomeSectionDTO,
} from "@/services/attendance/attendanceDashboard.dto";

/**
 * Attendance Home — "every morning, a teacher opens the system and needs
 * to mark attendance for today's class in under 2 minutes" (Sprint E2's
 * own Business Workflow Review). One query to find which sections this
 * teacher is Class Teacher for this year (listAssignmentsForTeacher(),
 * unchanged, filtered here to isClassTeacher — no new repository query),
 * then today's session state per section. A teacher is realistically
 * Class Teacher of 0 or 1 sections, so a per-section loop here is not the
 * N+1 concern it would be at Admin-oversight scale (out of this sprint's
 * scope entirely — see DECISIONS.md's Sprint E2 entry).
 */
export async function getAttendanceHome(
  teacherId: string,
  schoolId: string,
): Promise<AttendanceHomeDTO> {
  const currentAcademicYear = await findCurrentAcademicYear(schoolId);
  if (!currentAcademicYear) {
    return {
      academicYearLabel: "—",
      date: new Date().toISOString(),
      sections: [],
      quickResumeSectionId: null,
    };
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const assignments = await listAssignmentsForTeacher(teacherId, currentAcademicYear.id);
  const classTeacherAssignments = assignments.filter((a) => a.isClassTeacher);

  const sections: AttendanceHomeSectionDTO[] = [];
  for (const assignment of classTeacherAssignments) {
    const [session, enrollments] = await Promise.all([
      findAttendanceSessionBySectionAndDate(assignment.sectionId, today),
      listEnrollmentsBySection(assignment.sectionId, currentAcademicYear.id),
    ]);

    const markedCount = session?.records?.length ?? 0;
    const totalStudents = enrollments.length;
    sections.push({
      sectionId: assignment.sectionId,
      schoolClassName: assignment.section.schoolClass.name,
      sectionName: assignment.section.name,
      state:
        markedCount === 0 ? "NOT_STARTED" : markedCount < totalStudents ? "PENDING" : "COMPLETED",
      markedCount,
      totalStudents,
    });
  }

  const quickResumeSection =
    sections.find((s) => s.state === "NOT_STARTED") ??
    sections.find((s) => s.state === "PENDING") ??
    sections[0] ??
    null;

  return {
    academicYearLabel: currentAcademicYear.label,
    date: today.toISOString(),
    sections,
    quickResumeSectionId: quickResumeSection?.sectionId ?? null,
  };
}
