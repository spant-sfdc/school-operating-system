# Changelog

All notable changes to the Pant Public School Digital Platform are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Version numbers follow `0.x.y` during pre-launch phases; `1.0.0` is reserved for the Version 1 production launch.

---

## [Unreleased]

Nothing yet.

---

## [0.25.0] — 2026-07-20 — Sprint B3: First-Time Setup Wizard & System Readiness

A production-readiness gate for this platform's clone-per-client delivery model: a Setup Wizard every cloned deployment passes through before its Admin surface is usable, and one reusable `checkSystemReadiness()` service. See [D-039](./DECISIONS.md#d-039--sprint-b3-first-time-setup-wizard--system-readiness-frameworkconfig-as-a-write-once-snapshot-not-a-live-cache-one-checksystemreadiness-service-reused-by-three-consumers-middleware-x-pathname-header-for-a-server-component-loop-safe-redirect). No charts, analytics, Attendance/Student/Teacher UI, or Import Engine built.

### Added

- `prisma/migrations/20260719120000_framework_configuration/` — Migration 008: `FrameworkConfig`, a singleton, write-once "what was true when setup completed" snapshot (`frameworkVersion`/`databaseVersion`/`migrationVersion`/`setupCompleted`/`setupCompletedAt`/`setupCompletedBy`) — never a live-state cache.
- `src/repositories/frameworkConfig/` — `findFrameworkConfig()`, `createFrameworkConfig()`, `updateFrameworkConfig()`.
- `src/services/system/` — `checkSystemReadiness()` (Database/Schema/Bootstrap/Roles/School/AcademicYear/Authentication/Version/Overall, computed fresh on every call), `getSchoolDetails()`/`updateSchoolDetails()`, `getBootstrapAdminDetails()`, `getFrameworkConfig()`, `isSetupComplete()`, `completeSetup()`.
- `src/app/admin/setup/` — the Setup Wizard: System Verification, School Verification (the first real edit UI for `School`/`AcademicYear`), Bootstrap Verification (links to the existing `/admin/users/[id]/reset-password`), Finalize Setup. Remains reachable after completion for ongoing review.
- `src/app/admin/system/` — Developer Information: live readiness plus the stored `FrameworkConfig` snapshot.
- `src/lib/version.ts` — `getFrameworkVersion()`, reads `package.json`.
- `src/lib/validations/setup.ts` — `updateSchoolDetailsInputSchema`.

### Changed

- `src/app/admin/layout.tsx` — redirects every `/admin/*` route to `/admin/setup` until setup is finalized (except the wizard itself).
- `src/app/admin/page.tsx` — rewritten Admin Home: System Ready / Framework Version / Current School / Current Academic Year / Current User + Quick Actions, replacing the Sprint B1/B2 bare link-list stub.
- `src/middleware.ts` — sets an `x-pathname` request header (additive, no new database read) so the Admin layout's Server Component guard can read the current path and avoid redirecting `/admin/setup` to itself.
- `src/repositories/school/school.repository.ts`, `src/repositories/academicYear/academicYear.repository.ts` — additive `findFirstSchool()`/`updateSchool()`, `updateAcademicYear()`.
- `src/repositories/user/user.repository.ts` — additive `findFirstActiveAdminUser()`.
- `src/lib/db-utils.ts` — additive `checkMigrationsApplied()`, `getDatabaseVersion()`.
- `src/lib/authorization/permissions.ts` — additive `canManageSystemSetup()`.

### Documentation

- `docs/DECISIONS.md` — added D-039, including the required pre-implementation Architecture Review (what's seeded, what should remain seeded, what should be configurable, what should only exist during first deployment) and a named-not-fixed finding: the generic Nursery–8 class/section/subject seed list is likely also a dev-fixture, Epic C's scope, not this sprint's.
- `docs/ROUTES.md`, `docs/ARCHITECTURE.md`, `docs/PROJECT_CONTEXT.md`, `docs/FEATURE_STATUS.md`, `docs/TASKS.md` updated.

### Verified

End to end against a live, freshly built production server: first startup (fresh login, setup not yet complete) → `/admin` redirects to `/admin/setup` → all seven readiness checks Ready against the existing seeded dev database → School Verification edit persisted and confirmed on reload → Bootstrap Verification shows the Administrator account with a working reset-password link → Finalize Setup → `/admin` now renders Admin Home directly → `/admin/setup` remains reachable, now showing "already completed" → logout, fresh login (second startup) → lands directly on `/admin`, no wizard detour → `/admin/system` shows live readiness plus the stored setup record → regression-checked `/admin/users`, `/admin/users/new`, and Teacher login/`/teacher` unaffected.

---

## [0.24.2] — 2026-07-19 — Sprint B2.2: Post-Login Redirect Fix

Login defaulted to the public `/` homepage instead of `/change-password` (when forced) or a role-appropriate landing page — `/` has no route guard, so nothing downstream ever caught and re-routed an authenticated visitor who landed there. See [D-038](./DECISIONS.md#d-038--sprint-b22-post-login-redirect-single-resolvepostloginredirect-resolver-replaces-three-independent-role-mapping-implementations-auth-does-not-see-a-same-request-signinredirectfalse-cookie-in-this-nextjs-version).

### Fixed

- `src/app/(auth)/login/page.tsx` — `loginAction` now computes the post-login destination via a pre-flight `authenticateUser()` call and the new `resolvePostLoginRedirect()`, passed to `signIn()` as `redirectTo`. A first attempt using `signIn({redirect:false})` followed by an `auth()` re-read in the same Server Action was abandoned after live testing showed the freshly-set session cookie isn't visible to that immediate re-read in this Next.js version.
- `src/app/change-password/actions.ts` — post-change redirect now calls the same `resolvePostLoginRedirect()` instead of its own independent `accessLevel === "ADMIN" ? "/admin" : "/teacher"` ternary.

### Added

- `src/lib/authorization/redirect.ts` — `resolvePostLoginRedirect()`, `CHANGE_PASSWORD_PATH`, `ADMIN_HOME_PATH`, `TEACHER_HOME_PATH` — the single authoritative post-login/post-password-change destination resolver, now the only place this role-mapping logic exists.

### Verified

Bootstrap login (`mustChangePassword: true`) → `/change-password` directly, no stop at `/` → password change → `/admin` → logout → login again → directly `/admin`, no detour. Repeated for a Teacher account — forced change lands on `/teacher`, not `/admin`. Regression-tested: wrong password still shows the existing error; an unauthenticated deep link to `/admin/users` still round-trips through `callbackUrl` after a non-forced login.

---

## [0.24.1] — 2026-07-19 — Sprint B2.1: Authentication Stabilization & Verification

Investigated a release-blocking report ("Bootstrap Administrator cannot log in") end to end. **Root cause: not a code defect.** Sprint B2's own verification testing had changed the Bootstrap Administrator's live password while exercising `/change-password`, and never restored it — so the live database silently diverged from `docs/development/DEVELOPMENT_LOGIN.md`. Every layer of the authentication pipeline (seed script, `authenticateUser()`, Credentials provider, JWT/session callbacks, middleware, login UI) was traced and confirmed correct. See [D-037](./DECISIONS.md#d-037--sprint-b21-authentication-stabilization-root-cause-was-stale-live-credentials-not-a-code-defect).

### Fixed

- Live Bootstrap Administrator (`bootstrap-admin@school.invalid`) password hash restored to the documented value (`ChangeMeImmediately123!`), `mustChangePassword` re-armed to `true`, via `updateUserPassword()` + `writeAuditLog()` (the same path an Admin-initiated reset uses) — not a raw SQL update, not a re-seed. No source code changed.

### Documentation

- `docs/development/DEVELOPMENT_LOGIN.md` — added § 4b, a known-pitfall note: testing `/change-password` against the documented account changes its live password, invalidating this document until it's restored.
- `docs/DECISIONS.md` — added D-037.

### Verified

Login → session (`mustChangePassword: true`) → `/admin` → 307 to `/change-password` → password change → 303 to `/admin` → `/admin`/`/admin/users` 200 → logout → `/admin` → 307 to `/login`, all against a live, freshly-built production server (`next build && next start`) via `curl` mirroring the real login form. Account left with `mustChangePassword: true` afterward so a real first-time login sees the documented forced-password-change screen.

---

## [0.24.0] — 2026-07-19 — Sprint B2: Bootstrap Administration & User Management Foundation

Functional (not polished) User Management for Administrator/Teacher accounts — Create, Edit, Activate/Deactivate, Reset Password, Search/Filter, self-service password change — plus resolution of both open questions Sprint B1 left unresolved. See [D-036](./DECISIONS.md#d-036--sprint-b2-administration--user-management-foundation-usermustchangepassword-column-centralized-libauthorization-orchestrated-not-modified-registerteachercreateidentityuser-cookie-flashed-temporary-passwords). No Student/Guardian management, Attendance UI, Dashboard polish, Notifications, Forgot Password, or Email integration built.

### Added

- `prisma/migrations/20260719045852_administration_foundation/` — Migration 007: `User.mustChangePassword Boolean @default(false)`, purely additive.
- `src/lib/authorization/` — `permissions.ts` (`canManageUsers()`/`canManageTeachers()`/`canResetPasswords()`/`canDeactivateUsers()`), `guard.ts` (`requireSession()`/`requirePermission()`). The one canonical place a permission question is answered app-wide.
- `src/lib/security/password.ts` — `generateTemporaryPassword()`: a 12-character, CSPRNG-backed (`node:crypto` `randomInt`), visually-unambiguous-character-free temporary password generator.
- `src/lib/validations/administration.ts` — input schemas for every new mutation, plus `searchUsersInputSchema`.
- `src/services/administration/` — `createUserAccount()`, `editUserAccount()`, `deactivateUserAccount()`, `activateUserAccount()`, `resetUserPassword()`, `changeOwnPassword()`, `searchUserAccounts()`, `getUserAccountDetails()`, and a shared, unexported `applyTemporaryPassword()`. Orchestrates the unmodified Sprint 1 `createIdentityUser()`/Sprint 4 `registerTeacher()` rather than extending either.
- `src/app/admin/users/` — `page.tsx` (list, search, filter, pagination), `new/page.tsx` (create), `[id]/page.tsx` (details — shows the flashed temporary password once after create/reset), `[id]/edit/page.tsx`, `[id]/reset-password/page.tsx`, `actions.ts` (every Server Action, plain `<form action={fn}>`, no `useActionState`).
- `src/app/change-password/` — top-level, any authenticated `accessLevel`; the only path that clears `mustChangePassword`.
- `docs/development/DEVELOPMENT_LOGIN.md` — Bootstrap Administrator Login ID, temporary password, rotation instructions, production warning. Resolves Sprint B1's Open Question #1.
- `src/repositories/user/user.repository.ts` — additive: `reactivateUser()`, `updateUserPassword()`, `searchUsers()`.

### Changed

- `src/app/admin/layout.tsx`, `src/app/teacher/layout.tsx` — redirect to `/change-password` whenever `session.user.mustChangePassword` is `true`, before anything else in either surface is reachable.
- `src/services/auth/dto/authenticatedUser.dto.ts`, `src/types/next-auth.d.ts`, `src/lib/auth/config.ts` — `mustChangePassword` added to the authenticated-user DTO, the session type augmentation, and the `session` callback.
- `prisma/seed.ts` — Bootstrap Administrator credentials moved to named `DEFAULT_BOOTSTRAP_ADMIN_*` constants (used only as the env-var fallback); `mustChangePassword: true` now set explicitly on creation.

### Fixed / Reversed

- The two flows needing a one-time-display secret (Create User, Reset Password) were initially built as `useActionState` Client Components (`CreateUserForm`, `ResetPasswordForm`). Real end-to-end verification found that protocol unverifiable in this environment (no headless-browser tool available; `curl` simulation failed on bound Server Actions with "Missing origin header"/"Failed to find Server Action"). Rebuilt as plain Server Component forms; the temporary password is instead carried via a short-lived (60s), `httpOnly` cookie set by the Server Action immediately before redirecting to the Details page. Verified end to end for Create Teacher, Create Administrator, and Reset Password. See [D-036](./DECISIONS.md#d-036--sprint-b2-administration--user-management-foundation-usermustchangepassword-column-centralized-libauthorization-orchestrated-not-modified-registerteachercreateidentityuser-cookie-flashed-temporary-passwords).

### Documentation

- `docs/ROUTES.md`, `docs/ARCHITECTURE.md`, `docs/PROJECT_CONTEXT.md`, `docs/FEATURE_STATUS.md`, `docs/TASKS.md` — new routes, folder tree, sprint summary, and feature status updated.
- `docs/DECISIONS.md` — added [D-036](./DECISIONS.md#d-036--sprint-b2-administration--user-management-foundation-usermustchangepassword-column-centralized-libauthorization-orchestrated-not-modified-registerteachercreateidentityuser-cookie-flashed-temporary-passwords), reviewed the auth implementation for hardcoded values/duplicated logic (none found requiring a fix — resolves Sprint B1's Open Question #2).

---

## [0.23.0] — 2026-07-19 — Sprint B1: Authentication Foundation

Auth.js Credentials authentication, Argon2id password hashing, login/logout, session management, and route protection for the still-unbuilt Admin/Teacher surfaces — the first real slice of Epic B. Corrects D-030's original "database sessions" decision to JWT after empirically confirming `@auth/core` hard-rejects database sessions with Credentials as the only provider — see [D-035](./DECISIONS.md#d-035--sprint-b1-authentication-foundation-jwt-session-strategy-corrects-d-030-empirically-confirmed-incompatible-with-credentials-only-argon2id-in-libsecurity-auth-as-its-own-service-adminteacher-route-groups-renamed-to-real-path-segments). No User Management, Dashboard, Create User UI, Reset Password, Forgot Password, Student login, or Parent login built.

### Added

- `src/lib/security/password.ts` — `hashPassword()`/`verifyPassword()` via `@node-rs/argon2` (Argon2id). No Auth.js dependency — a general security primitive, reusable anywhere a password ever needs hashing.
- `src/lib/auth/{config,index}.ts` — Auth.js configuration: Credentials provider (Login ID = `User.email` + password), JWT session strategy, `PrismaAdapter(db)` (scoped only to `Account`/`Session`/`VerificationToken` — a documented, narrow exception to "no direct Prisma outside repositories," see `ENGINEERING_PRINCIPLES.md § 9`), a `session` callback that re-resolves the user from the database on every request so deactivation takes effect immediately, not just at next login.
- `src/services/auth/` — `authenticateUser()`, `resolveActiveSessionUser()`, `AuthenticatedUserDTO`. One generic `InvalidCredentialsError` for every login-failure reason (no user found, wrong password, no password set, deactivated) — deliberately not distinguished, to avoid account-existence enumeration.
- `src/lib/validations/auth.ts` — login input schema.
- `src/types/next-auth.d.ts` — `Session.user` module augmentation (`schoolId`/`roleId`/`roleName`/`accessLevel`).
- `src/middleware.ts` — Edge-runtime pre-check (`getToken()`, signature verification only, no database) redirecting unauthenticated requests to `/login`. Deliberately does not check role or deactivation — see route guards below.
- `src/app/admin/layout.tsx`, `src/app/teacher/layout.tsx` — the authoritative, database-backed guard (role match + live deactivation check via `resolveActiveSessionUser()`), plus minimal placeholder `page.tsx` stubs (not dashboards — Next.js never executes a segment's layout while resolving a 404 for a route with zero matching pages, making the guard otherwise untestable).
- `src/app/(auth)/login/page.tsx`, `src/app/unauthorized/page.tsx` — minimal UI, Server Actions calling `signIn()`/`signOut()` directly.
- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js's own route handlers.
- `src/components/ui/{button,input,label,card}.tsx` — this project's first Shadcn-primitive-based components (added via the Shadcn CLI).
- `prisma/seed.ts` — Bootstrap Administrator, created via a direct repository call (not an HTTP endpoint, per this sprint's explicit instruction). Reads `BOOTSTRAP_ADMIN_EMAIL`/`PASSWORD`/`NAME` from the environment first, falling back to an obvious placeholder (`bootstrap-admin@school.invalid` / `ChangeMeImmediately123!`) for this repository's own dev database.

### Fixed

- `src/app/(admin)/` and `src/app/(teacher)/` — renamed to real `src/app/admin/`/`src/app/teacher/` path segments. Both were parenthesized route groups (Phase 0B.1 scaffolding), which add no URL segment; left as scaffolded, they would have silently collided on every identically-named child path (e.g. both defining `/attendance`) the moment real pages were added. Fixed while both still contained only `.gitkeep` placeholders — the cheapest possible moment.

### Changed

- `docs/engineering/ENGINEERING_PRINCIPLES.md` — added § 9, naming `PrismaAdapter(db)` as a permanent, narrow, documented exception to "no direct Prisma outside repositories."
- `docs/ARCHITECTURE.md`, `docs/ROUTES.md` — folder tree and route-guard tables updated to reflect the real admin/teacher path segments and the two-tier (Edge + Node) guard design; `ARCHITECTURE.md § 9`'s Auth.js open question marked resolved.
- `package.json` — `@auth/prisma-adapter`, `@node-rs/argon2` added; `@base-ui/react`/`class-variance-authority` reinstalled (previously removed as orphaned per D-009 — genuinely unused then, genuinely used now by the new Shadcn components).

### Verified

- `pnpm run build`, `typecheck`, `lint`, `format:check` — all clean, including against the actual compiled production build (`next build && next start`), not only `next dev`.
- `prisma validate` — schema unchanged this sprint (no migration).
- Live, end-to-end `curl`-driven verification against a running dev server and the production build: login (correct credentials → session with role data attached), logout (session cookie cleared), session persistence across requests, wrong password (rejected, generic error), nonexistent user (rejected identically), deactivated user cannot log in, **mid-session deactivation cuts off an already-issued, still-cryptographically-valid session on its very next request** (the core property the original database-session decision existed to guarantee), unauthenticated access to `/admin`/`/teacher` redirects to `/login` with a `callbackUrl`, wrong-role access redirects to `/unauthorized`, correct-role access succeeds.
- `grep` confirms zero direct `db.user`/`db.role` access outside `src/repositories/`, with `PrismaAdapter(db)` as the one documented exception exactly where expected.

## [0.22.0] — 2026-07-19 — Delivery Phase Roadmap Reorganization

Planning sprint, not implementation — no code, schema, migration, or service touched, per [D-034](./DECISIONS.md#d-034--delivery-phase-roadmap-clone-per-client-model-supersedes-eventual-saas-framing-epic-reordering). With the Foundation Phase (Sprints 0–5) complete, organized all remaining work into product Epics under the explicit, clarified delivery model: one Master Repository, cloned into an independent repository per client school — never a shared multi-tenant SaaS deployment. Supersedes `PRODUCT_ARCHITECTURE.md § 2` step 4's and `ROADMAP_V2.md`'s prior "eventual SaaS" framing (both received a surgical cross-link, not a rewrite).

### Added

- `docs/product/README.md` — index and self-review for the new Delivery Phase documentation set.
- `docs/product/EPIC_ROADMAP.md` — the full Epic sequence, challenged and reordered (Client Customization Framework moved from second-to-last to immediately after Administration, parallel with Data Migration Engine — both cheap, both hard blockers for onboarding a second client), with per-epic Purpose/Business Value/Dependencies/Implementation Order/Complexity/Manual Verification/Go-Live Readiness.
- `docs/product/ADMINISTRATION_STRATEGY.md` — the complete user/password/role lifecycle design: no self-registration ever, Admin-mediated password reset (no notification provider exists yet), no forced periodic password rotation (per current security guidance), soft-delete-only deactivation with explicit-action-only reactivation, and the bootstrap-admin mechanism (a script run directly against the database, never an HTTP route).
- `docs/product/IMPORT_ENGINE_STRATEGY.md` — the reusable Data Migration Engine design (Upload → Map → Validate → Preview → Commit → Audit), chunked/resumable commits per `TRANSACTION_BOUNDARIES.md § 4`'s Academic Year Rollover precedent, an honest rollback boundary (clean before commit; soft-delete-supported after commit for most entities; no automated rollback for `Enrollment`, which has no delete mechanism at all), and a new `ImportBatch` tracking entity.
- `docs/product/IMPORT_ENGINE_STRATEGY.md § 5` — Rajasthan RTE integration research from official and directly-observed market sources: no official API or bulk-export exists for `rajpsp.nic.in`; the only real-world "integration" found in the market is a competing vendor's manual copy-paste-into-Excel workflow. Recommends against building any automated integration (API client or scraper) — the Import Engine's ordinary CSV/Excel upload path already covers the legitimate workflow.
- `docs/product/CLIENT_IMPLEMENTATION_PLAYBOOK.md` — the corrected client delivery sequence. Fixed a real ordering bug in the originally proposed flow (it created a Bootstrap Admin before the database existed); added three missing steps (infrastructure provisioning, real staff account provisioning distinct from the bootstrap account, post-go-live stabilization distinct from steady-state support).
- `docs/product/CLIENT_CUSTOMIZATION_GUIDE.md` — the literal checklist for what a new client repository must change, what should never need to change, and which documentation sets ship with a client repo vs. reset per client.
- `docs/product/FRAMEWORK_STRATEGY.md` — the master-vs-client-repo boundary; framework updates reach a client repo only via an explicit `git merge upstream/main`, never automatically or pushed — ruling out any control-plane pattern that would re-introduce SaaS-style multi-tenancy through the back door.
- `docs/product/VERSIONING_STRATEGY.md` — how semantic versioning extends to many independent client repos with no central registry, by design.
- `docs/product/GO_LIVE_CHECKLIST.md` — the broader client-deployment go-live gate (infrastructure, data, administration, training), complementing rather than duplicating the existing `docs/onboarding/GO_LIVE_CHECKLIST.md` content-readiness gate.

### Changed

- `docs/PRODUCT_ARCHITECTURE.md § 2` and `docs/ROADMAP_V2.md § Epic H`/`Recommended Next Epic` — each received a short, surgical cross-link to the new `docs/product/` set, marking their prior "eventual SaaS"/multi-tenancy framing as superseded. Neither document was rewritten.

### Verified

- Every recommendation grounded in an already-recorded decision or an existing document's own established reasoning — `Role`/`User` shape (D-028), Credentials-only auth (D-029), no self-registration (D-001), the Academic Year Rollover batching precedent (`TRANSACTION_BOUNDARIES.md § 4`), the soft-delete/append-only boundary (`SOFT_DELETE_STRATEGY.md`).
- RTE research cited to official government sources (`rajpsp.nic.in`, NIC's Integrated Shala Darpan project page) and one directly-observed competing vendor's own published import instructions — no speculation.

Migration 006 — `AttendanceSession`, `AttendanceRecord` — applied for real to the live Neon database, per [D-033](./DECISIONS.md#d-033--sprint-5-attendance-engine-openattendancesessionsubmitattendancemarkattendance-kept-as-three-distinct-operations-attendancesession-carries-its-own-schoolid-enrollment-section-scoping-enforced-in-the-service). The first genuinely high-volume table in the schema — `AttendanceRecord` uses a time-ordered UUIDv7 primary key from this first migration. No API, UI, Timetable, Leave Management, Notifications, Reports, or Examination module built.

### Added

- `prisma/schema.prisma` — `AttendanceStatus` enum (`PRESENT`/`ABSENT`/`HALF_DAY`/`LEAVE`); `AttendanceSession` (carries its own `schoolId` directly, matching `Enrollment`'s precedent, for the `(schoolId, date)` oversight-view index; no `deletedAt`/status field — corrections are audited edits, never row removal); `AttendanceRecord` (references `Enrollment`, never `Student` directly, per the task's own "Attendance belongs to Enrollment" architectural decision).
- `prisma/migrations/20260718201440_attendance_foundation/` — applied via `prisma migrate deploy`.
- `src/repositories/{attendanceSession,attendanceRecord}/` — two repositories; confirmed by grep that neither imports another repository.
- `src/services/attendance/` — `openAttendanceSession()` (idempotent get-or-create for a section+day), `markAttendance()` (single-record correction primitive), `submitAttendance()` (the real batch submission — a whole section's roster upserted in one transaction, matching `TRANSACTION_BOUNDARIES.md`'s "Daily attendance submission" row exactly), `reopenAttendance()` (a pure read — no separate open/closed status exists to toggle). Every write path enforces that a marked `Enrollment` belongs to the session's own section, not just the same academic year.
- `src/lib/validations/attendance.ts` — Zod schemas for all four lifecycle operations.
- `prisma/seed.ts` — extended to seed 1 `AttendanceSession` (Class 5-A, the section with an already-assigned Class Teacher) with 2 real `AttendanceRecord` rows (Sprint 3's actual enrollment data tops out at 2 students in any single section — see D-033 for why this intentionally differs from the task's literal "five" figure). Idempotent.

### Verified

- `pnpm run build`, `typecheck`, `lint`, `format:check` — all clean.
- `prisma validate`, `prisma migrate status` — schema valid, database up to date (7/7 migrations applied).
- Live database: 1 `AttendanceSession`, 2 `AttendanceRecord` rows, matching the seeded structure exactly. Idempotent re-run confirmed (counts unchanged).
- `pnpm exec tsx --trace-warnings prisma/seed.ts` — no recurrence of Sprint 4's `create()+include`-inside-transaction warning; only the pre-existing, unrelated SSL-mode deprecation notice.
- `grep` confirms zero direct `db.<model>` access outside `src/repositories/`, zero repository importing another repository, and every exported `services/attendance/` function returns a DTO.
- Self-review confirms: Examination and Reports can both be built without any further change to Attendance (neither references `AttendanceSession`/`AttendanceRecord` in the domain model); `AttendanceSession` is the local aggregate root for the attendance-taking event itself, nested under `Enrollment`'s broader academic-history root; `AttendanceRecord` is deliberately mutable-with-audit-trail, not immutable, matching `DATABASE_REVIEW.md` § 14's own established category for this table.

---

## [0.20.0] — 2026-07-19 — Sprint 4: Teacher Foundation

Migration 005 — `Teacher`, `TeacherQualification`, `TeacherAssignment` — applied for real to the live Neon database, per [D-032](./DECISIONS.md#d-032--sprint-4-teacher-foundation-repository-dependency-rule-made-explicit-registerteacher-composes-createuser-updateteacherassignment-soft-deletes-rather-than-mutates), completing the migration slot Sprint 3 half-filled. Documents the "repositories never call repositories" rule permanently for the first time. No API, UI, Attendance, Timetable, Leave Management, Payroll, Examination, or Notifications module built.

### Added

- `prisma/schema.prisma` — `Teacher` (no `deletedAt`, same `status`-only lifecycle precedent as `Student`), `TeacherQualification` (`qualificationType` stays a plain `String` — the `ENUM_STRATEGY.md`-recommended lookup table deliberately deferred, would mean inventing an entity), `TeacherAssignment` (two separate uniqueness mechanisms: a Prisma-native `@@unique` for subject-assignment rows, a hand-added partial unique index for "exactly one Class Teacher per section per year" — Postgres treats multiple `NULL` `subjectId`s as distinct, so the native constraint alone doesn't cover it).
- `prisma/migrations/20260718192844_teacher_foundation/` — applied via `prisma migrate deploy`.
- `src/repositories/{teacher,teacherQualification,teacherAssignment}/` — three repositories; confirmed by grep that none imports another repository.
- `src/services/teacher/` — `registerTeacher()` (composes `createUser()` from the identity domain with `createTeacher()`/`createTeacherQualification()` in one transaction, matching `TRANSACTION_BOUNDARIES.md`'s "Teacher onboarding" row exactly), `assignTeacher()`, `updateTeacherAssignment()` (ends and replaces, never mutates a live row), `deactivateTeacher()`. First service to use a `dto/` subfolder.
- `src/lib/validations/teacher.ts` — Zod schemas, including a `replacement`-shaped input for `updateTeacherAssignment()`.
- `docs/engineering/ENGINEERING_PRINCIPLES.md` — new permanent document collecting the repository/service/DTO layering rules established across Sprints 1-4 in one place, per this sprint's own explicit instruction ("if not yet documented permanently, document it... without rewriting existing documentation").
- `prisma/seed.ts` — extended to seed 3 generic teachers with qualifications and assignments (subject + Class Teacher) into Sprint 2's academic structure. Idempotent.

### Fixed

- Found and fixed a second, distinct cause of the "client already executing a query" deprecation warning — confirmed via `--trace-warnings` stack traces to originate from Prisma's own query engine decomposing a `create()+include` call into multiple physical queries inside an open interactive transaction, not Sprint 3's application-level connection-contention bug. Fixed for `TeacherAssignment` by removing `include` from the transactional create and doing a separate, standalone read after commit. Confirmed the same benign pattern pre-exists in Sprint 3's `enrollment.repository.ts`, deliberately not fixed there — out of this sprint's scope, flagged as future cleanup.

### Verified

- `pnpm run build`, `typecheck`, `lint`, `format:check` — all clean.
- `prisma validate`, `prisma migrate status` — schema valid, database up to date (6/6 migrations applied).
- Live database: 3 `Teacher`, 5 `TeacherQualification`, 6 `TeacherAssignment` rows, matching the seeded structure exactly (two Class Teacher designations, four subject assignments, one teacher covering the same subject across two sections). Idempotent re-run confirmed.
- `grep` confirms zero direct `db.<model>` access outside `src/repositories/` (13 Prisma models with data), zero repository importing another repository, and zero raw Prisma model in any exported `services/teacher/` function's return position.
- Self-review confirms: Attendance, Timetable, and Examination can all be built without further changes to Teacher/TeacherAssignment; no hidden coupling to Student (confirmed by grep — only comment-level precedent references); `TeacherAssignment`'s ownership under `services/teacher/` (not `services/academic/`) affirmed as correct, matching the task's own explicit examples and Admin's mental model of "assigning a teacher," not "scheduling a class."

### Known Issues

- `QualificationType` lookup table remains a real, named, deferred improvement (would require inventing an entity, out of this sprint's scope).
- The `create()+include`-inside-transaction pattern still exists in Sprint 3's `enrollment.repository.ts` — benign (a warning, not incorrect data), real future cleanup.
- Whether deactivating a Teacher should also end their active `TeacherAssignment` rows is deliberately left unmodeled — a real product decision for a future "remove teacher" admin flow to make explicitly.

---

## [0.19.0] — 2026-07-19 — Sprint 3: Student Foundation

Migration 004 — `Student`, `Guardian`, `StudentGuardian`, `Enrollment` — applied for real to the live Neon database, per [D-031](./DECISIONS.md#d-031--sprint-3-student-foundation-dto-layer-introduced-admissionnumber-scope-fix-two-lifecycle-operations-instead-of-one-transaction-contention-bug-found-and-fixed). Introduces the project's first DTO layer. No API, UI, Teacher, Attendance, Examination, Admission, Promotion, or Transfer Certificate module built.

### Added

- `prisma/schema.prisma` — `Student` (no `deletedAt`; `status` is the only lifecycle signal, per `DATABASE_REVIEW.md § 2`), `Guardian`, `StudentGuardian` (`relationshipType` promoted to a native enum), `Enrollment` (UUIDv7 primary key, the aggregate root for academic history, no delete mechanism of any kind).
- `prisma/migrations/20260718184429_student_foundation/` — applied via `prisma migrate deploy`; one hand-added partial unique index (`student_guardians`, `WHERE deleted_at IS NULL`).
- `src/repositories/{student,guardian,enrollment}/` — three repositories; `StudentGuardian` has no dedicated repository (not in this sprint's named list) — its access lives on the Student/Guardian repositories instead.
- `src/services/student/` — `registerStudent()` and `enrollStudent()`, two lifecycle-oriented functions (not one combined CRUD-shaped function), each transactional and audit-logged. The project's first DTO layer: `student.dto.ts`, `guardian.dto.ts`, `enrollment.dto.ts` — every exported service function returns a DTO, confirmed by grep that no raw Prisma model crosses the service boundary. `StudentDTO` deliberately excludes `udisePen` (a minor's government ID, DPDP Act 2023-relevant PII).
- `src/lib/validations/student.ts` — Zod schemas, including a `guardianLinkInputSchema` refinement requiring exactly one of `guardianId` (existing) or `newGuardian` (create).
- `prisma/seed.ts` — extended to seed 3 generic guardians and 5 generic students (two sibling pairs sharing a guardian), each enrolled into Sprint 2's academic structure. Idempotent.

### Fixed

- Found and fixed a real transaction-connection-contention bug: `registerStudent()`'s first implementation looked up an existing `Guardian` via the shared `db` singleton from _inside_ an open `db.$transaction()` callback — a read competing with the transaction's dedicated connection for the same Neon connection pool, surfaced as a genuine driver deprecation warning the first time the seed script's create path actually ran (not caught by `typecheck`/`lint`/`prisma validate`). Fixed by resolving every referenced existing `Guardian` before the transaction opens.
- `Student.admissionNumber` corrected to `@@unique([schoolId, admissionNumber])` — `docs/domain/DATABASE_SCHEMA.md`'s illustrative block showed it globally unique; `docs/database/DATABASE_REVIEW.md § 2` already flagged this as wrong, the same class of gap previously fixed for `TransferCertificate.tcNumber`.

### Verified

- `pnpm run build`, `typecheck`, `lint`, `format:check` — all clean.
- `prisma validate`, `prisma migrate status` — schema valid, database up to date (5/5 migrations applied).
- Live database: 3 `Guardian`, 5 `Student`, 5 `StudentGuardian`, 5 `Enrollment` rows, exactly matching the two sibling pairs' shared-guardian structure. Idempotent re-run confirmed unchanged.
- `grep` confirms zero direct `db.<model>` access outside `src/repositories/` (13 Prisma models with data), and zero raw Prisma model type in any exported `services/student/` function's return position.
- Self-review confirms: Attendance and Examination can both be built without further changes to Student/Guardian/Enrollment (both reference `Enrollment`, not `Student`, directly); no circular dependency between `student`/`academic`/`identity` modules.

### Known Issues

- `TeacherAssignment` (the other half of `MIGRATION_PLAN.md`'s original "005" row) remains unbuilt, blocked on `Teacher`.
- Sprint 1/2's identity/academic services still return raw Prisma models, not DTOs — this sprint's DTO requirement is explicitly "from this sprint onward," not retroactive.

---

## [0.18.0] — 2026-07-18 — Sprint 2: Academic Foundation

Migration 003 — `SchoolClass`, `Section`, `Subject` — applied for real to the live Neon database, per [D-030](./DECISIONS.md#d-030--sprint-2-academic-foundation-schoolclass-naming-classsubject-deferred-repository-retrofit-for-schoolacademicyear). Also retrofits `School`/`AcademicYear` with real repositories and refactors `prisma/seed.ts` to stop constructing its own Prisma client. No API, UI, Student, Teacher, or Attendance/Examination module built.

### Added

- `prisma/schema.prisma` — `SchoolClass` (named to avoid JS/TS's `class` reserved word — `schoolClassId`, not `classId`, throughout), `Section`, `Subject`, plus the required opposite-relation fields on `School`/`AcademicYear`.
- `prisma/migrations/20260718000300_academic_foundation/` — applied via `prisma migrate deploy`; includes three hand-added partial unique indexes (`WHERE deleted_at IS NULL`) per `docs/database/SOFT_DELETE_STRATEGY.md § 2`.
- `src/repositories/{school,academicYear,schoolClass,section,subject}/` — five new repositories; `school`/`academicYear` close a pre-existing "no direct Prisma outside repositories" gap from Sprint 0.
- `src/services/academic/` — `createSchoolClassWithSections()` (class + its sections + AuditLog entries, one transaction) and `createAcademicSubject()`. Smoke-tested end to end against the live database and cleaned up.
- `src/lib/validations/academic.ts` — Zod schemas for `SchoolClass`/`Section`/`Subject` inputs.
- `prisma/seed.ts` — extended to seed 11 generic `SchoolClass` rows (Nursery–Class 8) with sections A/B each, and 10 generic subjects, all idempotent. Refactored to route every write through repositories/services and use the shared `src/lib/db.ts` singleton exclusively — no longer constructs its own `PrismaClient`.

### Verified

- `pnpm run build`, `typecheck`, `lint`, `format:check` — all clean.
- `prisma validate`, `prisma migrate status` — schema valid, database up to date (4/4 migrations applied).
- Live database queries confirm: 11 `SchoolClass`, 22 `Section`, 10 `Subject` rows. Re-running the seed script produces no duplicates (idempotent).
- `grep` confirms zero direct `db.<model>` access outside `src/repositories/`, across all ten Prisma models now in the schema.
- Confirmed no circular dependency between `academic` and `identity` modules, and no hidden Pant-Public-School-specific coupling in any repository/service/validator file (both via grep).

### Known Issues

- `ClassSubject` (Subject↔SchoolClass many-to-many) deliberately not built — outside this sprint's scope.
- No response-shaping/DTO layer exists yet for academic entities — same open item as identity (D-029).

---

## [0.17.0] — 2026-07-18 — Sprint 1: Identity Foundation

Migration 002 — `Role`, `User`, `Account`, `Session`, `VerificationToken` (Auth.js `@auth/prisma-adapter` shape, extended with this app's own fields), per [D-028](./DECISIONS.md#d-028--sprint-1-identity-foundation-role-as-a-lookup-table-with-accesslevel-user-merges-authjss-adapter-shape-repositoryservice-layer-introduced). Applied for real to a live Neon PostgreSQL database and verified with live queries — unlike Sprint 0, no database availability limitation this time. No API, UI, or business module built.

### Added

- `prisma/schema.prisma` — `Role` (lookup table: `name`, `accessLevel` enum `ADMIN | TEACHER`, `description`), `User` (Auth.js adapter fields + `schoolId`/`roleId`/`passwordHash`/`deactivatedAt`), `Account`/`Session`/`VerificationToken` (Auth.js's canonical adapter shape — `Account`'s OAuth-response fields kept as literal snake_case field names, a deliberate exception to this project's camelCase convention, since the adapter's own code constructs Prisma calls using those exact keys).
- `prisma/migrations/20260718000200_identity_foundation/` — applied to the live database via `prisma migrate deploy`.
- `src/repositories/user/`, `src/repositories/role/` — the project's first data-access layer. `findUserById`/`findUserByEmail`/`listUsersBySchool`/`createUser`/`updateUser`/`deactivateUser`; `findRoleById`/`findRoleByName`/`listRoles`/`createRole`. All accept an optional transaction client, defaulting to the shared singleton.
- `src/services/identity/` — `createIdentityUser()`: validates input, looks up the role, checks for an existing email, then creates the `User` and writes its `AuditLog` entry in one `db.$transaction`, per `TRANSACTION_BOUNDARIES.md § 1`. Smoke-tested end to end against the live database (created, verified, cleaned up).
- `src/validators/identity.ts` — Zod schemas: `accessLevelSchema`, `createRoleInputSchema`, `createUserInputSchema`.
- `prisma/seed.ts` — extended to seed three `Role` rows (Administrator, Principal — both `ADMIN`; Teacher — `TEACHER`), idempotent (skips if a role with the same name already exists). No `User` rows seeded, per this sprint's explicit instruction.

### Verified

- `pnpm run build`, `typecheck`, `lint`, `format:check` — all clean.
- `prisma validate`, `prisma migrate status` — schema valid, database up to date (3/3 migrations applied).
- Live database queries confirm: 3 `Role` rows, 0 `User` rows, 0 `AuditLog` rows (smoke-test rows cleaned up after verification).
- `grep` confirms zero direct `db.user`/`db.role`/`db.account`/`db.session`/`db.verificationToken` access outside `src/repositories/`.

### Known Issues

- The Auth.js provider decision (credentials vs. email magic link, `ARCHITECTURE.md § 9`) remains open; `src/lib/auth.ts` is still unbuilt. This schema supports either without redesign.
- `AuditLog`'s append-only grant-revocation and partitioning (deferred since Sprint 0, `D-027`) are still not applied.
- `src/lib/validations/` (empty since Phase 0B.1) and the new `src/validators/` now overlap in stated purpose — flagged, not resolved.
- Migration 002 (Academic Structure, per `MIGRATION_PLAN.md`'s original table) is still not built; this sprint's Migration 002 folder implements different content (Identity) — see `MIGRATION_PLAN.md`'s Sprint 1 status note.

---

## [0.16.0] — 2026-07-18 — Sprint 0: Data Foundation

The first real application code and database schema — `AuditLog` (Migration 000) and `School`/`AcademicYear` (Migration 001) only, per [D-027](./DECISIONS.md#d-027--sprint-0-data-foundation-migrations-000-001-implemented-prisma-7-config-model-schoolstatusseed-placeholders). No later migration, API route, or UI built. Not applied to a live database — none is available in this environment; schema-validated and SQL-generated (`prisma migrate diff`) only.

### Added

- `prisma/schema.prisma` — `AuditLog` (Migration 000: `id` (UUIDv7), `schoolId`, `entityType`, `entityId`, `actorUserId`, `action` (`AuditAction` enum), `beforeValue`/`afterValue` (JSON), `timestamp`) and `School`/`AcademicYear` (Migration 001), following `docs/database/MIGRATION_PLAN.md` and `docs/database/PRISMA_IMPLEMENTATION_GUIDE.md`'s naming (`@@map`/`@map` to `snake_case`), type-mapping (`timestamptz`, `jsonb`), and relation-mode conventions.
- `prisma/migrations/20260718000000_audit_foundation/` and `prisma/migrations/20260718000100_school_foundation/` — hand-verified SQL, including a hand-added partial unique index (`academic_years_one_current_per_school`, `WHERE is_current = true`) not expressible in `schema.prisma` syntax, per `CONSTRAINT_STRATEGY.md § 3`.
- `src/lib/db.ts` — Prisma Client singleton, driver-adapter pattern (`@prisma/adapter-pg`), hot-reload-safe in development.
- `src/lib/env.ts` — Zod-validated environment variables (`DATABASE_URL`, `DIRECT_URL`, `NODE_ENV`), scoped to what this codebase reads today.
- `src/lib/db-utils.ts` — `checkDatabaseHealth()` (not wired into any route) and `writeAuditLog()` (accepts a transaction client, per `TRANSACTION_BOUNDARIES.md § 1`).
- `prisma/seed.ts` — seeds one `School` and one `AcademicYear` (`isCurrent = true`) from `src/config/school.ts`.
- `@prisma/adapter-pg`, `tsx` — new dependencies required by Prisma 7's driver-adapter connection model and the seed script's standalone execution.

### Fixed

- `prisma.config.ts` only loaded `.env`, never `.env.local` — a real bug (found before it could silently break a future `prisma migrate deploy`) against `.env.example`'s own documented convention. Now loads `.env.local` then `.env` explicitly; the same fix applied to `prisma/seed.ts`, which also runs standalone via `tsx`.

### Changed

- `.env.example` — added `DIRECT_URL` (unpooled, used by Prisma Migrate) alongside the existing pooled `DATABASE_URL`.
- `prisma.config.ts` — `datasource.url` now reads `DIRECT_URL`, not `DATABASE_URL`; added `migrations.seed`.
- `docs/database/PRISMA_IMPLEMENTATION_GUIDE.md` § 2 — corrected: Prisma 7 removed `url`/`directUrl` from `schema.prisma`'s `datasource` block; connection config now splits between `prisma.config.ts` and a runtime driver adapter.

### Known Issues

- No live PostgreSQL is available in the current environment — migrations are schema-validated and SQL-generated only, not applied.
- `AuditLog`'s append-only enforcement (`REVOKE UPDATE, DELETE ...`) and partitioning decision are both deferred — the former needs a real Postgres role name not yet chosen; the latter per `AUDIT_STRATEGY.md § 3`'s explicit fallback.
- Seeded `AcademicYear` dates and `promotionPolicy` are provisional (computed April–March window, explicitly-unconfigured policy marker) — `src/config/school.ts`'s `academicSession` is still an unconfirmed placeholder.

---

## [0.15.1] — 2026-07-18 — Pre-Prisma Consistency Verification

Documentation-only verification and fix pass across `docs/domain/` and `docs/database/` — no Prisma schema, SQL, migration, or application code touched.

### Fixed

- `docs/domain/DATABASE_SCHEMA.md` — applied the three schema gaps [D-025](./DECISIONS.md#d-025--physical-database-review-time-ordered-ids-for-high-volume-tables-partial-unique-indexes-partitioned-audit-log) had flagged but deferred: `Section` and `Subject` now have their missing uniqueness constraints; `TransferCertificate.tcNumber` is now `@@unique([schoolId, tcNumber])` (with a direct `schoolId` field added, since a same-table unique constraint can't span a join) instead of incorrectly global.
- `docs/domain/DATABASE_SCHEMA.md` — `PromotionRecord.basis` and `AuditLog.action` promoted from plain strings to native enums, matching `ENUM_STRATEGY.md`'s own recommendations the schema hadn't yet incorporated.
- `docs/domain/DATABASE_SCHEMA.md` — `TeacherAssignment` gained its missing subject-assignment uniqueness constraint; `AdmissionApplication.resultingStudentId` gained its missing `@relation` declaration (every other FK field in the document had one; this one didn't).
- `docs/domain/DATABASE_SCHEMA.md` § 2 — the "every model uses `cuid()`" convention now notes its three documented exceptions (`AttendanceRecord`, `MarksRecord`, `AuditLog` → time-ordered IDs), previously stated only in `DATABASE_REVIEW.md`.
- `docs/domain/ERD.md` — removed a `DocumentRecord` diagram edge that contradicted the document's own "Reading Notes" claim that `DocumentRecord` is "intentionally absent" from the diagram; the edge also misrepresented the entity's actual polymorphic `ownerType`/`ownerId` design as a direct FK.
- `docs/domain/DATA_DICTIONARY.md` — updated in lockstep with every `DATABASE_SCHEMA.md` change above (new `schoolId` row on `TransferCertificate`, `basis`/`action` type changes, `AcademicYear.isCurrent`/`TeacherAssignment` constraint notes).

### Added

- `docs/database/TRANSACTION_BOUNDARIES.md` — a new 12th database document. No prior document systematically addressed which multi-table writes (including a mutation's own `AuditLog` entry) must be atomic — a genuine, load-bearing gap surfaced by cross-referencing `WORKFLOWS.md` against `AUDIT_STRATEGY.md`, not invented scope. Covers every multi-table write in the schema, batch-size reasoning for attendance/marks submission, why Academic Year Rollover should not be one giant transaction, and check-then-act race conditions resolved via unique constraints rather than application-level locking.

### Verified, No Change Needed

- All 29 entities present and named identically across `DATABASE_SCHEMA.md`, `DOMAIN_MODEL.md`, and `DATA_DICTIONARY.md`.
- Every "Served by" index citation in `QUERY_PATTERNS.md` matches a real row in `INDEXING_STRATEGY.md`; every index in `INDEXING_STRATEGY.md` has an explanation, whether or not it also appears as a full SQL example.
- Every major lifecycle in `BUSINESS_RULES.md` has a corresponding event in `EVENT_MODEL.md`.
- `MIGRATION_PLAN.md`'s 11-migration sequence is dependency-correct (some "Depends on" notes are transitively-sufficient rather than maximally explicit — not a functional defect).
- Document overlap between `DATABASE_REVIEW.md`/`INDEXING_STRATEGY.md` and `CONSTRAINT_STRATEGY.md`/`SOFT_DELETE_STRATEGY.md` is a deliberate, minimal "define once, apply locally" pattern — no merge warranted.

### Changed

- `docs/DECISIONS.md` — added [D-026](./DECISIONS.md#d-026--pre-prisma-consistency-verification-transaction-boundaries-added-schema-gaps-closed).
- `docs/database/README.md` — doc map updated for `TRANSACTION_BOUNDARIES.md`.
- `docs/database/PRISMA_IMPLEMENTATION_GUIDE.md § 9` — checklist updated to reflect the now-closed schema gaps and a new transaction-boundaries check item.

### Known Issues

- None — documentation-only change; no build/typecheck/lint impact.

---

---

## [0.15.0] — 2026-07-18 — Physical Database Review

Architecture only — no Prisma schema, SQL, or migration created, per this task's own "not implementation" instruction.

### Added

- `docs/database/README.md` — overview, scope, relationship to `docs/domain/`, self review
- `docs/database/DATABASE_REVIEW.md` — entity-by-entity physical review of Student, Guardian, Academic Year, Section, Subject, Teacher Assignment, Enrollment, Attendance, Examination, Transfer Certificate, and Promotion; direct answers to the four required questions (why Attendance/Results reference Enrollment not Student, which tables are append-only, which are never updated/deleted); three schema gaps found and flagged
- `docs/database/INDEXING_STRATEGY.md` — every index the schema needs, each tied to the query it serves
- `docs/database/CONSTRAINT_STRATEGY.md` — database-enforced vs. application-enforced rules, real (not emulated) foreign keys, the partial-unique-index pattern, `CHECK` constraints, RLS considered and deferred to Epic H
- `docs/database/ENUM_STRATEGY.md` — native Postgres enum vs. plain string vs. lookup table, field by field
- `docs/database/AUDIT_STRATEGY.md` — `AuditLog` append-only enforcement via role grant revocation, partitioning tradeoff, retention policy, PII redaction in before/after snapshots
- `docs/database/SOFT_DELETE_STRATEGY.md` — three soft-delete categories, the partial-unique-index requirement, cascade behavior on deactivation
- `docs/database/QUERY_PATTERNS.md` — 10 illustrative query patterns tied directly to `WORKFLOWS.md`/`REPORTING_MODEL.md`
- `docs/database/MIGRATION_PLAN.md` — 11 small, independent, ordered migrations (000–010); `AuditLog` moved first, not last, correcting the domain model's own conceptual ordering
- `docs/database/PERFORMANCE_GUIDELINES.md` — 15-year growth projections (`AttendanceRecord`: 600K–6.6M rows for one school), connection pooling, pagination, caching, N+1 avoidance
- `docs/database/PRISMA_IMPLEMENTATION_GUIDE.md` — schema file organization, naming conventions, migration workflow, relation mode, seeding, type-mapping notes, a ready-for-Prisma checklist

### Key Design Decisions

- `AttendanceRecord`, `MarksRecord`, and `AuditLog` — the three genuinely high-volume, append-heavy tables — should use time-ordered IDs (ULID/UUIDv7) instead of the domain model's uniform `cuid()`; every other table stays `cuid2`.
- `AcademicYear.isCurrent` and `TeacherAssignment.isClassTeacher`'s "exactly one per scope" rules should be schema-enforced via Postgres partial unique indexes, not left as application-only invariants.
- Every unique constraint on a soft-deletable table must be scoped `WHERE "deletedAt" IS NULL`.
- `AuditLog` should be partitioned by `timestamp` from its first migration, and that migration should ship first (Migration 000), not last.
- `AttendanceRecord`/`MarksRecord` stay mutable-with-full-audit-trail rather than fully event-sourced — a deliberate scale judgment, not an oversight.

### Schema Gaps Found (Flagged, Not Fixed Here)

- `Section` missing `@@unique([classId, academicYearId, name])`.
- `Subject` missing `@@unique([schoolId, name])`.
- `TransferCertificate.tcNumber` drafted globally unique instead of `@@unique([schoolId, tcNumber])` — would break at Epic H's first second-tenant onboarding.

Corrections belong in `docs/domain/DATABASE_SCHEMA.md`'s own next edit, not this review.

### Changed

- `docs/DECISIONS.md` — added [D-025](./DECISIONS.md#d-025--physical-database-review-time-ordered-ids-for-high-volume-tables-partial-unique-indexes-partitioned-audit-log).
- `docs/PROJECT_CONTEXT.md` — §2 current phase updated; §5 added the review as a completed architecture artifact; §14 doc map updated.
- `docs/ROADMAP_V2.md § Epic B` — physical database review listed as a second completed architecture milestone alongside the domain model; first-Prisma-models bullet now cross-references the migration plan.

### Known Issues

- None — documentation-only change; no source files touched, no build/typecheck/lint impact.

---

## [0.14.1] — 2026-07-17 — Website Engine v1.0 Release Readiness Review

Review only — no new features, pages, or architecture. Two genuine defects found and fixed; everything else is a finding, not a change. Full report: [IMPLEMENTATION_LOG.md](./IMPLEMENTATION_LOG.md).

### Fixed

- `src/components/website/Hero.tsx` — the homepage Hero's lead paragraph hardcoded "Vidyadhar Nagar" instead of interpolating `SCHOOL.locationShort`, even though the same component already imports and uses `SCHOOL` two lines above. A second tenant with a different location would have silently shown Pant Public School's location in this sentence.
- `src/components/website/pages/About/metadata.ts` — the page's SEO description hardcoded "Vidyadhar Nagar, Jaipur" instead of interpolating `SCHOOL.locationShort`, visible in search results and social share previews for a future tenant.

### Verified, No Change Needed

- Zero remaining hardcoded school-identity literals outside `src/config/` and the guarded, production-404'd `/dev/playground` sandbox.
- All 17 Marketing Section Library components match `COMPONENT_INVENTORY.md` exactly, by name, with no drift.
- `prisma/schema.prisma` genuinely has zero models — `src/generated/prisma`'s existence is a correctly `.gitignore`d local Prisma Client build artifact, not evidence of undocumented schema work.
- No `console.log`, `TODO`/`FIXME`, or `any`-typed hand-written code anywhere in `src/` (the only `any` usages are inside auto-generated Prisma client internals).
- `src/features/` does not exist; `nav-links.ts` was correctly deleted; role-segmented `components/{admin,shared,teacher,ui,website}` structure intact.
- `(admin)`, `(auth)`, `(teacher)`, and `api/` route groups are already scaffolded (empty, Phase 0B.1) — Epic B can begin without restructuring `src/app/`.
- Every internal link across all 7 pages resolves to either a built route or a consistently documented, intentionally-unbuilt one (`/gallery`, `/notices`, `/admissions/enquiry`, `/login`) — no undocumented broken link found.
- Fresh `pnpm typecheck` / `lint` / `build` all clean before and after the two fixes above; bundle sizes unchanged (behavior-neutral fix).

### Non-Blocking Findings (not fixed — logged for future awareness)

- The practice of citing a `TXT-`/`IMG-`/`DOC-` registry ID directly inside a page's own bracketed placeholder text only began with the School Life Experience milestone. `About`, `Academics`, `Admissions`, and `Campus`'s placeholders remain fully tracked in `TEXT_REGISTRY.md` via file+line citation (the framework's original convention) but don't self-cite inline. Not a functional defect — retrofitting is optional future cleanup, not required before Epic B.

---

## [0.14.0] — 2026-07-17 — Document Center Experience

### Added

- `/documents` — seventh public page, `src/components/website/pages/DocumentCenter/` (`content.ts`, `sections.ts`, `page.tsx`, `metadata.ts`, `README.md`, `index.ts`), following the [D-016](./DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export) page-composite pattern. New `src/app/(public)/documents/` route directory (didn't previously exist, not even as a `.gitkeep`). 9 sections: Page Hero, Document Categories Overview, Admission Documents, Academic Documents, Mandatory Public Disclosures, School Policies, Circulars & Notices, FAQ, Contact CTA. No submission form — informational only.
- Four document categories (Admission Documents, Academic Documents, Mandatory Public Disclosures, School Policies) rendered from a single data array (`DOCUMENT_CENTER_CATEGORIES`) via `.map()`, not hand-written per-category JSX — see [D-024](./DECISIONS.md#d-024--document-center-renders-categories-from-a-data-array-not-hand-written-jsx-blocks).
- `docs/onboarding/DOCUMENT_REGISTRY.md` — populated for the first time: 13 items (`DOC-001`–`DOC-013`) across the four categories, replacing its prior "zero requirements identified" finding.
- `docs/onboarding/TEXT_REGISTRY.md` — new "Document Center" section, 6 new items (`TXT-066`–`TXT-071`).
- `docs/onboarding/CONTENT_COLLECTION_GUIDE.md` — "Documents" section populated with real collection guidance, replacing its prior "nothing is currently required here" placeholder.

### Key Design Decisions

- Every document is a named, empty slot citing its own `DOCUMENT_REGISTRY.md` ID — no filename was invented anywhere.
- Mandatory Public Disclosures names real, well-known Indian-school disclosure categories (affiliation/recognition certificate, trust registration, fire & building safety certificate, fee structure) without asserting they're confirmed requirements for this specific school — a `Callout` states plainly that applicability depends on `SCHOOL.affiliation`, itself still unconfirmed.
- Circulars & Notices explains a future capability (the not-yet-built `/notices` route) rather than fabricating a sample notice.
- No new Marketing Section Library component was needed — every category's document list reuses `FeatureGrid`'s existing "pending-asset card citing a registry ID" pattern already established for photos, now applied to documents for the first time.

### Changed

- `docs/DECISIONS.md` — added [D-024](./DECISIONS.md#d-024--document-center-renders-categories-from-a-data-array-not-hand-written-jsx-blocks) (data-driven category rendering).
- `docs/onboarding/CONTENT_DASHBOARD.md` — all readiness math recalculated: 78 → 97 total content items (a new "Document Items" column added to Per-Page Readiness), 72 → 91 Active, new Structural Completeness row for `/documents`.
- `docs/COMPONENT_INVENTORY.md` — `DocumentCenter` added to the Website Pages table (now 7 pages).
- `docs/ROUTES.md` — `/documents` row updated from an unbuilt placeholder to Built status.
- `docs/onboarding/README.md` — document-registry row updated to reflect real content; removed two other stale hardcoded item counts that had drifted since the CRF's creation.

### Content Decisions

- No government document, policy, or downloadable file was invented — every one is a bracketed placeholder citing a `DOCUMENT_REGISTRY.md` ID.
- Document category and type names (e.g., "Academic Calendar," "Fee Structure") are treated as generic, real document types — safe to state in full — while their actual contents remain fully bracketed.
- No navigation change was needed — `"Downloads"` (labeling `/documents`) was already present in `NAV_LINKS` since Phase 1A.

### Verified

- Isolated headless Chrome instance (fresh temp profile, dedicated debug port), independent dev server on a separate port — the pre-existing dev server on port 3000 was left untouched throughout.
- Desktop (1440×900), tablet (768×1024), and mobile (375×812) viewports: single `<h1>`, correct heading hierarchy with no skipped levels across 8 sections' worth of nested content, single `<main>`, valid JSON-LD, zero console errors/exceptions, no horizontal overflow, "Downloads" nav link resolving correctly at every viewport.

### Known Issues

- None — `pnpm run typecheck`, `lint`, and `build` all clean; `/documents` prerenders static.

---

## [0.13.0] — 2026-07-17 — Contact & Visit Experience

### Added

- `/contact` — sixth public page, `src/components/website/pages/Contact/` (`content.ts`, `sections.ts`, `page.tsx`, `metadata.ts`, `README.md`, `index.ts`), following the [D-016](./DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export) page-composite pattern. 9 sections: Page Hero, Contact Overview, Office Information, School Timings, Visit the Campus, Map Placeholder, FAQ, Admission Enquiry CTA, Contact Summary. No submission form — informational only, forwards admission-related contact to `/admissions/enquiry`.
- `DataTable` — 17th Marketing Section Library component (`src/components/website/sections/DataTable/`), promoted from `Admissions`'s page-local helper — see [D-023](./DECISIONS.md#d-023--datatable-promoted-from-page-local-helper-to-shared-component).
- `docs/onboarding/TEXT_REGISTRY.md` — new "Contact" section, 7 new items (`TXT-059`–`TXT-065`).
- `docs/onboarding/IMAGE_REGISTRY.md` — 1 new item (`IMG-013`, location map/campus exterior photo).

### Changed

- `Admissions/page.tsx` refactored to import `DataTable` from the shared library instead of defining it locally — behavior-neutral.
- `Admissions/README.md` — "Components Reused" section updated to reflect the promotion; removed the now-fulfilled "promote if a second page needs it" Future Enhancement.
- Six previously-**Latent** `TEXT_REGISTRY.md` cross-cutting items (`TXT-002`, `TXT-003`, `TXT-004`, `TXT-008`, `TXT-009`, `TXT-010` — address, email, phone, emergency contact, office hours, visit hours) reclassified **Active**, now visible at `/contact`; priorities reassessed given real visibility (phone/email/office hours raised to P0).
- `docs/onboarding/CONTENT_DASHBOARD.md` — all readiness math recalculated: 70 → 78 total content items, 59 → 72 Active, per-page/per-category/priority tables updated, new Structural Completeness row for `/contact`.
- `docs/DECISIONS.md` — added [D-023](./DECISIONS.md#d-023--datatable-promoted-from-page-local-helper-to-shared-component) (DataTable promotion).
- `docs/COMPONENT_INVENTORY.md` — `DataTable` added to the Marketing Section Library table (now 17 components); `Contact` added to the Website Pages table (now 6 pages); `Admissions`'s row updated to reflect the promotion.
- `docs/ROUTES.md` — `/contact` row updated from an unbuilt placeholder to Built status.

### Content Decisions

- No contact detail, coordinate, map, office timing, or testimonial was invented — every fact is read directly from `src/config/{school,contact}.ts`, all still bracketed placeholders.
- The Map Placeholder section deliberately does not embed a map, per explicit task instruction — a single `Callout` cites `IMAGE_REGISTRY.md § IMG-013` and notes `CONTACT.googleMapsUrl` is `null`.
- Contact Overview's badges (location, classes offered) are the only genuinely real facts on the page — both already-confirmed `SCHOOL` config values reused from elsewhere, not new claims.
- The Contact Summary's social-channels note is a Process Note (Engineering-owned), stating the true current fact that `src/config/social.ts` → `SOCIAL_LINKS` are all `null` — not content for School Admin to write.
- No navigation change was needed — `"Contact"` was already present in `NAV_LINKS` since Phase 1A, pointing at a route that 404'd until this page existed.

### Verified

- Isolated headless Chrome instance (fresh temp profile, dedicated debug port), independent dev server on a separate port — the pre-existing dev server on port 3000 was left untouched throughout.
- Desktop (1440×900), tablet (768×1024), and mobile (375×812) viewports: single `<h1>`, correct heading hierarchy with no skipped levels, single `<main>`, valid JSON-LD, zero console errors/exceptions, no horizontal overflow, "Contact" nav link resolving correctly at every viewport.

### Known Issues

- None — `pnpm run typecheck`, `lint`, and `build` all clean; `/contact` prerenders static.

---

## [0.12.0] — 2026-07-17 — School Domain Model

Architecture and documentation only — no Prisma models, migrations, API routes, or UI components created, per this task's own "architecture only" instruction.

### Added

- `docs/domain/README.md` — overview, scope, research basis (RTE Act 2009 + Amendment 2019, UDISE+, TC field requirements), future-integration-seam policy
- `docs/domain/DOMAIN_MODEL.md` — ~29 entities across 7 bounded contexts (School & Academic Structure, People & Identity, Admission, Enrollment & Progression, Attendance, Examination, System/Cross-Cutting), each with Purpose/Owner/Relationships/Future dependencies/Audit requirements/Soft delete strategy/Configuration
- `docs/domain/ERD.md` — full mermaid entity relationship diagram + cardinality reference table
- `docs/domain/DATABASE_SCHEMA.md` — illustrative Prisma-like pseudo-schema for every entity (explicitly not an executable schema)
- `docs/domain/DATA_DICTIONARY.md` — field-by-field type/nullability/constraints/PII classification, including a DPDP Act 2023-aware Minor PII category
- `docs/domain/BUSINESS_RULES.md` — every governing rule, classified Code (universal) vs. Configuration (per-school/per-state), covering admission eligibility, RTE quota, attendance, examinations/grading, promotion/detention policy, transfer, data protection, and teacher-assignment compliance ratios
- `docs/domain/WORKFLOWS.md` — 8 mermaid flowcharts covering admission, daily attendance, marks entry, examination setup, promotion, transfer/withdrawal, teacher onboarding, and academic-year rollover
- `docs/domain/EVENT_MODEL.md` — 12 named domain events with payloads and today's-vs-future consumers (no event bus implemented)
- `docs/domain/PERMISSION_MATRIX.md` — role × entity × action matrix for Guest/Admin/Teacher (V1) and Parent/Student (Future, explicitly unbuilt)
- `docs/domain/REPORTING_MODEL.md` — V1 report catalog, future compliance reports (PTR, teacher qualification, UDISE+ export), and the Epic G analytics tie-in
- `docs/domain/API_BOUNDARIES.md` — 9 logical module boundaries, their dependency graph, and where a future external API layer would begin

### Key Design Decisions

- `Enrollment` (one row per student per academic year) is the structural hub every year-scoped entity keys off — not a mutable "current class" field on `Student` — see [D-022](./DECISIONS.md#d-022--school-domain-model-board-agnostic-enrollment-centric-rte-aware).
- Promotion/detention policy, admission-age cutoffs, grading scales, and board affiliation are all `School`/`AcademicYear`-level configuration, never hardcoded — Rajasthan has reintroduced Class 5/8 detention under the RTE Amendment Act 2019; other states have not.
- `Student.udisePen` and `School.udiseCode` are modeled explicitly as near-universal Indian schooling compliance facts, not Pant-Public-School-specific ones.
- Fee, Transport, Parent Portal, and Student Portal are named only as attachment seams (which entity a future module would reference), not designed — each remains gated behind [PROJECT_GUARDRAILS.md § 2](./PROJECT_GUARDRAILS.md#2-module-approval-process)'s Module Approval Process.

### Changed

- `docs/DECISIONS.md` — added [D-022](./DECISIONS.md#d-022--school-domain-model-board-agnostic-enrollment-centric-rte-aware)
- `docs/PROJECT_CONTEXT.md` — §2 current phase updated; §5 added the domain model as a completed (architecture-only) artifact; §14 doc map updated
- `docs/ROADMAP_V2.md § Epic B` — domain model listed as a completed architecture milestone; first-Prisma-models bullet now cross-references the design reference

### Known Issues

- None — documentation-only change; no build/typecheck/lint impact expected (no source files touched), verified by re-running the full pipeline anyway per established practice.

---

## [0.11.0] — 2026-07-17 — School Life Experience

### Added

- `/school-life` — fifth public page, `src/components/website/pages/SchoolLife/` (`content.ts`, `sections.ts`, `page.tsx`, `metadata.ts`, `README.md`, `index.ts`), following the [D-016](./DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export) page-composite pattern. 10 sections: Page Hero, Life Beyond Classrooms (narrative), Annual Events, Sports & Competitions, Cultural Activities, Celebrations, Student Achievements, Gallery Preview, Parent Testimonial, CTA.
- `Prose` — 16th Marketing Section Library component (`src/components/website/sections/Prose/`), promoted from `Campus`'s page-local helper — see [D-020](./DECISIONS.md#d-020--prose-promoted-from-page-local-helper-to-shared-component).
- `"School Life"` added to `src/config/navigation.ts`'s `NAV_LINKS`, between Campus and Admissions.
- `docs/onboarding/TEXT_REGISTRY.md` — 18 new items (`TXT-041`–`TXT-058`), generated from `SchoolLife/content.ts`'s bracketed placeholders.
- `docs/onboarding/IMAGE_REGISTRY.md` — 4 new items (`IMG-009`–`IMG-012`), Gallery Preview categories.

### Changed

- `Campus/page.tsx` refactored to import `Prose` from the shared library instead of defining it locally — behavior-neutral (confirmed via build output: page weight unchanged at 657B).
- `Campus/README.md` — "Components Reused" section updated to reflect the promotion.
- `docs/onboarding/CONTENT_DASHBOARD.md` — all readiness math recalculated: 48 → 70 total content items, 37 → 59 Active, per-page/per-category/priority tables updated.
- `docs/DECISIONS.md` — added [D-020](./DECISIONS.md#d-020--prose-promoted-from-page-local-helper-to-shared-component) (Prose promotion) and [D-021](./DECISIONS.md#d-021--school-life-experience-ships-with-deliberate-component-variety-not-a-repeated-gallery-grid) (deliberate component variety over a repeated gallery grid).
- `docs/COMPONENT_INVENTORY.md` — `Prose` added to the Marketing Section Library table (now 16 components); `SchoolLife` added to the Website Pages table (now 5 pages); `Campus`'s row updated to reflect the `Prose` promotion.
- `docs/ROUTES.md` — `/school-life` row added; public site header nav list updated.

### Content Decisions

- Life Beyond Classrooms is real, published values-statement copy (same category as `About`'s Mission/Vision) — not bracketed.
- Annual Events, Sports & Competitions, Cultural Activities, Celebrations, and Student Achievements are fully bracketed placeholders, per explicit task instruction — unlike Academics' curriculum categories, these genuinely vary school to school and no achievement, event, or activity was invented.
- Gallery Preview follows `Campus`'s established four-category-card + disclaimer pattern, with captions citing the specific new `IMAGE_REGISTRY.md` IDs (`IMG-009`–`IMG-012`) directly.
- Parent Testimonial placeholder explicitly states it is not a paraphrase of anything real, guarding against a future careless copy-paste being mistaken for a genuine quote.

### Verified

- Isolated headless Chrome instance (fresh temp profile, dedicated debug port), independent dev server on a separate port — the pre-existing dev server on port 3000 was left untouched throughout, per the session's permanent browser-safety rules.
- Desktop (1440×900), tablet (768×1024), and mobile (375×812) viewports: single `<h1>`, correct heading hierarchy with no skipped levels, single `<main>`, valid JSON-LD, zero console errors/exceptions, no horizontal overflow, "School Life" present in nav markup with the correct `href` at every viewport.

### Known Issues

- None — `pnpm run typecheck`, `lint`, and `build` all clean (11 routes); `/school-life` prerenders static at 657B, matching every other page composite's footprint.

---

## [0.10.0] — 2026-07-17 — Content Readiness Framework (CRF)

Documentation and process only — no code changes, no UI changes.

### Added

- `docs/onboarding/README.md` — the CRF's own overview, status lifecycle, content-vs-process-note distinction, and Self Review
- `docs/onboarding/TEXT_REGISTRY.md` — 40 text content items, generated by grepping every bracketed placeholder in `src/config/school.ts`, `src/config/contact.ts`, and all four pages' `content.ts` files
- `docs/onboarding/IMAGE_REGISTRY.md` — 8 image content items, including the favicon (currently the default Next.js scaffold icon) and all four Campus Gallery Preview placeholders
- `docs/onboarding/DOCUMENT_REGISTRY.md` and `docs/onboarding/VIDEO_REGISTRY.md` — both genuinely empty; no page references any document or video content, and both explicitly say so rather than being padded with invented future items
- `docs/onboarding/CONTENT_DASHBOARD.md` — overall/per-page/per-category readiness, calculated by counting registry rows, not estimated; includes a "Structural Completeness" table (100% for all four pages) alongside the 0% content-readiness baseline, and an Active/Latent/Silently-absent breakdown
- `docs/onboarding/CONTENT_COLLECTION_GUIDE.md` — plain-language photography/collection guidance for school staff
- `docs/onboarding/SCHOOL_ONBOARDING_CHECKLIST.md` — five-phase onboarding lifecycle, written generically enough to reuse for a future second school
- `docs/onboarding/GO_LIVE_CHECKLIST.md` — the narrow, final pre-launch gate, keyed to the dashboard's 16 P0 items

### Content Findings

- 48 total content requirements identified across the four built pages — 40 text, 8 image, 0 document, 0 video.
- 4 of the 40 text items are not content to collect at all — they're internal `Callout` "Before this goes live" process notes, owned by Engineering (removed on resolution), not School Admin.
- 10 of the 48 items are "Latent" — defined in config but not yet rendered by any built page (e.g., address, email, phone) — and do not block the current four pages from launching.
- The persistent site chrome (header, footer, homepage) has zero visible placeholders; every Active item is scoped to a specific page section.

### Changed

- `docs/PROJECT_CONTEXT.md` — §2 current phase/sprint updated (also caught up the Milestone 6B → SOS pivot transition that a prior session's edit had deliberately left untouched); §5 added SOS pivot and CRF as completed features; §13 risk row for bracketed placeholders now points to the dashboard instead of a manual grep instruction; §14 doc map updated
- `docs/PRODUCT_VISION.md § 10` — one line added cross-linking near-term success metrics to the CRF dashboard
- `docs/ROADMAP_V2.md § Epic A` — CRF added to the (now substantially complete) milestone list

### Known Issues

- None — this is a documentation-only change; the full verification pipeline (format/lint/typecheck/build) was run to confirm zero unintended code impact, same as the SOS pivot before it.

---

## [0.9.0] — 2026-07-17 — Product Architecture Foundation: School Operating System (SOS) Pivot

Documentation and architectural-direction only — no code changes, no UI changes, no refactor, no feature work.

### Added

- `docs/PRODUCT_VISION.md` — mission, vision, target audience, primary users, core principles, engineering/product philosophy, configuration strategy summary, future expansion, success metrics
- `docs/PRODUCT_ARCHITECTURE.md` — current vs. future architecture; Website Engine, Administration, Teacher/Parent/Student Portal, Shared Platform, Configuration Layer, Content Layer, future API/Mobile/CMS layers; explicit layer boundaries; full architecture review of remaining Pant-Public-School-specific coupling
- `docs/ROADMAP_V2.md` — Epic-based forward roadmap (Epics A–H), mapping all completed work into Epic A (Website Engine) and outlining Epics B–H
- `docs/CONFIGURATION_GUIDE.md` — decision guide and worked examples for what belongs in configuration vs. content vs. code vs. a future database
- Decision D-019 recorded: the product pivot itself, and the reasoning for what was — and deliberately was not — changed as part of it

### Changed

- `docs/PROJECT_CONTEXT.md § 1` — one small, surgical addition cross-linking to `PRODUCT_VISION.md`; the vision paragraph, current-phase tracking, decisions log, and risk register are otherwise untouched, since they remain accurate for what's built today. § 14 Reference Links updated with the four new documents.
- `docs/ARCHITECTURE.md` — status line corrected (was stale since Phase 0B.1, describing "no business functionality, pages... yet" despite five built pages); added a cross-reference to `PRODUCT_ARCHITECTURE.md` for direction, explicitly noting it does not change current-state architecture.

### Architecture Review Findings

- `docs/ARCHITECTURE.md` itself already contained zero Pant-Public-School-specific literals — verified by direct search, not assumed. The architecture was not rescued by this pivot; it was already written generically.
- The actual tenant coupling is exactly where it should be for a single-tenant product: `src/config/school.ts` (hardcoded identity literals), `package.json`'s `name` field, and each page's `content.ts` (correctly tenant-owned content, not a defect).
- No refactor performed — isolation path documented in `PRODUCT_ARCHITECTURE.md § 15` for when a second real tenant exists, not before.

### Known Issues

- None — this is a documentation-only change; the full verification pipeline (format/lint/typecheck/build) was run to confirm zero unintended code impact.

---

## [0.8.0] — 2026-07-17 — Public Website Epic, Milestone 6B: Campus Experience

### Added

- `src/components/website/pages/Campus/` — the Campus Experience page (safety, classrooms, library, computer learning, sports, wellbeing, gallery preview, visit CTA), composed entirely from the Marketing Section Library with zero new components
- `src/app/(public)/campus/page.tsx` — one-line re-export wiring the page composite into the App Router
- `"Campus"` added to `src/config/navigation.ts`'s `NAV_LINKS`, between Academics and Admissions — a real, visible navigation change (this milestone is a new page launch, not a refactor)

### Content Decisions

- Deliberately not a facility-by-facility checklist: four of eight content sections (Safety, Library, Computer Learning, Wellbeing) use narrative prose; `FeatureGrid` is reserved for the three sections that are genuinely a short list of distinct, parallel items (Classrooms, Sports, Gallery Preview).
- Every concrete, checkable facility claim (safety measures, digital learning aids, library collection size, computer lab specs, specific sports facilities, wellbeing provisions) is an explicit bracketed placeholder; the _philosophy_ behind each space is written in full, matching the values-statement-vs-verifiable-fact line already established for `About`/`Academics`.
- Campus Gallery Preview ships with zero real images — no campus photography exists yet. Built as four category cards (Classrooms/Library/Playground/Events) each captioned "[Photo pending]," with a `Callout` disclaimer and a link to the not-yet-built `/gallery` route.
- `/facilities` (previously only a planned route) is effectively superseded by `/campus`'s narrative treatment of the same ground — see `docs/ROUTES.md`.
- Imports every school fact from `src/config/school.ts` (D-018) from day one — the first page built _after_ the config layer existed, rather than refactored onto it afterward.

### Manual Verification

Re-rendered `/campus` in an isolated, temporary-profile headless Chrome instance on a dedicated port, run alongside (not in place of) a pre-existing dev server process this session didn't start — left that process completely untouched throughout, per this milestone's browser-safety instructions. Confirmed zero console errors, correct heading hierarchy (single `<h1>`, sequential `<h2>`s, `<h3>` items), single `<main>`, and that "Campus" appears correctly in both the desktop header nav and the mobile nav drawer.

### Known Issues

- `/campus` must not go to production with its bracketed placeholder text or gallery "[Photo pending]" captions still visible — tracked in `docs/PROJECT_CONTEXT.md § 13` and this page's own README.

---

## [0.7.0] — 2026-07-17 — Public Website Epic, Milestone 6A: Configuration Layer

### Added

- `src/config/{school,branding,navigation,contact,social,seo}.ts` — a centralized, framework-free configuration layer for school-identity, branding, navigation, contact, social, and SEO-default values
- `src/config/README.md` documenting the layer's dependency graph and the deliberate exceptions (social links not yet wired to `SiteFooter`, per-page prose not force-templated)
- Decision D-018 recorded: centralized configuration layer

### Changed (pure refactor — no visible behavior change)

- `src/lib/seo.ts` — now imports `SEO_DEFAULTS` from `config/seo.ts` instead of hardcoding `SITE_URL`/`SITE_NAME` locally
- `src/app/layout.tsx` — root `metadata` now sources from `config/seo.ts`; the inline theme-init `<script>` now interpolates `config/branding.ts`'s `storageKey` instead of a second hardcoded `"pps-theme"` string
- `src/components/shared/ThemeProvider.tsx` — `STORAGE_KEY` now sourced from `config/branding.ts`, the same value the root layout's init script uses, closing a real dual-hardcoded-string risk
- `src/components/website/{Hero,SiteHeader,SiteFooter,MobileNav,StatStrip}.tsx` — school name and location literals replaced with `SCHOOL.name`/`SCHOOL.location`/`SCHOOL.locationShort`; nav imports moved to `config/navigation.ts`
- `src/components/website/pages/{About,Admissions,Academics}/content.ts` — school name, classes, affiliation, and Principal's name/title literals replaced with imports from `config/school.ts`
- `src/components/website/pages/{About,Admissions,Academics}/metadata.ts` — page titles now interpolate `SEO_DEFAULTS.siteName` instead of hardcoding it a third time
- `docs/ROUTES.md` — nav-links.ts path reference updated; two stale route-status rows (`/academics`, `/admissions`) corrected while already editing this file

### Removed

- `src/components/website/nav-links.ts` — content moved to `src/config/navigation.ts` under the same `NAV_LINKS` export name

### Manual Verification

- Re-rendered `/`, `/about`, `/admissions`, `/academics` in an isolated, temporary-profile headless Chrome instance (dedicated debug port, never touching the user's real browser) and diffed every piece of rendered text (header brand, footer brand/location, page titles, h1s, nav labels, Principal figcaption, Admissions badges) against the pre-refactor output — byte-for-byte identical. Confirmed the theme-toggle `localStorage` key is still exactly `"pps-theme"` after unifying its two former hardcoded copies into one config value.

### Known Issues

- `SiteFooter`'s three social icons are not yet wired to `config/social.ts`'s four placeholder URLs — deliberate, see D-018.

---

## [0.6.0] — 2026-07-17 — Public Website Epic, Milestone 5: Academics Experience

### Added

- `src/components/website/pages/Academics/` — the full Academics marketing/information page (philosophy, learning stages, subjects, methodology, co-curricular activities, assessment approach, closing admissions CTA), composed entirely from the Marketing Section Library with zero new components
- `src/app/(public)/academics/page.tsx` — one-line re-export wiring the page composite into the App Router

### Content Decisions

- Learning Stages covers exactly the four named stages (Nursery, Kindergarten, Primary, Upper Primary through Class 8) — no additional grades assumed.
- Subjects & Learning Areas lists seven broad, generic category labels, not a grade-by-grade curriculum breakdown — no detailed curriculum fabricated.
- Co-Curricular Activities uses three generic, safe categories (Sports, Art & Craft, Music) plus one explicit bracketed placeholder, with a `Callout` making clear the section is illustrative, not confirmed.
- Assessment Approach is written generically (growth-tracking vs. ranking) with no board name, no marks-vs-grades specifics, and no examination frequency stated; a `Callout` explicitly flags the real policy needs School Admin confirmation and that this page intentionally avoids board-specific examination rules.
- No curriculum board (CBSE/ICSE/State) is named anywhere on the page.

### Architecture

- No architecture changes — reused the `components/website/pages/<Page>/` composite pattern ([D-016](./DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export)) and the shared `src/lib/seo.ts` helper ([D-017](./DECISIONS.md#d-017--shared-libseots-helper-extracted-on-the-second-page)) exactly as established. No new decision recorded.

### Known Issues

- `/academics` must not go to production with its bracketed placeholder text (co-curricular offerings, assessment policy specifics) still visible — tracked in `docs/PROJECT_CONTEXT.md § 13` and this page's own README.

---

## [0.5.0] — 2026-07-17 — Public Website Epic, Milestone 4: Admissions Experience

### Added

- `src/components/website/pages/Admissions/` — the full informational Admissions page (overview, journey, eligibility, required documents, fees, FAQ, timings, closing CTA), composed entirely from the Marketing Section Library with zero new library components
- `src/app/(public)/admissions/page.tsx` — one-line re-export wiring the page composite into the App Router (replaces the empty Phase 0B.1 scaffold folder)
- `src/lib/seo.ts` — `buildPageMetadata()`/`buildPageJsonLd()`, extracted from duplicated boilerplate now that a second page (`Admissions`) needed the identical pattern `About` already had
- One page-local, unexported `DataTable` helper (in `Admissions/page.tsx`, not a library component) for the two label/value tables (Eligibility, School Timings)
- Decision D-017 recorded: shared SEO helper extraction

### Changed

- `src/components/website/pages/About/metadata.ts` — refactored to use the new `lib/seo.ts` helpers; no behavior change, re-verified via a full browser re-check
- `docs/ARCHITECTURE.md` — `lib/` folder tree entry for `seo.ts`; page-composite pattern note updated to reference the shared SEO helper
- `docs/ROUTES.md` — `/admissions` marked Built (informational); added planned `/admissions/enquiry` for the future form

### Content Decisions

- Ten of the fifteen Marketing Section Library components are now in use across `About`+`Admissions`: this milestone added `BadgeGroup`, `Timeline` (second use), `FeatureGrid` (third/fourth use), `Callout`, and `FAQAccordion` to the set `About` already exercised.
- Per `CONTENT_GUIDELINES.md § 12`, every fact requiring School Admin confirmation is an explicit bracketed placeholder: government affiliation status, all class-wise age criteria, whether/how Aadhaar is required (plus a `Callout` disclaimer that the whole document list needs confirmation), every fee figure (replaced entirely by the required "Official fee structure will be shared by the school administration" messaging), every FAQ answer, and every timing value. The six-step admission journey (Enquiry → Campus Visit → Document Submission → Interaction → Confirmation → Admission) is written in full as process description, not a claimed fact about this school specifically.
- The enquiry **form** is explicitly out of scope — every CTA on this page points to a new, not-yet-built `/admissions/enquiry` route, matching the project's existing pattern of nav links that 404 until their phase arrives.

### Fixed

- Nothing in application code this session — a stale/conflicting local dev-server process from earlier verification steps produced a corrupted (9-byte) CSS bundle during manual browser verification; diagnosed via a direct CSS-bundle fetch, resolved by killing all orphaned Next.js dev processes and restarting clean. Not a code defect; recorded here because it could otherwise look like one.

### Known Issues

- `/admissions` must not go to production with its bracketed placeholder text still visible — tracked in `docs/PROJECT_CONTEXT.md § 13` and this page's own README.

---

## [0.4.0] — 2026-07-17 — Phase 1C: About Experience

### Added

- `src/components/website/pages/About/` — the first real public content page, composed entirely from the Marketing Section Library with zero new components: `page.tsx` (composition), `content.ts` (framework-free copy), `sections.ts` (maps copy into library component props), `metadata.ts` (SEO `Metadata` + JSON-LD), `README.md`, `index.ts`
- `src/app/(public)/about/page.tsx` — one-line re-export wiring the page composite into the App Router
- Decision D-016 recorded: the `components/website/pages/<Page>/` composite pattern + thin route re-export, establishing the convention for every future content page

### Changed

- `docs/ARCHITECTURE.md` — folder tree and Component Hierarchy section document the new `pages/` pattern
- `docs/COMPONENT_INVENTORY.md` — new "Website Pages" section
- `docs/ROUTES.md` — `/about` marked Built

### Content Decisions

- Eight of the fifteen Marketing Section Library components were used (`PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `FeatureGrid`, `Timeline`, `QuoteBlock`, `CTASection`); `ImageText` was deliberately not used for "School Story" since no real campus photography exists yet and a placeholder photo would misrepresent the school.
- Per `CONTENT_GUIDELINES.md § 12`, four fields hold explicit bracketed placeholders instead of fabricated facts: the founding-story paragraph, the Principal's message and name, all three journey-timeline dates/milestones, and one "achievement" claim. Mission, Vision, and Core Values are genuine production copy (values statements, not verifiable facts).
- No Open Graph image is set — no real photo exists; referencing a fake one would break social previews.

### Fixed

- **Duplicate React key in the Journey Timeline.** Two placeholder milestone items shared an identical `date`/`title` (`"[Year]"`/`"[Milestone]"`), producing a `Timeline`-internal duplicate-key console warning (`key={`${item.date}-${item.title}`}`). Found via real-browser verification (headless Chrome + DevTools Protocol), not caught by build/lint/typecheck. Fixed by differentiating the two placeholder titles (`[Milestone 1]`/`[Milestone 2]`).

### Known Issues

- `/about` must not go to production with its bracketed placeholder text still visible — tracked in `docs/PROJECT_CONTEXT.md § 13` and this page's own README.

---

## [0.3.0] — 2026-07-17 — Phase 1B: Marketing Section Library, Phase 1B.1: Architecture Review

### Added

- `src/components/website/sections/` — a new reusable Marketing Section Library, 15 components, each in its own folder (`Component.tsx`, `.types.ts`, optionally `.constants.ts`, `README.md`, `index.ts`): `ContentContainer`, `AnimatedSection`, `SectionHeader`, `SectionDivider`, `PageHero`, `ImageText`, `FeatureGrid`, `StatisticsGrid`, `Timeline`, `QuoteBlock`, `CTASection`, `FAQAccordion`, `BadgeGroup`, `Callout`, `ResponsiveImage`
- `src/components/website/sections/shared/` — cross-cutting `SectionCta`/`SectionAlignment`/`ContainerWidth` types and container-width constants, reused across multiple sections to avoid duplicated shape definitions
- `src/components/website/sections/index.ts` — barrel export for the whole library
- Decision D-012 recorded: mandatory architecture review of `src/components/website/` completed — kept in place (not migrated to a `src/features/` tree), with the new library organized as `components/website/sections/<Name>/`
- **(Phase 1B.1)** `src/app/dev/playground/` — a permanent, development-only route rendering every Marketing Section Library component with sample data; 404s in production (verified via a clean production build + start), replacing the build-and-delete temporary preview page pattern from Phase 1B. See D-015.
- **(Phase 1B.1)** Decisions D-013 (independent re-review of `components/` vs. `src/features/`, reaffirmed, added a feature-subgrouping threshold rule for future role folders), D-014 (SectionDivider YAGNI simplification), D-015 (permanent dev playground route) recorded.

### Changed

- `docs/ARCHITECTURE.md` — folder tree updated with `components/website/sections/` and `app/dev/playground/`; Component Hierarchy section documents the per-component-folder convention, a README-proportionality standard, and the feature-subgrouping threshold rule
- `docs/COMPONENT_INVENTORY.md` — new "Marketing Section Library" category, all 15 components registered
- **(Phase 1B.1)** `SectionDivider` simplified from 4 variants (`light`/`dark`/`minimal`/`decorative`) to 2 (`light`/`dark`) — the removed variants were invented without a spec or consumer and rendered identically to `light`, differing only in DOM shape. See D-014.
- **(Phase 1B.1)** `docs/ROUTES.md` — new "Development-Only Routes" section documenting `/dev/playground`

### Fixed

- **`PageHero`'s `image` variant text was unreadable in dark mode.** Used `text-primary-foreground` (a theme token that is _dark_ in dark mode, since it's designed as text-on-a-light-primary-button) for text over a hardcoded dark photo overlay — in dark mode this rendered near-black text on a near-black background. The overlay is a fixed `bg-black/50` scrim independent of site theme, so its paired text must be too; replaced every `primary-foreground` reference in the `image` variant (title, subtitle, breadcrumbs, secondary CTA) with literal `text-white` at various opacities. Found via real-browser screenshot verification (dark mode, headless Chrome + DevTools Protocol), invisible to build/lint/typecheck.

### Known Issues

- None of the 15 components are composed into any real page yet — that's explicitly out of scope for this phase (library only, per task instructions). `About`, `Academics`, `Admissions`, `Gallery`, `Contact` pages remain unbuilt, pending real content from School Admin.
- `StatisticsGrid` ships with zero consumers and no real data — flagged in the Phase 1B.1 review as the library's weakest present-day YAGNI justification; kept because it was explicitly speced and is already complete/tested, not because it's currently needed.

---

## [0.2.0] — 2026-07-17 — Phase 1A: Public Website Foundation

**Status:** Manually reviewed and approved.

### Added

- `docs/CONTENT_GUIDELINES.md` — voice, tone, CTA/headline/error/success copy rules, future AI writing rules
- Semantic design tokens: `surface`, `surface-muted`, `success`, `warning`, `info` (+ foregrounds), `duration-fast/base/slow`, `shadow-soft/elevated`
- Placeholder indigo-blue accent color for `primary`/`ring` — explicitly swappable, see [DECISIONS.md § D-010](./DECISIONS.md#d-010--placeholder-accent-color-for-phase-1a)
- Inter as the primary typeface (replacing the unwired Geist Sans default)
- Typography primitives: `Display`, `Heading`, `Text`, `Caption`, `Code` (`src/components/ui/typography.tsx`)
- Theme system: `ThemeProvider`, `useTheme` hook, `ThemeToggle` — real light/dark switching with `localStorage` persistence and a no-FOUC inline script, no new dependency
- Shared motion constants (`src/lib/motion.ts`) — durations, easing, `fadeInUp`/`staggerContainer` variants, `prefers-reduced-motion`-aware
- `src/components/website/` (new folder, see [DECISIONS.md § D-011](./DECISIONS.md#d-011--componentswebsite-folder)): `SiteHeader` (responsive, sticky, transparent-over-hero → solid-on-scroll), `MobileNav` (accessible slide-in panel), `LanguageSwitch` (honest single-locale UI, no fake i18n), `SiteFooter`, `Hero`, `AnimatedBackground`, `StatStrip`, `nav-links.ts`
- `src/app/(public)/layout.tsx` and `src/app/(public)/page.tsx` — public route chrome and Hero-only homepage
- Decisions D-010 (placeholder accent color) and D-011 (`components/website/` folder) recorded

### Changed

- `src/app/layout.tsx` — Inter + Geist Mono font variable classes moved from `<body>` to `<html>` (see Fixed), `ThemeProvider` and no-FOUC script wired in
- `src/app/globals.css` — `--font-sans` now correctly resolves to Inter instead of a circular no-op self-reference
- Homepage moved from `src/app/page.tsx` (root) to `src/app/(public)/page.tsx`, matching `ARCHITECTURE.md`'s documented route-group structure; old placeholder removed
- `docs/ARCHITECTURE.md`, `docs/COMPONENT_INVENTORY.md`, `docs/ROUTES.md` updated to reflect the new folder and built components

### Fixed

- **Font not rendering as Inter.** The original `--font-sans: var(--font-inter)` was declared on `:root`/`<html>` while next/font's `--font-inter` custom property was only defined via a class on `<body>` — a descendant. CSS custom properties only cascade from ancestor to descendant, so `html` couldn't see `body`'s variable, and `font-family` silently fell back to the browser default (Times). Found via real-browser verification (computed-style inspection showed `font-family: Times`), fixed by moving the font variable classes to `<html>`.

### Known Issues

- About, Academics, Facilities, Admissions, Gallery, Notices, Documents, and Contact pages are not yet built — most header/footer nav links currently 404, which is expected at this phase
- Exact brand accent color remains a placeholder pending real school input (D-010)
- Statistics strip uses qualitative highlights, not numeric claims, since no verified school statistics exist yet (see [CONTENT_GUIDELINES.md § 12](./CONTENT_GUIDELINES.md#12-what-this-platform-never-says))

---

## [0.1.0] — 2026-07-17 — Phase 0B.1: Project Scaffolding

### Added

- Next.js 15.5.20 project (App Router, TypeScript strict, `src/` layout, import alias `@/*`)
- Tailwind CSS v4 + shadcn/ui initialized (`base-nova` style, neutral base color — no brand palette decided)
- ESLint (flat config, `next/core-web-vitals` + `next/typescript` + `prettier`) and Prettier (with `prettier-plugin-tailwindcss`)
- Husky pre-commit hook running `lint-staged` (ESLint --fix + Prettier --write on staged files)
- Full `ARCHITECTURE.md` folder structure created under `src/` as empty directories (route groups, component categories, lib, hooks, types) — no pages, components, or logic populated
- `prisma/schema.prisma` initialized with PostgreSQL datasource + generator only — zero models
- Runtime dependencies installed: `framer-motion`, `lucide-react`, `react-hook-form`, `zod`, `clsx`, `tailwind-merge`, `next-auth@5` (Auth.js), `@prisma/client`, `pg`, `next-intl`
- Dev dependencies installed: `prisma`, `@types/pg`, `dotenv`, `next-pwa`, `husky`, `lint-staged`, `prettier`, `eslint-config-prettier`, `prettier-plugin-tailwindcss`
- `.env.example`, `.gitignore` (Node/Next.js/env/OS/logs/build artifacts/generated Prisma client/PWA artifacts), `.editorconfig`, `.vscode/settings.json`, `.vscode/extensions.json`
- Git repository initialized (`main` branch)
- `.nvmrc` (`22`) and `package.json engines` (`node: >=22 <23`, `pnpm: >=10`) — pins the project runtime formally
- `pnpm-workspace.yaml` with `allowBuilds: { prisma: true }` — explicit opt-in for Prisma's postinstall script under pnpm 10's default script-blocking behavior
- Decisions D-007 (`src/` directory layout), D-008 (Phase 0B.1 tooling additions), and D-009 (finalization: dependency cleanup and runtime pinning) recorded

### Changed

- `docs/ARCHITECTURE.md` folder structure updated to reflect the `src/` layout
- `docs/PROJECT_CONTEXT.md` updated to Phase 0B.1 — folder structure, tech stack table, decisions, and risks reflect the scaffolded and finalized state
- Root `src/app/layout.tsx` metadata changed from the Next.js default to project-neutral values
- Root `src/app/page.tsx` replaced with a minimal infra-verification placeholder (no homepage design)
- `pnpm` upgraded globally from 9.15.9 to 10.34.5 to satisfy the pinned `engines.pnpm` constraint

### Removed

- `@base-ui/react` and `class-variance-authority` — orphaned dependencies left over after the earlier removal of the `shadcn init`-generated `Button` component (D-009)
- `shadcn` reclassified from `dependencies` to `devDependencies` (build-time CLI, never imported at runtime)

### Known Issues

- `next-intl` and `next-pwa` are installed but not wired into routing/build config — see D-008
- `src/lib/auth.ts` and `src/lib/db.ts` are not yet created — deferred to Phase 0B/2 pending schema and auth-provider decisions
- A contributor running the machine's default Node (if not 22.x) gets a non-fatal `pnpm install` warning; a genuinely fresh install of the `prisma` package specifically requires Node 22 in `PATH` (Prisma's own preinstall script hard-checks Node version at install time only) — see D-009

---

## [0.0.2] — 2026-07-17 — Phase 0A.1: AI Development Operating System

### Added

- `docs/PROJECT_GUARDRAILS.md` — vision-protection rules and module approval process
- `docs/DEVELOPMENT_CONVENTIONS.md` — naming, formatting, import order, error handling, logging conventions
- `docs/COMPONENT_INVENTORY.md` — component registry to prevent duplicate components
- `docs/ROUTES.md` — complete routing map (public, admin, teacher, guards, breadcrumbs, navigation)
- `docs/FEATURE_STATUS.md` — per-feature status dashboard
- `docs/DEFINITION_OF_DONE.md` — full completion checklist (12 categories)
- `docs/MASTER_PROMPT.md` — universal implementation prompt for future task-specific prompts to extend
- `docs/IMPLEMENTATION_LOG.md` — engineering diary for decisions, rejected ideas, and lessons learned
- Decision D-006 recording the documentation consolidation itself

### Changed

- `docs/PROJECT_CONTEXT.md` restructured into the single source of truth for the project, with a full reference-links map to every other document
- `docs/AI_RULES.md` expanded with concrete engineering-discipline rules: minimal diffs, logically separated commits, no placeholder code, no `TODO`s in production, no `console.log`, mandatory manual verification steps
- `docs/DECISIONS.md` reformatted to a richer template (Decision ID, Title, Description, Reason, Alternatives Considered, Approved By, Date, Status, Affected Documents, Future Review Required); all five prior decisions (D-001–D-005) migrated to the new format
- `README.md` expanded with a documentation map and development workflow section
- `docs/TASKS.md` updated to point to `FEATURE_STATUS.md` for feature-level status, keeping itself scoped to sprint-level tasks

### Removed

- Duplicated tech stack, folder structure, and design-principle content that previously appeared near-identically across `PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, and `README.md` — consolidated to a single canonical location per fact, with the others cross-linking instead of restating

### Known Issues

- None — no application code exists yet, so no defects are possible at this stage

---

## [0.0.1] — 2026-07-17 — Phase 0A: Project Foundation

### Added

- `docs/PROJECT_CONTEXT.md` — initial permanent project memory document
- `docs/PRODUCT_REQUIREMENTS.md` — full PRD covering vision, scope, exclusions, user journeys, and acceptance criteria
- `docs/ARCHITECTURE.md` — high-level architecture, folder structure, routing, rendering strategy, state management, security and performance principles
- `docs/UI_DESIGN_SYSTEM.md` — design bible covering color, typography, spacing, components, motion, accessibility, and dark mode strategy
- `docs/AI_RULES.md` — initial behavioral rules for AI assistants working on this codebase
- `docs/DECISIONS.md` — initial decision log (D-001 through D-005)
- `docs/ROADMAP.md` — phased delivery plan, Phase 0A through Phase 5
- `docs/TASKS.md` — live sprint task board
- `README.md` — initial project overview and setup instructions

### Known Issues

- None — no application code exists yet, so no defects are possible at this stage

---

## How to Use This File

- Add a new `[Unreleased]` entry as work happens; convert it to a versioned, dated entry when a phase or milestone completes — never edit a past versioned entry.
- Use only the sections that apply: `Added`, `Changed`, `Fixed`, `Removed`, `Known Issues`.
- Every versioned entry must have at least one bullet under at least one section — an empty changelog entry is not valid.
