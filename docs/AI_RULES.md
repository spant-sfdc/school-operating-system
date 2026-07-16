# AI Assistant Rules

**Purpose:** This document tells every AI assistant (Claude or otherwise) working on this codebase how to behave. These rules exist to protect consistency, quality, and the product vision across many sessions and contributors. They are not suggestions — treat them as binding constraints.

This document governs _behavior_. For _what_ to build, see [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md) and [PROJECT_GUARDRAILS.md](./PROJECT_GUARDRAILS.md). For _how to name and format code_, see [DEVELOPMENT_CONVENTIONS.md](./DEVELOPMENT_CONVENTIONS.md). Every implementation task should follow [MASTER_PROMPT.md](./MASTER_PROMPT.md), which this document's rules operationalize.

---

## 1. Scope Discipline

- **Never expand scope beyond what is documented in [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md).** If a request implies a feature listed in the Out of Scope section (fee management, parent/student login, library, hostel, payroll, inventory, transport, homework), stop and run the [PROJECT_GUARDRAILS.md § Module Approval Process](./PROJECT_GUARDRAILS.md#2-module-approval-process) before proceeding.
- **Never add a fourth user role.** Guest, Admin, Teacher only, unless a decision is recorded in [DECISIONS.md](./DECISIONS.md).
- Do not build "just in case" functionality. If it isn't in the current phase's scope (check [FEATURE_STATUS.md](./FEATURE_STATUS.md)), it doesn't get built.

---

## 2. Code & Component Discipline

- **Never rename existing files, components, or exports without explicit approval.** Renames ripple through imports, routes ([ROUTES.md](./ROUTES.md)), and the component registry ([COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md)), and break continuity across sessions.
- **Never rewrite approved code** to "improve" it stylistically unless asked. If something looks wrong, flag it — don't silently rewrite.
- **Always reuse existing components** before creating new ones. Check [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md) first — it exists specifically so this check is fast. Duplicate components are a defect, not a shortcut.
- **No duplicate logic.** Shared logic belongs in `/lib`, referenced from both Admin and Teacher surfaces where applicable.
- **Never introduce a new dependency** without explaining why the existing stack ([PROJECT_CONTEXT.md § Tech Stack](./PROJECT_CONTEXT.md#8-tech-stack)) cannot do the job, and recording the decision in [DECISIONS.md](./DECISIONS.md) once approved.
- **Prefer minimal diffs.** Change only what the task requires. Do not reformat, restructure, or "clean up" code outside the change's actual scope — it makes review harder and obscures what actually changed.
- **Keep commits logically separated.** One concern per commit — don't bundle an unrelated fix, a refactor, and a new feature into one change.
- **No placeholder code.** Don't stub a function, leave a fake return value, or write "implement this later" logic and call the task done.
- **No `TODO` comments in production code.** If work is genuinely deferred, it belongs in [TASKS.md](./TASKS.md) or [FEATURE_STATUS.md](./FEATURE_STATUS.md), not as a code comment nobody tracks.
- **No `console.log`** left in committed code — see [DEVELOPMENT_CONVENTIONS.md § Logging](./DEVELOPMENT_CONVENTIONS.md#9-logging).
- **Strict TypeScript always.** No `any`, no silencing the type checker, no implicit types.
- **Prefer Server Components.** Justify every `"use client"` directive — see [ARCHITECTURE.md § 4](./ARCHITECTURE.md#4-rendering-strategy--server-vs-client-components).
- **Accessibility is required, not optional**, on every UI change — see [UI_DESIGN_SYSTEM.md § 14](./UI_DESIGN_SYSTEM.md#14-accessibility).

---

## 3. Communication Discipline

- **Explain architectural changes before making them.** If a change affects folder structure, data model, routing strategy, or introduces a new pattern, explain the reasoning and get confirmation first.
- **Flag conflicts with existing decisions.** If a request contradicts [DECISIONS.md](./DECISIONS.md), say so explicitly rather than quietly complying or quietly ignoring the request.
- **Be concise.** Enterprise documentation and communication standards apply — no filler, no generic AI-generated padding.
- **Ask when uncertain.** This project favors correctness over speed. Guessing at ambiguous requirements produces rework.
- **Always provide manual verification steps** for any implementation change — state exactly how to exercise the feature and confirm it works, per [DEFINITION_OF_DONE.md § Manual Verification](./DEFINITION_OF_DONE.md#8-manual-verification).

---

## 4. Documentation Discipline

- **Update documentation in the same change, not as a follow-up.** At minimum: [CHANGELOG.md](./CHANGELOG.md) and [TASKS.md](./TASKS.md); conditionally [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md), [ROUTES.md](./ROUTES.md), [FEATURE_STATUS.md](./FEATURE_STATUS.md), and [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — see [MASTER_PROMPT.md § Documentation Updates](./MASTER_PROMPT.md#6-documentation-updates-required-every-task) for the full trigger list.
- **Record every approved decision** in [DECISIONS.md](./DECISIONS.md) — including rejected alternatives and why.
- **Record the reasoning, not just the outcome**, in [IMPLEMENTATION_LOG.md](./IMPLEMENTATION_LOG.md) whenever a non-obvious choice was made, an alternative was rejected, or a lesson was learned.
- **Do not let PROJECT_CONTEXT.md go stale.** It is the single source of truth for this project; treat inaccuracies in it as bugs.

---

## 5. Quality Bar

- No duplicate code — extract and reuse.
- No half-finished implementations — a feature is either complete to its acceptance criteria or not started.
- No unnecessary abstraction — do not build generic frameworks for one use case (three similar lines beat a premature abstraction).
- No unnecessary complexity — the simplest solution that meets the requirement wins.
- Match [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md) exactly — spacing, color tokens, motion timing, component patterns. A visually "close enough" implementation is not acceptable in a product modeled on Stripe/Notion-level polish.

---

## 6. What "Good" Looks Like

Before considering any unit of work complete, verify it against the full checklist in [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md). If it doesn't meet every applicable item, it isn't done.
