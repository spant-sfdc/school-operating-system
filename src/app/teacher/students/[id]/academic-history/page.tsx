import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canViewStudents } from "@/lib/authorization";
import { findTeacherByUserId } from "@/repositories/teacher";
import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { listAssignmentsForTeacher } from "@/repositories/teacherAssignment";
import { getStudentWorkspace } from "@/services/student/studentWorkspace.service";
import { getStudentAcademicHistory } from "@/services/student/academicHistory.service";

const PROMOTION_OUTCOME_LABEL: Record<string, string> = {
  PROMOTED: "Promoted",
  DETAINED: "Detained",
  TRANSFERRED_OUT: "Transferred Out",
  WITHDRAWN: "Withdrawn",
};
const PROMOTION_BASIS_LABEL: Record<string, string> = {
  NO_DETENTION_POLICY: "No-Detention Policy",
  EXAM_RESULT: "Exam Result",
  RE_EXAM: "Re-Examination",
};

// Academic History, Teacher-facing (Sprint E10) — a thin route wrapper,
// not a second implementation: calls getStudentAcademicHistory() (Sprint
// E10) completely unchanged, exactly as Admin's own
// /admin/students/[id]/academic-history does. The only code here is the
// identical Teacher-scoping check src/app/teacher/students/[id]/page.tsx
// already established (Sprint E3) — a Teacher may view a student's
// Academic History only if that student's CURRENT enrollment is in one of
// the Teacher's own currently-assigned sections; this does not grant
// broader visibility than the existing Student Profile page already does.
export default async function TeacherStudentAcademicHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission(canViewStudents);
  const { id } = await params;

  const teacher = await findTeacherByUserId(session.userId);
  if (!teacher) {
    notFound();
  }

  const workspace = await getStudentWorkspace(id, session.schoolId);
  if (!workspace) {
    notFound();
  }

  const currentAcademicYear = await findCurrentAcademicYear(session.schoolId);
  const assignments = currentAcademicYear
    ? await listAssignmentsForTeacher(teacher.id, currentAcademicYear.id)
    : [];
  const assignedSectionIds = new Set(assignments.map((a) => a.sectionId));

  if (
    !workspace.currentEnrollment ||
    !assignedSectionIds.has(workspace.currentEnrollment.sectionId)
  ) {
    notFound();
  }

  const history = await getStudentAcademicHistory(id, session.schoolId);
  if (!history) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-2">
        <Link href={`/teacher/students/${id}`} className="text-primary text-sm underline">
          ← {history.studentName}
        </Link>
      </p>
      <h1 className="mb-6 text-2xl font-semibold">Academic History</h1>

      {history.years.every((year) => year.examinations.length === 0) ? (
        <p className="text-muted-foreground text-sm">
          No published examination results exist for this student yet.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {history.years
            .filter((year) => year.examinations.length > 0)
            .map((year) => (
              <section key={year.academicYearId}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="text-lg font-semibold">{year.academicYearLabel}</h2>
                  <span className="text-muted-foreground text-sm">
                    {year.schoolClassName} - {year.sectionName} · Roll No. {year.rollNumber}
                  </span>
                </div>

                {year.promotion ? (
                  <p className="text-muted-foreground mb-3 text-xs">
                    {PROMOTION_OUTCOME_LABEL[year.promotion.outcome] ?? year.promotion.outcome} (
                    {PROMOTION_BASIS_LABEL[year.promotion.basis] ?? year.promotion.basis}) —{" "}
                    {new Date(year.promotion.decidedAt).toLocaleDateString()}
                  </p>
                ) : null}

                <div className="flex flex-col gap-4">
                  {year.examinations.map((examination) => (
                    <div key={examination.examinationId} className="rounded-md border p-4">
                      <h3 className="mb-3 font-medium">
                        {examination.examinationName}{" "}
                        <span className="text-muted-foreground font-normal">
                          ({examination.examTermName})
                        </span>
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-96 border-collapse text-sm">
                          <thead>
                            <tr className="border-b text-left">
                              <th className="py-2">Subject</th>
                              <th className="py-2">Marks</th>
                              <th className="py-2">Result</th>
                            </tr>
                          </thead>
                          <tbody>
                            {examination.subjects.map((subject) => (
                              <tr key={subject.subjectName} className="border-b">
                                <td className="py-2">{subject.subjectName}</td>
                                <td className="py-2">
                                  {subject.marksObtained} / {subject.maxMarks}
                                </td>
                                <td className="py-2">{subject.passed ? "Pass" : "Fail"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </main>
  );
}
