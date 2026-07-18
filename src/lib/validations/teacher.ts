import { z } from "zod";

export const teacherQualificationInputSchema = z.object({
  qualificationType: z.string().min(1).max(60),
  institution: z.string().max(120).optional(),
  yearCompleted: z.number().int().min(1950).max(2100).optional(),
  certificateDocumentId: z.string().optional(),
});
export type TeacherQualificationInput = z.infer<typeof teacherQualificationInputSchema>;

// Registers a Teacher together with the User that authenticates them — per
// docs/database/TRANSACTION_BOUNDARIES.md's "Teacher onboarding" row, both
// are created in one transaction. `roleId` is caller-supplied (the caller
// looks up the "Teacher" Role first), matching how Sprint 1's
// createIdentityUser() already works — not resolved internally by name.
export const registerTeacherInputSchema = z.object({
  schoolId: z.string().min(1),
  roleId: z.string().min(1),
  email: z.email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().min(1).max(20),
  gender: z.string().max(20).optional(),
  dateOfBirth: z.coerce.date().optional(),
  photoUrl: z.url().optional(),
  qualifications: z.array(teacherQualificationInputSchema).optional(),
});
export type RegisterTeacherInput = z.infer<typeof registerTeacherInputSchema>;

export const assignTeacherInputSchema = z.object({
  teacherId: z.string().min(1),
  academicYearId: z.string().min(1),
  sectionId: z.string().min(1),
  subjectId: z.string().min(1).optional(),
  isClassTeacher: z.boolean().default(false),
});
export type AssignTeacherInput = z.infer<typeof assignTeacherInputSchema>;

// Ends `assignmentId` and, if `replacement` is provided, starts a new
// assignment in the same transaction — docs/database/DATABASE_REVIEW.md
// § 7's own reasoning for why reassignment must never mutate a
// TeacherAssignment row in place (see src/services/teacher/teacher.service.ts).
export const updateTeacherAssignmentInputSchema = z.object({
  assignmentId: z.string().min(1),
  replacement: z
    .object({
      sectionId: z.string().min(1),
      subjectId: z.string().min(1).optional(),
      isClassTeacher: z.boolean().default(false),
    })
    .optional(),
});
export type UpdateTeacherAssignmentInput = z.infer<typeof updateTeacherAssignmentInputSchema>;

export const deactivateTeacherInputSchema = z.object({
  teacherId: z.string().min(1),
});
export type DeactivateTeacherInput = z.infer<typeof deactivateTeacherInputSchema>;
