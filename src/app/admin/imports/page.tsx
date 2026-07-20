import { requirePermission, canManageImports } from "@/lib/authorization";
import { listImportBatches } from "@/services/import";

// History stage — a deliberately minimal Server Component, per this
// sprint's own "architecture only, no polished UI required" instruction.
// No Upload/Map/Validate/Preview/Commit UI exists yet (Sprint D1 builds
// foundation only, no entity-specific importer to drive that flow) — this
// page proves the repository/service/route layer works end to end and
// will show "No imports yet" until a future sprint's entity importer
// actually creates an ImportBatch.
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
      <h1 className="mb-2 text-2xl font-semibold">Import History</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Every Import Batch run against this school, past and in progress. No entity-specific
        importer exists yet (Epic D — Data Migration Engine, Sprint D1 built the foundation only) —
        this list will populate once one does.
      </p>

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
