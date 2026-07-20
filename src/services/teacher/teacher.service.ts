import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import { createUser, findUserByEmail } from "@/repositories/user";
import { createTeacher, findTeacherById, updateTeacherStatus } from "@/repositories/teacher";
import { createTeacherQualification } from "@/repositories/teacherQualification";
import {
  createTeacherAssignment,
  deactivateTeacherAssignment,
  findClassTeacherForSection,
  findSubjectAssignment,
  findTeacherAssignmentById,
} from "@/repositories/teacherAssignment";
import {
  registerTeacherInputSchema,
  assignTeacherInputSchema,
  updateTeacherAssignmentInputSchema,
  deactivateTeacherInputSchema,
  type RegisterTeacherInput,
  type AssignTeacherInput,
  type UpdateTeacherAssignmentInput,
  type DeactivateTeacherInput,
} from "@/lib/validations/teacher";
import { toTeacherDTO, type TeacherDTO } from "@/services/teacher/dto/teacher.dto";
import { toTeacherQualificationDTO } from "@/services/teacher/dto/teacherQualification.dto";
import {
  toTeacherAssignmentDTO,
  type TeacherAssignmentDTO,
} from "@/services/teacher/dto/teacherAssignment.dto";

/**
 * Registers a Teacher — the User that authenticates them and the Teacher
 * profile itself, together in one transaction, per
 * docs/database/TRANSACTION_BOUNDARIES.md's "Teacher onboarding" row
 * ("User (create) + Teacher (create) + TeacherQualification × N + AuditLog
 * × (2+N)"). Unlike Sprint 3's Guardian (which could link to an existing
 * row), every Teacher registration creates a fresh User — no plausible
 * "attach Teacher to an already-existing non-teacher User" scenario exists
 * in this domain, so no existing-user branch was built.
 *
 * Not called by any route or UI yet — this sprint is data/infrastructure
 * only.
 *
 * Optional `tx` — same passthrough pattern as
 * src/services/academic/academic.service.ts's createSchoolClassWithSections()
 * (see docs/DECISIONS.md's Sprint D2 entry).
 */
export async function registerTeacher(
  input: RegisterTeacherInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<TeacherDTO> {
  const validated = registerTeacherInputSchema.parse(input);

  const existingUser = await findUserByEmail(validated.email);
  if (existingUser) {
    throw new Error(`A user with email "${validated.email}" already exists.`);
  }

  const run = async (t: Prisma.TransactionClient) => {
    const user = await createUser(
      {
        email: validated.email,
        name: `${validated.firstName} ${validated.lastName}`,
        school: { connect: { schoolId: validated.schoolId } },
        role: { connect: { id: validated.roleId } },
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: validated.schoolId,
      entityType: "User",
      entityId: user.id,
      actorUserId,
      action: "CREATE",
      afterValue: { email: user.email, roleId: validated.roleId },
    });

    const teacher = await createTeacher(
      {
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone,
        gender: validated.gender,
        dateOfBirth: validated.dateOfBirth,
        photoUrl: validated.photoUrl,
        school: { connect: { schoolId: validated.schoolId } },
        user: { connect: { id: user.id } },
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: validated.schoolId,
      entityType: "Teacher",
      entityId: teacher.id,
      actorUserId,
      action: "CREATE",
      afterValue: { userId: user.id, status: teacher.status },
    });

    const qualifications = [];
    for (const q of validated.qualifications ?? []) {
      const qualification = await createTeacherQualification(
        {
          qualificationType: q.qualificationType,
          institution: q.institution,
          yearCompleted: q.yearCompleted,
          certificateDocumentId: q.certificateDocumentId,
          teacher: { connect: { id: teacher.id } },
        },
        t,
      );

      await writeAuditLog(t, {
        schoolId: validated.schoolId,
        entityType: "TeacherQualification",
        entityId: qualification.id,
        actorUserId,
        action: "CREATE",
        afterValue: { qualificationType: qualification.qualificationType },
      });

      qualifications.push(toTeacherQualificationDTO(qualification));
    }

    return toTeacherDTO(teacher, qualifications);
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Assigns a Teacher to a Section for an AcademicYear — either a subject
 * assignment (`subjectId` required) or the Class Teacher designation
 * (`isClassTeacher = true`, `subjectId` omitted). Matches
 * docs/domain/EVENT_MODEL.md's `TeacherAssignmentChanged` event and
 * docs/database/TRANSACTION_BOUNDARIES.md's "one transaction per save
 * action" guidance for assignments.
 *
 * Optional `tx`, same passthrough pattern as registerTeacher() above. The
 * post-create read-back (for the full relational DTO shape) happens via
 * findTeacherAssignmentById(id, t) — the *same* transaction, not a separate
 * post-commit call — since that read is a single findUnique()+include, not
 * a create()+include, and so doesn't hit the decomposition issue
 * createTeacherAssignment()'s own comment describes.
 */
export async function assignTeacher(
  input: AssignTeacherInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<TeacherAssignmentDTO> {
  const validated = assignTeacherInputSchema.parse(input);

  const teacher = await findTeacherById(validated.teacherId);
  if (!teacher) {
    throw new Error(`Teacher not found: ${validated.teacherId}`);
  }

  if (validated.isClassTeacher) {
    const existingClassTeacher = await findClassTeacherForSection(
      validated.sectionId,
      validated.academicYearId,
    );
    if (existingClassTeacher) {
      throw new Error(
        `Section ${validated.sectionId} already has a Class Teacher for this academic year.`,
      );
    }
  } else {
    if (!validated.subjectId) {
      throw new Error("subjectId is required for a subject assignment (isClassTeacher = false).");
    }
    const existingAssignment = await findSubjectAssignment(
      validated.academicYearId,
      validated.sectionId,
      validated.subjectId,
    );
    if (existingAssignment) {
      throw new Error(
        `Section ${validated.sectionId} already has a teacher assigned for this subject this year.`,
      );
    }
  }

  const run = async (t: Prisma.TransactionClient) => {
    const assignment = await createTeacherAssignment(
      {
        teacher: { connect: { id: validated.teacherId } },
        academicYear: { connect: { id: validated.academicYearId } },
        section: { connect: { id: validated.sectionId } },
        subject: validated.subjectId ? { connect: { id: validated.subjectId } } : undefined,
        isClassTeacher: validated.isClassTeacher,
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: teacher.schoolId,
      entityType: "TeacherAssignment",
      entityId: assignment.id,
      actorUserId,
      action: "CREATE",
      afterValue: {
        teacherId: validated.teacherId,
        sectionId: validated.sectionId,
        subjectId: validated.subjectId ?? null,
        isClassTeacher: validated.isClassTeacher,
      },
    });

    const created = await findTeacherAssignmentById(assignment.id, t);
    if (!created) {
      throw new Error(`Failed to load newly-created assignment: ${assignment.id}`);
    }
    return toTeacherAssignmentDTO(created);
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Ends a TeacherAssignment and, if `replacement` is provided, starts a new
 * one in the same transaction — never mutates the existing row's
 * `sectionId`/`subjectId` in place. Per
 * docs/database/DATABASE_REVIEW.md § 7: mutating a live assignment would
 * corrupt the historical fact "who was actually assigned to teach this
 * section/subject during the period the old row was active," which
 * `AttendanceRecord`/`MarksRecord` provenance depends on remaining
 * answerable once those tables exist.
 *
 * Optional `tx`, same passthrough pattern as assignTeacher() above,
 * including the read-back-via-same-tx fix for the replacement assignment.
 */
export async function updateTeacherAssignment(
  input: UpdateTeacherAssignmentInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<{ ended: TeacherAssignmentDTO; replacement?: TeacherAssignmentDTO }> {
  const validated = updateTeacherAssignmentInputSchema.parse(input);

  const existing = await findTeacherAssignmentById(validated.assignmentId);
  if (!existing) {
    throw new Error(`Teacher assignment not found: ${validated.assignmentId}`);
  }

  // Pre-validate the replacement, if any, before opening the transaction —
  // same connection-contention reasoning as Sprint 3's registerStudent()
  // fix: no read should compete with an open transaction for a connection.
  if (validated.replacement) {
    if (validated.replacement.isClassTeacher) {
      const existingClassTeacher = await findClassTeacherForSection(
        validated.replacement.sectionId,
        existing.academicYearId,
      );
      if (existingClassTeacher && existingClassTeacher.id !== existing.id) {
        throw new Error(
          `Section ${validated.replacement.sectionId} already has a Class Teacher for this academic year.`,
        );
      }
    } else if (validated.replacement.subjectId) {
      const existingAssignment = await findSubjectAssignment(
        existing.academicYearId,
        validated.replacement.sectionId,
        validated.replacement.subjectId,
      );
      if (existingAssignment) {
        throw new Error(
          `Section ${validated.replacement.sectionId} already has a teacher assigned for this subject this year.`,
        );
      }
    }
  }

  const run = async (t: Prisma.TransactionClient) => {
    const ended = await deactivateTeacherAssignment(validated.assignmentId, t);

    await writeAuditLog(t, {
      schoolId: existing.teacher.schoolId,
      entityType: "TeacherAssignment",
      entityId: ended.id,
      actorUserId,
      action: "SOFT_DELETE",
      beforeValue: {
        sectionId: existing.sectionId,
        subjectId: existing.subjectId,
        isClassTeacher: existing.isClassTeacher,
      },
    });

    if (!validated.replacement) {
      return { ended: toTeacherAssignmentDTO(existing) };
    }

    const replacement = await createTeacherAssignment(
      {
        teacher: { connect: { id: existing.teacherId } },
        academicYear: { connect: { id: existing.academicYearId } },
        section: { connect: { id: validated.replacement.sectionId } },
        subject: validated.replacement.subjectId
          ? { connect: { id: validated.replacement.subjectId } }
          : undefined,
        isClassTeacher: validated.replacement.isClassTeacher,
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: existing.teacher.schoolId,
      entityType: "TeacherAssignment",
      entityId: replacement.id,
      actorUserId,
      action: "CREATE",
      afterValue: {
        teacherId: existing.teacherId,
        sectionId: validated.replacement.sectionId,
        subjectId: validated.replacement.subjectId ?? null,
        isClassTeacher: validated.replacement.isClassTeacher,
      },
    });

    const replacementDto = await findTeacherAssignmentById(replacement.id, t);
    if (!replacementDto) {
      throw new Error(`Failed to load newly-created assignment: ${replacement.id}`);
    }
    return {
      ended: toTeacherAssignmentDTO(existing),
      replacement: toTeacherAssignmentDTO(replacementDto),
    };
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Deactivates a Teacher (`status = EXITED`) — `status` is the only
 * lifecycle signal, matching `Student`'s precedent. Deliberately does NOT
 * touch the teacher's existing `TeacherAssignment` rows: whether
 * deactivation should end active assignments is a real product decision no
 * document settles, so it's left unmodeled here rather than guessed at.
 *
 * Optional `tx`, same passthrough pattern as registerTeacher() above.
 */
export async function deactivateTeacher(
  input: DeactivateTeacherInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<TeacherDTO> {
  const validated = deactivateTeacherInputSchema.parse(input);

  const teacher = await findTeacherById(validated.teacherId);
  if (!teacher) {
    throw new Error(`Teacher not found: ${validated.teacherId}`);
  }

  const run = async (t: Prisma.TransactionClient) => {
    const updated = await updateTeacherStatus(validated.teacherId, "EXITED", t);

    await writeAuditLog(t, {
      schoolId: teacher.schoolId,
      entityType: "Teacher",
      entityId: teacher.id,
      actorUserId,
      action: "UPDATE",
      beforeValue: { status: teacher.status },
      afterValue: { status: "EXITED" },
    });

    return toTeacherDTO(updated);
  };

  return tx ? run(tx) : db.$transaction(run);
}
