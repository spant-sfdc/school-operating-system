# School Onboarding Checklist

**Purpose:** The practical, phase-by-phase checklist for bringing a school onto the platform — written generically enough to reuse for a second school, with Pant Public School's own status filled in as the worked example. See [PRODUCT_VISION.md § 7](../PRODUCT_VISION.md#7-product-philosophy): this checklist exists _because_ Pant Public School went through it, not as a plan written before any school had.

**Relationship to [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md):** this document covers the whole onboarding lifecycle, including work that happens well before launch is even in view (Before Development). `GO_LIVE_CHECKLIST.md` is the narrower, final gate — everything in "Before Launch" here is a superset of what that document checks in detail.

---

## Phase 1 — Before Development

What must be true before building any page for this school.

- [x] Product scope confirmed — which of Guest/Admin/Teacher (and future Parent/Student) roles apply ([D-001](../DECISIONS.md#d-001--three-roles-only-for-version-1))
- [x] Design system exists and is reusable (Marketing Section Library, page-composite pattern) — true for every school once built for the first one
- [x] Basic identity known: school name, location — enough to start building pages with honest placeholders elsewhere
- [ ] Brand identity provided (logo, color palette) — **Pant Public School: not yet provided**, placeholder accent color in use ([D-010](../DECISIONS.md#d-010--placeholder-accent-color-for-phase-1a))
- [x] `src/config/` populated with known facts, explicit brackets for unknown ones ([D-018](../DECISIONS.md#d-018--centralized-configuration-layer-srcconfig))

**Pant Public School status:** Complete enough to have proceeded — this is exactly what happened; pages were built with honest placeholders rather than waiting for 100% of Phase 1 information.

## Phase 2 — Before QA

What must be true before a page is considered "built" and ready for review.

- [x] Page composed entirely from the Marketing Section Library, or a clearly justified minimal page-local helper (see each page's own README, e.g. [Campus's `Prose` helper](../../src/components/website/pages/Campus/README.md))
- [x] Zero hardcoded school data in components — everything routed through `src/config/` or the page's own `content.ts`
- [x] No fabricated facts — every unconfirmed claim is an explicit bracketed placeholder, not a plausible guess ([CONTENT_GUIDELINES.md § 12](../CONTENT_GUIDELINES.md#12-what-this-platform-never-says))
- [x] Manual browser verification: correct heading hierarchy, zero console errors, responsive at desktop/tablet/mobile (every page's own [IMPLEMENTATION_LOG.md](../IMPLEMENTATION_LOG.md) entry)
- [x] Documentation updated in the same change (`COMPONENT_INVENTORY.md`, `CHANGELOG.md`, etc.)

**Pant Public School status:** All 4 built pages (`About`, `Admissions`, `Academics`, `Campus`) pass every item above — see [CONTENT_DASHBOARD.md § Structural Completeness](./CONTENT_DASHBOARD.md#structural-completeness-a-different-better-news-metric).

## Phase 3 — Before Launch

What must be true before the site goes live for real visitors. Full detail: [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md).

- [ ] Every **P0** item in [CONTENT_DASHBOARD.md](./CONTENT_DASHBOARD.md) at status **Published** — **Pant Public School: 0 of 16 P0 items published today (day-zero baseline)**
- [ ] Every Process Note `Callout` removed from every page (they're visible today by design, but must not ship)
- [ ] Favicon replaced with real branding (`IMG-001`)
- [ ] Domain/hosting decided; `NEXT_PUBLIC_APP_URL` set to the real production URL, not `localhost`
- [ ] A final `grep -r "\[Placeholder\|\[Time\]\|\[Year\]" src/` across the whole `src/` tree returns zero matches

**Pant Public School status:** Not started — this phase begins once content collection (Phase 4 below) is underway.

## Phase 4 — Content Collection (runs alongside Phase 3)

- [ ] [CONTENT_COLLECTION_GUIDE.md](./CONTENT_COLLECTION_GUIDE.md) shared with school staff
- [ ] Every item in [TEXT_REGISTRY.md](./TEXT_REGISTRY.md) and [IMAGE_REGISTRY.md](./IMAGE_REGISTRY.md) moved from Required → Requested (an explicit ask has gone to School Admin)
- [ ] Received items reviewed and moved to Approved
- [ ] Approved images optimized (correct aspect ratio/compression) before being wired into `ResponsiveImage`/`ImageText`
- [ ] Approved text merged into each page's `content.ts`, replacing the bracketed placeholder exactly, not adding alongside it

**Pant Public School status:** Not started — see [CONTENT_DASHBOARD.md](./CONTENT_DASHBOARD.md) for the full 48-item baseline this phase works through.

## Phase 5 — After Launch

What happens once the site is live.

- [ ] Monitor for any remaining latent placeholders becoming active as new pages/features ship (e.g., `/contact` activating `TXT-002`–`TXT-004`, `TXT-008`–`TXT-010`)
- [ ] Periodically re-run the derivation this framework was built from (grep every page's `content.ts` for `[...]`) to confirm the registries stay accurate as pages change — an unmaintained registry is worse than no registry, the same risk already flagged for `COMPONENT_INVENTORY.md`/`ROUTES.md` in [IMPLEMENTATION_LOG.md § Phase 0A.1](../IMPLEMENTATION_LOG.md#2026-07-17--phase-0a1-documentation-consolidation--ai-operating-system)
- [ ] Collect real feedback from School Admin/Teachers on whether the published content and photography actually represent the school well — content readiness is not the same as content _quality_, and this framework only measures the former

---

## Reusing This Checklist for a Future School

Per [PRODUCT_VISION.md § 7](../PRODUCT_VISION.md#7-product-philosophy) and [PRODUCT_ARCHITECTURE.md § 15](../PRODUCT_ARCHITECTURE.md#15-architecture-review--does-pant-public-school-still-appear-inside-the-architecture): this checklist's phases (Before Development / Before QA / Before Launch / After Launch) don't name Pant Public School anywhere in their structure — only the "status" notes under each phase do, because that's the actual, current, honest state. A second school would work through the exact same five phases, with its own registries generated the same way (grep its own `content.ts` files, don't invent), and its own dashboard numbers. The process generalizes today; only the numbers are tenant-specific.
