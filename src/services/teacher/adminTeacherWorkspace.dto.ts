export interface TeacherAssignmentDetailDTO {
  id: string;
  sectionId: string;
  academicYearLabel: string;
  schoolClassName: string;
  sectionName: string;
  subjectName: string | null;
  role: "Class Teacher" | "Subject Teacher";
  isCurrentYear: boolean;
  // TeacherAssignment's own deletedAt, surfaced honestly rather than
  // collapsed into a single boolean — an ended assignment in the CURRENT
  // year (reassigned mid-year) reads differently from one that simply
  // belongs to a past year.
  status: "Active" | "Ended";
}

export interface TeacherQualificationRowDTO {
  id: string;
  qualificationType: string;
  institution: string | null;
  yearCompleted: number | null;
}

// "Experience (if modeled)" — not modeled (no dateOfJoining/
// yearsOfExperience field exists on Teacher), so this field is simply
// absent from the DTO rather than fabricated. Named in D-052's own
// Certification answer, not silently dropped.

export interface TeacherWorkloadDTO {
  classCount: number;
  sectionCount: number;
  subjectCount: number;
  studentsUnderCareCount: number;
  // Denominator: how many sections this teacher is Class Teacher for this
  // year — only Class Teacher sections carry attendance responsibility
  // (D-049's own Class-Teacher-only scoping), so a Subject Teacher with no
  // Class Teacher assignment correctly shows 0/0, not a misleading "N/A".
  classTeacherSectionCount: number;
  attendancePendingToday: number;
}

// Compute-only — never stored, per this sprint's own "Workload: Compute
// only. Never store." instruction. Recomputed on every Teacher 360 render
// from TeacherAssignment/Enrollment/AttendanceSession, the same
// already-established pattern computeSectionStates() (Principal Workspace,
// D-051) and getTeacherWorkspace()'s own studentsUnderCareCount (Sprint
// E3) already use — applied here to one teacher, from the Admin's side.

export type RecentActivityEventKind = "audit" | "assignment-change" | "password-reset";

export interface RecentActivityEventDTO {
  id: string;
  timestamp: string;
  kind: RecentActivityEventKind;
  summary: string;
  actorLabel: string;
}

export interface TeacherAccountDTO {
  userId: string;
  email: string;
  roleName: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  // Not modeled — no lastLoginAt field exists on User anywhere in this
  // codebase (confirmed by schema grep). An honest placeholder, the same
  // WorkspacePlaceholderDTO shape every prior Epic E workspace already
  // uses for an unbuilt capability, not a fabricated date.
  lastLogin: { available: false; reason: string };
}

export interface TeacherQuickActionDTO {
  id: string;
  label: string;
  href: string | null;
  enabled: boolean;
  reason?: string;
}

export interface TeacherCrossNavigationLinkDTO {
  id: string;
  label: string;
  href: string;
}

export interface AdminTeacherWorkspaceDTO {
  teacherId: string;
  // No distinct employeeId column exists on Teacher (see D-052) — this
  // sprint's own "Employee ID" search/display requirement is served by
  // the Teacher's own internal record id, labeled honestly in the UI as
  // "Teacher ID" rather than implying a real HR-assigned code that
  // doesn't exist.
  teacherIdLabel: string;
  fullName: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "ON_LEAVE" | "EXITED";
  academicYearLabel: string;
  currentAssignments: TeacherAssignmentDetailDTO[];
  historicalAssignments: TeacherAssignmentDetailDTO[];
  qualifications: TeacherQualificationRowDTO[];
  highestQualification: string | null;
  account: TeacherAccountDTO;
  workload: TeacherWorkloadDTO;
  recentActivity: RecentActivityEventDTO[];
  quickActions: TeacherQuickActionDTO[];
  crossNavigation: TeacherCrossNavigationLinkDTO[];
}
