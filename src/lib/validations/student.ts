import { z } from "zod";

// Must match the Prisma `RelationshipType` enum (prisma/schema.prisma)
// exactly — docs/domain/DOMAIN_MODEL.md § 4.4 / ENUM_STRATEGY.md § 2.
export const relationshipTypeSchema = z.enum(["FATHER", "MOTHER", "LEGAL_GUARDIAN", "OTHER"]);

export const newGuardianInputSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().min(1).max(20),
  email: z.email().optional(),
  address: z.string().max(280).optional(),
});
export type NewGuardianInput = z.infer<typeof newGuardianInputSchema>;

// Exactly one of `guardianId` (link an existing Guardian) or `newGuardian`
// (create one) must be provided.
export const guardianLinkInputSchema = z
  .object({
    guardianId: z.string().min(1).optional(),
    newGuardian: newGuardianInputSchema.optional(),
    relationshipType: relationshipTypeSchema,
    isPrimaryContact: z.boolean().default(false),
    isAuthorizedForPickup: z.boolean().default(false),
  })
  .refine((data) => Boolean(data.guardianId) !== Boolean(data.newGuardian), {
    message: "Provide exactly one of guardianId or newGuardian, not both or neither.",
  });
export type GuardianLinkInput = z.infer<typeof guardianLinkInputSchema>;

export const registerStudentInputSchema = z.object({
  schoolId: z.string().min(1),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  dateOfBirth: z.coerce.date(),
  gender: z.string().max(20).optional(),
  photoUrl: z.url().optional(),
  udisePen: z.string().max(20).optional(),
  admissionNumber: z.string().min(1).max(40),
  category: z.string().max(40).optional(),
  guardians: z.array(guardianLinkInputSchema).optional(),
});
export type RegisterStudentInput = z.infer<typeof registerStudentInputSchema>;

export const enrollStudentInputSchema = z.object({
  studentId: z.string().min(1),
  academicYearId: z.string().min(1),
  sectionId: z.string().min(1),
  rollNumber: z.string().min(1).max(10),
});
export type EnrollStudentInput = z.infer<typeof enrollStudentInputSchema>;
