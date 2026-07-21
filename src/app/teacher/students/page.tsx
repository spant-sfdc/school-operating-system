import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canViewStudents } from "@/lib/authorization";
import { findTeacherByUserId } from "@/repositories/teacher";
import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { listAssignmentsForTeacher } from "@/repositories/teacherAssignment";
import { searchStudentDirectory } from "@/services/student/studentDirectory.service";
import { formatEnumLabel } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Student Quick Access (Sprint E3) — "Reuse Student Directory... do NOT
// duplicate Student Workspace." Calls the exact same searchStudentDirectory()
// service Sprint E1's Admin Directory uses, with the one addition
// (`scopedToSectionIds`) that hard-limits results to this teacher's own
// assigned sections, server-side — never a client-side filter over an
// unscoped query.
export default async function TeacherStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const session = await requirePermission(canViewStudents);
  const params = await searchParams;

  const teacher = await findTeacherByUserId(session.userId);
  if (!teacher) {
    notFound();
  }

  const currentAcademicYear = await findCurrentAcademicYear(session.schoolId);
  const assignments = currentAcademicYear
    ? await listAssignmentsForTeacher(teacher.id, currentAcademicYear.id)
    : [];
  const scopedToSectionIds = [...new Set(assignments.map((a) => a.sectionId))];

  const result = await searchStudentDirectory(
    session.schoolId,
    { query: params.query, page: params.page ? Number(params.page) : undefined },
    scopedToSectionIds,
  );

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  function buildPageHref(targetPage: number): string {
    const query = new URLSearchParams();
    if (params.query) query.set("query", params.query);
    query.set("page", String(targetPage));
    return `/teacher/students?${query.toString()}`;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-2">
        <Link href="/teacher" className="text-primary text-sm underline">
          ← Teacher Dashboard
        </Link>
      </p>
      <h1 className="mb-6 text-2xl font-semibold">My Students</h1>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="query">Search</Label>
          <Input
            id="query"
            name="query"
            defaultValue={params.query ?? ""}
            placeholder="Name or admission no."
            className="w-64"
          />
        </div>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-140 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Name</th>
              <th className="py-2">Admission No.</th>
              <th className="py-2">Class</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((student) => (
              <tr key={student.id} className="border-b">
                <td className="py-2">{student.fullName}</td>
                <td className="py-2">{student.admissionNumber}</td>
                <td className="py-2">
                  {student.schoolClassName
                    ? `${student.schoolClassName} - ${student.sectionName}`
                    : "—"}
                </td>
                <td className="py-2">{formatEnumLabel(student.status)}</td>
                <td className="py-2">
                  <Link href={`/teacher/students/${student.id}`} className="text-primary underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted-foreground py-4 text-center">
                  No students in your assigned sections.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span>
          Page {result.page} of {totalPages} ({result.total} total)
        </span>
        <div className="flex gap-2">
          {result.page > 1 ? <Link href={buildPageHref(result.page - 1)}>Previous</Link> : null}
          {result.page < totalPages ? (
            <Link href={buildPageHref(result.page + 1)}>Next</Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
