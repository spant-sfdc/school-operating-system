import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { listAssignmentsForTeacher } from "@/repositories/teacherAssignment";
import { searchAttendanceSessions } from "@/repositories/attendanceSession";
import { countAttendanceBySession } from "@/repositories/attendanceRecord";
import { findUsersByIds } from "@/repositories/user";
import type {
  AttendanceHistoryResultDTO,
  AttendanceHistoryRowDTO,
} from "@/services/attendance/attendanceHistory.dto";

export interface AttendanceHistoryFilters {
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
}

/**
 * Attendance History — scoped to the caller's own Class Teacher
 * section(s), per PERMISSION_MATRIX.md § 5's "Teacher: assigned sections
 * only." Reuses searchAttendanceSessions() (Sprint E2's own new repository
 * function, not a duplicate of anything existing) and
 * countAttendanceBySession() (mirrors Sprint E1's
 * countAttendanceByEnrollment()) — a per-row aggregate call is acceptable
 * at this list's own page size (20 rows), the same reasoning
 * DATABASE_REVIEW.md already applies elsewhere to small, bounded batches.
 * Teacher names resolved in one batched call (findUsersByIds()), not N+1,
 * mirroring the Audit Log Viewer's own established actor-resolution
 * pattern (Sprint B4).
 */
export async function searchAttendanceHistory(
  teacherId: string,
  schoolId: string,
  filters: AttendanceHistoryFilters,
): Promise<AttendanceHistoryResultDTO> {
  const currentAcademicYear = await findCurrentAcademicYear(schoolId);
  if (!currentAcademicYear) {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  }

  const assignments = await listAssignmentsForTeacher(teacherId, currentAcademicYear.id);
  const sectionIds = assignments.filter((a) => a.isClassTeacher).map((a) => a.sectionId);

  const result = await searchAttendanceSessions({
    sectionIds,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    page: filters.page,
  });

  const teacherUserIds = [...new Set(result.items.map((s) => s.markedByUserId))];
  const teacherUsers = await findUsersByIds(teacherUserIds);
  const teacherNameByUserId = new Map(teacherUsers.map((u) => [u.id, u.name ?? u.email]));

  const items: AttendanceHistoryRowDTO[] = await Promise.all(
    result.items.map(async (session) => {
      const counts = await countAttendanceBySession(session.id);
      return {
        sessionId: session.id,
        date: session.date.toISOString(),
        schoolClassName: session.section.schoolClass.name,
        sectionName: session.section.name,
        teacherName: teacherNameByUserId.get(session.markedByUserId) ?? "—",
        presentCount: counts.PRESENT,
        absentCount: counts.ABSENT,
        halfDayCount: counts.HALF_DAY,
        leaveCount: counts.LEAVE,
      };
    }),
  );

  return { items, total: result.total, page: result.page, pageSize: result.pageSize };
}
