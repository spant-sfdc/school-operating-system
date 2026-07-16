# Development Conventions

**Purpose:** The concrete naming, formatting, and style rules for this codebase. Where [ARCHITECTURE.md](./ARCHITECTURE.md) decides _what pattern_ to use (Server Components, route groups, Server Actions), this document decides _how to write it consistently_. These conventions apply starting Phase 0B — no code exists yet, so this is the standard implementation begins with, not a retrofit.

If a convention below isn't followed, the code review should catch it before merge — see [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md).

---

## 1. Naming Conventions

| Element                              | Convention                                                                                         | Example                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Folders**                          | `kebab-case`                                                                                       | `attendance-table/`, `student-form/`                            |
| **Route segments**                   | `kebab-case`; route groups in `(parentheses)`                                                      | `app/(admin)/students/`, `app/(teacher)/marks/`                 |
| **Component files**                  | `PascalCase.tsx`, one component per file                                                           | `AttendanceTable.tsx`, `StudentForm.tsx`                        |
| **Component names**                  | `PascalCase`, descriptive noun phrase — no generic names like `Table1` or `NewForm`                | `TeacherProfileCard`, `MarksEntryRow`                           |
| **Client Component files**           | Same `PascalCase.tsx` name; the `"use client"` directive marks it, not the filename                | `AttendanceRowToggle.tsx` with `"use client"` as its first line |
| **Hooks**                            | `camelCase`, always prefixed `use`                                                                 | `useAttendanceForm.ts`, `useRoleGuard.ts`                       |
| **Types**                            | `PascalCase`, no `T` prefix                                                                        | `Student`, `AttendanceRecord`                                   |
| **Interfaces**                       | `PascalCase`; use `interface` for object shapes meant to be extended/implemented, `type` otherwise | `interface StudentFormProps`                                    |
| **Enums**                            | `PascalCase` for the enum, `PascalCase` for members (Prisma convention)                            | `enum AttendanceStatus { Present, Absent, Late }`               |
| **Utility functions**                | `camelCase`, verb-first                                                                            | `formatDate()`, `calculateAttendancePercentage()`               |
| **Constants**                        | `SCREAMING_SNAKE_CASE` for true constants; grouped in `lib/constants.ts`                           | `MAX_MARKS_PER_SUBJECT`, `DEFAULT_PAGE_SIZE`                    |
| **Server Actions**                   | `camelCase`, verb-first, colocated with the feature that owns them                                 | `createStudent()`, `markAttendance()`                           |
| **API Route Handlers**               | Folder path is the route; exported functions match HTTP verbs                                      | `app/api/students/route.ts` exports `GET`, `POST`               |
| **Prisma models**                    | `PascalCase` singular                                                                              | `model Student`, `model AttendanceRecord`                       |
| **Database columns / Prisma fields** | `camelCase` in schema (Prisma maps to `snake_case` columns via `@map` if needed)                   | `firstName`, `assignedClassId`                                  |

---

## 2. Directory Organization

- One component = one file = one default export.
- Co-locate a component's tightly-scoped sub-parts (e.g., a row renderer used only by one table) in the same folder, not in `components/shared`.
- A component only moves to `components/shared` once a second, genuinely distinct feature needs it — not preemptively (see [AI_RULES.md § Quality Bar](./AI_RULES.md#5-quality-bar) on premature abstraction).
- Full target folder structure: [ARCHITECTURE.md § Folder Structure](./ARCHITECTURE.md#2-folder-structure).

---

## 3. Import Order

Imports are grouped in this order, each group separated by a blank line, alphabetized within the group:

1. External packages (`react`, `next/*`, third-party libraries)
2. Internal absolute imports (`@/components/...`, `@/lib/...`, `@/types/...`)
3. Relative imports (`./`, `../`)
4. Type-only imports last within their group, using `import type`

```ts
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { formatDate } from "@/lib/utils";
import type { Student } from "@/types/student";

import { StudentRow } from "./StudentRow";
```

---

## 4. Comment Style

- Default to no comments. Well-named identifiers are the primary documentation.
- A comment is justified only when it explains a non-obvious _why_ — a constraint, a workaround, an invariant that isn't visible in the code itself.
- Never write a comment that restates what the code does, references a task/ticket, or narrates a change ("added for teacher dashboard", "fixed bug"). That belongs in the commit message or [IMPLEMENTATION_LOG.md](./IMPLEMENTATION_LOG.md).
- No commented-out code committed to the repository.

---

## 5. State Management Rules

Naming/style layer only — full strategy and rationale: [ARCHITECTURE.md § State Management Strategy](./ARCHITECTURE.md#5-state-management-strategy).

- Local UI state: `useState`, named for what it holds (`isDialogOpen`, not `flag`).
- Server data: fetched in Server Components; never duplicated into client state unless the client needs to mutate it optimistically.
- Context providers: named `XProvider` with a paired `useX()` hook (e.g., `ThemeProvider` / `useTheme()`).

---

## 6. Server Component & Client Component Rules

Full rendering strategy: [ARCHITECTURE.md § Server vs Client Components](./ARCHITECTURE.md#4-rendering-strategy--server-vs-client-components). Conventions:

- `"use client"` is always the first line of the file, with a one-line comment only if the reason isn't obvious from the component's job.
- Client Components stay as small as possible — the interactive leaf, not the whole page.
- Never add `"use client"` to a shared primitive in `components/ui` unless the primitive itself is inherently interactive (e.g., a Dialog).

---

## 7. API & Route Handler Naming

- Route Handlers live under `app/api/<resource>/route.ts`, matching the resource name used elsewhere (`students`, `teachers`, `attendance`, `examinations`).
- Nested resource actions use dynamic segments, not verb suffixes: `app/api/students/[id]/route.ts`, not `app/api/students/deleteStudent.ts`.
- Prefer Server Actions over Route Handlers for internal form mutations; reserve Route Handlers for endpoints genuinely consumed by client-side `fetch`/polling or external integrations (see [ARCHITECTURE.md § 4](./ARCHITECTURE.md#4-rendering-strategy--server-vs-client-components)).

---

## 8. Error Handling

- Validate all external input (forms, API payloads) with Zod schemas in `lib/validations/` before it touches business logic.
- Server Actions and Route Handlers return typed result shapes (`{ success: true, data }` / `{ success: false, error }`) rather than throwing across the server/client boundary.
- User-facing error messages are specific and actionable ("Marks cannot exceed 100 for this subject"), never generic ("Something went wrong") unless the failure is genuinely unexpected (e.g., a network error).
- Unexpected errors are caught at the nearest `error.tsx` boundary, not swallowed silently.

---

## 9. Logging

- No `console.log` left in committed code — see [AI_RULES.md § Engineering Discipline](./AI_RULES.md#2-code--component-discipline).
- Server-side diagnostic logging (once needed) goes through a single shared logger in `lib/logger.ts` — not ad hoc `console.*` calls — so log format and destinations can change in one place.
- Never log secrets, full session tokens, or student/teacher personal data in plaintext.

---

## 10. Environment Variables

- Server-only secrets: no `NEXT_PUBLIC_` prefix (`DATABASE_URL`, `AUTH_SECRET`, `CLOUDINARY_API_SECRET`).
- Client-safe values only: `NEXT_PUBLIC_` prefix, and only when the value is genuinely safe to ship to the browser.
- All required environment variables documented in a committed `.env.example` — never commit a real `.env.local`.
- Access environment variables through a single validated config module (once created), not scattered `process.env.X` calls.

---

## 11. Constants & Magic Numbers

- No unexplained numeric or string literals in logic (`if (marks > 100)` → `if (marks > MAX_MARKS_PER_SUBJECT)`).
- Shared constants live in `lib/constants.ts`, grouped by domain (attendance, examinations, pagination).
- A literal used exactly once, in an obviously self-explanatory context (e.g., `array.slice(0, 1)`), does not need to become a named constant — don't over-extract.

---

## 12. Formatting Rules

- Formatting is enforced by tooling (Prettier + ESLint, configured in Phase 0B), not by hand or by convention alone.
- No manual reformatting of code outside the lines you're actually changing — keeps diffs reviewable (see [AI_RULES.md](./AI_RULES.md) on minimal diffs).
- Trailing commas, semicolons, and quote style follow whatever the Phase 0B Prettier config sets — once configured, it is the source of truth over this document.

---

## 13. Relationship to Other Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — the _what and why_ of structure, rendering, and state strategy.
- This document — the _how to name and format it_ once you're building.
- [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md) — visual and interaction conventions (separate from code conventions).
- [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md) — check before creating any new component.
