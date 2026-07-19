import { z } from "zod";

// "Create User" is one flow covering both Administrator/Principal and
// Teacher account creation — the Admin picks a Role, and the service
// branches on that Role's accessLevel (ADMIN vs TEACHER), per
// docs/DECISIONS.md's Sprint B2 entry. `phone` is required only for a
// Teacher-tier role — enforced in the service (it needs a DB read of the
// selected role's accessLevel first), not expressible as a static schema
// rule here.
export const createUserAccountInputSchema = z.object({
  schoolId: z.string().min(1),
  roleId: z.string().min(1),
  name: z.string().min(1).max(120),
  email: z.email(),
  phone: z.string().min(1).max(20).optional(),
});
export type CreateUserAccountInput = z.infer<typeof createUserAccountInputSchema>;

// Name and role only — email is not editable here (it's the Login ID;
// changing it is a materially bigger, unrequested capability this sprint
// doesn't build). `roleId` is optional per call, but the service enforces
// "never your own role" regardless of whether it's supplied, per
// docs/domain/PERMISSION_MATRIX.md § 2 ("CRUD (not own role)").
export const editUserAccountInputSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1).max(120).optional(),
  roleId: z.string().min(1).optional(),
});
export type EditUserAccountInput = z.infer<typeof editUserAccountInputSchema>;

export const deactivateUserAccountInputSchema = z.object({
  userId: z.string().min(1),
});
export type DeactivateUserAccountInput = z.infer<typeof deactivateUserAccountInputSchema>;

export const activateUserAccountInputSchema = z.object({
  userId: z.string().min(1),
});
export type ActivateUserAccountInput = z.infer<typeof activateUserAccountInputSchema>;

export const resetUserPasswordInputSchema = z.object({
  userId: z.string().min(1),
});
export type ResetUserPasswordInput = z.infer<typeof resetUserPasswordInputSchema>;

// A reasonable minimum, not a byzantine ruleset — matches
// docs/product/ADMINISTRATION_STRATEGY.md § 2.2's own "length >= 8, not
// aggressive complexity rules" guidance, applied here to password-setting
// (as opposed to src/lib/validations/auth.ts's loginInputSchema, which
// validates a login *attempt* against an already-set password and
// deliberately has no complexity rule of its own).
const newPasswordSchema = z.string().min(8).max(200);

// Self-service change, clearing mustChangePassword — requires the current
// password as confirmation even though the caller is already authenticated,
// so an already-open session can't be hijacked to silently lock the real
// user out by changing their password out from under them.
export const changeOwnPasswordInputSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: newPasswordSchema,
});
export type ChangeOwnPasswordInput = z.infer<typeof changeOwnPasswordInputSchema>;

const userStatusFilterSchema = z.enum(["ACTIVE", "DEACTIVATED", "ALL"]);

export const searchUsersInputSchema = z.object({
  schoolId: z.string().min(1),
  query: z.string().max(120).optional(),
  roleId: z.string().min(1).optional(),
  status: userStatusFilterSchema.default("ALL"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
// z.input, not z.infer/z.output — callers should be able to omit
// status/page/pageSize and let the schema's own .default()s fill them in;
// z.infer would require every field the *parsed* result has, including
// defaulted ones, which defeats the point of declaring defaults at all.
export type SearchUsersInput = z.input<typeof searchUsersInputSchema>;
