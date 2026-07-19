import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { CHANGE_PASSWORD_PATH } from "@/lib/authorization";

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

  return <>{children}</>;
}
