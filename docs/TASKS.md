# Tasks

Live sprint board for the Pant Public School Digital Platform. Update this file at the end of every work session — it should always reflect current reality, not a plan from the past.

**Note:** This is the day-to-day sprint board. For the feature/module-level progress dashboard, see [FEATURE_STATUS.md](./FEATURE_STATUS.md) instead.

---

## Current Sprint — Phase 0B.1 Finalization

**Sprint Goal:** Stabilize and verify the Phase 0B.1 scaffold — fix defects, pin the runtime, prepare the repository for its first commit, push, and tag. No new functionality.

---

## Completed

| Task                                                                                                                                                                                                | Notes                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Draft `docs/PROJECT_CONTEXT.md`                                                                                                                                                                     | Permanent memory document established (Phase 0A)                                                                                          |
| Draft `docs/PRODUCT_REQUIREMENTS.md`                                                                                                                                                                | Full PRD with scope, journeys, acceptance criteria (Phase 0A)                                                                             |
| Draft `docs/ARCHITECTURE.md`                                                                                                                                                                        | Folder structure, rendering strategy, security/performance principles (Phase 0A)                                                          |
| Draft `docs/UI_DESIGN_SYSTEM.md`                                                                                                                                                                    | Design bible covering color, type, spacing, motion, accessibility (Phase 0A)                                                              |
| Draft `docs/AI_RULES.md`                                                                                                                                                                            | Behavioral rules for AI assistants working on this codebase (Phase 0A)                                                                    |
| Draft `docs/DECISIONS.md`                                                                                                                                                                           | Initial decision log (D-001 through D-005) (Phase 0A)                                                                                     |
| Draft `docs/ROADMAP.md`                                                                                                                                                                             | Phase 0A through Phase 5 defined (Phase 0A)                                                                                               |
| Draft `docs/TASKS.md`                                                                                                                                                                               | This file (Phase 0A)                                                                                                                      |
| Draft `docs/CHANGELOG.md`                                                                                                                                                                           | Version 0.0.1 entry (Phase 0A)                                                                                                            |
| Draft `README.md`                                                                                                                                                                                   | Project overview and setup instructions (Phase 0A)                                                                                        |
| Refactor `docs/PROJECT_CONTEXT.md` into single source of truth                                                                                                                                      | Phase 0A.1                                                                                                                                |
| Create `docs/PROJECT_GUARDRAILS.md`, `DEVELOPMENT_CONVENTIONS.md`, `COMPONENT_INVENTORY.md`, `ROUTES.md`, `FEATURE_STATUS.md`, `DEFINITION_OF_DONE.md`, `MASTER_PROMPT.md`, `IMPLEMENTATION_LOG.md` | Phase 0A.1 — see [CHANGELOG.md](./CHANGELOG.md) v0.0.2                                                                                    |
| Expand `docs/AI_RULES.md`, reformat `docs/DECISIONS.md`, convert `docs/CHANGELOG.md` to Keep a Changelog format, update `README.md`                                                                 | Phase 0A.1                                                                                                                                |
| Remove duplicated tech stack / folder structure / design principle content across documents                                                                                                         | Phase 0A.1                                                                                                                                |
| Scaffold Next.js 15 project (TypeScript strict, Tailwind v4, shadcn/ui, `src/` layout, ESLint/Prettier/Husky/lint-staged)                                                                           | Phase 0B.1 — see [CHANGELOG.md](./CHANGELOG.md) v0.1.0                                                                                    |
| Create full `ARCHITECTURE.md` folder structure as empty directories under `src/`                                                                                                                    | Phase 0B.1                                                                                                                                |
| Install approved dependencies (Framer Motion, Lucide, React Hook Form, Zod, Auth.js v5, Prisma + pg, next-intl, next-pwa)                                                                           | Phase 0B.1 — package installs only, see [DECISIONS.md § D-008](./DECISIONS.md#d-008--phase-0b1-tooling--dependency-additions)             |
| Initialize Prisma (datasource + generator, zero models) and validate `prisma generate`                                                                                                              | Phase 0B.1                                                                                                                                |
| Create `.env.example`, `.gitignore`, `.editorconfig`, VSCode workspace config                                                                                                                       | Phase 0B.1                                                                                                                                |
| Verify build, typecheck, lint, and format all pass clean                                                                                                                                            | Phase 0B.1                                                                                                                                |
| Record `docs/DECISIONS.md` D-007 (`src/` layout) and D-008 (tooling additions)                                                                                                                      | Phase 0B.1                                                                                                                                |
| Repository review — remove orphaned `@base-ui/react`/`class-variance-authority`, reclassify `shadcn` as devDependency                                                                               | Phase 0B.1 Finalization — see [DECISIONS.md § D-009](./DECISIONS.md#d-009--phase-0b1-finalization-dependency-cleanup-and-runtime-pinning) |
| Pin project Node.js version (`.nvmrc` = 22) and `package.json engines` (node ≥22 <23, pnpm ≥10)                                                                                                     | Phase 0B.1 Finalization                                                                                                                   |
| Upgrade global `pnpm` to 10.34.5 so the pinned engines constraint is actually satisfiable                                                                                                           | Phase 0B.1 Finalization                                                                                                                   |
| Add `pnpm-workspace.yaml` (`allowBuilds: prisma`) for pnpm 10's postinstall-script opt-in                                                                                                           | Phase 0B.1 Finalization                                                                                                                   |
| Re-verify `pnpm install`, `lint`, `typecheck`, `build` all pass clean under the pinned toolchain                                                                                                    | Phase 0B.1 Finalization                                                                                                                   |

---

## Pending

| Task                                                                              | Owner                      | Notes                                                                            |
| --------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------- |
| School stakeholder review & sign-off on all documentation and scaffolding         | School Admin               | Required before further phases begin                                             |
| Provide brand identity input (logo, exact color palette, fonts if any)            | School Admin               | Blocks finalizing exact color tokens in `UI_DESIGN_SYSTEM.md` and shadcn theme   |
| Provide real content for public site (About, Academics, Facilities copy + images) | School Admin               | Needed for Phase 1                                                               |
| Confirm admission enquiry form fields                                             | School Admin               | Needed for Phase 1                                                               |
| Confirm examination grading approach (marks vs. grade-based)                      | School Admin               | Needed for Phase 4                                                               |
| Confirm academic year structure (start month, terms)                              | School Admin               | Needed for Phase 2 (School Settings)                                             |
| Decide `next-intl` locale-routing approach (or defer formally) before activating  | Engineering                | Would restructure `app/` with a `[locale]` segment — needs its own decision      |
| Provide PWA icon set / manifest branding before activating `next-pwa`             | School Admin + Engineering | Blocked on brand identity input                                                  |
| Push `phase/0b-1-project-scaffolding` branch and `v0.1.0` tag to `origin`         | Engineering                | Requires GitHub authentication — see Blocked below if credentials are missing    |
| Kick off Phase 0B.2 / Phase 1 implementation work                                 | Engineering                | Blocked on documentation sign-off, School Admin inputs above, and the push above |

---

## Blocked

| Task                                                        | Blocked By                                                                                                                         |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Finalize exact brand color palette in `UI_DESIGN_SYSTEM.md` | Awaiting school brand identity input                                                                                               |
| Public site content build                                   | Awaiting real copy/images from school                                                                                              |
| Prisma schema design (actual models)                        | Awaiting academic year/grading structure decisions                                                                                 |
| `src/lib/auth.ts` provider configuration                    | Awaiting Auth.js provider strategy decision ([ARCHITECTURE.md § Open Questions](./ARCHITECTURE.md#9-open-architectural-questions)) |
| `src/lib/db.ts` Prisma client singleton                     | Awaiting a schema with real models to justify wiring it in                                                                         |

---

## Future Ideas

_Unscoped, unscheduled — for consideration in future roadmap phases only. Do not build without a recorded decision._

- Parent portal (view-only)
- SMS/email notifications for attendance and notices
- Timetable management
- Bulk student import (CSV) for onboarding
- Printable report card generation (PDF export)

---

## How to Use This File

- Move tasks between sections as their state changes — do not duplicate a task across sections.
- Every "Pending" task should have a clear owner (School Admin vs. Engineering).
- "Blocked" tasks must state exactly what they're blocked by, not just "waiting."
- At the end of each phase, archive completed tasks into a phase-tagged section or summarize in `CHANGELOG.md` and trim this file so it stays a live board, not a history log.
