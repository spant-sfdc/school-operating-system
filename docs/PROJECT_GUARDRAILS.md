# Project Guardrails

**Purpose:** Protect the product vision defined in [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) from the single most common failure mode of long-lived software projects: slow, well-intentioned scope creep. Every rule below exists because it is the kind of thing that seems reasonable in isolation ("just one more module") and destroys the product in aggregate.

These are not suggestions. A change that violates a guardrail requires a recorded decision in [DECISIONS.md](./DECISIONS.md) before it proceeds — see § Module Approval Process below.

---

## 1. The Core Guardrails

| #    | Guardrail                                                                                                                                                                                             | What it prevents                                                                                 |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| G-1  | **Never become a generic ERP.** This is a focused platform for one school's core workflows, not a configurable product for every school in India.                                                     | Feature bloat, configuration sprawl, loss of opinionated simplicity                              |
| G-2  | **Version 1 remains intentionally focused.** Guest, Admin, Teacher. Attendance, marks, students, teachers, content, reports. Nothing else.                                                            | Scope creep disguised as "small additions"                                                       |
| G-3  | **Simplicity over feature count.** A smaller set of things that work perfectly beats a large set of things that work adequately.                                                                      | Feature-checklist thinking                                                                       |
| G-4  | **UX over functionality.** If a feature can't be made simple and calm, it's not ready to ship — even if it's technically complete.                                                                    | Shipping functional-but-unusable software                                                        |
| G-5  | **Mobile-first / tablet-first for Teacher surfaces.** Teachers use classroom tablets and phones, not desktops. Design and build for the smallest realistic screen first.                              | Desktop-only thinking that breaks the primary use case                                           |
| G-6  | **Accessibility is required, not a phase.** Every feature must meet [UI_DESIGN_SYSTEM.md § Accessibility](./UI_DESIGN_SYSTEM.md#14-accessibility) before it ships, not after.                         | Accessibility debt that becomes unaffordable to fix later                                        |
| G-7  | **Performance first.** A slow "premium" product is a contradiction. Performance principles in [ARCHITECTURE.md § 8](./ARCHITECTURE.md#8-performance-principles) are non-negotiable, not aspirational. | Death by a thousand small performance regressions                                                |
| G-8  | **Avoid feature creep.** The Out of Scope list in [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md#4-out-of-scope) is not a backlog — it is a boundary.                                            | "While we're in there" additions                                                                 |
| G-9  | **Every new feature must justify its existence.** State the user, the job it does for them, and why it can't wait for a later phase — before writing any code.                                        | Features built because they're easy, not because they're needed                                  |
| G-10 | **Prefer reusable workflows over one-off screens.** A new admin table should look and behave like every other admin table.                                                                            | UI fragmentation, duplicated components (see [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md)) |
| G-11 | **Never sacrifice maintainability for speed.** A shortcut that makes the codebase harder to reason about is not actually faster — it's borrowed time at interest.                                     | Technical debt accumulated under deadline pressure                                               |

---

## 2. Module Approval Process

Any request to introduce a new module, role, or capability that is not already in [PRODUCT_REQUIREMENTS.md § Scope](./PRODUCT_REQUIREMENTS.md#3-scope-version-1) — including anything on the [Out of Scope](./PRODUCT_REQUIREMENTS.md#4-out-of-scope) list (Fee Management, Library, Hostel, Payroll, Inventory, Transport, Homework, Parent/Student portals) — must go through this process before any design or code work begins:

1. **State the justification.** Who needs it, what job it does for them, and why the current scope doesn't already cover it (G-9).
2. **Check it against every guardrail above.** If it fails G-1 through G-11, it needs a stronger justification than "the school wants it," or it should wait for a dedicated future phase (see [ROADMAP.md § Post-Launch](./ROADMAP.md#post-launch--future-consideration)).
3. **Flag the conflict explicitly to the user/stakeholder.** Do not silently build it and do not silently refuse it — surface the tradeoff and let the product owner decide with the guardrails in view.
4. **Record the outcome in [DECISIONS.md](./DECISIONS.md)** — approved or rejected, with reasoning — regardless of which way it goes.
5. **Update [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) and [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md)** if approved, before implementation starts.

An AI assistant that builds an out-of-scope feature without completing this process has made an error, regardless of how well the feature was built.

---

## 3. How This Document Relates to Others

- [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md) defines _what_ is in and out of scope.
- This document defines _why_ the boundary exists and _how_ to challenge it correctly.
- [AI_RULES.md](./AI_RULES.md) defines the moment-to-moment behavioral rules that operationalize these guardrails during implementation.
