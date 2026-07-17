# Campus Page

## Purpose

The public `/campus` page — tells the story of where students spend their day: safety, classrooms, library, computer learning, sports, wellbeing, and a gallery preview, closing with a visit CTA. Explicitly not a facilities checklist — narrative sections (safety, library, computer learning, wellbeing) are prose, not card grids, so the page reads as a story rather than a spec sheet. Built entirely by composing the [Marketing Section Library](../../sections/), following the same [D-016](../../../../../docs/DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export) pattern as `About`/`Admissions`/`Academics`.

## Structure

Same convention as the other page composites: `content.ts` (framework-free copy, imports `SCHOOL` from `@/config/school` — no hardcoded school data), `sections.ts` (shapes copy into `FeatureGrid` props with icons), `page.tsx` (composition), `metadata.ts` (delegates to `@/lib/seo`, which itself delegates to `@/config/seo`), `README.md`, `index.ts`. The route file `src/app/(public)/campus/page.tsx` is a one-line re-export.

## Components Reused (zero new components)

`PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `FeatureGrid` (×3 — Classrooms, Sports, Gallery Preview), `Callout`, `CTASection`, `Prose` (×4 — Safety, Library, Computer Learning, Wellbeing, the narrative sections that are intentionally prose, not grids). `Prose` started as a page-local helper here and was promoted to the shared library once `SchoolLife` needed the identical pattern — see [DECISIONS.md § D-020](../../../../../docs/DECISIONS.md#d-020--prose-promoted-from-page-local-helper-to-shared-component).

**Deliberately not a facility-by-facility `FeatureGrid` repeated nine times.** Four of the eight content sections (Safety, Library, Computer Learning, Wellbeing) use narrative prose instead — the brief explicitly said "not a facilities checklist," and turning every section into an identical card grid would have produced exactly that. `FeatureGrid` is reserved for the three sections that are genuinely a short list of distinct, parallel items (Classrooms' physical characteristics, Sports facilities, Gallery categories).

## Content Decisions

Per [CONTENT_GUIDELINES.md § 12](../../../../../docs/CONTENT_GUIDELINES.md#12-what-this-platform-never-says): no fabricated facilities. This page carries the highest fabrication risk of any page built so far — "campus" invites specific claims (exact equipment, room counts, sports facilities, library size) far more than "about" or "academics" did. The line drawn:

- **Written in full (not bracketed):** the _philosophy_ behind each space — why classrooms are designed a certain way, why the library matters, why wellbeing is treated as a first-class concern. These are values statements, not verifiable facts, the same category established for `About`'s Mission/Vision and `Academics`' Subjects.
- **Explicit bracketed placeholders:** every concrete, checkable claim — exact safety measures, digital learning aids, library collection size, computer lab hardware/software, specific sports facilities, wellbeing/counseling provisions.
- **Campus Gallery Preview ships with zero real images.** No campus photography exists yet (same reasoning `About`/`Admissions`/`Academics` already established for not using `ImageText`/`ResponsiveImage`). Rather than skip the section entirely, built it as four `FeatureGrid` cards naming the _categories_ a real gallery will eventually have (Classrooms/Library/Playground/Events), each captioned "[Photo pending]," with a `Callout` making the placeholder status explicit and a link to the (not-yet-built) `/gallery` route for the eventual full gallery.

## Navigation Change

Unlike Milestone 6A (a pure refactor with "UI should appear identical"), this is new page launch — `/campus` was added to `src/config/navigation.ts`'s `NAV_LINKS` (between Academics and Admissions) so the page is actually reachable from the header/footer/mobile nav, matching how `About`/`Academics`/`Admissions` are all in nav. This is a real, visible change, made deliberately: an unlinked page would be an orphaned route.

## Accessibility Notes

Same pattern as every other page composite: single `<h1>` (`PageHero`), sequential `<h2>`s via `SectionHeader`, `<h3>`s from `FeatureGrid` items, no skipped levels, no duplicated landmarks, zero new client components.

## Usage Example

```tsx
// src/app/(public)/campus/page.tsx
export { default, metadata } from "@/components/website/pages/Campus";
```

## Future Enhancements

- Replace every bracketed placeholder once School Admin supplies verified content.
- Replace the Gallery Preview's category cards with real `ResponsiveImage` thumbnails once campus photography exists — this is the natural place `ImageText`/`ResponsiveImage` finally get used.
- Link to `/gallery` once that route is actually built (currently 404s, expected per the established pattern for not-yet-built routes).
