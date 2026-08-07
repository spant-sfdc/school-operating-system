import { requirePermission, canManageAcademicStructure } from "@/lib/authorization";
import { listAllSubjectsBySchool } from "@/repositories/subject";
import { listSchoolClassesBySchool } from "@/repositories/schoolClass";
import { listClassesForSubject } from "@/repositories/classSubject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createSubjectAction,
  updateSubjectAction,
  deactivateSubjectAction,
  reactivateSubjectAction,
  assignSubjectToClassesAction,
} from "@/app/admin/settings/subjects/actions";

const MESSAGES: Record<string, string> = {
  created: "Subject created.",
  updated: "Subject updated.",
  deactivated: "Subject deactivated.",
  reactivated: "Subject reactivated.",
  assigned: "Class assignment saved.",
};

/**
 * Subject Directory (Sprint E13, Phase 7) — Create/Edit/Deactivate, plus
 * Class assignment inline per subject (assignSubjectToClasses() reconciles
 * one Subject's own set of Classes at a time — see actions.ts's own
 * comment — so this page, not the Class Detail page, is where the
 * assignment checkbox list lives).
 */
export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string } & Record<string, string | undefined>>;
}) {
  const session = await requirePermission(canManageAcademicStructure);
  const params = await searchParams;

  const [subjects, schoolClasses] = await Promise.all([
    listAllSubjectsBySchool(session.schoolId),
    listSchoolClassesBySchool(session.schoolId),
  ]);

  const assignedClassIdsBySubject = new Map(
    await Promise.all(
      subjects.map(
        async (subject) =>
          [
            subject.id,
            (await listClassesForSubject(subject.id)).map((l) => l.schoolClassId),
          ] as const,
      ),
    ),
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Subjects</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        A Subject is a permanent, school-wide structure. Assign it to the Classes that study it
        below.
      </p>

      {params.error ? <p className="mb-4 text-sm text-red-600">{params.error}</p> : null}
      {Object.keys(MESSAGES).map((key) =>
        params[key] ? (
          <p key={key} className="mb-4 text-sm text-green-600">
            {MESSAGES[key]}
          </p>
        ) : null,
      )}

      <form
        action={createSubjectAction}
        className="mb-8 flex flex-wrap items-end gap-3 border-b pb-6"
      >
        <div className="flex flex-col gap-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Mathematics" required className="w-40" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" placeholder="MATH" className="w-24" />
        </div>
        <Button type="submit">Create Subject</Button>
      </form>

      <div className="flex flex-col gap-3">
        {subjects.map((subject) => {
          const assignedClassIds = new Set(assignedClassIdsBySubject.get(subject.id) ?? []);
          return (
            <div key={subject.id} className="border-b pb-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {subject.name}
                  {subject.code ? ` (${subject.code})` : ""}
                  {subject.deletedAt ? " — Inactive" : ""}
                </span>
              </div>
              <details className="mt-2">
                <summary className="text-primary cursor-pointer text-sm underline">Manage</summary>
                <div className="mt-3 flex flex-col gap-4">
                  <form action={updateSubjectAction} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="subjectId" value={subject.id} />
                    <Input name="name" defaultValue={subject.name} required className="w-40" />
                    <Input name="code" defaultValue={subject.code ?? ""} className="w-24" />
                    <Button type="submit" variant="outline" size="sm">
                      Save
                    </Button>
                  </form>

                  {subject.deletedAt ? (
                    <form action={reactivateSubjectAction}>
                      <input type="hidden" name="subjectId" value={subject.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Reactivate
                      </Button>
                    </form>
                  ) : (
                    <form action={deactivateSubjectAction}>
                      <input type="hidden" name="subjectId" value={subject.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Deactivate
                      </Button>
                    </form>
                  )}

                  <form action={assignSubjectToClassesAction} className="flex flex-col gap-2">
                    <input type="hidden" name="subjectId" value={subject.id} />
                    <span className="text-sm font-medium">Classes</span>
                    <div className="flex flex-wrap gap-3">
                      {schoolClasses.map((schoolClass) => (
                        <label key={schoolClass.id} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            name="schoolClassIds"
                            value={schoolClass.id}
                            defaultChecked={assignedClassIds.has(schoolClass.id)}
                          />
                          {schoolClass.name}
                        </label>
                      ))}
                    </div>
                    <Button type="submit" variant="outline" size="sm" className="w-fit">
                      Save Class Assignment
                    </Button>
                  </form>
                </div>
              </details>
            </div>
          );
        })}
        {subjects.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">No subjects exist yet.</p>
        ) : null}
      </div>
    </main>
  );
}
