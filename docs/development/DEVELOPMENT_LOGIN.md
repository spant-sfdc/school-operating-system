# Development Login

**Purpose:** How to actually log into this repository's own development database — the answer to Sprint B2's Open Question #1 ("I, the developer, must know how to log in"). This document is about **this repository's local/dev seed data specifically.** It is not a general Auth.js guide and not the client-deployment bootstrap process (that's [docs/product/ADMINISTRATION_STRATEGY.md § 5](../product/ADMINISTRATION_STRATEGY.md#5-bootstrap-admin--the-one-account-nobody-creates-through-the-app) and [CLIENT_IMPLEMENTATION_PLAYBOOK.md](../product/CLIENT_IMPLEMENTATION_PLAYBOOK.md)).

---

## 1. Bootstrap Login ID

```
bootstrap-admin@school.invalid
```

Defined as `DEFAULT_BOOTSTRAP_ADMIN_EMAIL` in `prisma/seed.ts`. `.invalid` is IANA's reserved TLD for addresses that must never resolve to a real mailbox (RFC 2606) — deliberately not a real or plausible-looking email address, the same discipline already applied to every other generic seed value in this project (`@example.com` teacher emails, generic Indian names).

## 2. Temporary Password

```
ChangeMeImmediately123!
```

Defined as `DEFAULT_BOOTSTRAP_ADMIN_PASSWORD` in `prisma/seed.ts`. This is deliberately not subtle — a real password would never look like this, and that is the point: anyone reading this value anywhere (this doc, the seed script's source, a printed console log) should immediately recognize it as a placeholder, never mistake it for a real credential.

**This account has `mustChangePassword = true`** — the very first authenticated action available after logging in with this password is being redirected to `/change-password`; nothing else is reachable until a new password is set (see [ADMINISTRATION_STRATEGY.md § 2.2](../product/ADMINISTRATION_STRATEGY.md#22-password-lifecycle) and [DECISIONS.md § D-036](../DECISIONS.md#d-036--sprint-b2-bootstrap-administration--user-management-foundation-mustchangepassword-column-centralized-authorization-orchestrated-not-modified-registerteachercreateidentityuser)).

## 3. How to Log In

1. Run the seed script against your local `.env.local` database, if you haven't already: `pnpm exec tsx prisma/seed.ts`. The script is idempotent — safe to re-run; it will not create a second Bootstrap Administrator or duplicate any other seed row.
2. Start the app (`pnpm dev`) and visit `/login`.
3. Enter the Login ID and Temporary Password above.
4. You will be redirected to `/change-password` — set any password satisfying the minimum (length ≥ 8; no other complexity rule, per `ADMINISTRATION_STRATEGY.md § 2.2`'s own "not a byzantine ruleset" guidance).
5. After that, you land on `/admin`, with full Admin access, including `/admin/users` (Sprint B2's User Management).

## 4. How to Rotate It

Two ways, depending on what you're trying to do:

- **You're a developer who just wants a working local login and don't care about the specific value:** do nothing — the placeholder above already works, and `mustChangePassword` forces you to set a real one on first login anyway (step 4 above).
- **You want the seed script itself to create the Bootstrap Administrator with a specific Login ID/password** (e.g., testing the env-var-driven path a real client deployment uses): set `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, and optionally `BOOTSTRAP_ADMIN_NAME` in `.env.local` **before** the first time you run the seed script against a fresh database. These take precedence over the placeholder constants — see `prisma/seed.ts`'s own bootstrap block. Once a Bootstrap Administrator row already exists (matched by email), re-running the seed script does not touch its password again; use the in-app `/admin/users/[id]/reset-password` flow (Sprint B2) instead if you need to change it after the fact.

## 4b. Known Pitfall — Testing `/change-password` Against This Account Invalidates § 2's Password

**If you (or an automated verification pass) log in with the placeholder credentials and use `/change-password` to test the forced-password-change flow, the documented password in § 2 stops working** — Auth.js checks the live password hash, not this document, and `/change-password` genuinely changes it. This caused a real release-blocking report during Sprint B2.1: a manual login attempt with the documented credentials failed because a prior verification pass had already rotated the live password and never restored it — see [DECISIONS.md § D-037](../DECISIONS.md#d-037--sprint-b21-authentication-stabilization-root-cause-was-stale-live-credentials-not-a-code-defect).

If this happens again: the live database, not the code, is out of sync with this document. Reset it directly (Argon2id-hash `ChangeMeImmediately123!` — or your `BOOTSTRAP_ADMIN_PASSWORD`, if set — via `hashPassword()` from `src/lib/security`, then call `updateUserPassword()` from `src/repositories/user` with `mustChangePassword: true`, inside a transaction with a `writeAuditLog()` call — the exact pattern `applyTemporaryPassword()` in `src/services/administration/administration.service.ts` already uses). Do not "fix" this by changing the code — `authenticateUser()`, the Credentials provider, and the JWT/session callbacks are all correct; verified end to end in D-037.

## 5. Production Warning

**The credentials in § 1–2 are fallback values for this repository's own development database only.** They are:

- Committed to source control, in plain sight, in `prisma/seed.ts` and this document — by design, since they are not secrets.
- **Never** to be used, copied, or adapted for any real client deployment, staging environment, or anything reachable from outside a developer's own machine.

For a real client deployment, [CLIENT_IMPLEMENTATION_PLAYBOOK.md § 2.1](../product/CLIENT_IMPLEMENTATION_PLAYBOOK.md#21-stage-by-stage) step 6 and [ADMINISTRATION_STRATEGY.md § 5](../product/ADMINISTRATION_STRATEGY.md#5-bootstrap-admin--the-one-account-nobody-creates-through-the-app) already specify the correct process: set `BOOTSTRAP_ADMIN_EMAIL`/`BOOTSTRAP_ADMIN_PASSWORD`/`BOOTSTRAP_ADMIN_NAME` as real environment variables in that deployment's own secret store (never committed, never reused across environments) before running the seed script against that deployment's freshly-migrated database. The resulting account still has `mustChangePassword = true`, so even a real, deliberately-chosen bootstrap password is treated as provisioning-time and rotated on first real login — see [GO_LIVE_CHECKLIST.md § 4](../product/GO_LIVE_CHECKLIST.md#4-administration-readiness)'s own "Bootstrap Admin created, logged in once, and its own password changed" gate.

## 6. Related Documents

- [docs/product/ADMINISTRATION_STRATEGY.md](../product/ADMINISTRATION_STRATEGY.md) — the full user/password/role lifecycle design this account's behavior implements.
- [docs/product/GO_LIVE_CHECKLIST.md](../product/GO_LIVE_CHECKLIST.md) — the broader client-deployment gate, including the bootstrap password rotation step.
- [docs/DECISIONS.md § D-035](../DECISIONS.md#d-035--sprint-b1-authentication-foundation-jwt-session-strategy-corrects-d-030-empirically-confirmed-incompatible-with-credentials-only-argon2id-in-libsecurity-auth-as-its-own-service-adminteacher-route-groups-renamed-to-real-path-segments) / [D-036](../DECISIONS.md#d-036--sprint-b2-bootstrap-administration--user-management-foundation-mustchangepassword-column-centralized-authorization-orchestrated-not-modified-registerteachercreateidentityuser) — the sprints that built authentication and this account.
