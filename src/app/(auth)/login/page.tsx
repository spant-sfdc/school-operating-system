import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Intentionally minimal — Sprint B1's own scope ("build only the minimum
// pages required... we will redesign later"). Not wired to the "already
// authenticated → redirect to /admin or /teacher" behavior ROUTES.md § 2
// documents: there is no role-specific dashboard to redirect to yet ("do not
// build dashboards yet"), so an already-authenticated user can still reach
// this page for now. A future sprint adding real dashboards should close
// this gap, not inherit it silently.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";

    const callbackUrl = formData.get("callbackUrl");
    const redirectTo = typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/";

    try {
      await signIn("credentials", {
        loginId: formData.get("loginId"),
        password: formData.get("password"),
        redirectTo,
      });
    } catch (error) {
      // Auth.js's own successful-sign-in redirect is implemented by
      // throwing internally too — only an actual AuthError means the
      // credentials were rejected. Anything else must be re-thrown so
      // Next.js's own redirect still completes.
      if (error instanceof AuthError) {
        const retryUrl = new URL("/login", "http://placeholder");
        retryUrl.searchParams.set("error", "1");
        if (redirectTo !== "/") retryUrl.searchParams.set("callbackUrl", redirectTo);
        redirect(`${retryUrl.pathname}${retryUrl.search}`);
      }
      throw error;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Administrator, Principal, or Teacher accounts only.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="flex flex-col gap-4">
            <input type="hidden" name="callbackUrl" value={params.callbackUrl ?? ""} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="loginId">Login ID</Label>
              <Input id="loginId" name="loginId" type="email" autoComplete="username" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {params.error ? (
              <p role="alert" className="text-destructive text-sm">
                Incorrect Login ID or password.
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
