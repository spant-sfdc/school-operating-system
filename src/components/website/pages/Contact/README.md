# Contact Page

## Purpose

The public `/contact` page — helps a parent reach the school and, where relevant, points them toward starting an admission enquiry rather than waiting on a callback. **Not a contact form.** No submission fields, no server action — this page is informational (office details, timings, visit guidance, FAQ) and forwards admission-related contact to `/admissions/enquiry`, the same "informational page, form lives elsewhere" split already established by `Admissions` itself. Built entirely by composing the [Marketing Section Library](../../sections/), following the same [D-016](../../../../../docs/DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export) pattern as every other page composite.

## Structure

Same convention as the other page composites: `content.ts` (framework-free copy, imports `SCHOOL` from `@/config/school` and `CONTACT` from `@/config/contact`), `sections.ts` (shapes copy into component props), `page.tsx` (composition), `metadata.ts` (delegates to `@/lib/seo` → `@/config/seo`), `README.md`, `index.ts`. The route file `src/app/(public)/contact/page.tsx` is a one-line re-export, replacing the `.gitkeep` scaffolded there since Phase 0B.1.

## Components Reused (zero new library components required — one promoted)

`PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `BadgeGroup` (×2 — Contact Overview, Contact Summary), `DataTable` (×2 — Office Information, School Timings), `Prose` (×1 — Visit the Campus), `Callout` (×2 — Map Placeholder disclaimer, social-channels note), `FAQAccordion`, `CTASection`.

**`DataTable` was promoted from `Admissions`'s page-local helper to a shared library component as part of this page** — see [DECISIONS.md § D-023](../../../../../docs/DECISIONS.md#d-023--datatable-promoted-from-page-local-helper-to-shared-component). `Admissions`'s own README already named this exact trigger in advance ("promotable... only if a second, genuinely distinct page needs the same shape") — Office Information and School Timings are that second, genuinely distinct need.

## Stage 1 Scope Challenge

Before writing any file, checked whether this page needed anything beyond the existing Website Engine: it did not, beyond the `DataTable` promotion above. Every one of the brief's 9 sections maps directly onto an existing component:

| Section                    | Component                                  | Why not something new                                                                                                                                   |
| -------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page Hero                  | `PageHero`                                 | Identical shape to every other page's hero                                                                                                              |
| Contact Overview           | `SectionHeader` + `BadgeGroup`             | Two quick facts (location, classes), not a card grid                                                                                                    |
| Office Information         | `DataTable`                                | Genuinely tabular label/value data, same shape as Admissions' Eligibility table                                                                         |
| School Timings             | `DataTable`                                | Same shape again — the second use that triggered promotion                                                                                              |
| Visit the Campus           | `Prose`                                    | Narrative encouragement, not parallel items                                                                                                             |
| Map Placeholder            | `Callout`                                  | A disclaimer, not a photo grid — no `ImageText`/`ResponsiveImage`, since there is no real image `src` to pass and inventing one is explicitly forbidden |
| Frequently Asked Questions | `FAQAccordion`                             | Identical shape to Admissions' FAQ                                                                                                                      |
| Admission Enquiry CTA      | `CTASection`                               | Identical shape to every other page's closing CTA                                                                                                       |
| Contact Summary            | `SectionHeader` + `BadgeGroup` + `Callout` | A compact recap, not new content — reuses the same primitives as Contact Overview                                                                       |

No section justified a new component. `Map Placeholder`'s "no embedded map" instruction ruled out `ImageText`/`ResponsiveImage` (both require a real `image.src`, which doesn't exist yet) — a `Callout`, the same primitive already used for every other page's "before this goes live" disclaimers, is the correct, honest way to represent a pending asset without embedding anything.

## Configuration Reused (no hardcoded values)

`src/config/school.ts` (`SCHOOL.name`, `.locationShort`, `.classes`), `src/config/contact.ts` (`CONTACT.address`, `.phone`, `.email`, `.emergencyPhone`, `.timings.officeHours`, `.timings.visitHours`, `.googleMapsUrl`), `src/config/social.ts` (`SOCIAL_LINKS` — checked to confirm all values are still `null`, which is what drives the Contact Summary's social-channels note; see Content Decisions below).

## Content Readiness Framework Integration

This page makes six previously-**Latent** `TEXT_REGISTRY.md` items (`TXT-002`, `TXT-003`, `TXT-004`, `TXT-008`, `TXT-009`, `TXT-010`) **Active** for the first time — they were defined in `src/config/contact.ts`/`school.ts` since Milestone 6A but had no consuming page until now. Their registry rows were updated in place (Page column, Active status, priority reassessed given real visibility) rather than duplicated as new IDs. Genuinely new requirements introduced by this page — `TXT-059` (Google Maps URL, still Latent — no map link is rendered yet), `TXT-060` (Map Placeholder disclaimer, Process Note), `TXT-061`–`TXT-064` (FAQ answers), `TXT-065` (social-channels note, Process Note), and `IMG-013` (location map/photo) — are new rows. See [docs/onboarding/TEXT_REGISTRY.md](../../../../../docs/onboarding/TEXT_REGISTRY.md) and [docs/onboarding/IMAGE_REGISTRY.md](../../../../../docs/onboarding/IMAGE_REGISTRY.md).

## Content Decisions

- **No contact detail, coordinate, map, office timing, or testimonial was invented** — every fact on this page is read directly from `src/config/{school,contact}.ts`, all of which remain bracketed placeholders today. This page does not know or claim anything `src/config/` doesn't already state.
- **The Map Placeholder section deliberately does not embed a map.** Per the task's explicit instruction, it is a single `Callout` citing `IMAGE_REGISTRY.md § IMG-013` and noting `CONTACT.googleMapsUrl` is currently `null` — a future task can wire an actual map/link once both a real URL and a location image exist; this page does not speculate about what that will look like.
- **Contact Overview's badges (location, classes offered) are the only genuinely "real, not bracketed" facts on the page** — both are already-confirmed `SCHOOL` config values used elsewhere (Hero, Footer), not new claims.
- **Visit the Campus's copy is editorial voice, not a verifiable fact** — the same "safe to write in full" category already established for `About`'s Mission/Vision and `Campus`'s safety philosophy paragraph, since it doesn't assert any specific unconfirmed detail beyond what `Timings`/`Office Information` already state.
- **The Contact Summary's social-channels note is a Process Note, not content to collect** — it states a true, current fact about the implementation (`SOCIAL_LINKS` are all `null`, per `src/config/social.ts`), not something School Admin writes; Engineering removes it once at least one social URL is confirmed and `SiteFooter`'s icons go live, matching the existing Process Note pattern used elsewhere.
- **No admission-enquiry form was built on this page.** The brief's 9 sections list "Admission Enquiry CTA," not a form — this page forwards to the already-planned `/admissions/enquiry` route, consistent with `Admissions`' own "informational, no form" scope.

## Navigation

**No navigation change was needed.** Unlike `Campus` and `School Life` (both added to `NAV_LINKS` when built, since neither existed in the original Phase 1A nav list), `"Contact"` was already present in `src/config/navigation.ts`'s `NAV_LINKS` from Phase 1A onward, pointing at a route that 404'd until this page existed. Building this page makes an already-linked nav item resolve correctly — not a new, visible navigation change.

## Accessibility Notes

Same pattern as every other page composite: single `<h1>` (`PageHero`), sequential `<h2>`s via `SectionHeader`, no skipped levels, no duplicated landmarks, zero new client components (`FAQAccordion` is the only interactive piece, already keyboard-verified in its own README). `DataTable` uses a real `<table>` with a screen-reader-only `<caption>` and `scope="row"` headers, per its own README.

## Usage Example

```tsx
// src/app/(public)/contact/page.tsx
export { default, metadata } from "@/components/website/pages/Contact";
```

## Future Enhancements

- Replace every bracketed placeholder once School Admin supplies verified content — see the Content Readiness Framework links above.
- Wire an actual map or "Get Directions" link once `CONTACT.googleMapsUrl` and `IMG-013` are both confirmed.
- Wire `Contact Summary`'s social note away once at least one `SOCIAL_LINKS` value is confirmed (tracked in `src/config/social.ts` and `SiteFooter`'s own notes).
- Build the actual admission enquiry **form** at `/admissions/enquiry` — out of scope for this page by design, same as `Admissions` itself.
