import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findUserById(id: string) {
  return db.user.findUnique({ where: { id }, include: { role: true } });
}

export async function findUserByEmail(email: string) {
  return db.user.findUnique({ where: { email }, include: { role: true } });
}

export async function listUsersBySchool(schoolId: string) {
  return db.user.findMany({
    where: { schoolId, deactivatedAt: null },
    include: { role: true },
    orderBy: { createdAt: "asc" },
  });
}

// "Does an Admin-tier account exist and can it actually log in" — the
// Bootstrap/Authentication readiness signals a system-readiness check
// needs. Deliberately checks accessLevel (Administrator or Principal both
// qualify), not a specific email — a real deployment's bootstrap email
// varies (BOOTSTRAP_ADMIN_EMAIL), and an Admin may have since been renamed
// or a second Admin created; matching on role tier is the correct, durable
// signal, not this dev repository's own placeholder address.
export async function findFirstActiveAdminUser(schoolId: string) {
  return db.user.findFirst({
    where: { schoolId, deactivatedAt: null, role: { accessLevel: "ADMIN" } },
    include: { role: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createUser(input: Prisma.UserCreateInput, tx: Prisma.TransactionClient = db) {
  return tx.user.create({ data: input, include: { role: true } });
}

export async function updateUser(
  id: string,
  input: Prisma.UserUpdateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.user.update({ where: { id }, data: input, include: { role: true } });
}

export async function deactivateUser(id: string, tx: Prisma.TransactionClient = db) {
  return tx.user.update({ where: { id }, data: { deactivatedAt: new Date() } });
}

// Reactivation is always an explicit, separately-audited action — never
// automatic — per docs/database/SOFT_DELETE_STRATEGY.md § 5 "Never
// Restore." No cascading change to any TeacherAssignment or other row this
// user is referenced from; historical attribution stays intact regardless
// of current account status.
export async function reactivateUser(id: string, tx: Prisma.TransactionClient = db) {
  return tx.user.update({ where: { id }, data: { deactivatedAt: null } });
}

// Sets a new password hash and the mustChangePassword flag together — the
// one place either is ever written, used by both an Admin-initiated reset
// (mustChangePassword: true, the Admin doesn't know what the user will
// choose) and the user's own self-service change once they've proven they
// know their current temp password (mustChangePassword: false). Never
// returns the hash to a caller that doesn't already have it.
export async function updateUserPassword(
  id: string,
  input: { passwordHash: string; mustChangePassword: boolean },
  tx: Prisma.TransactionClient = db,
) {
  return tx.user.update({
    where: { id },
    data: { passwordHash: input.passwordHash, mustChangePassword: input.mustChangePassword },
  });
}

export interface UserSearchFilters {
  schoolId: string;
  query?: string;
  roleId?: string;
  status?: "ACTIVE" | "DEACTIVATED" | "ALL";
  page?: number;
  pageSize?: number;
}

// Unlike listUsersBySchool() above (always active-only, no pagination —
// kept exactly as-is, not touched by this sprint), this is a genuinely new
// function for the Admin-facing Users list: sees active and deactivated
// accounts alike (an Admin needs to find a deactivated user in order to
// reactivate them), paginated, with optional text/role/status filters.
export async function searchUsers(filters: UserSearchFilters) {
  const { schoolId, query, roleId, status = "ALL", page = 1, pageSize = 20 } = filters;

  const where: Prisma.UserWhereInput = {
    schoolId,
    ...(roleId ? { roleId } : {}),
    ...(status === "ACTIVE" ? { deactivatedAt: null } : {}),
    ...(status === "DEACTIVATED" ? { deactivatedAt: { not: null } } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.user.findMany({
      where,
      include: { role: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  return { items, total, page, pageSize };
}
