# Academics Page

## Purpose

The public `/academics` page — a marketing/information page explaining the school's educational philosophy and academic offering: teaching philosophy, learning stages (Nursery–Class 8), broad subject areas, methodology, co-curricular activities, assessment approach, and a closing admissions CTA. **Not** a curriculum management system, student records, examinations, or attendance. Built entirely by composing the [Marketing Section Library](../../sections/), following the same pattern as [`About`](../About/) and [`Admissions`](../Admissions/) ([D-016](../../../../../docs/DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export)).

## Structure

Same convention as `About`/`Admissions`: `content.ts` (framework-free copy), `sections.ts` (shapes copy into library component props), `page.tsx` (pure composition), `metadata.ts` (delegates to the shared `src/lib/seo.ts` helpers), `README.md`, `index.ts`. The route file `src/app/(public)/academics/page.tsx` is a one-line re-export.

## Components Reused (zero new components)

`PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `BadgeGroup`, `FeatureGrid` (×4 — Learning Stages, Teaching Methodology, Co-Curricular Activities, Why This Approach — each with different data/columns), `Callout` (×2), `CTASection`. No page-local helper was needed this time (unlike `Admissions`'s `DataTable` — nothing here is genuinely tabular).

`FeatureGrid` being reused four times on one page is deliberate, not repetition for its own sake: each grid holds a fundamentally different dataset (life stages vs. teaching principles vs. activities vs. approach highlights) — exactly the generic card-grid job the component exists for.

## Content Decisions

Per [CONTENT_GUIDELINES.md § 12–13](../../../../../docs/CONTENT_GUIDELINES.md#12-what-this-platform-never-says) and this milestone's explicit "no board-specific examination rules" / "do not fabricate a detailed curriculum" instructions:

- **Learning Stages** — exactly the four named in the task (Nursery, Kindergarten, Primary, Upper Primary through Class 8). No additional grades assumed.
- **Subjects & Learning Areas** — seven broad, near-universal category labels (Language & Literacy, Mathematics, etc.), not a grade-by-grade curriculum breakdown, and not bracketed — these are generic descriptive categories every school covers in some form, the same category of content as `About`'s Mission/Vision/Core Values (editorial voice, not a verifiable fact).
- **Co-Curricular Activities** — three generic, safe categories (Sports, Art & Craft, Music) plus one explicit bracketed placeholder for the school's actual program, with a `Callout` making clear the whole section is illustrative, not confirmed.
- **Assessment Approach** — written generically (growth-tracking vs. ranking) with **no board name, no marks-vs-grades specifics, no examination frequency stated** — a `Callout` explicitly flags that the real policy needs School Admin confirmation and that this page intentionally avoids board-specific rules, per the task's direct instruction.
- No curriculum board (CBSE/ICSE/State) is named anywhere on this page — the same unconfirmed-affiliation caution already established on `Admissions`'s Overview section.

## Accessibility Notes

Same pattern as `About`/`Admissions`: single `<h1>` (`PageHero`), sequential `<h2>`s via `SectionHeader`, `<h3>`s from `FeatureGrid` items, no skipped levels, no duplicated landmarks, zero new client components.

## Usage Example

```tsx
// src/app/(public)/academics/page.tsx
export { default, metadata } from "@/components/website/pages/Academics";
```

## Future Enhancements

- Replace the Co-Curricular Activities placeholder card and disclaimer once School Admin confirms the real program.
- Replace the Assessment Approach disclaimer once School Admin confirms the real policy.
- Add grade-specific subject detail (if ever wanted) as a separate, explicitly-scoped addition — not by expanding this page's intentionally high-level Subjects section.
