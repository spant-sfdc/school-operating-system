import type { DefaultSession } from "next-auth";
import type { AccessLevel } from "@/generated/prisma/enums";

// Module augmentation, not a new type system — extends Auth.js's own
// `Session.user` shape with this app's business fields (schoolId, role).
// Populated exclusively by src/lib/auth/config.ts's `session` callback via
// src/services/auth's resolveActiveSessionUser(); never by the adapter
// directly, which only knows the bare User model.
declare module "next-auth" {
  interface Session {
    user: {
      schoolId?: string;
      roleId?: string;
      roleName?: string;
      accessLevel?: AccessLevel;
    } & DefaultSession["user"];
  }
}
