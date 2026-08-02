import Link from "next/link";

import { requirePermission, canViewReportCards, canManageReportCards } from "@/lib/authorization";
import { getStudentReportCard } from "@/services/reportCard";
import ReportCardDocument from "@/components/shared/ReportCardDocument";
import PrintButton from "@/components/shared/PrintButton";
import { Button } from "@/components/ui/button";
import { generateReportCardAction } from "@/app/admin/students/[id]/report-cards/[examinationId]/actions";

// Report Card Preview (Sprint E12) — an OUTPUT/PROJECTION over already-
// authoritative published academic data (Phase 4's own explicit
// architectural boundary), never a second academic record system. Before
// "Generate," this page composes live data fresh on every load; after
// Generate, it reads the frozen `ReportCard.snapshot` — the exact same
// DTO shape either way, so ReportCardDocument never needs to know which.
export default async function AdminReportCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; examinationId: string }>;
  searchParams: Promise<{ generated?: string; error?: string }>;
}) {
  const session = await requirePermission(canViewReportCards);
  const { id: studentId, examinationId } = await params;
  const { generated, error } = await searchParams;

  const reportCard = await getStudentReportCard(studentId, examinationId, session.schoolId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
      <p className="mb-2 print:hidden">
        <Link
          href={`/admin/students/${studentId}/academic-history`}
          className="text-primary text-sm underline"
        >
          ← Academic History
        </Link>
      </p>

      {generated === "1" ? (
        <div
          role="status"
          className="mb-4 rounded-md border border-emerald-600/30 bg-emerald-600/5 p-3 text-sm print:hidden"
        >
          Report card generated.
        </div>
      ) : null}
      {error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 mb-4 rounded-md border p-3 text-sm print:hidden"
        >
          {error}
        </div>
      ) : null}

      {reportCard.available === false ? (
        <p className="text-muted-foreground text-sm">{reportCard.reason}</p>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-end gap-3 print:hidden">
            {reportCard.generated ? (
              <span className="text-muted-foreground text-xs">
                Generated {new Date(reportCard.generatedAt!).toLocaleString()}
              </span>
            ) : canManageReportCards(session) ? (
              <form action={generateReportCardAction.bind(null, studentId, examinationId)}>
                <Button type="submit">Generate Report Card</Button>
              </form>
            ) : null}
            <PrintButton />
          </div>
          <ReportCardDocument data={reportCard.data} />
        </>
      )}
    </main>
  );
}
