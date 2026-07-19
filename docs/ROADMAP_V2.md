# Roadmap V2 — Epic-Based Planning

**Purpose:** [ROADMAP.md](./ROADMAP.md) is the original phase-numbered plan (Phase 0A → Phase 5), written before the School Operating System framing existed, and remains the authoritative record of what each numbered phase meant at the time. This document reorganizes the same body of work — completed and future — into product Epics, the planning unit that makes sense once the goal is a platform, not a single sequential build. See [DECISIONS.md § D-019](./DECISIONS.md#d-019--product-pivot-school-operating-system-sos-pant-public-school-as-first-implementation).

**How the two coexist:** `ROADMAP.md` is not superseded or deleted — it's history, and `CHANGELOG.md`/`TASKS.md` still reference it by phase name (`Phase 1C`, `Milestone 4`, etc.), which stays accurate. This document is the forward-looking view. Once Epic-based planning is in active day-to-day use, revisit whether `TASKS.md`/`CHANGELOG.md` should cite Epics instead of phases going forward — not decided yet, see [DECISIONS.md § D-019](./DECISIONS.md#d-019--product-pivot-school-operating-system-sos-pant-public-school-as-first-implementation)'s Future Review note.

---

## Epic A — Website Engine

The public-facing marketing/information site and the reusable primitive library it's built from. **Substantially complete** — everything shipped so far falls here.

**Milestones (completed):**

- Design system & theme tokens (Phase 1A)
- Public site header/footer/nav (Phase 1A)
- Marketing Section Library — 15 reusable components (Phase 1B, architecture-reviewed Phase 1B.1)
- Page-composite pattern established (`About`, Phase 1C)
- `Admissions` Experience (Milestone 4)
- `Academics` Experience (Milestone 5)
- Centralized configuration layer, `src/config/` (Milestone 6A)
- `Campus` Experience (Milestone 6B)
- Content Readiness Framework — 48 content requirements generated from the four built pages, tracked to Published ([docs/onboarding/](./onboarding/README.md))

**Milestones (pending):**

- Decide the `/facilities` question (superseded by `/campus`, or still needed) — see [ROUTES.md](./ROUTES.md)
- `Gallery`, `Notices`, `Documents`, `Contact` pages
- Admission enquiry form (`/admissions/enquiry`) — blocked on confirmed form fields
- Real campus photography, replacing every "[Photo pending]" placeholder

## Epic B — Administration

The Admin console — the Principal/school-office-facing surface. **Not started** (implementation) — **domain model and physical database design both complete** ([docs/domain/](./domain/README.md), [D-022](./DECISIONS.md#d-022--school-domain-model-board-agnostic-enrollment-centric-rte-aware); [docs/database/](./database/README.md), [D-025](./DECISIONS.md#d-025--physical-database-review-time-ordered-ids-for-high-volume-tables-partial-unique-indexes-partitioned-audit-log)).

**Milestones (completed — architecture only, no implementation):**

- School Domain Model — ~29 entities across 7 bounded contexts, ERD, illustrative schema, data dictionary, business rules, workflows, event model, permission matrix, reporting model, and API boundaries, designed for independent Indian K-8 schools generally (not CBSE-only or Rajasthan-only) — see [docs/domain/README.md](./domain/README.md)
- Physical Database Review — indexing strategy, constraint strategy, enum/lookup-table decisions, audit-log append-only enforcement and partitioning, soft-delete strategy, query patterns, a small-independent-migrations plan, growth-projected performance guidelines, and a Prisma implementation guide, reviewing the domain model's illustrative schema as a physical Postgres design — see [docs/database/README.md](./database/README.md)

**Milestones (pending — implementation):**

- Auth.js provider strategy decision + implementation ([ARCHITECTURE.md § 9](./ARCHITECTURE.md#9-open-architectural-questions))
- First Prisma models (Student, Teacher) — **with `schoolId` scoping from the first migration**, see [PRODUCT_ARCHITECTURE.md § 2](./PRODUCT_ARCHITECTURE.md#2-future-architecture); design reference: [docs/domain/DOMAIN_MODEL.md § 11 Recommended Build Order](./domain/DOMAIN_MODEL.md#11-recommended-build-order), sequenced physically in [docs/database/MIGRATION_PLAN.md](./database/MIGRATION_PLAN.md)
- Student management (CRUD, list, detail)
- Teacher management (CRUD, list, detail)
- Website content management (the Admin-facing side of Epic A's Configuration/Content layers — see [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md))
- School Settings (academic year/terms, classes/sections — the natural future home for `src/config/school.ts`'s DB-backed successor)
- Admission enquiries inbox (fed by Epic A's enquiry form once built)

## Epic C — Teacher Experience

The Teacher-facing dashboard. **Not started.** Depends on Epic B's auth/data-model work.

**Milestones:**

- Teacher auth + dashboard shell
- Attendance marking (mobile-first, per [PROJECT_GUARDRAILS.md § G-5](./PROJECT_GUARDRAILS.md#1-the-core-guardrails))
- Marks entry
- Student list (scoped to assigned classes only — see [ARCHITECTURE.md § 7](./ARCHITECTURE.md#7-security-principles))
- Profile management
- Leave request submission

## Epic D — Parent Experience

**Future — not in Version 1 scope** ([D-001](./DECISIONS.md#d-001--three-roles-only-for-version-1)). Listed here as a planning placeholder, not a committed epic. Requires the [Module Approval Process](./PROJECT_GUARDRAILS.md#2-module-approval-process) before any milestone below is scheduled.

**Candidate milestones (unscoped):** Parent auth, read-only attendance/marks view, notices feed, direct messaging with teachers.

## Epic E — Student Experience

**Future — not in Version 1 scope, and deliberately undecided beyond that** (see [PRODUCT_VISION.md § 9](./PRODUCT_VISION.md#9-future-expansion)). No milestones drafted — there's no product signal yet that this epic should exist at all.

## Epic F — School Operations

The operational modules beyond basic records — what a school actually needs to run its academic calendar. **Not started.**

**Milestones:**

- Examination grading-model decision (marks vs. grade-based) — blocked on School Admin input
- Examination management (create exams, define subjects/max marks)
- Reports (attendance & examination summaries)
- Attendance oversight (Admin's cross-class view, distinct from Epic C's Teacher-scoped marking)

## Epic G — Analytics

Dashboards and trend visibility. **Not started, genuinely future.**

**Milestones (unscoped, ordered by likely value):**

- Admin-facing enrollment/attendance trend dashboards (single-tenant — useful the moment Epic F has real data)
- Cross-tenant platform analytics — only meaningful once a second tenant exists; not a Pant Public School feature at all

## Epic H — Platform

**Superseded as of 2026-07-19 — see [D-034](./DECISIONS.md#d-034--delivery-phase-roadmap-clone-per-client-model-supersedes-eventual-saas-framing-epic-reordering).** This epic named formal multi-tenancy ("Pant Public School isolation formally lives here") as the long-run platform direction. The Delivery Phase planning sprint made the actual delivery model explicit instead: one Master Repository, cloned into an independent repository per client — no shared multi-tenant deployment, ever, as currently planned. The milestones below are retained for historical reasoning, not as a current epic — see [docs/product/EPIC_ROADMAP.md](./product/EPIC_ROADMAP.md)'s Epics B–H for the current, authoritative Delivery Phase plan, and [docs/product/FRAMEWORK_STRATEGY.md](./product/FRAMEWORK_STRATEGY.md) for what replaces the multi-tenancy direction below.

The multi-tenancy work itself — where "Pant Public School isolation" formally lives. **Not started, and not to be started speculatively** — see [PRODUCT_ARCHITECTURE.md § 15](./PRODUCT_ARCHITECTURE.md#15-architecture-review--does-pant-public-school-still-appear-inside-the-architecture) and [PRODUCT_VISION.md § 7](./PRODUCT_VISION.md#7-product-philosophy).

**Milestones (triggered by a real second tenant, not by a date):**

- `Tenant`/`School` Prisma model formalized; `getCurrentSchool()` seam introduced
- Tenant-scoped authentication/routing
- `src/config/school.ts` migrated from static file to DB-backed record
- Self-service School Settings (Admin-editable identity/branding, no deploy required)
- `package.json`/repository renamed off the single-tenant name
- Future CMS, future public API layer, future mobile layer — each its own decision, see [PRODUCT_ARCHITECTURE.md §§ 10–13](./PRODUCT_ARCHITECTURE.md#10-content-layer)

---

## Recommended Next Epic

**Superseded as of 2026-07-19 — see [docs/product/EPIC_ROADMAP.md](./product/EPIC_ROADMAP.md)** for the current, authoritative Delivery Phase sequence (Epics B–H reordered and re-scoped now that Sprints 0–5's Foundation Phase is complete). The paragraph below predates that work and is retained for its historical reasoning only — the database has since been touched extensively (Sprints 0–5), so its "first epic that touches the database" framing no longer applies.

**Epic B — Administration.** Epic A (Website Engine) is substantially complete and has proven the page-composite/configuration patterns across four real pages; the next real product value is the Admin console Pant Public School actually needs to reduce its WhatsApp/paper dependency (see [PRODUCT_VISION.md § 10](./PRODUCT_VISION.md#10-success-metrics)). It's also the first epic that touches the database, making it the right moment to apply [PRODUCT_ARCHITECTURE.md § 2](./PRODUCT_ARCHITECTURE.md#2-future-architecture)'s `schoolId`-from-day-one recommendation while it's nearly free, rather than retrofitting it later.
