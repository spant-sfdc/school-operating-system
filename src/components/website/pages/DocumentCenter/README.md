# Document Center Page

## Purpose

The public `/documents` page — the location where parents and visitors find official school documents: admission forms, academic documents, mandatory public disclosures, and school policies. **Not simply a downloads list** — it's structured by category, with a Circulars & Notices section explaining what belongs on the future Notice Board instead, and closes with a CTA for when a needed document isn't available yet. Built entirely by composing the [Marketing Section Library](../../sections/), following the same [D-016](../../../../../docs/DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export) pattern as every other page composite.

## Structure

Same convention as the other page composites: `content.ts` (framework-free copy, imports `SCHOOL` from `@/config/school`), `sections.ts` (shapes copy into component props, attaches icons), `page.tsx` (composition), `metadata.ts` (delegates to `@/lib/seo` → `@/config/seo`), `README.md`, `index.ts`. The route file `src/app/(public)/documents/page.tsx` is a one-line re-export — a new directory, since `src/app/(public)/documents/` didn't exist even as a `.gitkeep` scaffold before this milestone.

## Components Reused (zero new library components)

`PageHero`, `SectionHeader`, `ContentContainer`, `SectionDivider`, `FeatureGrid` (×5 — Categories Overview, plus one per document category), `Callout` (×5 — one per category disclaimer slot, only two populated; plus the Circulars & Notices process note), `FAQAccordion`, `CTASection`.

## Stage 1 Scope Challenge

- **Can this page be composed entirely from existing Website Engine components?** Yes — every one of the brief's 9 sections maps onto `PageHero`, `SectionHeader`, `FeatureGrid`, `Callout`, `FAQAccordion`, or `CTASection`. No section needed anything else.
- **Is a new reusable component genuinely required?** No. A per-document "download card with status badge" was considered and rejected — `FeatureGrid`'s existing icon/title/description card already carries a pending-document caption exactly the way it already carries a pending-photo caption on `Campus`/`School Life`'s Gallery Previews and `Contact`'s Map Placeholder. Reusing that established pattern for documents, not photos, required no new component — only a new use of an old one.
- **Would any page-local helper reach the promotion threshold?** No page-local helper was written at all — there was nothing to promote and nothing worth threatening to promote later.

## Designed for Configuration, Not Yet Configuration-Driven

The brief asked for this page to be "generic enough to work for most Indian schools through configuration" while explicitly forbidding building the configuration engine itself. The answer taken here: `content.ts` exports `DOCUMENT_CENTER_CATEGORIES` as a single array of category objects (`{ id, eyebrow, title, description, documents, disclaimer }`), and `page.tsx` renders sections 3–6 by mapping over that array — not as four separately hand-written JSX blocks. A future fifth category (e.g., "Transport Documents," if that module is ever approved) becomes one new array entry; `page.tsx` does not need to change. This is the correct scope for "designed for configuration": the _shape_ is already config-ready (an array, not named exports per category), while the _data_ still lives in a committed TypeScript file, exactly where [CONFIGURATION_GUIDE.md § 2](../../../../../docs/CONFIGURATION_GUIDE.md#2-what-belongs-in-content) says page-specific editorial content belongs today. Migrating `DOCUMENT_CENTER_CATEGORIES` to a real config- or database-backed source is Epic B's "Website content management" milestone's job ([ROADMAP_V2.md § Epic B](../../../../../docs/ROADMAP_V2.md#epic-b--administration)), not this one's.

## Configuration Reused (no hardcoded school information)

`src/config/school.ts` (`SCHOOL.name` for the hero subtitle; `SCHOOL.affiliation` cited directly in the Mandatory Public Disclosures disclaimer, since which disclosures actually apply depends on it).

## Content Readiness Framework Integration

Every one of the 13 placeholder documents across the four categories has a corresponding entry in [docs/onboarding/DOCUMENT_REGISTRY.md](../../../../../docs/onboarding/DOCUMENT_REGISTRY.md) (`DOC-001`–`DOC-013`) — the registry that was previously empty, since no built page referenced a document before this one. Each document's own caption in `content.ts` cites its registry ID directly (`"See docs/onboarding/DOCUMENT_REGISTRY.md § DOC-00X."`), the same discipline `School Life`'s Gallery Preview and `Contact`'s Map Placeholder already established for `IMAGE_REGISTRY.md`. No filename was invented anywhere — every document is named by its generic type ("Academic Calendar," "Fee Structure"), never a fabricated file like `academic-calendar-2026.pdf`.

## Content Decisions

- **Section titles for admission/academic documents are generic, real document types**, not fabricated facts about this specific school — the same category [DOMAIN_MODEL.md](../../../../../docs/domain/DOMAIN_MODEL.md) and prior pages already established for "safe to state in full" content (a document type name is not itself a verifiable claim the way its contents are).
- **Mandatory Public Disclosures names real, well-known Indian-school disclosure categories** (affiliation/recognition certificate, society/trust registration, fire & building safety certificate, fee structure) — these are genuinely common requirements for CBSE-affiliated and state-recognized schools, not invented. Because `SCHOOL.affiliation` is itself still an unconfirmed placeholder, the section carries its own `Callout` stating plainly that which disclosures actually apply to this specific school needs confirmation — the category names are not presented as a confirmed legal requirement for this particular school.
- **No specific disclosure content, policy text, or document was invented** — every document is a named, empty slot citing its own `DOCUMENT_REGISTRY.md` ID, per the task's explicit "do not invent required disclosures... do not invent filenames" instruction.
- **Circulars & Notices explains a future capability rather than fabricating a notice** — no circular is listed or implied; the section states plainly that `/notices` doesn't exist yet and this page won't attempt to simulate it.
- **FAQ answers are bracketed placeholders; the questions themselves are genuine, generic process questions** ("what if a document isn't listed," "can everything be downloaded") — the same "real questions, placeholder answers" pattern already established on `Admissions` and `Contact`.

## Navigation

**No navigation change was needed.** `"Downloads"` (labeling the `/documents` route, per [CONTENT_GUIDELINES.md](../../../../../docs/CONTENT_GUIDELINES.md) label rationale) was already present in `src/config/navigation.ts`'s `NAV_LINKS` since Phase 1A, pointing at a route that 404'd until this page existed — the same situation `Contact` was in.

## Accessibility Notes

Same pattern as every other page composite: single `<h1>` (`PageHero`), sequential `<h2>`s via `SectionHeader`, `<h3>`s from `FeatureGrid` items, no skipped levels, no duplicated landmarks, zero new client components (`FAQAccordion` is the only interactive piece, already keyboard-verified in its own README).

## Usage Example

```tsx
// src/app/(public)/documents/page.tsx
export { default, metadata } from "@/components/website/pages/DocumentCenter";
```

## Future Enhancements

- Replace every bracketed placeholder and pending document once School Admin supplies verified content — see the Content Readiness Framework links above.
- Wire real document downloads (Cloudinary-backed, per [NFR-6](../../../../../docs/PRODUCT_REQUIREMENTS.md#9-non-functional-requirements)) once files exist.
- Migrate `DOCUMENT_CENTER_CATEGORIES` from a committed `content.ts` array to a database-backed source once Epic B's Website Content Management milestone makes that possible — the array shape was chosen specifically so this migration doesn't require restructuring `page.tsx`.
- Link the Circulars & Notices section to the real `/notices` route once it's built, replacing its current explanatory `Callout`.
