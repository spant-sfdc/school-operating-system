import { db } from "@/lib/db";
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
 * Not called by any route or UI yet — this sprint is data/infrastructure
 * only. A future "Admin adds a class" flow (Sprint 3+) calls this same
 * function, unchanged.
 */
export async function createSchoolClassWithSections(
  input: CreateSchoolClassWithSectionsInput,
  actorUserId: string,
) {
  const validated = createSchoolClassWithSectionsInputSchema.parse(input);

  const existing = await findSchoolClassByName(validated.schoolId, validated.className);
  if (existing) {
    throw new Error(`A class named "${validated.className}" already exists at this school.`);
  }

  return db.$transaction(async (tx) => {
    const schoolClass = await createSchoolClass(
      {
        name: validated.className,
        sortOrder: validated.sortOrder,
        school: { connect: { schoolId: validated.schoolId } },
      },
      tx,
    );

    await writeAuditLog(tx, {
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
        tx,
      );

      await writeAuditLog(tx, {
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
  });
}

/**
 * Creates a Subject. School-scoped only in this migration — `Subject` isn't
 * linked to any `SchoolClass` yet; that join (`ClassSubject`, per
 * docs/database/MIGRATION_PLAN.md's original "Migration 002" row) is
 * deliberately out of this sprint's scope.
 */
export async function createAcademicSubject(input: CreateSubjectInput, actorUserId: string) {
  const validated = createSubjectInputSchema.parse(input);

  const existing = await findSubjectByName(validated.schoolId, validated.name);
  if (existing) {
    throw new Error(`A subject named "${validated.name}" already exists at this school.`);
  }

  return db.$transaction(async (tx) => {
    const subject = await createSubject(
      {
        name: validated.name,
        code: validated.code,
        school: { connect: { schoolId: validated.schoolId } },
      },
      tx,
    );

    await writeAuditLog(tx, {
      schoolId: validated.schoolId,
      entityType: "Subject",
      entityId: subject.id,
      actorUserId,
      action: "CREATE",
      afterValue: { name: subject.name, code: subject.code },
    });

    return subject;
  });
}
