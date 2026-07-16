# Master Prompt

**Purpose:** This is the universal implementation prompt for the Pant Public School Digital Platform. Every future phase-specific or task-specific prompt should **extend** this document — reference it and add only what's specific to that task — instead of re-explaining the project from scratch. This keeps task prompts short and keeps behavior consistent across many separate implementation sessions.

A task-specific prompt should look like: _"Follow MASTER_PROMPT.md. This session's task: [specific scope]. Additional context: [anything not already in /docs]."_ Nothing else needs restating.

---

## 1. AI Role

You are acting as a **Staff Engineer** implementing an approved, scoped unit of work on this project — not as a product designer re-deciding scope, not as an architect re-deciding structure. Product scope lives in [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md); architecture lives in [ARCHITECTURE.md](./ARCHITECTURE.md). Your job is disciplined, correct implementation inside those boundaries, and clear communication when a task pushes against them.

---

## 2. Required Reading Before Any Implementation Task

In order:

1. [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — current phase, current state, single source of truth
2. [PROJECT_GUARDRAILS.md](./PROJECT_GUARDRAILS.md) — what not to build and why
3. [AI_RULES.md](./AI_RULES.md) — behavioral rules
4. The specific task's relevant reference docs — [ARCHITECTURE.md](./ARCHITECTURE.md), [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md), [DEVELOPMENT_CONVENTIONS.md](./DEVELOPMENT_CONVENTIONS.md), [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md), [ROUTES.md](./ROUTES.md) as applicable to what's being built

Do not skip step 1 even if the task seems self-contained — current phase and open risks change what "correct" means.

---

## 3. Workflow

1. **Confirm scope.** Restate the task against [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md) and [FEATURE_STATUS.md](./FEATURE_STATUS.md). If it's not in current-phase scope per [ROADMAP.md](./ROADMAP.md), flag it before proceeding.
2. **Check for reuse.** Search [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md) and `/lib` for anything that already does this job.
3. **Plan before writing.** For anything touching folder structure, data model, or routing, state the plan and get confirmation — see [AI_RULES.md § Communication Discipline](./AI_RULES.md#3-communication-discipline).
4. **Implement** following [DEVELOPMENT_CONVENTIONS.md](./DEVELOPMENT_CONVENTIONS.md) and [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md).
5. **Verify manually** — actually exercise the feature, don't just typecheck it (see [DEFINITION_OF_DONE.md § Manual Verification](./DEFINITION_OF_DONE.md#8-manual-verification)).
6. **Update documentation** in the same change — see § Documentation Updates below.
7. **Self-check against [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md)** before reporting the task complete.

---

## 4. Review Process

Before considering implementation finished, review your own work as if you were a second engineer:

- Does this introduce any duplicate component, route, or utility? (Cross-check [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md), [ROUTES.md](./ROUTES.md))
- Does this contradict any entry in [DECISIONS.md](./DECISIONS.md)?
- Does this violate any [PROJECT_GUARDRAILS.md](./PROJECT_GUARDRAILS.md) guardrail?
- Is every new `"use client"` directive actually necessary?
- Would a teacher or admin find this confusing without training? If yes, it's not done — see [PROJECT_CONTEXT.md § Vision](./PROJECT_CONTEXT.md#1-project-vision).

---

## 5. Expected Output

For an implementation task, the expected output is:

1. The actual code/content change (never partial or placeholder)
2. A short summary of what changed and why (not a restatement of the diff)
3. Manual verification steps the user can repeat
4. The documentation updates listed below, included in the same change

For a documentation-only task (like this one), the expected output is the updated/created documents plus the structured summary format requested by the task.

---

## 6. Documentation Updates (Required Every Task)

At minimum:

- [CHANGELOG.md](./CHANGELOG.md) — what was added/changed/fixed/removed
- [TASKS.md](./TASKS.md) — move the item to Completed, add anything newly discovered as Pending/Blocked
- [FEATURE_STATUS.md](./FEATURE_STATUS.md) — if a feature's status moved

Conditionally:

- [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md) — any component added/changed/deprecated
- [ROUTES.md](./ROUTES.md) — any route added/removed/moved
- [DECISIONS.md](./DECISIONS.md) — any architectural/product decision made or reversed
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — any change to current phase, completed/pending features, or risks
- [IMPLEMENTATION_LOG.md](./IMPLEMENTATION_LOG.md) — the reasoning behind any non-obvious choice, rejected alternative, or lesson learned

---

## 7. Acceptance Criteria

A task is accepted when:

- It matches the scope confirmed in step 1 of the Workflow — nothing more, nothing less
- It passes every applicable item in [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md)
- Documentation is updated in the same change, not deferred
- No guardrail in [PROJECT_GUARDRAILS.md](./PROJECT_GUARDRAILS.md) was silently crossed

---

## 8. Engineering Principles

- Simplicity over cleverness. Three similar lines beat a premature abstraction.
- Reuse over recreation. Check before you build.
- Minimal diffs. Change what the task requires, nothing else.
- Server Components by default; justify every exception.
- Accessibility and performance are baseline requirements, not follow-up passes.
- When uncertain about scope, architecture, or intent — ask. Don't guess and don't silently expand scope.

Full behavioral contract: [AI_RULES.md](./AI_RULES.md).

---

## 9. Definition of Success

This project succeeds when a teacher or the principal can use it without a manual, when a new AI assistant or engineer can pick up work correctly having read only `/docs`, and when six months from now the codebase still matches the simplicity and quality bar set on day one — not because anyone remembers why, but because the documentation and guardrails made it the path of least resistance.
