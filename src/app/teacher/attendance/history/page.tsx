import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canViewAttendanceHistory } from "@/lib/authorization";
import { findTeacherByUserId } from "@/repositories/teacher";
import { searchAttendanceHistory } from "@/services/attendance/attendanceHistory.service";

// Attendance History — a read-only list of previously submitted sessions
// for the teacher's own Class Teacher section(s). No editing here, per
// this sprint's own "DO NOT implement editing after lock" instruction —
// this page exists to look back, not to correct.
export default async function AttendanceHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requirePermission(canViewAttendanceHistory);
  const params = await searchParams;

  const teacher = await findTeacherByUserId(session.userId);
  if (!teacher) {
    notFound();
  }

  const result = await searchAttendanceHistory(teacher.id, session.schoolId, {
    page: params.page ? Number(params.page) : undefined,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-2">
        <Link href="/teacher/attendance" className="text-primary text-sm underline">
          ← Attendance Home
        </Link>
      </p>
      <h1 className="mb-6 text-2xl font-semibold">Attendance History</h1>

      <div className="overflow-x-auto">
        <table className="w-full min-w-160 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Date</th>
              <th className="py-2">Class</th>
              <th className="py-2">Teacher</th>
              <th className="py-2">Present</th>
              <th className="py-2">Absent</th>
              <th className="py-2">Half Day</th>
              <th className="py-2">Leave</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((row) => (
              <tr key={row.sessionId} className="border-b">
                <td className="py-2">{new Date(row.date).toLocaleDateString()}</td>
                <td className="py-2">
                  {row.schoolClassName} - {row.sectionName}
                </td>
                <td className="py-2">{row.teacherName}</td>
                <td className="py-2">{row.presentCount}</td>
                <td className="py-2">{row.absentCount}</td>
                <td className="py-2">{row.halfDayCount}</td>
                <td className="py-2">{row.leaveCount}</td>
              </tr>
            ))}
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted-foreground py-4 text-center">
                  No attendance sessions yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span>
          Page {result.page} of {totalPages} ({result.total} total)
        </span>
        <div className="flex gap-2">
          {result.page > 1 ? (
            <Link href={`/teacher/attendance/history?page=${result.page - 1}`}>Previous</Link>
          ) : null}
          {result.page < totalPages ? (
            <Link href={`/teacher/attendance/history?page=${result.page + 1}`}>Next</Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
