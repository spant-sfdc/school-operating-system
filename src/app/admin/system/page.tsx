import { requirePermission, canManageSystemSetup } from "@/lib/authorization";
import { checkSystemReadiness, getFrameworkConfig } from "@/services/system";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-2 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default async function DeveloperInformationPage() {
  await requirePermission(canManageSystemSetup);

  const [readiness, frameworkConfig] = await Promise.all([
    checkSystemReadiness(),
    getFrameworkConfig(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Developer Information</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Live System Readiness</h2>
        <dl className="rounded-md border p-4">
          <InfoRow
            label="Database"
            value={`${readiness.database.ready ? "Ready" : "Not Ready"} — ${readiness.database.detail}`}
          />
          <InfoRow
            label="Schema / Migrations"
            value={`${readiness.schema.ready ? "Ready" : "Not Ready"} — ${readiness.schema.detail}`}
          />
          <InfoRow
            label="Bootstrap Administrator"
            value={`${readiness.bootstrap.ready ? "Ready" : "Not Ready"} — ${readiness.bootstrap.detail}`}
          />
          <InfoRow
            label="Roles"
            value={`${readiness.roles.ready ? "Ready" : "Not Ready"} — ${readiness.roles.detail}`}
          />
          <InfoRow
            label="School"
            value={`${readiness.school.ready ? "Ready" : "Not Ready"} — ${readiness.school.detail}`}
          />
          <InfoRow
            label="Academic Year"
            value={`${readiness.academicYear.ready ? "Ready" : "Not Ready"} — ${readiness.academicYear.detail}`}
          />
          <InfoRow
            label="Authentication"
            value={`${readiness.authentication.ready ? "Ready" : "Not Ready"} — ${readiness.authentication.detail}`}
          />
          <InfoRow label="Running Version" value={readiness.version} />
          <InfoRow
            label="Overall"
            value={readiness.overallReady ? "Production Ready" : "Not Production Ready"}
          />
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Setup Record</h2>
        {frameworkConfig ? (
          <dl className="rounded-md border p-4">
            <InfoRow
              label="Setup Completed"
              value={frameworkConfig.setupCompleted ? "Yes" : "No"}
            />
            <InfoRow
              label="Setup Completed At"
              value={
                frameworkConfig.setupCompletedAt
                  ? new Date(frameworkConfig.setupCompletedAt).toLocaleString()
                  : "—"
              }
            />
            <InfoRow label="Setup Completed By" value={frameworkConfig.setupCompletedBy ?? "—"} />
            <InfoRow label="Framework Version at Setup" value={frameworkConfig.frameworkVersion} />
            <InfoRow
              label="Database Version at Setup"
              value={frameworkConfig.databaseVersion ?? "—"}
            />
            <InfoRow
              label="Migration Version at Setup"
              value={frameworkConfig.migrationVersion ?? "—"}
            />
          </dl>
        ) : (
          <p className="text-muted-foreground text-sm">Setup has not been finalized yet.</p>
        )}
      </section>
    </main>
  );
}
