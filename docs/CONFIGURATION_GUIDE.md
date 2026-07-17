# Configuration Guide

**Purpose:** A practical decision guide for where a given fact belongs — configuration, content, code, or a future database record. Written because [src/config/](../src/config/README.md) already exists and will keep growing, and every future page/feature adds new facts that need a clear, consistent home rather than an ad hoc one. Complements [PRODUCT_ARCHITECTURE.md § 14](./PRODUCT_ARCHITECTURE.md#14-explaining-the-boundaries--why-the-split-matters-practically), which explains _why_ the split matters; this document is the _how to decide_, with worked examples.

---

## The Core Question

**Does changing this fact require a code deploy, and does it apply to one tenant or every tenant?**

| If the fact...                                                                          | ...belongs in       |
| --------------------------------------------------------------------------------------- | ------------------- |
| Applies identically to every school, every user, every request                          | **Code**            |
| Differs per school, but changes rarely (deploy-required is acceptable today)            | **Configuration**   |
| Is editorial/narrative, owned by one school, tied to a specific page                    | **Content**         |
| Changes per user or per transaction at runtime (a specific student's attendance record) | **Future Database** |

## 1. What Belongs in Configuration

Facts that are true about _this deployment_ — today, one school; eventually, one tenant among several — and change infrequently enough that requiring a code change to update them is an acceptable (if not ideal) cost today.

**Examples, with their actual current home:**

- School name, short name, affiliation, classes offered, location, address, contact email/phone, Principal's name/title — `src/config/school.ts`
- Logo/favicon paths, theme mode list, the `localStorage` theme key — `src/config/branding.ts`
- Primary navigation structure — `src/config/navigation.ts`
- Contact-page-specific values (emergency phone, Google Maps URL, office/visit timings) — `src/config/contact.ts`
- Social media profile URLs — `src/config/social.ts`
- Site name, default title/description, canonical base URL, OpenGraph/Twitter defaults — `src/config/seo.ts`

**Rule of thumb:** if you're tempted to hardcode the same literal in two or more files, it almost certainly belongs in `src/config/`, not repeated. This was the entire premise of [D-018](./DECISIONS.md#d-018--centralized-configuration-layer-srcconfig) — see [src/config/README.md](../src/config/README.md) for the full file-by-file breakdown and its dependency graph.

**Explicitly not configuration:** color _values_ (`oklch(...)`). The actual, enforced source of truth for color is `src/app/globals.css`'s CSS custom properties — Tailwind reads those directly, not a JS import. `src/config/branding.ts` stores a _pointer_ to the CSS variable name, not a duplicate copy of the value, specifically to avoid a second, driftable source of truth for the same color.

## 2. What Belongs in Content

Editorial copy that's tied to a specific page's story, not a reusable fact — owned by the school telling that story, not by the platform.

**Examples, with their actual current home:**

- `About`'s founding story, mission/vision statements, core values, Principal's message, journey timeline — `src/components/website/pages/About/content.ts`
- `Admissions`' overview, eligibility rows, FAQ answers — `src/components/website/pages/Admissions/content.ts`
- `Academics`' teaching philosophy, learning stage descriptions, subject areas — `src/components/website/pages/Academics/content.ts`
- `Campus`' safety/library/wellbeing narrative paragraphs, gallery category captions — `src/components/website/pages/Campus/content.ts`

**Rule of thumb:** if the fact answers "what does _this school_ say about itself here," it's content. If it answers "what is _this school's_ name/phone/address," it's configuration — even though both are "facts about the school," content is narrative and page-scoped, configuration is a single reusable value referenced from many places.

**Content vs. configuration, worked example:** the Principal's _name_ (`SCHOOL.principal.name`) is configuration — a single fact referenced wherever the Principal is named. The Principal's _message_ to families (`ABOUT_PRINCIPAL_CONTENT.quote`) is content — a one-time piece of writing that belongs to the About page alone. `About/content.ts` already imports the former from config rather than repeating it — see [D-019](./DECISIONS.md#d-019--product-pivot-school-operating-system-sos-pant-public-school-as-first-implementation)'s audit and the original Milestone 6A refactor.

## 3. What Belongs in Code

Logic, rendering, and behavior that's true for every school, every user, every request — the actual product, not a fact about one deployment of it.

**Examples:**

- Every Marketing Section Library component (`PageHero`, `FeatureGrid`, `Timeline`, etc.) — takes props, renders identically regardless of which school's data flows through it.
- Page composition logic (`page.tsx` files) — how a page assembles its sections, not what the sections say.
- `sections.ts` files — the mapping from content shape to component prop shape (e.g., attaching a Lucide icon to a `FeatureGrid` item) is a code-level concern, not a fact about the school.
- Business rules, once they exist (how attendance percentage is calculated, how a marks-entry form validates input) — universal logic, never school-specific.
- `src/lib/` utilities (`cn()`, `buildPageMetadata()`, motion helpers) — pure, reusable code.

**Rule of thumb:** if changing it would need to happen for every tenant simultaneously (because it's a bug fix or a genuine product improvement), it's code. If two tenants could reasonably want different values, it's not.

## 4. What Belongs in a Future Database

Data that's genuinely dynamic at runtime, scoped to a specific transaction, user, or time period — not a deployment-time fact and not narrative copy. **Nothing here exists yet** — Prisma has zero models — and that's correct: this category only makes sense once there's real operational data to store, which is Epic B/C/F's job, not something to scaffold speculatively now.

**Examples (future, not yet built):**

- Student and Teacher records
- Attendance records (per student, per class, per day)
- Marks/examination results
- Admission enquiries submitted through the (not-yet-built) enquiry form
- Notices, gallery images, downloadable documents — once Admin-managed rather than static
- Once Epic H (Platform) begins: the `School`/`Tenant` record itself, and every other model's `schoolId` scoping column

**Rule of thumb:** if the fact is created or changed by a _user action_ (a teacher marking attendance, a parent submitting an enquiry, an admin uploading a notice) rather than by a _developer_ editing a file, it belongs in the database, not configuration or content — regardless of how "static" it might look at any given moment.

## 5. A Worked Classification Walkthrough

To make the boundary concrete, here's how five different new facts would be classified if they came up in a future task:

| New fact                                                                       | Classification                                                                             | Why                                                                                        |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| The school's WhatsApp Business number for admissions enquiries                 | Configuration                                                                              | One reusable value, referenced from multiple places, changes rarely                        |
| A new paragraph for the About page describing a recent school achievement      | Content                                                                                    | Page-specific narrative copy, owned by this school's story                                 |
| A "minimum age for Nursery" rule used to validate an enquiry form              | Code (the validation logic) + Configuration (the actual age value, if it varies by school) | Split — the rule application is universal logic; the specific age is a per-school fact     |
| A specific student's attendance record for today                               | Future Database                                                                            | Created by a teacher's action at runtime, scoped to one student, one day                   |
| Which optional modules (e.g., a future Fee module) are enabled for this school | Configuration (today) → Future Database (once multi-tenant, per-tenant plan/tier)          | Deploy-required feature flag today; a per-tenant setting once there's more than one tenant |

When a new fact doesn't cleanly fit one row, default to asking [PRODUCT_ARCHITECTURE.md § 14](./PRODUCT_ARCHITECTURE.md#14-explaining-the-boundaries--why-the-split-matters-practically)'s core question again rather than guessing — and if it's still ambiguous, that's a signal to flag it explicitly (per [AI_RULES.md § 3](./AI_RULES.md#3-communication-discipline)) rather than silently picking a home.
