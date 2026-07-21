import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canViewAttendance } from "@/lib/authorization";
import { findTeacherByUserId } from "@/repositories/teacher";
import { getAttendanceHome } from "@/services/attendance/attendanceDashboard.service";
import { Button } from "@/components/ui/button";

// Attendance Home — Sprint E2's own Business Workflow Review: "every
// morning, a teacher opens the system and needs to mark attendance for
// today's class in under 2 minutes." This page is that entry point —
// Today's Sessions, Pending Sessions, Completed Today, one Quick Resume
// button, nothing else. A teacher with no Class Teacher assignment sees an
// honest empty state, not a broken page.
export default async function AttendanceHomePage() {
  const session = await requirePermission(canViewAttendance);

  const teacher = await findTeacherByUserId(session.userId);
  if (!teacher) {
    notFound();
  }

  const home = await getAttendanceHome(teacher.id, session.schoolId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <span className="text-muted-foreground text-sm">
          {new Date(home.date).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          · {home.academicYearLabel}
        </span>
      </div>

      {home.sections.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          You are not the Class Teacher of any section this academic year — attendance can only be
          taken by a section&apos;s Class Teacher.
        </p>
      ) : (
        <>
          {home.quickResumeSectionId ? (
            <div className="mb-6">
              <Link href={`/teacher/attendance/${home.quickResumeSectionId}`}>
                <Button type="button">Quick Resume — Take Attendance Now</Button>
              </Link>
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            {home.sections.map((section) => (
              <div
                key={section.sectionId}
                className="flex items-center justify-between rounded-md border p-4"
              >
                <div>
                  <p className="font-medium">
                    {section.schoolClassName} - {section.sectionName}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {stateLabel(section.state)} — {section.markedCount}/{section.totalStudents}{" "}
                    marked
                  </p>
                </div>
                <Link href={`/teacher/attendance/${section.sectionId}`}>
                  <Button type="button" variant="outline">
                    {section.state === "COMPLETED" ? "View" : "Take Attendance"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="mt-6 text-sm">
        <Link href="/teacher/attendance/history" className="text-primary underline">
          View Attendance History →
        </Link>
      </p>
    </main>
  );
}

function stateLabel(state: "NOT_STARTED" | "PENDING" | "COMPLETED"): string {
  switch (state) {
    case "NOT_STARTED":
      return "Not started today";
    case "PENDING":
      return "In progress";
    case "COMPLETED":
      return "Completed today";
  }
}
