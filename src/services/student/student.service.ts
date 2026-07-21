import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/db-utils";
import type { Guardian, Prisma } from "@/generated/prisma/client";
import type { RelationshipType } from "@/generated/prisma/enums";
import {
  createStudent,
  findStudentByAdmissionNumber,
  findStudentById,
  linkGuardianToStudent,
} from "@/repositories/student";
import { createGuardian, findGuardianById } from "@/repositories/guardian";
import {
  createEnrollment,
  findEnrollmentById,
  findEnrollmentByStudentAndYear,
} from "@/repositories/enrollment";
import {
  registerStudentInputSchema,
  enrollStudentInputSchema,
  type RegisterStudentInput,
  type EnrollStudentInput,
} from "@/lib/validations/student";
import { toStudentDTO, type StudentDTO } from "@/services/student/student.dto";
import { toEnrollmentDTO, type EnrollmentDTO } from "@/services/student/enrollment.dto";

/**
 * Registers a new Student — the "durable identity" lifecycle step
 * (docs/database/DATABASE_REVIEW.md § 1's "Identity vs. Fact" principle).
 * Deliberately does NOT create an Enrollment — that's a separate lifecycle
 * step (`enrollStudent`, below), matching docs/domain/EVENT_MODEL.md's own
 * `StudentEnrolled` event being distinct from student creation. A future
 * Admission confirmation flow (out of this sprint's scope) would call both
 * in sequence, composing them into one larger transaction per
 * docs/database/TRANSACTION_BOUNDARIES.md's "Admission confirmation" row —
 * not decided here, since Admission itself isn't built yet.
 *
 * Not called by any route or UI yet — this sprint is data/infrastructure
 * only.
 *
 * Optional `tx` — same passthrough pattern as
 * src/services/academic/academic.service.ts's createSchoolClassWithSections()
 * (see docs/DECISIONS.md's Sprint D2 entry), so a future Student Importer's
 * commit handler can compose this into its own per-row transaction rather
 * than opening a second, independent one.
 */
export async function registerStudent(
  input: RegisterStudentInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<StudentDTO> {
  const validated = registerStudentInputSchema.parse(input);

  const existing = await findStudentByAdmissionNumber(
    validated.schoolId,
    validated.admissionNumber,
  );
  if (existing) {
    throw new Error(
      `A student with admission number "${validated.admissionNumber}" already exists at this school.`,
    );
  }

  // Resolve every referenced existing Guardian *before* opening the
  // transaction below — reads issued through the shared `db` singleton
  // while a `tx` from the same connection pool is active can contend for
  // Neon's limited concurrent connections (surfaced during this sprint's
  // verification as a real "client already executing a query" warning, not
  // just a theoretical concern). Everything inside the transaction below is
  // therefore either a plain write via `tx`, or reuses an already-fetched
  // object from this pre-resolution pass — no read ever competes with the
  // open transaction for a connection.
  const guardianLinks = validated.guardians ?? [];
  const resolvedExistingGuardians = new Map<string, Guardian>();
  for (const link of guardianLinks) {
    if (!link.guardianId) continue;
    resolvedExistingGuardians.set(link.guardianId, await requireExistingGuardian(link.guardianId));
  }

  const run = async (t: Prisma.TransactionClient) => {
    const student = await createStudent(
      {
        firstName: validated.firstName,
        lastName: validated.lastName,
        dateOfBirth: validated.dateOfBirth,
        gender: validated.gender,
        photoUrl: validated.photoUrl,
        udisePen: validated.udisePen,
        admissionNumber: validated.admissionNumber,
        category: validated.category,
        school: { connect: { schoolId: validated.schoolId } },
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: validated.schoolId,
      entityType: "Student",
      entityId: student.id,
      actorUserId,
      action: "CREATE",
      afterValue: { admissionNumber: student.admissionNumber, status: student.status },
    });

    const resolvedLinks: Array<{
      guardian: Guardian;
      relationshipType: RelationshipType;
      isPrimaryContact: boolean;
      isAuthorizedForPickup: boolean;
    }> = [];

    for (const link of guardianLinks) {
      const guardian = link.guardianId
        ? resolvedExistingGuardians.get(link.guardianId)!
        : await createGuardian(
            {
              ...link.newGuardian!,
              school: { connect: { schoolId: validated.schoolId } },
            },
            t,
          );

      await linkGuardianToStudent(
        {
          student: { connect: { id: student.id } },
          guardian: { connect: { id: guardian.id } },
          relationshipType: link.relationshipType,
          isPrimaryContact: link.isPrimaryContact,
          isAuthorizedForPickup: link.isAuthorizedForPickup,
        },
        t,
      );

      await writeAuditLog(t, {
        schoolId: validated.schoolId,
        entityType: "StudentGuardian",
        entityId: `${student.id}:${guardian.id}`,
        actorUserId,
        action: "CREATE",
        afterValue: { relationshipType: link.relationshipType },
      });

      resolvedLinks.push({
        guardian,
        relationshipType: link.relationshipType,
        isPrimaryContact: link.isPrimaryContact,
        isAuthorizedForPickup: link.isAuthorizedForPickup,
      });
    }

    return toStudentDTO(student, resolvedLinks);
  };

  return tx ? run(tx) : db.$transaction(run);
}

async function requireExistingGuardian(guardianId: string) {
  const guardian = await findGuardianById(guardianId);
  if (!guardian) {
    throw new Error(`Guardian not found: ${guardianId}`);
  }
  return guardian;
}

/**
 * Enrolls an existing Student into a Section for an AcademicYear — the
 * "temporal fact" lifecycle step, matching docs/domain/EVENT_MODEL.md's
 * `StudentEnrolled` event exactly (studentId, enrollmentId, academicYearId,
 * sectionId, rollNumber). Reusable for a student's first enrollment and for
 * every subsequent year's re-enrollment — enrolling a returning student
 * never re-registers them.
 *
 * Optional `tx`, same passthrough pattern as registerStudent() above.
 */
export async function enrollStudent(
  input: EnrollStudentInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<EnrollmentDTO> {
  const validated = enrollStudentInputSchema.parse(input);

  const student = await findStudentById(validated.studentId);
  if (!student) {
    throw new Error(`Student not found: ${validated.studentId}`);
  }

  const existingEnrollment = await findEnrollmentByStudentAndYear(
    validated.studentId,
    validated.academicYearId,
  );
  if (existingEnrollment) {
    throw new Error(
      `Student ${validated.studentId} is already enrolled for academic year ${validated.academicYearId}.`,
    );
  }

  const run = async (t: Prisma.TransactionClient) => {
    const enrollment = await createEnrollment(
      {
        student: { connect: { id: validated.studentId } },
        academicYear: { connect: { id: validated.academicYearId } },
        section: { connect: { id: validated.sectionId } },
        rollNumber: validated.rollNumber,
        school: { connect: { schoolId: student.schoolId } },
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: student.schoolId,
      entityType: "Enrollment",
      entityId: enrollment.id,
      actorUserId,
      action: "CREATE",
      afterValue: {
        studentId: validated.studentId,
        academicYearId: validated.academicYearId,
        sectionId: validated.sectionId,
        rollNumber: validated.rollNumber,
      },
    });

    const created = await findEnrollmentById(enrollment.id, t);
    if (!created) {
      throw new Error(`Failed to load newly-created enrollment: ${enrollment.id}`);
    }
    return toEnrollmentDTO(created);
  };

  return tx ? run(tx) : db.$transaction(run);
}
