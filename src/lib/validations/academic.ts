import { z } from "zod";

export const createSchoolClassInputSchema = z.object({
  schoolId: z.string().min(1),
  name: z.string().min(1).max(60),
  sortOrder: z.number().int().min(0),
});
export type CreateSchoolClassInput = z.infer<typeof createSchoolClassInputSchema>;

export const createSectionInputSchema = z.object({
  schoolClassId: z.string().min(1),
  academicYearId: z.string().min(1),
  name: z.string().min(1).max(10),
  capacity: z.number().int().positive().optional(),
});
export type CreateSectionInput = z.infer<typeof createSectionInputSchema>;

export const createSubjectInputSchema = z.object({
  schoolId: z.string().min(1),
  name: z.string().min(1).max(100),
  code: z.string().max(20).optional(),
});
export type CreateSubjectInput = z.infer<typeof createSubjectInputSchema>;

export const createSchoolClassWithSectionsInputSchema = z.object({
  schoolId: z.string().min(1),
  academicYearId: z.string().min(1),
  className: z.string().min(1).max(60),
  sortOrder: z.number().int().min(0),
  sectionNames: z.array(z.string().min(1).max(10)).min(1),
});
export type CreateSchoolClassWithSectionsInput = z.infer<
  typeof createSchoolClassWithSectionsInputSchema
>;

// Sprint E13 — Academic Administration.

export const createAcademicYearInputSchema = z
  .object({
    schoolId: z.string().min(1),
    label: z.string().min(1).max(20),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date.",
    path: ["endDate"],
  });
export type CreateAcademicYearInput = z.input<typeof createAcademicYearInputSchema>;

export const updateAcademicYearInputSchema = z
  .object({
    academicYearId: z.string().min(1),
    label: z.string().min(1).max(20),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date.",
    path: ["endDate"],
  });
export type UpdateAcademicYearInput = z.input<typeof updateAcademicYearInputSchema>;

export const activateAcademicYearInputSchema = z.object({
  academicYearId: z.string().min(1),
});
export type ActivateAcademicYearInput = z.infer<typeof activateAcademicYearInputSchema>;

export const setAcademicYearStatusInputSchema = z.object({
  academicYearId: z.string().min(1),
  status: z.enum(["ACTIVE", "CLOSED"]),
});
export type SetAcademicYearStatusInput = z.infer<typeof setAcademicYearStatusInputSchema>;

export const updateSchoolClassInputSchema = z.object({
  schoolClassId: z.string().min(1),
  name: z.string().min(1).max(60),
  sortOrder: z.number().int().min(0),
});
export type UpdateSchoolClassInput = z.infer<typeof updateSchoolClassInputSchema>;

export const updateSectionInputSchema = z.object({
  sectionId: z.string().min(1),
  name: z.string().min(1).max(10),
  capacity: z.number().int().positive().optional(),
});
export type UpdateSectionInput = z.infer<typeof updateSectionInputSchema>;

export const updateSubjectInputSchema = z.object({
  subjectId: z.string().min(1),
  name: z.string().min(1).max(100),
  code: z.string().max(20).optional(),
});
export type UpdateSubjectInput = z.infer<typeof updateSubjectInputSchema>;

// Reconciles the whole set in one call — "these are the classes this
// subject now applies to" — rather than one add/remove call per class,
// matching updateTeacherAssignment()'s own "soft-delete and replace"
// precedent (D-032).
export const assignSubjectToClassesInputSchema = z.object({
  subjectId: z.string().min(1),
  schoolClassIds: z.array(z.string().min(1)),
});
export type AssignSubjectToClassesInput = z.infer<typeof assignSubjectToClassesInputSchema>;
