import type { AccessLevel } from "@/generated/prisma/enums";
import type { Role, User } from "@/generated/prisma/client";

// The shape Auth.js's Credentials `authorize()` callback returns, which
// becomes `user` in the `jwt`/`session` callbacks and — via those callbacks
// — `session.user`. Never includes passwordHash, never a raw Prisma model.
export interface AuthenticatedUserDTO {
  id: string;
  email: string;
  name: string | null;
  schoolId: string;
  roleId: string;
  roleName: string;
  accessLevel: AccessLevel;
}

export function toAuthenticatedUserDTO(user: User & { role: Role }): AuthenticatedUserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    schoolId: user.schoolId,
    roleId: user.roleId,
    roleName: user.role.name,
    accessLevel: user.role.accessLevel,
  };
}
