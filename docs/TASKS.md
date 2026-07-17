# Tasks

Live sprint board for the Pant Public School Digital Platform. Update this file at the end of every work session — it should always reflect current reality, not a plan from the past.

**Note:** This is the day-to-day sprint board. For the feature/module-level progress dashboard, see [FEATURE_STATUS.md](./FEATURE_STATUS.md) instead. Full history of everything completed in prior phases: [CHANGELOG.md](./CHANGELOG.md).

---

## Current Sprint — Phase 1A: Public Website Foundation

**Sprint Goal:** Build the reusable design system and chrome (theme tokens, typography, header, footer, hero) every future public page builds on. Not the homepage content itself, not any other page.

**Status:** Manually reviewed and approved. Finalized for commit/push/tag as `v0.2.0`.

---

## Completed

_Full detail for every item below: [CHANGELOG.md](./CHANGELOG.md)._

| Task                                                                                                                     | Notes                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Phase 0A — Documentation foundation (10 documents)                                                                       | See CHANGELOG v0.0.1                                                                                                              |
| Phase 0A.1 — Documentation consolidation, single source of truth, 8 new operating docs                                   | See CHANGELOG v0.0.2                                                                                                              |
| Phase 0B.1 — Next.js scaffold, tooling, empty folder structure, dependency installs                                      | See CHANGELOG v0.1.0                                                                                                              |
| Phase 0B.1 Finalization — dependency cleanup, runtime pinning (`.nvmrc`, `engines`)                                      | See CHANGELOG v0.1.0, [DECISIONS.md § D-009](./DECISIONS.md#d-009--phase-0b1-finalization-dependency-cleanup-and-runtime-pinning) |
| Repository committed, pushed, tagged `v0.1.0` on `phase/0b-1-project-scaffolding`                                        | —                                                                                                                                 |
| Phase 1A — `docs/CONTENT_GUIDELINES.md` authored                                                                         | See CHANGELOG v0.2.0                                                                                                              |
| Phase 1A — Semantic design tokens extended (surface, success, warning, info, duration, shadow), placeholder accent color | See CHANGELOG v0.2.0, [DECISIONS.md § D-010](./DECISIONS.md#d-010--placeholder-accent-color-for-phase-1a)                         |
| Phase 1A — Inter typography, `Display`/`Heading`/`Text`/`Caption`/`Code` primitives                                      | See CHANGELOG v0.2.0                                                                                                              |
| Phase 1A — Real theme system (`ThemeProvider`, `useTheme`, `ThemeToggle`), no new dependency                             | See CHANGELOG v0.2.0                                                                                                              |
| Phase 1A — `SiteHeader`, `MobileNav`, `LanguageSwitch`, `SiteFooter`, `Hero`, `AnimatedBackground`, `StatStrip` built    | See CHANGELOG v0.2.0, [DECISIONS.md § D-011](./DECISIONS.md#d-011--componentswebsite-folder)                                      |
| Phase 1A — Homepage moved to `(public)/page.tsx`, renders Hero only                                                      | See CHANGELOG v0.2.0                                                                                                              |
| Phase 1A — Font-scoping bug found and fixed via real-browser verification                                                | See [IMPLEMENTATION_LOG.md](./IMPLEMENTATION_LOG.md)                                                                              |
| Phase 1A — Manually reviewed and approved                                                                                | —                                                                                                                                 |

---

## Pending

| Task                                                                                       | Owner                      | Notes                                                                       |
| ------------------------------------------------------------------------------------------ | -------------------------- | --------------------------------------------------------------------------- |
| Provide brand identity input (logo, exact color palette, fonts if any)                     | School Admin               | Would replace the placeholder accent color (D-010)                          |
| Provide real content for public site (About, Academics, Facilities copy + images)          | School Admin               | Needed before those pages can be built                                      |
| Confirm admission enquiry form fields                                                      | School Admin               | Needed for the Admissions page/form                                         |
| Confirm examination grading approach (marks vs. grade-based)                               | School Admin               | Needed for Phase 4                                                          |
| Confirm academic year structure (start month, terms)                                       | School Admin               | Needed for Phase 2 (School Settings)                                        |
| Decide `next-intl` locale-routing approach (or defer formally) before activating           | Engineering                | Would restructure `app/` with a `[locale]` segment — needs its own decision |
| Provide PWA icon set / manifest branding before activating `next-pwa`                      | School Admin + Engineering | Blocked on brand identity input                                             |
| Build About, Academics, Facilities, Gallery, Notices, Documents, Contact, Admissions pages | Engineering                | Blocked on real content above; most nav links currently 404                 |

---

## Blocked

| Task                                                                    | Blocked By                                                                                                                         |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Finalize exact brand accent color                                       | Awaiting school brand identity input                                                                                               |
| Public site content pages (About, Academics, Facilities, Gallery, etc.) | Awaiting real copy/images from school                                                                                              |
| Prisma schema design (actual models)                                    | Awaiting academic year/grading structure decisions                                                                                 |
| `src/lib/auth.ts` provider configuration                                | Awaiting Auth.js provider strategy decision ([ARCHITECTURE.md § Open Questions](./ARCHITECTURE.md#9-open-architectural-questions)) |
| `src/lib/db.ts` Prisma client singleton                                 | Awaiting a schema with real models to justify wiring it in                                                                         |
| `next-intl` locale routing activation                                   | Needs its own architecture decision — would restructure `app/`                                                                     |
| `next-pwa` manifest/service worker activation                           | Needs brand icon set                                                                                                               |

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
- At the end of each phase, archive completed tasks into `CHANGELOG.md` and trim this file so it stays a live board, not a history log — as done at the start of Phase 1A.
