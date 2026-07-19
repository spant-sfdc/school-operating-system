import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

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

  return <>{children}</>;
}
