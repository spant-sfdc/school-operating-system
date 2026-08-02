import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import { findUserById } from "@/repositories/user";
import {
  findEnrollmentById,
  findEnrollmentByStudentAndYear,
  createEnrollment,
} from "@/repositories/enrollment";
import { findAcademicYearById } from "@/repositories/academicYear";
import { findSchoolClassById } from "@/repositories/schoolClass";
import { findSectionById } from "@/repositories/section";
import {
  findPromotionRecordBySourceEnrollment,
  findPromotionRecordById,
  createPromotionRecord,
} from "@/repositories/promotionRecord";
import {
  finalizePromotionDecisionInputSchema,
  type FinalizePromotionDecisionInput,
} from "@/lib/validations/promotion";
import {
  toPromotionRecordDTO,
  type PromotionRecordDTO,
} from "@/services/promotion/dto/promotionRecord.dto";

export class PromotionAlreadyDecidedError extends Error {}
export class PromotionTargetNotFoundError extends Error {}
export class PromotionTargetConflictError extends Error {}

/**
 * Finalizes one student's promotion decision — the single, atomic,
 * per-student primitive this sprint's own Phase 8 requires. Matches
 * docs/database/TRANSACTION_BOUNDARIES.md § 2's own "Promotion decision"
 * row exactly: PromotionRecord (create) + Enrollment (create) +
 * AuditLog x2, one transaction, one student. There is no separate
 * "finalize a whole section" service function — a Server Action loops
 * over the selected students and calls this once per student (mirroring
 * the Import Engine's own per-row transaction philosophy, per this
 * sprint's own Phase 8 instruction), so one student's failure can never
 * roll back another's already-committed decision (Q15/Q22).
 *
 * Idempotency (Q16) is enforced at two layers: a pre-check (clear error
 * message, the common case) AND the schema's own unique constraints
 * (`PromotionRecord.sourceEnrollmentId`, `Enrollment`'s own
 * `[studentId, academicYearId]`) as the actual race-proof guard — a
 * double-click or retry that loses the pre-check race still fails
 * cleanly against the database's own constraint, caught below and
 * translated into the same typed error the pre-check throws.
 */
export async function finalizePromotionDecision(
  input: FinalizePromotionDecisionInput,
  actorUserId: string,
  schoolId: string,
): Promise<PromotionRecordDTO> {
  const validated = finalizePromotionDecisionInputSchema.parse(input);

  const sourceEnrollment = await findEnrollmentById(validated.sourceEnrollmentId);
  if (!sourceEnrollment || sourceEnrollment.schoolId !== schoolId) {
    throw new Error(`Source enrollment not found: ${validated.sourceEnrollmentId}`);
  }

  const existing = await findPromotionRecordBySourceEnrollment(validated.sourceEnrollmentId);
  if (existing) {
    throw new PromotionAlreadyDecidedError(
      `A promotion decision has already been recorded for ${sourceEnrollment.student.firstName} ${sourceEnrollment.student.lastName} this year.`,
    );
  }

  const targetAcademicYear = await findAcademicYearById(validated.targetAcademicYearId);
  if (!targetAcademicYear || targetAcademicYear.schoolId !== schoolId) {
    throw new PromotionTargetNotFoundError(
      "The selected target academic year does not exist. Set it up under Academic Configuration first.",
    );
  }

  const targetSchoolClass = await findSchoolClassById(validated.targetSchoolClassId);
  if (!targetSchoolClass || targetSchoolClass.schoolId !== schoolId) {
    throw new PromotionTargetNotFoundError("The selected target class does not exist.");
  }

  const targetSection = await findSectionById(validated.targetSectionId);
  if (
    !targetSection ||
    targetSection.schoolClassId !== validated.targetSchoolClassId ||
    targetSection.academicYearId !== validated.targetAcademicYearId
  ) {
    throw new PromotionTargetNotFoundError(
      `No section "${validated.targetSectionId}" exists for ${targetSchoolClass.name} in ${targetAcademicYear.label} — set up that year's class structure first.`,
    );
  }

  const targetConflict = await findEnrollmentByStudentAndYear(
    sourceEnrollment.studentId,
    validated.targetAcademicYearId,
  );
  if (targetConflict) {
    throw new PromotionTargetConflictError(
      `${sourceEnrollment.student.firstName} ${sourceEnrollment.student.lastName} already has an enrollment in ${targetAcademicYear.label}.`,
    );
  }

  const actor = await findUserById(actorUserId);
  if (!actor) {
    throw new Error(`User not found: ${actorUserId}`);
  }

  const run = async (t: Prisma.TransactionClient) => {
    const resultingEnrollment = await createEnrollment(
      {
        school: { connect: { schoolId } },
        student: { connect: { id: sourceEnrollment.studentId } },
        academicYear: { connect: { id: validated.targetAcademicYearId } },
        section: { connect: { id: validated.targetSectionId } },
        rollNumber: validated.targetRollNumber,
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId,
      entityType: "Enrollment",
      entityId: resultingEnrollment.id,
      actorUserId,
      action: "CREATE",
      afterValue: {
        studentId: sourceEnrollment.studentId,
        academicYearId: validated.targetAcademicYearId,
        sectionId: validated.targetSectionId,
        rollNumber: validated.targetRollNumber,
      },
    });

    const promotionRecord = await createPromotionRecord(
      {
        school: { connect: { schoolId } },
        student: { connect: { id: sourceEnrollment.studentId } },
        sourceEnrollment: { connect: { id: validated.sourceEnrollmentId } },
        resultingEnrollment: { connect: { id: resultingEnrollment.id } },
        outcome: validated.outcome,
        basis: validated.basis,
        decidedByUserId: actorUserId,
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId,
      entityType: "PromotionRecord",
      entityId: promotionRecord.id,
      actorUserId,
      action: "CREATE",
      afterValue: {
        sourceEnrollmentId: validated.sourceEnrollmentId,
        resultingEnrollmentId: resultingEnrollment.id,
        outcome: validated.outcome,
        basis: validated.basis,
      },
    });

    const reloaded = await findPromotionRecordById(promotionRecord.id, t);
    if (!reloaded) {
      throw new Error(`Failed to load newly-created PromotionRecord: ${promotionRecord.id}`);
    }
    return reloaded;
  };

  try {
    const record = await db.$transaction(run);
    return toPromotionRecordDTO(record);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(",") : "";
      if (target.includes("source_enrollment_id")) {
        throw new PromotionAlreadyDecidedError(
          `A promotion decision has already been recorded for ${sourceEnrollment.student.firstName} ${sourceEnrollment.student.lastName} this year.`,
        );
      }
      throw new PromotionTargetConflictError(
        `${sourceEnrollment.student.firstName} ${sourceEnrollment.student.lastName} already has an enrollment in ${targetAcademicYear.label}.`,
      );
    }
    throw error;
  }
}
