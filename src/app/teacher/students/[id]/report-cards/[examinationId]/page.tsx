import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canViewReportCards } from "@/lib/authorization";
import { findTeacherByUserId } from "@/repositories/teacher";
import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { listAssignmentsForTeacher } from "@/repositories/teacherAssignment";
import { getStudentWorkspace } from "@/services/student/studentWorkspace.service";
import { getStudentReportCard } from "@/services/reportCard";
import ReportCardDocument from "@/components/shared/ReportCardDocument";
import PrintButton from "@/components/shared/PrintButton";

// Report Card, Teacher-facing (Sprint E12) — a thin route wrapper, not a
// second implementation: calls getStudentReportCard() completely
// unchanged, exactly as Admin's own equivalent route does. The only code
// here is the identical Teacher-scoping check src/app/teacher/students/[id]/page.tsx
// (Sprint E3) and its own academic-history sibling (Sprint E10) already
// established — a Teacher may view a Report Card only if the student's
// CURRENT enrollment is in one of the Teacher's own currently-assigned
// sections. Read-only: no Generate action here, per PERMISSION_MATRIX.md's
// own "Admin: CRUD | Teacher: R" split.
export default async function TeacherReportCardPage({
  params,
}: {
  params: Promise<{ id: string; examinationId: string }>;
}) {
  const session = await requirePermission(canViewReportCards);
  const { id: studentId, examinationId } = await params;

  const teacher = await findTeacherByUserId(session.userId);
  if (!teacher) {
    notFound();
  }

  const workspace = await getStudentWorkspace(studentId, session.schoolId);
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

  const reportCard = await getStudentReportCard(studentId, examinationId, session.schoolId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
      <p className="mb-2 print:hidden">
        <Link
          href={`/teacher/students/${studentId}/academic-history`}
          className="text-primary text-sm underline"
        >
          ← Academic History
        </Link>
      </p>

      {reportCard.available === false ? (
        <p className="text-muted-foreground text-sm">{reportCard.reason}</p>
      ) : (
        <>
          <div className="mb-4 flex justify-end print:hidden">
            <PrintButton />
          </div>
          <ReportCardDocument data={reportCard.data} />
        </>
      )}
    </main>
  );
}
