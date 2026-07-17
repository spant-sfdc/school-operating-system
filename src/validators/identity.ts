import { z } from "zod";

// Must match the Prisma `AccessLevel` enum (prisma/schema.prisma) exactly —
// see docs/domain/PERMISSION_MATRIX.md / D-001 for the two authenticated
// permission tiers this app has in V1.
export const accessLevelSchema = z.enum(["ADMIN", "TEACHER"]);

export const createRoleInputSchema = z.object({
  name: z.string().min(1).max(60),
  accessLevel: accessLevelSchema,
  description: z.string().max(280).optional(),
});
export type CreateRoleInput = z.infer<typeof createRoleInputSchema>;

export const createUserInputSchema = z.object({
  schoolId: z.string().min(1),
  roleId: z.string().min(1),
  name: z.string().min(1).max(120).optional(),
  email: z.email(),
});
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
