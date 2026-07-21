import { findUserById } from "@/repositories/user";
import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { listAssignmentsForTeacher } from "@/repositories/teacherAssignment";
import { listEnrollmentsBySection } from "@/repositories/enrollment";
import { getAttendanceHome } from "@/services/attendance/attendanceDashboard.service";
import { searchAttendanceHistory } from "@/services/attendance/attendanceHistory.service";
import { searchStudentDirectory } from "@/services/student/studentDirectory.service";
import type {
  TeacherWorkspaceDTO,
  TeacherAssignmentRowDTO,
  TeacherQuickActionDTO,
} from "@/services/teacher/teacherWorkspace.dto";

const STUDENT_QUICK_ACCESS_PAGE_SIZE = 5;

function toAssignmentRow(
  assignment: Awaited<ReturnType<typeof listAssignmentsForTeacher>>[number],
): TeacherAssignmentRowDTO {
  return {
    sectionId: assignment.sectionId,
    academicYearLabel: assignment.academicYear.label,
    schoolClassName: assignment.section.schoolClass.name,
    sectionName: assignment.section.name,
    subjectName: assignment.subject?.name ?? null,
    role: assignment.isClassTeacher ? "Class Teacher" : "Subject Teacher",
    status: "Active",
  };
}

function buildQuickActions(quickResumeSectionId: string | null): TeacherQuickActionDTO[] {
  return [
    {
      id: "take-attendance",
      label: quickResumeSectionId ? "Take / Resume Attendance" : "Take Attendance",
      href: quickResumeSectionId
        ? `/teacher/attendance/${quickResumeSectionId}`
        : "/teacher/attendance",
      enabled: true,
    },
    {
      id: "view-students",
      label: "View Students",
      href: "/teacher/students",
      enabled: true,
    },
    {
      id: "attendance-history",
      label: "Attendance History",
      href: "/teacher/attendance/history",
      enabled: true,
    },
    {
      id: "enter-marks",
      label: "Enter Marks",
      href: null,
      enabled: false,
      reason:
        "Examination/Marks Entry is a planned future capability — see EPIC_ROADMAP.md Epic E.",
    },
    {
      id: "generate-reports",
      label: "Generate Reports",
      href: null,
      enabled: false,
      reason: "Reporting is a planned future capability — see EPIC_ROADMAP.md Epic G.",
    },
  ];
}

/**
 * Teacher Workspace ("Teacher 360") — Sprint E3's own "a teacher logs in
 * at 8:00 AM, what should they see in under 30 seconds" Business Workflow
 * Review. A read-composition service, exactly like Student Workspace
 * (Sprint E1) and Attendance Dashboard (Sprint E2) before it: no new
 * database table, composes existing repositories/services unchanged —
 * getAttendanceHome() and searchAttendanceHistory() (Sprint E2) are
 * reused directly, not reimplemented, for the Attendance Summary section;
 * searchStudentDirectory() (Sprint E1) is reused, scoped, for Student
 * Quick Access — "Do NOT duplicate Student Workspace."
 */
export async function getTeacherWorkspace(
  teacherId: string,
  userId: string,
  schoolId: string,
): Promise<TeacherWorkspaceDTO | null> {
  const user = await findUserById(userId);
  if (!user) return null;

  const currentAcademicYear = await findCurrentAcademicYear(schoolId);
  if (!currentAcademicYear) return null;

  const assignments = await listAssignmentsForTeacher(teacherId, currentAcademicYear.id);
  const classTeacherAssignments = assignments.filter((a) => a.isClassTeacher).map(toAssignmentRow);
  const subjectAssignments = assignments.filter((a) => !a.isClassTeacher).map(toAssignmentRow);

  // "Students under care" — every distinct student across every section
  // this teacher is assigned to (class-teacher OR subject), broader than
  // Attendance's own class-teacher-only scope (D-049) — a subject teacher
  // legitimately needs to see their students without taking attendance
  // for them. Small N in practice (a teacher holds a handful of
  // assignments), so a loop here is not the N+1 concern it would be at
  // Admin-oversight scale.
  const assignedSectionIds = [...new Set(assignments.map((a) => a.sectionId))];
  const studentIdsUnderCare = new Set<string>();
  for (const sectionId of assignedSectionIds) {
    const enrollments = await listEnrollmentsBySection(sectionId, currentAcademicYear.id);
    for (const enrollment of enrollments) {
      studentIdsUnderCare.add(enrollment.studentId);
    }
  }

  const [attendanceHome, history, studentDirectoryResult] = await Promise.all([
    getAttendanceHome(teacherId, schoolId),
    searchAttendanceHistory(teacherId, schoolId, {}),
    assignedSectionIds.length > 0
      ? searchStudentDirectory(
          schoolId,
          { academicYearId: currentAcademicYear.id },
          assignedSectionIds,
        )
      : Promise.resolve({
          items: [],
          total: 0,
          page: 1,
          pageSize: 20,
          academicYearId: currentAcademicYear.id,
        }),
  ]);
  // Dashboard shows a short preview; the full, paginated list lives at
  // /teacher/students (this sprint's own "View Students" Quick Action),
  // which calls searchStudentDirectory() directly for the complete set.
  const studentQuickAccess = studentDirectoryResult.items.slice(0, STUDENT_QUICK_ACCESS_PAGE_SIZE);

  const lastSession = history.items[0] ?? null;

  return {
    teacherId,
    fullName: user.name ?? user.email,
    roleName: user.role.name,
    academicYearLabel: currentAcademicYear.label,
    classTeacherAssignments,
    subjectAssignments,
    studentsUnderCareCount: studentIdsUnderCare.size,
    attendanceHome,
    lastAttendanceTaken: lastSession
      ? {
          date: lastSession.date,
          schoolClassName: lastSession.schoolClassName,
          sectionName: lastSession.sectionName,
        }
      : null,
    studentQuickAccess,
    recentActivity: {
      available: false,
      reason: "Timeline is a planned future capability — see docs/domain/EVENT_MODEL.md.",
    },
    quickActions: buildQuickActions(attendanceHome.quickResumeSectionId),
  };
}
