import Link from "next/link";

import { auth } from "@/lib/auth";
import { requirePermission, canViewPrincipalWorkspace } from "@/lib/authorization";
import { getPrincipalWorkspace } from "@/services/principal/principalWorkspace.service";
import { Button } from "@/components/ui/button";

const ALERT_STYLES: Record<string, string> = {
  error: "border-destructive/30 bg-destructive/5",
  warning: "border-amber-600/30 bg-amber-600/5",
  info: "border-border bg-muted/30",
};

/**
 * Principal Workspace / "Principal 360" (Sprint E4) — Admin Home,
 * enhanced in place rather than duplicated into a parallel route: both
 * "Principal" and "Administrator" are Role rows sharing `accessLevel:
 * ADMIN` (D-028/D-029), so this is already the correct landing page for
 * both — a separate `/admin/dashboard` would create two competing "home"
 * experiences for the same users. Sprint B3's own System Ready/School/
 * Academic Year content becomes School Overview below; everything else
 * (Attendance/Teacher/Student Overview, Operational Alerts) is new this
 * sprint, composed from getPrincipalWorkspace() — one read-composition
 * service, reusing every prior sprint's own services unchanged.
 */
export default async function AdminHomePage() {
  const session = await requirePermission(canViewPrincipalWorkspace);
  const authSession = await auth();

  const workspace = await getPrincipalWorkspace(session.schoolId);
  const { schoolOverview, attendanceOverview, teacherOverview, studentOverview } = workspace;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{schoolOverview.schoolName}</h1>
        <span className="text-muted-foreground text-sm">
          {authSession?.user?.name ?? authSession?.user?.email} ({authSession?.user?.roleName})
        </span>
      </div>

      {workspace.alerts.length > 0 ? (
        <section className="mb-6 flex flex-col gap-2">
          {workspace.alerts.map((alert) => (
            <div
              key={alert.id}
              role={alert.severity === "error" ? "alert" : "status"}
              className={`rounded-md border p-3 text-sm ${ALERT_STYLES[alert.severity]}`}
            >
              {alert.message}
            </div>
          ))}
        </section>
      ) : null}

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {workspace.quickActions.map((action) => (
            <Link key={action.id} href={action.href}>
              <Button type="button" variant="outline">
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">School Overview</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Academic Year" value={schoolOverview.academicYearLabel} />
            <Row label="Today" value={new Date(schoolOverview.todayDate).toLocaleDateString()} />
            <Row label="Configured Status" value={schoolOverview.configuredStatus} />
            <Row label="System Ready" value={schoolOverview.systemReady ? "Yes" : "No"} />
          </dl>
        </section>

        <section id="attendance-overview" className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Attendance Overview</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Completed" value={String(attendanceOverview.completedSections)} />
            <Row label="Pending Sections" value={String(attendanceOverview.pendingSections)} />
            <Row
              label="Students Marked"
              value={`${attendanceOverview.totalStudentsMarked} / ${attendanceOverview.totalEnrollments}`}
            />
            <Row label="Attendance %" value={`${attendanceOverview.attendancePercent}%`} />
            <Row label="Today's Sessions" value={String(attendanceOverview.totalSections)} />
          </dl>
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Teacher Overview</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Teachers" value={String(teacherOverview.totalTeachers)} />
            <Row label="Assignments" value={String(teacherOverview.totalAssignments)} />
            <Row
              label="Attendance Completed"
              value={String(teacherOverview.attendanceCompletedCount)}
            />
            <Row
              label="Pending Attendance"
              value={String(teacherOverview.attendancePendingCount)}
            />
          </dl>
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Student Overview</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Total Students" value={String(studentOverview.totalStudents)} />
            <Row label="Current Enrollments" value={String(studentOverview.currentEnrollments)} />
            <Row label="Inactive Students" value={String(studentOverview.inactiveStudents)} />
          </dl>
          {studentOverview.recentlyAdded.length > 0 ? (
            <div className="mt-3">
              <p className="text-muted-foreground mb-1 text-xs">Recently Added</p>
              <ul className="flex flex-col gap-1 text-sm">
                {studentOverview.recentlyAdded.map((student) => (
                  <li key={student.id}>
                    {student.fullName}{" "}
                    <span className="text-muted-foreground">({student.admissionNumber})</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="rounded-md border p-4 md:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Recent Activity</h2>
          <p className="text-muted-foreground text-sm">{workspace.recentActivity.reason}</p>
        </section>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
