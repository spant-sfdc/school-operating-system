import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canManageUsers } from "@/lib/authorization";
import { getUserAccountDetails } from "@/services/administration";
import {
  activateUserAction,
  deactivateUserAction,
  readTemporaryPasswordFlash,
} from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";

export default async function UserDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await requirePermission(canManageUsers);
  const [{ id }, { created }] = await Promise.all([params, searchParams]);

  const user = await getUserAccountDetails(id);
  if (!user) {
    notFound();
  }

  const isSelf = user.id === session.userId;
  // Only read (never re-set) the flash cookie — a plain page render must
  // not mutate cookies. It naturally stops appearing once its own
  // short maxAge elapses; see actions.ts's setTemporaryPasswordFlash().
  const temporaryPassword = created === "1" ? await readTemporaryPasswordFlash() : undefined;

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">{user.name ?? user.email}</h1>

      {temporaryPassword ? (
        <div
          role="alert"
          className="border-primary bg-primary/5 mb-6 flex flex-col gap-1 rounded-md border p-4 text-sm"
        >
          <p className="font-medium">Temporary password (shown once)</p>
          <p className="font-mono text-base">{temporaryPassword}</p>
          <p className="text-muted-foreground text-xs">
            Share this with {user.name ?? user.email} through a secure channel. It will not be shown
            again — reload this page and it disappears.
          </p>
        </div>
      ) : null}

      <dl className="mb-6 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Login ID</dt>
          <dd>{user.email}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Role</dt>
          <dd>{user.roleName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Status</dt>
          <dd>{user.isActive ? "Active" : "Deactivated"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Must change password</dt>
          <dd>{user.mustChangePassword ? "Yes" : "No"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Created</dt>
          <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <Link href={`/admin/users/${user.id}/edit`}>
          <Button type="button" variant="outline">
            Edit
          </Button>
        </Link>
        <Link href={`/admin/users/${user.id}/reset-password`}>
          <Button type="button" variant="outline">
            Reset password
          </Button>
        </Link>
        {!isSelf && user.isActive ? (
          <form action={deactivateUserAction.bind(null, user.id)}>
            <Button type="submit" variant="destructive">
              Deactivate
            </Button>
          </form>
        ) : null}
        {!isSelf && !user.isActive ? (
          <form action={activateUserAction.bind(null, user.id)}>
            <Button type="submit" variant="outline">
              Activate
            </Button>
          </form>
        ) : null}
        {isSelf ? (
          <p className="text-muted-foreground self-center text-xs">
            You cannot deactivate your own account.
          </p>
        ) : null}
      </div>

      <p className="mt-6 text-sm">
        <Link href="/admin/users" className="text-primary underline">
          ← Back to Users
        </Link>
      </p>
    </main>
  );
}
