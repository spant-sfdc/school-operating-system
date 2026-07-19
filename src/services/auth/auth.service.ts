import { findUserByEmail, findUserById } from "@/repositories/user";
import { verifyPassword } from "@/lib/security";
import { loginInputSchema, type LoginInput } from "@/lib/validations/auth";
import {
  toAuthenticatedUserDTO,
  type AuthenticatedUserDTO,
} from "@/services/auth/dto/authenticatedUser.dto";

// Deliberately one generic failure type for every reason a login can fail —
// no user found, wrong password, no password set yet, or a deactivated
// account all throw this same error. Revealing *which* of these is true
// would let a caller enumerate valid login IDs or probe account state,
// which ordinary login-security guidance treats as information disclosure.
export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid login ID or password.");
    this.name = "InvalidCredentialsError";
  }
}

/**
 * Verifies a Login ID + password against the existing Identity schema
 * (Sprint 1) — used by the Credentials provider's `authorize()` callback,
 * never called directly by any route or UI. Login ID is `User.email`; no
 * separate field exists, and adding one would redesign a completed module.
 *
 * Deliberately does not create a session itself — with the database session
 * strategy (D-030), Auth.js's own adapter creates the Session row once this
 * function's return value is accepted by `authorize()`. Building a parallel
 * `createSession()` here would duplicate what the adapter already does
 * correctly.
 */
export async function authenticateUser(input: LoginInput): Promise<AuthenticatedUserDTO> {
  const validated = loginInputSchema.parse(input);

  const user = await findUserByEmail(validated.loginId);
  if (!user || !user.passwordHash || user.deactivatedAt) {
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await verifyPassword(validated.password, user.passwordHash);
  if (!passwordMatches) {
    throw new InvalidCredentialsError();
  }

  return toAuthenticatedUserDTO(user);
}

/**
 * Re-resolves the full, role-enriched user for an already-established
 * database session — used by Auth.js's `session` callback. The adapter's own
 * `getUser(userId)` returns a bare User row with no `role` relation, so this
 * repository call is required to attach `roleName`/`accessLevel` to
 * `session.user`. Returns `null` (not a thrown error) if the user no longer
 * exists or has been deactivated since the session was created — the
 * `session` callback treats a `null` result as "do not attach role data,"
 * which every route guard in this sprint treats as unauthorized.
 */
export async function resolveActiveSessionUser(
  userId: string,
): Promise<AuthenticatedUserDTO | null> {
  const user = await findUserById(userId);
  if (!user || user.deactivatedAt) {
    return null;
  }
  return toAuthenticatedUserDTO(user);
}
