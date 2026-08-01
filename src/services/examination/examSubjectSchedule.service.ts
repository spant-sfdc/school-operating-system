import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import { findExaminationById, updateExaminationStatus } from "@/repositories/examination";
import {
  createExamSubjectSchedule as createScheduleRow,
  findExamSubjectSchedule,
  findExamSubjectScheduleById,
  countSubjectSchedulesForExamination,
  listSubjectSchedulesForExamination as listSubjectSchedulesForExaminationRows,
} from "@/repositories/examSubjectSchedule";
import { listSectionsByClassAndYear } from "@/repositories/section";
import { listAssignmentsForSection } from "@/repositories/teacherAssignment";
import {
  scheduleSubjectExamInputSchema,
  type ScheduleSubjectExamInput,
} from "@/lib/validations/examination";
import {
  toExamSubjectScheduleDTO,
  type ExamSubjectScheduleDTO,
} from "@/services/examination/dto/examSubjectSchedule.dto";

/**
 * "Is this teacher actually assigned to teach this subject, in any section
 * of the examination's own class, for this academic year" — the
 * TeacherAssignment authority check this sprint's own instruction requires
 * ("TeacherAssignment must remain the authority"). Loops over the class's
 * sections (small N in practice — a class has a handful of sections, the
 * same "small N" reasoning src/services/teacher/teacherWorkspace.service.ts
 * already uses for its own per-section loop), not a new repository
 * function — composed here from two already-existing, unmodified
 * repositories (section, teacherAssignment), per "repositories never call
 * repositories."
 */
async function verifyTeacherAssignedToSubject(
  teacherId: string,
  subjectId: string,
  schoolClassId: string,
  academicYearId: string,
): Promise<boolean> {
  const sections = await listSectionsByClassAndYear(schoolClassId, academicYearId);
  for (const section of sections) {
    const assignments = await listAssignmentsForSection(section.id, academicYearId);
    if (assignments.some((a) => a.teacherId === teacherId && a.subjectId === subjectId)) {
      return true;
    }
  }
  return false;
}

/**
 * Schedules one Subject within an already-created Examination — date,
 * max/pass marks, duration, room, instructions. Per DOMAIN_MODEL.md § 8.3,
 * `examinationId` + `subjectId` is unique; per this sprint's own
 * instruction, `teacherId` (if supplied) is validated against
 * TeacherAssignment but stored only as an informational reference, never
 * the authority itself — see the Prisma schema's own migration-header
 * comment.
 *
 * Bumps the parent Examination DRAFT -> SCHEDULED automatically the moment
 * its first subject is scheduled — the natural, derived transition named
 * in Sprint E7's own lifecycle, not a separate function (no distinct verb
 * for it exists in this sprint's own named service list).
 *
 * Optional `tx`, the same passthrough pattern every write in this codebase
 * uses — so a future Examination importer's commit handler can call this
 * inside its own per-row transaction.
 */
export async function scheduleSubjectExam(
  input: ScheduleSubjectExamInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<ExamSubjectScheduleDTO> {
  const validated = scheduleSubjectExamInputSchema.parse(input);

  const examination = await findExaminationById(validated.examinationId);
  if (!examination) {
    throw new Error(`Examination not found: ${validated.examinationId}`);
  }
  if (examination.status !== "DRAFT" && examination.status !== "SCHEDULED") {
    throw new Error(
      `Cannot schedule a subject for an examination in "${examination.status}" status.`,
    );
  }

  const existingSchedule = await findExamSubjectSchedule(
    validated.examinationId,
    validated.subjectId,
  );
  if (existingSchedule) {
    throw new Error("This subject is already scheduled for this examination.");
  }

  if (validated.teacherId) {
    const isAssigned = await verifyTeacherAssignedToSubject(
      validated.teacherId,
      validated.subjectId,
      examination.schoolClassId,
      examination.academicYearId,
    );
    if (!isAssigned) {
      throw new Error(
        "The selected teacher has no TeacherAssignment for this subject in any section of this class.",
      );
    }
  }

  const scheduleCountBefore = await countSubjectSchedulesForExamination(validated.examinationId);

  const run = async (t: Prisma.TransactionClient) => {
    const schedule = await createScheduleRow(
      {
        examination: { connect: { id: validated.examinationId } },
        subject: { connect: { id: validated.subjectId } },
        teacher: validated.teacherId ? { connect: { id: validated.teacherId } } : undefined,
        examDate: validated.examDate,
        maxMarks: validated.maxMarks,
        passMarks: validated.passMarks,
        durationMinutes: validated.durationMinutes,
        room: validated.room,
        instructions: validated.instructions,
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: examination.schoolId,
      entityType: "ExamSubjectSchedule",
      entityId: schedule.id,
      actorUserId,
      action: "CREATE",
      afterValue: {
        examinationId: schedule.examinationId,
        subjectId: schedule.subjectId,
        maxMarks: schedule.maxMarks,
        passMarks: schedule.passMarks,
      },
    });

    if (scheduleCountBefore === 0 && examination.status === "DRAFT") {
      await updateExaminationStatus(examination.id, "SCHEDULED", t);
      await writeAuditLog(t, {
        schoolId: examination.schoolId,
        entityType: "Examination",
        entityId: examination.id,
        actorUserId,
        action: "UPDATE",
        beforeValue: { status: "DRAFT" },
        afterValue: { status: "SCHEDULED" },
      });
    }

    const created = await findExamSubjectScheduleById(schedule.id, t);
    if (!created) {
      throw new Error(`Failed to load newly-created exam subject schedule: ${schedule.id}`);
    }
    return toExamSubjectScheduleDTO(created);
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Lists every active ExamSubjectSchedule for an Examination — the read
 * Sprint E8 (Marks Entry) will consume to build "which subjects can this
 * teacher enter marks for."
 */
export async function listSubjectSchedulesForExamination(
  examinationId: string,
): Promise<ExamSubjectScheduleDTO[]> {
  const schedules = await listSubjectSchedulesForExaminationRows(examinationId);
  return schedules.map(toExamSubjectScheduleDTO);
}

/**
 * Reads one ExamSubjectSchedule by id — the read Sprint E8 (Marks Entry)
 * uses to resolve maxMarks/passMarks and its own parent examinationId
 * before validating a marks submission. Added this sprint (E8), pure
 * extension — no existing function's behavior changed.
 */
export async function getExamSubjectScheduleById(
  id: string,
): Promise<ExamSubjectScheduleDTO | null> {
  const schedule = await findExamSubjectScheduleById(id);
  return schedule ? toExamSubjectScheduleDTO(schedule) : null;
}
