import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

import { db } from "@/lib/db";
import { loginInputSchema } from "@/lib/validations/auth";
import {
  authenticateUser,
  resolveActiveSessionUser,
  InvalidCredentialsError,
} from "@/services/auth";

// PrismaAdapter(db) is a deliberate, narrow exception to "no direct Prisma
// usage outside repositories" — it manages exactly the three adapter-owned
// tables (Account, Session, VerificationToken) Sprint 1 already built to the
// adapter's own canonical contract shape (see prisma/schema.prisma's
// Migration 002 header comment), not a business domain model. Every
// business field on User (roleId, schoolId, deactivatedAt) is still read
// exclusively through src/repositories/user/ — see
// docs/engineering/ENGINEERING_PRINCIPLES.md § 9 for the recorded rule this
// codifies permanently, not just for this file. Kept configured even under
// JWT session strategy (see below) so Account/VerificationToken stay ready
// for the OAuth/password-reset extensibility already named in
// docs/product/ADMINISTRATION_STRATEGY.md § 3 — an adapter's presence does
// not force database sessions, the two are independent settings.
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  // JWT, not database sessions — a correction to D-030's original decision,
  // discovered and recorded during this sprint's own implementation, not
  // silently substituted. @auth/core (the engine behind next-auth v5)
  // hard-rejects `session.strategy === "database"` when Credentials is the
  // only configured provider — confirmed directly against its own assertion
  // source (`UnsupportedStrategy: Signing in with credentials only
  // supported if JWT strategy is enabled`), not assumed from documentation.
  // D-030's actual underlying requirement — a deactivated account loses
  // access on its very next request, not only at its next login — is
  // preserved anyway: the `session` callback below still performs a live
  // repository read on every request via resolveActiveSessionUser(),
  // exactly as it would have under database sessions. What's lost is only
  // the literal DB-visible Session row (no "list this user's active
  // sessions" admin view without further work) — see this sprint's
  // Architecture Review in docs/DECISIONS.md for the full comparison.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        loginId: { label: "Login ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginInputSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        try {
          const user = await authenticateUser(parsed.data);
          // Minimal shape — Auth.js's own User contract (id/email/name).
          // Business fields (schoolId/roleId/accessLevel) are attached later
          // by the `session` callback below, via a fresh repository read,
          // not carried through from here or embedded in the JWT itself.
          return { id: user.id, email: user.email, name: user.name };
        } catch (error) {
          if (error instanceof InvalidCredentialsError) {
            return null;
          }
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    // Fires on every session check (auth(), middleware, layouts) — a
    // deliberate extra query per request, not an oversight: this is what
    // makes deactivation take effect immediately for an already-open
    // session, rather than only at the next login. See
    // resolveActiveSessionUser()'s own comment. `token.sub` is the user id
    // Auth.js's default `jwt` callback already places there on sign-in — no
    // custom `jwt` callback is needed just to carry it forward.
    async session({ session, token }) {
      if (typeof token.sub !== "string") {
        return session;
      }
      const resolved = await resolveActiveSessionUser(token.sub);
      if (resolved) {
        session.user.id = resolved.id;
        session.user.schoolId = resolved.schoolId;
        session.user.roleId = resolved.roleId;
        session.user.roleName = resolved.roleName;
        session.user.accessLevel = resolved.accessLevel;
        session.user.mustChangePassword = resolved.mustChangePassword;
      }
      return session;
    },
  },
};
