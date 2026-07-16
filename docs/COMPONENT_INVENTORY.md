# Component Inventory

**Purpose:** The single registry of every UI component in this codebase. Its entire job is to prevent duplicate components — before building anything new, check here first. If what you need already exists, reuse it (see [AI_RULES.md](./AI_RULES.md) and [PROJECT_GUARDRAILS.md § G-10](./PROJECT_GUARDRAILS.md#1-the-core-guardrails)). If it doesn't exist, build it, then add it here in the same change.

**Status as of Phase 0A.1:** No components exist yet. This document is the empty scaffold implementation will fill in starting Phase 0B/1. Naming conventions for anything added here: [DEVELOPMENT_CONVENTIONS.md § 1](./DEVELOPMENT_CONVENTIONS.md#1-naming-conventions).

---

## How to Add an Entry

Every component gets one row, added in the same change that introduces the component:

| Field            | Meaning                                                                        |
| ---------------- | ------------------------------------------------------------------------------ |
| **Name**         | Component name, matching the filename                                          |
| **Purpose**      | One sentence — what job it does                                                |
| **Props**        | Key props only (link to the type definition, don't restate the full interface) |
| **Reusable**     | Yes (cross-role/shared) / No (role- or feature-specific by design)             |
| **Dependencies** | Shadcn primitives or other internal components it's built from                 |
| **Status**       | Planned / In Progress / Built / Deprecated                                     |

Do not create a second component that does the same job under a different name — extend or reuse the existing entry instead.

---

## Layout

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Navigation

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Buttons

| Name                                                                                     | Purpose | Props | Reusable | Dependencies | Status  |
| ---------------------------------------------------------------------------------------- | ------- | ----- | -------- | ------------ | ------- |
| _(none yet — use Shadcn `Button` primitive directly until a composed variant is needed)_ |         |       |          |              | Planned |

## Forms

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Cards

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Tables

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Dialogs

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Drawers

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Charts

| Name                                                                                                                  | Purpose | Props | Reusable | Dependencies | Status  |
| --------------------------------------------------------------------------------------------------------------------- | ------- | ----- | -------- | ------------ | ------- |
| _(none yet — no chart library selected; requires a recorded decision before use, see [DECISIONS.md](./DECISIONS.md))_ |         |       |          |              | Planned |

## Empty States

| Name                                                                                                         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------------------------------------------------------------------------------------------------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet — required pattern defined in [UI_DESIGN_SYSTEM.md § 11](./UI_DESIGN_SYSTEM.md#11-empty-states))_ |         |       |          |              | Planned |

## Loading States

| Name                                                                                                                      | Purpose | Props | Reusable | Dependencies | Status  |
| ------------------------------------------------------------------------------------------------------------------------- | ------- | ----- | -------- | ------------ | ------- |
| _(none yet — skeleton pattern defined in [UI_DESIGN_SYSTEM.md § 12](./UI_DESIGN_SYSTEM.md#12-loading-states--skeletons))_ |         |       |          |              | Planned |

## Typography

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Icons

| Name                                                                                                                                                      | Purpose | Props | Reusable | Dependencies | Status  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----- | -------- | ------------ | ------- |
| _(none yet — Lucide Icons used directly per [UI_DESIGN_SYSTEM.md § 9](./UI_DESIGN_SYSTEM.md#9-icons); no custom icon wrapper unless a real need emerges)_ |         |       |          |              | Planned |

## Teacher Components

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Admin Components

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

## Website Components

| Name         | Purpose | Props | Reusable | Dependencies | Status  |
| ------------ | ------- | ----- | -------- | ------------ | ------- |
| _(none yet)_ |         |       |          |              | Planned |

---

## Relationship to Other Documents

- [DEVELOPMENT_CONVENTIONS.md](./DEVELOPMENT_CONVENTIONS.md) — how to name and structure a component once you're building it.
- [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md) — how it should look and behave.
- [ARCHITECTURE.md § Component Hierarchy](./ARCHITECTURE.md#6-component-hierarchy) — where it fits (primitive vs. shared composite vs. role composite).
