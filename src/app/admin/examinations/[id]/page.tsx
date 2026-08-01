import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canViewResultReview } from "@/lib/authorization";
import { getExaminationReviewWorkspace } from "@/services/resultReview";
import { formatEnumLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { publishExaminationResultsAction } from "@/app/admin/examinations/[id]/actions";

const CELL_STATE_LABEL: Record<string, string> = {
  NOT_SUBMITTED: "Not Submitted",
  SUBMITTED: "Awaiting Review",
  RETURNED: "Returned for Correction",
  APPROVED: "Approved",
};

// Examination Review Workspace (Sprint E9) — one subjects x sections grid
// per Examination, the destination of the Result Dashboard's own "Review"
// link. A read-composition page over getExaminationReviewWorkspace()
// (examinationReviewWorkspace.service.ts) — the Publish button is the one
// mutation on this page, gated by the workspace's own already-computed
// `readiness.canPublish` (a UI courtesy; publishExaminationResultsAction()
// re-validates server-side regardless, per ARCHITECTURE.md § 7).
export default async function ExaminationReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    published?: string;
    approved?: string;
    returned?: string;
    error?: string;
  }>;
}) {
  const session = await requirePermission(canViewResultReview);
  const { id } = await params;
  const { published, approved, returned, error } = await searchParams;

  const workspace = await getExaminationReviewWorkspace(id, session.schoolId);
  if (!workspace) {
    notFound();
  }

  const { readiness } = workspace;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <p className="mb-2">
        <Link href="/admin/examinations" className="text-primary text-sm underline">
          ← Result Review
        </Link>
      </p>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{workspace.examinationName}</h1>
          <p className="text-muted-foreground text-sm">
            {workspace.examTermName} · {workspace.schoolClassName} · {workspace.academicYearLabel}
          </p>
        </div>
        <span className="text-muted-foreground text-sm">{formatEnumLabel(workspace.status)}</span>
      </div>

      {published === "1" ? (
        <div
          role="status"
          className="mb-6 rounded-md border border-emerald-600/30 bg-emerald-600/5 p-3 text-sm"
        >
          Results published.
        </div>
      ) : null}
      {approved === "1" ? (
        <div
          role="status"
          className="mb-6 rounded-md border border-emerald-600/30 bg-emerald-600/5 p-3 text-sm"
        >
          Submission approved.
        </div>
      ) : null}
      {returned === "1" ? (
        <div role="status" className="mb-6 rounded-md border p-3 text-sm">
          Submission returned for correction.
        </div>
      ) : null}
      {error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 mb-6 rounded-md border p-3 text-sm"
        >
          {error}
        </div>
      ) : null}

      <section className="mb-6 rounded-md border p-4">
        <h2 className="mb-3 text-sm font-semibold">Publication Readiness</h2>
        <p className="text-sm">
          {readiness.approvedCount}/{readiness.totalExpectedSubmissions} subject/section pairs
          approved.
        </p>
        {readiness.examinationNotCompleted ? (
          <p className="text-muted-foreground mt-2 text-sm">
            Examination must reach COMPLETED status before it can be published (current:{" "}
            {formatEnumLabel(readiness.examinationStatus)}).
          </p>
        ) : null}
        {readiness.blockingIssues.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {readiness.blockingIssues.map((issue) => (
              <li key={`${issue.examSubjectScheduleId}-${issue.sectionId}`}>
                {issue.subjectName} — {issue.sectionName}:{" "}
                <span className="text-muted-foreground">
                  {CELL_STATE_LABEL[issue.reason] ?? issue.reason}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {workspace.status === "COMPLETED" ? (
          <form
            action={publishExaminationResultsAction.bind(null, workspace.examinationId)}
            className="mt-4"
          >
            <Button type="submit" disabled={!readiness.canPublish}>
              Publish Results
            </Button>
            {!readiness.canPublish ? (
              <p className="text-muted-foreground mt-1 text-xs">
                Every subject/section pair must be Approved before publishing.
              </p>
            ) : null}
          </form>
        ) : workspace.status === "PUBLISHED" ? (
          <p className="mt-4 text-sm">
            Published
            {workspace.publishedAt ? ` on ${new Date(workspace.publishedAt).toLocaleString()}` : ""}
            .
          </p>
        ) : null}
      </section>

      <div className="overflow-x-auto">
        <table className="w-full min-w-200 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Subject</th>
              <th className="py-2">Teacher</th>
              <th className="py-2">Section</th>
              <th className="py-2">State</th>
              <th className="py-2">Submitted</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {workspace.cells.map((cell) => (
              <tr
                key={`${cell.examSubjectScheduleId}-${cell.sectionId}`}
                className="border-b align-top"
              >
                <td className="py-2">{cell.subjectName}</td>
                <td className="py-2">{cell.teacherName ?? "—"}</td>
                <td className="py-2">{cell.sectionName}</td>
                <td className="py-2">{CELL_STATE_LABEL[cell.state] ?? cell.state}</td>
                <td className="py-2">
                  {cell.submittedAt ? new Date(cell.submittedAt).toLocaleString() : "—"}
                </td>
                <td className="py-2">
                  {cell.state !== "NOT_SUBMITTED" ? (
                    <Link
                      href={`/admin/examinations/${workspace.examinationId}/submissions/${cell.examSubjectScheduleId}/${cell.sectionId}`}
                      className="text-primary underline"
                    >
                      Review
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {workspace.cells.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted-foreground py-4 text-center">
                  No subject schedules exist for this examination yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
