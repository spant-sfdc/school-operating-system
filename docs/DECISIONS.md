# Decisions Log

This document records every approved architectural, product, and process decision for the Pant Public School Digital Platform. Each entry is permanent history — decisions are superseded by new entries, never edited or deleted.

**Template:** Decision ID · Title · Description · Reason · Alternatives Considered · Approved By · Date · Status · Affected Documents · Future Review Required

---

## D-001 — Three Roles Only for Version 1

- **Description:** Version 1 supports exactly three roles: Guest, Admin, Teacher.
- **Reason:** Traditional school ERPs support many roles (Admin, Teacher, Parent, Student, Accountant, Librarian). Supporting all of these from launch adds significant auth, permission, and UI complexity. Restricting to three keeps v1 scoped and shippable; Parent/Student portals can be layered on later without a rewrite given the role-segmented architecture.
- **Alternatives Considered:** Include a read-only Parent role from launch — rejected as unnecessary launch-critical complexity; deferred to post-launch roadmap.
- **Approved By:** Project Owner
- **Date:** 2026-07-17
- **Status:** ✅ Approved
- **Affected Documents:** [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md), [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md), [AI_RULES.md](./AI_RULES.md)
- **Future Review Required:** Yes — revisit when Parent/Student portal is prioritized (see [ROADMAP.md](./ROADMAP.md)).

---

## D-002 — Excluded Modules for Version 1

- **Description:** Fee Management, Library, Hostel, Payroll, Inventory, Transport, and Homework modules are not built in Version 1.
- **Reason:** None are launch-critical. Several (Fee, Payroll) touch financial/compliance domains that deserve dedicated design phases rather than being bundled into a v1 focused on core admin, attendance, and exams. Full exclusion rationale per module: [PRODUCT_REQUIREMENTS.md § Out of Scope](./PRODUCT_REQUIREMENTS.md#4-out-of-scope).
- **Alternatives Considered:** Build a minimal Fee tracking view (no payment processing) — rejected; even a read-only version implies data model and compliance surface not worth taking on pre-launch.
- **Approved By:** Project Owner
- **Date:** 2026-07-17
- **Status:** ✅ Approved
- **Affected Documents:** [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md), [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md), [PROJECT_GUARDRAILS.md](./PROJECT_GUARDRAILS.md)
- **Future Review Required:** Yes — each module evaluated independently in future roadmap phases based on school priority (see [ROADMAP.md § Post-Launch](./ROADMAP.md#post-launch--future-consideration)).

---

## D-003 — Design Direction: Stripe/Notion-Class Polish, Not Traditional ERP UI

- **Description:** UI/UX is modeled on Stripe Dashboard, Linear, Vercel Dashboard, and Notion — minimal, calm, accessible, usable without training.
- **Reason:** Existing school software (Fedena, PowerSchool, ERPNext Education) is functional but visually dated and often requires training. Daily users are teachers and school staff, not IT specialists; adoption depends on the product being effortless.
- **Alternatives Considered:** Follow conventional school-ERP visual patterns (dense tables, heavy sidebars, form-first workflows) for faster familiarity to admins who've used such systems before — rejected; optimizing for effortless daily use outweighs superficial familiarity.
- **Approved By:** Project Owner
- **Date:** 2026-07-17
- **Status:** ✅ Approved
- **Affected Documents:** [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md), [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md)
- **Future Review Required:** No — foundational design principle; revisit only if user feedback strongly contradicts it post-launch.

---

## D-004 — Tech Stack Selection

- **Description:** Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + Shadcn UI + Framer Motion + Lucide Icons on the frontend; Next.js API routes + PostgreSQL + Prisma on the backend; Auth.js for authentication; Vercel + Cloudinary + GitHub for hosting/media/source control.
- **Reason:** A single full-stack framework minimizes operational complexity (no separate backend service to host/maintain); Shadcn + Tailwind enables the Stripe/Notion-class design bar (D-003); Vercel + Cloudinary keep hosting costs low and maintenance-free for a school budget.
- **Alternatives Considered:** Separate Node/Express backend with a Next.js frontend — rejected, adds infrastructure and deployment overhead disproportionate to project scale. Remix instead of Next.js — rejected, Next.js has stronger Vercel-native deployment story and larger Shadcn ecosystem alignment.
- **Approved By:** Project Owner
- **Date:** 2026-07-17
- **Status:** ✅ Approved
- **Affected Documents:** [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [README.md](../README.md)
- **Future Review Required:** No, unless a specific technical limitation is discovered during implementation.

---

## D-005 — No Application Code During Phase 0A

- **Description:** Phase 0A produces documentation only. No React components, database schemas, or APIs are generated.
- **Reason:** Ensures architecture, design system, and product scope are fully agreed upon before implementation begins, avoiding costly rework.
- **Alternatives Considered:** Scaffold a minimal Next.js shell alongside the documentation to "get ahead" — rejected; risked locking in structural choices before the documentation foundation (and stakeholder review) was complete.
- **Approved By:** Project Owner
- **Date:** 2026-07-17
- **Status:** ✅ Approved — superseded automatically at the start of Phase 0B
- **Affected Documents:** [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md), [ROADMAP.md](./ROADMAP.md)
- **Future Review Required:** No — resolves itself when Phase 0B begins.

---

## D-006 — Documentation Consolidation into Single Source of Truth

- **Description:** `PROJECT_CONTEXT.md` becomes the single source of truth for the project. All other documents hold either (a) detail cross-linked from `PROJECT_CONTEXT.md` rather than duplicated inline, or (b) genuinely new operating-process content not previously covered. Eight new documents were introduced: `PROJECT_GUARDRAILS.md`, `DEVELOPMENT_CONVENTIONS.md`, `COMPONENT_INVENTORY.md`, `ROUTES.md`, `FEATURE_STATUS.md`, `DEFINITION_OF_DONE.md`, `MASTER_PROMPT.md`, `IMPLEMENTATION_LOG.md`.
- **Reason:** The initial Phase 0A document set (ten documents, written independently) had accumulated real duplication — tech stack, folder structure, and role definitions each stated near-identically in three or four places — creating multiple sources of truth at risk of silent drift. The project's explicit goal is maintainability by another AI or developer six months from now, using documentation alone; that goal requires exactly one place to update any given fact. Full narrative: [IMPLEMENTATION_LOG.md § Phase 0A.1](./IMPLEMENTATION_LOG.md#2026-07-17--phase-0a1-documentation-consolidation--ai-operating-system).
- **Alternatives Considered:** Keep every document fully self-contained, accepting duplication as the cost of independent readability — rejected, duplicated facts are duplicated maintenance burden. Merge everything into one monolithic `PROJECT_CONTEXT.md` — rejected, increases token cost and reduces scannability versus a hub-and-spoke model.
- **Approved By:** Project Owner
- **Date:** 2026-07-17
- **Status:** ✅ Approved
- **Affected Documents:** All documents in `/docs` and `README.md`
- **Future Review Required:** Yes — verify at the end of Phase 0B that the new operating documents (`COMPONENT_INVENTORY.md`, `ROUTES.md`) are actually being kept current in practice once real code exists.

---

## D-007 — `src/` Directory Layout

- **Description:** Application code (`app/`, `components/`, `lib/`, `types/`, `hooks/`) is nested under a `src/` directory. `prisma/`, `public/`, `docs/`, and root config files remain at the repository root. Internal composition of `app/`, `components/`, and `lib/` follows [ARCHITECTURE.md § Folder Structure](./ARCHITECTURE.md#2-folder-structure) unchanged — only the top-level container changed.
- **Reason:** Phase 0B.1 scaffolding instructions explicitly requested a `src/`-based, feature-first layout. This is a standard, Next.js-supported convention that separates application code from repository-root configuration/tooling files, which is valuable now that ESLint, Prettier, Husky, VSCode, and editor config files live at the root alongside `docs/`. `ARCHITECTURE.md`'s originally documented tree did not include a `src/` wrapper; this decision formally supersedes that detail while leaving every other structural decision (route groups, component hierarchy, lib organization) intact.
- **Alternatives Considered:** Keep `app/`, `components/`, `lib/`, `types/` at the repository root exactly as originally drafted in `ARCHITECTURE.md` — rejected because it directly conflicts with the explicit Phase 0B.1 scaffolding instruction, and mixing application source with the growing set of root-level config files reduces clarity as the project grows.
- **Approved By:** Project Owner (via Phase 0B.1 scaffolding instructions)
- **Date:** 2026-07-17
- **Status:** ✅ Approved
- **Affected Documents:** [ARCHITECTURE.md](./ARCHITECTURE.md), [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md), [README.md](../README.md)
- **Future Review Required:** No.

---

## D-008 — Phase 0B.1 Tooling & Dependency Additions

- **Description:** Beyond the core stack recorded in D-004, the following were added during infrastructure scaffolding: `framer-motion`, `lucide-react`, `react-hook-form`, `zod`, `clsx`, `tailwind-merge` (already anticipated in [ARCHITECTURE.md § 5](./ARCHITECTURE.md#5-state-management-strategy) and [§ 7](./ARCHITECTURE.md#7-security-principles) but not previously listed in the canonical tech stack table); `next-auth@5` (Auth.js, package installed only — no provider/session config written); `prisma`, `@prisma/client`, `pg`, `@types/pg`, `dotenv` (Prisma installed and initialized with datasource/generator only — zero models); `next-intl` and `next-pwa` (installed only — not wired into routing or build config; see Known Limitations in the Phase 0B.1 scaffolding report); `shadcn` CLI ecosystem packages (`@base-ui/react`, `class-variance-authority`, `tw-animate-css`) added automatically by `shadcn init`; `eslint-config-prettier` and `prettier-plugin-tailwindcss` (not explicitly named in the approved tooling list, added to prevent ESLint/Prettier rule conflicts and keep Tailwind class ordering consistent — both are zero-runtime-risk, formatting-only additions); `husky` and `lint-staged` (git hook tooling).
- **Reason:** Each addition is either explicitly named in the Phase 0B.1 tech stack list, already implied by previously approved architecture (React Hook Form and Zod were named in `ARCHITECTURE.md` before this phase), or a standard, low-risk companion tool needed to make an explicitly-approved tool (Prettier, Tailwind) function correctly together without conflicting rules.
- **Alternatives Considered:** Omit `eslint-config-prettier`/`prettier-plugin-tailwindcss` since they weren't named explicitly — rejected because without `eslint-config-prettier`, ESLint's stylistic rules can fight Prettier's output, violating the "zero duplicated configuration" quality requirement for this phase. Wire `next-intl` and `next-pwa` fully during this phase — rejected; see Future Review below.
- **Approved By:** Project Owner (via Phase 0B.1 scaffolding instructions)
- **Date:** 2026-07-17
- **Status:** ✅ Approved
- **Affected Documents:** [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md), [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Future Review Required:** Yes — `next-intl` requires a locale-routing decision (it would need an `app/[locale]/` restructuring that touches the approved route-group structure) before activation; `next-pwa` ships without TypeScript type declarations and requires a manifest/icon set that doesn't exist until branding is finalized. Both are tracked as installed-but-inactive until a dedicated decision activates them.

---

## D-009 — Phase 0B.1 Finalization: Dependency Cleanup and Runtime Pinning

- **Description:** Removed `@base-ui/react` and `class-variance-authority` (dependencies of the `shadcn init`-generated `Button` component, which was itself removed under D-008's "No Components" reading — these two were left behind, orphaned, with zero imports anywhere in `src/`). Reclassified `shadcn` from `dependencies` to `devDependencies` (it is a build-time CLI, never imported by application code). Pinned the project runtime via `.nvmrc` (`22`) and `package.json engines` (`node: >=22 <23`, `pnpm: >=10`). Upgraded the global `pnpm` installation from 9.15.9 to 10.34.5 (compatible with Node 22's `node:sqlite`, which pnpm 11 requires and which is available under Node 22.23.1) so the pinned engines constraint is actually satisfiable, not just aspirational. Added `pnpm-workspace.yaml` with `allowBuilds: { prisma: true }`, pnpm 10's explicit opt-in for dependency postinstall scripts.
- **Reason:** A Phase 0B.1 finalization pass is explicitly meant to catch exactly this class of issue — unused dependencies left over from an earlier reversal, and a runtime version that was worked around locally but never formally pinned. Leaving `@base-ui/react`/`class-variance-authority` installed with no importer anywhere is dead weight with no future-phase justification (unlike, say, `next-intl`, which is unwired but explicitly approved tech stack). Pinning the runtime converts the informal Node-22 workaround from the previous session into an enforceable, documented constraint instead of tribal knowledge.
- **Alternatives Considered:** Leave the engines field aspirational and keep working around it locally — rejected; an unenforced pin is not a pin, and the whole point of this finalization pass is to leave the repository in a state that doesn't depend on undocumented local workarounds. Set `engine-strict` off / omit the `pnpm` engine constraint to avoid the local mismatch entirely — rejected; the task explicitly specified both fields, and the correct fix for an environment mismatch is to align the environment, not loosen the constraint. Remove `shadcn` entirely instead of reclassifying — considered, but keeping it pinned as a devDependency avoids version drift for `pnpm exec shadcn add` calls in Phase 1.
- **Approved By:** Project Owner (via Phase 0B.1 Finalization instructions)
- **Date:** 2026-07-17
- **Status:** ✅ Approved
- **Affected Documents:** [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md), [IMPLEMENTATION_LOG.md](./IMPLEMENTATION_LOG.md)
- **Future Review Required:** No — this closes the Node-version risk flagged in D-008/`PROJECT_CONTEXT.md`; revisit only if the project needs to move off Node 22 (e.g., to track a future Node LTS).

---

## Rejected / Deferred Considerations

| Item                                                    | Status             | Reason                                                                                                                                          |
| ------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Parent login in v1                                      | ❌ Rejected for v1 | Adds scope/complexity beyond launch-critical needs; deferred to future roadmap                                                                  |
| Student login in v1                                     | ❌ Rejected for v1 | Same as above                                                                                                                                   |
| Multi-school / multi-tenant architecture                | ❌ Rejected for v1 | Single school (Pant Public School) only; no evidence of near-term need for multi-tenancy                                                        |
| Redux/Zustand for state management                      | ❌ Rejected        | Next.js Server Components + local state sufficient for v1 complexity; see [ARCHITECTURE.md § 5](./ARCHITECTURE.md#5-state-management-strategy)  |
| Pages Router (legacy Next.js)                           | ❌ Rejected        | App Router is the modern, supported approach for Next.js 15                                                                                     |
| Minimal read-only Fee tracking in v1                    | ❌ Rejected        | See D-002 — even read-only implies compliance surface not worth taking on pre-launch                                                            |
| Separate Node/Express backend                           | ❌ Rejected        | See D-004 — disproportionate infrastructure overhead                                                                                            |
| Fully self-contained documents (accept duplication)     | ❌ Rejected        | See D-006 — conflicts with single-source-of-truth goal                                                                                          |
| Monolithic single-file documentation                    | ❌ Rejected        | See D-006 — token cost and scannability                                                                                                         |
| Wiring `next-intl` locale routing in Phase 0B.1         | ⏸️ Deferred        | See D-008 — requires `app/[locale]/` restructuring beyond infra-only scope; needs its own architecture decision                                 |
| Wiring `next-pwa` manifest/service worker in Phase 0B.1 | ⏸️ Deferred        | See D-008 — no TypeScript types available; needs icon/branding assets that don't exist yet                                                      |
| Creating `lib/db.ts` and `lib/auth.ts` in Phase 0B.1    | ⏸️ Deferred        | Would require a working schema and auth provider strategy — both open questions; "installation only" scope for this phase per task instructions |

---

## How to Add a Decision

1. Assign the next sequential ID (`D-00X`).
2. Include all template fields: Description, Reason, Alternatives Considered, Approved By, Date, Status, Affected Documents, Future Review Required.
3. Never edit or delete a prior entry — supersede it with a new entry that references the old one if circumstances change.
4. If the decision affects [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)'s summary sections, update those in the same change.
