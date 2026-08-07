import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import {
  createSchoolClass,
  findSchoolClassById,
  findSchoolClassByName,
  updateSchoolClass as updateSchoolClassRow,
  deactivateSchoolClass as deactivateSchoolClassRow,
  reactivateSchoolClass as reactivateSchoolClassRow,
} from "@/repositories/schoolClass";
import {
  createSection,
  findSectionById,
  updateSection as updateSectionRow,
  deactivateSection as deactivateSectionRow,
  reactivateSection as reactivateSectionRow,
} from "@/repositories/section";
import {
  createSubject,
  findSubjectById,
  findSubjectByName,
  updateSubject as updateSubjectRow,
  deactivateSubject as deactivateSubjectRow,
  reactivateSubject as reactivateSubjectRow,
} from "@/repositories/subject";
import {
  findClassSubject,
  listSubjectsForClass,
  listClassesForSubject,
  createClassSubject,
  deactivateClassSubject,
  reactivateClassSubject,
} from "@/repositories/classSubject";
import {
  createSchoolClassWithSectionsInputSchema,
  createSectionInputSchema,
  createSubjectInputSchema,
  updateSchoolClassInputSchema,
  updateSectionInputSchema,
  updateSubjectInputSchema,
  assignSubjectToClassesInputSchema,
  type CreateSchoolClassWithSectionsInput,
  type CreateSectionInput,
  type CreateSubjectInput,
  type UpdateSchoolClassInput,
  type UpdateSectionInput,
  type UpdateSubjectInput,
  type AssignSubjectToClassesInput,
} from "@/lib/validations/academic";

/**
 * Creates a SchoolClass and its Sections together — the natural unit of
 * "setting up a class" (a class with no sections, or a section with no
 * class, serves no product purpose). Per
 * docs/database/TRANSACTION_BOUNDARIES.md § 1, the class, its sections, and
 * their own AuditLog entries are written in one transaction.
 *
 * Called directly by the manual Admin flow (no `tx`, this function opens
 * its own transaction as before) and by the Academic Structure Importer's
 * own commit handler (Sprint D1's `commitImportBatchChunk()` already opens
 * a per-row transaction and needs this function's writes — and its own
 * AuditLog entries — to land inside that *same* transaction, not a second,
 * independent one; the entity write and the ImportRow status update must
 * both succeed or both roll back together, so a crash between them can
 * never leave one done and the other not). The optional `tx` parameter is
 * the same passthrough pattern every repository in this codebase already
 * uses — see docs/DECISIONS.md's Sprint D2 entry for why this was a real
 * gap, not a pattern applied speculatively.
 */
export async function createSchoolClassWithSections(
  input: CreateSchoolClassWithSectionsInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
) {
  const validated = createSchoolClassWithSectionsInputSchema.parse(input);

  const existing = await findSchoolClassByName(validated.schoolId, validated.className);
  if (existing) {
    throw new Error(`A class named "${validated.className}" already exists at this school.`);
  }

  const run = async (t: Prisma.TransactionClient) => {
    const schoolClass = await createSchoolClass(
      {
        name: validated.className,
        sortOrder: validated.sortOrder,
        school: { connect: { schoolId: validated.schoolId } },
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: validated.schoolId,
      entityType: "SchoolClass",
      entityId: schoolClass.id,
      actorUserId,
      action: "CREATE",
      afterValue: { name: schoolClass.name, sortOrder: schoolClass.sortOrder },
    });

    const sections = [];
    for (const sectionName of validated.sectionNames) {
      const section = await createSection(
        {
          name: sectionName,
          schoolClass: { connect: { id: schoolClass.id } },
          academicYear: { connect: { id: validated.academicYearId } },
        },
        t,
      );

      await writeAuditLog(t, {
        schoolId: validated.schoolId,
        entityType: "Section",
        entityId: section.id,
        actorUserId,
        action: "CREATE",
        afterValue: { name: section.name, schoolClassId: schoolClass.id },
      });

      sections.push(section);
    }

    return { schoolClass, sections };
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Creates a Subject. School-scoped, permanent — not year-scoped, per
 * Sprint E13's own reconfirmed Q5 answer. The `ClassSubject` join
 * (`docs/database/MIGRATION_PLAN.md`'s original "Migration 002" row,
 * deferred since Sprint 2's own D-030) now exists — see
 * assignSubjectToClasses() below — but a Subject itself is still created
 * independently of any class, exactly as before; assignment is a
 * separate, later step.
 *
 * Optional `tx`, same reasoning as createSchoolClassWithSections() above —
 * see docs/DECISIONS.md's Sprint D2 entry.
 */
export async function createAcademicSubject(
  input: CreateSubjectInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
) {
  const validated = createSubjectInputSchema.parse(input);

  const existing = await findSubjectByName(validated.schoolId, validated.name);
  if (existing) {
    throw new Error(`A subject named "${validated.name}" already exists at this school.`);
  }

  const run = async (t: Prisma.TransactionClient) => {
    const subject = await createSubject(
      {
        name: validated.name,
        code: validated.code,
        school: { connect: { schoolId: validated.schoolId } },
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: validated.schoolId,
      entityType: "Subject",
      entityId: subject.id,
      actorUserId,
      action: "CREATE",
      afterValue: { name: subject.name, code: subject.code },
    });

    return subject;
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Adds one Section to an already-existing SchoolClass — Sprint E13's own
 * "roll over sections into a new year" / "add a section mid-year"
 * capability, per docs/domain/WORKFLOWS.md § 8's own Step C
 * ("Create/roll-over Sections per Class"). Deliberately distinct from
 * createSchoolClassWithSections() above (which creates a *new* class plus
 * its first sections together) — this is the standalone primitive that
 * function's own internal loop already used, now exposed as its own
 * top-level entry point for a class that already exists.
 *
 * Unlike createSchoolClassWithSections()/createAcademicSubject() (whose
 * `schoolId` comes from validated input, itself always the caller's own
 * session.schoolId — see those functions' own callers), this function is
 * reached with a raw `schoolClassId`, so it takes `schoolId` explicitly
 * and verifies ownership before writing — the same cross-school guard
 * updateSection()/deactivateSection() already enforce via
 * assertSectionInSchool() below.
 */
export async function createStandaloneSection(
  input: CreateSectionInput,
  actorUserId: string,
  schoolId: string,
  tx?: Prisma.TransactionClient,
) {
  const validated = createSectionInputSchema.parse(input);

  const schoolClass = await findSchoolClassById(validated.schoolClassId);
  if (!schoolClass || schoolClass.schoolId !== schoolId) {
    throw new Error(`Class not found: ${validated.schoolClassId}`);
  }

  const run = async (t: Prisma.TransactionClient) => {
    const section = await createSection(
      {
        name: validated.name,
        capacity: validated.capacity,
        schoolClass: { connect: { id: validated.schoolClassId } },
        academicYear: { connect: { id: validated.academicYearId } },
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: schoolClass.schoolId,
      entityType: "Section",
      entityId: section.id,
      actorUserId,
      action: "CREATE",
      afterValue: {
        name: section.name,
        schoolClassId: validated.schoolClassId,
        academicYearId: validated.academicYearId,
      },
    });

    return section;
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Edits a SchoolClass's name/sortOrder. A permanent, non-year-scoped
 * row — renaming ripples live across every year's own historical
 * display (Enrollment, Academic History, Promotion), except an
 * already-generated ReportCard.snapshot, which is frozen (Sprint E12,
 * unchanged) — a real, named characteristic of this entity's own design
 * since Sprint 2, not a new risk this function introduces.
 */
export async function updateSchoolClass(
  input: UpdateSchoolClassInput,
  actorUserId: string,
  schoolId: string,
) {
  const validated = updateSchoolClassInputSchema.parse(input);

  const existing = await findSchoolClassById(validated.schoolClassId);
  if (!existing || existing.schoolId !== schoolId) {
    throw new Error(`Class not found: ${validated.schoolClassId}`);
  }
  if (existing.name !== validated.name) {
    const conflict = await findSchoolClassByName(schoolId, validated.name);
    if (conflict) {
      throw new Error(`A class named "${validated.name}" already exists at this school.`);
    }
  }

  return db.$transaction(async (t) => {
    const updated = await updateSchoolClassRow(
      validated.schoolClassId,
      { name: validated.name, sortOrder: validated.sortOrder },
      t,
    );
    await writeAuditLog(t, {
      schoolId,
      entityType: "SchoolClass",
      entityId: validated.schoolClassId,
      actorUserId,
      action: "UPDATE",
      beforeValue: { name: existing.name, sortOrder: existing.sortOrder },
      afterValue: { name: updated.name, sortOrder: updated.sortOrder },
    });
    return updated;
  });
}

export async function deactivateSchoolClass(
  schoolClassId: string,
  actorUserId: string,
  schoolId: string,
) {
  const existing = await findSchoolClassById(schoolClassId);
  if (!existing || existing.schoolId !== schoolId) {
    throw new Error(`Class not found: ${schoolClassId}`);
  }
  return db.$transaction(async (t) => {
    const updated = await deactivateSchoolClassRow(schoolClassId, t);
    await writeAuditLog(t, {
      schoolId,
      entityType: "SchoolClass",
      entityId: schoolClassId,
      actorUserId,
      action: "SOFT_DELETE",
      beforeValue: { deletedAt: null },
      afterValue: { deletedAt: updated.deletedAt },
    });
    return updated;
  });
}

export async function reactivateSchoolClass(
  schoolClassId: string,
  actorUserId: string,
  schoolId: string,
) {
  const existing = await findSchoolClassById(schoolClassId);
  if (!existing || existing.schoolId !== schoolId) {
    throw new Error(`Class not found: ${schoolClassId}`);
  }
  return db.$transaction(async (t) => {
    const updated = await reactivateSchoolClassRow(schoolClassId, t);
    await writeAuditLog(t, {
      schoolId,
      entityType: "SchoolClass",
      entityId: schoolClassId,
      actorUserId,
      action: "UPDATE",
      beforeValue: { deletedAt: existing.deletedAt },
      afterValue: { deletedAt: null },
    });
    return updated;
  });
}

/** Edits a Section's name/capacity. */
export async function updateSection(
  input: UpdateSectionInput,
  actorUserId: string,
  schoolId: string,
) {
  const validated = updateSectionInputSchema.parse(input);

  const existing = await findSectionById(validated.sectionId);
  if (!existing) {
    throw new Error(`Section not found: ${validated.sectionId}`);
  }
  const schoolClass = await findSchoolClassById(existing.schoolClassId);
  if (!schoolClass || schoolClass.schoolId !== schoolId) {
    throw new Error(`Section not found: ${validated.sectionId}`);
  }

  return db.$transaction(async (t) => {
    const updated = await updateSectionRow(
      validated.sectionId,
      { name: validated.name, capacity: validated.capacity },
      t,
    );
    await writeAuditLog(t, {
      schoolId,
      entityType: "Section",
      entityId: validated.sectionId,
      actorUserId,
      action: "UPDATE",
      beforeValue: { name: existing.name, capacity: existing.capacity },
      afterValue: { name: updated.name, capacity: updated.capacity },
    });
    return updated;
  });
}

async function assertSectionInSchool(sectionId: string, schoolId: string) {
  const section = await findSectionById(sectionId);
  if (!section) {
    throw new Error(`Section not found: ${sectionId}`);
  }
  const schoolClass = await findSchoolClassById(section.schoolClassId);
  if (!schoolClass || schoolClass.schoolId !== schoolId) {
    throw new Error(`Section not found: ${sectionId}`);
  }
  return section;
}

export async function deactivateSection(sectionId: string, actorUserId: string, schoolId: string) {
  await assertSectionInSchool(sectionId, schoolId);
  return db.$transaction(async (t) => {
    const updated = await deactivateSectionRow(sectionId, t);
    await writeAuditLog(t, {
      schoolId,
      entityType: "Section",
      entityId: sectionId,
      actorUserId,
      action: "SOFT_DELETE",
      beforeValue: { deletedAt: null },
      afterValue: { deletedAt: updated.deletedAt },
    });
    return updated;
  });
}

export async function reactivateSection(sectionId: string, actorUserId: string, schoolId: string) {
  const existing = await assertSectionInSchool(sectionId, schoolId);
  return db.$transaction(async (t) => {
    const updated = await reactivateSectionRow(sectionId, t);
    await writeAuditLog(t, {
      schoolId,
      entityType: "Section",
      entityId: sectionId,
      actorUserId,
      action: "UPDATE",
      beforeValue: { deletedAt: existing.deletedAt },
      afterValue: { deletedAt: null },
    });
    return updated;
  });
}

/** Edits a Subject's name/code. */
export async function updateSubject(
  input: UpdateSubjectInput,
  actorUserId: string,
  schoolId: string,
) {
  const validated = updateSubjectInputSchema.parse(input);

  const existing = await findSubjectById(validated.subjectId);
  if (!existing || existing.schoolId !== schoolId) {
    throw new Error(`Subject not found: ${validated.subjectId}`);
  }
  if (existing.name !== validated.name) {
    const conflict = await findSubjectByName(schoolId, validated.name);
    if (conflict) {
      throw new Error(`A subject named "${validated.name}" already exists at this school.`);
    }
  }

  return db.$transaction(async (t) => {
    const updated = await updateSubjectRow(
      validated.subjectId,
      { name: validated.name, code: validated.code },
      t,
    );
    await writeAuditLog(t, {
      schoolId,
      entityType: "Subject",
      entityId: validated.subjectId,
      actorUserId,
      action: "UPDATE",
      beforeValue: { name: existing.name, code: existing.code },
      afterValue: { name: updated.name, code: updated.code },
    });
    return updated;
  });
}

export async function deactivateSubject(subjectId: string, actorUserId: string, schoolId: string) {
  const existing = await findSubjectById(subjectId);
  if (!existing || existing.schoolId !== schoolId) {
    throw new Error(`Subject not found: ${subjectId}`);
  }
  return db.$transaction(async (t) => {
    const updated = await deactivateSubjectRow(subjectId, t);
    await writeAuditLog(t, {
      schoolId,
      entityType: "Subject",
      entityId: subjectId,
      actorUserId,
      action: "SOFT_DELETE",
      beforeValue: { deletedAt: null },
      afterValue: { deletedAt: updated.deletedAt },
    });
    return updated;
  });
}

export async function reactivateSubject(subjectId: string, actorUserId: string, schoolId: string) {
  const existing = await findSubjectById(subjectId);
  if (!existing || existing.schoolId !== schoolId) {
    throw new Error(`Subject not found: ${subjectId}`);
  }
  return db.$transaction(async (t) => {
    const updated = await reactivateSubjectRow(subjectId, t);
    await writeAuditLog(t, {
      schoolId,
      entityType: "Subject",
      entityId: subjectId,
      actorUserId,
      action: "UPDATE",
      beforeValue: { deletedAt: existing.deletedAt },
      afterValue: { deletedAt: null },
    });
    return updated;
  });
}

/**
 * Reconciles which Classes a Subject applies to — "these are the classes
 * now" in one call, not one add/remove per class. Mirrors
 * updateTeacherAssignment()'s own "soft-delete and replace" precedent
 * (D-032): a class removed from the set gets its own `ClassSubject` row
 * soft-deleted (never hard-deleted — a class re-added later reactivates
 * the same row rather than creating a duplicate, since
 * `@@unique([schoolClassId, subjectId])` permits only one regardless of
 * its own deletedAt history).
 */
export async function assignSubjectToClasses(
  input: AssignSubjectToClassesInput,
  actorUserId: string,
  schoolId: string,
) {
  const validated = assignSubjectToClassesInputSchema.parse(input);

  const subject = await findSubjectById(validated.subjectId);
  if (!subject || subject.schoolId !== schoolId) {
    throw new Error(`Subject not found: ${validated.subjectId}`);
  }
  for (const schoolClassId of validated.schoolClassIds) {
    const schoolClass = await findSchoolClassById(schoolClassId);
    if (!schoolClass || schoolClass.schoolId !== schoolId) {
      throw new Error(`Class not found: ${schoolClassId}`);
    }
  }

  const currentLinks = await listClassesForSubject(validated.subjectId);

  return db.$transaction(async (t) => {
    const desired = new Set(validated.schoolClassIds);

    for (const schoolClassId of desired) {
      const existingLink = await findClassSubject(schoolClassId, validated.subjectId);
      if (existingLink && existingLink.deletedAt) {
        await reactivateClassSubject(existingLink.id, t);
      } else if (!existingLink) {
        const created = await createClassSubject(
          {
            schoolClass: { connect: { id: schoolClassId } },
            subject: { connect: { id: validated.subjectId } },
          },
          t,
        );
        await writeAuditLog(t, {
          schoolId,
          entityType: "ClassSubject",
          entityId: created.id,
          actorUserId,
          action: "CREATE",
          afterValue: { schoolClassId, subjectId: validated.subjectId },
        });
      }
    }

    for (const link of currentLinks) {
      if (!desired.has(link.schoolClassId)) {
        await deactivateClassSubject(link.id, t);
        await writeAuditLog(t, {
          schoolId,
          entityType: "ClassSubject",
          entityId: link.id,
          actorUserId,
          action: "SOFT_DELETE",
          beforeValue: { deletedAt: null },
          afterValue: { schoolClassId: link.schoolClassId, subjectId: validated.subjectId },
        });
      }
    }

    await writeAuditLog(t, {
      schoolId,
      entityType: "Subject",
      entityId: validated.subjectId,
      actorUserId,
      action: "UPDATE",
      afterValue: { assignedClassIds: Array.from(desired) },
    });

    return { subjectId: validated.subjectId, schoolClassIds: Array.from(desired) };
  });
}

/**
 * Reads which Subjects a Class currently studies — the Class Detail
 * page's own "Subjects" panel (Phase 5/7). School-scoped via the Class
 * lookup, same pattern as every other read in this file.
 */
export async function listSubjectsForSchoolClass(schoolClassId: string, schoolId: string) {
  const schoolClass = await findSchoolClassById(schoolClassId);
  if (!schoolClass || schoolClass.schoolId !== schoolId) {
    throw new Error(`Class not found: ${schoolClassId}`);
  }
  return listSubjectsForClass(schoolClassId);
}
