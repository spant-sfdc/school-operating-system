import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canViewAuditLog } from "@/lib/authorization";
import { getAuditEvent } from "@/services/audit";
import { getSchoolDetails } from "@/services/system";

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <p className="text-muted-foreground mb-1 text-xs font-medium">{label}</p>
      <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
        {value === null || value === undefined ? "—" : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export default async function AuditEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(canViewAuditLog);
  const { id } = await params;

  const [event, schoolDetails] = await Promise.all([getAuditEvent(id), getSchoolDetails()]);
  if (!event) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Audit Event</h1>

      <dl className="mb-6 flex flex-col gap-2 rounded-md border p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Created At</dt>
          <dd>{new Date(event.timestamp).toLocaleString()}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">User</dt>
          <dd>{event.actorLabel}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Action</dt>
          <dd>{event.action}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Entity</dt>
          <dd>{event.entityType}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Entity ID</dt>
          <dd className="font-mono text-xs">{event.entityId}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">School</dt>
          <dd>{schoolDetails?.name ?? "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Summary</dt>
          <dd>{event.summary}</dd>
        </div>
      </dl>

      <div className="mb-6 flex flex-col gap-4">
        <JsonBlock label="Before Value" value={event.beforeValue} />
        <JsonBlock label="After Value" value={event.afterValue} />
      </div>

      <p className="text-sm">
        <Link href="/admin/audit" className="text-primary underline">
          ← Back to Audit Log
        </Link>
      </p>
    </main>
  );
}
