# Project Context

> **This is the single source of truth for the Pant Public School Digital Platform.** Every AI assistant, engineer, or contributor must read this file first, before reading any code or any other document. If information here conflicts with another document, this file wins — fix the other document, don't override this one. Other documents in `/docs` exist to hold detail that would make this file too long; they are supporting references, not competing sources of truth.
>
> No chat history should ever be required to understand this project. If something important isn't captured here or in the linked reference docs, it doesn't count as known.

---

## 1. Project Vision

Pant Public School (Vidyadhar Nagar, Jaipur, Rajasthan) is building a digital platform to replace fragmented, paper-based, and WhatsApp-driven school operations with a single, elegant web application.

The product is **not** a "School ERP" in the traditional sense. Traditional school ERPs (Fedena, PowerSchool, ERPNext Education) are feature-dense, visually dated, and require training to use. This platform is designed to feel like **Stripe Dashboard, Linear, or Notion** — software that a non-technical teacher or school principal can use confidently on day one, without a manual.

**Guiding sentence:** _If a teacher needs help using this software, we have failed._

Product rationale (objectives, success criteria) lives in [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md). Vision-protection rules live in [PROJECT_GUARDRAILS.md](./PROJECT_GUARDRAILS.md).

---

## 2. Current Phase & Sprint

**Current Phase:** Phase 1A — Public Website Foundation (design system + header/footer/hero — not the homepage content pages). Manually reviewed and approved; finalized for commit.

**Current Sprint Goal:** Build the reusable design system and chrome (theme tokens, typography, header, footer, hero) that every future public-site page will be built on. No About/Gallery/Admissions pages, no forms, no auth, no database.

The public site now has a real, working foundation: semantic design tokens (including a placeholder accent color, see [DECISIONS.md § D-010](./DECISIONS.md#d-010--placeholder-accent-color-for-phase-1a)), Inter typography, a working light/dark theme toggle, a responsive sticky header with mobile navigation, a footer, and a Hero-only homepage at `/`. Phase 0B.1's infrastructure (tooling, empty folders, runtime pin) is unchanged and still accurate — see §5/§6 below for what's built vs. still pending.

Full phase breakdown: [ROADMAP.md](./ROADMAP.md). Live sprint task board: [TASKS.md](./TASKS.md). Feature-by-feature status dashboard: [FEATURE_STATUS.md](./FEATURE_STATUS.md).

---

## 3. Current Architecture (Summary)

A single Next.js 15 application serves three role-segmented experiences (Guest, Admin, Teacher) from one codebase. No separate backend service — business logic lives in Route Handlers and Server Actions. Server Components are the default rendering mode; Client Components are the exception, justified case-by-case.

```
┌─────────────────────────────────────────────────────┐
│                  Next.js 15 App                       │
│   Public Website   │   Admin Console   │   Teacher      │
│   (Guest)          │                   │   Dashboard    │
│         └──────────────────┴──────────────────┘         │
│                  Route Handlers (API)                    │
│                       Prisma ORM                          │
└──────────────────────────┬──────────────────────────────┘
                  PostgreSQL · Auth.js · Cloudinary
```

Full architecture detail (folder structure, routing strategy, rendering strategy, state management, security and performance principles): [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 4. User Roles

Exactly **three roles** in Version 1. No others without a recorded decision in [DECISIONS.md](./DECISIONS.md).

| Role        | Description                            | Access                                          |
| ----------- | -------------------------------------- | ----------------------------------------------- |
| **Guest**   | Unauthenticated public visitor         | Public website only                             |
| **Admin**   | Principal / Management / School Office | Full administrative control                     |
| **Teacher** | Teaching staff                         | Scoped dashboard for their own classes/students |

There is **no Parent login** and **no Student login** in Version 1 — see [DECISIONS.md § D-001](./DECISIONS.md#d-001--three-roles-only-for-version-1).

---

## 5. Completed Features

- **Public website design system** (Phase 1A): semantic design tokens, Inter typography, light/dark theme toggle, responsive header (desktop + mobile nav), footer, Hero-only homepage. Not a full feature — the reusable foundation every future public page builds on. Full dashboard: [FEATURE_STATUS.md](./FEATURE_STATUS.md).

No end-to-end product feature (admission enquiry, notices, attendance, etc.) is complete yet — see §6.

---

## 6. Pending Features (Version 1 Scope)

### Guest (Public Website)

Browse marketing/informational site (design system built; About/Academics/Facilities content pages pending) · submit admission enquiry · view notices · view gallery · download documents · contact school

### Admin

Manage students · manage teachers · manage website content · attendance oversight · examinations · reports · school settings

### Teacher

Dashboard · attendance (mark/view for assigned classes) · marks entry · student list (assigned classes only) · profile · leave request

**Explicitly out of scope for Version 1:** Fee management, library, hostel, payroll, inventory, transport management, homework module, parent portal, student portal. Full exclusion list and rationale: [PRODUCT_REQUIREMENTS.md § Out of Scope](./PRODUCT_REQUIREMENTS.md#4-out-of-scope). Approval process for ever introducing one of these: [PROJECT_GUARDRAILS.md](./PROJECT_GUARDRAILS.md#module-approval-process).

Full feature list with priority: [PRODUCT_REQUIREMENTS.md § Feature List](./PRODUCT_REQUIREMENTS.md#5-feature-list-version-1). Planned route inventory: [ROUTES.md](./ROUTES.md).

---

## 7. Folder Structure (Scaffolded — Phase 0B.1)

Condensed top-level view; application code lives under `src/` per [DECISIONS.md § D-007](./DECISIONS.md#d-007--src-directory-layout). This structure now exists on disk as empty directories — no pages, components, or schema populated yet. Full breakdown with files and rationale: [ARCHITECTURE.md § Folder Structure](./ARCHITECTURE.md#2-folder-structure).

```
/
├── src/
│   ├── app/          # (public) (auth) (admin) (teacher) route groups + api/
│   ├── components/   # ui/ shared/ admin/ teacher/
│   ├── lib/          # utilities, validations/ (auth.ts, db.ts deferred)
│   ├── hooks/        # shared custom hooks
│   └── types/        # shared TypeScript types
├── prisma/           # schema.prisma (datasource/generator only, zero models) & migrations/
├── docs/             # this documentation set
└── public/           # static assets
```

This is a **feature-based, role-segmented** structure. Route groups isolate Admin and Teacher surfaces from the public site both logically and visually.

---

## 8. Tech Stack

| Layer                | Choice                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime              | Node.js 22 (pinned via `.nvmrc` and `package.json engines`)                                                                                   |
| Frontend Framework   | Next.js 15 (App Router, `src/` layout)                                                                                                        |
| UI Library           | React 19                                                                                                                                      |
| Language             | TypeScript (strict)                                                                                                                           |
| Styling              | Tailwind CSS v4                                                                                                                               |
| Component Library    | Shadcn UI                                                                                                                                     |
| Animation            | Framer Motion                                                                                                                                 |
| Icons                | Lucide Icons                                                                                                                                  |
| Forms                | React Hook Form                                                                                                                               |
| Validation           | Zod                                                                                                                                           |
| Backend              | Next.js API (Route Handlers)                                                                                                                  |
| Database             | PostgreSQL                                                                                                                                    |
| ORM                  | Prisma (installed; zero models until Phase 0B/2)                                                                                              |
| Auth                 | Auth.js v5 (`next-auth@beta`; package installed only, not configured)                                                                         |
| Internationalization | next-intl (installed only; routing not activated — see [DECISIONS.md § D-008](./DECISIONS.md#d-008--phase-0b1-tooling--dependency-additions)) |
| PWA                  | next-pwa (installed only; not wired — see D-008)                                                                                              |
| Hosting              | Vercel                                                                                                                                        |
| Media                | Cloudinary                                                                                                                                    |
| Source Control       | GitHub                                                                                                                                        |
| Package Manager      | pnpm ≥10 (pinned via `package.json engines`)                                                                                                  |
| Lint/Format          | ESLint + Prettier (`eslint-config-prettier`, `prettier-plugin-tailwindcss`)                                                                   |
| Git Hooks            | Husky + lint-staged                                                                                                                           |

This table is canonical — other documents should link here rather than restate it. No additional libraries without a recorded decision (rationale: [DECISIONS.md § D-004](./DECISIONS.md#d-004--tech-stack-selection), [D-008](./DECISIONS.md#d-008--phase-0b1-tooling--dependency-additions); process: [AI_RULES.md](./AI_RULES.md)).

---

## 9. Design System Summary

- **Premium, not decorative.** Restraint over ornamentation.
- **Calm software.** Minimal cognitive load — teachers use this between classes, not as their primary job.
- **Consistency over novelty.** One table style, one empty state, one modal pattern — used everywhere.
- **Motion with purpose.** Feedback, never decoration.
- **Accessible by default.** A baseline requirement, not a checklist item.

Full design bible (color, typography, spacing, components, motion, accessibility, dark mode): [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md). Voice, tone, and copy rules (headlines, CTAs, error/success messages): [CONTENT_GUIDELINES.md](./CONTENT_GUIDELINES.md).

---

## 10. Coding Standards Summary

- Strict TypeScript — no `any`, no implicit types
- Server Components by default; `"use client"` only when justified
- No duplicate logic — shared logic extracted to `/lib`
- No new dependencies without a recorded decision
- All UI built from Shadcn primitives
- Semantic, accessible markup required, not optional

Full naming conventions, import order, error handling, logging, and formatting rules: [DEVELOPMENT_CONVENTIONS.md](./DEVELOPMENT_CONVENTIONS.md). Behavioral rules for AI assistants: [AI_RULES.md](./AI_RULES.md).

---

## 11. Important Decisions

- Three roles only: Guest, Admin, Teacher (no Parent/Student login in v1)
- No Fee, Library, Hostel, Payroll, Inventory, Transport, or Homework modules in v1
- Server Components as the default rendering mode
- Shadcn UI as the only component primitive source
- No application code during Phase 0A; Phase 0A.1 was documentation-only
- Application code nests under `src/`; `prisma/`, `public/`, `docs/` stay at repo root (D-007)
- Phase 0B.1 scaffolding is infrastructure-only: no pages, no database models, no auth logic — `next-auth`, `prisma`, `next-intl`, `next-pwa` are installed but not wired (D-008)
- Project runtime pinned to Node 22 / pnpm ≥10 via `.nvmrc` and `package.json engines`; `@base-ui/react` and `class-variance-authority` removed as orphaned dependencies (D-009)
- A placeholder indigo-blue accent color introduced for `primary` (plus `success`/`warning`/`info`/`surface` tokens); explicitly swappable, revisit once real brand identity is provided (D-010)
- Public-site composites (Header, Footer, Hero, nav) live in a new `components/website/` folder, parallel to `components/admin`/`components/teacher` (D-011)

Full decision log with alternatives considered and approval records: [DECISIONS.md](./DECISIONS.md).

---

## 12. Open Questions

- Exact brand identity (logo, color palette, fonts) — pending school input
- Admission enquiry form field list — pending school input
- Examination grading model: marks-based, grade-based, or both — pending school input
- Academic year start month and term structure — pending school input
- Expected student/teacher volume (affects pagination/reporting defaults) — pending school input

Full context on each: [PRODUCT_REQUIREMENTS.md § Open Product Questions](./PRODUCT_REQUIREMENTS.md#11-open-product-questions).

---

## 13. Current Risks

| Risk                                                                   | Impact                                                                                                                                                                                                                                                                                                                                                                                            | Mitigation                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| No brand palette finalized                                             | A placeholder indigo accent (D-010) now ships live on the public site; if the school's real brand color differs, every `primary`/`ring` reference updates from one token edit — but the visual identity itself isn't final                                                                                                                                                                        | Token system makes the swap cheap by design; revisit `globals.css` `:root`/`.dark` values once real brand input arrives — tracked in [TASKS.md](./TASKS.md)                                                                                      |
| Undefined content pipeline for public site copy/images                 | Hero/footer copy for Phase 1A is deliberately qualitative (no fabricated stats/facts, per [CONTENT_GUIDELINES.md § 12](./CONTENT_GUIDELINES.md#12-what-this-platform-never-says)); About/Academics/Facilities pages still need real content before they can be built                                                                                                                              | Flagged in [TASKS.md](./TASKS.md); School Admin owns this dependency                                                                                                                                                                             |
| Role-scoping enforcement discipline                                    | Teacher-to-class data scoping must be enforced server-side from the first line of backend code; easy to get wrong under time pressure                                                                                                                                                                                                                                                             | [ARCHITECTURE.md § Security Principles](./ARCHITECTURE.md#7-security-principles) is mandatory reading before Phase 2                                                                                                                             |
| Documentation drift                                                    | With this many documents, stale cross-references are a real risk                                                                                                                                                                                                                                                                                                                                  | This file is the tie-breaker; [AI_RULES.md](./AI_RULES.md) requires documentation updates every phase                                                                                                                                            |
| Machine default Node (v23.1.0) differs from the pinned project runtime | `.nvmrc`/`package.json engines` now pin Node `>=22 <23`; a contributor on the machine's default Node gets a non-fatal `pnpm install` warning, and a genuinely fresh `prisma` package install specifically requires Node 22 in `PATH` (Prisma's own preinstall script hard-checks Node version at install time only — `prisma generate` and other commands run fine under any Node once installed) | Resolved for this repo: pinned in `.nvmrc` + `package.json engines` (Phase 0B.1 Finalization); global `pnpm` upgraded to 10.34.5, which itself runs under any Node. Contributors should run `nvm use` (or equivalent) before their first install |
| `next-intl` and `next-pwa` installed but inactive                      | Easy to forget these aren't actually wired in; a future session could assume i18n or PWA behavior exists when it doesn't                                                                                                                                                                                                                                                                          | Tracked explicitly in [DECISIONS.md § D-008](./DECISIONS.md#d-008--phase-0b1-tooling--dependency-additions) and [FEATURE_STATUS.md](./FEATURE_STATUS.md)                                                                                         |

---

## 14. Reference Links — Full Document Map

| Document                                                   | Purpose                                                                                       |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md)       | Full PRD — objectives, scope, exclusions, journeys, acceptance criteria                       |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                       | System architecture, detailed folder structure, rendering/state/security/performance strategy |
| [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md)               | Design bible — color, typography, spacing, components, motion, accessibility, dark mode       |
| [CONTENT_GUIDELINES.md](./CONTENT_GUIDELINES.md)           | Voice, tone, CTA/headline/error/success copy rules                                            |
| [PROJECT_GUARDRAILS.md](./PROJECT_GUARDRAILS.md)           | Vision-protection rules and module approval process                                           |
| [DEVELOPMENT_CONVENTIONS.md](./DEVELOPMENT_CONVENTIONS.md) | Naming, formatting, import order, error handling, logging conventions                         |
| [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md)         | Registry of every UI component — prevents duplicate components                                |
| [ROUTES.md](./ROUTES.md)                                   | Complete routing map — public, admin, teacher, guards                                         |
| [FEATURE_STATUS.md](./FEATURE_STATUS.md)                   | Per-feature status dashboard (status, owner, dependencies, risk)                              |
| [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md)           | Full completion checklist for any unit of work                                                |
| [AI_RULES.md](./AI_RULES.md)                               | Behavioral rules for AI assistants working on this codebase                                   |
| [MASTER_PROMPT.md](./MASTER_PROMPT.md)                     | Universal implementation prompt every future task-specific prompt extends                     |
| [DECISIONS.md](./DECISIONS.md)                             | Log of every approved product/architecture decision                                           |
| [IMPLEMENTATION_LOG.md](./IMPLEMENTATION_LOG.md)           | Engineering diary — why, alternatives, lessons learned                                        |
| [ROADMAP.md](./ROADMAP.md)                                 | Phased delivery plan, Phase 0A through Phase 5                                                |
| [TASKS.md](./TASKS.md)                                     | Live sprint task board                                                                        |
| [CHANGELOG.md](./CHANGELOG.md)                             | Version history (Keep a Changelog format)                                                     |
| [README.md](../README.md)                                  | Project overview, quick start, documentation map                                              |

---

## 15. How Future AI Assistants Should Use This Document

1. **Read this file first**, always. It is the anchor for every other decision. Read [MASTER_PROMPT.md](./MASTER_PROMPT.md) next if the task is implementation work.
2. **Do not contradict recorded decisions.** If a request conflicts with [DECISIONS.md](./DECISIONS.md), flag the conflict instead of silently overriding it.
3. **Do not expand scope.** If asked to add a feature outside Version 1 scope, point to [PRODUCT_REQUIREMENTS.md § Out of Scope](./PRODUCT_REQUIREMENTS.md#4-out-of-scope) and [PROJECT_GUARDRAILS.md](./PROJECT_GUARDRAILS.md), and confirm with the user before proceeding.
4. **Update this document at the end of every phase.** Current Phase, Pending Features/Completed Features, Current Risks, and Important Decisions sections must stay accurate — treat inaccuracies here as bugs.
5. **Follow [AI_RULES.md](./AI_RULES.md)** for behavioral rules and [DEVELOPMENT_CONVENTIONS.md](./DEVELOPMENT_CONVENTIONS.md) for code style once implementation begins.
6. **Check [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md) before creating any component**, and [ROUTES.md](./ROUTES.md) before adding any route.
7. **Verify work against [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md)** before considering anything complete.
8. **When uncertain, ask.** This project prioritizes correctness and consistency over speed of output.
