import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import { createSchoolClass, findSchoolClassByName } from "@/repositories/schoolClass";
import { createSection } from "@/repositories/section";
import { createSubject, findSubjectByName } from "@/repositories/subject";
import {
  createSchoolClassWithSectionsInputSchema,
  createSubjectInputSchema,
  type CreateSchoolClassWithSectionsInput,
  type CreateSubjectInput,
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
 * Creates a Subject. School-scoped only in this migration — `Subject` isn't
 * linked to any `SchoolClass` yet; that join (`ClassSubject`, per
 * docs/database/MIGRATION_PLAN.md's original "Migration 002" row) is
 * deliberately out of this sprint's scope.
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
