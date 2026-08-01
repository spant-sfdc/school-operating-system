import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import { findExamTermById } from "@/repositories/examTerm";
import {
  createExamination as createExaminationRow,
  findExaminationById,
  updateExaminationStatus,
  listExaminationsBySchool as listExaminationsBySchoolRows,
  type ExaminationFilters,
} from "@/repositories/examination";
import { countSubjectSchedulesForExamination } from "@/repositories/examSubjectSchedule";
import {
  createExaminationInputSchema,
  publishExaminationInputSchema,
  completeExaminationInputSchema,
  archiveExaminationInputSchema,
  type CreateExaminationInput,
  type PublishExaminationInput,
  type CompleteExaminationInput,
  type ArchiveExaminationInput,
} from "@/lib/validations/examination";
import { toExaminationDTO, type ExaminationDTO } from "@/services/examination/dto/examination.dto";

/**
 * Creates an Examination in DRAFT status — the specific exam instance
 * ("Half-Yearly Examination, Class 6, 2026-27") that subjects, schedules,
 * and (in a later sprint) marks actually attach to. Per DOMAIN_MODEL.md
 * § 8.2, belongs to an ExamTerm + SchoolClass + AcademicYear.
 *
 * Deliberately does not also create any ExamSubjectSchedule — that's
 * scheduleSubjectExam()'s own job, called once per subject, so a school
 * setting up a 10-subject examination isn't forced into one giant
 * all-or-nothing transaction (see docs/DECISIONS.md's Sprint E7 entry for
 * the full reasoning).
 *
 * Optional `tx`, the same passthrough pattern every write in this codebase
 * uses.
 */
export async function createExamination(
  input: CreateExaminationInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<ExaminationDTO> {
  const validated = createExaminationInputSchema.parse(input);

  const examTerm = await findExamTermById(validated.examTermId);
  if (!examTerm) {
    throw new Error(`Exam term not found: ${validated.examTermId}`);
  }

  const run = async (t: Prisma.TransactionClient) => {
    const examination = await createExaminationRow(
      {
        name: validated.name,
        description: validated.description,
        startDate: validated.startDate,
        endDate: validated.endDate,
        school: { connect: { schoolId: validated.schoolId } },
        examTerm: { connect: { id: validated.examTermId } },
        academicYear: { connect: { id: validated.academicYearId } },
        schoolClass: { connect: { id: validated.schoolClassId } },
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: validated.schoolId,
      entityType: "Examination",
      entityId: examination.id,
      actorUserId,
      action: "CREATE",
      afterValue: {
        name: examination.name,
        examTermId: examination.examTermId,
        schoolClassId: examination.schoolClassId,
        status: examination.status,
      },
    });

    const created = await findExaminationById(examination.id, t);
    if (!created) {
      throw new Error(`Failed to load newly-created examination: ${examination.id}`);
    }
    return toExaminationDTO(created);
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Publishes an Examination — SCHEDULED -> ACTIVE, making it the "live"
 * exam Teachers see. Requires at least one ExamSubjectSchedule (a DRAFT
 * examination with zero subjects has nothing to publish) — this is a
 * belt-and-suspenders check, not redundant paperwork: `status` and subject
 * count are two independently-readable facts, and validating both keeps
 * this function correct even if a future caller reaches it with a
 * SCHEDULED status through some path other than scheduleSubjectExam()'s
 * own automatic bump.
 */
export async function publishExamination(
  input: PublishExaminationInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<ExaminationDTO> {
  const validated = publishExaminationInputSchema.parse(input);

  const existing = await findExaminationById(validated.examinationId);
  if (!existing) {
    throw new Error(`Examination not found: ${validated.examinationId}`);
  }
  if (existing.status !== "SCHEDULED") {
    throw new Error(
      `Cannot publish an examination in "${existing.status}" status — it must be SCHEDULED first.`,
    );
  }
  const scheduleCount = await countSubjectSchedulesForExamination(validated.examinationId);
  if (scheduleCount === 0) {
    throw new Error("Cannot publish an examination with no subjects scheduled.");
  }

  return transitionExaminationStatus(existing, "ACTIVE", actorUserId, tx);
}

/**
 * Completes an Examination — ACTIVE -> COMPLETED, marking the exam period
 * over. Does not touch marks/results (out of this sprint's scope) — purely
 * the lifecycle-status transition Sprint E8+ will read to decide whether
 * marks entry is still open.
 */
export async function completeExamination(
  input: CompleteExaminationInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<ExaminationDTO> {
  const validated = completeExaminationInputSchema.parse(input);

  const existing = await findExaminationById(validated.examinationId);
  if (!existing) {
    throw new Error(`Examination not found: ${validated.examinationId}`);
  }
  if (existing.status !== "ACTIVE") {
    throw new Error(
      `Cannot complete an examination in "${existing.status}" status — it must be ACTIVE first.`,
    );
  }

  return transitionExaminationStatus(existing, "COMPLETED", actorUserId, tx);
}

/**
 * Archives an Examination — COMPLETED -> ARCHIVED, the terminal state for
 * historical cleanup (hidden from active views, still fully queryable).
 */
export async function archiveExamination(
  input: ArchiveExaminationInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<ExaminationDTO> {
  const validated = archiveExaminationInputSchema.parse(input);

  const existing = await findExaminationById(validated.examinationId);
  if (!existing) {
    throw new Error(`Examination not found: ${validated.examinationId}`);
  }
  if (existing.status !== "COMPLETED") {
    throw new Error(
      `Cannot archive an examination in "${existing.status}" status — it must be COMPLETED first.`,
    );
  }

  return transitionExaminationStatus(existing, "ARCHIVED", actorUserId, tx);
}

/**
 * Reads one Examination by id — the read Sprint E8 (Marks Entry) will use
 * to resolve "which examination is this marks-entry screen for."
 */
export async function getExaminationById(id: string): Promise<ExaminationDTO | null> {
  const examination = await findExaminationById(id);
  return examination ? toExaminationDTO(examination) : null;
}

/**
 * Lists Examinations for a school, optionally filtered by academic year,
 * class, or status — the read a future Examination Setup UI and Sprint E8
 * will both consume.
 */
export async function listExaminationsBySchool(
  schoolId: string,
  filters: ExaminationFilters = {},
): Promise<ExaminationDTO[]> {
  const examinations = await listExaminationsBySchoolRows(schoolId, filters);
  return examinations.map(toExaminationDTO);
}

async function transitionExaminationStatus(
  existing: NonNullable<Awaited<ReturnType<typeof findExaminationById>>>,
  nextStatus: "ACTIVE" | "COMPLETED" | "ARCHIVED",
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<ExaminationDTO> {
  const run = async (t: Prisma.TransactionClient) => {
    await updateExaminationStatus(existing.id, nextStatus, t);

    await writeAuditLog(t, {
      schoolId: existing.schoolId,
      entityType: "Examination",
      entityId: existing.id,
      actorUserId,
      action: "UPDATE",
      beforeValue: { status: existing.status },
      afterValue: { status: nextStatus },
    });

    const updated = await findExaminationById(existing.id, t);
    if (!updated) {
      throw new Error(`Failed to reload examination after status transition: ${existing.id}`);
    }
    return toExaminationDTO(updated);
  };

  return tx ? run(tx) : db.$transaction(run);
}
