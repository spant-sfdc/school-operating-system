import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/db-utils";
import { findStudentById } from "@/repositories/student";
import { findEnrollmentByStudentAndYear } from "@/repositories/enrollment";
import { findSchoolById } from "@/repositories/school";
import { findGradeScaleById } from "@/repositories/gradeScale";
import { countAttendanceByEnrollment } from "@/repositories/attendanceRecord";
import { findPromotionRecordBySourceEnrollment } from "@/repositories/promotionRecord";
import { listPublishedMarksRecordsForEnrollmentAndExamination } from "@/repositories/marksRecord";
import {
  findReportCardByEnrollmentAndExamination,
  createReportCard,
} from "@/repositories/reportCard";
import { getExaminationById } from "@/services/examination";
import { buildAttendanceSummary } from "@/services/student/studentWorkspace.dto";
import { resolveGrade } from "@/services/reportCard/gradeStrategy";
import type { GradeBandInput } from "@/lib/validations/examination";
import type {
  ReportCardDataDTO,
  ReportCardSubjectDTO,
  StudentReportCardDTO,
} from "@/services/reportCard/reportCard.dto";

export class ReportCardTargetNotFoundError extends Error {}

type ResolvedEnrollment = NonNullable<Awaited<ReturnType<typeof findEnrollmentByStudentAndYear>>>;
type ResolvedExamination = NonNullable<Awaited<ReturnType<typeof getExaminationById>>>;

/**
 * Resolves and cross-validates the (student, examination) pair every
 * Report Card operation needs — Sprint E12's own "a student must actually
 * belong to the Examination's class/year context" requirement (Phase 10).
 * Rejects: unknown/cross-school student or examination, an unpublished
 * examination (the authoritative boundary, Q4 — reconfirmed from Sprint
 * E10's own Q1, not re-derived), a student never enrolled in the
 * examination's own academic year, and a student whose that-year class
 * doesn't match the examination's own class — the "wrong student/exam
 * pairing" guard, never an arbitrary `studentId + examinationId` lookup.
 */
async function resolveReportCardContext(
  studentId: string,
  examinationId: string,
  schoolId: string,
): Promise<
  | { ok: true; enrollment: ResolvedEnrollment; examination: ResolvedExamination }
  | { ok: false; reason: string }
> {
  const student = await findStudentById(studentId);
  if (!student || student.schoolId !== schoolId) {
    return { ok: false, reason: "Student not found." };
  }

  const examination = await getExaminationById(examinationId);
  if (!examination || examination.schoolId !== schoolId) {
    return { ok: false, reason: "Examination not found." };
  }
  if (examination.status !== "PUBLISHED") {
    return {
      ok: false,
      reason: `Results for this examination have not been published yet (status: ${examination.status}).`,
    };
  }

  const enrollment = await findEnrollmentByStudentAndYear(studentId, examination.academicYearId);
  if (!enrollment) {
    return {
      ok: false,
      reason: "This student was not enrolled for the academic year this examination belongs to.",
    };
  }
  if (enrollment.section.schoolClassId !== examination.schoolClassId) {
    return {
      ok: false,
      reason: "This student's class does not match this examination's class.",
    };
  }

  return { ok: true, enrollment, examination };
}

/**
 * Composes the live Report Card data — the exact shape persisted into
 * `ReportCard.snapshot` once generated (see the schema's own
 * migration-header comment). Reads only already-authoritative data: no
 * new academic facts are computed or invented here, only presented
 * (Phase 4's own "OUTPUT/PROJECTION, never a second academic record
 * system" boundary).
 */
async function composeReportCardData(
  enrollment: ResolvedEnrollment,
  examination: ResolvedExamination,
  schoolId: string,
): Promise<ReportCardDataDTO> {
  const school = await findSchoolById(schoolId);
  if (!school) {
    throw new Error(`School not found: ${schoolId}`);
  }

  const records = await listPublishedMarksRecordsForEnrollmentAndExamination(
    enrollment.id,
    examination.id,
  );

  const gradeScaleId = enrollment.section.schoolClass.gradeScaleId;
  const gradeScale = gradeScaleId ? await findGradeScaleById(gradeScaleId) : null;
  // `bands` is stored as Prisma Json — cast at this one boundary, the
  // same precedent gradeScale.dto.ts's own toGradeScaleDTO() already
  // established; shape is guaranteed by createGradeScaleInputSchema at
  // write time.
  const bands = gradeScale ? ((gradeScale.bands as GradeBandInput[]) ?? []) : null;

  const subjects: ReportCardSubjectDTO[] = records
    .map((record) => {
      const marksObtained = Number(record.marksObtained);
      const maxMarks = record.examSubjectSchedule.maxMarks;
      const passMarks = record.examSubjectSchedule.passMarks;
      const percentage = maxMarks > 0 ? Math.round((marksObtained / maxMarks) * 1000) / 10 : 0;
      return {
        subjectName: record.examSubjectSchedule.subject.name,
        maxMarks,
        passMarks,
        marksObtained,
        percentage,
        passed: marksObtained >= passMarks,
        grade: resolveGrade(gradeScale?.type ?? null, bands, percentage),
      };
    })
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName));

  const totalMaxMarks = subjects.reduce((sum, s) => sum + s.maxMarks, 0);
  const totalMarksObtained = subjects.reduce((sum, s) => sum + s.marksObtained, 0);
  const overallPercentage =
    totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 1000) / 10 : 0;

  const attendanceCounts = await countAttendanceByEnrollment(enrollment.id);
  const attendanceSummary = buildAttendanceSummary(enrollment.academicYearId, attendanceCounts);

  const promotionRecord = await findPromotionRecordBySourceEnrollment(enrollment.id);

  return {
    school: {
      name: school.name,
      logoUrl: school.logoUrl,
      affiliationBoard: school.affiliationBoard,
      address: school.address,
      phone: school.phone,
      email: school.email,
    },
    student: {
      fullName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      admissionNumber: enrollment.student.admissionNumber,
      dateOfBirth: enrollment.student.dateOfBirth.toISOString(),
      rollNumber: enrollment.rollNumber,
      schoolClassName: enrollment.section.schoolClass.name,
      sectionName: enrollment.section.name,
      academicYearLabel: enrollment.academicYear.label,
    },
    examination: {
      examinationName: examination.name,
      examTermName: examination.examTermName,
      publishedAt: examination.publishedAt ?? "",
    },
    subjects,
    summary: {
      totalMaxMarks,
      totalMarksObtained,
      overallPercentage,
      overallGrade: resolveGrade(gradeScale?.type ?? null, bands, overallPercentage),
    },
    attendance:
      attendanceSummary.available === false
        ? null
        : {
            academicYearLabel: enrollment.academicYear.label,
            totalMarked: attendanceSummary.totalMarked,
            presentCount: attendanceSummary.presentCount,
            attendancePercent: attendanceSummary.attendancePercent,
          },
    promotion: promotionRecord
      ? { outcome: promotionRecord.outcome, basis: promotionRecord.basis }
      : null,
  };
}

/**
 * The Report Card's own read — used by the Preview page for both Admin/
 * Principal and (via the Teacher-facing route's own page-level scoping
 * check, mirroring Sprint E10's exact precedent) Teacher. Returns the
 * frozen, persisted snapshot if one has been generated; otherwise
 * composes live data fresh, never persisting anything on a mere read.
 */
export async function getStudentReportCard(
  studentId: string,
  examinationId: string,
  schoolId: string,
): Promise<StudentReportCardDTO> {
  const context = await resolveReportCardContext(studentId, examinationId, schoolId);
  if (!context.ok) {
    return { available: false, reason: context.reason };
  }
  const { enrollment, examination } = context;

  const existing = await findReportCardByEnrollmentAndExamination(enrollment.id, examination.id);
  if (existing) {
    return {
      available: true,
      data: existing.snapshot as unknown as ReportCardDataDTO,
      generated: true,
      generatedAt: existing.generatedAt.toISOString(),
      generatedByUserId: existing.generatedByUserId,
    };
  }

  const data = await composeReportCardData(enrollment, examination, schoolId);
  return { available: true, data, generated: false, generatedAt: null, generatedByUserId: null };
}

/**
 * Generates (persists) a Report Card — idempotent "get or create," not a
 * decision being made twice (see the schema's own migration-header
 * comment for why this differs from PromotionRecord's own
 * reject-on-duplicate idempotency). Writes the standard AuditLog entry
 * EVENT_MODEL.md § names as `ReportCardGenerated` — reusing the existing
 * AuditLog mechanism, no new Event Engine (this sprint's own explicit
 * Q24 instruction).
 */
export async function generateReportCard(
  studentId: string,
  examinationId: string,
  actorUserId: string,
  schoolId: string,
) {
  const context = await resolveReportCardContext(studentId, examinationId, schoolId);
  if (!context.ok) {
    throw new ReportCardTargetNotFoundError(context.reason);
  }
  const { enrollment, examination } = context;

  const existing = await findReportCardByEnrollmentAndExamination(enrollment.id, examination.id);
  if (existing) {
    return existing;
  }

  const data = await composeReportCardData(enrollment, examination, schoolId);

  return db.$transaction(async (t) => {
    const reportCard = await createReportCard(
      {
        school: { connect: { schoolId } },
        student: { connect: { id: studentId } },
        enrollment: { connect: { id: enrollment.id } },
        examination: { connect: { id: examinationId } },
        snapshot: data as unknown as object,
        generatedByUserId: actorUserId,
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId,
      entityType: "ReportCard",
      entityId: reportCard.id,
      actorUserId,
      action: "CREATE",
      afterValue: {
        studentId,
        enrollmentId: enrollment.id,
        examinationId,
      },
    });

    return reportCard;
  });
}
