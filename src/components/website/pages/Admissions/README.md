# Admissions Page

## Purpose

The public `/admissions` page — the informational Admissions Experience a parent reads before submitting an enquiry: overview, step-by-step journey, eligibility, required documents, fee information, FAQs, and school timings, closing with a CTA. This is **not** the enquiry form itself (see Future Enhancements) — no form fields, no submission handling. Built entirely by composing the [Marketing Section Library](../../sections/), following the exact [D-016](../../../../../docs/DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export) pattern established by [`About`](../About/).

## Structure

Same convention as `About`: `content.ts` (framework-free copy), `sections.ts` (shapes copy into library component props), `page.tsx` (pure composition), `metadata.ts` (SEO), `README.md`, `index.ts`. The route file `src/app/(public)/admissions/page.tsx` is a one-line re-export.

## Components Reused

`PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `BadgeGroup`, `Timeline`, `FeatureGrid` (×2 — Required Documents and Fee Information, different data/icons), `DataTable` (×2 — Eligibility and School Timings), `Callout`, `FAQAccordion`, `CTASection`.

**`DataTable` was promoted from this page's own local helper to a shared library component once `Contact` needed the identical label/value table shape** — see [DECISIONS.md § D-023](../../../../../docs/DECISIONS.md#d-023--datatable-promoted-from-page-local-helper-to-shared-component). This page's README previously named this exact possibility in advance ("promotable... only if a second, genuinely distinct page needs the same shape") — `Contact`'s Office Information and School Timings sections are that second use.

## Shared SEO Extraction

`metadata.ts` here and in `About/metadata.ts` were duplicating the same `SITE_URL`/canonical/OpenGraph/Twitter/JSON-LD boilerplate. With a second page needing the identical pattern, extracted `src/lib/seo.ts` (`buildPageMetadata`, `buildPageJsonLd`) and refactored both pages to use it — no behavior change to `About`, verified by re-running its browser checks. See [ARCHITECTURE.md § 2](../../../../../docs/ARCHITECTURE.md#2-folder-structure).

## Content Decisions

Per [CONTENT_GUIDELINES.md § 12–13](../../../../../docs/CONTENT_GUIDELINES.md#12-what-this-platform-never-says): no fabricated policy, ages, fees, documents, or timings. Bracketed placeholders appear in:

- **Overview** — government affiliation status.
- **Eligibility** — every age criterion.
- **Required Documents** — whether/how Aadhaar is required, plus a `Callout` disclaimer that the document list itself needs confirmation against current government/board rules.
- **Fee Information** — no numbers anywhere; the section's own description carries the exact required sentence ("Official fee structure will be shared by the school administration."), and each class-group card points to the school office rather than inventing a figure.
- **FAQ** — all four answers are explicit placeholders; the questions themselves are genuine, common admissions questions, not fabricated ones.
- **School Timings** — every time value.

The Admission Journey's six steps (Enquiry → Campus Visit → Document Submission → Interaction → Confirmation → Admission) are process description, not a claimed fact about this specific school's policy, so they're written in full rather than bracketed — the same distinction drawn in `About` between "values statement" and "verifiable fact."

## Accessibility Notes

- Single `<h1>` (`PageHero`), sequential `<h2>`s via `SectionHeader`, `<h3>`s from `FeatureGrid`/`Timeline` items — no skipped levels.
- `DataTable` uses a real `<table>` with a screen-reader-only `<caption>` and `scope="row"` on each `<th>`, not a div-grid pretending to be tabular data.
- No new landmarks introduced — same reasoning as `About`: the page's real landmarks (`header`/`nav`/`main`/`footer`) are already correct.
- Zero client components introduced; `FAQAccordion` (client, from the library) is the only interactive piece, already keyboard-verified in its own README.

## Usage Example

```tsx
// src/app/(public)/admissions/page.tsx
export { default, metadata } from "@/components/website/pages/Admissions";
```

## Future Enhancements

- The actual enquiry **form** is out of scope for this page by design — the primary CTA points to `/admissions/enquiry`, a planned future route (see [ROUTES.md](../../../../../docs/ROUTES.md)).
- Replace every bracketed placeholder once School Admin supplies verified content.
