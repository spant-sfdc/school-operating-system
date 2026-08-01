export interface SchoolOverviewDTO {
  schoolName: string;
  academicYearLabel: string;
  todayDate: string;
  configuredStatus: "Configured" | "Needs Attention";
  systemReady: boolean;
}

export interface AttendanceOverviewDTO {
  completedSections: number;
  pendingSections: number;
  totalSections: number;
  totalStudentsMarked: number;
  totalEnrollments: number;
  attendancePercent: number;
}

export interface TeacherOverviewDTO {
  totalTeachers: number;
  totalAssignments: number;
  attendanceCompletedCount: number;
  attendancePendingCount: number;
}

export interface StudentOverviewDTO {
  totalStudents: number;
  currentEnrollments: number;
  recentlyAdded: { id: string; fullName: string; admissionNumber: string }[];
  inactiveStudents: number;
}

// Sprint E9 — a school-wide roll-up over the new Result Review Dashboard
// (resultReviewDashboard.service.ts), not a reimplementation of it: sums
// each examination's own already-computed counts so Principal 360 can
// answer "does anything need my attention today" for Results the same
// way it already does for Attendance, without the Principal opening
// /admin/examinations first.
export interface ResultsOverviewDTO {
  awaitingReviewCount: number;
  returnedCount: number;
  readyToPublishCount: number;
  publishedCount: number;
  totalActiveExaminations: number;
}

export type AlertSeverity = "error" | "warning" | "info";

export interface OperationalAlertDTO {
  id: string;
  severity: AlertSeverity;
  message: string;
}

// Recent Activity — a placeholder, not an implementation, matching the
// identical WorkspacePlaceholderDTO shape Student Workspace (E1) and
// Teacher Workspace (E3) already established for the same reason: no
// Timeline capability exists yet (docs/domain/EVENT_MODEL.md names the
// vocabulary, nothing implements it).
export interface WorkspacePlaceholderDTO {
  available: false;
  reason: string;
}

export interface PrincipalQuickActionDTO {
  id: string;
  label: string;
  href: string;
}

export interface PrincipalWorkspaceDTO {
  schoolOverview: SchoolOverviewDTO;
  attendanceOverview: AttendanceOverviewDTO;
  teacherOverview: TeacherOverviewDTO;
  studentOverview: StudentOverviewDTO;
  resultsOverview: ResultsOverviewDTO;
  alerts: OperationalAlertDTO[];
  quickActions: PrincipalQuickActionDTO[];
  recentActivity: WorkspacePlaceholderDTO;
}

export function deriveConfiguredStatus(
  needsAttentionCount: number,
): SchoolOverviewDTO["configuredStatus"] {
  return needsAttentionCount > 0 ? "Needs Attention" : "Configured";
}
