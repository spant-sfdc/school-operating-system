# Delivery Phase Planning

**Purpose:** [docs/domain/](../domain/README.md) answered "what does a school consist of." [docs/database/](../database/README.md) answered "how should that be built physically." This folder answers the next question, one level up from either: **"how does TechPulse actually turn a working codebase into a school running on it — and the next school after that, and the one after that."** Same discipline as both prior reviews: this is a **planning sprint, not an implementation** — no code was written, no database was touched, nothing here was committed automatically as part of producing it.

## 1. Why This Planning Sprint Exists, and Why Now

The Foundation Phase (Sprints 0–5 — Website Engine, Identity, Academic, Student, Teacher, and Attendance foundations) is complete and applied to a live database. Every prior planning document ([ROADMAP_V2.md](../ROADMAP_V2.md), [PRODUCT_ARCHITECTURE.md](../PRODUCT_ARCHITECTURE.md)) organized work under a framing that still named an eventual multi-tenant SaaS as the long-run direction. This planning sprint replaces that framing with the actual, explicit delivery model: **one repository per school, cloned from a shared master, never a shared multi-tenant deployment** — see [DECISIONS.md § D-034](../DECISIONS.md#d-034--delivery-phase-roadmap-clone-per-client-model-supersedes-eventual-saas-framing-epic-reordering) for the full recorded reasoning and what it supersedes.

## 2. What This Is Not

- **Not a build authorization.** No Epic below is implemented by this document set existing — each still needs its own scoped implementation task, following [MASTER_PROMPT.md](../MASTER_PROMPT.md).
- **Not a re-litigation of the domain or database model.** Every entity, migration, and business rule already decided in [docs/domain/](../domain/README.md) and [docs/database/](../database/README.md) is treated as settled input.
- **Not a redesign toward multi-tenancy.** The opposite, in fact — this planning sprint exists specifically to rule that direction out for the foreseeable future and design toward the clone-per-client model instead.

## 3. Document Map

Read in this order:

| Document                                                                         | Answers                                                                                                           |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [EPIC_ROADMAP.md](./EPIC_ROADMAP.md)                                             | The full Epic sequence for the Delivery Phase, challenged and reordered, with dependencies and readiness criteria |
| [ADMINISTRATION_STRATEGY.md](./ADMINISTRATION_STRATEGY.md)                       | User, password, and role lifecycle — provisioning, activation, reset, deactivation, bootstrap admin               |
| [IMPORT_ENGINE_STRATEGY.md](./IMPORT_ENGINE_STRATEGY.md)                         | The reusable Data Migration Engine design, plus the Rajasthan RTE integration research findings                   |
| [CLIENT_IMPLEMENTATION_PLAYBOOK.md](./CLIENT_IMPLEMENTATION_PLAYBOOK.md)         | The corrected, step-by-step sequence for taking one new client from engagement to go-live                         |
| [CLIENT_CUSTOMIZATION_GUIDE.md](./CLIENT_CUSTOMIZATION_GUIDE.md)                 | The literal checklist for what a new client repository must change, and what should never need to                 |
| [FRAMEWORK_STRATEGY.md](./FRAMEWORK_STRATEGY.md)                                 | What belongs in the Master Repository vs. only in a client repo, and how updates actually reach a client          |
| [VERSIONING_STRATEGY.md](./VERSIONING_STRATEGY.md)                               | How version numbers work across one Master Repository and many independent client repos                           |
| [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md)                                   | The broader client-deployment go-live gate — infrastructure, data, administration, training                       |
| [ONBOARDING_CERTIFICATION_CHECKLIST.md](./ONBOARDING_CERTIFICATION_CHECKLIST.md) | The narrower, earlier gate — can the framework itself be stood up and configured at all, verified live            |

## 4. Reading Basis

Every recommendation here is grounded in something already established, not invented fresh:

- Product vision and audience: [PRODUCT_VISION.md](../PRODUCT_VISION.md).
- The existing config/content/code boundary, extended in [FRAMEWORK_STRATEGY.md](./FRAMEWORK_STRATEGY.md) to also answer "safe to merge from upstream": [CONFIGURATION_GUIDE.md](../CONFIGURATION_GUIDE.md).
- Existing transaction-boundary reasoning, directly reused for the Import Engine's batching design: [TRANSACTION_BOUNDARIES.md § 4](../database/TRANSACTION_BOUNDARIES.md#4-the-one-exception-academic-year-rollover-should-not-be-one-transaction).
- Existing soft-delete/append-only reasoning, directly reused for the Import Engine's rollback boundary: [SOFT_DELETE_STRATEGY.md](../database/SOFT_DELETE_STRATEGY.md).
- Already-recorded architectural decisions this sprint builds on without re-deciding: `Role`/`User` shape ([D-028](../DECISIONS.md#d-028--sprint-1-identity-foundation-role-as-a-lookup-table-with-accesslevel-user-merges-authjss-adapter-shape-repositoryservice-layer-introduced)), Credentials-only auth ([D-029](../DECISIONS.md#d-029--final-identity-architecture-review-validators-consolidated-into-libvalidations-roleiduseraccesslevel-design-affirmed)), no self-registration ([D-001](../DECISIONS.md#d-001--three-roles-only-for-version-1)).
- Official-source research (not speculation), for the one place this planning sprint required external verification: [IMPORT_ENGINE_STRATEGY.md § 5](./IMPORT_ENGINE_STRATEGY.md#5-rajasthan-rte-integration-research).

## 5. Self Review

- **Did this re-decide anything the domain, database, or engineering-principles documents already settled?** No — every repository/service/DTO pattern, every schema decision, and every business rule from Sprints 0–5 is treated as fixed input the new epics build on, not revisit.
- **Did this quietly redesign toward multi-tenancy anyway?** Checked explicitly, per this planning task's own strongest constraint. [FRAMEWORK_STRATEGY.md § 1](./FRAMEWORK_STRATEGY.md#1-the-model-upstream-not-control-plane) names the specific things that would constitute backsliding (tenant-resolution middleware, a central control plane, automatic cross-repo updates) and rules each out explicitly, not by omission.
- **Did this speculate anywhere it should have researched instead?** The one place external, unverifiable-from-first-principles fact was needed — Rajasthan RTE government-portal integration — was researched from official and directly-observed market sources, not guessed; see [IMPORT_ENGINE_STRATEGY.md § 5](./IMPORT_ENGINE_STRATEGY.md#5-rajasthan-rte-integration-research)'s cited sources.
- **Is this ready for Epic B implementation?** Yes — see the planning sprint's own final report for the explicit Ready-for-Epic-B verdict and any manual actions required first.
