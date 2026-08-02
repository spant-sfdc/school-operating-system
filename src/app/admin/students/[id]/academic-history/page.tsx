import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canViewStudents } from "@/lib/authorization";
import { getStudentAcademicHistory } from "@/services/student/academicHistory.service";

// Academic History Workspace (Sprint E10) — the destination of Student
// 360's own "View Academic History" Quick Action. A read-composition page
// over getStudentAcademicHistory() (src/services/student/academicHistory.service.ts)
// — only PUBLISHED examination results ever reach this page; Draft/
// Submitted/Returned/Approved-but-unpublished marks are excluded at the
// database query itself, not filtered here. Organized Academic Year ->
// Examination -> Subject, most-recent year first, per this sprint's own
// required structure.
export default async function StudentAcademicHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission(canViewStudents);
  const { id } = await params;

  const history = await getStudentAcademicHistory(id, session.schoolId);
  if (!history) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-2">
        <Link href={`/admin/students/${id}`} className="text-primary text-sm underline">
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

                <div className="flex flex-col gap-4">
                  {year.examinations.map((examination) => (
                    <div key={examination.examinationId} className="rounded-md border p-4">
                      <div className="mb-3 flex items-baseline justify-between">
                        <h3 className="font-medium">
                          {examination.examinationName}{" "}
                          <span className="text-muted-foreground font-normal">
                            ({examination.examTermName})
                          </span>
                        </h3>
                        {examination.publishedAt ? (
                          <span className="text-muted-foreground text-xs">
                            Published {new Date(examination.publishedAt).toLocaleDateString()}
                          </span>
                        ) : null}
                      </div>
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
