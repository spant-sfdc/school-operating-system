import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canViewTeacherWorkspace } from "@/lib/authorization";
import { findTeacherByUserId } from "@/repositories/teacher";
import { getTeacherWorkspace } from "@/services/teacher/teacherWorkspace.service";
import { Button } from "@/components/ui/button";

// Teacher Dashboard / "Teacher 360" (Sprint E3) — the answer to "a teacher
// logs in at 8:00 AM, what should they see in under 30 seconds": identity,
// assignments, today's attendance state, a student quick-access preview,
// and one-click Quick Actions, all on one page — replaces the placeholder
// guard-verification stub this route held since Sprint B1.
export default async function TeacherDashboardPage() {
  const session = await requirePermission(canViewTeacherWorkspace);

  const teacher = await findTeacherByUserId(session.userId);
  if (!teacher) {
    notFound();
  }

  const workspace = await getTeacherWorkspace(teacher.id, session.userId, session.schoolId);
  if (!workspace) {
    notFound();
  }

  const { attendanceHome } = workspace;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{workspace.fullName}</h1>
        <span className="text-muted-foreground text-sm">
          {workspace.roleName} · {workspace.academicYearLabel}
        </span>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {workspace.quickActions.map((action) =>
            action.enabled && action.href ? (
              <Link key={action.id} href={action.href}>
                <Button type="button" variant="outline">
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button
                key={action.id}
                type="button"
                variant="outline"
                disabled
                title={action.reason}
              >
                {action.label}
              </Button>
            ),
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Today&apos;s Attendance</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row
              label="Completed"
              value={String(attendanceHome.sections.filter((s) => s.state === "COMPLETED").length)}
            />
            <Row
              label="Pending"
              value={String(attendanceHome.sections.filter((s) => s.state !== "COMPLETED").length)}
            />
            <Row
              label="Last Attendance Taken"
              value={
                workspace.lastAttendanceTaken
                  ? `${workspace.lastAttendanceTaken.schoolClassName} - ${workspace.lastAttendanceTaken.sectionName} (${new Date(workspace.lastAttendanceTaken.date).toLocaleDateString()})`
                  : "None yet"
              }
            />
          </dl>
          {attendanceHome.sections.length === 0 ? (
            <p className="text-muted-foreground mt-2 text-xs">
              You are not the Class Teacher of any section this academic year.
            </p>
          ) : null}
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Students Under Care</h2>
          <p className="text-2xl font-semibold">{workspace.studentsUnderCareCount}</p>
          <p className="text-muted-foreground text-xs">
            Across {workspace.classTeacherAssignments.length + workspace.subjectAssignments.length}{" "}
            assignment(s) this year.
          </p>
        </section>

        <section className="rounded-md border p-4 md:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Assignments</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-140 border-collapse text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Class</th>
                  <th className="py-2">Subject</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...workspace.classTeacherAssignments, ...workspace.subjectAssignments].map(
                  (assignment, index) => (
                    <tr
                      key={`${assignment.sectionId}-${assignment.subjectName ?? index}`}
                      className="border-b"
                    >
                      <td className="py-2">
                        {assignment.schoolClassName} - {assignment.sectionName}
                      </td>
                      <td className="py-2">{assignment.subjectName ?? "—"}</td>
                      <td className="py-2">{assignment.role}</td>
                      <td className="py-2">{assignment.status}</td>
                    </tr>
                  ),
                )}
                {workspace.classTeacherAssignments.length + workspace.subjectAssignments.length ===
                0 ? (
                  <tr>
                    <td colSpan={4} className="text-muted-foreground py-4 text-center">
                      No assignments this academic year.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-md border p-4 md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Student Quick Access</h2>
            <Link href="/teacher/students" className="text-primary text-xs underline">
              View All →
            </Link>
          </div>
          {workspace.studentQuickAccess.length > 0 ? (
            <ul className="flex flex-col gap-2 text-sm">
              {workspace.studentQuickAccess.map((student) => (
                <li key={student.id}>
                  <Link href={`/teacher/students/${student.id}`} className="text-primary underline">
                    {student.fullName}
                  </Link>{" "}
                  <span className="text-muted-foreground">
                    ({student.admissionNumber}
                    {student.schoolClassName
                      ? ` · ${student.schoolClassName} - ${student.sectionName}`
                      : ""}
                    )
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No students in your assigned sections yet.
            </p>
          )}
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
