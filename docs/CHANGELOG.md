# Changelog

All notable changes to the Pant Public School Digital Platform are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Version numbers follow `0.x.y` during pre-launch phases; `1.0.0` is reserved for the Version 1 production launch.

---

## [Unreleased]

Nothing yet.

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
