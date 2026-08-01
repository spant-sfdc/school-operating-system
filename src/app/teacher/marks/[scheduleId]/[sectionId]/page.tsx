import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canEnterMarks } from "@/lib/authorization";
import { findTeacherByUserId } from "@/repositories/teacher";
import { getMarksEntryWorkspace, MarksAuthorizationError } from "@/services/marks";
import MarksGrid from "@/app/teacher/marks/[scheduleId]/[sectionId]/MarksGrid";

// Marks Entry Grid — a Server Component resolves and authorizes the
// workspace (getMarksEntryWorkspace(), reusing the same authorization
// pattern attendanceSessionWorkspace.service.ts already established) and
// hands the roster + current marks to the one Client Component this
// sprint adds (MarksGrid.tsx) for the actual interactive entry.
export default async function MarksEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ scheduleId: string; sectionId: string }>;
  searchParams: Promise<{ submitted?: string; saved?: string }>;
}) {
  const session = await requirePermission(canEnterMarks);
  const [{ scheduleId, sectionId }, { submitted, saved }] = await Promise.all([
    params,
    searchParams,
  ]);

  const teacher = await findTeacherByUserId(session.userId);

  let workspace;
  try {
    workspace = await getMarksEntryWorkspace(
      scheduleId,
      sectionId,
      session.schoolId,
      session.accessLevel,
      teacher?.id ?? null,
    );
  } catch (error) {
    if (error instanceof MarksAuthorizationError) {
      notFound();
    }
    throw error;
  }
  if (!workspace) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-2">
        <Link href="/teacher/marks" className="text-primary text-sm underline">
          ← My Examinations
        </Link>
      </p>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {workspace.subjectName} — {workspace.schoolClassName} {workspace.sectionName}
        </h1>
        <span className="text-muted-foreground text-sm">
          {workspace.examinationName} · {workspace.academicYearLabel}
        </span>
      </div>

      {submitted === "1" ? (
        <div
          role="status"
          className="mb-6 rounded-md border border-emerald-600/30 bg-emerald-600/5 p-4 text-sm"
        >
          Marks submitted for {workspace.summary.submittedCount}/{workspace.summary.totalStudents}{" "}
          students. This section is now locked.
        </div>
      ) : null}
      {saved === "1" && submitted !== "1" ? (
        <div role="status" className="mb-6 rounded-md border p-4 text-sm">
          Draft saved — {workspace.summary.enteredCount}/{workspace.summary.totalStudents} students
          have marks entered so far.
        </div>
      ) : null}

      {workspace.examinationInactive ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 mb-6 rounded-md border p-3 text-sm"
        >
          This examination is not currently ACTIVE (status: {workspace.examinationStatus}) — marks
          entry is closed.
        </div>
      ) : null}

      <MarksGrid
        scheduleId={scheduleId}
        sectionId={sectionId}
        rows={workspace.rows}
        maxMarks={workspace.maxMarks}
        passMarks={workspace.passMarks}
        locked={workspace.locked || workspace.examinationInactive}
      />
    </main>
  );
}
