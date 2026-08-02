import { findAcademicYearById } from "@/repositories/academicYear";
import { findSchoolClassById } from "@/repositories/schoolClass";
import { findSectionById } from "@/repositories/section";
import { listEnrollmentsBySection } from "@/repositories/enrollment";
import { listPublishedMarksRecordsByEnrollments } from "@/repositories/marksRecord";
import { listPromotionRecordsBySourceEnrollments } from "@/repositories/promotionRecord";
import {
  computePromotionRecommendation,
  type PromotionExaminationResultDTO,
} from "@/services/promotion/promotionRecommendation";
import type {
  PromotionReviewWorkspaceDTO,
  PromotionReviewRowDTO,
} from "@/services/promotion/promotionReviewWorkspace.dto";

/**
 * Promotion Review Workspace (Sprint E11) — one section's worth of
 * students (a few dozen at most, per this sprint's own "~40 students"
 * framing), each with: this year's published academic results (reused
 * from Sprint E10's own `listPublishedMarksRecordsByEnrollments()`, not
 * re-derived), a recommendation (always "Manual Review Required" today —
 * see promotionRecommendation.ts's own comment for why), and any
 * already-recorded decision (so a partially-processed section shows
 * finished rows as finished, not re-editable — this sprint's own Q15
 * requirement).
 *
 * Exactly 3 queries total, regardless of section size: the roster, every
 * published MarksRecord for that roster, and every existing
 * PromotionRecord for that roster. No query is issued per student.
 */
export async function getPromotionReviewWorkspace(
  sourceAcademicYearId: string,
  schoolClassId: string,
  sectionId: string,
  schoolId: string,
): Promise<PromotionReviewWorkspaceDTO | null> {
  const academicYear = await findAcademicYearById(sourceAcademicYearId);
  if (!academicYear || academicYear.schoolId !== schoolId) return null;

  const schoolClass = await findSchoolClassById(schoolClassId);
  if (!schoolClass || schoolClass.schoolId !== schoolId) return null;

  const section = await findSectionById(sectionId);
  if (
    !section ||
    section.schoolClassId !== schoolClassId ||
    section.academicYearId !== sourceAcademicYearId
  ) {
    return null;
  }

  const enrollments = await listEnrollmentsBySection(sectionId, sourceAcademicYearId);
  const enrollmentIds = enrollments.map((e) => e.id);

  const [records, existingPromotions] = await Promise.all([
    listPublishedMarksRecordsByEnrollments(enrollmentIds),
    listPromotionRecordsBySourceEnrollments(enrollmentIds),
  ]);

  const recordsByEnrollmentId = new Map<string, typeof records>();
  for (const record of records) {
    const bucket = recordsByEnrollmentId.get(record.enrollmentId);
    if (bucket) bucket.push(record);
    else recordsByEnrollmentId.set(record.enrollmentId, [record]);
  }

  const promotionByEnrollmentId = new Map(existingPromotions.map((p) => [p.sourceEnrollmentId, p]));

  const rows: PromotionReviewRowDTO[] = enrollments.map((enrollment) => {
    const enrollmentRecords = recordsByEnrollmentId.get(enrollment.id) ?? [];

    const recordsByExaminationId = new Map<string, typeof enrollmentRecords>();
    for (const record of enrollmentRecords) {
      const examinationId = record.examSubjectSchedule.examination.id;
      const bucket = recordsByExaminationId.get(examinationId);
      if (bucket) bucket.push(record);
      else recordsByExaminationId.set(examinationId, [record]);
    }

    const publishedExaminations: PromotionExaminationResultDTO[] = Array.from(
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

    const existingPromotion = promotionByEnrollmentId.get(enrollment.id);

    return {
      studentId: enrollment.studentId,
      studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      admissionNumber: enrollment.student.admissionNumber,
      sourceEnrollmentId: enrollment.id,
      rollNumber: enrollment.rollNumber,
      publishedExaminations,
      recommendation: computePromotionRecommendation(
        academicYear.promotionPolicy,
        publishedExaminations,
      ),
      existingDecision: existingPromotion
        ? {
            id: existingPromotion.id,
            outcome: existingPromotion.outcome,
            basis: existingPromotion.basis,
            targetSchoolClassName:
              existingPromotion.resultingEnrollment?.section.schoolClass.name ?? null,
            targetSectionName: existingPromotion.resultingEnrollment?.section.name ?? null,
            targetRollNumber: existingPromotion.resultingEnrollment?.rollNumber ?? null,
            decidedByUserId: existingPromotion.decidedByUserId,
            decidedAt: existingPromotion.createdAt.toISOString(),
          }
        : null,
    };
  });

  return {
    sourceAcademicYearId,
    sourceAcademicYearLabel: academicYear.label,
    schoolClassId,
    schoolClassName: schoolClass.name,
    sectionId,
    sectionName: section.name,
    rows,
  };
}
