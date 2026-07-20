# Epic Roadmap — Delivery Phase

**Purpose:** The forward plan for everything after the Foundation Phase (Sprints 0–5: Website Engine, Identity, Academic, Student, Teacher, and Attendance foundations — all complete and applied to a live database). Where [ROADMAP_V2.md](../ROADMAP_V2.md) organized _all_ work (past and future) into Epics A–H under a framing that still named an eventual multi-tenant SaaS as the long-run direction, this document supersedes that framing for everything from here forward — see [DECISIONS.md § D-034](../DECISIONS.md#d-034--delivery-phase-roadmap-clone-per-client-model-supersedes-eventual-saas-framing-epic-reordering) for the recorded reason. `ROADMAP_V2.md` and [PRODUCT_ARCHITECTURE.md](../PRODUCT_ARCHITECTURE.md) are not deleted or rewritten — each carries a short pointer to this document at the specific section its "eventual SaaS" framing appears, per this project's own established precedent for superseding a framing document without silently leaving it stale ([D-019](../DECISIONS.md#d-019--product-pivot-school-operating-system-sos-pant-public-school-as-first-implementation)'s "surgical cross-link, not a rewrite" pattern).

This is a **planning document, not an implementation**. Nothing here is built by writing it down — each Epic still needs its own scoped implementation task, following [MASTER_PROMPT.md](../MASTER_PROMPT.md), before any code exists.

---

## 1. The Foundation Phase Is Complete

Six modules, five sprints, all applied to a live Neon PostgreSQL database:

| Module              | What exists                                                                      | Sprint              |
| ------------------- | -------------------------------------------------------------------------------- | ------------------- |
| Website Engine      | Public marketing site, 17-component section library, 7 content pages             | Epic A (pre-Epic B) |
| Identity Foundation | `Role`, `User`, Auth.js adapter tables (`Account`/`Session`/`VerificationToken`) | Sprint 1            |
| Academic Foundation | `SchoolClass`, `Section`, `Subject`                                              | Sprint 2            |
| Student Foundation  | `Student`, `Guardian`, `StudentGuardian`, `Enrollment`                           | Sprint 3            |
| Teacher Foundation  | `Teacher`, `TeacherQualification`, `TeacherAssignment`                           | Sprint 4            |
| Attendance Engine   | `AttendanceSession`, `AttendanceRecord`                                          | Sprint 5            |

What does **not** yet exist, anywhere: any Admin or Teacher-facing UI, any API route, Auth.js's actual provider wiring (`src/lib/auth.ts`), the Examination schema, the Admission schema, or any notion of "more than one client repository." Every repository/service/DTO layer built so far is real, tested against a live database, and directly reusable by the epics below — this is not a rewrite, it's the first time that layer gets a UI and a second consumer (an Import Engine) put in front of it.

## 2. The Governing Constraint: One Repository, One School, No Tenant Isolation

Restated because it changes what "epic" means relative to `ROADMAP_V2.md`'s original framing:

```
Master Repository (this repo, generic)
        │  git clone
        ▼
Client Repository (one per school)
        │  configure branding/config/content
        ▼
Client's own database (one school, one schema, no schoolId-based tenant filtering needed for correctness — schoolId columns already exist per DATABASE_REVIEW.md, but they scope nothing across tenants because there is only ever one)
        │  deploy
        ▼
Live for that one school
```

No tenant-resolution middleware, no cross-client database, no central control plane that pushes updates to every client at once. Every Epic below is scoped to make **one repository serve one school extremely well**, and to make **cloning that repository for the next school cheap and low-risk** — not to make one deployment serve many schools at once. See [FRAMEWORK_STRATEGY.md](./FRAMEWORK_STRATEGY.md) for the full implication of this on how the codebase evolves.

## 3. Recommended Epic Sequence — Challenged and Reordered

The initially proposed sequence (Administration → Data Migration → Academic Operations → Admission Management → Reporting & Analytics → Client Customization Framework → Deployment & Go-Live) gets the anchors right — Administration first, Deployment last are both correct and not contested below — but **the middle ordering has a real dependency problem worth challenging**, not just accepting because it was proposed first.

### 3.1 What's wrong with placing Client Customization Framework second-to-last

Client Customization Framework is mostly **documentation and light config-isolation work** — formalizing what [CONFIGURATION_GUIDE.md](../CONFIGURATION_GUIDE.md) and [PRODUCT_ARCHITECTURE.md § 15](../PRODUCT_ARCHITECTURE.md#15-architecture-review--does-pant-public-school-still-appear-inside-the-architecture)'s own audit already found: the codebase is already close to clone-ready, with a short, known list of remaining Pant-Public-School-specific literals. It is **cheap relative to every other epic** and it is a **hard blocker for the entire clone-per-client delivery model** this whole planning task is oriented around. Building Reporting & Analytics for the one client that exists today, before confirming the second client can even be onboarded cleanly, inverts the actual priority a delivery-focused roadmap should have. **Moved earlier.**

### 3.2 What's right about Data Migration Engine coming early, with a nuance

Data Migration Engine is correctly early — no second client will accept re-typing an existing student roster by hand through an Admin form, and the Import Engine can be built entirely against the repository/service layer that already exists (Sprints 3–5), without needing a polished Admin UI first. The nuance: it does **not** need the _full_ Administration epic done first — only the minimal slice (Auth.js resolved, a bootstrap admin can log in, `actorUserId` is attributable). **Kept early, explicitly parallelizable with Client Customization Framework — neither blocks the other.**

### 3.3 What's right about Academic Operations following, with a sequencing insight worth naming

Academic Operations (Attendance UI + Examination/Marks UI) is correctly positioned after the two delivery-blockers, but it is **not one uniform unit of work**: the Attendance half has a fully-built backend sitting unused since Sprint 5 (zero new schema needed), while the Examination half needs an entirely new Migration 007/008 backend before any UI can consume it. [PRODUCT_VISION.md § 10](../PRODUCT_VISION.md#10-success-metrics) names "teachers actually use attendance/marks entry in place of paper registers" as the **first** near-term success metric — the Attendance slice is the cheapest, highest-leverage thing this roadmap can ship, and could reasonably start **in parallel with** Administration's later milestones once Auth.js is resolved, rather than waiting for Client Customization Framework and Data Migration Engine to fully complete first. Flagged as a genuine strategic choice for the product owner, not silently decided here — see § 7.

### 3.4 Sequence table

| Order | Epic                                   | Why here, not elsewhere                                                                                                                                                        |
| ----- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | **B — Administration**                 | Every later epic needs an authenticated, attributable actor (`actorUserId` is already required by every existing service). Unambiguous first dependency.                       |
| 2a    | **C — Client Customization Framework** | Cheap, mostly documentation; hard blocker for cloning to client #2. Parallelizable with 2b.                                                                                    |
| 2b    | **D — Data Migration Engine**          | Reuses the existing repository/service layer directly; only needs Administration's minimal auth slice, not the full epic. Parallelizable with 2a.                              |
| 3     | **E — Academic Operations**            | Attendance slice ships first (backend exists, zero schema work, the #1 named success metric); Examination slice second (needs new Migration 007/008 backend).                  |
| 4     | **F — Admission Management**           | Needs its own new Migration 009 backend; also depends on Epic A's still-unbuilt public `/admissions/enquiry` form — the one epic here with a cross-cutting Website Engine tie. |
| 5     | **G — Reporting & Analytics**          | Structurally depends on real data flowing through E and F first — reporting on data that doesn't exist yet is not a real epic.                                                 |
| 6     | **H — Deployment & Go-Live**           | Needs B, C, D, and enough of E to be a viable first go-live. F/G can trail client #1's go-live, but should exist before pitching client #2 on the full product.                |

This keeps the user-recognizable epic names from the original proposal — nothing is renamed — only the sequence position of Client Customization Framework moved (last → parallel-with-Data-Migration, early), and Academic Operations' internal two-speed structure is named explicitly rather than left implicit.

---

## 4. Epic Breakdown

Each epic below states **Purpose, Business Value, Dependencies, Implementation Order, Estimated Complexity, Manual Verification Strategy, and Go-Live Readiness** contribution, per this task's own requested structure.

### Epic B — Administration

- **Purpose:** The Admin console that lets a Principal/school-office staff member run the school without a manual — the actual product this whole platform exists to be, per [PRODUCT_VISION.md § 1](../PRODUCT_VISION.md#1-mission).
- **Business Value:** Unlocks every other epic (nothing else can attribute an action to a user without this). Directly reduces Admin's WhatsApp/phone-call coordination load — [PRODUCT_VISION.md § 10](../PRODUCT_VISION.md#10-success-metrics)'s second named success metric.
- **Dependencies:** Auth.js provider decision (already effectively resolved — Credentials, per [D-029](../DECISIONS.md#d-029--final-identity-architecture-review-validators-consolidated-into-libvalidations-roleiduseraccesslevel-design-affirmed)'s rejected-alternatives note — but not yet _implemented_ in `src/lib/auth.ts`). `Role`/`User` schema (already built, Sprint 1).
- **Implementation Order:** Split into two deliverable slices, not one monolith — see [ADMINISTRATION_STRATEGY.md](./ADMINISTRATION_STRATEGY.md) for the full design:
  1. **Core (blocks everything else):** Auth.js Credentials provider + Argon2id password hashing + database-backed sessions; bootstrap-admin creation mechanism; minimal Admin-creates-User flow (name, email, role, temp password).
  2. **Full (can trail):** self-service "change my password," Admin-mediated password reset, account deactivation/reactivation UI, role-reassignment UI, an audit-log viewer.
- **Estimated Complexity:** Medium-High. Not because the schema is hard (it's built) — because getting authentication genuinely right (session handling, password hashing, CSRF, rate-limiting a login form) is the highest-security-consequence code in the whole product, and mistakes here are the most expensive to discover late.
- **Manual Verification Strategy:** A real browser session (per this project's own browser-safety rules — an isolated instance, never the user's own Chrome) exercising: bootstrap admin login → create a Teacher account → log out → log in as that Teacher → confirm role-scoped access → deactivate the Teacher as Admin → confirm the deactivated account can no longer log in. Not a unit test substitute — an actual session walkthrough.
- **Go-Live Readiness Contribution:** **Required.** No client can go live without this.

### Epic C — Client Customization Framework

- **Purpose:** Turn the already-informal "clone and configure" pattern into a documented, repeatable playbook — formalizing [CONFIGURATION_GUIDE.md](../CONFIGURATION_GUIDE.md)'s existing config/content/code boundary specifically for the question "what does a new client actually need to touch."
- **Business Value:** The literal precondition for delivering to a second school without a bespoke engineering effort each time. Directly determines TechPulse's real unit economics for client #2 onward.
- **Dependencies:** None blocking — can start immediately. Benefits from [PRODUCT_ARCHITECTURE.md § 15](../PRODUCT_ARCHITECTURE.md#15-architecture-review--does-pant-public-school-still-appear-inside-the-architecture)'s existing audit (already found the remaining coupling points: `src/config/school.ts`, `package.json`'s `name`, each page composite's `content.ts`).
- **Implementation Order:**
  1. Re-run and close out § 15's audit — confirm the "remaining coupling" list is still accurate after Sprints 0–5's backend work (new candidates: `prisma/seed.ts`'s generic-but-still-hardcoded class/subject/teacher seed lists, `SCHOOL_ID` used as a literal string constant in service calls).
  2. Write [CLIENT_CUSTOMIZATION_GUIDE.md](./CLIENT_CUSTOMIZATION_GUIDE.md) as a literal checklist a new engineer could follow without reverse-engineering the codebase.
  3. Only if the audit finds a genuine gap: light engineering to close it (e.g., replacing a hardcoded `"seed-school"` schoolId literal with a config-sourced constant) — not a redesign.
- **Estimated Complexity:** Low. Mostly documentation; any code touched is a rename/config-extraction, not new logic.
- **Manual Verification Strategy:** A dry-run clone — actually `git clone` this repository into a scratch directory, follow [CLIENT_CUSTOMIZATION_GUIDE.md](./CLIENT_CUSTOMIZATION_GUIDE.md) literally with placeholder "Second School" values, and confirm the app builds and runs with zero remaining "Pant Public School" strings visible in rendered output. The single most trustworthy verification available for this epic, since it tests the actual deliverable (a clean clone), not a proxy for it.
- **Go-Live Readiness Contribution:** **Required for client #2 onward.** Not required for client #1 (Pant Public School), which never needed to be "cloned" — it's the original.

### Epic D — Data Migration Engine (Import Engine)

- **Purpose:** A reusable, generic import pipeline — Upload → Map → Validate → Preview → Commit → Audit — for a client's existing student, teacher, and academic-structure records, so onboarding a school with 800 existing students doesn't mean 800 manual form submissions. Full design: [IMPORT_ENGINE_STRATEGY.md](./IMPORT_ENGINE_STRATEGY.md).
- **Business Value:** The other literal precondition (alongside Epic C) for delivering to a second school economically. Directly reusable across Students, Teachers, Academic Structure today, and Examination/Admission data once those schemas exist — one engine, not one bespoke importer per entity.
- **Dependencies:** Administration's core slice (an authenticated actor to attribute the import to). Reuses, does not duplicate, the existing `registerStudent()`/`enrollStudent()`/`registerTeacher()`/`assignTeacher()` services and their Zod validation schemas.
- **Implementation Order:**
  1. `ImportBatch` schema (new — a genuinely new entity, not yet in the domain model; tracks one import run's provenance). **Built, Sprint D1** — extended with a second table, `ImportRow`, for row-level resumability/error attribution ([D-043](./DECISIONS.md#d-043--sprint-d1-import-engine-architecture--foundation-two-new-tables-importbatchimportrow-each-independently-justified-chunked-commit-is-one-transaction-per-row-not-per-chunk-matching-transaction_boundariesmd--4s-rollover-precedent-entity-agnostic-extension-points-only--no-real-importer-built)).
  2. Upload + column-mapping UI (CSV/XLSX). **Not built** — Sprint D1/D2's own scope excluded file parsing and any UI beyond a minimal read-only History list; the service-layer functions this UI will call (`createImportBatch()`, `ingestImportRows()`, plus Sprint D2's `startAcademicStructureImport()`) already exist and were verified via a scratch script, not through this UI.
  3. Validation pass reusing existing Zod schemas — no new validation logic duplicated. **Built for real, Sprint D2** — `createAcademicStructureValidator()` implements the (now async, per [D-044](./DECISIONS.md#d-044--sprint-d2-academic-structure-importer-first-real-importer-built-as-the-reference-architecture-two-genuine-gaps-found-in-sprint-d1s-own-foundation-and-fixed-importrowvalidator-widened-async-academicservicets-gains-transaction-passthrough-importentitytype-simplified-to-one-academic_structure-value)) `ImportRowValidator` contract with real Business + Database Validation (duplicate detection, academic-year resolution), verified live against a real database, not a synthetic stand-in. A future `StudentImporter`'s own validator (wrapping `registerStudentInputSchema`) follows the same pattern.
  4. Preview (row-level diff, error surfacing) — mandatory gate before commit, never a direct upload-and-commit path. **Built, Sprint D1**, exercised for real by Sprint D2 — `previewImportBatch()`/`skipInvalidRows()`, returning the reusable `ImportReportDTO` (row counts + grouped error summary).
  5. Chunked, resumable commit (per [TRANSACTION_BOUNDARIES.md § 4](../database/TRANSACTION_BOUNDARIES.md#4-the-one-exception-academic-year-rollover-should-not-be-one-transaction)'s own precedent for large batch operations — an import is the same shape of problem as Academic Year Rollover, not the same shape as a 40-row attendance submission). **Built, Sprint D1**, exercised for real by Sprint D2 — `commitImportBatchChunk()`, one transaction per row (not per chunk); Sprint D2's own `ImportRowCommitHandler` implementation (`createAcademicStructureCommitHandler()`) reuses `createSchoolClassWithSections()`/`createAcademicSubject()` unchanged, which required adding an optional `tx` passthrough parameter to both (a real gap D1's design hadn't accounted for — see D-044).
  6. Academic Structure import type (Classes/Sections/Subjects) — likely needed **before** Student/Teacher import types for a real client, since students need sections to enroll into. **Built, Sprint D2** — `src/services/import/importers/academicStructure/`, the first real importer and the reference architecture every future importer (Student, Teacher, Attendance, Admission, Result) follows. Verified live with real, not synthetic, entity creation.
- **Estimated Complexity:** High. Not the individual writes (those reuse proven code) — the state machine (partial failure, resumability, row-level error attribution) and the UI for a non-technical Admin to trust what's about to happen to their data.
- **Manual Verification Strategy:** A dry-run import against a deliberately messy sample spreadsheet (missing columns, duplicate admission numbers, a student assigned to a nonexistent section) — confirm every error surfaces at Preview, not mid-commit, and confirm a corrected re-upload commits cleanly and idempotently. **Partially performable now** — Sprint D2 verified exactly this shape of messiness (duplicate sections, a duplicate subject, an unknown academic year, an already-existing class) via a scratch script with directly-constructed rows; a genuine end-to-end dry run against a real uploaded spreadsheet still needs the Upload/Map UI and a parsing library (item 2), neither built yet.
- **Go-Live Readiness Contribution:** **Required for any client with pre-existing records** (i.e., every real client except a brand-new school with zero prior students). Not required for Pant Public School specifically, whose Sprint 0–5 seed data already stands in for it.

### Epic E — Academic Operations

- **Purpose:** The actual daily-use product — Teacher-facing attendance marking and marks entry, Admin-facing oversight of both. This is what makes the platform something a teacher opens every day rather than a records system nobody touches.
- **Business Value:** [PRODUCT_VISION.md § 10](../PRODUCT_VISION.md#10-success-metrics)'s #1 named success metric ("teachers actually use attendance/marks entry in place of paper registers") lives entirely in this epic.
- **Dependencies:** Attendance slice — none beyond Administration's core (schema already built, Sprint 5). Examination slice — a new Migration 007/008 (`ExamTerm`, `Examination`, `ExamSubjectSchedule`, `GradeScale`, `MarksRecord`, `ReportCard`), plus the still-open grading-model decision (marks-based vs. grade-based, per [PRODUCT_REQUIREMENTS.md § 11](../PRODUCT_REQUIREMENTS.md#11-open-product-questions)).
- **Implementation Order:**
  1. Attendance marking UI (Teacher, mobile-first per [PROJECT_GUARDRAILS.md § G-5](../PROJECT_GUARDRAILS.md#1-the-core-guardrails)) — consumes `openAttendanceSession()`/`submitAttendance()` directly.
  2. Attendance oversight UI (Admin, cross-section view) — consumes the same services, different scope.
  3. Examination schema (new migration) — blocked on the grading-model decision.
  4. Marks entry UI (Teacher) + Examination management UI (Admin) — after 3.
- **Estimated Complexity:** Medium (Attendance — mostly UI over an existing backend); Medium-High (Examination — new schema + new business rules for grade derivation).
- **Manual Verification Strategy:** A real Teacher-role browser session marking a full section's attendance, reopening it, correcting one student, and confirming the correction is both visible and attributed correctly — mirrors the exact workflow [WORKFLOWS.md § 2](../domain/WORKFLOWS.md#2-daily-attendance-workflow) already documents.
- **Go-Live Readiness Contribution:** **Attendance slice required.** Examination slice recommended but could plausibly trail a first go-live by one grading period if the grading-model decision isn't resolved in time — a real, named risk, not assumed away.

### Epic F — Admission Management

- **Purpose:** The Admin-facing side of the admission pipeline — enquiry triage, application review, document verification, RTE quota handling, confirmation into `Student`+`Enrollment`.
- **Business Value:** Closes the loop Epic A's public site opened (the `/admissions/enquiry` form was always planned but never built) — converts a Guest's enquiry into a real enrolled student without a phone call.
- **Dependencies:** A new Migration 009 (`AdmissionEnquiry`, `AdmissionApplication`, `RteDetails`, `DocumentRecord`) — none of these tables exist yet. `DocumentRecord` needs Cloudinary wired (installed but not configured, per [PROJECT_CONTEXT.md § 13](../PROJECT_CONTEXT.md#13-current-risks)). The public `/admissions/enquiry` form itself (Epic A, still pending, blocked on confirmed form fields from School Admin).
- **Implementation Order:** Public enquiry form first (closes an existing Epic A gap) → `AdmissionEnquiry`/`AdmissionApplication` schema and Admin triage UI → `RteDetails` + the RTE-quota workflow (see [IMPORT_ENGINE_STRATEGY.md § RTE Research](./IMPORT_ENGINE_STRATEGY.md#5-rajasthan-rte-integration-research) for why this is Admin-entered, not government-integrated) → `DocumentRecord` upload once Cloudinary is configured → confirmation-to-`Student`+`Enrollment` transaction, per [TRANSACTION_BOUNDARIES.md § 2](../database/TRANSACTION_BOUNDARIES.md#2-every-multi-table-write-in-this-schema-and-its-required-boundary)'s already-documented "Admission confirmation" row.
- **Estimated Complexity:** Medium-High. The RTE-category workflow specifically carries real compliance weight (government-facing data, [BUSINESS_RULES.md § 3](../domain/BUSINESS_RULES.md#3-admission-categories--rte-quota)) that ordinary CRUD doesn't.
- **Manual Verification Strategy:** A full enquiry-to-enrollment walkthrough as both Guest (submit) and Admin (triage, confirm) in one browser session, confirming the resulting `Student`+`Enrollment` rows match what the confirmation screen showed.
- **Go-Live Readiness Contribution:** Recommended, not strictly required for a first go-live if the client's admission cycle for the year has already closed — a real, seasonally-dependent judgment call worth naming explicitly rather than treating every epic as equally urgent regardless of the school calendar.

### Epic G — Reporting & Analytics

- **Purpose:** Attendance-summary and examination-result reports for Admin, plus the compliance-facing reports [REPORTING_MODEL.md § 5](../domain/REPORTING_MODEL.md#5-future-compliance-reports) already names (PTR, teacher-qualification compliance).
- **Business Value:** Turns data that's already being captured (once E and F ship) into something an Admin can act on or show a government inspector, without needing to query the database directly.
- **Dependencies:** Real data flowing through Epic E (attendance/marks) and Epic F (admission/RTE) — this epic has no standalone value against an empty database.
- **Implementation Order:** Attendance Summary report first (data exists earliest, Epic E slice 1) → Examination Result Summary (after Epic E slice 3–4) → RTE/PTR compliance reports (after Epic F) → cross-tenant analytics explicitly **not** in scope, per [ROADMAP_V2.md § Epic G](../ROADMAP_V2.md#epic-g--analytics)'s own already-correct reasoning ("only meaningful once a second tenant exists to compare against" — and even then, cross-_repository_ analytics has no natural home in a clone-per-client model without a separate, explicitly-scoped aggregation service TechPulse would run outside any single client's repo).
- **Estimated Complexity:** Low-Medium per report (mostly aggregation queries over already-modeled data) — the discipline is in not over-building (per [PROJECT_GUARDRAILS.md § G-3](../PROJECT_GUARDRAILS.md#1-the-core-guardrails), a small set of reports that work perfectly beats a configurable report-builder).
- **Manual Verification Strategy:** Cross-check one generated report's numbers by hand against the underlying `AttendanceRecord`/`MarksRecord` rows for a small, known section — confirms the aggregation logic, not just that a page renders.
- **Go-Live Readiness Contribution:** Not required for a first go-live; genuinely valuable once E/F have a few weeks of real data behind them.

### Epic H — Deployment & Go-Live

- **Purpose:** The operational and process work that turns a working codebase into a school actually running on it — infrastructure provisioning, the bootstrap sequence, training, and the transition to steady-state support. Full design: [CLIENT_IMPLEMENTATION_PLAYBOOK.md](./CLIENT_IMPLEMENTATION_PLAYBOOK.md) and [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md).
- **Business Value:** This is the epic that actually converts engineering work into revenue/adoption — everything upstream exists to make this epic short and low-risk per client, not the other way around.
- **Dependencies:** B, C, D fully; E's Attendance slice at minimum; F/G optional depending on the client's calendar and needs (see Epic F/G's own readiness notes above).
- **Implementation Order:** Not code — process. Infrastructure provisioning template → bootstrap-admin script hardening (idempotent, safe to re-run, never exposed as a public route) → the corrected client delivery sequence in [CLIENT_IMPLEMENTATION_PLAYBOOK.md](./CLIENT_IMPLEMENTATION_PLAYBOOK.md) → [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md) as the hard gate, mirroring the existing [onboarding/GO_LIVE_CHECKLIST.md](../onboarding/GO_LIVE_CHECKLIST.md) pattern already established for content readiness, extended to cover infrastructure/data/training readiness too.
- **Estimated Complexity:** Low technically, High in process discipline — the risk here is skipped steps under deadline pressure, not hard engineering problems.
- **Manual Verification Strategy:** A full rehearsal of the entire playbook against a throwaway "Second School" clone before it's ever run against a real client — the same discipline as Epic C's dry-run clone verification, extended to cover the complete deployment sequence, not just customization.
- **Go-Live Readiness Contribution:** This epic **is** go-live readiness — it has no separate contribution to itself.

---

## 5. Dependency Graph

```
Epic B (Administration — Core)
    │
    ├──────────────┬──────────────┐
    ▼              ▼              │
Epic C          Epic D            │
(Customization) (Import Engine)   │
    │              │              │
    │              ▼              ▼
    │      Epic E (Academic Operations — Attendance slice)
    │              │
    │              ▼
    │      Epic E (Academic Operations — Examination slice)
    │              │
    │              ▼
    │      Epic F (Admission Management)
    │              │
    ▼              ▼
    └──────► Epic G (Reporting & Analytics)
                    │
Epic B (Administration — Full slice, can land anytime after Core)
                    │
                    ▼
         Epic H (Deployment & Go-Live)
```

## 6. Framework vs. Client-Repo Scope, Per Epic

A question every epic above should be checked against once it's actually being built — full reasoning in [FRAMEWORK_STRATEGY.md](./FRAMEWORK_STRATEGY.md):

| Epic                      | Belongs in the master framework                        | Belongs only in a client repo                                                    |
| ------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| B — Administration        | All of it — auth logic, role model, password lifecycle | The bootstrap admin's own email/name (a deployment-time value, not code)         |
| C — Client Customization  | The _mechanism_ (config schema, the playbook itself)   | Every actual config/content value for a specific school                          |
| D — Import Engine         | All of it — genuinely reusable across every client     | The source spreadsheets a specific client's migration used (never committed)     |
| E — Academic Operations   | All of it — attendance/marks logic is universal        | Nothing — this is core product, not customization                                |
| F — Admission Management  | All of it, except the exact enquiry form field list    | A client's specific enquiry form fields, if they genuinely vary by state/school  |
| G — Reporting & Analytics | Report logic and templates                             | Nothing — reports read a client's own data, they don't need client-specific code |
| H — Deployment & Go-Live  | The playbook, the checklist, the bootstrap script      | Environment variables, secrets, DNS/hosting config — never committed anywhere    |

---

## 7. Open Strategic Question for the Product Owner

**Should the Attendance slice of Epic E start in parallel with Epic C/D, rather than strictly after both complete?** Both are defensible: starting Attendance now maximizes near-term value for Pant Public School (the one real client, whose success metrics this platform is still primarily judged against per [PRODUCT_VISION.md § 10](../PRODUCT_VISION.md#10-success-metrics)'s "near-term" column); waiting until C/D complete first maximizes readiness to onboard a real second client sooner. This is a resourcing/priority call, not an architecture question — flagged here rather than silently decided, per [AI_RULES.md § 3](../AI_RULES.md#3-communication-discipline).
