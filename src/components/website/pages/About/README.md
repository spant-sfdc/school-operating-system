# About Page

## Purpose

The public `/about` page — the school's story, mission/vision, values, Principal's message, a journey timeline, and reasons parents choose the school, closing with a CTA. Built entirely by composing the [Marketing Section Library](../../sections/) — no new section components were introduced.

## Structure

Follows the same convention as the Marketing Section Library, adapted for a page instead of a single component:

| File          | Holds                                                                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content.ts`  | Raw copy — framework-free, no component or icon imports, so it reads like data a future CMS could return                                                                                                                  |
| `sections.ts` | Maps `content.ts` into the exact prop shapes each library component expects (attaches Lucide icons, etc.)                                                                                                                 |
| `page.tsx`    | `AboutPage` — pure composition: imports library components + `sections.ts`/`content.ts`, assembles the tree                                                                                                               |
| `metadata.ts` | `aboutMetadata`/`aboutJsonLd` — page-specific title/description passed to the shared `src/lib/seo.ts` helpers (see [Admissions/README.md § Shared SEO Extraction](../Admissions/README.md#shared-seo-extraction) for why) |
| `index.ts`    | Re-exports `AboutPage` as `default` and `aboutMetadata` as `metadata`, for the route file to consume                                                                                                                      |

The actual Next.js route, `src/app/(public)/about/page.tsx`, is a one-line re-export of this module — this folder is a `components/website/` page composite (see [ARCHITECTURE.md § Component Hierarchy](../../../../../docs/ARCHITECTURE.md#6-component-hierarchy)), not route code itself.

## Components Reused (zero new components)

`PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `FeatureGrid`, `Timeline`, `QuoteBlock`, `CTASection` — all from `components/website/sections/`. `PageHero` and `CTASection` self-wrap in `ContentContainer` internally; `SectionHeader`/`FeatureGrid`/`Timeline`/`QuoteBlock` do not, so `page.tsx` wraps them explicitly — the same distinction documented in each component's own README.

`ImageText` was deliberately **not** used for "School Story," despite being the closest visual fit, because it requires a real photo and no campus photography exists yet — see Content Decisions below.

## Content Decisions

Per [CONTENT_GUIDELINES.md § 12–13](../../../../../docs/CONTENT_GUIDELINES.md#12-what-this-platform-never-says): no fabricated statistics, dates, or facts. Three places need a real, school-confirmed fact and currently hold an explicit bracketed placeholder instead of an invented one — matching the exact "replace with official school history / Principal's verified message / achievements supplied by school" pattern from the Phase 1C task brief:

- **School Story** — the founding-year/founders paragraph in `ABOUT_STORY_CONTENT.paragraphs[1]`.
- **Principal's Message** — `ABOUT_PRINCIPAL_CONTENT.quote` and `.author`.
- **Journey Timeline** — every `date`/`[Milestone]` in `ABOUT_TIMELINE_CONTENT.items`.
- **Why Parents Choose PPS** — the third item in `ABOUT_WHY_CHOOSE_CONTENT.items` (an "achievement" claim).

Mission, Vision, Core Values, and the first two "Why Parents Choose" reasons are written as genuine production copy, not bracketed — they're values/philosophy statements (the platform's editorial voice), not verifiable facts, the same category of content already shipped in Phase 1A's `Hero`/`StatStrip`.

No Open Graph image is set — no real campus photo exists yet, and referencing a placeholder path would produce a broken social-preview image, which is worse than omitting it. Tracked in [TASKS.md](../../../../../docs/TASKS.md).

## Accessibility Notes

- Single `<h1>` (from `PageHero`'s `Display`); every subsequent section heading is `<h2>` via `SectionHeader`; `FeatureGrid`/`Timeline` item titles are `<h3>` — no skipped levels, no duplicate `<h1>`.
- Content sections use bare `<section>` (not `aria-labelledby` landmarks) — deliberate: the page's real landmarks (`<header>`/`<nav>` via `SiteHeader`, `<main>` via `PublicLayout`, `<footer>` via `SiteFooter`) are already correct, and turning 6 content subsections into additional ARIA landmarks would be landmark-noise for screen-reader users navigating a single long page; heading-level navigation already covers it.
- `AboutPage` does not render its own `<main>` — `PublicLayout` already provides the page's one `<main>` landmark.
- Zero client components introduced; every interactive element (breadcrumb links, CTA links) is a plain `<Link>`, keyboard-operable by default with no custom focus management needed.

## Usage Example

```tsx
// src/app/(public)/about/page.tsx
export { default, metadata } from "@/components/website/pages/About";
```

## Future Enhancements

- Swap in `ImageText` for School Story once real campus/classroom photography exists.
- Add an Open Graph image once branding/photography is available.
- Replace every bracketed placeholder once School Admin supplies verified content.
