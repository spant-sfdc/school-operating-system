import Link from "next/link";

import { auth } from "@/lib/auth";
import { checkSystemReadiness, getSchoolDetails } from "@/services/system";
import { Button } from "@/components/ui/button";

// Not a dashboard — no charts, no analytics (Sprint B3's own "not
// beautiful, functional" instruction). A status summary plus links to
// every real feature built so far.
export default async function AdminHomePage() {
  const session = await auth();
  const [readiness, schoolDetails] = await Promise.all([
    checkSystemReadiness(),
    getSchoolDetails(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Admin Home</h1>

      <dl className="mb-8 flex flex-col gap-2 rounded-md border p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">System Ready</dt>
          <dd className={readiness.overallReady ? "text-emerald-600" : "text-destructive"}>
            {readiness.overallReady ? "Yes" : "No"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Framework Version</dt>
          <dd>{readiness.version}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Current School</dt>
          <dd>{schoolDetails?.name ?? "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Current Academic Year</dt>
          <dd>{schoolDetails?.academicYearLabel ?? "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Current User</dt>
          <dd>
            {session?.user?.name ?? session?.user?.email} ({session?.user?.roleName})
          </dd>
        </div>
      </dl>

      <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/users/new">
          <Button type="button" variant="outline">
            Create User
          </Button>
        </Link>
        <Link href="/admin/users">
          <Button type="button" variant="outline">
            Manage Users
          </Button>
        </Link>
        <Link href="/admin/setup">
          <Button type="button" variant="outline">
            System Setup
          </Button>
        </Link>
        <Link href="/admin/system">
          <Button type="button" variant="outline">
            Developer Information
          </Button>
        </Link>
      </div>
    </main>
  );
}
