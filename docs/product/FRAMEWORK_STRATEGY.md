# Framework Strategy

**Purpose:** How the Master Repository should evolve now that it has real, cloneable clients depending on it — which improvements belong in the framework, which belong only inside a client repository, and how a version upgrade actually reaches an already-deployed client. This document is the direct architectural consequence of this planning sprint's own governing constraint: **not SaaS, not multi-tenant, one repository per school** — see [DECISIONS.md § D-034](../DECISIONS.md#d-034--delivery-phase-roadmap-clone-per-client-model-supersedes-eventual-saas-framing-epic-reordering) for why this supersedes [PRODUCT_ARCHITECTURE.md § 2](../PRODUCT_ARCHITECTURE.md#2-future-architecture) step 4's earlier "eventual multi-tenant SaaS" framing.

---

## 1. The Model: Upstream, Not Control Plane

Every client repository is a `git clone` of the Master Repository, with the Master added back as an `upstream` remote. This is structurally identical to how an open-source "starter kit" or theme relates to the projects built from it — **not** how a SaaS relates to its tenants. The distinction matters concretely:

| SaaS model (rejected)                                                                   | Clone-per-client model (this project)                                                     |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| One deployment serves every tenant                                                      | One deployment per client, always                                                         |
| A framework change ships to every tenant the moment it's deployed                       | A framework change reaches a client only when that client's repo explicitly merges it     |
| Tenant isolation is a runtime concern (middleware, `schoolId` filtering across tenants) | Isolation is structural — there is no cross-client database connection to isolate against |
| A central control plane can push, roll back, or feature-flag per tenant                 | No control plane exists or should be built — see § 4                                      |

**Do not build tenant-resolution middleware, a central deployment dashboard, or any mechanism that pushes a change to multiple client repositories at once.** Building any of these would quietly re-introduce the SaaS control-plane pattern this document exists to rule out — the same category of mistake [PROJECT_GUARDRAILS.md § G-1](../PROJECT_GUARDRAILS.md#1-the-core-guardrails) already guards against for feature scope, applied here to architecture.

## 2. What Belongs in the Master Framework

Everything that should be **identical for every school, and that every client benefits from receiving as an update**:

- All business logic — repositories, services, DTOs, validation schemas (`src/repositories/`, `src/services/`, `src/lib/validations/`).
- The Prisma schema and every migration.
- The entire Marketing Section Library and page-composite pattern (`src/components/website/sections/`, the `<Page>/page.tsx`/`sections.ts` composition logic — not the `content.ts` files, see § 3).
- Auth.js wiring, password-hashing logic, the permission-matrix enforcement layer.
- The Import Engine (genuinely reusable — importing "a student" is the same operation regardless of which school is doing the importing).
- All `docs/` content that describes how the framework works, not what one school says about itself — see [CLIENT_CUSTOMIZATION_GUIDE.md § 4](./CLIENT_CUSTOMIZATION_GUIDE.md#4-documentation-set--what-ships-with-a-client-repo-what-doesnt) for the exact document-by-document split.

## 3. What Belongs Only in a Client Repository

Everything [CLIENT_CUSTOMIZATION_GUIDE.md § 2](./CLIENT_CUSTOMIZATION_GUIDE.md#2-the-checklist--what-a-new-client-repository-must-change)'s checklist covers: `src/config/*.ts` values, every page's `content.ts`, real photography, `package.json`'s `name`, environment variables/secrets, and the client's own real operational data. **The framework's own code should never need to touch these files' content to add a feature** — if a future change requires editing a specific client's `content.ts` to work, that change was scoped wrong.

## 4. Version Upgrades — Pull, Never Push

A client repository upgrades by explicitly running `git fetch upstream && git merge upstream/main` (or a controlled rebase/cherry-pick, at whoever is managing that client repo's discretion), reviewing the diff, resolving any conflicts, and testing before deploying — the same workflow as merging any upstream dependency, because that is structurally what the Master Repository is to a client repo.

**This has a direct, practical design implication for how framework code should be written:** every framework change is a future merge-conflict risk for every client repo that has diverged even slightly. This gives the project's already-established "minimal diffs, don't reformat unrelated code" discipline ([AI_RULES.md § 2](../AI_RULES.md#2-code--component-discipline)) a second, sharper reason to matter beyond code review — a needlessly wide diff in the Master Repository is not just harder to review once, it's harder for **every client repo, forever**, to merge cleanly. The config/content/code boundary [CONFIGURATION_GUIDE.md](../CONFIGURATION_GUIDE.md) already established for single-tenant reasons turns out to be **the same boundary** that determines "safe for the framework to touch on an update" vs. "client-owned, the framework must never modify" — worth stating explicitly since it's a non-obvious consequence of a decision made for an unrelated reason.

### 4.1 Should client repos automatically receive framework updates?

**No.** Automatic, push-based updates across every client repository is precisely the control-plane pattern § 1 rules out. Every update is a deliberate, reviewed, per-client action — this is slower than a SaaS's instant global rollout by design, and that trade-off is correct here: a client repo has its own real customizations a blind auto-merge could silently break, and a single school going down because of an unreviewed upstream change is a materially worse outcome than a school running one version behind for a while.

### 4.2 Tracking version drift without a central registry

Since there is deliberately no control plane, TechPulse needs a lightweight, non-automated way to know "how far behind master is client X" — recommend each client repo's own `CHANGELOG.md` (reset per [CLIENT_CUSTOMIZATION_GUIDE.md § 4](./CLIENT_CUSTOMIZATION_GUIDE.md#4-documentation-set--what-ships-with-a-client-repo-what-doesnt)) record the Master Repository's version tag it was last synced to, alongside its own local-only changes. Full mechanics: [VERSIONING_STRATEGY.md](./VERSIONING_STRATEGY.md).

## 5. Framework Change Discipline

A change proposed against the Master Repository should be checked against one question before it's accepted: **does this improve every school, or does it improve one school's specific situation?** If the latter, it belongs in that client's own repo, not upstream — the same discriminating question [PROJECT_GUARDRAILS.md § Module Approval Process](../PROJECT_GUARDRAILS.md#2-module-approval-process) already asks about scope, applied here to the question of _which repository_ a change belongs in, not _whether it should exist at all_.

## 6. What This Means for Pant Public School's Own Repository, Today

This repository (Pant Public School's) **is currently both** the Master Framework and client #1's repository at once — there is no separation yet, because there is no second client yet. [Epic C](./EPIC_ROADMAP.md#epic-c--client-customization-framework) is the point at which that separation becomes real: the moment a second client repo is actually cloned, this repository's own Pant-Public-School-specific `content.ts`/`config/` values become "client #1's customization," and everything else becomes "the framework both repos now share an `upstream` relationship to." Nothing needs to change about this repository _before_ that moment — the separation is structural (which files are which), not organizational (there is no second repo to separate from yet).
