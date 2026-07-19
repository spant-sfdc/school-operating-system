import { requirePermission, canManageUsers } from "@/lib/authorization";
import { listRoles } from "@/repositories/role";
import { createUserAction } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function CreateUserPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requirePermission(canManageUsers);
  const [roles, { error }] = await Promise.all([listRoles(), searchParams]);

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Create User</h1>

      <form action={createUserAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="roleId">Role</Label>
          <select
            id="roleId"
            name="roleId"
            required
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" maxLength={120} required />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="email">Login ID (email)</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" />
          <p className="text-muted-foreground text-xs">Required only for Teacher accounts.</p>
        </div>
        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
        <Button type="submit">Create user</Button>
      </form>
    </main>
  );
}
