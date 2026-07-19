import { requireSession } from "@/lib/authorization";
import { changePasswordAction } from "@/app/change-password/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Top-level, not under /admin or /teacher — both Administrators and
// Teachers can land here (mustChangePassword applies to any account with a
// temporary password), and it must be reachable before either segment's
// own role-specific layout guard would otherwise redirect back here in a
// loop. Only requires *a* valid session (requireSession()), not a specific
// accessLevel.
export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireSession();
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Change your password</CardTitle>
          <CardDescription>You must set a new password before continuing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={changePasswordAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="currentPassword">Current (temporary) password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            {error ? (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Change password
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
