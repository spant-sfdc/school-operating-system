import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// The interim redirect target for "authenticated but wrong role" until
// role-specific dashboards exist — ROUTES.md § Route Guards documents the
// eventual behavior as "redirect to their own role's landing page," which
// this sprint cannot build yet ("do not build dashboards yet"). A future
// sprint building real dashboards should reconcile this page with that
// documented behavior, not treat this as the permanent design.
export default function UnauthorizedPage() {
  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
          <CardDescription>Your account does not have access to this page.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" className="w-full">
              Log out
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
