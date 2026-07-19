import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/db-utils";
import { hashPassword, verifyPassword, generateTemporaryPassword } from "@/lib/security";
import {
  findUserById,
  findUserByEmail,
  updateUser,
  deactivateUser,
  reactivateUser,
  updateUserPassword,
  searchUsers,
} from "@/repositories/user";
import { findRoleById } from "@/repositories/role";
import { createIdentityUser } from "@/services/identity";
import { registerTeacher } from "@/services/teacher";
import {
  createUserAccountInputSchema,
  editUserAccountInputSchema,
  deactivateUserAccountInputSchema,
  activateUserAccountInputSchema,
  resetUserPasswordInputSchema,
  changeOwnPasswordInputSchema,
  searchUsersInputSchema,
  type CreateUserAccountInput,
  type EditUserAccountInput,
  type DeactivateUserAccountInput,
  type ActivateUserAccountInput,
  type ResetUserPasswordInput,
  type ChangeOwnPasswordInput,
  type SearchUsersInput,
} from "@/lib/validations/administration";
import {
  toUserAccountDTO,
  type UserAccountDTO,
  type UserAccountListDTO,
  type ProvisionedCredentialDTO,
} from "@/services/administration/dto/userAccount.dto";

/**
 * Generates and applies a new temporary password to an existing user —
 * the one place a password hash is ever written outside authentication
 * itself, shared by createUserAccount() (initial provisioning) and
 * resetUserPassword() (Admin-initiated reset) so neither duplicates the
 * hash-and-audit mechanics. Not exported — always reached through one of
 * those two named lifecycle operations, never called bare.
 */
async function applyTemporaryPassword(
  userId: string,
  schoolId: string,
  actorUserId: string,
): Promise<string> {
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  await db.$transaction(async (tx) => {
    await updateUserPassword(userId, { passwordHash, mustChangePassword: true }, tx);

    await writeAuditLog(tx, {
      schoolId,
      entityType: "User",
      entityId: userId,
      actorUserId,
      action: "UPDATE",
      // Never the hash, never the plaintext — only the fact that a reset
      // happened. See PASSWORD MANAGEMENT's "never expose hashes" instruction.
      afterValue: { passwordReset: true, mustChangePassword: true },
    });
  });

  return temporaryPassword;
}

/**
 * Creates an Administrator/Principal or Teacher login account — one flow,
 * branching on the selected Role's accessLevel, per this sprint's own
 * "Create User" page covering both. Composes existing, unmodified Sprint 1
 * (createIdentityUser()) and Sprint 4 (registerTeacher()) services rather
 * than extending either's signature — see docs/DECISIONS.md's Sprint B2
 * entry for why. Always generates a temporary password; the caller is
 * responsible for displaying it exactly once and never persisting it
 * itself.
 */
export async function createUserAccount(
  input: CreateUserAccountInput,
  actorUserId: string,
): Promise<ProvisionedCredentialDTO> {
  const validated = createUserAccountInputSchema.parse(input);

  const role = await findRoleById(validated.roleId);
  if (!role) {
    throw new Error(`Role not found: ${validated.roleId}`);
  }

  let userId: string;

  if (role.accessLevel === "TEACHER") {
    if (!validated.phone) {
      throw new Error("Phone is required when creating a Teacher account.");
    }
    // Simple heuristic split of a single "Full Name" field into
    // firstName/lastName — Teacher's own profile shape (Sprint 4) has no
    // single-name field to reuse instead. A known simplification, not a
    // data-loss risk (both halves are still stored, just not perfectly
    // split for multi-word given/family names) — flagged in TASKS.md as a
    // real UX improvement for a future sprint.
    const [firstName, ...rest] = validated.name.trim().split(/\s+/);
    const lastName = rest.join(" ") || firstName;

    await registerTeacher(
      {
        schoolId: validated.schoolId,
        roleId: validated.roleId,
        email: validated.email,
        firstName: firstName ?? validated.name,
        lastName,
        phone: validated.phone,
      },
      actorUserId,
    );

    const createdUser = await findUserByEmail(validated.email);
    if (!createdUser) {
      throw new Error(`Failed to resolve newly-registered Teacher account: ${validated.email}`);
    }
    userId = createdUser.id;
  } else {
    const createdUser = await createIdentityUser(
      {
        schoolId: validated.schoolId,
        roleId: validated.roleId,
        name: validated.name,
        email: validated.email,
      },
      actorUserId,
    );
    userId = createdUser.id;
  }

  const temporaryPassword = await applyTemporaryPassword(userId, validated.schoolId, actorUserId);

  const finalUser = await findUserById(userId);
  if (!finalUser) {
    throw new Error(`Failed to load newly-created user: ${userId}`);
  }

  return { user: toUserAccountDTO(finalUser), temporaryPassword };
}

/**
 * Edits a User's name and/or role. Enforces
 * docs/domain/PERMISSION_MATRIX.md § 2's "CRUD (not own role)" — an Admin
 * may reassign any other user's role, never their own, regardless of
 * whether the request came through a form that could theoretically submit
 * it (server-side enforcement, not just a disabled UI control).
 */
export async function editUserAccount(
  input: EditUserAccountInput,
  actorUserId: string,
): Promise<UserAccountDTO> {
  const validated = editUserAccountInputSchema.parse(input);

  const existing = await findUserById(validated.userId);
  if (!existing) {
    throw new Error(`User not found: ${validated.userId}`);
  }

  if (
    validated.roleId !== undefined &&
    validated.roleId !== existing.roleId &&
    validated.userId === actorUserId
  ) {
    throw new Error("You cannot change your own role.");
  }

  if (validated.roleId !== undefined && validated.roleId !== existing.roleId) {
    const newRole = await findRoleById(validated.roleId);
    if (!newRole) {
      throw new Error(`Role not found: ${validated.roleId}`);
    }
  }

  const beforeValue = { name: existing.name, roleId: existing.roleId };

  await db.$transaction(async (tx) => {
    const user = await updateUser(
      validated.userId,
      {
        ...(validated.name !== undefined ? { name: validated.name } : {}),
        ...(validated.roleId !== undefined ? { role: { connect: { id: validated.roleId } } } : {}),
      },
      tx,
    );

    await writeAuditLog(tx, {
      schoolId: existing.schoolId,
      entityType: "User",
      entityId: user.id,
      actorUserId,
      action: "UPDATE",
      beforeValue,
      afterValue: { name: user.name, roleId: user.roleId },
    });
  });

  const reloaded = await findUserById(validated.userId);
  if (!reloaded) {
    throw new Error(`Failed to reload edited user: ${validated.userId}`);
  }
  return toUserAccountDTO(reloaded);
}

/**
 * Deactivates a User — soft only, per docs/database/SOFT_DELETE_STRATEGY.md
 * § 1's "lifecycle-state entities" category (status/deactivatedAt is the
 * only signal, never a second delete mechanism). An Admin may never
 * deactivate their own account — not a documented PERMISSION_MATRIX rule,
 * but the same class of safety guard as "not own role": without it, an
 * Admin could accidentally lock every account (including their own) out of
 * the system with no remaining way back in.
 */
export async function deactivateUserAccount(
  input: DeactivateUserAccountInput,
  actorUserId: string,
): Promise<UserAccountDTO> {
  const validated = deactivateUserAccountInputSchema.parse(input);

  if (validated.userId === actorUserId) {
    throw new Error("You cannot deactivate your own account.");
  }

  const existing = await findUserById(validated.userId);
  if (!existing) {
    throw new Error(`User not found: ${validated.userId}`);
  }
  if (existing.deactivatedAt) {
    throw new Error("This account is already deactivated.");
  }

  await db.$transaction(async (tx) => {
    const user = await deactivateUser(validated.userId, tx);
    await writeAuditLog(tx, {
      schoolId: existing.schoolId,
      entityType: "User",
      entityId: user.id,
      actorUserId,
      action: "SOFT_DELETE",
      beforeValue: { deactivatedAt: null },
      afterValue: { deactivatedAt: user.deactivatedAt },
    });
  });

  const reloaded = await findUserById(validated.userId);
  if (!reloaded) {
    throw new Error(`Failed to reload deactivated user: ${validated.userId}`);
  }
  return toUserAccountDTO(reloaded);
}

/**
 * Reactivates a User — always an explicit, separately-audited action, never
 * automatic, per docs/database/SOFT_DELETE_STRATEGY.md § 5 "Never Restore."
 */
export async function activateUserAccount(
  input: ActivateUserAccountInput,
  actorUserId: string,
): Promise<UserAccountDTO> {
  const validated = activateUserAccountInputSchema.parse(input);

  const existing = await findUserById(validated.userId);
  if (!existing) {
    throw new Error(`User not found: ${validated.userId}`);
  }
  if (!existing.deactivatedAt) {
    throw new Error("This account is already active.");
  }

  await db.$transaction(async (tx) => {
    await reactivateUser(validated.userId, tx);
    await writeAuditLog(tx, {
      schoolId: existing.schoolId,
      entityType: "User",
      entityId: validated.userId,
      actorUserId,
      action: "UPDATE",
      beforeValue: { deactivatedAt: existing.deactivatedAt },
      afterValue: { deactivatedAt: null },
    });
  });

  const reloaded = await findUserById(validated.userId);
  if (!reloaded) {
    throw new Error(`Failed to reload reactivated user: ${validated.userId}`);
  }
  return toUserAccountDTO(reloaded);
}

/**
 * Admin-initiated password reset — generates a new temporary password for
 * someone else's account, per docs/product/ADMINISTRATION_STRATEGY.md
 * § 2.2's "Admin-mediated reset" (the interim mechanism until a
 * notification provider makes self-service "forgot password" buildable).
 * Reuses the exact same applyTemporaryPassword() path as initial account
 * creation — deliberately, not a parallel implementation.
 */
export async function resetUserPassword(
  input: ResetUserPasswordInput,
  actorUserId: string,
): Promise<ProvisionedCredentialDTO> {
  const validated = resetUserPasswordInputSchema.parse(input);

  const existing = await findUserById(validated.userId);
  if (!existing) {
    throw new Error(`User not found: ${validated.userId}`);
  }

  const temporaryPassword = await applyTemporaryPassword(
    validated.userId,
    existing.schoolId,
    actorUserId,
  );

  const reloaded = await findUserById(validated.userId);
  if (!reloaded) {
    throw new Error(`Failed to reload user after password reset: ${validated.userId}`);
  }
  return { user: toUserAccountDTO(reloaded), temporaryPassword };
}

/**
 * Self-service password change — the only way `mustChangePassword` is ever
 * cleared, per docs/DECISIONS.md's Sprint B2 entry. Requires the current
 * (temporary or previous) password as confirmation even though the caller
 * is already authenticated, so an already-open session cannot be used to
 * silently lock the real account owner out by changing the password out
 * from under them. Not "Forgot Password" — the caller already knows a
 * working password; this sprint does not build unauthenticated recovery.
 */
export async function changeOwnPassword(
  input: ChangeOwnPasswordInput,
  actorUserId: string,
): Promise<void> {
  const validated = changeOwnPasswordInputSchema.parse(input);

  const existing = await findUserById(actorUserId);
  if (!existing || !existing.passwordHash) {
    throw new Error("Current password is incorrect.");
  }

  const currentMatches = await verifyPassword(validated.currentPassword, existing.passwordHash);
  if (!currentMatches) {
    throw new Error("Current password is incorrect.");
  }

  const newPasswordHash = await hashPassword(validated.newPassword);

  await db.$transaction(async (tx) => {
    await updateUserPassword(
      actorUserId,
      { passwordHash: newPasswordHash, mustChangePassword: false },
      tx,
    );

    await writeAuditLog(tx, {
      schoolId: existing.schoolId,
      entityType: "User",
      entityId: actorUserId,
      actorUserId,
      action: "UPDATE",
      afterValue: { passwordChangedBySelf: true, mustChangePassword: false },
    });
  });
}

export async function searchUserAccounts(input: SearchUsersInput): Promise<UserAccountListDTO> {
  const validated = searchUsersInputSchema.parse(input);
  const result = await searchUsers(validated);
  return {
    items: result.items.map(toUserAccountDTO),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

export async function getUserAccountDetails(userId: string): Promise<UserAccountDTO | null> {
  const user = await findUserById(userId);
  return user ? toUserAccountDTO(user) : null;
}
