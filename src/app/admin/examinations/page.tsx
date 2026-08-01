import Link from "next/link";

import { requirePermission, canViewResultReview } from "@/lib/authorization";
import { getResultReviewDashboard } from "@/services/resultReview";
import { formatEnumLabel } from "@/lib/format";

// Result Review Dashboard (Sprint E9) — the Principal/Admin's own entry
// point into "what is blocking this examination from being published,"
// this sprint's own explicit design goal. A read-composition page over
// getResultReviewDashboard() (resultReviewDashboard.service.ts) — no new
// business logic here, mirrors /admin/teachers's own directory-table
// convention.
export default async function ResultReviewDashboardPage() {
  const session = await requirePermission(canViewResultReview);

  const dashboard = await getResultReviewDashboard(session.schoolId);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Result Review</h1>
        <span className="text-muted-foreground text-sm">{dashboard.academicYearLabel}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-200 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Examination</th>
              <th className="py-2">Class</th>
              <th className="py-2">Term</th>
              <th className="py-2">Status</th>
              <th className="py-2">Not Submitted</th>
              <th className="py-2">Awaiting Review</th>
              <th className="py-2">Returned</th>
              <th className="py-2">Approved</th>
              <th className="py-2">Ready to Publish</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {dashboard.examinations.map((exam) => (
              <tr key={exam.examinationId} className="border-b align-top">
                <td className="py-2">{exam.examinationName}</td>
                <td className="py-2">{exam.schoolClassName}</td>
                <td className="py-2">{exam.examTermName}</td>
                <td className="py-2">{formatEnumLabel(exam.status)}</td>
                <td className="py-2">{exam.notSubmittedCount}</td>
                <td className="py-2">{exam.awaitingReviewCount}</td>
                <td className="py-2">{exam.returnedCount}</td>
                <td className="py-2">
                  {exam.approvedCount}/{exam.totalExpectedSubmissions}
                </td>
                <td className="py-2">
                  {exam.status === "PUBLISHED" ? "Published" : exam.readyToPublish ? "Yes" : "No"}
                </td>
                <td className="py-2">
                  <Link
                    href={`/admin/examinations/${exam.examinationId}`}
                    className="text-primary underline"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {dashboard.examinations.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-muted-foreground py-4 text-center">
                  No examinations are currently active, completed, or published this academic year.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
