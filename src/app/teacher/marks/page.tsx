import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canViewMarks } from "@/lib/authorization";
import { findTeacherByUserId } from "@/repositories/teacher";
import { getTeacherExaminationsHome } from "@/services/marks/teacherExaminations.service";
import { Button } from "@/components/ui/button";

// My Examinations — Sprint E8's own entry point into Marks Entry
// (Teacher Dashboard -> My Examinations -> Select Examination -> Select
// Subject -> Grid). Collapses "Select Examination" and "Select Subject"
// into this one flat list — mirrors /teacher/attendance/page.tsx's own
// "select section" precedent exactly (Sprint E2): a teacher's own
// TeacherAssignment set is already the effective filter, so a multi-step
// picker over an already-narrow list adds clicks without adding clarity.
// Only ACTIVE examinations appear — a DRAFT/SCHEDULED/COMPLETED/ARCHIVED
// examination has nothing to enter marks for yet or anymore.
export default async function TeacherExaminationsPage() {
  const session = await requirePermission(canViewMarks);

  const teacher = await findTeacherByUserId(session.userId);
  if (!teacher) {
    notFound();
  }

  const home = await getTeacherExaminationsHome(teacher.id, session.schoolId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Examinations</h1>
        <span className="text-muted-foreground text-sm">{home.academicYearLabel}</span>
      </div>

      {home.rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No active examinations have any subject assigned to you right now — marks entry opens once
          an Administrator publishes an examination and schedules your subject.
        </p>
      ) : (
        <>
          {home.quickResume ? (
            <div className="mb-6">
              <Link
                href={`/teacher/marks/${home.quickResume.examSubjectScheduleId}/${home.quickResume.sectionId}`}
              >
                <Button type="button">Quick Resume — Enter Marks Now</Button>
              </Link>
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            {home.rows.map((row) => (
              <div
                key={`${row.examSubjectScheduleId}-${row.sectionId}`}
                className="flex items-center justify-between rounded-md border p-4"
              >
                <div>
                  <p className="font-medium">
                    {row.subjectName} — {row.schoolClassName} {row.sectionName}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {row.examinationName} · {stateLabel(row.state)} — {row.submittedCount}/
                    {row.totalStudents} submitted
                  </p>
                </div>
                <Link href={`/teacher/marks/${row.examSubjectScheduleId}/${row.sectionId}`}>
                  <Button type="button" variant="outline">
                    {row.state === "COMPLETED" ? "View" : "Enter Marks"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function stateLabel(state: "NOT_STARTED" | "PENDING" | "COMPLETED"): string {
  switch (state) {
    case "NOT_STARTED":
      return "Not started";
    case "PENDING":
      return "In progress";
    case "COMPLETED":
      return "Submitted";
  }
}
