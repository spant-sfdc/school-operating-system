# Implementation Log

**Purpose:** The engineering diary for this project. [CHANGELOG.md](./CHANGELOG.md) records _what_ shipped, for anyone; this document records _why_, for future engineers and AI assistants who need the reasoning, not just the result — architecture decisions in progress, rejected ideas, lessons learned, manual review notes, and things to reconsider later.

This is not a duplicate of [DECISIONS.md](./DECISIONS.md). DECISIONS.md holds the final, approved outcome of a decision in a fixed format. This document holds the messier narrative around it — what was tried, what didn't work, what almost happened instead.

---

## 2026-07-17 — Phase 0A: Initial Documentation Foundation

**Context:** Project started from zero — no code, no docs, no repository history. The instruction set was explicit that no application code should exist yet; the entire deliverable was a documentation foundation.

**What was done:** Authored the initial ten-document set (`PROJECT_CONTEXT.md`, `PRODUCT_REQUIREMENTS.md`, `ARCHITECTURE.md`, `UI_DESIGN_SYSTEM.md`, `AI_RULES.md`, `DECISIONS.md`, `ROADMAP.md`, `TASKS.md`, `CHANGELOG.md`, `README.md`).

**Lessons learned:** Writing all ten documents independently in one pass produced natural, unplanned duplication — tech stack, folder structure, and role definitions ended up stated near-identically in three or four places (`PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `README.md`). This wasn't a mistake in any single document — each one made sense to be self-contained in isolation — but in aggregate it created multiple sources of truth that could silently drift apart. This directly motivated Phase 0A.1 below.

---

## 2026-07-17 — Phase 0A.1: Documentation Consolidation & AI Operating System

**Context:** With the initial ten documents in place, the project needed to become a genuine "AI development operating system" — maintainable by another AI or developer six months from now, from documentation alone, with no chat history required.

**Problem identified:** Three categories of issue in the Phase 0A document set:

1. **Duplication** — tech stack, folder structure, role definitions, and design principles were each stated fully in 2–3 places, with real risk of drifting inconsistent over time.
2. **Missing operating layer** — the original ten documents described the _product_ well but had no equivalent for _how an AI or engineer should operate day to day_: no naming conventions, no component registry, no route registry, no reusable implementation prompt, no completion checklist beyond a 7-line summary.
3. **Format debt** — `DECISIONS.md` entries lacked fields (approver, alternatives considered) that matter once more than one person is involved; `CHANGELOG.md` used an ad hoc format instead of an industry-standard one.

**Decision:** Make `PROJECT_CONTEXT.md` the single source of truth, with every other document either (a) holding detail that would bloat `PROJECT_CONTEXT.md` if inlined, cross-linked from it, or (b) a genuinely new operating document (guardrails, conventions, inventories, master prompt, this log) that didn't exist before. See [DECISIONS.md § D-006](./DECISIONS.md#d-006--documentation-consolidation-into-single-source-of-truth).

**Alternative considered and rejected:** Keep every document fully self-contained (accept some duplication as the cost of each document being independently readable). Rejected because the explicit goal — six-months-later maintainability with no chat history — depends on there being exactly one place to update a fact when it changes; duplicated facts are duplicated maintenance burden and a guaranteed eventual inconsistency.

**Alternative considered and rejected:** Merge everything into one enormous `PROJECT_CONTEXT.md` instead of a hub-and-spoke model. Rejected because a single monolithic document becomes expensive to load in full for every task (token cost) and hard to scan; the hub-and-spoke model (one source of truth + focused references) keeps each read scoped to what's actually needed.

**What changed:**

- `PROJECT_CONTEXT.md` restructured around Current Phase/Sprint, Architecture Summary, Roles, Completed/Pending Features, Folder Structure, Tech Stack, Design Summary, Coding Standards Summary, Decisions, Open Questions, Risks, and a full Reference Links map.
- New documents created: `PROJECT_GUARDRAILS.md`, `DEVELOPMENT_CONVENTIONS.md`, `COMPONENT_INVENTORY.md`, `ROUTES.md`, `FEATURE_STATUS.md`, `DEFINITION_OF_DONE.md`, `MASTER_PROMPT.md`, this log.
- `AI_RULES.md` expanded with concrete engineering-discipline rules (minimal diffs, no placeholder code, no `console.log`, manual verification requirement) that were previously implied but not stated.
- `DECISIONS.md` reformatted to a richer template (ID, Title, Description, Reason, Alternatives Considered, Approved By, Date, Status, Affected Documents, Future Review Required).
- `CHANGELOG.md` converted to Keep a Changelog format.
- `README.md` trimmed of duplicated tech stack/folder structure detail in favor of links to `PROJECT_CONTEXT.md`/`ARCHITECTURE.md`, and expanded with a documentation map and development workflow section.

**Future consideration:** Once Phase 0B produces real code, verify that `COMPONENT_INVENTORY.md` and `ROUTES.md` are actually kept current in practice, not just in principle — an inventory nobody updates is worse than no inventory, because it creates false confidence. Revisit whether a lint rule or PR template checklist item can enforce the documentation-update step in [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) mechanically rather than relying on discipline alone.

---

## 2026-07-17 — Phase 0B.1: Project Scaffolding

**Context:** First implementation phase — bootstrap the actual Next.js repository per the approved architecture and design system documents, infrastructure only, no business functionality.

**Environment problems encountered and resolved:**

- The system's `pnpm` was a corepack shim pointing at Node's bundled corepack, which failed with a signature-verification error (`Cannot find matching keyid`) — a known corepack issue unrelated to this project. Resolved by removing the broken shims and installing `pnpm` directly via `npm install -g pnpm`, pinned to the 9.x line (`pnpm@11` required `node:sqlite`, not available on this Node build).
- Prisma's CLI refused to install on the local Node v23.1.0 (an odd-numbered "Current" release; Prisma only supports 20.19+, 22.12+, 24.0+). Rather than changing the developer's global Node version, installed Node 22 LTS via Homebrew as a keg-only formula (does not touch the global `node` symlink) and ran only the Prisma-specific commands with it prepended to `PATH` for that command. This is documented as a current risk in `PROJECT_CONTEXT.md` — the next contributor needs the same workaround until a project Node version is formally pinned (e.g., via `.nvmrc`).

**Decision — `create-next-app@latest` vs. a pinned version:** `create-next-app@latest` scaffolded Next.js 16, not the approved Next.js 15. `create-next-app` is versioned in lockstep with `next` itself, so re-running with `create-next-app@15` scaffolds the correct major version directly — cleaner than scaffolding latest and downgrading after the fact, which would leave Next-16-flavored generated config (e.g., default Turbopack dev config) in a Next-15 project.

**Decision — `src/` layout vs. the originally documented root-level structure:** The Phase 0B.1 instructions explicitly requested a `src/`-based feature-first layout, but `ARCHITECTURE.md`'s original folder tree put `app/`, `components/`, `lib/`, `types/` at the repository root. Rather than silently picking one, treated this as a legitimate architecture update: kept every internal composition decision (route groups, component categories, lib organization) unchanged, wrapped them in `src/`, and left `prisma/`, `public/`, `docs/`, and config files at root (the standard split, and `prisma/` in particular is conventionally always root-level regardless of `src/` usage). Recorded as [DECISIONS.md § D-007](./DECISIONS.md#d-007--src-directory-layout) and updated `ARCHITECTURE.md`'s tree to match, rather than leaving the documentation and the repository disagreeing.

**Decision — what "installation only" means for Auth.js and Prisma:** The task explicitly marked Auth.js and Prisma as "installation only." For Prisma, ran `prisma init` (datasource + generator blocks, zero models) and validated `prisma generate` succeeds — this is the mechanical, standard output of "installing Prisma," not a schema decision. For Auth.js, installed the `next-auth@beta` (v5) package only — deliberately did _not_ create `src/lib/auth.ts` with providers/session config, since that would be actual auth logic, explicitly forbidden. Also deliberately did **not** create `src/lib/db.ts` (a Prisma client singleton), even though `ARCHITECTURE.md` documents it as expected `lib/` content, because instantiating and successfully importing `PrismaClient` meaningfully only matters once there's a schema to query against — creating it now would be inert boilerplate with no immediate purpose, and the task's own task list (as opposed to the tech-stack list) never asked for it. Deferred to Phase 0B/2, tracked in `DECISIONS.md`'s Rejected/Deferred table.

**Decision — `next-intl` and `next-pwa` installed but not wired:** Both were explicitly named in the approved tech stack, so both were installed. Neither was configured: `next-intl`'s standard setup requires either a `[locale]` route segment (which would restructure the approved route-group layout) or a `request.ts` config that has no locales to serve yet; `next-pwa` ships with zero TypeScript type declarations (confirmed by inspecting `node_modules/next-pwa/package.json` — no `types` field, no `.d.ts` files), so importing it in `next.config.ts` under `strict: true` would either fail type-checking or require an `any`/`ts-expect-error` escape hatch, both disallowed by `AI_RULES.md`. Wiring either now would have meant violating an explicit project rule or making an unrequested architectural change. Left `next.config.ts` at its clean default and recorded the reasoning in [DECISIONS.md § D-008](./DECISIONS.md#d-008--phase-0b1-tooling--dependency-additions) rather than silently skipping the tech-stack instruction.

**Decision — removing the shadcn-generated `Button` component:** `shadcn init` auto-installed a `Button` primitive as a verification artifact of its own init process. The task's "DO NOT CREATE" list explicitly says "No Components." Reasoned that a mechanically-generated example component still counts as a component under a literal reading of that instruction, so removed it after init completed, keeping only `components.json` (config) and `src/lib/utils.ts` (the `cn()` helper, infrastructure rather than a component). First component gets added when Phase 1 implementation actually needs one.

**Decision — replacing the default Next.js demo homepage:** `create-next-app` generates a marketing-style demo page (Next.js logo, "Deploy now" / "Read our docs" links to vercel.com/nextjs.org). Leaving it in place would arguably violate "No Homepage" more than replacing it would — it's a fully designed page with branding and outbound navigation, not neutral scaffolding. Replaced it with a single unstyled sentence confirming the infra is running, used only to prove the dev server and build pipeline work end-to-end. This is explicitly a placeholder for Phase 1, not a homepage design decision.

**Lessons learned:** When a task's own instructions internally disagree (Step 4 says follow `ARCHITECTURE.md` exactly; Step 5 says use a `src/` layout `ARCHITECTURE.md` didn't have), the right move is to update the documentation to match the resolved decision in the same change — not to implement one and leave the other silently stale. Also: "install only" is ambiguous enough on its own that it's worth spelling out, per dependency, exactly what "installed" produced (a package.json entry vs. an initialized config vs. a wired-in feature) rather than assuming the phrase self-explains.

---

## 2026-07-17 — Phase 0B.1 Finalization: Stabilization Pass

**Context:** Phase 0B.1 scaffolding was functionally complete but had never been reviewed as a whole or committed to git. This session's job was explicitly _not_ to build anything new — review, fix defects, verify the pipeline, pin the runtime, and prepare the repository for its first commit/push/tag.

**What the review found:** Two genuinely orphaned dependencies. The previous session installed `shadcn`'s default `Button` component during `shadcn init`, then deleted it (per the "No Components" instruction) but never checked whether `Button`'s own dependencies (`@base-ui/react`, `class-variance-authority`) were still needed elsewhere. `grep` across `src/` confirmed zero remaining imports of either — genuine dead weight, unlike `next-intl`/`next-pwa` which are unused but explicitly approved tech stack. Also found `shadcn` itself sitting in `dependencies` rather than `devDependencies` — it's a CLI tool invoked via `pnpm exec`/`pnpm dlx`, never imported by application code, so its production classification was simply wrong.

**Decision — pin the runtime, then make the pin true:** The task specified an exact `.nvmrc`/`engines` block (Node `>=22 <23`, pnpm `>=10`). Adding it immediately broke `pnpm install` in the working session (`ERR_PNPM_UNSUPPORTED_ENGINE`) — the session's actual toolchain was pnpm 9.15.9 on Node 23.1.0, a informal workaround from the prior session, not a real match. Rather than weakening the constraint to make the error go away (which would defeat the entire purpose of pinning), upgraded the toolchain to actually satisfy it: confirmed `node:sqlite` works under the already-installed Node 22.23.1 (Homebrew keg-only), then installed pnpm 10.34.5 globally using that Node. This replaced the global `pnpm` binary outright, so the fully-pinned toolchain (Node 22 + pnpm 10) now works with zero warnings, and even the machine's _default_ Node 23 environment now only produces a soft warning (not a hard failure) on `pnpm install`, since pnpm 10's engine check treats the `pnpm`-version mismatch as the hard gate and the `node`-version mismatch as informational. This meaningfully narrows the risk flagged in the previous session's `IMPLEMENTATION_LOG.md`/`PROJECT_CONTEXT.md` entry — it's no longer "the whole toolchain needs a workaround," it's "a from-scratch `prisma` package install specifically needs Node 22, once."

**Decision — pnpm 10's build-script blocking:** Upgrading to pnpm 10 surfaced a new default behavior — postinstall scripts are blocked unless explicitly approved (`Ignored build scripts: prisma@7.8.0`). Ran `pnpm approve-builds --all` rather than ignoring the warning, since Prisma's postinstall fetches its query-engine binary and silently skipping it would produce a passing `pnpm install` that quietly leaves Prisma non-functional later. This wrote `pnpm-workspace.yaml` (`allowBuilds: { prisma: true }`) — a new, legitimate config file that gets committed alongside everything else.

**Decision — merge this pass into the v0.1.0 changelog entry rather than adding v0.1.1:** Since no commit or tag existed yet when this session started, v0.1.0 wasn't actually "released" in any git sense — `CHANGELOG.md`'s own "never edit a past entry" rule exists to protect entries that have already shipped. Folded the dependency cleanup and runtime-pinning changes into the existing `[0.1.0]` entry instead of creating a `[0.1.1]`, since the task's own commit/tag instructions treat this finalization pass as still part of "Phase 0B.1 — Project Scaffolding," not a separate release.

**Lessons learned:** A "finalize and stabilize" pass is exactly the right moment to catch dependency drift from earlier reversals — the kind of thing that's individually invisible (an unused package doesn't fail a build) but accumulates as silent cruft if nobody looks. Also: pinning a runtime constraint is only meaningful if the pass that adds it also verifies the constraint is actually satisfiable in the current environment — an aspirational `engines` field that immediately breaks the local install is worse than no pin at all, because it looks enforced without being tested.

---

## How to Use This File

- Add an entry per significant session or decision point, dated, newest at the bottom (chronological — unlike `DECISIONS.md`, which is reference-ordered by ID).
- Write for a reader who wasn't in the conversation: state the problem before the solution.
- It is fine for this log to contain dead ends and rejected approaches — that's the point.
