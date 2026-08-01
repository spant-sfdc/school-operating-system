import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canReviewSubmissions } from "@/lib/authorization";
import { getExaminationReviewWorkspace } from "@/services/resultReview";
import { getMarksEntryWorkspace } from "@/services/marks";
import { Button } from "@/components/ui/button";
import {
  approveSubmissionAction,
  returnSubmissionAction,
} from "@/app/admin/examinations/[id]/submissions/[scheduleId]/[sectionId]/actions";

// Submission Review (Sprint E9) — the Principal/Admin's own "look at what
// was submitted, then Approve or Return for Correction" screen. Composes
// two already-built reads, neither reimplemented here: the review cell's
// own metadata (subject/teacher/section/state/timestamps/return reason)
// from getExaminationReviewWorkspace() — the same workspace the parent
// page already renders a grid of — and the actual roster + marks from
// getMarksEntryWorkspace() (Sprint E8, unchanged; called with
// accessLevel "ADMIN" the same way assertCanEnterMarksForScheduleAndSection()
// already admits any Admin unconditionally). Read-only here — no Save/
// Submit controls, this is a review screen, not a second entry grid.
export default async function SubmissionReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; scheduleId: string; sectionId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requirePermission(canReviewSubmissions);
  const { id: examinationId, scheduleId, sectionId } = await params;
  const { error } = await searchParams;

  const [reviewWorkspace, marksWorkspace] = await Promise.all([
    getExaminationReviewWorkspace(examinationId, session.schoolId),
    getMarksEntryWorkspace(scheduleId, sectionId, session.schoolId, "ADMIN", null),
  ]);
  if (!reviewWorkspace || !marksWorkspace) {
    notFound();
  }

  const cell = reviewWorkspace.cells.find(
    (c) => c.examSubjectScheduleId === scheduleId && c.sectionId === sectionId,
  );
  if (!cell) {
    notFound();
  }

  const canAct = cell.state === "SUBMITTED";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-2">
        <Link
          href={`/admin/examinations/${examinationId}`}
          className="text-primary text-sm underline"
        >
          ← {reviewWorkspace.examinationName}
        </Link>
      </p>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {cell.subjectName} — {reviewWorkspace.schoolClassName} {cell.sectionName}
        </h1>
        <span className="text-muted-foreground text-sm">
          {cell.teacherName ?? "—"} · {reviewWorkspace.examTermName}
        </span>
      </div>

      {error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 mb-6 rounded-md border p-3 text-sm"
        >
          {error}
        </div>
      ) : null}

      <section className="mb-6 rounded-md border p-4 text-sm">
        <dl className="flex flex-col gap-2">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Status</dt>
            <dd>{cell.state}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Submitted</dt>
            <dd>{cell.submittedAt ? new Date(cell.submittedAt).toLocaleString() : "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Last Reviewed</dt>
            <dd>{cell.reviewedAt ? new Date(cell.reviewedAt).toLocaleString() : "—"}</dd>
          </div>
        </dl>
        {cell.returnReason ? (
          <div className="mt-3 rounded-md border border-amber-600/30 bg-amber-600/5 p-3">
            <p className="font-medium">Previous return reason</p>
            <p className="mt-1">{cell.returnReason}</p>
          </div>
        ) : null}
      </section>

      <div className="mb-6 overflow-x-auto">
        <table className="w-full min-w-160 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Roll No.</th>
              <th className="py-2">Student</th>
              <th className="py-2">Admission No.</th>
              <th className="py-2">Marks</th>
              <th className="py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {marksWorkspace.rows.map((row) => (
              <tr key={row.enrollmentId} className="border-b">
                <td className="py-2">{row.rollNumber}</td>
                <td className="py-2">{row.fullName}</td>
                <td className="py-2">{row.admissionNumber}</td>
                <td className="py-2">
                  {row.marksObtained ?? "—"} / {marksWorkspace.maxMarks}
                </td>
                <td className="py-2">
                  {row.marksObtained === null
                    ? "—"
                    : row.marksObtained >= marksWorkspace.passMarks
                      ? "Pass"
                      : "Fail"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4">
        <form action={approveSubmissionAction.bind(null, examinationId, scheduleId, sectionId)}>
          <Button type="submit" disabled={!canAct}>
            Approve
          </Button>
        </form>

        <form
          action={returnSubmissionAction.bind(null, examinationId, scheduleId, sectionId)}
          className="flex flex-col gap-2"
        >
          <label htmlFor="reason" className="text-muted-foreground text-xs">
            Return for correction — reason (required)
          </label>
          <textarea
            id="reason"
            name="reason"
            required
            disabled={!canAct}
            maxLength={500}
            rows={3}
            className="border-input bg-background w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none disabled:opacity-50"
          />
          <Button type="submit" variant="destructive" disabled={!canAct} className="w-fit">
            Return for Correction
          </Button>
        </form>
      </div>
    </main>
  );
}
