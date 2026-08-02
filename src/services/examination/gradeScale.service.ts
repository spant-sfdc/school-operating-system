import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import {
  createGradeScale as createGradeScaleRow,
  findGradeScaleById,
  findGradeScaleByName,
  deactivateGradeScale as deactivateGradeScaleRow,
  listGradeScalesBySchool as listGradeScalesBySchoolRows,
} from "@/repositories/gradeScale";
import {
  findSchoolClassById,
  assignGradeScaleToSchoolClass as assignGradeScaleToSchoolClassRow,
} from "@/repositories/schoolClass";
import {
  createGradeScaleInputSchema,
  deactivateGradeScaleInputSchema,
  type CreateGradeScaleInput,
  type DeactivateGradeScaleInput,
} from "@/lib/validations/examination";
import { toGradeScaleDTO, type GradeScaleDTO } from "@/services/examination/dto/gradeScale.dto";

/**
 * Creates a GradeScale — "no hardcoded grading" (this sprint's own
 * instruction): `type` (MARKS_BASED | GRADE_BASED | HYBRID) and `bands`
 * are entirely school-defined, per DOMAIN_MODEL.md § 8.4 and
 * BUSINESS_RULES.md § 5 ("no specific grading scale is assumed
 * universal... a school may run multiple GradeScales simultaneously").
 * `MARKS_BASED` makes "this class/exam reports marks only" an explicit,
 * nameable configuration choice rather than the *absence* of any
 * GradeScale row — see the Prisma schema's own migration-header comment
 * for why this is a deliberate, additive elaboration, not a redesign.
 *
 * Optional `tx`, the same passthrough pattern every write in this codebase
 * uses.
 */
export async function createGradeScale(
  input: CreateGradeScaleInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<GradeScaleDTO> {
  const validated = createGradeScaleInputSchema.parse(input);

  const existing = await findGradeScaleByName(validated.schoolId, validated.name);
  if (existing) {
    throw new Error(`A grade scale named "${validated.name}" already exists at this school.`);
  }

  const run = async (t: Prisma.TransactionClient) => {
    const gradeScale = await createGradeScaleRow(
      {
        name: validated.name,
        type: validated.type,
        bands: validated.bands,
        school: { connect: { schoolId: validated.schoolId } },
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: validated.schoolId,
      entityType: "GradeScale",
      entityId: gradeScale.id,
      actorUserId,
      action: "CREATE",
      afterValue: { name: gradeScale.name, type: gradeScale.type },
    });

    return toGradeScaleDTO(gradeScale);
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Deactivates (soft-deletes) a GradeScale. No reference guard yet — see
 * gradeScale.repository.ts's own comment on why (nothing references
 * GradeScale until MarksRecord exists, a future sprint's own scope).
 */
export async function deactivateGradeScale(
  input: DeactivateGradeScaleInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<GradeScaleDTO> {
  const validated = deactivateGradeScaleInputSchema.parse(input);

  const existing = await findGradeScaleById(validated.gradeScaleId);
  if (!existing) {
    throw new Error(`Grade scale not found: ${validated.gradeScaleId}`);
  }
  if (existing.deletedAt) {
    throw new Error("This grade scale is already inactive.");
  }

  const run = async (t: Prisma.TransactionClient) => {
    const updated = await deactivateGradeScaleRow(validated.gradeScaleId, t);

    await writeAuditLog(t, {
      schoolId: existing.schoolId,
      entityType: "GradeScale",
      entityId: existing.id,
      actorUserId,
      action: "SOFT_DELETE",
      beforeValue: { deletedAt: null },
      afterValue: { deletedAt: updated.deletedAt },
    });

    return toGradeScaleDTO(updated);
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Lists every active GradeScale for a school — the read a future
 * Examination Setup UI and Sprint E8+ will consume to populate a grade
 * scale picker.
 */
export async function listGradeScalesBySchool(schoolId: string): Promise<GradeScaleDTO[]> {
  const gradeScales = await listGradeScalesBySchoolRows(schoolId);
  return gradeScales.map(toGradeScaleDTO);
}

/**
 * Assigns (or clears, with `gradeScaleId: null`) the GradeScale a
 * SchoolClass's own Report Cards resolve grades against — Sprint E12's
 * own closing of the gap Sprint E10 named ("no schema path connects
 * GradeScale to any Examination"). Per BUSINESS_RULES.md § 5 and
 * DOMAIN_MODEL.md § 8.5, the assignment dimension is SchoolClass, not
 * Examination/ExamTerm/AcademicYear — a school picks one scale (or none)
 * per class, not per exam. Validates both rows belong to the same school
 * before writing; no Admin UI calls this yet (named, unbuilt future
 * work), it exists so Sprint E12's own Report Card generation has a real
 * assignment to read.
 */
export async function assignGradeScaleToSchoolClass(
  schoolClassId: string,
  gradeScaleId: string | null,
  schoolId: string,
  actorUserId: string,
): Promise<void> {
  const schoolClass = await findSchoolClassById(schoolClassId);
  if (!schoolClass || schoolClass.schoolId !== schoolId) {
    throw new Error(`School class not found: ${schoolClassId}`);
  }
  if (gradeScaleId) {
    const gradeScale = await findGradeScaleById(gradeScaleId);
    if (!gradeScale || gradeScale.schoolId !== schoolId) {
      throw new Error(`Grade scale not found: ${gradeScaleId}`);
    }
  }

  await db.$transaction(async (t) => {
    await assignGradeScaleToSchoolClassRow(schoolClassId, gradeScaleId, t);
    await writeAuditLog(t, {
      schoolId,
      entityType: "SchoolClass",
      entityId: schoolClassId,
      actorUserId,
      action: "UPDATE",
      beforeValue: { gradeScaleId: schoolClass.gradeScaleId },
      afterValue: { gradeScaleId },
    });
  });
}
