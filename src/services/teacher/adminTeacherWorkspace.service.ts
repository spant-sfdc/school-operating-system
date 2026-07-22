import { findTeacherWithUserById } from "@/repositories/teacher";
import { findCurrentAcademicYear } from "@/repositories/academicYear";
import {
  listAssignmentsForTeacher,
  listAssignmentHistoryForTeacher,
} from "@/repositories/teacherAssignment";
import { listQualificationsForTeacher } from "@/repositories/teacherQualification";
import { listEnrollmentsBySection } from "@/repositories/enrollment";
import { findAttendanceSessionBySectionAndDate } from "@/repositories/attendanceSession";
import { searchAuditEvents, getAuditEvent } from "@/services/audit";
import { pickHighestQualification } from "@/services/teacher/teacherDirectory.dto";
import type {
  AdminTeacherWorkspaceDTO,
  TeacherAssignmentDetailDTO,
  TeacherWorkloadDTO,
  RecentActivityEventDTO,
  TeacherQuickActionDTO,
  TeacherCrossNavigationLinkDTO,
} from "@/services/teacher/adminTeacherWorkspace.dto";

const RECENT_ACTIVITY_PAGE_SIZE = 8;

function toAssignmentDetail(
  assignment: Awaited<ReturnType<typeof listAssignmentHistoryForTeacher>>[number],
  currentAcademicYearId: string,
): TeacherAssignmentDetailDTO {
  return {
    id: assignment.id,
    sectionId: assignment.sectionId,
    academicYearLabel: assignment.academicYear.label,
    schoolClassName: assignment.section.schoolClass.name,
    sectionName: assignment.section.name,
    subjectName: assignment.subject?.name ?? null,
    role: assignment.isClassTeacher ? "Class Teacher" : "Subject Teacher",
    isCurrentYear: assignment.academicYearId === currentAcademicYearId,
    status: assignment.deletedAt === null ? "Active" : "Ended",
  };
}

/**
 * Workload — "Compute only. Never store." (this sprint's own instruction).
 * Recomputed from TeacherAssignment/Enrollment/AttendanceSession on every
 * render, the same read-composition pattern computeSectionStates()
 * (Principal Workspace, D-051) and getTeacherWorkspace()'s own
 * studentsUnderCareCount (Sprint E3) already established — applied here to
 * one teacher, from the Admin's side, not a third independent
 * implementation of "is today's attendance done."
 */
async function computeTeacherWorkload(
  currentAssignments: Awaited<ReturnType<typeof listAssignmentsForTeacher>>,
  academicYearId: string,
): Promise<TeacherWorkloadDTO> {
  const classCount = new Set(currentAssignments.map((a) => a.section.schoolClass.id)).size;
  const sectionCount = new Set(currentAssignments.map((a) => a.sectionId)).size;
  const subjectCount = new Set(
    currentAssignments.filter((a) => a.subjectId).map((a) => a.subjectId),
  ).size;

  const assignedSectionIds = [...new Set(currentAssignments.map((a) => a.sectionId))];
  const studentIdsUnderCare = new Set<string>();
  for (const sectionId of assignedSectionIds) {
    const enrollments = await listEnrollmentsBySection(sectionId, academicYearId);
    for (const enrollment of enrollments) {
      studentIdsUnderCare.add(enrollment.studentId);
    }
  }

  // Only Class Teacher sections carry attendance responsibility (D-049) —
  // a Subject Teacher assignment never contributes to "pending today."
  const classTeacherSectionIds = [
    ...new Set(currentAssignments.filter((a) => a.isClassTeacher).map((a) => a.sectionId)),
  ];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let attendancePendingToday = 0;
  for (const sectionId of classTeacherSectionIds) {
    const [session, enrollments] = await Promise.all([
      findAttendanceSessionBySectionAndDate(sectionId, today),
      listEnrollmentsBySection(sectionId, academicYearId),
    ]);
    const markedCount = session?.records?.length ?? 0;
    const completed = enrollments.length > 0 && markedCount === enrollments.length;
    if (!completed) attendancePendingToday += 1;
  }

  return {
    classCount,
    sectionCount,
    subjectCount,
    studentsUnderCareCount: studentIdsUnderCare.size,
    classTeacherSectionCount: classTeacherSectionIds.length,
    attendancePendingToday,
  };
}

/**
 * Recent Activity — composes searchAuditEvents() (Sprint B4, unchanged)
 * scoped to this teacher's own entity ids (its Teacher id, its User id,
 * and every one of its TeacherAssignment ids, including historical ones)
 * via the additive `entityIds` filter (see D-052). "Password reset" is
 * distinguished from any other "Updated User" event by fetching full
 * detail (getAuditEvent(), also unchanged) only for the bounded handful of
 * User-entityType rows in this one page — not a per-search-result-page
 * cost, a per-teacher-profile-render one, on an already-small result set.
 */
async function buildRecentActivity(
  schoolId: string,
  teacherId: string,
  userId: string,
  assignmentIds: string[],
): Promise<RecentActivityEventDTO[]> {
  const result = await searchAuditEvents({
    schoolId,
    entityIds: [teacherId, userId, ...assignmentIds],
    page: 1,
    pageSize: RECENT_ACTIVITY_PAGE_SIZE,
  });

  return Promise.all(
    result.items.map(async (item): Promise<RecentActivityEventDTO> => {
      if (item.entityType === "TeacherAssignment") {
        return {
          id: item.id,
          timestamp: item.timestamp,
          kind: "assignment-change",
          summary: item.summary,
          actorLabel: item.actorLabel,
        };
      }
      if (item.entityType === "User" && item.entityId === userId) {
        const detail = await getAuditEvent(item.id);
        const afterValue = detail?.afterValue as Record<string, unknown> | null;
        const isPasswordEvent =
          Boolean(afterValue?.passwordReset) || Boolean(afterValue?.passwordChangedBySelf);
        return {
          id: item.id,
          timestamp: item.timestamp,
          kind: isPasswordEvent ? "password-reset" : "audit",
          summary: isPasswordEvent ? "Password reset" : item.summary,
          actorLabel: item.actorLabel,
        };
      }
      return {
        id: item.id,
        timestamp: item.timestamp,
        kind: "audit",
        summary: item.summary,
        actorLabel: item.actorLabel,
      };
    }),
  );
}

function buildQuickActions(
  teacherId: string,
  userId: string,
  status: string,
): TeacherQuickActionDTO[] {
  return [
    { id: "edit", label: "Edit", href: `/admin/teachers/${teacherId}/edit`, enabled: true },
    {
      id: "reset-password",
      label: "Reset Password",
      href: `/admin/users/${userId}/reset-password`,
      enabled: true,
    },
    {
      id: "deactivate",
      label: "Deactivate",
      href: null,
      enabled: status === "ACTIVE",
      reason: status !== "ACTIVE" ? "This teacher is not currently active." : undefined,
    },
    {
      id: "activate",
      label: "Activate",
      href: null,
      enabled: status !== "ACTIVE",
      reason: status === "ACTIVE" ? "This teacher is already active." : undefined,
    },
    {
      id: "leave",
      label: "Leave",
      href: null,
      enabled: false,
      reason: "Leave Management is a planned future capability — see EPIC_ROADMAP.md Epic E.",
    },
    {
      id: "payroll",
      label: "Payroll",
      href: null,
      enabled: false,
      reason: "Payroll is a planned future capability — see EPIC_ROADMAP.md Epic F.",
    },
    {
      id: "performance",
      label: "Performance",
      href: null,
      enabled: false,
      reason:
        "Performance Review is a planned future capability, not yet scoped in EPIC_ROADMAP.md.",
    },
    {
      id: "documents",
      label: "Documents",
      href: null,
      enabled: false,
      reason: "Teacher document records are a planned future capability, not yet scoped.",
    },
  ];
}

function buildCrossNavigation(
  teacherId: string,
  userId: string,
  currentAssignments: TeacherAssignmentDetailDTO[],
): TeacherCrossNavigationLinkDTO[] {
  const links: TeacherCrossNavigationLinkDTO[] = [];

  // "Students" — one real, precisely-scoped link per current SECTION this
  // teacher is assigned to (deduped — a teacher who is both that section's
  // Class Teacher and one of its Subject Teachers, e.g. Meera Joshi in the
  // seed data, has two TeacherAssignment rows for the same section but
  // should only get one "Students" link, not one per assignment), reusing
  // the Student Directory's own existing sectionId filter (Sprint E1)
  // unchanged — not a new page, not an unscoped dump.
  const seenSectionIds = new Set<string>();
  for (const assignment of currentAssignments) {
    if (seenSectionIds.has(assignment.sectionId)) continue;
    seenSectionIds.add(assignment.sectionId);
    links.push({
      id: `students-${assignment.sectionId}`,
      label: `Students — ${assignment.schoolClassName} ${assignment.sectionName}`,
      href: `/admin/students?sectionId=${assignment.sectionId}`,
    });
  }

  // "Attendance" — no dedicated Admin-facing per-teacher/per-section
  // attendance oversight page exists yet (D-049/D-051's own named,
  // still-unbuilt gap, reaffirmed here rather than worked around); this
  // teacher's own live figures are already shown inline in the Workload
  // section above, and this link goes to the one real, existing
  // school-wide view that has any Attendance content at all — the same
  // resolution D-051 already used for its own "Attendance" Quick Action.
  links.push({
    id: "attendance",
    label: "Attendance Overview",
    href: "/admin#attendance-overview",
  });

  links.push({ id: "audit", label: "Audit Trail", href: `/admin/audit?query=${teacherId}` });
  links.push({ id: "user-account", label: "User Account", href: `/admin/users/${userId}` });

  return links;
}

/**
 * Admin Teacher 360 (Sprint E5) — "manage every teacher in the school from
 * one place." A read-composition service, exactly like every prior Epic E
 * workspace: composes findTeacherWithUserById() (this sprint's own new
 * repository read), listAssignmentsForTeacher()/
 * listAssignmentHistoryForTeacher() (teacherAssignment.repository.ts),
 * listQualificationsForTeacher() (teacherQualification.repository.ts,
 * Sprint 4, unchanged), and searchAuditEvents() (Sprint B4, unchanged) —
 * zero new database tables. Distinct from getTeacherWorkspace() (Sprint
 * E3's own self-service "Teacher 360"): that one composes Attendance Home/
 * History for the teacher's own session; this one shows every year's
 * assignment history, computed Workload, and Account/Activity — an
 * Admin-facing superset with a genuinely different audience and shape, not
 * a duplicate (see D-052's own "Is Teacher 360 reusable?" answer).
 */
export async function getAdminTeacherWorkspace(
  teacherId: string,
  schoolId: string,
): Promise<AdminTeacherWorkspaceDTO | null> {
  const teacher = await findTeacherWithUserById(teacherId);
  if (!teacher || teacher.schoolId !== schoolId) return null;

  const currentAcademicYear = await findCurrentAcademicYear(schoolId);

  const [assignmentHistory, qualifications] = await Promise.all([
    listAssignmentHistoryForTeacher(teacherId),
    listQualificationsForTeacher(teacherId),
  ]);

  const currentAssignmentsRaw = currentAcademicYear
    ? await listAssignmentsForTeacher(teacherId, currentAcademicYear.id)
    : [];

  const currentAssignments = assignmentHistory
    .filter(
      (a) =>
        currentAcademicYear && a.academicYearId === currentAcademicYear.id && a.deletedAt === null,
    )
    .map((a) => toAssignmentDetail(a, currentAcademicYear?.id ?? ""));
  const historicalAssignments = assignmentHistory
    .filter(
      (a) =>
        !(
          currentAcademicYear &&
          a.academicYearId === currentAcademicYear.id &&
          a.deletedAt === null
        ),
    )
    .map((a) => toAssignmentDetail(a, currentAcademicYear?.id ?? ""));

  const workload = currentAcademicYear
    ? await computeTeacherWorkload(currentAssignmentsRaw, currentAcademicYear.id)
    : {
        classCount: 0,
        sectionCount: 0,
        subjectCount: 0,
        studentsUnderCareCount: 0,
        classTeacherSectionCount: 0,
        attendancePendingToday: 0,
      };

  const recentActivity = await buildRecentActivity(
    schoolId,
    teacherId,
    teacher.userId,
    assignmentHistory.map((a) => a.id),
  );

  return {
    teacherId: teacher.id,
    teacherIdLabel: teacher.id,
    fullName: `${teacher.firstName} ${teacher.lastName}`,
    email: teacher.user.email,
    phone: teacher.phone,
    status: teacher.status,
    academicYearLabel: currentAcademicYear?.label ?? "—",
    currentAssignments,
    historicalAssignments,
    qualifications: qualifications.map((q) => ({
      id: q.id,
      qualificationType: q.qualificationType,
      institution: q.institution,
      yearCompleted: q.yearCompleted,
    })),
    highestQualification: pickHighestQualification(qualifications),
    account: {
      userId: teacher.user.id,
      email: teacher.user.email,
      roleName: teacher.user.role.name,
      isActive: teacher.user.deactivatedAt === null,
      mustChangePassword: teacher.user.mustChangePassword,
      createdAt: teacher.user.createdAt.toISOString(),
      lastLogin: {
        available: false,
        reason: "Login timestamps are not tracked yet — a planned future capability.",
      },
    },
    workload,
    recentActivity,
    quickActions: buildQuickActions(teacher.id, teacher.user.id, teacher.status),
    crossNavigation: buildCrossNavigation(teacher.id, teacher.user.id, currentAssignments),
  };
}
