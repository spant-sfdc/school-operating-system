# Product Architecture — School Operating System (SOS)

**Purpose:** Where [ARCHITECTURE.md](./ARCHITECTURE.md) documents _how the current codebase is built_, this document documents _how the codebase is meant to evolve_ now that the product vision is a reusable platform (see [PRODUCT_VISION.md](./PRODUCT_VISION.md), [DECISIONS.md § D-019](./DECISIONS.md#d-019--product-pivot-school-operating-system-sos-pant-public-school-as-first-implementation)). `ARCHITECTURE.md` remains authoritative for what exists today; this document is authoritative for direction, and does not authorize any refactor by itself — each future change still needs its own scoped decision when its time comes.

---

## 1. Current Architecture

Restated from [ARCHITECTURE.md](./ARCHITECTURE.md), through the lens of "which parts are already tenant-agnostic vs. which are coupled to Pant Public School specifically":

- A single Next.js 15 application, single deployment, single tenant. No `Tenant`/`School` concept exists anywhere — not in the Prisma schema (which has zero models), not in routing, not in auth.
- Role-segmented component structure (`components/{ui,shared,website,admin,teacher}`) — already generic; nothing about `ui/`, `shared/`, or the role split assumes one specific school.
- The Marketing Section Library (`components/website/sections/`) and the page-composite pattern (`components/website/pages/<Page>/`) — already the most tenant-agnostic part of the codebase. See § 3.
- The configuration layer (`src/config/`) — holds Pant Public School's actual facts as hardcoded TypeScript literals. This is the primary, correctly-scoped point of tenant coupling today — see § 12.
- Admin, Teacher, Parent, Student surfaces — all unbuilt (Phase 2+). Nothing here is tenant-coupled yet because nothing here exists yet, which is a genuine advantage: these can be designed with the platform framing in view from their first line of code, rather than retrofitted.

## 2. Future Architecture

**Superseded as of 2026-07-19 — see [D-034](./DECISIONS.md#d-034--delivery-phase-roadmap-clone-per-client-model-supersedes-eventual-saas-framing-epic-reordering).** Step 4 below named an eventual multi-tenant SaaS as this platform's long-run direction. The Delivery Phase planning sprint made the actual delivery model explicit and directive instead: **one Master Repository, cloned into an independent repository per client school — never a shared multi-tenant deployment.** Steps 1–3 remain accurate (a `schoolId` column existing from the first migration is still correct, for a different reason: it's cheap, harmless, and keeps every model consistent, even though it will never scope more than one school at a time within a single deployment). Step 4 is retained below for its historical reasoning, not as current direction — see [docs/product/EPIC_ROADMAP.md](./product/EPIC_ROADMAP.md) and [docs/product/FRAMEWORK_STRATEGY.md](./product/FRAMEWORK_STRATEGY.md) for the current, authoritative plan.

The target shape, reached incrementally and only as real need proves each step (§ 7 of [PRODUCT_VISION.md](./PRODUCT_VISION.md)):

1. **Today:** one tenant, config-as-code, zero database models.
2. **Next (Epic B, when the database layer is actually built):** every Prisma model that represents school-owned data (`Student`, `Teacher`, `AttendanceRecord`, `Examination`, etc.) is designed with a `schoolId` foreign key from its first migration — cheap to include now, expensive to retrofit later. This does **not** require multi-tenancy to be _working_ yet; it only requires the column to _exist_, defaulted to the one real school.
3. **Later (Epic H, when a second real tenant is being onboarded):** `src/config/school.ts`'s static object becomes the fallback/seed for a `School` database record; a `getCurrentSchool()` server-side helper is introduced so every consumer already reads through a function instead of a static import, making the eventual swap from "always returns the one hardcoded school" to "resolves the school from the session/subdomain/request" an internal implementation change, not a call-site rewrite.
4. **Eventually:** genuine multi-tenant SaaS — subdomain or path-based tenant resolution, tenant-scoped auth, a self-service School Settings panel backed by the database instead of code, possibly a real CMS for content.

Each step is a separate future decision, not a commitment made today.

## 3. Website Engine

The Marketing Section Library + page-composite pattern together _are_ the Website Engine, and it's already the closest thing in this codebase to a genuinely reusable, tenant-agnostic product surface:

- All 15 section components (`PageHero`, `FeatureGrid`, `Timeline`, etc.) take props; none of them import or reference Pant Public School in any form. Verified directly — `grep`-ing the component source finds zero school-specific literals.
- The page-composite pattern's own `content.ts`/`sections.ts` split ([D-016](./DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export)) already separates "this page's copy" from "how the copy is composed into components" — which is exactly the seam a future CMS or a second tenant's different copy would need.
- The shared `src/lib/seo.ts` + `src/config/seo.ts` pair ([D-017](./DECISIONS.md#d-017--shared-libseots-helper-extracted-on-the-second-page), [D-018](./DECISIONS.md#d-018--centralized-configuration-layer-srcconfig)) means SEO defaults are already a single, swappable config concern, not scattered per-page constants.

**What's still tenant-coupled here:** each page's `content.ts` file _is_ Pant Public School's actual editorial voice — correctly so; that's Epic A's job for tenant #1. A second tenant would need its own `content.ts` set (or, once a CMS exists, its own database-backed copy) — not a code change to the Website Engine itself.

## 4. Administration

Unbuilt (Phase 2+). Recommendation for when it is built: every query and mutation should be written as if `schoolId` scoping already matters, even while there's only one school — the same "least privilege by role" discipline already documented in [ARCHITECTURE.md § 7](./ARCHITECTURE.md#7-security-principles) extends naturally to "least privilege by role, within a school." Concretely: a Server Action that updates a student record should filter by `schoolId` from day one (trivially satisfied by a single-row `School` table today), not "students" unscoped — the cost of doing this now is negligible; the cost of adding it after real production data exists across relationships is not.

## 5. Teacher Portal

Unbuilt (Phase 3+). [ARCHITECTURE.md § 7](./ARCHITECTURE.md#7-security-principles)'s existing principle — "Teachers can only query/mutate data scoped to their own assigned classes" — is already compatible with multi-tenancy; it just gains an outer scoping dimension (their own school, then their own assigned classes within it) rather than needing to be redesigned.

## 6. Parent Portal

Not in V1 scope ([D-001](./DECISIONS.md#d-001--three-roles-only-for-version-1)). Worth naming explicitly here because a Parent Portal is a materially bigger product asset in a multi-school platform than it would be for one school alone — every school a Parent Portal serves is a reason a parent's household relationship with the platform, not just one school, becomes possible. This is a future-epic candidate, not a current build item — see [ROADMAP_V2.md § Epic D](./ROADMAP_V2.md).

## 7. Student Portal

Not in V1 scope, and deliberately undecided beyond that — see [PRODUCT_VISION.md § 9](./PRODUCT_VISION.md#9-future-expansion). No architectural work anticipates it yet because there's no product signal yet that it should exist at all, for any school.

## 8. Shared Platform

The parts of the system that are inherently tenant-agnostic regardless of how multi-tenancy is eventually implemented, because they operate below the level of "which school":

- Auth.js session handling and the security principles in [ARCHITECTURE.md § 7](./ARCHITECTURE.md#7-security-principles).
- The design token architecture (`globals.css`'s `@theme` custom properties) and `components/ui` primitives — a color token, once real branding-per-tenant exists, becomes a _per-tenant value_ of an otherwise identical _token system_, not a per-tenant code fork.
- Dev tooling — the `/dev/playground` route ([D-015](./DECISIONS.md#d-015--permanent-devplayground-route-replaces-temporary-preview-and-delete-pattern)) demonstrates every Website Engine component with sample data already, independent of any real tenant's content.
- The documentation-as-source-of-truth discipline itself (`DECISIONS.md`, `IMPLEMENTATION_LOG.md`, `AI_RULES.md`) — this is infrastructure for the _team_, not the product, and scales to a platform without any change at all.

## 9. Configuration Layer

Today: `src/config/{school,branding,navigation,contact,social,seo}.ts` ([D-018](./DECISIONS.md#d-018--centralized-configuration-layer-srcconfig)) — version-controlled TypeScript, one value per fact, imported directly by consumers. Tomorrow: the identity-shaped subset (school name, address, contact, branding) becomes tenant-scoped database records, editable via the already-planned `/admin/settings` route ([ROUTES.md](./ROUTES.md)); the deployment-shaped subset (feature flags, which modules are enabled for a given plan/tier) plausibly stays code- or environment-level even at scale, since it changes per _release_, not per _school request_. Full boundary discussion: [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md).

## 10. Content Layer

Today: each page composite's `content.ts` — framework-free, but still a source file requiring a code change and a deploy to edit ([D-016](./DECISIONS.md#d-016--page-composite-folder-pattern-componentswebsitepagespage--thin-route-re-export)'s own README documents this explicitly for `About`/`Admissions`/`Academics`/`Campus`). Tomorrow: once either (a) a second tenant needs genuinely different copy, or (b) Pant Public School's own content needs to change often enough that a code deploy per copy edit becomes a real bottleneck — whichever comes first — this becomes a real content-management concern, most likely a lightweight headless CMS feeding the same `content.ts` shape at build or request time, not a rewrite of the page-composite pattern itself.

## 11. Future API Layer

A distinction worth stating precisely, because conflating the two is a common architecture mistake: the Route Handlers already planned under `app/api/` ([ARCHITECTURE.md § 2](./ARCHITECTURE.md#2-folder-structure)) are an **internal** API — consumed by this Next.js app's own client components, authenticated via session cookies, versioned implicitly by whatever the frontend currently expects. A genuine **external/public** API — for third-party integrations or a future mobile app — is a distinct future layer: separately authenticated (API keys or OAuth, not session cookies), explicitly versioned, and documented as a contract for consumers this codebase doesn't control. Building the internal Route Handlers now does not build the external API layer for free; they solve different problems and should not be assumed interchangeable when that day comes.

## 12. Future Mobile Layer

Consumes the future external API layer (§ 11), not the Next.js/React component tree directly — React Native (or Expo) cannot render this codebase's Server Components, and trying to share UI code across web and native is a much bigger, separately-justified architectural bet than anything implied by the platform pivot itself. This reaffirms the reasoning already recorded in [D-013](./DECISIONS.md#d-013--phase-1b1-architecture-review-reaffirmed-role-segmented-components-added-a-feature-subgrouping-threshold-rule)'s aside on mobile apps — restated here because it's now directly relevant to platform planning, not just a footnote.

## 13. Future CMS

See § 10 Content Layer. Explicitly not scoped or designed here — this document names it as a real future layer and states the condition under which it becomes worth building (a second tenant's differing content, or genuine edit-frequency pain), rather than speculatively choosing a CMS product or schema now with zero real requirement behind it.

## 14. Explaining the Boundaries — Why the Split Matters Practically

The clearest way to reason about "does this belong in config, content, code, or a future database" is _not_ an abstract architecture question — it's a practical one: **does changing this fact require a code deploy, and does it apply to one tenant or every tenant?**

| Layer           | Deploy required to change? | Scope                         | Today's home                               |
| --------------- | -------------------------- | ----------------------------- | ------------------------------------------ |
| Code            | Yes, always                | Every tenant                  | `src/components/`, `src/lib/`, `src/app/`  |
| Configuration   | Yes, today (TS files)      | One tenant per value          | `src/config/`                              |
| Content         | Yes, today (TS files)      | One tenant per page           | Each page composite's `content.ts`         |
| Future database | No                         | Scoped per tenant, per record | Doesn't exist yet — Prisma has zero models |

The practical goal of every future step in § 2 is simple to state even though it's not simple to build: move facts down this table, from "requires a deploy" toward "doesn't," only when a real need (not a hypothetical one) makes the deploy requirement an actual problem. Full worked examples: [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md).

---

## 15. Architecture Review — Does Pant Public School Still Appear Inside the Architecture?

**Yes, in exactly the places it should for a single-tenant product, and nowhere else.** Audited directly (not assumed) by searching the codebase and documentation for school-specific literals:

- **`src/config/school.ts`** — `SCHOOL.name`, `.location`, `.classes`, etc. are hardcoded literal defaults, not sourced from an environment variable, database record, or any tenant-resolution mechanism. This is the primary, correctly-scoped point of coupling — see § 2 step 3 for the recommended isolation path (a `getCurrentSchool()` seam, introduced only when a second tenant is real).
- **`package.json`'s `"name": "pant-public-school"`** — a repository/package identity, not something any runtime code reads to make a decision. Low priority; recommend renaming only when a second tenant is actually being onboarded, not now (renaming it today would be pure churn against zero present benefit).
- **Each page composite's `content.ts`** (`About`, `Admissions`, `Academics`, `Campus`) — deeply Pant-Public-School-specific narrative copy. This is **correct**, not a defect — it's Epic A's job for tenant #1, and per § 10 Content Layer, becomes a content-management concern later, not an architecture problem now.
- **`docs/PROJECT_CONTEXT.md § 1`** — the project's own "single source of truth" opened with a Pant-Public-School-specific vision statement, which is now incomplete relative to the platform framing. Given `PROJECT_CONTEXT.md`'s own stated rule ("if information here conflicts with another document, this file wins"), leaving it unedited would have made it silently override this document rather than incorporate it — so it received one small, surgical cross-link addition (not a rewrite) as part of this same change; see [D-019](./DECISIONS.md#d-019--product-pivot-school-operating-system-sos-pant-public-school-as-first-implementation).
- **`docs/ARCHITECTURE.md` itself — already clean.** Verified by direct search: zero occurrences of "Pant Public School" anywhere in the document. The High-Level Architecture diagram, folder structure, routing strategy, and component hierarchy were already written generically throughout Phases 0B.1–1B.1, before this pivot was ever named. This is worth stating plainly: the architecture was not rescued by this pivot, it was already compatible with it.

**Recommendation — how to isolate the remaining coupling over time (direction only, no refactor performed):**

1. When Epic B introduces the first Prisma models, give every school-owned table a `schoolId` column from its first migration, even though only one school exists (§ 2 step 2).
2. When a second real tenant is actually being onboarded (not before), introduce a `getCurrentSchool()` server-side helper that today just returns the static `SCHOOL` object, and migrate `src/config/school.ts`'s consumers to call it instead of importing the constant directly — a mechanical, low-risk seam, not a rewrite (§ 2 step 3).
3. At that same point, rename `package.json`'s `name` field and reconsider the repository's own name.
4. Content (`content.ts` files) does not need isolating in the same sense — it's supposed to be tenant-specific; the only future step there is a CMS, if and when § 10's condition is met.

Nothing above is authorized to happen automatically — each step still needs its own scoped decision when its moment actually arrives, per this document's own opening statement.
