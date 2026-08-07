import { requirePermission, canManageAcademicStructure } from "@/lib/authorization";
import { listAcademicYearsBySchool } from "@/repositories/academicYear";
import { formatEnumLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAcademicYearAction,
  updateAcademicYearAction,
  activateAcademicYearAction,
  setAcademicYearStatusAction,
} from "@/app/admin/settings/academic-years/actions";

function toDateInputValue(value: Date | string): string {
  return new Date(value).toISOString().slice(0, 10);
}

/**
 * Academic Year Management (Sprint E13, Phase 4) — Create/Edit/Activate/
 * Close-Reopen/List. Plain `<form action={...}>` submissions, matching
 * /admin/configuration's own established convention (redirect back to this
 * page after each mutation re-runs this Server Component, so no client
 * state or manual refresh is needed) — not the client-side useState grid
 * PromotionReviewGrid.tsx uses for its own genuinely different "collect
 * many rows before one bulk submit" interaction.
 */
export default async function AcademicYearsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; updated?: string; activated?: string }>;
}) {
  const session = await requirePermission(canManageAcademicStructure);
  const params = await searchParams;
  const academicYears = await listAcademicYearsBySchool(session.schoolId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Academic Years</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Exactly one Academic Year is current at a time. Activating a year automatically deactivates
        the previously current one.
      </p>

      {params.error ? <p className="mb-4 text-sm text-red-600">{params.error}</p> : null}
      {params.created ? (
        <p className="mb-4 text-sm text-green-600">Academic year created.</p>
      ) : null}
      {params.updated ? (
        <p className="mb-4 text-sm text-green-600">Academic year updated.</p>
      ) : null}
      {params.activated ? (
        <p className="mb-4 text-sm text-green-600">Academic year activated.</p>
      ) : null}

      <form
        action={createAcademicYearAction}
        className="mb-8 flex flex-wrap items-end gap-3 border-b pb-6"
      >
        <div className="flex flex-col gap-1">
          <Label htmlFor="label">Label</Label>
          <Input id="label" name="label" placeholder="2027-28" required className="w-32" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" name="startDate" type="date" required />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" name="endDate" type="date" required />
        </div>
        <Button type="submit">Create Academic Year</Button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-160 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Label</th>
              <th className="py-2">Start</th>
              <th className="py-2">End</th>
              <th className="py-2">Current</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {academicYears.map((year) => (
              <tr key={year.id} className="border-b align-top">
                <td className="py-2 font-medium">{year.label}</td>
                <td className="py-2">{toDateInputValue(year.startDate)}</td>
                <td className="py-2">{toDateInputValue(year.endDate)}</td>
                <td className="py-2">{year.isCurrent ? "Yes" : "—"}</td>
                <td className="py-2">{formatEnumLabel(year.status)}</td>
                <td className="py-2">
                  <details>
                    <summary className="text-primary cursor-pointer underline">Manage</summary>
                    <div className="mt-3 flex flex-col gap-3">
                      <form
                        action={updateAcademicYearAction}
                        className="flex flex-wrap items-end gap-2"
                      >
                        <input type="hidden" name="academicYearId" value={year.id} />
                        <div className="flex flex-col gap-1">
                          <Label htmlFor={`label-${year.id}`}>Label</Label>
                          <Input
                            id={`label-${year.id}`}
                            name="label"
                            defaultValue={year.label}
                            required
                            className="w-28"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label htmlFor={`start-${year.id}`}>Start</Label>
                          <Input
                            id={`start-${year.id}`}
                            name="startDate"
                            type="date"
                            defaultValue={toDateInputValue(year.startDate)}
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label htmlFor={`end-${year.id}`}>End</Label>
                          <Input
                            id={`end-${year.id}`}
                            name="endDate"
                            type="date"
                            defaultValue={toDateInputValue(year.endDate)}
                            required
                          />
                        </div>
                        <Button type="submit" variant="outline" size="sm">
                          Save
                        </Button>
                      </form>

                      {!year.isCurrent ? (
                        <form action={activateAcademicYearAction}>
                          <input type="hidden" name="academicYearId" value={year.id} />
                          <Button type="submit" variant="outline" size="sm">
                            Make Current
                          </Button>
                        </form>
                      ) : null}

                      <form action={setAcademicYearStatusAction}>
                        <input type="hidden" name="academicYearId" value={year.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={year.status === "ACTIVE" ? "CLOSED" : "ACTIVE"}
                        />
                        <Button type="submit" variant="outline" size="sm">
                          {year.status === "ACTIVE" ? "Close" : "Reopen"}
                        </Button>
                      </form>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {academicYears.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted-foreground py-4 text-center">
                  No academic years exist yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
