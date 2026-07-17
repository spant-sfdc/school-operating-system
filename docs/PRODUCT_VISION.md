# Product Vision — School Operating System (SOS)

**Purpose:** This document is the top-level "why" for the project, one level above [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)'s "what's true right now." It records the product pivot from "a website for one school" to "a reusable School Operating System, built one real school at a time" — see [DECISIONS.md § D-019](./DECISIONS.md#d-019--product-pivot-school-operating-system-sos-pant-public-school-as-first-implementation). `PROJECT_CONTEXT.md` remains the single source of truth for current state; this document is the single source of truth for direction.

---

## 1. Mission

Build a calm, modern operating system for how a school actually runs day to day — admissions, attendance, marks, communication, records — that a non-technical Principal or teacher can use confidently without training, and that any independent school can adopt without a code fork.

Pant Public School is not a demo customer or a placeholder brand. It is the first real school this product serves, and every decision made for Pant Public School is a decision made about the platform, because right now they're the same decision.

## 2. Vision

Most independent schools in India run on a patchwork of WhatsApp groups, paper registers, and spreadsheets — not because better software doesn't exist, but because the software that does exist (Fedena, PowerSchool, ERPNext Education) is built for IT departments schools like this don't have. The vision is a School Operating System that a school can start using on day one without training, that grows with the school's actual needs instead of shipping every feature a "generic ERP" would, and that — once proven on one real school — can be configured for a second, a tenth, and a hundredth without rewriting it each time.

This is a long-term, earned expansion, not a launch claim. The product is Pant Public School's platform today. It becomes a platform for other schools only once the patterns proven here are genuinely reusable, not before.

## 3. Target Audience

Independent (private, unaffiliated-chain) K–8 schools in India, initially in Tier 2/3 cities, who:

- Have 200–2,000 students and a small administrative staff (often just the Principal and one or two office staff).
- Currently coordinate daily operations through WhatsApp, phone calls, and paper — not existing software.
- Cannot justify the cost, complexity, or training overhead of a traditional school ERP.
- Care about how the school presents itself to prospective families as much as how it runs internally.

This audience profile is inferred from Pant Public School's own situation, not from market research — see § 9 Success Metrics for how this assumption gets tested, not just assumed.

## 4. Primary Users

The same role model already established for Pant Public School applies to every future school, not just this one:

| Role        | Who                                     | What SOS gives them                                                     |
| ----------- | --------------------------------------- | ----------------------------------------------------------------------- |
| **Guest**   | Prospective/current parents, the public | A credible, informative public site; an admissions enquiry path         |
| **Admin**   | Principal, school office staff          | Student/teacher records, attendance oversight, exams, reports, settings |
| **Teacher** | Teaching staff                          | A fast, mobile-first way to mark attendance and enter marks             |
| **Parent**  | _(future — not in V1, see D-001)_       | Visibility into their own child's attendance, marks, notices            |
| **Student** | _(future — not in V1, see D-001)_       | Not yet scoped — deliberately undecided, see § 8                        |

Exactly which roles exist, and what each can do, is a product-scope decision, not an assumption baked into the architecture — see [PROJECT_GUARDRAILS.md § Module Approval Process](./PROJECT_GUARDRAILS.md#2-module-approval-process) for how a new role gets approved.

## 5. Core Principles

Carried forward unchanged from Pant Public School's own product principles ([PROJECT_CONTEXT.md § 9](./PROJECT_CONTEXT.md#9-design-system-summary), [PROJECT_GUARDRAILS.md](./PROJECT_GUARDRAILS.md)) — these were never school-specific to begin with, they're now explicitly platform-level:

- **Premium, not decorative.** Restraint over ornamentation, for every school, not just this one.
- **Calm software.** Minimal cognitive load — this is true for any Principal on any campus.
- **Simplicity over feature count** (G-3). A smaller set of things that work perfectly, for every tenant, beats a large configurable surface that works adequately for none.
- **Mobile-first for Teacher surfaces** (G-5). Classroom realities don't change from school to school.
- **Accessibility is required, not a phase** (G-6). Non-negotiable per school, not an opt-in tier.
- **Never become a generic ERP** (G-1). The platform pivot does not relax this guardrail — it raises the stakes on it. A configurable product that tries to be everything to every school is exactly the trap this project was founded to avoid.

## 6. Engineering Philosophy

The documentation-first, decision-recorded, minimal-diff discipline already in place ([AI_RULES.md](./AI_RULES.md), [MASTER_PROMPT.md](./MASTER_PROMPT.md)) is not incidental to the platform vision — it's the precondition for it. A codebase that can be understood by a new engineer from documentation alone, with every non-obvious choice explained in [IMPLEMENTATION_LOG.md](./IMPLEMENTATION_LOG.md) and every approved decision in [DECISIONS.md](./DECISIONS.md), is the only kind of codebase that can safely support a second tenant later without someone having to reverse-engineer a year of undocumented single-school assumptions first.

Concretely, this means:

- **Reuse over recreation** stays the default (already the standard behind [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md)) — but now reuse means "reusable across a role," not just "reusable across a page."
- **YAGNI stays load-bearing.** The project's established instinct to reject premature abstraction ([D-013](./DECISIONS.md#d-013--phase-1b1-architecture-review-reaffirmed-role-segmented-components-added-a-feature-subgrouping-threshold-rule), [D-014](./DECISIONS.md#d-014--sectiondivider-yagni-simplification)) applies with _more_ force to multi-tenancy, not less — see § 8 Future Expansion and [PRODUCT_ARCHITECTURE.md](./PRODUCT_ARCHITECTURE.md) for what that means concretely.
- **Server Components by default, minimal client JS, semantic tokens over hardcoded values** — unchanged; these were already tenant-agnostic engineering choices.

## 7. Product Philosophy

**Generalize from one real proof, not from speculation about many hypothetical schools.** Every feature built for Pant Public School is built to actually solve Pant Public School's real problem first. It becomes "platform" only by being _extracted_ once it's proven, not by being _designed generic_ up front for schools that don't exist yet as customers. This is the same discipline already visible in how the Marketing Section Library was built: 15 genuinely reusable components emerged from building real pages ([D-012](./DECISIONS.md#d-012--marketing-section-library-location-componentswebsitesections-not-srcfeatures)), not from an abstract "component library" designed before any page needed one.

Concretely: no tenant-resolution middleware, no multi-school database schema, no configurable-everything admin panel gets built until there is a second real school that needs it. Building that machinery now, against zero real second-tenant requirements, would be exactly the kind of speculative engineering [PROJECT_GUARDRAILS.md](./PROJECT_GUARDRAILS.md) and this project's YAGNI track record exist to prevent.

## 8. Configuration Strategy

Summarized here; full detail in [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md). The short version: what's true about _every_ school (how attendance percentage is calculated, how the marketing section library renders) stays in code. What's true about _this_ school but not necessarily the next one (its name, its contact details, its branding, its academic structure) lives in configuration — today as version-controlled files in `src/config/` ([D-018](./DECISIONS.md#d-018--centralized-configuration-layer-srcconfig)), tomorrow as tenant-scoped database records editable through an Admin settings panel. What's true about this school's _story_ (its About page copy, its Principal's message) is content, owned by the tenant, currently colocated with the page that renders it and eventually CMS-backed.

## 9. Future Expansion

Not commitments — directions, each requiring its own scoped decision before work begins, per [PROJECT_GUARDRAILS.md § Module Approval Process](./PROJECT_GUARDRAILS.md#2-module-approval-process):

- **Parent Portal** — read-only visibility into a child's attendance, marks, and notices. Deferred in V1 ([D-001](./DECISIONS.md#d-001--three-roles-only-for-version-1)), but likely the single highest-leverage future epic once the platform serves more than one school.
- **Student Portal** — deliberately undecided; unlike Parent, there's no existing product signal (from Pant Public School or anywhere else in this project's history) that students are meant to have direct login access. Needs its own scoping conversation, not an assumption.
- **Multi-school / multi-tenant support** — see § 7; built when a second real school needs it, not before.
- **Real Content Management System** — once page copy needs to change without a code deploy, or once there's a second tenant's copy to manage alongside the first.
- **Public/partner API layer** — for third-party integrations (payment gateways, if Fee Management is ever approved; SMS/notification providers) and a future mobile app, kept architecturally distinct from internal Route Handlers — see [PRODUCT_ARCHITECTURE.md](./PRODUCT_ARCHITECTURE.md).
- **Mobile app** — consumes the future API layer; does not reuse the Next.js component tree directly (reaffirms the reasoning already recorded in [D-013](./DECISIONS.md#d-013--phase-1b1-architecture-review-reaffirmed-role-segmented-components-added-a-feature-subgrouping-threshold-rule)).
- **Analytics** — per-school dashboards for Admin first (enrollment/attendance trends); cross-tenant platform analytics only once there's more than one tenant to compare.

## 10. Success Metrics

**Near-term (Pant Public School, the only tenant that exists today):**

- Teachers actually use attendance/marks entry in place of paper registers — adoption, not just availability.
- Admin's WhatsApp/phone-call load for routine coordination measurably decreases.
- A prospective family can learn what they need from the public site without calling the school office first.
- The public site's content readiness — tracked concretely, not impressionistically, via the [Content Readiness Framework](./onboarding/README.md) — moves from today's day-zero baseline (0 of 48 items published) toward every P0 item published, ahead of any real launch.

**Platform-readiness (before claiming "School Operating System" is more than a name):**

- A second real school could be onboarded by changing configuration and content, not by forking or rewriting code.
- The count of school-specific facts hardcoded outside `src/config/`/page `content.ts` files trends toward zero, not away from it — tracked informally via the same kind of audit performed in [PRODUCT_ARCHITECTURE.md § Architecture Review](./PRODUCT_ARCHITECTURE.md).
- Time-to-onboard a hypothetical second tenant is a number someone could actually estimate, not a complete unknown — a signal the platform framing has become concrete rather than aspirational.

These platform-readiness metrics are deliberately not committed to a date. Per § 7, they matter only once a second real school is actually in view.
