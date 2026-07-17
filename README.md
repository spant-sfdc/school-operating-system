# Pant Public School — Digital Platform

A modern, elegant web platform for **Pant Public School**, Vidyadhar Nagar, Jaipur, Rajasthan — built to feel like Stripe Dashboard or Notion, not a traditional school ERP.

> **Status:** Phase 1A — Public Website Foundation. Design system, theme, header/footer, and a Hero-only homepage are live at `/`. No content pages (About, Academics, Admissions, etc.), forms, or auth yet. See [docs/ROADMAP.md](./docs/ROADMAP.md) for the full delivery plan.

---

## Project Goals

| Goal                             | Success looks like                                                     |
| -------------------------------- | ---------------------------------------------------------------------- |
| Credible public digital presence | Guardians learn about the school and submit admission enquiries online |
| Digitized daily attendance       | Teachers mark attendance in under 60 seconds per class                 |
| Digitized examination records    | Admin generates a class result report without spreadsheets             |
| Reduced admin overhead           | Admin manages student/teacher records in one place, not registers      |
| A foundation that scales         | Architecture supports Parent/Student portals later without a rewrite   |

Full objectives and success criteria: [docs/PRODUCT_REQUIREMENTS.md](./docs/PRODUCT_REQUIREMENTS.md).

---

## Vision

Traditional school management systems (Fedena, PowerSchool, ERPNext Education) are feature-dense and dated. This platform takes the opposite approach: a small, focused feature set delivered with premium, modern polish — simple enough for a teacher or principal to use confidently on day one, with no training required.

**Guiding sentence:** _If a teacher needs help using this software, we have failed._

Full product vision and single source of truth: [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md). Rules protecting this vision from scope creep: [docs/PROJECT_GUARDRAILS.md](./docs/PROJECT_GUARDRAILS.md).

---

## Who This Is For

Three roles only in Version 1 — Guest, Admin, Teacher. No Parent or Student login. Full role and feature breakdown: [docs/PROJECT_CONTEXT.md § User Roles](./docs/PROJECT_CONTEXT.md#4-user-roles) and [docs/PRODUCT_REQUIREMENTS.md](./docs/PRODUCT_REQUIREMENTS.md).

---

## Architecture

A single Next.js 15 application serves all three role-segmented experiences from one codebase — no separate backend service.

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

Full architecture — folder structure, routing, rendering strategy, security and performance principles: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

**Tech stack** (canonical table): [docs/PROJECT_CONTEXT.md § Tech Stack](./docs/PROJECT_CONTEXT.md#8-tech-stack) — Next.js 15, React 19, TypeScript, Tailwind CSS v4, Shadcn UI, Framer Motion, Lucide Icons, PostgreSQL, Prisma, Auth.js, Vercel, Cloudinary, GitHub.

---

## Folder Structure

Application code lives under `src/`. Full breakdown with files and rationale: [docs/ARCHITECTURE.md § Folder Structure](./docs/ARCHITECTURE.md#2-folder-structure).

```
/
├── src/
│   ├── app/          # (public) (auth) (admin) (teacher) route groups + api/
│   ├── components/   # ui/ shared/ website/ admin/ teacher/
│   ├── lib/          # utilities, motion.ts, validations/
│   ├── hooks/        # shared custom hooks
│   └── types/        # shared TypeScript types
├── prisma/           # schema.prisma & migrations
├── docs/             # project documentation
└── public/           # static assets
```

---

## Documentation Map

This project is documentation-first, built as an operating system another AI or engineer can pick up with no chat history. `PROJECT_CONTEXT.md` is the single source of truth — read it before anything else.

| Document                                                             | Purpose                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md)                 | **Single source of truth** — read this first                       |
| [docs/PRODUCT_REQUIREMENTS.md](./docs/PRODUCT_REQUIREMENTS.md)       | Full PRD — scope, journeys, acceptance criteria                    |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)                       | System architecture, folder structure, rendering strategy          |
| [docs/UI_DESIGN_SYSTEM.md](./docs/UI_DESIGN_SYSTEM.md)               | Design bible — color, typography, spacing, motion, accessibility   |
| [docs/CONTENT_GUIDELINES.md](./docs/CONTENT_GUIDELINES.md)           | Voice, tone, CTA/headline/error/success copy rules                 |
| [docs/PROJECT_GUARDRAILS.md](./docs/PROJECT_GUARDRAILS.md)           | Vision-protection rules and module approval process                |
| [docs/DEVELOPMENT_CONVENTIONS.md](./docs/DEVELOPMENT_CONVENTIONS.md) | Naming, formatting, and code-style conventions                     |
| [docs/COMPONENT_INVENTORY.md](./docs/COMPONENT_INVENTORY.md)         | Registry of every UI component — prevents duplicates               |
| [docs/ROUTES.md](./docs/ROUTES.md)                                   | Complete routing map                                               |
| [docs/FEATURE_STATUS.md](./docs/FEATURE_STATUS.md)                   | Per-feature status dashboard                                       |
| [docs/DEFINITION_OF_DONE.md](./docs/DEFINITION_OF_DONE.md)           | Completion checklist for any unit of work                          |
| [docs/AI_RULES.md](./docs/AI_RULES.md)                               | Behavioral rules for AI assistants working on this codebase        |
| [docs/MASTER_PROMPT.md](./docs/MASTER_PROMPT.md)                     | Universal implementation prompt every task-specific prompt extends |
| [docs/DECISIONS.md](./docs/DECISIONS.md)                             | Log of every approved product/architecture decision                |
| [docs/IMPLEMENTATION_LOG.md](./docs/IMPLEMENTATION_LOG.md)           | Engineering diary — why, alternatives, lessons learned             |
| [docs/ROADMAP.md](./docs/ROADMAP.md)                                 | Phased delivery plan, Phase 0A through Phase 5                     |
| [docs/TASKS.md](./docs/TASKS.md)                                     | Live sprint task board                                             |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md)                             | Version history (Keep a Changelog format)                          |

---

## Quick Start

```bash
git clone <repository-url>
cd pant-public-school
pnpm install
cp .env.example .env.local   # configure DATABASE_URL, AUTH secrets, Cloudinary keys
pnpm dev                     # http://localhost:3000
```

Other scripts: `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm format` / `pnpm format:check`.

No database models or auth configuration exist yet — `prisma migrate dev` has nothing to migrate. Prisma CLI commands currently require Node 22+ in `PATH`; see [docs/PROJECT_CONTEXT.md § Current Risks](./docs/PROJECT_CONTEXT.md#13-current-risks).

---

## Roadmap

| Phase | Focus                                        |
| ----- | -------------------------------------------- |
| 0A    | Project Foundation & Documentation           |
| 0A.1  | AI Development Operating System              |
| 0B.1  | Project Scaffolding                          |
| 1A    | Public Website Foundation _(current)_        |
| 1     | Public Website (Guest Experience)            |
| 2     | Authentication & Admin Foundations           |
| 3     | Attendance                                   |
| 4     | Examinations & Marks                         |
| 5     | Teacher Experience Polish & Launch Readiness |

Full detail: [docs/ROADMAP.md](./docs/ROADMAP.md). Live feature-by-feature status: [docs/FEATURE_STATUS.md](./docs/FEATURE_STATUS.md).

---

## Development Workflow

1. Read [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md) — the single source of truth — before making any change, human or AI.
2. For implementation work, follow [docs/MASTER_PROMPT.md](./docs/MASTER_PROMPT.md), which governs how tasks are scoped, reviewed, and documented.
3. Do not expand scope beyond [docs/PRODUCT_REQUIREMENTS.md](./docs/PRODUCT_REQUIREMENTS.md) without running the [docs/PROJECT_GUARDRAILS.md § Module Approval Process](./docs/PROJECT_GUARDRAILS.md#2-module-approval-process).
4. Check [docs/COMPONENT_INVENTORY.md](./docs/COMPONENT_INVENTORY.md) and [docs/ROUTES.md](./docs/ROUTES.md) before creating a component or route.
5. Follow [docs/DEVELOPMENT_CONVENTIONS.md](./docs/DEVELOPMENT_CONVENTIONS.md) and [docs/UI_DESIGN_SYSTEM.md](./docs/UI_DESIGN_SYSTEM.md) exactly.
6. Verify every change against [docs/DEFINITION_OF_DONE.md](./docs/DEFINITION_OF_DONE.md) before calling it complete.
7. Update documentation in the same change — see [docs/MASTER_PROMPT.md § Documentation Updates](./docs/MASTER_PROMPT.md#6-documentation-updates-required-every-task).

---

## Contribution Guide

1. Read [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md) and [docs/AI_RULES.md](./docs/AI_RULES.md) before making any change.
2. No new dependency, module, or fourth role without a recorded decision in [docs/DECISIONS.md](./docs/DECISIONS.md).
3. Reuse existing components before creating new ones; no duplicate logic.
4. Update [docs/CHANGELOG.md](./docs/CHANGELOG.md) and [docs/TASKS.md](./docs/TASKS.md) at the end of every work session.

---

## License

Proprietary — © Pant Public School, Vidyadhar Nagar, Jaipur. All rights reserved.
