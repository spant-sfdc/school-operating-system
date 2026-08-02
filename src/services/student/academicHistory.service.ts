import { findStudentById } from "@/repositories/student";
import { listEnrollmentsByStudent } from "@/repositories/enrollment";
import { listPublishedMarksRecordsByEnrollments } from "@/repositories/marksRecord";
import type {
  StudentAcademicHistoryDTO,
  AcademicHistoryYearDTO,
  AcademicHistoryExaminationDTO,
} from "@/services/student/academicHistory.dto";

/**
 * Student Academic History — Sprint E10's own read-composition service.
 * Organizes every PUBLISHED result this student has, grouped Academic
 * Year -> Examination -> Subject, most-recent first, per this sprint's
 * own required structure.
 *
 * Authoritative boundary (Q1): `Examination.status === "PUBLISHED"`,
 * enforced inside listPublishedMarksRecordsByEnrollments() at the
 * database level — DRAFT/SUBMITTED/RETURNED/APPROVED-but-unpublished
 * marks can never reach this DTO, regardless of what UI composes it.
 *
 * Root (Q2): `Enrollment` remains the temporal hub (D-047, unchanged) —
 * one year's worth of history is anchored to that year's own Enrollment
 * row (class/section/roll number), not a mutable `Student.currentClass`
 * field, which does not and should not exist.
 *
 * Performance (Q15): exactly two queries total, regardless of how many
 * years/examinations/subjects a student has — one for their enrollments,
 * one for every published MarksRecord across all of them. No query is
 * issued per year, per examination, or per subject.
 */
export async function getStudentAcademicHistory(
  studentId: string,
  schoolId: string,
): Promise<StudentAcademicHistoryDTO | null> {
  const student = await findStudentById(studentId);
  if (!student || student.schoolId !== schoolId) {
    return null;
  }

  const enrollments = await listEnrollmentsByStudent(studentId);
  const records = await listPublishedMarksRecordsByEnrollments(enrollments.map((e) => e.id));

  const recordsByEnrollmentId = new Map<string, typeof records>();
  for (const record of records) {
    const bucket = recordsByEnrollmentId.get(record.enrollmentId);
    if (bucket) {
      bucket.push(record);
    } else {
      recordsByEnrollmentId.set(record.enrollmentId, [record]);
    }
  }

  const years: AcademicHistoryYearDTO[] = enrollments.map((enrollment) => {
    const enrollmentRecords = recordsByEnrollmentId.get(enrollment.id) ?? [];

    const recordsByExaminationId = new Map<string, typeof enrollmentRecords>();
    for (const record of enrollmentRecords) {
      const examinationId = record.examSubjectSchedule.examination.id;
      const bucket = recordsByExaminationId.get(examinationId);
      if (bucket) {
        bucket.push(record);
      } else {
        recordsByExaminationId.set(examinationId, [record]);
      }
    }

    // Sorted by examTerm.sortOrder ascending (chronological within the
    // year — Half-Yearly before Final/Annual) before mapping to the public
    // DTO shape, which carries examTermName but not the raw sort key
    // itself. Years themselves are already most-recent-first (the
    // enrollment list's own ordering); within one year, the natural
    // reading order is chronological, not reversed.
    const examinations: AcademicHistoryExaminationDTO[] = Array.from(
      recordsByExaminationId.values(),
    )
      .sort(
        (a, b) =>
          a[0].examSubjectSchedule.examination.examTerm.sortOrder -
          b[0].examSubjectSchedule.examination.examTerm.sortOrder,
      )
      .map((examRecords) => {
        const examination = examRecords[0].examSubjectSchedule.examination;
        return {
          examinationId: examination.id,
          examinationName: examination.name,
          examTermName: examination.examTerm.name,
          publishedAt: examination.publishedAt ? examination.publishedAt.toISOString() : "",
          subjects: examRecords
            .map((record) => ({
              subjectName: record.examSubjectSchedule.subject.name,
              marksObtained: Number(record.marksObtained),
              maxMarks: record.examSubjectSchedule.maxMarks,
              passMarks: record.examSubjectSchedule.passMarks,
              passed: Number(record.marksObtained) >= record.examSubjectSchedule.passMarks,
            }))
            .sort((a, b) => a.subjectName.localeCompare(b.subjectName)),
        };
      });

    return {
      academicYearId: enrollment.academicYearId,
      academicYearLabel: enrollment.academicYear.label,
      schoolClassName: enrollment.section.schoolClass.name,
      sectionName: enrollment.section.name,
      rollNumber: enrollment.rollNumber,
      examinations,
    };
  });

  return {
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`,
    years,
  };
}
