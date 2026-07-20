import { redirect } from "next/navigation";

import { requirePermission, canManageImports } from "@/lib/authorization";
import {
  previewImportBatch,
  skipInvalidRows,
  commitImportBatchChunk,
  getImporterRegistration,
} from "@/services/import";
import { Button } from "@/components/ui/button";

// The Preview stage — reuses Sprint D1's previewImportBatch()/
// skipInvalidRows()/commitImportBatchChunk() directly, per this sprint's
// own "reuse existing preview pipeline, do not duplicate logic"
// instruction. This page adds no new business logic at all — only the
// registry lookup (getImporterRegistration()) needed to hand
// commitImportBatchChunk() the right ImportRowCommitHandler for whichever
// import type this batch turned out to be.
export default async function ImportPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string; error?: string }>;
}) {
  const session = await requirePermission(canManageImports);
  const params = await searchParams;

  if (!params.batchId) redirect("/admin/imports/upload");

  const report = await previewImportBatch(params.batchId);
  const registration = getImporterRegistration(report.batch.importType);

  async function skipAction(formData: FormData) {
    "use server";
    const batchId = formData.get("batchId");
    if (typeof batchId !== "string") return;
    await skipInvalidRows(batchId, session.userId);
    redirect(`/admin/imports/preview?batchId=${batchId}`);
  }

  async function commitAction(formData: FormData) {
    "use server";
    const batchId = formData.get("batchId");
    if (typeof batchId !== "string") return;

    const currentReport = await previewImportBatch(batchId);
    const currentRegistration = getImporterRegistration(currentReport.batch.importType);
    if (!currentRegistration) {
      redirect(
        `/admin/imports/preview?batchId=${batchId}&error=${encodeURIComponent("This import type has no working committer yet.")}`,
      );
    }

    let remaining = 1;
    while (remaining > 0) {
      const result = await commitImportBatchChunk(
        batchId,
        currentRegistration.createCommitHandler(session.schoolId),
        session.userId,
        50,
      );
      remaining = result.remaining;
    }

    redirect("/admin/imports");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Preview Import</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {report.batch.sourceFileName} — {report.batch.importType}, status {report.batch.status}.
      </p>

      <section className="mb-6 rounded-md border p-4">
        <h2 className="mb-2 text-sm font-semibold">Row Counts</h2>
        <dl className="grid grid-cols-3 gap-2 text-sm sm:grid-cols-6">
          {Object.entries(report.rowCounts).map(([status, count]) => (
            <div key={status}>
              <dt className="text-muted-foreground">{status}</dt>
              <dd className="font-medium">{count}</dd>
            </div>
          ))}
        </dl>
      </section>

      {report.errorGroups.length > 0 ? (
        <section className="mb-6 rounded-md border p-4">
          <h2 className="mb-2 text-sm font-semibold">Errors (grouped)</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {report.errorGroups.map((group) => (
              <li key={`${group.field}-${group.message}`}>
                <strong>{group.count}×</strong> {group.field}: {group.message} (rows{" "}
                {group.sampleRowNumbers.join(", ")})
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {params.error ? (
        <p role="alert" className="text-destructive mb-4 text-sm">
          {params.error}
        </p>
      ) : null}

      <div className="flex gap-3">
        {report.rowCounts.INVALID > 0 ? (
          <form action={skipAction}>
            <input type="hidden" name="batchId" value={report.batch.id} />
            <Button type="submit" variant="outline">
              Skip Invalid Rows
            </Button>
          </form>
        ) : null}
        {report.rowCounts.VALID > 0 && registration ? (
          <form action={commitAction}>
            <input type="hidden" name="batchId" value={report.batch.id} />
            <Button type="submit">Commit {report.rowCounts.VALID} Row(s)</Button>
          </form>
        ) : null}
        {!registration ? (
          <p className="text-muted-foreground text-sm">
            {report.batch.importType} has no working committer yet — this batch can be reviewed but
            not committed.
          </p>
        ) : null}
      </div>
    </main>
  );
}
