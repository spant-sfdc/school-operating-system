import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canTakeAttendance } from "@/lib/authorization";
import { findTeacherByUserId } from "@/repositories/teacher";
import { getAttendanceSessionWorkspace } from "@/services/attendance/attendanceSessionWorkspace.service";
import AttendanceGrid from "@/app/teacher/attendance/[sectionId]/AttendanceGrid";

// Attendance Session — the Grid itself. A Server Component resolves and
// authorizes today's session (getAttendanceSessionWorkspace(), which
// reuses openAttendanceSession() unchanged) and hands the roster + current
// marks to the one Client Component this sprint adds
// (AttendanceGrid.tsx) for the actual interactive marking.
export default async function AttendanceSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ sectionId: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const session = await requirePermission(canTakeAttendance);
  const [{ sectionId }, { submitted }] = await Promise.all([params, searchParams]);

  const teacher = await findTeacherByUserId(session.userId);

  const workspace = await getAttendanceSessionWorkspace(
    sectionId,
    session.userId,
    session.schoolId,
    session.accessLevel,
    teacher?.id ?? null,
  );
  if (!workspace) {
    notFound();
  }

  const { summary } = workspace;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-2">
        <Link href="/teacher/attendance" className="text-primary text-sm underline">
          ← Attendance Home
        </Link>
      </p>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {workspace.schoolClassName} - {workspace.sectionName}
        </h1>
        <span className="text-muted-foreground text-sm">
          {new Date(workspace.date).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          · {workspace.academicYearLabel}
        </span>
      </div>

      {submitted === "1" ? (
        <div
          role="status"
          className="mb-6 rounded-md border border-emerald-600/30 bg-emerald-600/5 p-4 text-sm"
        >
          <p className="mb-2 font-medium">Attendance Summary</p>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryStat label="Present" value={`${summary.presentPercent}%`} />
            <SummaryStat label="Absent" value={`${summary.absentPercent}%`} />
            <SummaryStat label="Half Day" value={String(summary.halfDayCount)} />
            <SummaryStat label="Leave" value={String(summary.leaveCount)} />
          </dl>
          <p className="text-muted-foreground mt-2 text-xs">
            {summary.markedCount}/{summary.totalStudents} students marked.
          </p>
        </div>
      ) : null}

      <AttendanceGrid
        sectionId={sectionId}
        sessionId={workspace.session.id}
        rows={workspace.rows}
        locked={workspace.locked}
      />
    </main>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-lg font-semibold">{value}</dd>
    </div>
  );
}
