import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canManageAcademicStructure } from "@/lib/authorization";
import { findSchoolClassById } from "@/repositories/schoolClass";
import { listAllSectionsByClassAndYear } from "@/repositories/section";
import { listEnrollmentsBySection } from "@/repositories/enrollment";
import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { listSubjectsForSchoolClass } from "@/services/academic";
import { listGradeScalesBySchool } from "@/services/examination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateSchoolClassAction,
  deactivateSchoolClassAction,
  reactivateSchoolClassAction,
  createSectionAction,
  updateSectionAction,
  deactivateSectionAction,
  reactivateSectionAction,
  assignGradeScaleAction,
} from "@/app/admin/settings/classes/actions";

type PageParams = { id: string };
type SearchParams = Record<string, string | undefined>;

const MESSAGES: Record<string, string> = {
  updated: "Class updated.",
  deactivated: "Class deactivated.",
  reactivated: "Class reactivated.",
  sectionCreated: "Section created.",
  sectionUpdated: "Section updated.",
  sectionDeactivated: "Section deactivated.",
  sectionReactivated: "Section reactivated.",
  gradeScaleAssigned: "Grade scale assignment saved.",
};

/**
 * Class Detail (Sprint E13, Phase 5/6/7/12) — the single workspace for one
 * Class's own Sections, Subjects (read-only here; assignment lives on the
 * Subject Detail page — assignSubjectToClasses() reconciles one Subject's
 * classes at a time, not one Class's subjects at a time, so this page only
 * displays what's already assigned), and GradeScale (Phase 12 — the first
 * real UI for assignGradeScaleToSchoolClass(), Sprint E12's own named
 * unbuilt gap).
 */
export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await requirePermission(canManageAcademicStructure);
  const { id } = await params;
  const search = await searchParams;

  const schoolClass = await findSchoolClassById(id);
  if (!schoolClass || schoolClass.schoolId !== session.schoolId) {
    notFound();
  }

  const [currentYear, subjectLinks, gradeScales] = await Promise.all([
    findCurrentAcademicYear(session.schoolId),
    listSubjectsForSchoolClass(id, session.schoolId),
    listGradeScalesBySchool(session.schoolId),
  ]);

  const sections = currentYear ? await listAllSectionsByClassAndYear(id, currentYear.id) : [];
  const sectionEnrollmentCounts = await Promise.all(
    sections.map((s) => (currentYear ? listEnrollmentsBySection(s.id, currentYear.id) : [])),
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/admin/settings/classes"
        className="text-primary mb-4 inline-block text-sm underline"
      >
        &larr; Classes
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{schoolClass.name}</h1>
        <span className="text-muted-foreground text-sm">
          {schoolClass.deletedAt ? "Inactive" : "Active"}
        </span>
      </div>

      {search.error ? <p className="mb-4 text-sm text-red-600">{search.error}</p> : null}
      {Object.keys(MESSAGES).map((key) =>
        search[key] ? (
          <p key={key} className="mb-4 text-sm text-green-600">
            {MESSAGES[key]}
          </p>
        ) : null,
      )}

      <section className="mb-8 border-b pb-6">
        <h2 className="mb-3 text-lg font-semibold">Details</h2>
        <form action={updateSchoolClassAction} className="mb-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="schoolClassId" value={schoolClass.id} />
          <div className="flex flex-col gap-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={schoolClass.name}
              required
              className="w-40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={schoolClass.sortOrder}
              className="w-20"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Save
          </Button>
        </form>
        {schoolClass.deletedAt ? (
          <form action={reactivateSchoolClassAction}>
            <input type="hidden" name="schoolClassId" value={schoolClass.id} />
            <Button type="submit" variant="outline" size="sm">
              Reactivate Class
            </Button>
          </form>
        ) : (
          <form action={deactivateSchoolClassAction}>
            <input type="hidden" name="schoolClassId" value={schoolClass.id} />
            <Button type="submit" variant="outline" size="sm">
              Deactivate Class
            </Button>
          </form>
        )}
      </section>

      <section className="mb-8 border-b pb-6">
        <h2 className="mb-3 text-lg font-semibold">Grade Scale</h2>
        <p className="text-muted-foreground mb-2 text-sm">
          The GradeScale this Class&apos;s Report Cards resolve grades against.
        </p>
        <form action={assignGradeScaleAction} className="flex items-end gap-3">
          <input type="hidden" name="schoolClassId" value={schoolClass.id} />
          <div className="flex flex-col gap-1">
            <Label htmlFor="gradeScaleId">Grade Scale</Label>
            <select
              id="gradeScaleId"
              name="gradeScaleId"
              defaultValue={schoolClass.gradeScaleId ?? ""}
              className="border-input bg-background h-8 rounded-md border px-2 text-sm"
            >
              <option value="">None</option>
              {gradeScales.map((gs) => (
                <option key={gs.id} value={gs.id}>
                  {gs.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="outline" size="sm">
            Save
          </Button>
        </form>
        {gradeScales.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-xs">
            No grade scales exist yet — create one under Examinations.
          </p>
        ) : null}
      </section>

      <section className="mb-8 border-b pb-6">
        <h2 className="mb-3 text-lg font-semibold">Subjects</h2>
        {subjectLinks.length > 0 ? (
          <ul className="mb-2 text-sm">
            {subjectLinks.map((link) => (
              <li key={link.id}>{link.subject.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mb-2 text-sm">
            No subjects assigned to this class yet.
          </p>
        )}
        <Link href="/admin/settings/subjects" className="text-primary text-sm underline">
          Manage subject assignments
        </Link>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Sections</h2>
        {!currentYear ? (
          <p className="text-muted-foreground text-sm">No current Academic Year is active.</p>
        ) : (
          <>
            <form action={createSectionAction} className="mb-4 flex flex-wrap items-end gap-3">
              <input type="hidden" name="schoolClassId" value={schoolClass.id} />
              <div className="flex flex-col gap-1">
                <Label htmlFor="newSectionName">Name</Label>
                <Input id="newSectionName" name="name" placeholder="A" required className="w-20" />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="newSectionCapacity">Capacity</Label>
                <Input
                  id="newSectionCapacity"
                  name="capacity"
                  type="number"
                  min={1}
                  className="w-24"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                Add Section
              </Button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full min-w-140 border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2">Name</th>
                    <th className="py-2">Capacity</th>
                    <th className="py-2">Enrolled</th>
                    <th className="py-2">Status</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section, i) => (
                    <tr key={section.id} className="border-b align-top">
                      <td className="py-2 font-medium">{section.name}</td>
                      <td className="py-2">{section.capacity ?? "—"}</td>
                      <td className="py-2">{sectionEnrollmentCounts[i]?.length ?? 0}</td>
                      <td className="py-2">{section.deletedAt ? "Inactive" : "Active"}</td>
                      <td className="py-2">
                        <details>
                          <summary className="text-primary cursor-pointer underline">
                            Manage
                          </summary>
                          <div className="mt-2 flex flex-col gap-2">
                            <form action={updateSectionAction} className="flex items-end gap-2">
                              <input type="hidden" name="schoolClassId" value={schoolClass.id} />
                              <input type="hidden" name="sectionId" value={section.id} />
                              <Input
                                name="name"
                                defaultValue={section.name}
                                required
                                className="w-16"
                              />
                              <Input
                                name="capacity"
                                type="number"
                                min={1}
                                defaultValue={section.capacity ?? undefined}
                                className="w-20"
                              />
                              <Button type="submit" variant="outline" size="sm">
                                Save
                              </Button>
                            </form>
                            {section.deletedAt ? (
                              <form action={reactivateSectionAction}>
                                <input type="hidden" name="schoolClassId" value={schoolClass.id} />
                                <input type="hidden" name="sectionId" value={section.id} />
                                <Button type="submit" variant="outline" size="sm">
                                  Reactivate
                                </Button>
                              </form>
                            ) : (
                              <form action={deactivateSectionAction}>
                                <input type="hidden" name="schoolClassId" value={schoolClass.id} />
                                <input type="hidden" name="sectionId" value={section.id} />
                                <Button type="submit" variant="outline" size="sm">
                                  Deactivate
                                </Button>
                              </form>
                            )}
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                  {sections.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-muted-foreground py-4 text-center">
                        No sections exist for this class this year.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
