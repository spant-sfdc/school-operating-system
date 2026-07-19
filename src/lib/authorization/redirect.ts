import type { AccessLevel } from "@/generated/prisma/enums";

// Named destinations, not string literals scattered across call sites —
// both this resolver and the Admin/Teacher layouts' own mustChangePassword
// guard (src/app/admin/layout.tsx, src/app/teacher/layout.tsx) reference
// these, so the path only ever needs to change in one place.
export const CHANGE_PASSWORD_PATH = "/change-password";
export const ADMIN_HOME_PATH = "/admin";
export const TEACHER_HOME_PATH = "/teacher";

export interface PostLoginSubject {
  accessLevel: AccessLevel;
  mustChangePassword: boolean;
}

/**
 * The single authoritative answer to "where does this session belong right
 * now" — used immediately after a successful sign-in (src/app/(auth)/login/
 * page.tsx) to compute the first destination, so an authenticated visitor
 * never transiently lands on the public homepage first. `requestedPath` is
 * the original `callbackUrl` a visitor was redirected from (set by
 * src/middleware.ts when an unauthenticated request hit a protected route);
 * honored only when no forced password change is pending, preserving
 * Sprint B1's "return to what you were trying to reach" behavior without
 * ever letting it bypass the mustChangePassword gate.
 *
 * `mustChangePassword` always wins, unconditionally — a pending forced
 * password change must never be deferred by a role landing page or a
 * requested deep link, per docs/DECISIONS.md's Sprint B2.1 entry.
 */
export function resolvePostLoginRedirect(
  subject: PostLoginSubject,
  requestedPath?: string,
): string {
  if (subject.mustChangePassword) {
    return CHANGE_PASSWORD_PATH;
  }

  if (requestedPath && requestedPath !== "/") {
    return requestedPath;
  }

  return subject.accessLevel === "ADMIN" ? ADMIN_HOME_PATH : TEACHER_HOME_PATH;
}
