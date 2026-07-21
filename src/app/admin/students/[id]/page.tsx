import Link from "next/link";
import { notFound } from "next/navigation";

import {
  requirePermission,
  canViewStudents,
  canManageStudents,
  canTransferStudents,
  canDeactivateStudents,
  type AuthorizationSubject,
} from "@/lib/authorization";
import { getStudentWorkspace } from "@/services/student/studentWorkspace.service";
import { formatEnumLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";

const ACTION_PERMISSIONS: Record<string, (subject: AuthorizationSubject) => boolean> = {
  "edit-student": canManageStudents,
  "transfer-student": canTransferStudents,
  "promote-student": canManageStudents,
  "deactivate-student": canDeactivateStudents,
  "generate-tc": canTransferStudents,
  "manage-guardian": canManageStudents,
};

// Student Profile / "Student 360" (Sprint E1) — the destination of the
// Directory's own "understand everything about one student in under 30
// seconds" workflow. A read-composition page over getStudentWorkspace()
// (src/services/student/studentWorkspace.service.ts) — no Student CRUD,
// no Attendance/Guardian/Timeline UI, per this sprint's own "DO NOT
// BUILD" list. Quick Actions render as real, permission-gated buttons;
// most are disabled with an honest reason (their own capability isn't
// built yet) rather than hidden — an Admin should see what's coming, not
// wonder why a button doesn't exist.
export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission(canViewStudents);
  const { id } = await params;

  const workspace = await getStudentWorkspace(id, session.schoolId);
  if (!workspace) {
    notFound();
  }

  const { student, currentEnrollment, guardians, attendanceSummary, academicSnapshot } = workspace;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{student.fullName}</h1>
        <span className="text-muted-foreground text-sm">{formatEnumLabel(student.status)}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Identity</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Admission No." value={student.admissionNumber} />
            <Row label="Date of Birth" value={new Date(student.dateOfBirth).toLocaleDateString()} />
            <Row label="Gender" value={student.gender ?? "—"} />
            <Row label="Category" value={student.category ?? "—"} />
          </dl>
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Current Enrollment</h2>
          {currentEnrollment ? (
            <dl className="flex flex-col gap-2 text-sm">
              <Row label="Academic Year" value={currentEnrollment.academicYearLabel} />
              <Row
                label="Class"
                value={`${currentEnrollment.schoolClassName} - ${currentEnrollment.sectionName}`}
              />
              <Row label="Roll No." value={currentEnrollment.rollNumber} />
            </dl>
          ) : (
            <p className="text-muted-foreground text-sm">
              Not enrolled for the current academic year.
            </p>
          )}
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Guardian Summary</h2>
          {guardians.length > 0 ? (
            <ul className="flex flex-col gap-3 text-sm">
              {guardians.map((link) => (
                <li key={link.guardian.id}>
                  <p className="font-medium">
                    {link.guardian.fullName}
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      ({formatEnumLabel(link.relationshipType)}
                      {link.isPrimaryContact ? ", primary" : ""})
                    </span>
                  </p>
                  <p className="text-muted-foreground">{link.guardian.phone}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No guardians linked yet.</p>
          )}
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Attendance Summary</h2>
          {attendanceSummary.available === false ? (
            <p className="text-muted-foreground text-sm">{attendanceSummary.reason}</p>
          ) : (
            <dl className="flex flex-col gap-2 text-sm">
              <Row label="Attendance %" value={`${attendanceSummary.attendancePercent}%`} />
              <Row label="Present" value={String(attendanceSummary.presentCount)} />
              <Row label="Absent" value={String(attendanceSummary.absentCount)} />
              <Row label="Half Day" value={String(attendanceSummary.halfDayCount)} />
              <Row label="Leave" value={String(attendanceSummary.leaveCount)} />
            </dl>
          )}
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Academic Snapshot</h2>
          <p className="text-muted-foreground text-sm">{academicSnapshot.reason}</p>
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Recent Activity</h2>
          <p className="text-muted-foreground text-sm">{workspace.recentActivity.reason}</p>
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Documents</h2>
          <p className="text-muted-foreground text-sm">{workspace.documents.reason}</p>
        </section>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {workspace.quickActions.map((action) => {
            const permissionCheck = ACTION_PERMISSIONS[action.id];
            if (permissionCheck && !permissionCheck(session)) {
              return null;
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

      <p className="mt-6 text-sm">
        <Link href="/admin/students" className="text-primary underline">
          ← Back to Students
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
