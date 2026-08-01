import type { MarksRecordStatus } from "@/generated/prisma/enums";
import { findSectionById } from "@/repositories/section";
import { findSchoolClassById } from "@/repositories/schoolClass";
import { listEnrollmentsBySection } from "@/repositories/enrollment";
import { listAssignmentsForSection } from "@/repositories/teacherAssignment";
import { listMarksRecordsForScheduleAndSection } from "@/repositories/marksRecord";
import { findMarksSubmissionByScheduleAndSection } from "@/repositories/marksSubmission";
import { getExamSubjectScheduleById, getExaminationById } from "@/services/examination";
import { saveDraftMarks, submitMarks, MarksLockedError } from "@/services/marks/marks.service";
import {
  buildMarksEntrySummary,
  type MarksEntryWorkspaceDTO,
  type MarksGridRowDTO,
} from "@/services/marks/marksEntryWorkspace.dto";

export class MarksAuthorizationError extends Error {}
export { MarksLockedError };

/**
 * Authorization — PERMISSION_MATRIX.md § 6's own "MarksRecord | Teacher:
 * CRU (assigned subjects/sections only)" — deliberately broader than
 * Attendance's own Class-Teacher-only scoping
 * (attendanceSessionWorkspace.service.ts's assertCanTakeAttendanceForSection()):
 * ANY teacher with a matching TeacherAssignment(teacherId, sectionId,
 * subjectId, academicYearId) may enter marks for that subject in that
 * section, not only the section's Class Teacher — a subject teacher who
 * isn't the Class Teacher still owns their own subject's marks. Composed
 * from the already-existing, unmodified section/teacherAssignment
 * repositories (small N — a section has a handful of assignments), per
 * "repositories never call repositories" — no new repository function,
 * mirrors examSubjectSchedule.service.ts's own
 * verifyTeacherAssignedToSubject() helper exactly (Sprint E7).
 */
async function assertCanEnterMarksForScheduleAndSection(
  sectionId: string,
  subjectId: string,
  academicYearId: string,
  actorAccessLevel: string,
  actorTeacherId: string | null,
): Promise<void> {
  if (actorAccessLevel === "ADMIN") return;
  if (actorAccessLevel === "TEACHER" && actorTeacherId) {
    const assignments = await listAssignmentsForSection(sectionId, academicYearId);
    if (assignments.some((a) => a.teacherId === actorTeacherId && a.subjectId === subjectId)) {
      return;
    }
  }
  throw new MarksAuthorizationError(
    `Teacher is not authorized to enter marks for subject ${subjectId} in section ${sectionId}.`,
  );
}

function buildRows(
  enrollments: Awaited<ReturnType<typeof listEnrollmentsBySection>>,
  recordsByEnrollmentId: Map<string, { marksObtained: number; status: MarksRecordStatus }>,
): MarksGridRowDTO[] {
  return enrollments
    .map((enrollment) => {
      const record = recordsByEnrollmentId.get(enrollment.id);
      return {
        enrollmentId: enrollment.id,
        studentId: enrollment.studentId,
        fullName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
        admissionNumber: enrollment.student.admissionNumber,
        rollNumber: enrollment.rollNumber,
        marksObtained: record?.marksObtained ?? null,
        status: record?.status ?? null,
      };
    })
    .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true }));
}

/**
 * Marks Entry Workspace — the Grid's own data: full section roster
 * (listEnrollmentsBySection(), unchanged), each student's already-entered
 * mark/status, and the two independent lock reasons this sprint's own
 * validation requirements name: `locked` (every student already
 * SUBMITTED — mirrors AttendanceSessionWorkspaceDTO.locked's own
 * derived-not-stored precedent) and `examinationInactive` (the parent
 * Examination is not ACTIVE, per Sprint E7's own status lifecycle —
 * "Should marks be editable forever, or should the Examination lifecycle
 * control this" resolves to the latter: marks entry only happens while
 * the exam is the live, ACTIVE one Teachers act on).
 */
export async function getMarksEntryWorkspace(
  examSubjectScheduleId: string,
  sectionId: string,
  schoolId: string,
  actorAccessLevel: string,
  actorTeacherId: string | null,
): Promise<MarksEntryWorkspaceDTO | null> {
  const schedule = await getExamSubjectScheduleById(examSubjectScheduleId);
  if (!schedule) return null;

  const examination = await getExaminationById(schedule.examinationId);
  if (!examination || examination.schoolId !== schoolId) return null;

  const section = await findSectionById(sectionId);
  if (!section) return null;
  const schoolClass = await findSchoolClassById(section.schoolClassId);
  if (!schoolClass || schoolClass.id !== examination.schoolClassId) return null;

  await assertCanEnterMarksForScheduleAndSection(
    sectionId,
    schedule.subjectId,
    examination.academicYearId,
    actorAccessLevel,
    actorTeacherId,
  );

  const enrollments = await listEnrollmentsBySection(sectionId, examination.academicYearId);
  const records = await listMarksRecordsForScheduleAndSection(examSubjectScheduleId, sectionId);

  const recordsByEnrollmentId = new Map(
    records.map((r) => [
      r.enrollmentId,
      { marksObtained: Number(r.marksObtained), status: r.status },
    ]),
  );

  const rows = buildRows(enrollments, recordsByEnrollmentId);
  const enteredCount = rows.filter((r) => r.marksObtained !== null).length;
  const submittedCount = rows.filter((r) => r.status === "SUBMITTED").length;
  const summary = buildMarksEntrySummary(rows.length, enteredCount, submittedCount);

  // Sprint E9 — read-only lookup, additive: composes the new
  // marksSubmission repository the same way this function already
  // composes section/schoolClass/enrollment/marksRecord reads. Absence
  // (no row yet, or reverted to DRAFT after a Return) is a valid, expected
  // state, not an error.
  const submission = await findMarksSubmissionByScheduleAndSection(
    examSubjectScheduleId,
    sectionId,
  );

  return {
    examSubjectScheduleId,
    examinationId: examination.id,
    examinationName: examination.name,
    examinationStatus: examination.status,
    subjectName: schedule.subjectName,
    maxMarks: schedule.maxMarks,
    passMarks: schedule.passMarks,
    sectionId,
    schoolClassName: schoolClass.name,
    sectionName: section.name,
    academicYearLabel: examination.academicYearLabel,
    rows,
    summary,
    locked:
      (submittedCount === rows.length && rows.length > 0) || examination.status === "PUBLISHED",
    examinationInactive: examination.status !== "ACTIVE",
    submissionStatus: submission?.status ?? null,
    returnReason: submission?.returnReason ?? null,
    resubmissionCount: submission?.resubmissionCount ?? 0,
  };
}

export interface MarksGridSaveInput {
  examSubjectScheduleId: string;
  sectionId: string;
  records: { enrollmentId: string; marksObtained: number }[];
}

/**
 * Save Draft — reuses saveDraftMarks() (marks.service.ts) unchanged, per
 * this sprint's own "reuse services, do not bypass them" instruction. Adds
 * the Examination-ACTIVE re-check immediately before calling it — a
 * disabled Save button in the UI is a courtesy, not the actual guard
 * (ARCHITECTURE.md § 7).
 */
export async function saveDraftMarksGrid(
  input: MarksGridSaveInput,
  actorUserId: string,
  schoolId: string,
  actorAccessLevel: string,
  actorTeacherId: string | null,
): Promise<MarksEntryWorkspaceDTO> {
  const before = await getMarksEntryWorkspace(
    input.examSubjectScheduleId,
    input.sectionId,
    schoolId,
    actorAccessLevel,
    actorTeacherId,
  );
  if (!before) {
    throw new Error(`Marks entry workspace not found for schedule ${input.examSubjectScheduleId}.`);
  }
  if (before.examinationInactive) {
    throw new MarksLockedError(
      `This examination is not currently ACTIVE (status: ${before.examinationStatus}) — marks entry is closed.`,
    );
  }

  await saveDraftMarks(
    {
      examSubjectScheduleId: input.examSubjectScheduleId,
      sectionId: input.sectionId,
      records: input.records,
    },
    actorUserId,
  );

  const after = await getMarksEntryWorkspace(
    input.examSubjectScheduleId,
    input.sectionId,
    schoolId,
    actorAccessLevel,
    actorTeacherId,
  );
  if (!after) {
    throw new Error(
      `Marks entry workspace not found for schedule ${input.examSubjectScheduleId} after save.`,
    );
  }
  return after;
}

/**
 * Submit — reuses submitMarks() (marks.service.ts) unchanged. Adds three
 * checks immediately before calling it, all real server-side guards, not
 * UI courtesies: the Examination must be ACTIVE, the section must not
 * already be fully `locked` (duplicate-submission rejection), and every
 * enrolled student must have a resolvable mark ("no missing marks," this
 * sprint's own explicit requirement) — resolved here by merging the
 * incoming payload with whatever's already saved as DRAFT, so a teacher
 * who saved some rows as drafts earlier and is now completing the rest
 * doesn't have to resend every value in one submit call.
 *
 * Deliberately does NOT accept an external `tx` — an earlier Sprint E9
 * revision tried threading one through (so submitMarksForReview() could
 * write the MarksRecord batch and its own new MarksSubmission row in one
 * shared transaction), but this function's own "before"/"after"
 * getMarksEntryWorkspace() reads are plain, non-tx reads by necessity
 * (getMarksEntryWorkspace() composes half a dozen repositories, none of
 * which accept `tx`) — live-verified against the real Neon connection,
 * issuing those plain reads while an outer interactive transaction was
 * still open corrupted the shared `pg` connection (`@prisma/adapter-pg`
 * has no isolation between a `db.$transaction()`'s own reserved
 * connection and ordinary `db.*` queries made mid-transaction). Reverted;
 * submitMarksForReview() instead handles its own narrow crash window with
 * an idempotent recovery check, not a shared transaction — see its own
 * comment.
 */
export async function submitMarksGrid(
  input: MarksGridSaveInput,
  actorUserId: string,
  schoolId: string,
  actorAccessLevel: string,
  actorTeacherId: string | null,
): Promise<MarksEntryWorkspaceDTO> {
  const before = await getMarksEntryWorkspace(
    input.examSubjectScheduleId,
    input.sectionId,
    schoolId,
    actorAccessLevel,
    actorTeacherId,
  );
  if (!before) {
    throw new Error(`Marks entry workspace not found for schedule ${input.examSubjectScheduleId}.`);
  }
  if (before.examinationInactive) {
    throw new MarksLockedError(
      `This examination is not currently ACTIVE (status: ${before.examinationStatus}) — marks entry is closed.`,
    );
  }
  if (before.locked) {
    throw new MarksLockedError(
      "Marks for this section have already been fully submitted and are locked.",
    );
  }

  const incomingByEnrollmentId = new Map(
    input.records.map((r) => [r.enrollmentId, r.marksObtained]),
  );
  const merged = before.rows.map((row) => ({
    enrollmentId: row.enrollmentId,
    marksObtained: incomingByEnrollmentId.get(row.enrollmentId) ?? row.marksObtained,
  }));
  const missing = merged.filter((r) => r.marksObtained === null || r.marksObtained === undefined);
  if (missing.length > 0) {
    throw new Error(
      `Cannot submit — ${missing.length} student(s) are missing marks. Save a draft with every student's marks first.`,
    );
  }

  await submitMarks(
    {
      examSubjectScheduleId: input.examSubjectScheduleId,
      sectionId: input.sectionId,
      records: merged as { enrollmentId: string; marksObtained: number }[],
    },
    actorUserId,
  );

  const after = await getMarksEntryWorkspace(
    input.examSubjectScheduleId,
    input.sectionId,
    schoolId,
    actorAccessLevel,
    actorTeacherId,
  );
  if (!after) {
    throw new Error(
      `Marks entry workspace not found for schedule ${input.examSubjectScheduleId} after submission.`,
    );
  }
  return after;
}
