# Architecture

**Status:** Documents the architecture as built through Sprint B1 (Authentication Foundation) — infrastructure, design system, Marketing Section Library, page-composite pattern, configuration layer, the full data foundation (Migrations 000-006), and Auth.js Credentials authentication are in place; Admin/Teacher dashboards themselves remain unbuilt (see [docs/product/EPIC_ROADMAP.md](./product/EPIC_ROADMAP.md) for what's next). This document is the canonical reference for what exists **today** — [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) holds only a condensed summary and links here. For how this architecture is meant to evolve toward a reusable platform, see [PRODUCT_ARCHITECTURE.md](./PRODUCT_ARCHITECTURE.md) — that document does not change anything below; it explains direction, not current state. For naming/formatting conventions that implement this architecture, see [DEVELOPMENT_CONVENTIONS.md](./DEVELOPMENT_CONVENTIONS.md).

---

## 1. High-Level Architecture

A single Next.js 15 application (App Router) serves three distinct experiences from one codebase:

```
┌─────────────────────────────────────────────────────┐
│                  Next.js 15 App                       │
│                                                        │
│  ┌───────────┐   ┌───────────┐   ┌─────────────────┐ │
│  │  Public    │   │   Admin    │   │    Teacher       │ │
│  │  Website   │   │  Console   │   │   Dashboard      │ │
│  │ (Guest)    │   │            │   │                  │ │
│  └───────────┘   └───────────┘   └─────────────────┘ │
│         │               │                  │           │
│         └───────────────┴──────────────────┘           │
│                          │                              │
│                 Route Handlers (API)                    │
│                          │                              │
│                    Prisma ORM                           │
└──────────────────────────┼──────────────────────────────┘
                           │
                  ┌────────┴─────────┐
                  │   PostgreSQL      │
                  └───────────────────┘

              External: Auth.js (sessions) · Cloudinary (media)
```

There is no separate backend service. Business logic lives in Route Handlers and Server Actions within the Next.js app. This keeps the system deployable as a single Vercel project with no infrastructure to manage.

---

## 2. Folder Structure

Application code is nested under `src/`; `prisma/`, `public/`, `docs/`, and root config files stay at the repository root — see [DECISIONS.md § D-007](./DECISIONS.md#d-007--src-directory-layout). The internal composition below (route groups, component categories, lib organization) is unchanged from the original design.

```
/
├── src/
│   ├── middleware.ts                # Edge-runtime route protection pre-check (getToken() signature check
│   │                                   # only, no database) — Built, Sprint B1, D-035; also sets an x-pathname
│   │                                   # request header (Sprint B3, D-039) so Server Component layouts can read
│   │                                   # the current path without a client-only hook — still no database read
│   ├── app/
│   │   ├── dev/
│   │   │   └── playground/          # Dev-only component showcase — 404s in production, see DECISIONS.md § D-015
│   │   ├── (public)/              # Guest-facing marketing site — no auth
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── admissions/
│   │   │   ├── notices/
│   │   │   ├── gallery/
│   │   │   ├── contact/
│   │   │   └── layout.tsx
│   │   ├── (auth)/                 # Sign-in flow — shared by Admin & Teacher
│   │   │   └── login/                # page.tsx — Auth.js Credentials form — Built, Sprint B1, D-035
│   │   ├── unauthorized/           # Interim "wrong role" landing page — Built, Sprint B1 (not a route group —
│   │   │                             # a real top-level page, no auth required to view it)
│   │   ├── admin/                  # Real path segment, not a route group — renamed from (admin)/ this sprint
│   │   │   │                         # specifically so /admin/* is a genuine URL prefix, matching ROUTES.md — see D-035
│   │   │   ├── layout.tsx            # Auth guard (accessLevel === "ADMIN") + mustChangePassword redirect
│   │   │   │                           # (Sprint B1/B2) + setup-required redirect (Sprint B3, D-039)
│   │   │   ├── page.tsx              # Admin Home — System Ready/Framework Version/Current School/Current
│   │   │   │                           # Academic Year/Current User + Quick Actions — Built, Sprint B3 (was a
│   │   │   │                           # bare link-list stub through Sprint B2)
│   │   │   ├── setup/                 # Built, Sprint B3, D-039 — First-Time Setup Wizard (System Verification,
│   │   │   │   │                        # School Verification, Bootstrap Verification, Finalize Setup); remains
│   │   │   │   │                        # reachable after completion, not gated once setup is done
│   │   │   │   ├── page.tsx
│   │   │   │   └── actions.ts
│   │   │   ├── system/                # Built, Sprint B3, extended B4/C1 — Developer Information: live
│   │   │   │   └── page.tsx             # checkSystemReadiness() + FrameworkConfig snapshot + Audit Log count
│   │   │   │                             # + Configuration Completion/Placeholder Count/Content Readiness
│   │   │   ├── audit/                 # Built, Sprint B4, D-040 — Audit Log Viewer, Admin-only, GET-based filters
│   │   │   │   ├── page.tsx             # List — Date/Action/Entity Type/Actor/Search, pagination
│   │   │   │   └── [id]/page.tsx        # Detail — Before/After Value, redacted by an exact-match denylist
│   │   │   ├── configuration/         # Built, Sprint C1, D-041 — Client Configuration Module, Admin-only;
│   │   │   │   │                        # School Identity + Academic fields editable (School/AcademicYear,
│   │   │   │   │                        # Migration 009); Theme/Website/Social shown read-only
│   │   │   │   ├── page.tsx
│   │   │   │   └── actions.ts
│   │   │   ├── users/                 # Built, Sprint B2, D-036 — User Management (Admin/Teacher accounts only;
│   │   │   │   │                        # Student/Guardian management explicitly out of scope)
│   │   │   │   ├── page.tsx             # List — search/filter/pagination
│   │   │   │   ├── new/page.tsx         # Create (Administrator or Teacher, branches on Role.accessLevel)
│   │   │   │   ├── actions.ts           # Server Actions — plain <form action={fn}>, no useActionState (see D-036)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx           # Details — shows flashed temp password once after create/reset
│   │   │   │       ├── edit/page.tsx      # Edit name/role (never own role)
│   │   │   │       └── reset-password/page.tsx
│   │   │   ├── students/
│   │   │   ├── teachers/
│   │   │   ├── attendance/
│   │   │   ├── examinations/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── teacher/                # Real path segment, not a route group — renamed from (teacher)/ this sprint
│   │   │   ├── layout.tsx            # Auth guard (accessLevel === "TEACHER") + mustChangePassword redirect — Sprint B1/B2
│   │   │   ├── page.tsx              # Guard-verification stub only, not a dashboard — Built, Sprint B1
│   │   │   ├── dashboard/
│   │   │   ├── attendance/
│   │   │   ├── marks/
│   │   │   ├── students/
│   │   │   ├── profile/
│   │   │   └── leave/
│   │   ├── change-password/         # Built, Sprint B2, D-036 — top-level, any authenticated accessLevel;
│   │   │   │                          # the only path that clears mustChangePassword
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   └── api/                     # Route Handlers (REST-style endpoints)
│   │       ├── auth/                 # [...nextauth]/route.ts — Built, Sprint B1
│   │       ├── students/
│   │       ├── teachers/
│   │       ├── attendance/
│   │       └── examinations/
│   ├── components/
│   │   ├── ui/                      # Shadcn primitives — typography, button/input/label/card (Built, Sprint B1;
│   │   │                             # dialog, table, etc. still not yet added)
│   │   ├── shared/                  # Cross-role reusable composites (theme provider/toggle, empty state, page header)
│   │   ├── website/                 # Guest/public-site composites — see DECISIONS.md § D-011
│   │   │   ├── sections/              # Reusable marketing section library — see DECISIONS.md § D-012
│   │   │   │   └── <SectionName>/       # PageHero/, FeatureGrid/, etc. — Component.tsx, .types.ts, .constants.ts?, README.md, index.ts
│   │   │   └── pages/                 # Page composites (About/, etc.) — see DECISIONS.md § D-016
│   │   │       └── <PageName>/          # page.tsx, content.ts, sections.ts, metadata.ts, README.md, index.ts
│   │   ├── admin/                   # Admin-specific composites
│   │   └── teacher/                 # Teacher-specific composites
│   ├── lib/
│   │   ├── auth/                     # Auth.js configuration — Built, Sprint B1, D-035 (supersedes the
│   │   │   │                           # single-file auth.ts placeholder this tree previously showed)
│   │   │   ├── config.ts                # NextAuthConfig — Credentials provider, JWT session strategy,
│   │   │   │                              # PrismaAdapter (Account/Session/VerificationToken only — see
│   │   │   │                              # ENGINEERING_PRINCIPLES.md § 9), session callback
│   │   │   └── index.ts                 # export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
│   │   ├── security/                 # Built, Sprint B1/B2 — general security primitives, no Auth.js dependency
│   │   │   └── password.ts              # hashPassword()/verifyPassword() (Argon2id) + generateTemporaryPassword()
│   │   │                                  # (CSPRNG via node:crypto randomInt, ambiguous-character-free) — D-035/D-036
│   │   ├── authorization/            # Built, Sprint B2, D-036 — the one canonical place a permission question is answered
│   │   │   ├── permissions.ts           # canManageUsers()/canManageTeachers()/canResetPasswords()/
│   │   │   │                              # canDeactivateUsers()/canManageSystemSetup()/canViewAuditLog()/
│   │   │   │                              # canManageConfiguration()/canManageImports() (latter four,
│   │   │   │                              # D-039/D-040/D-041/D-043)
│   │   │   ├── guard.ts                 # requireSession()/requirePermission() — auth() + redirect(), called once per
│   │   │   │                              # Server Action; services trust the resulting actorUserId, never re-check
│   │   │   ├── redirect.ts              # resolvePostLoginRedirect(), CHANGE_PASSWORD_PATH/ADMIN_HOME_PATH/
│   │   │   │                              # TEACHER_HOME_PATH — see D-038
│   │   │   └── index.ts                 # barrel
│   │   ├── db.ts                    # Prisma client singleton — driver adapter (@prisma/adapter-pg), see D-027
│   │   ├── db-utils.ts               # checkDatabaseHealth(), writeAuditLog(), checkMigrationsApplied(),
│   │   │                               # getDatabaseVersion() (latter two, Sprint B3, D-039) — see D-027
│   │   ├── env.ts                   # Zod-validated environment variables — see DEVELOPMENT_CONVENTIONS.md § 10
│   │   ├── version.ts               # Built, Sprint B3 — getFrameworkVersion(), reads package.json's own version
│   │   ├── motion.ts                # Shared Framer Motion durations/easing/variants
│   │   ├── seo.ts                   # buildPageMetadata()/buildPageJsonLd() — imports config/seo.ts, see DECISIONS.md § D-018
│   │   ├── validations/              # THE canonical Zod-schema location, app-wide — see D-029
│   │   │   ├── identity.ts              # Role/User input schemas
│   │   │   ├── academic.ts              # SchoolClass/Section/Subject input schemas — see D-030
│   │   │   ├── student.ts               # Student/Guardian/Enrollment input schemas — see D-031
│   │   │   ├── teacher.ts               # Teacher/TeacherQualification/TeacherAssignment input schemas — see D-032
│   │   │   ├── attendance.ts           # AttendanceSession/AttendanceRecord input schemas — see D-033
│   │   │   ├── auth.ts                 # Login input schema — see D-035
│   │   │   ├── administration.ts       # createUserAccount/editUserAccount/deactivate/activate/resetPassword/
│   │   │   │                              # changeOwnPassword/searchUsers input schemas — see D-036
│   │   │   ├── setup.ts                # updateSchoolDetails input schema — see D-039
│   │   │   ├── audit.ts                # searchAuditEvents input schema — see D-040
│   │   │   ├── configuration.ts        # updateSchoolConfiguration input schema — see D-041
│   │   │   └── import.ts               # createImportBatch/ingestImportRows/searchImportBatches input
│   │   │                                  # schemas — see D-043
│   │   └── utils.ts                 # cn() and other shared helpers
│   ├── config/                      # Centralized site config — see DECISIONS.md § D-018
│   │   ├── school.ts                  # Canonical identity facts (name, location, contact, principal, etc.)
│   │   ├── branding.ts                # Logo/favicon placeholders, theme storage key — points at CSS tokens, doesn't duplicate them
│   │   ├── navigation.ts              # NAV_LINKS + footer/mobile aliases + empty teacher/admin placeholders
│   │   ├── contact.ts                 # Contact-page values, re-shapes school.ts
│   │   ├── social.ts                  # Social platform URL placeholders (not yet wired to SiteFooter)
│   │   └── seo.ts                     # SEO_DEFAULTS consumed by lib/seo.ts
│   ├── hooks/                       # Shared custom hooks
│   ├── types/                       # Shared TypeScript types
│   │   └── next-auth.d.ts             # Session.user module augmentation (schoolId/roleId/roleName/accessLevel) — D-035
│   ├── repositories/                # Data-access layer — see D-028/D-030/D-031/D-032 and
│   │   │                               # docs/engineering/ENGINEERING_PRINCIPLES.md. No direct Prisma usage outside this
│   │   │                               # folder; no repository imports another repository.
│   │   ├── user/                      # findUserById/ByEmail, listUsersBySchool, createUser, updateUser, deactivateUser,
│   │   │                                 # reactivateUser, updateUserPassword, searchUsers, findFirstActiveAdminUser,
│   │   │                                 # findUsersByIds — see D-036, D-039, D-040
│   │   ├── role/                      # findRoleById/ByName, listRoles, createRole
│   │   ├── school/                    # findSchoolById, upsertSchool, findFirstSchool, updateSchool (latter two, D-039)
│   │   ├── academicYear/              # findCurrentAcademicYear, findAcademicYearByLabel, upsertAcademicYear,
│   │   │                                 # updateAcademicYear (D-039)
│   │   ├── schoolClass/               # findSchoolClassById/ByName, listSchoolClassesBySchool, createSchoolClass
│   │   ├── section/                   # findSectionById, listSectionsByClassAndYear, createSection
│   │   ├── subject/                   # findSubjectById/ByName, listSubjectsBySchool, createSubject
│   │   ├── student/                   # findStudentById/ByAdmissionNumber, listActiveStudentsBySchool, createStudent,
│   │   │                                 # linkGuardianToStudent, listGuardiansForStudent (StudentGuardian has no own repo)
│   │   ├── guardian/                  # findGuardianById, findGuardiansByPhone, createGuardian, listStudentsForGuardian
│   │   ├── enrollment/                # findEnrollmentById/ByStudentAndYear, listEnrollmentsBySection, createEnrollment
│   │   ├── teacher/                   # findTeacherById/ByUserId, listActiveTeachersBySchool, createTeacher, updateTeacherStatus
│   │   ├── teacherQualification/      # findTeacherQualificationById, listQualificationsForTeacher, createTeacherQualification
│   │   ├── teacherAssignment/         # findTeacherAssignmentById, findClassTeacherForSection, findSubjectAssignment,
│   │   │                                 # listAssignmentsForTeacher/Section, createTeacherAssignment, deactivateTeacherAssignment
│   │   ├── attendanceSession/         # findAttendanceSessionById/BySectionAndDate, createAttendanceSession,
│   │   │                                 # updateAttendanceSessionEditMeta
│   │   ├── attendanceRecord/          # findAttendanceRecordById/BySessionAndEnrollment, listAttendanceRecordsForSession,
│   │   │                                 # upsertAttendanceRecord — see D-033
│   │   ├── frameworkConfig/           # Built, Sprint B3, D-039 — findFrameworkConfig(), createFrameworkConfig(),
│   │   │                                 # updateFrameworkConfig() — a singleton row, "first row" is always correct
│   │   ├── auditLog/                  # Built, Sprint B4, D-040 — createAuditLog() (the write, moved here from
│   │   │                                 # lib/db-utils.ts's writeAuditLog(), which now just delegates — closes a
│   │   │                                 # real, long-tolerated exception to "no direct Prisma outside
│   │   │                                 # repositories"), findAuditLogById(), searchAuditLogs(),
│   │   │                                 # listDistinctEntityTypes(), countAuditLogs()
│   │   ├── importBatch/               # Built, Sprint D1, D-043 — createImportBatch(), findImportBatchById(),
│   │   │                                 # updateImportBatch(), searchImportBatches(), findMostRecentBatchByFileHash(),
│   │   │                                 # findMostRecentBatchByType()
│   │   └── importRow/                 # Built, Sprint D1, D-043 — createImportRows() (bulk), findImportRowsByBatchId(),
│   │                                     # findNextChunkToCommit() (the resumability query), updateImportRow(),
│   │                                     # updateImportRowsStatus() (bulk), countImportRowsByStatus()
│   └── services/                    # Business-logic layer, composed from repositories — see D-028/D-030/D-031/D-032/D-033
│       ├── identity/                  # createIdentityUser() — validated create + role lookup + transactional AuditLog write
│       ├── academic/                  # createSchoolClassWithSections(), createAcademicSubject() — both gained
│       │                                 # an optional `tx?: Prisma.TransactionClient` parameter, Sprint D2,
│       │                                 # D-044 (transaction passthrough for the Import Engine's commit
│       │                                 # handler; omitted, behavior is unchanged)
│       ├── student/                   # registerStudent(), enrollStudent() — lifecycle-oriented, not CRUD; the first
│       │                                 # DTO layer (student.dto.ts, guardian.dto.ts, enrollment.dto.ts) — see D-031
│       ├── teacher/                   # registerTeacher(), assignTeacher(), updateTeacherAssignment(),
│       │                                 # deactivateTeacher() — dto/ subfolder (teacher.dto.ts,
│       │                                 # teacherQualification.dto.ts, teacherAssignment.dto.ts) — see D-032
│       ├── attendance/                # openAttendanceSession(), markAttendance(), submitAttendance(),
│       │                                 # reopenAttendance() — dto/ subfolder (attendanceSession.dto.ts,
│       │                                 # attendanceRecord.dto.ts) — see D-033
│       ├── auth/                      # authenticateUser(), resolveActiveSessionUser() — dto/ subfolder
│       │                                 # (authenticatedUser.dto.ts). No repository of its own — reuses
│       │                                 # src/repositories/user/ entirely — see D-035
│       ├── administration/            # Built, Sprint B2, D-036 — createUserAccount(), editUserAccount(),
│       │                                 # deactivateUserAccount(), activateUserAccount(), resetUserPassword(),
│       │                                 # changeOwnPassword(), searchUserAccounts(), getUserAccountDetails() —
│       │                                 # dto/ subfolder (userAccount.dto.ts). Orchestrates the unmodified
│       │                                 # identity/teacher services rather than extending either's signature —
│       │                                 # see D-036's "composition, not extension" reasoning.
│       └── system/                    # Built, Sprint B3, D-039 — checkSystemReadiness() (Database/Schema/
│                                         # Bootstrap/Roles/School/AcademicYear/Authentication/Version/Overall,
│                                         # reused by the Setup Wizard, Admin Home, and Developer Information),
│                                         # getSchoolDetails()/updateSchoolDetails(), getBootstrapAdminDetails()
│                                         # (reuses administration's own UserAccountDTO), getFrameworkConfig(),
│                                         # isSetupComplete(), completeSetup() — dto/ subfolder
│                                         # (systemReadiness.dto.ts, frameworkConfig.dto.ts, schoolDetails.dto.ts)
│       ├── audit/                     # Built, Sprint B4, D-040 — searchAuditEvents() (covers both "browse
│       │                                 # everything" and any filtered combination — no separate
│       │                                 # listAuditEvents()), getAuditEvent(), listEntityTypeOptions() — dto/
│       │                                 # subfolder (auditEvent.dto.ts, redacts by an exact-match denylist)
│       ├── configuration/             # Built, Sprint C1, D-041 (Epic C — separate from Epic B's system/,
│       │                                 # frozen; calls the same School/AcademicYear repositories directly)
│       │                                 # — getSchoolConfiguration(), updateSchoolConfiguration(),
│       │                                 # getConfigurationSummary() — dto/ subfolder (schoolConfiguration.dto.ts,
│       │                                 # configurationStatus.dto.ts — reuses the bracketed-placeholder
│       │                                 # convention and TEXT_REGISTRY.md's own P0/P1/P2 priorities)
│       └── import/                    # Built, Sprint D1, D-043 (Epic D) — entity-agnostic orchestration:
│                                         # createImportBatch(), ingestImportRows(), validateImportBatch(),
│                                         # previewImportBatch(), skipInvalidRows(), commitImportBatchChunk()
│                                         # (resumable, one transaction per row not per chunk —
│                                         # TRANSACTION_BOUNDARIES.md § 4's Rollover precedent),
│                                         # getImportReport(), listImportBatches(), getImportBatchDetail() —
│                                         # dto/ subfolder (importBatch.dto.ts, importRow.dto.ts,
│                                         # importReport.dto.ts), extension-points.ts (ImportRowValidator —
│                                         # async since D-044, ImportRowCommitHandler, suggestColumnMappings()),
│                                         # profiling.ts (buildDataProfile(), generic/pure/reusable, D-044).
│                                         # importers/academicStructure/ — Built, Sprint D2, D-044, the first
│                                         # real importer and the reference architecture: rows.ts
│                                         # (groupAcademicStructureRows() — one row per source line collapses
│                                         # into one row per unique class with its full section list, one per
│                                         # subject), aliases.ts (column alias dictionary +
│                                         # getAcademicStructureColumnMappingTemplate(), the first real caller
│                                         # of D1's findMostRecentBatchByType()), validator.ts
│                                         # (createAcademicStructureValidator() — Business + Database
│                                         # Validation), commitHandler.ts (reuses createSchoolClassWithSections()/
│                                         # createAcademicSubject() via their new tx passthrough), profile.ts,
│                                         # importer.ts (top-level orchestration: startAcademicStructureImport(),
│                                         # validateAcademicStructureImport(),
│                                         # commitAcademicStructureImportChunk())
├── prisma/
│   ├── schema.prisma                # AuditLog, School, AcademicYear, Role, User (+mustChangePassword, D-036),
│   │                                   # Account, Session, VerificationToken, SchoolClass, Section, Subject, Student,
│   │                                   # Guardian, StudentGuardian, Enrollment, Teacher, TeacherQualification,
│   │                                   # TeacherAssignment, AttendanceSession, AttendanceRecord, FrameworkConfig,
│   │                                   # School extended with tagline/medium/principalName/principalTitle/
│   │                                   # email/phone/address/schoolTimings/officeTimings/logoUrl/faviconUrl
│   │                                   # (Migration 009, D-041), ImportBatch, ImportRow (Migration 010, D-043,
│   │                                   # historical-fact category — no delete mechanism, per
│   │                                   # SOFT_DELETE_STRATEGY.md § 1); ImportEntityType's SCHOOL_CLASS/SECTION/
│   │                                   # SUBJECT replaced with one ACADEMIC_STRUCTURE value (Migration 011,
│   │                                   # D-044) (Migrations 000-011)
│   ├── seed.ts                       # Seeds School + AcademicYear + 3 Roles (always) + 1 Bootstrap Administrator
│   │                                   # (idempotent, DEFAULT_BOOTSTRAP_ADMIN_* constants, mustChangePassword: true,
│   │                                   # always) + 11 SchoolClasses (Nursery-8, sections A/B) + 10 generic Subjects +
│   │                                   # 3 Guardians + 5 Students, enrolled + 3 Teachers with qualifications/assignments
│   │                                   # + 1 AttendanceSession with 2 AttendanceRecords — this second group gated
│   │                                   # behind SEED_DEV_FIXTURES (defaults true; set false for a real client
│   │                                   # deployment, D-042) since it's this repository's own dev fixture data, not
│   │                                   # reference data — see D-031, D-032, D-033, D-035, D-036, D-042. Does not
│   │                                   # touch FrameworkConfig — that row is written only by completeSetup(),
│   │                                   # through the Setup Wizard, never by seeding — see D-039.
│   └── migrations/
│       ├── 20260718000000_audit_foundation/
│       ├── 20260718000100_school_foundation/
│       ├── 20260718000200_identity_foundation/
│       ├── 20260718000300_academic_foundation/
│       ├── 20260718184429_student_foundation/
│       ├── 20260718192844_teacher_foundation/
│       ├── 20260718201440_attendance_foundation/
│       ├── 20260719045852_administration_foundation/  # User.mustChangePassword — see D-036
│       ├── 20260719120000_framework_configuration/    # FrameworkConfig — see D-039
│       └── 20260720090000_client_configuration_foundation/  # School extended — see D-041
├── docs/                            # This documentation set (docs/engineering/ — cross-cutting engineering rules, see D-032)
└── public/                          # Static assets (favicon, static images)
```

**Principle:** `(public)` (a route group — no URL segment) and the real `admin/`/`teacher/` path segments (renamed from route groups this sprint, D-035, specifically so `/admin/*` and `/teacher/*` are genuine, non-colliding URLs) create hard visual and logical boundaries. A file inside `admin/` should never be reachable by a Teacher session, enforced at the layout level, not just by UI hiding.

**Configuration layer (`src/config/`):** School-identity, branding, navigation, contact, social, and SEO-default values are centralized here as plain, framework-free data — see [DECISIONS.md § D-018](./DECISIONS.md#d-018--centralized-configuration-layer-srcconfig). This is deliberately not `lib/` (which holds behavior/utilities) or a page's own `content.ts` (which holds page-specific copy) — it's the one place a fact that's true across the whole site (the school's name, for instance) is defined once.

---

## 3. Routing Strategy

- **App Router** exclusively — no Pages Router usage.
- Route groups segment by role where no URL prefix is wanted: `(public)`, `(auth)`. `admin/` and `teacher/` are real path segments, not route groups — see D-035 for why (a route group adds no URL segment, and two same-named route groups would otherwise collide on identical child paths).
- Each protected segment has a `layout.tsx` that verifies session + role server-side before rendering any child route — implemented as a two-tier split (Edge middleware pre-check, Node-runtime layout as the authoritative check), see `ROUTES.md § Route Guards` and D-035 for why. Unauthorized access redirects to `/login` (unauthenticated) or `/unauthorized` (wrong role), not a client-side error state.
- Dynamic segments (e.g., `students/[id]`) used for entity detail views.
- No route should perform role checks only on the client. Server-side enforcement is mandatory (see Security Principles).

---

## 4. Rendering Strategy — Server vs Client Components

**Default: Server Components.** A component is a Client Component only when it needs one of:

- Interactivity (`onClick`, `onChange`, form state)
- Browser-only APIs
- React hooks (`useState`, `useEffect`, etc.)
- Third-party libraries that require the client (e.g., some Framer Motion usage)

**Pattern:**

- Pages fetch data on the server (Server Components / Server Actions) and pass minimal, serializable props down.
- Interactive leaves (a form, a filter, a modal trigger) are isolated Client Components, kept as small as possible.
- Avoid marking entire pages `"use client"` — push the boundary down to the smallest necessary component.

**Data mutations** use Server Actions where practical (forms, simple mutations); Route Handlers are used for endpoints consumed by client-side fetch/polling or external integrations.

---

## 5. State Management Strategy

This product intentionally avoids heavyweight global state libraries.

| Type of state                                    | Approach                                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Server data (students, attendance, etc.)         | Fetched in Server Components; re-fetched via Server Actions/router refresh after mutation |
| Form state                                       | Local component state, or `react-hook-form` where forms are non-trivial                   |
| Auth/session state                               | Auth.js session, accessed server-side via `auth()` helper                                 |
| Transient UI state (modals, tabs, toasts)        | Local `useState`, lifted only as far as necessary                                         |
| Cross-cutting UI state (theme, sidebar collapse) | React Context, minimal and scoped                                                         |

No Redux, Zustand, Jotai, or similar libraries in Version 1 unless a specific, documented need arises (see [AI_RULES.md](./AI_RULES.md) on introducing dependencies).

---

## 6. Component Hierarchy

```
Layout (role shell: sidebar/topbar)
 └─ Page (Server Component — fetches data)
     └─ Section (Server Component — composes UI)
         └─ Feature Composite (e.g., AttendanceTable)
             └─ Shadcn Primitives (Table, Badge, Button)
             └─ Client Islands (e.g., AttendanceRowToggle — "use client")
```

- **Primitives** (`components/ui`): unmodified or lightly themed Shadcn components, plus cross-cutting presentational primitives like typography. Never role-specific.
- **Shared composites** (`components/shared`): reusable across roles — page headers, empty states, confirmation dialogs, theme provider/toggle.
- **Role composites** (`components/website`, `components/admin`, `components/teacher`): feature-specific, built from primitives + shared composites. `website/` serves the Guest role (see [DECISIONS.md § D-011](./DECISIONS.md#d-011--componentswebsite-folder)).
- **Reusable section libraries** (`components/website/sections`): a large, general-purpose set of composites within a role (the Marketing Section Library — `PageHero`, `FeatureGrid`, etc., see [DECISIONS.md § D-012](./DECISIONS.md#d-012--marketing-section-library-location-componentswebsitesections-not-srcfeatures)) gets its own subfolder, one folder per component: `ComponentName/ComponentName.tsx`, `.types.ts`, optionally `.constants.ts` (only when there's a real variant-to-className map worth extracting), `README.md`, and `index.ts` re-exporting the component and its types. Apply this pattern to any future role's composite library that grows past a handful of flat files — not retroactively to existing single-file composites that don't need it.
- **Page composites** (`components/website/pages`): a full page assembled from the section library (About, Admissions, and future pages) gets its own folder, `PageName/`: `page.tsx` (composition only), `content.ts` (framework-free copy), `sections.ts` (shapes `content.ts` into library component props), `metadata.ts` (page-specific title/description passed to `lib/seo.ts`'s shared `buildPageMetadata()`/`buildPageJsonLd()`), `README.md`, `index.ts`. The actual `app/(public)/<page>/page.tsx` route file is a one-line re-export — see [DECISIONS.md § D-016](./DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export).
- **`README.md` proportionality:** the six-section template (Purpose/Props/Variants/Accessibility Notes/Usage Example/Future Enhancements) is the default, but sections that don't apply to a trivial component (e.g., no `Variants` section for a component with no variant prop) should be omitted rather than filled with boilerplate like "None anticipated" — the README should be as long as the component actually warrants, not a fixed-length form.
- **Feature-subgrouping threshold:** a role folder (`components/admin/`, `components/teacher/`, or `components/website/` outside `sections/`) should adopt the same per-component-folder subgrouping once it exceeds roughly 8 components spanning more than 2 distinct domains (e.g., `components/admin/attendance/`, `components/admin/marks/`). Below that threshold, flat files in the role folder are simpler and should not be preemptively subdivided. See [DECISIONS.md § D-013](./DECISIONS.md#d-013--phase-1b1-architecture-review-reaffirmed-role-segmented-components-added-a-feature-subgrouping-threshold-rule).

---

## 7. Security Principles

1. **Server-enforced authorization.** Every protected route and every Route Handler independently verifies the session and role — the UI never being the only gate.
2. **Least privilege by role.** Teachers can only query/mutate data scoped to their own assigned classes; this is enforced in the data layer (query filters), not just the UI.
3. **Input validation everywhere data enters the system.** All form and API inputs validated with Zod schemas before touching the database.
4. **No secrets in client code.** Environment variables containing secrets are server-only (no `NEXT_PUBLIC_` prefix unless genuinely public).
5. **Session security.** Auth.js sessions use secure, httpOnly cookies; no tokens stored in `localStorage`.
6. **Auditability.** Sensitive mutations (student records, marks, attendance) should be attributable to the acting user for future audit-log support.

---

## 8. Performance Principles

1. **Server Components first** — reduces client JS shipped for content-heavy pages (public site, tables).
2. **Streaming & Suspense** for slower data fetches (e.g., report generation) so the shell renders immediately.
3. **Image optimization** via `next/image` and Cloudinary transformations — never unoptimized `<img>` for content images.
4. **Minimal client bundle** — Framer Motion and other client-heavy libraries loaded only where used, not globally.
5. **Database access patterns** — Prisma queries scoped and indexed appropriately; avoid N+1 patterns in list views (attendance, student lists).
6. **Caching** — static/public content (marketing pages, notices) leverages Next.js caching/ISR where appropriate; authenticated dashboards remain dynamic.

---

## 9. Open Architectural Questions

- ~~Exact Auth.js provider strategy (credentials-based vs. email magic link) for Admin/Teacher accounts~~ — **Resolved (Sprint B1):** Credentials provider, JWT session strategy (not database sessions — `@auth/core` hard-rejects database sessions with Credentials as the only provider; see [DECISIONS.md § D-035](./DECISIONS.md#d-035--sprint-b1-authentication-foundation-jwt-session-strategy-corrects-d-030-empirically-confirmed-incompatible-with-credentials-only-argon2id-in-libsecurity-auth-as-its-own-service-adminteacher-route-groups-renamed-to-real-path-segments)), Argon2id hashing, no self-registration.
- Multi-tenancy: this is single-school in v1 — confirm no multi-school abstraction is needed prematurely
- File/document storage conventions in Cloudinary (folder/naming strategy)

Tracked alongside product-level open questions in [PROJECT_CONTEXT.md § Open Questions](./PROJECT_CONTEXT.md#12-open-questions) and [FEATURE_STATUS.md](./FEATURE_STATUS.md).
