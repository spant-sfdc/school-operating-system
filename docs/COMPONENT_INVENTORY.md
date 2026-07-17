# Component Inventory

**Purpose:** The single registry of every UI component in this codebase. Its entire job is to prevent duplicate components — before building anything new, check here first. If what you need already exists, reuse it (see [AI_RULES.md](./AI_RULES.md) and [PROJECT_GUARDRAILS.md § G-10](./PROJECT_GUARDRAILS.md#1-the-core-guardrails)). If it doesn't exist, build it, then add it here in the same change.

**Status as of the Document Center Experience milestone:** Public Website Foundation components (Phase 1A), the Marketing Section Library (Phase 1B, architecture-reviewed and simplified in Phase 1B.1; 17 components after `Prose`'s and `DataTable`'s promotions, see [D-020](./DECISIONS.md#d-020--prose-promoted-from-page-local-helper-to-shared-component)/[D-023](./DECISIONS.md#d-023--datatable-promoted-from-page-local-helper-to-shared-component)), a centralized configuration layer (`src/config/`, Milestone 6A), and seven Website Pages (About, Phase 1C; Admissions, Milestone 4; Academics, Milestone 5; Campus, Milestone 6B; School Life, School Life milestone; Contact, Contact & Visit milestone; Document Center, Document Center milestone) exist — see Layout, Navigation, Typography, Website Components, Marketing Section Library, and Website Pages below. Naming conventions for anything added here: [DEVELOPMENT_CONVENTIONS.md § 1](./DEVELOPMENT_CONVENTIONS.md#1-naming-conventions).

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

| Name                                     | Purpose                                                                                                                                                                                                                                                  | Props                | Reusable                          | Dependencies                                                | Status |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | --------------------------------- | ----------------------------------------------------------- | ------ |
| `SiteHeader`                             | Sticky public-site header — transparent over hero, solid on scroll, desktop nav + utility actions                                                                                                                                                        | none                 | No (Guest — `components/website`) | `NAV_LINKS`, `LanguageSwitch`, `ThemeToggle`, `MobileNav`   | Built  |
| `MobileNav`                              | Full-screen slide-in mobile navigation panel with focus management and Escape-to-close                                                                                                                                                                   | none                 | No (Guest — `components/website`) | `NAV_LINKS`, `LanguageSwitch`, `ThemeToggle`, Framer Motion | Built  |
| `LanguageSwitch`                         | Single-language-aware language selector (English active, others marked "Soon" — no real i18n routing yet, see [DECISIONS.md § D-008](./DECISIONS.md#d-008--phase-0b1-tooling--dependency-additions))                                                     | `className?: string` | No (Guest — `components/website`) | None                                                        | Built  |
| `NAV_LINKS` (`src/config/navigation.ts`) | Single source of truth for the public nav item list, consumed by `SiteHeader`, `MobileNav`, `SiteFooter` via `FOOTER_NAV_LINKS`/`MOBILE_NAV_LINKS` aliases — see [DECISIONS.md § D-018](./DECISIONS.md#d-018--centralized-configuration-layer-srcconfig) | n/a (data module)    | No (Guest — `components/website`) | None                                                        | Built  |

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

## Marketing Section Library

Reusable, prop-driven primitives for assembling any public page (About, Academics, Admissions, Gallery, Contact…) without inventing new layout patterns. Location: `src/components/website/sections/` — see [DECISIONS.md § D-012](./DECISIONS.md#d-012--marketing-section-library-location-componentswebsitesections-not-srcfeatures), reaffirmed after independent re-review in [D-013](./DECISIONS.md#d-013--phase-1b1-architecture-review-reaffirmed-role-segmented-components-added-a-feature-subgrouping-threshold-rule). Each has its own folder with `Component.tsx`, `.types.ts`, optionally `.constants.ts`, a `README.md` (proportional to complexity — see [ARCHITECTURE.md § 6](./ARCHITECTURE.md#6-component-hierarchy)), and `index.ts`. Can be manually reviewed in a real browser anytime at the dev-only `/dev/playground` route (see [ROUTES.md § 5](./ROUTES.md#5-development-only-routes)). None are wired into any real page yet — Phase 1B built the library only, per scope.

| Name               | Purpose                                                                                                                                                                                                                      | Reusable | Client/Server                              | Dependencies                                        | Status |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------ | --------------------------------------------------- | ------ |
| `ContentContainer` | Consistent max-width/padding wrapper — every other section composes it internally                                                                                                                                            | Yes      | Server                                     | none                                                | Built  |
| `AnimatedSection`  | Scroll-reveal wrapper (fadeUp/fade/scaleIn), `prefers-reduced-motion`-aware                                                                                                                                                  | Yes      | Client (Framer Motion)                     | Framer Motion                                       | Built  |
| `SectionHeader`    | Eyebrow + title + description, left/center aligned                                                                                                                                                                           | Yes      | Server                                     | `Typography`                                        | Built  |
| `SectionDivider`   | Light/dark section separator                                                                                                                                                                                                 | Yes      | Server                                     | none                                                | Built  |
| `PageHero`         | Interior-page banner — title, subtitle, breadcrumbs, CTAs, optional background image; 4 variants                                                                                                                             | Yes      | Server                                     | `ContentContainer`, `Typography`, `next/image`      | Built  |
| `ImageText`        | Photo + title/description/CTA, image left or right, 3 variants                                                                                                                                                               | Yes      | Server                                     | `ContentContainer`, `ResponsiveImage`, `Typography` | Built  |
| `FeatureGrid`      | Responsive icon/title/description card grid (2/3/4 columns), staggered reveal                                                                                                                                                | Yes      | Server (composes client `AnimatedSection`) | `AnimatedSection`, Lucide icons                     | Built  |
| `StatisticsGrid`   | Animated count-up number grid — structure only, no fabricated data shipped (see [DECISIONS.md § D-010](./DECISIONS.md#d-010--placeholder-accent-color-for-phase-1a) sibling reasoning)                                       | Yes      | Client (Framer Motion)                     | Framer Motion                                       | Built  |
| `Timeline`         | Vertical dated milestone list, staggered reveal                                                                                                                                                                              | Yes      | Server (composes client `AnimatedSection`) | `AnimatedSection`                                   | Built  |
| `QuoteBlock`       | Single testimonial — quote, author, free-text role, optional avatar; 3 variants                                                                                                                                              | Yes      | Server                                     | `next/image`                                        | Built  |
| `CTASection`       | Closing call-to-action panel — centered or split layout                                                                                                                                                                      | Yes      | Server                                     | `ContentContainer`, `Typography`                    | Built  |
| `FAQAccordion`     | Accessible expand/collapse Q&A list, single or multi-open                                                                                                                                                                    | Yes      | Client (interactive state)                 | none                                                | Built  |
| `BadgeGroup`       | Row of labeled pills, 5 semantic-token variants                                                                                                                                                                              | Yes      | Server                                     | none                                                | Built  |
| `Callout`          | Inline info/warning/success admonition box                                                                                                                                                                                   | Yes      | Server                                     | Lucide icons                                        | Built  |
| `ResponsiveImage`  | Opinionated `next/image` wrapper — aspect ratio, blur placeholder, required `alt`                                                                                                                                            | Yes      | Server                                     | `next/image`                                        | Built  |
| `Prose`            | Minimal stacked-paragraph renderer for narrative copy — deliberately no formatting beyond that                                                                                                                               | Yes      | Server                                     | `Typography`                                        | Built  |
| `DataTable`        | Plain, accessible label/value `<table>` for static tabular facts (timings, contact details) — distinct from the future generic Admin/Teacher `Table` primitive in the [Tables](#tables) category above, still `_(none yet)_` | Yes      | Server                                     | none                                                | Built  |

---

## Website Pages

Full pages assembled from the Marketing Section Library, following the page-composite pattern in [DECISIONS.md § D-016](./DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export). Each lives at `src/components/website/pages/<Page>/`, with the `app/(public)/<page>/page.tsx` route file as a one-line re-export.

| Name             | Route          | Purpose                                                                                                                                                                                               | Components Reused                                                                                                                                                     | New Components                                                                                                                                | Status                                                                                                       |
| ---------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `About`          | `/about`       | School story, mission/vision, core values, Principal's message, journey timeline, why-parents-choose, CTA (Phase 1C)                                                                                  | `PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `FeatureGrid`, `Timeline`, `QuoteBlock`, `CTASection`                                              | None                                                                                                                                          | Built — several fields hold bracketed placeholders pending School Admin content, see its own README          |
| `Admissions`     | `/admissions`  | Admission overview, journey, eligibility, required documents, fees, FAQ, timings, enquiry CTA — no form (Milestone 4)                                                                                 | `PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `BadgeGroup`, `Timeline`, `FeatureGrid`, `DataTable` (×2), `Callout`, `FAQAccordion`, `CTASection` | None (`DataTable` promoted to the library — see [D-023](./DECISIONS.md#d-023--datatable-promoted-from-page-local-helper-to-shared-component)) | Built — several fields hold bracketed placeholders pending School Admin content, see its own README          |
| `Academics`      | `/academics`   | Teaching philosophy, learning stages, subjects, methodology, co-curricular, assessment approach, admissions CTA (Milestone 5)                                                                         | `PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `BadgeGroup`, `FeatureGrid` (×4), `Callout` (×2), `CTASection`                                     | None                                                                                                                                          | Built — several fields hold bracketed placeholders pending School Admin content, see its own README          |
| `Campus`         | `/campus`      | Safety, classrooms, library, computer learning, sports, wellbeing, gallery preview, visit CTA — narrative, not a checklist (Milestone 6B)                                                             | `PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `FeatureGrid` (×3), `Prose` (×4), `Callout`, `CTASection`                                          | None (`Prose` promoted to the library — see [D-020](./DECISIONS.md#d-020--prose-promoted-from-page-local-helper-to-shared-component))         | Built — several fields hold bracketed placeholders pending School Admin content, see its own README          |
| `SchoolLife`     | `/school-life` | Life beyond the classroom — annual events, sports, cultural activities, celebrations, achievements, gallery preview, parent testimonial, visit CTA — culture, not a checklist (School Life milestone) | `PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `Prose`, `FeatureGrid` (×4), `BadgeGroup` (×2), `QuoteBlock`, `Callout`, `CTASection`              | None (see [D-021](./DECISIONS.md#d-021--school-life-experience-ships-with-deliberate-component-variety-not-a-repeated-gallery-grid))          | Built — several fields hold bracketed placeholders pending School Admin content, see its own README          |
| `Contact`        | `/contact`     | Office information, school timings, visit guidance, map placeholder, FAQ, admission enquiry CTA, quick-reference summary — informational, no form (Contact & Visit milestone)                         | `PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `BadgeGroup` (×2), `DataTable` (×2), `Prose`, `Callout` (×2), `FAQAccordion`, `CTASection`         | None (see [D-023](./DECISIONS.md#d-023--datatable-promoted-from-page-local-helper-to-shared-component))                                       | Built — several fields hold bracketed placeholders pending School Admin content, see its own README          |
| `DocumentCenter` | `/documents`   | Admission/academic documents, mandatory public disclosures, school policies, circulars & notices explanation, FAQ, contact CTA — data-driven category loop, no form (Document Center milestone)       | `PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `FeatureGrid` (×5), `Callout` (×2 populated), `FAQAccordion`, `CTASection`                         | None                                                                                                                                          | Built — every document is an explicit bracketed placeholder pending School Admin content, see its own README |

Shared SEO logic for every page's `metadata.ts` lives in `src/lib/seo.ts` (`buildPageMetadata()`, `buildPageJsonLd()`) — see [DECISIONS.md § D-017](./DECISIONS.md#d-017--shared-libseots-helper-extracted-on-the-second-page). Shared config values (school identity, nav, SEO defaults) live in `src/config/` — see [DECISIONS.md § D-018](./DECISIONS.md#d-018--centralized-configuration-layer-srcconfig).

---

## Relationship to Other Documents

- [DEVELOPMENT_CONVENTIONS.md](./DEVELOPMENT_CONVENTIONS.md) — how to name and structure a component once you're building it.
- [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md) — how it should look and behave.
- [ARCHITECTURE.md § Component Hierarchy](./ARCHITECTURE.md#6-component-hierarchy) — where it fits (primitive vs. shared composite vs. role composite).
