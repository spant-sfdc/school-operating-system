import Link from "next/link";

import { requirePermission, canManageUsers } from "@/lib/authorization";
import { searchUserAccounts } from "@/services/administration";
import { listRoles } from "@/repositories/role";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type StatusFilter = "ACTIVE" | "DEACTIVATED" | "ALL";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; roleId?: string; status?: string; page?: string }>;
}) {
  const session = await requirePermission(canManageUsers);
  const params = await searchParams;
  const roles = await listRoles();

  const status: StatusFilter =
    params.status === "ACTIVE" || params.status === "DEACTIVATED" ? params.status : "ALL";

  const result = await searchUserAccounts({
    schoolId: session.schoolId,
    query: params.query,
    roleId: params.roleId,
    status,
    page: params.page ? Number(params.page) : 1,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  function buildPageHref(targetPage: number): string {
    const query = new URLSearchParams();
    if (params.query) query.set("query", params.query);
    if (params.roleId) query.set("roleId", params.roleId);
    if (status !== "ALL") query.set("status", status);
    query.set("page", String(targetPage));
    return `/admin/users?${query.toString()}`;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Link href="/admin/users/new">
          <Button type="button">Create User</Button>
        </Link>
      </div>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="query">Search</Label>
          <Input
            id="query"
            name="query"
            defaultValue={params.query ?? ""}
            placeholder="Name or email"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="roleId">Role</Label>
          <select
            id="roleId"
            name="roleId"
            defaultValue={params.roleId ?? ""}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {result.items.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="py-2">{user.name ?? "—"}</td>
              <td className="py-2">{user.email}</td>
              <td className="py-2">{user.roleName}</td>
              <td className="py-2">{user.isActive ? "Active" : "Deactivated"}</td>
              <td className="py-2">
                <Link href={`/admin/users/${user.id}`} className="text-primary underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
          {result.items.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-muted-foreground py-4 text-center">
                No users found.
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
