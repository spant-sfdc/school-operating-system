import Link from "next/link";

import { requirePermission, canManageSystemSetup } from "@/lib/authorization";
import {
  checkSystemReadiness,
  getSchoolDetails,
  getBootstrapAdminDetails,
  getFrameworkConfig,
} from "@/services/system";
import { updateSchoolDetailsAction, finalizeSetupAction } from "@/app/admin/setup/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ReadinessRow({ label, ready, detail }: { label: string; ready: boolean; detail: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-2 text-sm last:border-b-0">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">{detail}</p>
      </div>
      <span className={ready ? "text-emerald-600" : "text-destructive"}>
        {ready ? "Ready" : "Not Ready"}
      </span>
    </div>
  );
}

export default async function SetupWizardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  await requirePermission(canManageSystemSetup);
  const { error, updated } = await searchParams;

  const [readiness, schoolDetails, bootstrapAdmin, frameworkConfig] = await Promise.all([
    checkSystemReadiness(),
    getSchoolDetails(),
    getBootstrapAdminDetails(),
    getFrameworkConfig(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">First-Time Setup</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        This deployment isn&apos;t marked as production-ready yet. Complete every step below, then
        finalize setup.
      </p>

      {error ? (
        <p role="alert" className="text-destructive mb-6 text-sm">
          {error}
        </p>
      ) : null}
      {updated ? (
        <p role="status" className="mb-6 text-sm text-emerald-600">
          School details updated.
        </p>
      ) : null}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Step 1 — System Verification</h2>
        <div className="rounded-md border p-4">
          <ReadinessRow
            label="Database"
            ready={readiness.database.ready}
            detail={readiness.database.detail}
          />
          <ReadinessRow
            label="Schema / Migrations"
            ready={readiness.schema.ready}
            detail={readiness.schema.detail}
          />
          <ReadinessRow
            label="Bootstrap Administrator"
            ready={readiness.bootstrap.ready}
            detail={readiness.bootstrap.detail}
          />
          <ReadinessRow
            label="Roles"
            ready={readiness.roles.ready}
            detail={readiness.roles.detail}
          />
          <ReadinessRow
            label="School"
            ready={readiness.school.ready}
            detail={readiness.school.detail}
          />
          <ReadinessRow
            label="Academic Year"
            ready={readiness.academicYear.ready}
            detail={readiness.academicYear.detail}
          />
          <ReadinessRow
            label="Authentication"
            ready={readiness.authentication.ready}
            detail={readiness.authentication.detail}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Step 2 — School Verification</h2>
        {schoolDetails ? (
          <form
            action={updateSchoolDetailsAction}
            className="flex flex-col gap-4 rounded-md border p-4"
          >
            <input type="hidden" name="schoolId" value={schoolDetails.schoolId} />
            <input type="hidden" name="academicYearId" value={schoolDetails.academicYearId} />
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">School Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={schoolDetails.name}
                required
                maxLength={200}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="affiliationBoard">Board</Label>
              <Input
                id="affiliationBoard"
                name="affiliationBoard"
                defaultValue={schoolDetails.affiliationBoard ?? ""}
                maxLength={100}
                placeholder="e.g. CBSE, ICSE, State Board"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="academicYearLabel">Academic Year</Label>
              <Input
                id="academicYearLabel"
                name="academicYearLabel"
                defaultValue={schoolDetails.academicYearLabel}
                required
                maxLength={20}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Status: {schoolDetails.status} (School) / {schoolDetails.academicYearStatus} (Academic
              Year)
            </p>
            <Button type="submit" className="w-fit">
              Save School Details
            </Button>
          </form>
        ) : (
          <p className="text-destructive text-sm">
            No School/Academic Year record exists yet — run the seed script before completing setup.
          </p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Step 3 — Bootstrap Verification</h2>
        {bootstrapAdmin ? (
          <div className="rounded-md border p-4">
            <dl className="mb-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{bootstrapAdmin.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Role</dt>
                <dd>{bootstrapAdmin.roleName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd>{bootstrapAdmin.isActive ? "Active" : "Deactivated"}</dd>
              </div>
            </dl>
            <Link href={`/admin/users/${bootstrapAdmin.id}/reset-password`}>
              <Button type="button" variant="outline">
                Reset Password
              </Button>
            </Link>
          </div>
        ) : (
          <p className="text-destructive text-sm">
            No Administrator account exists yet — run the seed script before completing setup.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Step 4 — Finalize Setup</h2>
        <div className="rounded-md border p-4">
          {frameworkConfig?.setupCompleted ? (
            <p className="text-sm">
              Setup was already completed on{" "}
              {frameworkConfig.setupCompletedAt
                ? new Date(frameworkConfig.setupCompletedAt).toLocaleString()
                : "an earlier date"}{" "}
              (framework v{frameworkConfig.frameworkVersion}). This page remains available for
              ongoing review — completing it again is not required.
            </p>
          ) : (
            <>
              <p className="text-muted-foreground mb-4 text-sm">
                {readiness.overallReady
                  ? "Every system readiness check is passing. Finalizing marks this deployment production-ready and hides this wizard from future visits."
                  : "Every check in Step 1 must be Ready before setup can be finalized."}
              </p>
              <form action={finalizeSetupAction}>
                <Button type="submit" disabled={!readiness.overallReady}>
                  Finalize Setup
                </Button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
