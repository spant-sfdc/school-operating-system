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

// The symmetric counterpart deactivateTeacherInputSchema always needed but
// never got — see D-052's own "genuine architectural defect" finding:
// Teacher (status ACTIVE -> EXITED, one direction only) was the only
// lifecycle-state entity in this codebase without a documented way back,
// unlike User's deactivateUser()/reactivateUser() pair it otherwise
// mirrors exactly.
export const reactivateTeacherInputSchema = z.object({
  teacherId: z.string().min(1),
});
export type ReactivateTeacherInput = z.infer<typeof reactivateTeacherInputSchema>;

// Sprint E5's own "Edit" Quick Action — every field optional (a partial
// update), `status` deliberately excluded (that's
// reactivateTeacher()/deactivateTeacher()'s own job, never silently
// bundled into a profile edit — mirrors editUserAccountInputSchema's own
// "role changes are a separate, guarded path" precedent).
export const editTeacherProfileInputSchema = z.object({
  teacherId: z.string().min(1),
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  phone: z.string().min(1).max(20).optional(),
  gender: z.string().max(20).optional(),
  dateOfBirth: z.coerce.date().optional(),
  photoUrl: z.url().optional(),
});
export type EditTeacherProfileInput = z.infer<typeof editTeacherProfileInputSchema>;

// The Teacher Directory's own GET-based search form (Sprint E5) — mirrors
// studentSearchInputSchema's own shape exactly (same file's precedent,
// applied to name/email/id/subject/qualification/class/section search,
// Class/Subject Teacher + Qualification filters).
export const teacherSearchInputSchema = z.object({
  query: z.string().max(120).optional(),
  status: z.enum(["ACTIVE", "ON_LEAVE", "EXITED", "ALL"]).optional(),
  classTeacherOnly: z.coerce.boolean().optional(),
  subjectTeacherOnly: z.coerce.boolean().optional(),
  qualificationType: z.string().min(1).optional(),
  schoolClassId: z.string().min(1).optional(),
  sectionId: z.string().min(1).optional(),
  academicYearId: z.string().min(1).optional(),
  sortBy: z.enum(["name", "status", "recent"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
});
export type TeacherSearchInput = z.infer<typeof teacherSearchInputSchema>;
