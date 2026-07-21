import type { AttendanceStatus } from "@/generated/prisma/enums";
import { findSectionById } from "@/repositories/section";
import { findSchoolClassById } from "@/repositories/schoolClass";
import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { findClassTeacherForSection } from "@/repositories/teacherAssignment";
import { listEnrollmentsBySection } from "@/repositories/enrollment";
import { listGuardiansForStudents } from "@/repositories/student";
import { openAttendanceSession, submitAttendance } from "@/services/attendance/attendance.service";
import {
  buildSessionAttendanceSummary,
  type AttendanceSessionWorkspaceDTO,
  type AttendanceGridRowDTO,
} from "@/services/attendance/attendanceSessionWorkspace.dto";

export class AttendanceAuthorizationError extends Error {}
export class AttendanceLockedError extends Error {}

/**
 * Authorization shared by getAttendanceSessionWorkspace() and
 * submitAttendanceGrid() below — BUSINESS_RULES.md § 4's "only the
 * assigned section teacher (or Admin) may mark/edit attendance for a
 * section," enforced server-side (ARCHITECTURE.md § 7), not left to the
 * page merely not rendering a link. "The assigned section teacher" is
 * read as the Class Teacher specifically (isClassTeacher = true) — daily
 * attendance is a homeroom responsibility in real school practice, not
 * something every subject teacher who happens to teach the section also
 * owns; PERMISSION_MATRIX.md § 5 doesn't disambiguate this further, so
 * this is a deliberate, named scoping decision, not an oversight.
 */
async function assertCanTakeAttendanceForSection(
  sectionId: string,
  academicYearId: string,
  actorUserId: string,
  actorAccessLevel: string,
  actorTeacherId: string | null,
): Promise<void> {
  if (actorAccessLevel === "ADMIN") return;
  if (actorAccessLevel === "TEACHER" && actorTeacherId) {
    const classTeacher = await findClassTeacherForSection(sectionId, academicYearId);
    if (classTeacher?.teacherId === actorTeacherId) return;
  }
  throw new AttendanceAuthorizationError(
    `User ${actorUserId} is not authorized to take attendance for section ${sectionId}.`,
  );
}

function buildRows(
  enrollments: Awaited<ReturnType<typeof listEnrollmentsBySection>>,
  guardianLinks: Awaited<ReturnType<typeof listGuardiansForStudents>>,
  statusByEnrollmentId: Map<string, AttendanceStatus>,
): AttendanceGridRowDTO[] {
  const guardiansByStudentId = new Map<string, string[]>();
  for (const link of guardianLinks) {
    const names = guardiansByStudentId.get(link.studentId) ?? [];
    names.push(`${link.guardian.firstName} ${link.guardian.lastName}`);
    guardiansByStudentId.set(link.studentId, names);
  }

  return enrollments
    .map((enrollment) => {
      const guardianNames = guardiansByStudentId.get(enrollment.studentId) ?? [];
      return {
        enrollmentId: enrollment.id,
        studentId: enrollment.studentId,
        fullName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
        admissionNumber: enrollment.student.admissionNumber,
        rollNumber: enrollment.rollNumber,
        guardianSummary: guardianNames.length > 0 ? guardianNames.join(", ") : "No guardian linked",
        currentStatus: statusByEnrollmentId.get(enrollment.id) ?? null,
      };
    })
    .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true }));
}

/**
 * Attendance Session Workspace — gets or creates today's session
 * (reuses openAttendanceSession() unchanged) and composes the Grid's own
 * data: full section roster (listEnrollmentsBySection()), each student's
 * already-marked status (from the session's own included `records`, no
 * separate query), and a guardian summary per row (one batched query, not
 * N+1). `locked` is derived, not stored — see
 * attendanceSessionWorkspace.dto.ts's own comment on
 * AttendanceSessionWorkspaceDTO.locked for why no schema change was made
 * for this.
 */
export async function getAttendanceSessionWorkspace(
  sectionId: string,
  actorUserId: string,
  schoolId: string,
  actorAccessLevel: string,
  actorTeacherId: string | null,
): Promise<AttendanceSessionWorkspaceDTO | null> {
  const section = await findSectionById(sectionId);
  if (!section) return null;

  const schoolClass = await findSchoolClassById(section.schoolClassId);
  if (!schoolClass || schoolClass.schoolId !== schoolId) return null;

  const currentAcademicYear = await findCurrentAcademicYear(schoolId);
  if (!currentAcademicYear || currentAcademicYear.id !== section.academicYearId) {
    // This sprint's own scope is "today's session for a currently-active
    // section" — a section belonging to a non-current academic year has no
    // "today" to take attendance for.
    return null;
  }

  await assertCanTakeAttendanceForSection(
    sectionId,
    currentAcademicYear.id,
    actorUserId,
    actorAccessLevel,
    actorTeacherId,
  );

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const sessionDto = await openAttendanceSession(
    { sectionId, date: today, markedByUserId: actorUserId },
    actorUserId,
  );

  const enrollments = await listEnrollmentsBySection(sectionId, currentAcademicYear.id);
  const guardianLinks = await listGuardiansForStudents(enrollments.map((e) => e.studentId));

  const statusByEnrollmentId = new Map(
    (sessionDto.records ?? []).map((record) => [record.enrollmentId, record.status]),
  );

  const rows = buildRows(enrollments, guardianLinks, statusByEnrollmentId);
  const counts: Record<AttendanceStatus, number> = { PRESENT: 0, ABSENT: 0, HALF_DAY: 0, LEAVE: 0 };
  for (const status of statusByEnrollmentId.values()) {
    counts[status]++;
  }
  const summary = buildSessionAttendanceSummary(rows.length, counts);

  return {
    session: sessionDto,
    schoolClassName: schoolClass.name,
    sectionName: section.name,
    academicYearLabel: currentAcademicYear.label,
    date: sessionDto.date,
    rows,
    summary,
    locked: summary.markedCount === summary.totalStudents && summary.totalStudents > 0,
  };
}

export interface SubmitAttendanceGridInput {
  sectionId: string;
  sessionId: string;
  records: { enrollmentId: string; status: AttendanceStatus }[];
}

/**
 * Submit — reuses submitAttendance() (src/services/attendance/attendance.service.ts)
 * completely unchanged, per this sprint's own "reuse services, do not
 * bypass them, only compose" instruction. The one addition is the lock
 * re-check immediately before calling it: a disabled Submit button in the
 * UI is a courtesy, not the actual guard (ARCHITECTURE.md § 7) — a locked
 * session (every student already marked) rejects a further submit unless
 * the caller can canOverrideAttendanceLock(), which nothing in this sprint
 * grants yet.
 */
export async function submitAttendanceGrid(
  input: SubmitAttendanceGridInput,
  actorUserId: string,
  schoolId: string,
  actorAccessLevel: string,
  actorTeacherId: string | null,
  canOverrideLock: boolean,
): Promise<AttendanceSessionWorkspaceDTO> {
  const before = await getAttendanceSessionWorkspace(
    input.sectionId,
    actorUserId,
    schoolId,
    actorAccessLevel,
    actorTeacherId,
  );
  if (!before) {
    throw new Error(`Attendance session not found for section ${input.sectionId}.`);
  }
  if (before.locked && !canOverrideLock) {
    throw new AttendanceLockedError(
      "This session has already been fully submitted and is locked. Ask an Administrator to reopen it.",
    );
  }

  await submitAttendance(
    { sessionId: input.sessionId, submittedByUserId: actorUserId, records: input.records },
    actorUserId,
  );

  const after = await getAttendanceSessionWorkspace(
    input.sectionId,
    actorUserId,
    schoolId,
    actorAccessLevel,
    actorTeacherId,
  );
  if (!after) {
    throw new Error(
      `Attendance session not found for section ${input.sectionId} after submission.`,
    );
  }
  return after;
}
