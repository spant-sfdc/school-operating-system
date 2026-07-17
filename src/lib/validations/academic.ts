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
