import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { signIn } from "@/lib/auth";
import { resolvePostLoginRedirect } from "@/lib/authorization";
import { authenticateUser, InvalidCredentialsError } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Intentionally minimal — Sprint B1's own scope ("build only the minimum
// pages required... we will redesign later"). The POST-login destination is
// now correctly role-aware (resolvePostLoginRedirect(), D-038); this page's
// own GET handler still does not check for an already-authenticated visitor
// and redirect them away before they see the form — a separate, still-open
// gap (an authenticated user can still reach /login and re-submit), not
// inherited silently, just not this fix's scope.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";

    const callbackUrlValue = formData.get("callbackUrl");
    const callbackUrl =
      typeof callbackUrlValue === "string" && callbackUrlValue ? callbackUrlValue : undefined;

    const loginId = formData.get("loginId");
    const password = formData.get("password");

    try {
      // A pre-flight authenticateUser() call — the SAME function the
      // Credentials provider's own authorize() calls internally
      // (src/lib/auth/config.ts) — computes the correct destination BEFORE
      // signIn() runs. This is necessary, not just cleaner: calling auth()
      // immediately after signIn({redirect:false}) in this same Server
      // Action does NOT observe the just-set session cookie in this
      // Next.js version (confirmed by direct testing, not assumed) — see
      // docs/DECISIONS.md's Sprint B2.1 entry (D-038) for the full trace.
      // resolvePostLoginRedirect() is still the single place the
      // destination is computed; this is its one call site.
      const authenticated = await authenticateUser({
        loginId: typeof loginId === "string" ? loginId : "",
        password: typeof password === "string" ? password : "",
      });

      await signIn("credentials", {
        loginId,
        password,
        redirectTo: resolvePostLoginRedirect(authenticated, callbackUrl),
      });
    } catch (error) {
      // authenticateUser() throws InvalidCredentialsError; signIn()'s own
      // internal authorize() call throws CredentialsSignin (an AuthError
      // subclass) if it independently disagrees (e.g. a race between the
      // two checks) — both are handled identically here. Auth.js's own
      // successful-sign-in redirect is implemented by throwing internally
      // too (NEXT_REDIRECT), so anything else must be re-thrown for
      // Next.js's own navigation to complete.
      if (error instanceof InvalidCredentialsError || error instanceof AuthError) {
        const retryUrl = new URL("/login", "http://placeholder");
        retryUrl.searchParams.set("error", "1");
        if (callbackUrl) retryUrl.searchParams.set("callbackUrl", callbackUrl);
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
