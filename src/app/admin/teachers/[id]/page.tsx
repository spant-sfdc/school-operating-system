import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canManageTeachers } from "@/lib/authorization";
import { getAdminTeacherWorkspace } from "@/services/teacher/adminTeacherWorkspace.service";
import { formatEnumLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { activateTeacherAction, deactivateTeacherAction } from "@/app/admin/teachers/actions";

// Admin Teacher 360 (Sprint E5) — "manage every teacher in the school from
// one place," the destination of the Directory's own "find a teacher
// quickly" workflow. A read-composition page over
// getAdminTeacherWorkspace() (src/services/teacher/adminTeacherWorkspace.service.ts)
// — Workload is computed fresh on every render, never stored (this
// sprint's own explicit instruction). Distinct from the Teacher's own
// self-service /teacher Dashboard (Sprint E3) — this is the Admin-facing
// superset (full assignment history, Account state, Activity), not a
// duplicate of it.
export default async function AdminTeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission(canManageTeachers);
  const { id } = await params;

  const workspace = await getAdminTeacherWorkspace(id, session.schoolId);
  if (!workspace) {
    notFound();
  }

  const { account, workload } = workspace;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{workspace.fullName}</h1>
          <p className="text-muted-foreground text-xs">Teacher ID: {workspace.teacherIdLabel}</p>
        </div>
        <span className="text-muted-foreground text-sm">
          {formatEnumLabel(workspace.status)} · {workspace.academicYearLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Identity</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Email" value={workspace.email} />
            <Row label="Phone" value={workspace.phone} />
            <Row label="Status" value={formatEnumLabel(workspace.status)} />
          </dl>
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Account</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Role" value={account.roleName} />
            <Row label="Account Status" value={account.isActive ? "Active" : "Deactivated"} />
            <Row label="Must Change Password" value={account.mustChangePassword ? "Yes" : "No"} />
            <Row
              label="Last Login"
              value={account.lastLogin.available === false ? "Not tracked" : "—"}
            />
          </dl>
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Workload</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Classes" value={String(workload.classCount)} />
            <Row label="Sections" value={String(workload.sectionCount)} />
            <Row label="Subjects" value={String(workload.subjectCount)} />
            <Row label="Students Under Care" value={String(workload.studentsUnderCareCount)} />
            <Row
              label="Attendance Pending Today"
              value={`${workload.attendancePendingToday} / ${workload.classTeacherSectionCount}`}
            />
          </dl>
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Current Assignments</h2>
          {workspace.currentAssignments.length > 0 ? (
            <ul className="flex flex-col gap-2 text-sm">
              {workspace.currentAssignments.map((a) => (
                <li key={a.id}>
                  {a.schoolClassName} - {a.sectionName}
                  {a.subjectName ? ` (${a.subjectName})` : ""}{" "}
                  <span className="text-muted-foreground">[{a.role}]</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No assignments for the current academic year.
            </p>
          )}
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Historical Assignments</h2>
          {workspace.historicalAssignments.length > 0 ? (
            <ul className="flex flex-col gap-2 text-sm">
              {workspace.historicalAssignments.map((a) => (
                <li key={a.id}>
                  {a.academicYearLabel}: {a.schoolClassName} - {a.sectionName}
                  {a.subjectName ? ` (${a.subjectName})` : ""}{" "}
                  <span className="text-muted-foreground">
                    [{a.role}, {a.status}]
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No prior assignments.</p>
          )}
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Qualifications</h2>
          {workspace.qualifications.length > 0 ? (
            <>
              <p className="mb-2 text-sm">
                Highest: <span className="font-medium">{workspace.highestQualification}</span>
              </p>
              <ul className="flex flex-col gap-1 text-sm">
                {workspace.qualifications.map((q) => (
                  <li key={q.id}>
                    {q.qualificationType}
                    {q.institution ? `, ${q.institution}` : ""}
                    {q.yearCompleted ? ` (${q.yearCompleted})` : ""}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No qualifications on record.</p>
          )}
        </section>

        <section className="rounded-md border p-4 md:col-span-2 lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold">Recent Activity</h2>
          {workspace.recentActivity.length > 0 ? (
            <ul className="flex flex-col gap-2 text-sm">
              {workspace.recentActivity.map((event) => (
                <li key={event.id} className="flex justify-between gap-4">
                  <span>
                    {event.summary}{" "}
                    <span className="text-muted-foreground">by {event.actorLabel}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No recorded activity yet.</p>
          )}
        </section>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {workspace.quickActions.map((action) => {
            if (action.id === "activate") {
              return action.enabled ? (
                <form
                  key={action.id}
                  action={activateTeacherAction.bind(null, workspace.teacherId)}
                >
                  <Button type="submit" variant="outline">
                    {action.label}
                  </Button>
                </form>
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
              );
            }
            if (action.id === "deactivate") {
              return action.enabled ? (
                <form
                  key={action.id}
                  action={deactivateTeacherAction.bind(null, workspace.teacherId)}
                >
                  <Button type="submit" variant="destructive">
                    {action.label}
                  </Button>
                </form>
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
              );
            }
            return action.enabled && action.href ? (
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
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold">Go To</h2>
        <div className="flex flex-wrap gap-3">
          {workspace.crossNavigation.map((link) => (
            <Link key={link.id} href={link.href} className="text-primary text-sm underline">
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-6 text-sm">
        <Link href="/admin/teachers" className="text-primary underline">
          ← Back to Teachers
        </Link>
      </p>
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
