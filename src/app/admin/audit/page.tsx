import Link from "next/link";

import { requirePermission, canViewAuditLog } from "@/lib/authorization";
import { searchAuditEvents, listEntityTypeOptions } from "@/services/audit";
import { getSchoolDetails } from "@/services/system";
import { listUsersBySchool } from "@/repositories/user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ActionFilter = "" | "CREATE" | "UPDATE" | "SOFT_DELETE";

// Server Component, GET-based filters (mirrors src/app/admin/users/page.tsx
// exactly) — no client-side filtering, no useActionState, per this
// sprint's own "Server Components wherever possible, no client-side
// filtering unless genuinely required" instruction.
export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    action?: string;
    entityType?: string;
    actorUserId?: string;
    query?: string;
    page?: string;
  }>;
}) {
  const session = await requirePermission(canViewAuditLog);
  const params = await searchParams;

  const action: ActionFilter =
    params.action === "CREATE" || params.action === "UPDATE" || params.action === "SOFT_DELETE"
      ? params.action
      : "";

  const [result, entityTypes, users, schoolDetails] = await Promise.all([
    searchAuditEvents({
      schoolId: session.schoolId,
      startDate: params.startDate || undefined,
      endDate: params.endDate || undefined,
      action: action || undefined,
      entityType: params.entityType || undefined,
      actorUserId: params.actorUserId || undefined,
      query: params.query,
      page: params.page ? Number(params.page) : 1,
    }),
    listEntityTypeOptions(session.schoolId),
    listUsersBySchool(session.schoolId),
    getSchoolDetails(),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  function buildPageHref(targetPage: number): string {
    const query = new URLSearchParams();
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    if (action) query.set("action", action);
    if (params.entityType) query.set("entityType", params.entityType);
    if (params.actorUserId) query.set("actorUserId", params.actorUserId);
    if (params.query) query.set("query", params.query);
    query.set("page", String(targetPage));
    return `/admin/audit?${query.toString()}`;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Audit Log</h1>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="startDate">From</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={params.startDate ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="endDate">To</Label>
          <Input id="endDate" name="endDate" type="date" defaultValue={params.endDate ?? ""} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="action">Action</Label>
          <select
            id="action"
            name="action"
            defaultValue={action}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="">All actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="SOFT_DELETE">Deactivate</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="entityType">Entity Type</Label>
          <select
            id="entityType"
            name="entityType"
            defaultValue={params.entityType ?? ""}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="">All entities</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="actorUserId">Actor</Label>
          <select
            id="actorUserId"
            name="actorUserId"
            defaultValue={params.actorUserId ?? ""}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="">All actors</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name ?? user.email}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="query">Search</Label>
          <Input
            id="query"
            name="query"
            defaultValue={params.query ?? ""}
            placeholder="Entity ID or type"
          />
        </div>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Timestamp</th>
            <th className="py-2">User</th>
            <th className="py-2">Action</th>
            <th className="py-2">Entity</th>
            <th className="py-2">Entity ID</th>
            <th className="py-2">School</th>
            <th className="py-2">Summary</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {result.items.map((event) => (
            <tr key={event.id} className="border-b">
              <td className="py-2 whitespace-nowrap">
                {new Date(event.timestamp).toLocaleString()}
              </td>
              <td className="py-2">{event.actorLabel}</td>
              <td className="py-2">{event.action}</td>
              <td className="py-2">{event.entityType}</td>
              <td className="py-2 font-mono text-xs">{event.entityId}</td>
              <td className="py-2">{schoolDetails?.name ?? "—"}</td>
              <td className="py-2">{event.summary}</td>
              <td className="py-2">
                <Link href={`/admin/audit/${event.id}`} className="text-primary underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
          {result.items.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-muted-foreground py-4 text-center">
                No audit events found.
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
          {result.page > 1 ? <Link href={buildPageHref(result.page - 1)}>Previous</Link> : null}
          {result.page < totalPages ? (
            <Link href={buildPageHref(result.page + 1)}>Next</Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
