# Component Inventory

**Purpose:** The single registry of every UI component in this codebase. Its entire job is to prevent duplicate components — before building anything new, check here first. If what you need already exists, reuse it (see [AI_RULES.md](./AI_RULES.md) and [PROJECT_GUARDRAILS.md § G-10](./PROJECT_GUARDRAILS.md#1-the-core-guardrails)). If it doesn't exist, build it, then add it here in the same change.

**Status as of Phase 1A:** Public Website Foundation components exist — see Layout, Navigation, Typography, and Website Components below. Naming conventions for anything added here: [DEVELOPMENT_CONVENTIONS.md § 1](./DEVELOPMENT_CONVENTIONS.md#1-naming-conventions).

---

## How to Add an Entry

Every component gets one row, added in the same change that introduces the component:

| Field            | Meaning                                                                        |
| ---------------- | ------------------------------------------------------------------------------ |
| **Name**         | Component name, matching the filename                                          |
| **Purpose**      | One sentence — what job it does                                                |
| **Props**        | Key props only (link to the type definition, don't restate the full interface) |
| **Reusable**     | Yes (cross-role/shared) / No (role- or feature-specific by design)             |
| **Dependencies** | Shadcn primitives or other internal components it's built from                 |
| **Status**       | Planned / In Progress / Built / Deprecated                                     |

Do not create a second component that does the same job under a different name — extend or reuse the existing entry instead.

---

## Layout

| Name                                       | Purpose                                                                         | Props                       | Reusable                    | Dependencies               | Status |
| ------------------------------------------ | ------------------------------------------------------------------------------- | --------------------------- | --------------------------- | -------------------------- | ------ |
| `PublicLayout` (`app/(public)/layout.tsx`) | Composes `SiteHeader` + `<main>` + `SiteFooter` around every public route       | `children: React.ReactNode` | No (Guest route group only) | `SiteHeader`, `SiteFooter` | Built  |
| `ThemeProvider` (`components/shared`)      | React Context providing `theme`/`setTheme`/`toggleTheme`; wraps the root layout | `children: React.ReactNode` | Yes (all roles)             | None                       | Built  |

## Navigation

| Name             | Purpose                                                                                                                                                                                              | Props                | Reusable                          | Dependencies                                                | Status |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | --------------------------------- | ----------------------------------------------------------- | ------ |
| `SiteHeader`     | Sticky public-site header — transparent over hero, solid on scroll, desktop nav + utility actions                                                                                                    | none                 | No (Guest — `components/website`) | `NAV_LINKS`, `LanguageSwitch`, `ThemeToggle`, `MobileNav`   | Built  |
| `MobileNav`      | Full-screen slide-in mobile navigation panel with focus management and Escape-to-close                                                                                                               | none                 | No (Guest — `components/website`) | `NAV_LINKS`, `LanguageSwitch`, `ThemeToggle`, Framer Motion | Built  |
| `LanguageSwitch` | Single-language-aware language selector (English active, others marked "Soon" — no real i18n routing yet, see [DECISIONS.md § D-008](./DECISIONS.md#d-008--phase-0b1-tooling--dependency-additions)) | `className?: string` | No (Guest — `components/website`) | None                                                        | Built  |
| `nav-links.ts`   | Single source of truth for the public nav item list, consumed by `SiteHeader`, `MobileNav`, `SiteFooter`                                                                                             | n/a (data module)    | No (Guest — `components/website`) | None                                                        | Built  |

## Buttons

| Name          | Purpose                                                        | Props                | Reusable                              | Dependencies    | Status |
| ------------- | -------------------------------------------------------------- | -------------------- | ------------------------------------- | --------------- | ------ |
| `ThemeToggle` | Icon button toggling light/dark theme (sun/moon, Lucide icons) | `className?: string` | Yes (all roles — `components/shared`) | `useTheme` hook | Built  |

_(Shadcn `Button` primitive itself not yet added — no composed variant needed beyond the custom pill-style CTAs in the public site so far; add it here the moment it's introduced.)_

## Forms

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Cards

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Tables

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Dialogs

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Drawers

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Charts

| Name                                                                                                                  | Purpose | Props | Reusable | Dependencies | Status  |
| --------------------------------------------------------------------------------------------------------------------- | ------- | ----- | -------- | ------------ | ------- |
| _(none yet — no chart library selected; requires a recorded decision before use, see [DECISIONS.md](./DECISIONS.md))_ |         |       |          |              | Planned |

## Empty States

| Name                                                                                                         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------------------------------------------------------------------------------------------------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet — required pattern defined in [UI_DESIGN_SYSTEM.md § 11](./UI_DESIGN_SYSTEM.md#11-empty-states))_ |         |       |          |              | Planned |

## Loading States

| Name                                                                                                                      | Purpose | Props | Reusable | Dependencies | Status  |
| ------------------------------------------------------------------------------------------------------------------------- | ------- | ----- | -------- | ------------ | ------- |
| _(none yet — skeleton pattern defined in [UI_DESIGN_SYSTEM.md § 12](./UI_DESIGN_SYSTEM.md#12-loading-states--skeletons))_ |         |       |          |              | Planned |

## Typography

| Name      | Purpose                                                      | Props                                              | Reusable | Dependencies | Status |
| --------- | ------------------------------------------------------------ | -------------------------------------------------- | -------- | ------------ | ------ |
| `Display` | Hero-scale headline (h1), responsive `text-5xl` → `text-7xl` | `children`, `className?`                           | Yes      | None         | Built  |
| `Heading` | h1–h3 hierarchy via `level` prop (defaults to h2)            | `children`, `level?: 1\|2\|3`, `as?`, `className?` | Yes      | None         | Built  |
| `Text`    | Body copy variants: `body` / `lead` / `small` / `muted`      | `children`, `variant?`, `as?`, `className?`        | Yes      | None         | Built  |
| `Caption` | Small uppercase eyebrow/label text                           | `children`, `className?`                           | Yes      | None         | Built  |
| `Code`    | Inline code snippet styling                                  | `children`, `className?`                           | Yes      | None         | Built  |

## Icons

| Name                                                                                                                                                      | Purpose | Props | Reusable | Dependencies | Status  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----- | -------- | ------------ | ------- |
| _(none yet — Lucide Icons used directly per [UI_DESIGN_SYSTEM.md § 9](./UI_DESIGN_SYSTEM.md#9-icons); no custom icon wrapper unless a real need emerges)_ |         |       |          |              | Planned |

## Teacher Components

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Admin Components

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Website Components

| Name                                          | Purpose                                                                                                                                                         | Props | Reusable                    | Dependencies                                                  | Status |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | --------------------------- | ------------------------------------------------------------- | ------ |
| `SiteHeader`                                  | See Navigation above                                                                                                                                            | —     | No                          | —                                                             | Built  |
| `SiteFooter`                                  | Public-site footer — school info, quick links, contact, admissions CTA, social placeholders, copyright                                                          | none  | No                          | `NAV_LINKS`, Lucide icons                                     | Built  |
| `Hero`                                        | Homepage hero — headline, supporting text, CTAs, animated background, stat strip; the only homepage content section per Phase 1A scope                          | none  | No                          | `AnimatedBackground`, `StatStrip`, `Typography`, `lib/motion` | Built  |
| `AnimatedBackground`                          | Slow-drifting blurred gradient blobs behind the hero; respects `prefers-reduced-motion`                                                                         | none  | Yes (any marketing section) | Framer Motion                                                 | Built  |
| `StatStrip`                                   | Four-item highlight strip (qualitative, not fabricated statistics — see [CONTENT_GUIDELINES.md § 12](./CONTENT_GUIDELINES.md#12-what-this-platform-never-says)) | none  | Yes (any marketing section) | Lucide icons                                                  | Built  |
| `MobileNav`, `LanguageSwitch`, `nav-links.ts` | See Navigation above                                                                                                                                            | —     | No                          | —                                                             | Built  |

---

## Relationship to Other Documents

- [DEVELOPMENT_CONVENTIONS.md](./DEVELOPMENT_CONVENTIONS.md) — how to name and structure a component once you're building it.
- [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md) — how it should look and behave.
- [ARCHITECTURE.md § Component Hierarchy](./ARCHITECTURE.md#6-component-hierarchy) — where it fits (primitive vs. shared composite vs. role composite).
