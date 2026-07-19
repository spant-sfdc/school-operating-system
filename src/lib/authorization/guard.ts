import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import type { AuthorizationSubject } from "@/lib/authorization/permissions";

export interface AuthorizedSession {
  userId: string;
  schoolId: string;
  accessLevel: NonNullable<AuthorizationSubject["accessLevel"]>;
}

/**
 * Resolves the current session or redirects to /login. The single place
 * "is there a valid, active session" gets asked for Server Actions/Server
 * Components — mirrors src/app/admin/layout.tsx's own inline check
 * (D-035), extracted here so every new administrative Server Action this
 * sprint adds doesn't repeat it.
 */
export async function requireSession(): Promise<AuthorizedSession> {
  const session = await auth();
  if (!session?.user?.id || !session.user.schoolId || !session.user.accessLevel) {
    redirect("/login");
  }
  return {
    userId: session.user.id,
    schoolId: session.user.schoolId,
    accessLevel: session.user.accessLevel,
  };
}

/**
 * Resolves the current session and enforces one of
 * src/lib/authorization/permissions.ts's named checks, redirecting to
 * /unauthorized on failure. Every Server Action performing an
 * administrative mutation this sprint calls this once, at the top —
 * never a scattered inline `accessLevel === "ADMIN"` comparison.
 */
export async function requirePermission(
  check: (subject: AuthorizationSubject) => boolean,
): Promise<AuthorizedSession> {
  const session = await requireSession();
  if (!check(session)) {
    redirect("/unauthorized");
  }
  return session;
}
