import type { AttendanceStatus, RelationshipType } from "@/generated/prisma/enums";
import type { StudentDTO } from "@/services/student/student.dto";
import type { EnrollmentDTO } from "@/services/student/enrollment.dto";
import type { GuardianDTO } from "@/services/student/guardian.dto";

export interface StudentGuardianSummaryDTO {
  guardian: GuardianDTO;
  relationshipType: RelationshipType;
  isPrimaryContact: boolean;
  isAuthorizedForPickup: boolean;
}

export interface AttendanceSummaryDTO {
  available: true;
  academicYearId: string;
  totalMarked: number;
  presentCount: number;
  absentCount: number;
  halfDayCount: number;
  leaveCount: number;
  attendancePercent: number;
}

// A capability this Workspace deliberately doesn't implement yet
// (Academic Snapshot, Documents, Recent Activity — see Sprint E1's own
// "DO NOT IMPLEMENT" instruction) — an honest, typed empty state rather
// than fabricated data or a silently-omitted field, so the Profile page
// can render a real "not available yet, here's why" message and a future
// sprint has a stable shape to extend into `available: true` once
// Examination/DocumentRecord/Timeline actually exist.
export interface WorkspacePlaceholderDTO {
  available: false;
  reason: string;
}

export interface QuickActionDTO {
  id: string;
  label: string;
  href: string | null;
  enabled: boolean;
  reason?: string;
}

export interface StudentWorkspaceDTO {
  student: StudentDTO;
  currentEnrollment: EnrollmentDTO | null;
  guardians: StudentGuardianSummaryDTO[];
  attendanceSummary: AttendanceSummaryDTO | WorkspacePlaceholderDTO;
  academicSnapshot: WorkspacePlaceholderDTO;
  recentActivity: WorkspacePlaceholderDTO;
  documents: WorkspacePlaceholderDTO;
  quickActions: QuickActionDTO[];
}

// The commonly-cited default per docs/domain/BUSINESS_RULES.md § 4
// ("HALF_DAY counts as configurable (commonly 0.5)") — this platform has
// no School-level configuration field for that weight yet, so this is the
// documented default applied literally, not a school-configurable value
// being silently ignored.
const HALF_DAY_WEIGHT = 0.5;

export function buildAttendanceSummary(
  academicYearId: string,
  counts: Record<AttendanceStatus, number>,
): AttendanceSummaryDTO | WorkspacePlaceholderDTO {
  const totalMarked = counts.PRESENT + counts.ABSENT + counts.HALF_DAY + counts.LEAVE;
  if (totalMarked === 0) {
    return { available: false, reason: "No attendance has been recorded for this student yet." };
  }
  const weightedPresent = counts.PRESENT + counts.HALF_DAY * HALF_DAY_WEIGHT;
  return {
    available: true,
    academicYearId,
    totalMarked,
    presentCount: counts.PRESENT,
    absentCount: counts.ABSENT,
    halfDayCount: counts.HALF_DAY,
    leaveCount: counts.LEAVE,
    attendancePercent: Math.round((weightedPresent / totalMarked) * 1000) / 10,
  };
}
