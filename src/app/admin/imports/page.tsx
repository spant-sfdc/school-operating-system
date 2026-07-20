import Link from "next/link";

import { requirePermission, canManageImports } from "@/lib/authorization";
import { listImportBatches } from "@/services/import";
import { Button } from "@/components/ui/button";

// History stage — reuses listImportBatches() unchanged since Sprint D1;
// "no special handling" per every sprint since. Upload/Detect/Map/Preview
// now exist (Sprint D3, /admin/imports/upload) — a batch stuck at
// UPLOADED/DETECTED/MAPPED/VALIDATED/PREVIEWED means an Admin started an
// import and didn't finish it; nothing here resumes that automatically
// (this sprint's own "no UI polish" scope), the Admin re-visits Upload.
export default async function ImportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requirePermission(canManageImports);
  const params = await searchParams;

  const result = await listImportBatches({
    schoolId: session.schoolId,
    page: params.page ? Number(params.page) : 1,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Import History</h1>
          <p className="text-muted-foreground text-sm">
            Every Import Batch run against this school, past and in progress.
          </p>
        </div>
        <Link href="/admin/imports/upload">
          <Button type="button">Upload File</Button>
        </Link>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Created</th>
            <th className="py-2">Type</th>
            <th className="py-2">File</th>
            <th className="py-2">Status</th>
            <th className="py-2">Rows</th>
            <th className="py-2">Succeeded</th>
            <th className="py-2">Failed</th>
            <th className="py-2">Skipped</th>
          </tr>
        </thead>
        <tbody>
          {result.items.map((batch) => (
            <tr key={batch.id} className="border-b">
              <td className="py-2 whitespace-nowrap">
                {new Date(batch.createdAt).toLocaleString()}
              </td>
              <td className="py-2">{batch.importType}</td>
              <td className="py-2">{batch.sourceFileName}</td>
              <td className="py-2">{batch.status}</td>
              <td className="py-2">{batch.totalRows ?? "—"}</td>
              <td className="py-2">{batch.successCount}</td>
              <td className="py-2">{batch.errorCount}</td>
              <td className="py-2">{batch.skippedCount}</td>
            </tr>
          ))}
          {result.items.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-muted-foreground py-4 text-center">
                No imports yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span>
          Page {result.page} of {totalPages} ({result.total} total)
        </span>
        <div className="flex gap-2">
          {result.page > 1 ? <a href={`/admin/imports?page=${result.page - 1}`}>Previous</a> : null}
          {result.page < totalPages ? (
            <a href={`/admin/imports?page=${result.page + 1}`}>Next</a>
          ) : null}
        </div>
      </div>
    </main>
  );
}
