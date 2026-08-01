import { z } from "zod";

// Examination Foundation (Sprint E7) — mirrors this file's established
// siblings (validations/teacher.ts, validations/student.ts) exactly:
// every write is a narrow, purpose-built input schema, not a generic
// "partial model" shape.

export const createExamTermInputSchema = z.object({
  schoolId: z.string().min(1),
  academicYearId: z.string().min(1),
  // Deliberately free text, not an enum — "Unit Test 1" | "Half-Yearly" |
  // "Annual" | "FA1" | a school's own custom term name. See
  // DOMAIN_MODEL.md § 8.1.
  name: z.string().min(1).max(80),
  sortOrder: z.number().int().min(0),
  weightagePercent: z.number().int().min(0).max(100).optional(),
});
export type CreateExamTermInput = z.infer<typeof createExamTermInputSchema>;

export const deactivateExamTermInputSchema = z.object({
  examTermId: z.string().min(1),
});
export type DeactivateExamTermInput = z.infer<typeof deactivateExamTermInputSchema>;

export const createExaminationInputSchema = z.object({
  schoolId: z.string().min(1),
  examTermId: z.string().min(1),
  academicYearId: z.string().min(1),
  schoolClassId: z.string().min(1),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
export type CreateExaminationInput = z.infer<typeof createExaminationInputSchema>;

export const publishExaminationInputSchema = z.object({
  examinationId: z.string().min(1),
});
export type PublishExaminationInput = z.infer<typeof publishExaminationInputSchema>;

export const completeExaminationInputSchema = z.object({
  examinationId: z.string().min(1),
});
export type CompleteExaminationInput = z.infer<typeof completeExaminationInputSchema>;

export const archiveExaminationInputSchema = z.object({
  examinationId: z.string().min(1),
});
export type ArchiveExaminationInput = z.infer<typeof archiveExaminationInputSchema>;

// scheduleSubjectExam() — one Subject's schedule within an already-created
// Examination. `passMarks <= maxMarks` directly implements
// BUSINESS_RULES.md § 5's own universal (Code, not Configuration) rule.
export const scheduleSubjectExamInputSchema = z
  .object({
    examinationId: z.string().min(1),
    subjectId: z.string().min(1),
    // Informational only — see the schema's own migration-header comment
    // for why this never becomes the marks-entry authority.
    teacherId: z.string().min(1).optional(),
    examDate: z.coerce.date().optional(),
    maxMarks: z.number().int().min(1),
    passMarks: z.number().int().min(0),
    durationMinutes: z.number().int().min(1).optional(),
    room: z.string().max(40).optional(),
    instructions: z.string().max(500).optional(),
  })
  .refine((data) => data.passMarks <= data.maxMarks, {
    message: "Passing marks cannot exceed maximum marks.",
    path: ["passMarks"],
  });
export type ScheduleSubjectExamInput = z.infer<typeof scheduleSubjectExamInputSchema>;

// GradeScale — "No hardcoded grading" (this sprint's own instruction):
// `bands` is validated only for shape (a non-overlapping-bands business
// check belongs to a future sprint that actually derives grades from it,
// per BUSINESS_RULES.md § 5 — MarksRecord doesn't exist yet this sprint).
export const gradeBandInputSchema = z.object({
  minPercent: z.number().min(0).max(100),
  maxPercent: z.number().min(0).max(100),
  grade: z.string().min(1).max(20),
  gradePoint: z.number().min(0).optional(),
});
export type GradeBandInput = z.infer<typeof gradeBandInputSchema>;

export const createGradeScaleInputSchema = z.object({
  schoolId: z.string().min(1),
  name: z.string().min(1).max(80),
  type: z.enum(["MARKS_BASED", "GRADE_BASED", "HYBRID"]),
  // A valid empty array when type = MARKS_BASED — required for
  // GRADE_BASED/HYBRID, enforced here rather than at the schema level
  // (Prisma's Json column can't express a conditional requirement).
  bands: z.array(gradeBandInputSchema).default([]),
});
export type CreateGradeScaleInput = z.infer<typeof createGradeScaleInputSchema>;

export const deactivateGradeScaleInputSchema = z.object({
  gradeScaleId: z.string().min(1),
});
export type DeactivateGradeScaleInput = z.infer<typeof deactivateGradeScaleInputSchema>;
