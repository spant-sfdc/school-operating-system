import type { AttendanceHomeDTO } from "@/services/attendance/attendanceDashboard.dto";
import type { StudentDirectoryRowDTO } from "@/services/student/studentDirectory.dto";

export interface TeacherAssignmentRowDTO {
  sectionId: string;
  academicYearLabel: string;
  schoolClassName: string;
  sectionName: string;
  subjectName: string | null;
  role: "Class Teacher" | "Subject Teacher";
  // TeacherAssignment carries no field beyond deletedAt for lifecycle —
  // every row returned here is already active-only (the repository query
  // already filters `deletedAt: null`); shown for the task's own named
  // "Status" column rather than silently omitted, not because a second,
  // richer status concept exists on this entity today.
  status: "Active";
}

export interface LastAttendanceTakenDTO {
  date: string;
  schoolClassName: string;
  sectionName: string;
}

// A capability this Workspace deliberately doesn't implement yet — see
// src/services/student/studentWorkspace.dto.ts's own identical
// WorkspacePlaceholderDTO precedent (Sprint E1). Recent Activity has no
// Timeline to project from yet (docs/domain/EVENT_MODEL.md names the
// vocabulary; nothing implements it), per this sprint's own "Placeholder
// only. No Timeline implementation" instruction.
export interface WorkspacePlaceholderDTO {
  available: false;
  reason: string;
}

export interface TeacherQuickActionDTO {
  id: string;
  label: string;
  href: string | null;
  enabled: boolean;
  reason?: string;
}

export interface TeacherWorkspaceDTO {
  teacherId: string;
  fullName: string;
  roleName: string;
  academicYearLabel: string;
  classTeacherAssignments: TeacherAssignmentRowDTO[];
  subjectAssignments: TeacherAssignmentRowDTO[];
  studentsUnderCareCount: number;
  attendanceHome: AttendanceHomeDTO;
  lastAttendanceTaken: LastAttendanceTakenDTO | null;
  studentQuickAccess: StudentDirectoryRowDTO[];
  recentActivity: WorkspacePlaceholderDTO;
  quickActions: TeacherQuickActionDTO[];
}
