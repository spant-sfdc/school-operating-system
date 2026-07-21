import type { AttendanceStatus } from "@/generated/prisma/enums";
import type { AttendanceSessionDTO } from "@/services/attendance/dto/attendanceSession.dto";

export interface AttendanceGridRowDTO {
  enrollmentId: string;
  studentId: string;
  fullName: string;
  admissionNumber: string;
  rollNumber: string;
  guardianSummary: string;
  currentStatus: AttendanceStatus | null;
}

export interface SessionAttendanceSummaryDTO {
  totalStudents: number;
  markedCount: number;
  presentCount: number;
  absentCount: number;
  halfDayCount: number;
  leaveCount: number;
  presentPercent: number;
  absentPercent: number;
}

export interface AttendanceSessionWorkspaceDTO {
  session: AttendanceSessionDTO;
  schoolClassName: string;
  sectionName: string;
  academicYearLabel: string;
  date: string;
  rows: AttendanceGridRowDTO[];
  summary: SessionAttendanceSummaryDTO;
  // Derived, not a stored column — see this file's own comment on why, and
  // src/lib/authorization/permissions.ts's canOverrideAttendanceLock() for
  // the extension point this feeds.
  locked: boolean;
}

export function buildSessionAttendanceSummary(
  totalStudents: number,
  counts: Record<AttendanceStatus, number>,
): SessionAttendanceSummaryDTO {
  const markedCount = counts.PRESENT + counts.ABSENT + counts.HALF_DAY + counts.LEAVE;
  return {
    totalStudents,
    markedCount,
    presentCount: counts.PRESENT,
    absentCount: counts.ABSENT,
    halfDayCount: counts.HALF_DAY,
    leaveCount: counts.LEAVE,
    presentPercent: markedCount === 0 ? 0 : Math.round((counts.PRESENT / markedCount) * 1000) / 10,
    absentPercent: markedCount === 0 ? 0 : Math.round((counts.ABSENT / markedCount) * 1000) / 10,
  };
}
