import { requirePermission, canManageConfiguration } from "@/lib/authorization";
import { getSchoolConfiguration, getConfigurationSummary } from "@/services/configuration";
import { getFrameworkConfig } from "@/services/system";
import { updateConfigurationAction } from "@/app/admin/configuration/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUS_STYLES: Record<string, string> = {
  Configured: "text-emerald-600",
  Missing: "text-muted-foreground",
  Placeholder: "text-amber-600",
  NeedsAttention: "text-destructive",
};

function StatusBadge({ status }: { status: string }) {
  return <span className={STATUS_STYLES[status] ?? ""}>{status}</span>;
}

function Field({
  id,
  label,
  defaultValue,
  type = "text",
}: {
  id: string;
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} defaultValue={defaultValue} maxLength={500} />
    </div>
  );
}

// Server Component, reuses the Client Configuration Service's own
// getSchoolConfiguration()/getConfigurationSummary() — no client-side
// filtering, matching this sprint's own "Server Components wherever
// possible" instruction.
export default async function ConfigurationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  await requirePermission(canManageConfiguration);
  const { error, updated } = await searchParams;

  const [config, summary, frameworkConfig] = await Promise.all([
    getSchoolConfiguration(),
    getConfigurationSummary(),
    getFrameworkConfig(),
  ]);

  const readOnlyFields = summary.fields.filter((f) => !f.editable);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Configuration</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {summary.completionPercent}% configured ({summary.configuredCount}/{summary.totalFields}) —{" "}
        {summary.needsAttentionCount} need attention, {summary.missingCount} missing,{" "}
        {summary.placeholderCount} placeholder.
      </p>

      {error ? (
        <p role="alert" className="text-destructive mb-6 text-sm">
          {error}
        </p>
      ) : null}
      {updated ? (
        <p role="status" className="mb-6 text-sm text-emerald-600">
          Configuration updated.
        </p>
      ) : null}

      {config ? (
        <form action={updateConfigurationAction} className="mb-8 flex flex-col gap-6">
          <input type="hidden" name="schoolId" value={config.schoolId} />
          <input type="hidden" name="academicYearId" value={config.academicYearId} />

          <section>
            <h2 className="mb-3 text-lg font-semibold">School Identity</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="name" label="School Name" defaultValue={config.name} />
              <Field id="shortName" label="Short Name" defaultValue={config.shortName ?? ""} />
              <Field id="tagline" label="Tagline" defaultValue={config.tagline ?? ""} />
              <Field
                id="affiliationBoard"
                label="Board"
                defaultValue={config.affiliationBoard ?? ""}
              />
              <Field id="medium" label="Medium of Instruction" defaultValue={config.medium ?? ""} />
              <Field
                id="principalName"
                label="Principal Name"
                defaultValue={config.principalName ?? ""}
              />
              <Field
                id="principalTitle"
                label="Principal Title"
                defaultValue={config.principalTitle ?? ""}
              />
              <Field
                id="email"
                label="Contact Email"
                defaultValue={config.email ?? ""}
                type="email"
              />
              <Field
                id="phone"
                label="Contact Phone"
                defaultValue={config.phone ?? ""}
                type="tel"
              />
              <Field id="address" label="Address" defaultValue={config.address ?? ""} />
              <Field id="logoUrl" label="Logo URL" defaultValue={config.logoUrl ?? ""} type="url" />
              <Field
                id="faviconUrl"
                label="Favicon URL"
                defaultValue={config.faviconUrl ?? ""}
                type="url"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Academic</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="academicYearLabel"
                label="Academic Year"
                defaultValue={config.academicYearLabel}
              />
              <Field
                id="schoolTimings"
                label="School Timings"
                defaultValue={config.schoolTimings ?? ""}
              />
              <Field
                id="officeTimings"
                label="Office Timings"
                defaultValue={config.officeTimings ?? ""}
              />
            </div>
          </section>

          <Button type="submit" className="w-fit">
            Save Configuration
          </Button>
        </form>
      ) : (
        <p className="text-destructive mb-8 text-sm">
          No School/Academic Year record exists yet — run the seed script first.
        </p>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Theme, Website &amp; Social</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Framework/website-owned — not editable here (see each field&apos;s own note).
        </p>
        <div className="rounded-md border p-4">
          {readOnlyFields.map((f) => (
            <div
              key={f.key}
              className="flex flex-col gap-0.5 border-b py-2 text-sm last:border-b-0"
            >
              <div className="flex justify-between">
                <span>{f.label}</span>
                <StatusBadge status={f.status} />
              </div>
              {f.note ? <span className="text-muted-foreground text-xs">{f.note}</span> : null}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">System</h2>
        <dl className="rounded-md border p-4 text-sm">
          <div className="flex justify-between border-b py-2">
            <dt className="text-muted-foreground">Framework Version</dt>
            <dd>{frameworkConfig?.frameworkVersion ?? "—"}</dd>
          </div>
          <div className="flex justify-between border-b py-2">
            <dt className="text-muted-foreground">Setup Date</dt>
            <dd>
              {frameworkConfig?.setupCompletedAt
                ? new Date(frameworkConfig.setupCompletedAt).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between border-b py-2">
            <dt className="text-muted-foreground">Database Version</dt>
            <dd className="max-w-xs truncate">{frameworkConfig?.databaseVersion ?? "—"}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-muted-foreground">Configuration Status</dt>
            <dd>
              {summary.needsAttentionCount > 0
                ? `${summary.needsAttentionCount} field(s) need attention`
                : "All high-priority fields configured"}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
