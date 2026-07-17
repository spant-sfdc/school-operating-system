import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/db-utils";
import { createUser, findUserByEmail } from "@/repositories/user";
import { findRoleById } from "@/repositories/role";
import { createUserInputSchema, type CreateUserInput } from "@/validators/identity";

/**
 * Creates a User with an assigned Role. Per docs/database/TRANSACTION_BOUNDARIES.md
 * § 1, the User row and its own AuditLog entry are written in one transaction —
 * no caller of this service needs to know that invariant exists.
 *
 * Not called by any route or UI yet — this sprint is data/infrastructure only.
 * A future Teacher-onboarding flow (Sprint 2+) composes this same
 * repository/transaction pattern, adding a Teacher row to the same
 * transaction, per TRANSACTION_BOUNDARIES.md's "Teacher onboarding" row.
 */
export async function createIdentityUser(input: CreateUserInput, actorUserId: string) {
  const validated = createUserInputSchema.parse(input);

  const role = await findRoleById(validated.roleId);
  if (!role) {
    throw new Error(`Role not found: ${validated.roleId}`);
  }

  const existing = await findUserByEmail(validated.email);
  if (existing) {
    throw new Error(`A user with this email already exists: ${validated.email}`);
  }

  return db.$transaction(async (tx) => {
    const user = await createUser(
      {
        email: validated.email,
        name: validated.name,
        school: { connect: { schoolId: validated.schoolId } },
        role: { connect: { id: validated.roleId } },
      },
      tx,
    );

    await writeAuditLog(tx, {
      schoolId: validated.schoolId,
      entityType: "User",
      entityId: user.id,
      actorUserId,
      action: "CREATE",
      afterValue: { email: user.email, roleId: validated.roleId },
    });

    return user;
  });
}
