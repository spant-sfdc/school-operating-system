import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canViewStudents } from "@/lib/authorization";
import { findTeacherByUserId } from "@/repositories/teacher";
import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { listAssignmentsForTeacher } from "@/repositories/teacherAssignment";
import { getStudentWorkspace } from "@/services/student/studentWorkspace.service";
import { formatEnumLabel } from "@/lib/format";

// Student Profile, Teacher-facing (Sprint E3) — a thin route wrapper, not
// a second implementation: calls getStudentWorkspace() (Sprint E1)
// completely unchanged, exactly as Admin's own /admin/students/[id] does.
// "Do NOT duplicate Student Workspace" is satisfied by reuse, not by
// avoidance — the only code here is the Teacher-specific authorization
// check (a Teacher may view a student only if that student's current
// enrollment is in one of the Teacher's own assigned sections),
// enforced server-side, never left to the absence of a link in the UI.
export default async function TeacherStudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission(canViewStudents);
  const { id } = await params;

  const teacher = await findTeacherByUserId(session.userId);
  if (!teacher) {
    notFound();
  }

  const workspace = await getStudentWorkspace(id, session.schoolId);
  if (!workspace) {
    notFound();
  }

  const currentAcademicYear = await findCurrentAcademicYear(session.schoolId);
  const assignments = currentAcademicYear
    ? await listAssignmentsForTeacher(teacher.id, currentAcademicYear.id)
    : [];
  const assignedSectionIds = new Set(assignments.map((a) => a.sectionId));

  if (
    !workspace.currentEnrollment ||
    !assignedSectionIds.has(workspace.currentEnrollment.sectionId)
  ) {
    notFound();
  }

  const { student, currentEnrollment, guardians, attendanceSummary } = workspace;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="mb-2">
        <Link href="/teacher/students" className="text-primary text-sm underline">
          ← My Students
        </Link>
      </p>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{student.fullName}</h1>
        <span className="text-muted-foreground text-sm">{formatEnumLabel(student.status)}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Identity</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Admission No." value={student.admissionNumber} />
            <Row label="Date of Birth" value={new Date(student.dateOfBirth).toLocaleDateString()} />
            <Row label="Gender" value={student.gender ?? "—"} />
          </dl>
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Current Enrollment</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Academic Year" value={currentEnrollment.academicYearLabel} />
            <Row
              label="Class"
              value={`${currentEnrollment.schoolClassName} - ${currentEnrollment.sectionName}`}
            />
            <Row label="Roll No." value={currentEnrollment.rollNumber} />
          </dl>
        </section>

        <section className="rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Guardian Summary</h2>
          {guardians.length > 0 ? (
            <ul className="flex flex-col gap-2 text-sm">
              {guardians.map((link) => (
                <li key={link.guardian.id}>
                  <p className="font-medium">{link.guardian.fullName}</p>
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
            </dl>
          )}
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
