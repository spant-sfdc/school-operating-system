import type { AccessLevel } from "@/generated/prisma/enums";
import type { Role, User } from "@/generated/prisma/client";

// The Admin-facing "Users" list/detail shape — a composed view, not bare
// foreign keys, same reasoning as every other DTO in this codebase.
// Deliberately excludes passwordHash — never crosses this boundary.
export interface UserAccountDTO {
  id: string;
  name: string | null;
  email: string;
  roleId: string;
  roleName: string;
  accessLevel: AccessLevel;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export function toUserAccountDTO(user: User & { role: Role }): UserAccountDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    roleName: user.role.name,
    accessLevel: user.role.accessLevel,
    isActive: user.deactivatedAt === null,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.toISOString(),
  };
}

export interface UserAccountListDTO {
  items: UserAccountDTO[];
  total: number;
  page: number;
  pageSize: number;
}

// The one-time result of an operation that generates a temporary password
// (account creation, Admin-initiated reset). `temporaryPassword` is the
// plaintext value — deliberately not persisted anywhere by this shape's
// producer beyond returning it once; only the caller decides whether/how
// to display it, and never logs it. See docs/DECISIONS.md's Sprint B2
// entry for why this is a distinct return shape from UserAccountDTO rather
// than a field bolted onto it.
export interface ProvisionedCredentialDTO {
  user: UserAccountDTO;
  temporaryPassword: string;
}
