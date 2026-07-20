import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { CHANGE_PASSWORD_PATH } from "@/lib/authorization";
import { isSetupComplete } from "@/services/system";

const SETUP_WIZARD_PATH = "/admin/setup";

// Route guard only — per ROUTES.md § Route Guards' already-documented "Admin
// guard" behavior, implemented for the first time this sprint. No dashboard
// content renders here yet ("do not build dashboards yet" — Sprint B1); this
// exists so every future page added under src/app/admin/ is protected from
// its first commit, not retrofitted later.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.accessLevel) {
    redirect("/login");
  }

  if (session.user.accessLevel !== "ADMIN") {
    redirect("/unauthorized");
  }

  // /change-password lives outside /admin and /teacher (top-level), so this
  // redirect can never loop back here — see src/app/change-password/page.tsx
  // and D-036. CHANGE_PASSWORD_PATH (not a literal) so this and
  // resolvePostLoginRedirect() (the login page's own post-sign-in decision)
  // can never drift apart — see D-038.
  if (session.user.mustChangePassword) {
    redirect(CHANGE_PASSWORD_PATH);
  }

  // First-Time Setup Wizard (Sprint B3) — every /admin/* route redirects
  // here until setup is finalized, except the wizard's own page (would
  // otherwise redirect to itself in a loop). x-pathname comes from
  // src/middleware.ts, the documented way a Server Component layout reads
  // the current path — see D-039.
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") ?? "";
  if (pathname !== SETUP_WIZARD_PATH && !(await isSetupComplete())) {
    redirect(SETUP_WIZARD_PATH);
  }

  return <>{children}</>;
}
