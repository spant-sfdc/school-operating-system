import Link from "next/link";

import { requirePermission, canManageAcademicStructure } from "@/lib/authorization";
import { listAllSchoolClassesBySchool } from "@/repositories/schoolClass";
import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSchoolClassAction } from "@/app/admin/settings/classes/actions";

/**
 * Class Directory (Sprint E13, Phase 5). Lists every class — active and
 * deactivated — per listAllSchoolClassesBySchool()'s own comment: a
 * deactivated class must stay visible here, or deactivation would have no
 * path back to reactivation.
 */
export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const session = await requirePermission(canManageAcademicStructure);
  const params = await searchParams;
  const [schoolClasses, currentYear] = await Promise.all([
    listAllSchoolClassesBySchool(session.schoolId),
    findCurrentAcademicYear(session.schoolId),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Classes</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        A Class is a permanent, school-wide structure — not scoped to any one academic year.
      </p>

      {params.error ? <p className="mb-4 text-sm text-red-600">{params.error}</p> : null}
      {params.created ? <p className="mb-4 text-sm text-green-600">Class created.</p> : null}

      {!currentYear ? (
        <p className="mb-6 text-sm text-red-600">
          No current Academic Year is active. Activate one under Academic Years before creating a
          Class (its first Sections are created for the current year).
        </p>
      ) : (
        <form
          action={createSchoolClassAction}
          className="mb-8 flex flex-wrap items-end gap-3 border-b pb-6"
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="className">Class Name</Label>
            <Input
              id="className"
              name="className"
              placeholder="Class 1"
              required
              className="w-36"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={0}
              className="w-20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="sectionNames">Sections (comma-separated)</Label>
            <Input
              id="sectionNames"
              name="sectionNames"
              placeholder="A, B"
              required
              className="w-36"
            />
          </div>
          <Button type="submit">Create Class</Button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-160 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Name</th>
              <th className="py-2">Sort Order</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {schoolClasses.map((schoolClass) => (
              <tr key={schoolClass.id} className="border-b">
                <td className="py-2 font-medium">{schoolClass.name}</td>
                <td className="py-2">{schoolClass.sortOrder}</td>
                <td className="py-2">{schoolClass.deletedAt ? "Inactive" : "Active"}</td>
                <td className="py-2">
                  <Link
                    href={`/admin/settings/classes/${schoolClass.id}`}
                    className="text-primary underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {schoolClasses.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted-foreground py-4 text-center">
                  No classes exist yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
