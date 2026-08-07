import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import {
  createAcademicYear as createAcademicYearRow,
  findAcademicYearById,
  findAcademicYearByLabel,
  findCurrentAcademicYear,
  updateAcademicYear as updateAcademicYearRow,
} from "@/repositories/academicYear";
import {
  createAcademicYearInputSchema,
  updateAcademicYearInputSchema,
  activateAcademicYearInputSchema,
  setAcademicYearStatusInputSchema,
  type CreateAcademicYearInput,
  type UpdateAcademicYearInput,
  type ActivateAcademicYearInput,
  type SetAcademicYearStatusInput,
} from "@/lib/validations/academic";
import { toAcademicYearDTO, type AcademicYearDTO } from "@/services/academic/dto/academicYear.dto";

/**
 * Creates a new AcademicYear — "prepare next year," per
 * docs/domain/WORKFLOWS.md § 8's own Step A/B ("Admin creates new
 * AcademicYear... Set promotionPolicy, term structure"). `promotionPolicy`
 * is deliberately not a field this function accepts — Sprint E11's own
 * D-057 finding stands: no document defines its deeper JSON shape, so
 * this sprint continues seeding it as the same honest
 * `{ configured: false }` placeholder `prisma/seed.ts` already uses,
 * never fabricating a shape no school has confirmed. `isCurrent` always
 * starts `false` — a new year never silently becomes operational at
 * creation time; only `activateAcademicYear()` (below) flips it,
 * matching WORKFLOWS.md § 8's own Step E/F ordering (structure is set up
 * *before* the switch, not as a side effect of creating the row).
 */
export async function createAcademicYear(
  input: CreateAcademicYearInput,
  actorUserId: string,
): Promise<AcademicYearDTO> {
  const validated = createAcademicYearInputSchema.parse(input);

  const existing = await findAcademicYearByLabel(validated.schoolId, validated.label);
  if (existing) {
    throw new Error(`An academic year labeled "${validated.label}" already exists at this school.`);
  }

  const run = async (t: Prisma.TransactionClient) => {
    const academicYear = await createAcademicYearRow(
      {
        label: validated.label,
        startDate: validated.startDate,
        endDate: validated.endDate,
        isCurrent: false,
        status: "ACTIVE",
        promotionPolicy: { configured: false, note: "Pending School Admin confirmation" },
        school: { connect: { schoolId: validated.schoolId } },
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: validated.schoolId,
      entityType: "AcademicYear",
      entityId: academicYear.id,
      actorUserId,
      action: "CREATE",
      afterValue: { label: academicYear.label, startDate: academicYear.startDate },
    });

    return academicYear;
  };

  const academicYear = await db.$transaction(run);
  return toAcademicYearDTO(academicYear);
}

/**
 * Edits label/dates only — the same narrow-scoped-edit precedent
 * `updateSchoolDetails()` (Sprint B3) already established for School
 * itself. `promotionPolicy` stays untouched by this function, same
 * reasoning as createAcademicYear() above.
 */
export async function updateAcademicYear(
  input: UpdateAcademicYearInput,
  actorUserId: string,
  schoolId: string,
): Promise<AcademicYearDTO> {
  const validated = updateAcademicYearInputSchema.parse(input);

  const existing = await findAcademicYearById(validated.academicYearId);
  if (!existing || existing.schoolId !== schoolId) {
    throw new Error(`Academic year not found: ${validated.academicYearId}`);
  }
  if (existing.label !== validated.label) {
    const labelConflict = await findAcademicYearByLabel(schoolId, validated.label);
    if (labelConflict) {
      throw new Error(
        `An academic year labeled "${validated.label}" already exists at this school.`,
      );
    }
  }

  const run = async (t: Prisma.TransactionClient) => {
    const updated = await updateAcademicYearRow(
      validated.academicYearId,
      { label: validated.label, startDate: validated.startDate, endDate: validated.endDate },
      t,
    );

    await writeAuditLog(t, {
      schoolId,
      entityType: "AcademicYear",
      entityId: validated.academicYearId,
      actorUserId,
      action: "UPDATE",
      beforeValue: { label: existing.label, startDate: existing.startDate },
      afterValue: { label: updated.label, startDate: updated.startDate },
    });

    return updated;
  };

  const updated = await db.$transaction(run);
  return toAcademicYearDTO(updated);
}

/**
 * Makes an AcademicYear the operational one — docs/domain/WORKFLOWS.md
 * § 8's own Step E+F ("Set previous AcademicYear.isCurrent = false... Set
 * new AcademicYear.isCurrent = true"), done together as one atomic
 * transaction so the schema's own "exactly one isCurrent=true per school"
 * partial-unique-index invariant is never observably violated mid-flight
 * (docs/database/CONSTRAINT_STRATEGY.md § 3). Per that same workflow
 * diagram, this happens *before* Promotion runs (Step G) — Sprint E11's
 * own finalizePromotionDecision() never actually checks `isCurrent`/
 * `status` on its target year (verified by code review), so activation
 * order relative to Promotion is a real, named operational sequencing
 * question, not a hard technical dependency either function enforces.
 */
export async function activateAcademicYear(
  input: ActivateAcademicYearInput,
  actorUserId: string,
  schoolId: string,
): Promise<AcademicYearDTO> {
  const validated = activateAcademicYearInputSchema.parse(input);

  const target = await findAcademicYearById(validated.academicYearId);
  if (!target || target.schoolId !== schoolId) {
    throw new Error(`Academic year not found: ${validated.academicYearId}`);
  }
  if (target.isCurrent) {
    return toAcademicYearDTO(target);
  }

  const previousCurrent = await findCurrentAcademicYear(schoolId);

  const run = async (t: Prisma.TransactionClient) => {
    if (previousCurrent) {
      await updateAcademicYearRow(previousCurrent.id, { isCurrent: false }, t);
      await writeAuditLog(t, {
        schoolId,
        entityType: "AcademicYear",
        entityId: previousCurrent.id,
        actorUserId,
        action: "UPDATE",
        beforeValue: { isCurrent: true },
        afterValue: { isCurrent: false },
      });
    }

    const activated = await updateAcademicYearRow(validated.academicYearId, { isCurrent: true }, t);
    await writeAuditLog(t, {
      schoolId,
      entityType: "AcademicYear",
      entityId: validated.academicYearId,
      actorUserId,
      action: "UPDATE",
      beforeValue: { isCurrent: false },
      afterValue: { isCurrent: true },
    });

    return activated;
  };

  const activated = await db.$transaction(run);
  return toAcademicYearDTO(activated);
}

/**
 * Toggles ACTIVE <-> CLOSED — independent of `isCurrent` (see
 * activateAcademicYear()'s own comment; the two are genuinely different
 * dimensions, per this sprint's own Q1/Q6 answer). Not a destructive
 * operation — `status` is a plain field, not a soft-delete, so "CLOSED"
 * is always reversible back to "ACTIVE" (Q1's own "can a year be
 * reactivated" answer: yes, since neither documented value is terminal).
 */
export async function setAcademicYearStatus(
  input: SetAcademicYearStatusInput,
  actorUserId: string,
  schoolId: string,
): Promise<AcademicYearDTO> {
  const validated = setAcademicYearStatusInputSchema.parse(input);

  const existing = await findAcademicYearById(validated.academicYearId);
  if (!existing || existing.schoolId !== schoolId) {
    throw new Error(`Academic year not found: ${validated.academicYearId}`);
  }

  const run = async (t: Prisma.TransactionClient) => {
    const updated = await updateAcademicYearRow(
      validated.academicYearId,
      { status: validated.status },
      t,
    );

    await writeAuditLog(t, {
      schoolId,
      entityType: "AcademicYear",
      entityId: validated.academicYearId,
      actorUserId,
      action: "UPDATE",
      beforeValue: { status: existing.status },
      afterValue: { status: validated.status },
    });

    return updated;
  };

  const updated = await db.$transaction(run);
  return toAcademicYearDTO(updated);
}
