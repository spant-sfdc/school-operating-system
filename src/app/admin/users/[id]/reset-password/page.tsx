import { notFound } from "next/navigation";

import { requirePermission, canManageUsers } from "@/lib/authorization";
import { getUserAccountDetails } from "@/services/administration";
import { resetPasswordAction } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requirePermission(canManageUsers);
  const [{ id }, { error }] = await Promise.all([params, searchParams]);

  const user = await getUserAccountDetails(id);
  if (!user) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Reset Password</h1>
      <p className="mb-6 text-sm">
        This generates a new temporary password for <strong>{user.email}</strong> and requires them
        to change it on next login.
      </p>
      <form action={resetPasswordAction.bind(null, user.id)}>
        {error ? (
          <p role="alert" className="text-destructive mb-4 text-sm">
            {error}
          </p>
        ) : null}
        <Button type="submit" variant="destructive">
          Generate new temporary password
        </Button>
      </form>
    </main>
  );
}
