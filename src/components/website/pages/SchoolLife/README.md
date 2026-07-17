# School Life Page

## Purpose

The public `/school-life` page — communicates school culture, not a photo dump. Annual events, sports & competitions, cultural activities, celebrations, and student achievements, with a gallery preview positioned deliberately as _supporting evidence_ (section 8 of 10) rather than the page's centerpiece, closing with a parent testimonial placeholder and a visit/admissions CTA. Built entirely by composing the [Marketing Section Library](../../sections/), following the same [D-016](../../../../../docs/DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export) pattern as `About`/`Admissions`/`Academics`/`Campus`.

## Structure

Same convention as the other page composites: `content.ts` (framework-free copy, imports `SCHOOL` from `@/config/school`), `sections.ts` (shapes copy into component props with icons), `page.tsx` (composition), `metadata.ts` (delegates to `@/lib/seo` → `@/config/seo`), `README.md`, `index.ts`. The route file `src/app/(public)/school-life/page.tsx` is a one-line re-export.

## Components Reused (zero new library components required — one promoted)

`PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `Prose` (×1 — Life Beyond Classrooms), `FeatureGrid` (×4 — Annual Events, Cultural Activities, Achievements, Gallery Preview), `BadgeGroup` (×2 — Sports & Competitions, Celebrations), `QuoteBlock` (×1 — Parent Testimonial), `Callout`, `CTASection`.

**`Prose` was promoted from `Campus`'s page-local helper to a shared library component as part of this page** — see [DECISIONS.md § D-020](../../../../../docs/DECISIONS.md#d-020--prose-promoted-from-page-local-helper-to-shared-component). This is the correct, rule-following answer to "is a new component genuinely required": not a _new_ component, but the _second real use_ of an existing pattern crossing the threshold this codebase already established for promoting page-local helpers ([DEVELOPMENT_CONVENTIONS.md § 2](../../../../../docs/DEVELOPMENT_CONVENTIONS.md#2-directory-organization)) — the same reasoning that governs when a component moves to `components/shared`.

**Deliberate component variety, not five identical `FeatureGrid` sections in a row.** Sports & Competitions and Celebrations use `BadgeGroup` instead of `FeatureGrid` — both are genuinely list-of-names content (a badge fits better than a card needing a full description each), and it breaks up what would otherwise be five consecutive card grids, which is exactly the "traditional gallery"/checklist feel this page was explicitly told to avoid.

## Content Readiness Framework Integration

Every placeholder on this page has a corresponding entry in [docs/onboarding/TEXT_REGISTRY.md § School Life](../../../../../docs/onboarding/TEXT_REGISTRY.md) and, for the Gallery Preview, [docs/onboarding/IMAGE_REGISTRY.md](../../../../../docs/onboarding/IMAGE_REGISTRY.md) `IMG-009` through `IMG-012` — the Gallery Preview's own captions cite these IDs directly in `content.ts`, not just in the registry. No asset or fact on this page was invented; every claim requiring confirmation (specific events, sports, cultural offerings, celebrations, achievements, and the testimonial) is bracketed.

## Content Decisions

- **Section 2 (Life Beyond Classrooms) is real, published copy, not bracketed** — a values/philosophy statement, the same category already established for `About`'s Mission/Vision and `Academics`' Subjects: true regardless of which specific events/sports/activities this school runs.
- **Sections 3–7 are explicit placeholders, per the task brief's own instruction** ("Placeholder content" for Events/Sports/Cultural/Celebrations, "Use placeholders only. Never invent achievements" for Achievements) — unlike `Academics`' Subjects & Learning Areas (safe because near-universal to any school's curriculum), _specific_ sports offered, _specific_ cultural programs, and _specific_ celebrations genuinely vary school to school and are treated as unconfirmed facts, not generalized philosophy.
- **Student Achievements holds three placeholder slots, all explicitly instructed not to be invented** — no result, ranking, or recognition is stated; each card is a clearly bracketed slot for School Admin to fill with something real and verifiable.
- **Parent Testimonial is an explicit placeholder, not a paraphrase of anything anyone said** — the placeholder text itself states this, so a future reader (or a careless copy-paste) can't mistake it for a real quote that just needs light editing.
- **Gallery Preview follows `Campus`'s established pattern exactly** — four category cards, "[Photo pending]" captions, a `Callout` disclaimer, a link to the not-yet-built `/gallery` route — with the added step of citing the specific `IMAGE_REGISTRY.md` IDs each category corresponds to.

## Navigation Change

`/school-life` was added to `src/config/navigation.ts`'s `NAV_LINKS`, between Campus and Admissions — a real, visible, deliberate change (this is a new page launch, not a refactor), matching the precedent already set when `Campus` was added.

## Accessibility Notes

Same pattern as every other page composite: single `<h1>` (`PageHero`), sequential `<h2>`s via `SectionHeader`, `<h3>`s from `FeatureGrid`/`QuoteBlock`-adjacent items, no skipped levels, no duplicated landmarks, zero new client components.

## Usage Example

```tsx
// src/app/(public)/school-life/page.tsx
export { default, metadata } from "@/components/website/pages/SchoolLife";
```

## Future Enhancements

- Replace every bracketed placeholder once School Admin supplies verified content — see the Content Readiness Framework links above.
- Replace the Gallery Preview's category cards with real `ResponsiveImage` thumbnails once `IMG-009`–`IMG-012` are approved.
- Replace the Parent Testimonial placeholder with a real, approved quote — do not remove the section, replace its content.
