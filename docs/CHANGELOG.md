# Changelog

All notable changes to the Pant Public School Digital Platform are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Version numbers follow `0.x.y` during pre-launch phases; `1.0.0` is reserved for the Version 1 production launch.

---

## [Unreleased]

Nothing yet.

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
