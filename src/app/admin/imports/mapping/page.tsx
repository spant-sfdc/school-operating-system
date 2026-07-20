import { redirect } from "next/navigation";

import type { ImportEntityType } from "@/generated/prisma/enums";
import { requirePermission, canManageImports } from "@/lib/authorization";
import {
  getPendingImportPreview,
  confirmImportMapping,
  getImportProfile,
  getSavedColumnMapping,
  IMPORT_PROFILES,
  isImportTypeSupported,
} from "@/services/import";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// The Detect + Smart Column Mapping stage — Import Type is pre-selected
// from Upload's own deterministic Detection, editable here; each column's
// target field is pre-filled from the Saved Mapping Template (this
// school's own prior import of the same type) or, failing that, the
// profile's alias dictionary — never a blank form the Admin has to fill
// in from scratch on a school's first import of a given type. Data
// Profiling's own Import Health Summary is shown here too, before the
// Admin commits to a mapping, per this sprint's own "Data Profiling"
// requirement.
export default async function ImportMappingPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string; error?: string }>;
}) {
  const session = await requirePermission(canManageImports);
  const params = await searchParams;

  if (!params.batchId) redirect("/admin/imports/upload");

  const pending = await getPendingImportPreview(params.batchId);
  if (!pending) {
    // Either the batch doesn't exist, or mapping was already confirmed —
    // either way, Preview is the correct next stop, not a stale form.
    redirect(`/admin/imports/preview?batchId=${params.batchId}`);
  }

  const profile = getImportProfile(pending.batch.importType);
  const suggestedMapping = profile
    ? await getSavedColumnMapping(
        session.schoolId,
        pending.batch.importType,
        pending.columns,
        profile,
      )
    : {};

  async function confirmMappingAction(formData: FormData) {
    "use server";

    const batchId = formData.get("batchId");
    const importTypeValue = formData.get("importType");
    if (typeof batchId !== "string" || typeof importTypeValue !== "string") {
      redirect(`/admin/imports/mapping?batchId=${params.batchId}&error=Invalid+form+submission`);
    }
    const importType = importTypeValue as ImportEntityType;

    const columnMapping: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("mapping__") && typeof value === "string" && value) {
        columnMapping[key.slice("mapping__".length)] = value;
      }
    }

    // redirect() throws internally (Next.js's own NEXT_REDIRECT signal) —
    // only the call that can genuinely fail belongs inside try/catch; the
    // success redirect() must live outside it, or Next's own navigation
    // throw gets mistaken for a real error here (confirmed live: an
    // earlier version of this action redirected to
    // "...&error=NEXT_REDIRECT" on every successful submission).
    try {
      await confirmImportMapping(
        {
          batchId: batchId as string,
          schoolId: session.schoolId,
          importType,
          columnMapping,
        },
        session.userId,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Mapping failed.";
      redirect(`/admin/imports/mapping?batchId=${batchId}&error=${encodeURIComponent(message)}`);
    }

    redirect(`/admin/imports/preview?batchId=${batchId}`);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Map Columns</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {pending.batch.sourceFileName} — {pending.rowCount} row(s), {pending.columns.length}{" "}
        column(s).
      </p>

      <section className="mb-6 rounded-md border p-4">
        <h2 className="mb-2 text-sm font-semibold">Import Health Summary</h2>
        <p className="text-sm">
          Quality Score: <strong>{pending.health.qualityScore}</strong> (
          {pending.health.summaryLabel})
        </p>
        {pending.health.warnings.length > 0 ? (
          <ul className="text-muted-foreground mt-2 list-disc pl-5 text-sm">
            {pending.health.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <form action={confirmMappingAction} className="flex flex-col gap-4">
        <input type="hidden" name="batchId" value={pending.batch.id} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="importType">Import Type</Label>
          <select
            id="importType"
            name="importType"
            defaultValue={pending.batch.importType}
            className="border-input bg-background h-8 w-fit rounded-md border px-2 text-sm"
          >
            {IMPORT_PROFILES.map((option) => (
              <option key={option.importType} value={option.importType}>
                {option.label}{" "}
                {isImportTypeSupported(option.importType) ? "" : "(not yet supported)"}
              </option>
            ))}
          </select>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Source Column</th>
              <th className="py-2">Sample Value</th>
              <th className="py-2">Maps To</th>
            </tr>
          </thead>
          <tbody>
            {pending.columns.map((column) => (
              <tr key={column} className="border-b">
                <td className="py-2">{column}</td>
                <td className="text-muted-foreground py-2">
                  {String(pending.sampleRow?.[column] ?? "—")}
                </td>
                <td className="py-2">
                  <input
                    type="text"
                    name={`mapping__${column}`}
                    defaultValue={suggestedMapping[column] ?? ""}
                    placeholder="(ignore this column)"
                    className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {params.error ? (
          <p role="alert" className="text-destructive text-sm">
            {params.error}
          </p>
        ) : null}

        <Button type="submit" className="w-fit">
          Continue to Preview
        </Button>
      </form>
    </main>
  );
}
