import Link from "next/link";

import { requirePermission, canManageAcademicStructure } from "@/lib/authorization";
import { getStructureHealth } from "@/services/structureHealth";
import { formatEnumLabel } from "@/lib/format";

/**
 * Academic Administration Home (Sprint E13) — the control center this
 * sprint's own task prompt names: "the control center for every future
 * academic session." A read-composition page over getStructureHealth()
 * (structureHealth.service.ts), plus static Quick Action links into
 * Academic Years / Classes / Subjects and the already-existing Import
 * Engine (/admin/imports) — no dashboard content is duplicated from
 * elsewhere, matching this sprint's own Phase 3 "do not create separate
 * dashboards for everything" instruction.
 */
export default async function AcademicAdministrationHomePage() {
  const session = await requirePermission(canManageAcademicStructure);
  const health = await getStructureHealth(session.schoolId);

  const classIssues = health.classes.filter((c) => c.noSections || c.noSubjects || c.noGradeScale);
  const sectionIssues = health.sections.filter(
    (s) => s.noClassTeacher || s.noSubjectTeacher || s.isEmpty,
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Academic Administration</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Configure Academic Years, Classes, Sections, and Subjects — the structure every other module
        (Attendance, Examinations, Promotion, Report Cards) depends on.
      </p>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/admin/settings/academic-years" className="text-primary underline">
          Academic Years
        </Link>
        <Link href="/admin/settings/classes" className="text-primary underline">
          Classes &amp; Sections
        </Link>
        <Link href="/admin/settings/subjects" className="text-primary underline">
          Subjects
        </Link>
        <Link href="/admin/imports" className="text-primary underline">
          Import Academic Structure
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Current Academic Year</h2>
        {health.hasCurrentAcademicYear ? (
          <p className="text-sm">
            <span className="font-medium">{health.academicYearLabel}</span> —{" "}
            {formatEnumLabel(health.academicYearStatus ?? "")}
          </p>
        ) : (
          <p className="text-sm text-red-600">
            No Academic Year is currently active. Create and activate one under Academic Years
            before configuring Classes, Sections, or Subjects.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Structure Health {health.isHealthy ? "— All Clear" : `— ${health.issueCount} issue(s)`}
        </h2>
        {!health.hasCurrentAcademicYear ? null : health.isHealthy ? (
          <p className="text-muted-foreground text-sm">
            No configuration gaps found for the current academic year.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {classIssues.length > 0 ? (
              <div>
                <h3 className="mb-1 text-sm font-semibold">Classes</h3>
                <ul className="text-sm">
                  {classIssues.map((c) => (
                    <li key={c.schoolClassId}>
                      <Link
                        href={`/admin/settings/classes/${c.schoolClassId}`}
                        className="underline"
                      >
                        {c.name}
                      </Link>
                      :{" "}
                      {[
                        c.noSections ? "no sections" : null,
                        c.noSubjects ? "no subjects" : null,
                        c.noGradeScale ? "no grade scale" : null,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {sectionIssues.length > 0 ? (
              <div>
                <h3 className="mb-1 text-sm font-semibold">Sections</h3>
                <ul className="text-sm">
                  {sectionIssues.map((s) => (
                    <li key={s.sectionId}>
                      <Link
                        href={`/admin/settings/classes/${s.schoolClassId}`}
                        className="underline"
                      >
                        {s.schoolClassName} {s.sectionName}
                      </Link>
                      :{" "}
                      {[
                        s.isEmpty ? "no students enrolled" : null,
                        s.noClassTeacher ? "no class teacher" : null,
                        s.noSubjectTeacher ? "no subject teacher" : null,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
