import Link from "next/link";

import { requirePermission, canManagePromotions } from "@/lib/authorization";
import { listAcademicYearsBySchool } from "@/repositories/academicYear";
import { listSchoolClassesBySchool } from "@/repositories/schoolClass";
import { listSectionsByClassAndYear } from "@/repositories/section";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type SearchParams = {
  sourceYear?: string;
  schoolClassId?: string;
  targetYear?: string;
};

// Promotion Home (Sprint E11) — "how does a Principal move students into
// the next academic year safely." Picks Source Academic Year -> Class ->
// Section, plus a Target Academic Year, then hands off to the Review
// Workspace. A plain GET-based filter form, mirroring every other admin
// list's own established convention (Teacher/Student Directory) — no new
// interaction pattern invented for a picker screen.
export default async function PromotionHomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requirePermission(canManagePromotions);
  const params = await searchParams;

  const [academicYears, schoolClasses] = await Promise.all([
    listAcademicYearsBySchool(session.schoolId),
    listSchoolClassesBySchool(session.schoolId),
  ]);

  const sourceYearId = params.sourceYear ?? academicYears.find((y) => y.isCurrent)?.id ?? "";
  const sections =
    params.schoolClassId && sourceYearId
      ? await listSectionsByClassAndYear(params.schoolClassId, sourceYearId)
      : [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Promotion</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Review a section&apos;s students, record each promotion decision, and finalize into next
        year&apos;s enrollment.
      </p>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="sourceYear">Source Academic Year</Label>
          <select
            id="sourceYear"
            name="sourceYear"
            defaultValue={sourceYearId}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.label}
                {year.isCurrent ? " (current)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="schoolClassId">Class</Label>
          <select
            id="schoolClassId"
            name="schoolClassId"
            defaultValue={params.schoolClassId ?? ""}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="">Select a class</option>
            {schoolClasses.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="targetYear">Target Academic Year</Label>
          <select
            id="targetYear"
            name="targetYear"
            defaultValue={params.targetYear ?? ""}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="">Select the next year</option>
            {academicYears
              .filter((y) => y.id !== sourceYearId)
              .map((year) => (
                <option key={year.id} value={year.id}>
                  {year.label}
                </option>
              ))}
          </select>
        </div>
        <Button type="submit" variant="outline">
          Load Sections
        </Button>
      </form>

      {params.schoolClassId && sourceYearId ? (
        sections.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">Sections</h2>
            <div className="flex flex-wrap gap-3">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={`/admin/promotions/${params.schoolClassId}/${section.id}?sourceYear=${sourceYearId}${params.targetYear ? `&targetYear=${params.targetYear}` : ""}`}
                >
                  <Button type="button" variant="outline">
                    Section {section.name}
                  </Button>
                </Link>
              ))}
            </div>
            {!params.targetYear ? (
              <p className="text-muted-foreground mt-2 text-xs">
                Select a Target Academic Year above before finalizing any decision.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No sections exist for this class in the selected academic year.
          </p>
        )
      ) : null}
    </main>
  );
}
