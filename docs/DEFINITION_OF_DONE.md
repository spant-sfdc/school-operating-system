# Definition of Done

**Purpose:** The single, canonical completion checklist for any unit of work on this project — a feature, a page, a component, a phase. [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) links here rather than restating this list; this document is authoritative. If a change doesn't satisfy every applicable item below, it is not done, regardless of how much of it is finished.

Not every item applies to every change (a documentation-only change has no build/lint concerns) — apply judgment, but don't skip an applicable item to save time.

---

## 1. Code Quality

- [ ] Follows [DEVELOPMENT_CONVENTIONS.md](./DEVELOPMENT_CONVENTIONS.md) — naming, import order, comment style, error handling
- [ ] No duplicate logic — shared logic extracted to `/lib`, no copy-pasted component variants (check [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md) first)
- [ ] No unnecessary abstraction — the simplest solution that meets the requirement, per [PROJECT_GUARDRAILS.md](./PROJECT_GUARDRAILS.md)
- [ ] No placeholder code, stub functions, or `TODO` comments left in what's being marked done
- [ ] No `console.log` or debug output left in the change

## 2. Responsiveness

- [ ] Verified at all breakpoints in [UI_DESIGN_SYSTEM.md § 13](./UI_DESIGN_SYSTEM.md#13-responsive-breakpoints)
- [ ] Teacher-facing screens specifically verified at `md` (tablet) — the realistic in-classroom device

## 3. Accessibility

- [ ] Meets [UI_DESIGN_SYSTEM.md § 14](./UI_DESIGN_SYSTEM.md#14-accessibility) — contrast, keyboard navigation, semantic HTML, labeled inputs
- [ ] No state communicated by color alone
- [ ] Motion respects `prefers-reduced-motion`

## 4. Type Safety

- [ ] Strict TypeScript — no `any`, no suppressed type errors
- [ ] Shared types live in `/types` or colocated per [DEVELOPMENT_CONVENTIONS.md § 1](./DEVELOPMENT_CONVENTIONS.md#1-naming-conventions), not duplicated inline

## 5. Lint

- [ ] Passes the project's ESLint/Prettier configuration with zero warnings introduced
- [ ] No manual reformatting of unrelated code (keeps diffs reviewable)

## 6. Build

- [ ] `next build` (or equivalent) succeeds with no new errors or warnings
- [ ] No new, unexplained increase in client bundle size for a Server-Component-eligible page

## 7. Documentation Updated

- [ ] [CHANGELOG.md](./CHANGELOG.md) updated
- [ ] [TASKS.md](./TASKS.md) reflects the change (moved from Pending/In Progress to Completed, or updated)
- [ ] [FEATURE_STATUS.md](./FEATURE_STATUS.md) updated if a feature's status changed
- [ ] [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md) updated if a component was added, changed, or deprecated
- [ ] [ROUTES.md](./ROUTES.md) updated if a route was added, removed, or moved
- [ ] [DECISIONS.md](./DECISIONS.md) updated if an architectural or product decision was made
- [ ] [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) updated if Current Phase, Completed/Pending Features, or Current Risks changed

## 8. Manual Verification

- [ ] The feature was actually exercised end-to-end (not just typechecked/tested) — golden path and at least one edge case
- [ ] For UI changes: viewed in a real browser, not just assumed from code
- [ ] Manual verification steps are stated in the change summary so a reviewer can repeat them

## 9. Performance

- [ ] Follows [ARCHITECTURE.md § Performance Principles](./ARCHITECTURE.md#8-performance-principles) — Server Components by default, optimized images, no N+1 queries
- [ ] No full-page spinner introduced where a localized skeleton would do (see [UI_DESIGN_SYSTEM.md § 12](./UI_DESIGN_SYSTEM.md#12-loading-states--skeletons))

## 10. Security

- [ ] Role-based access enforced server-side, not only hidden in the UI ([ARCHITECTURE.md § Security Principles](./ARCHITECTURE.md#7-security-principles))
- [ ] All external input validated with Zod before touching business logic
- [ ] No secrets in client code or client-visible environment variables

## 11. No Duplicate Code

- [ ] Checked [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md) before creating any new component
- [ ] Checked `/lib` before writing a new utility that might already exist

## 12. Reusable Components

- [ ] Any new reusable component is added to [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md) in the same change
- [ ] Built from Shadcn primitives per [ARCHITECTURE.md § Component Hierarchy](./ARCHITECTURE.md#6-component-hierarchy), not a new ad hoc pattern

---

## Relationship to Other Documents

This checklist operationalizes:

- [PROJECT_CONTEXT.md § Definition of Done (summary)](./PROJECT_CONTEXT.md) — the condensed version that points here
- [AI_RULES.md](./AI_RULES.md) — the behavioral rules that produce work meeting this bar
- [MASTER_PROMPT.md](./MASTER_PROMPT.md) — every implementation task should conclude by checking this list
