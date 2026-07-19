import { notFound } from "next/navigation";

import { requirePermission, canManageUsers } from "@/lib/authorization";
import { getUserAccountDetails } from "@/services/administration";
import { listRoles } from "@/repositories/role";
import { editUserAction } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requirePermission(canManageUsers);
  const { id } = await params;
  const { error } = await searchParams;

  const user = await getUserAccountDetails(id);
  if (!user) {
    notFound();
  }

  const roles = await listRoles();
  const isSelf = user.id === session.userId;

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit User</h1>

      <form action={editUserAction.bind(null, user.id)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" defaultValue={user.name ?? ""} maxLength={120} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="roleId">Role</Label>
          <select
            id="roleId"
            name="roleId"
            defaultValue={user.roleId}
            disabled={isSelf}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm disabled:opacity-50"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {isSelf ? (
            <p className="text-muted-foreground text-xs">You cannot change your own role.</p>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
        <Button type="submit">Save</Button>
      </form>
    </main>
  );
}
