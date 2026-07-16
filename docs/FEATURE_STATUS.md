# Feature Status Dashboard

**Purpose:** The single dashboard view of project progress, at the feature/module level. This answers "where does each feature stand" in one place, instead of piecing it together from the roadmap, task board, and changelog.

**How this differs from [TASKS.md](./TASKS.md):** TASKS.md is the day-to-day sprint board (what's being worked on this week). This document is the feature-level dashboard (what state each feature of the product is in, across the whole roadmap). Update this document when a feature changes phase or status — update TASKS.md when day-to-day work items change.

**Status legend:** `Not Started` · `Planned` · `In Progress` · `Blocked` · `Built` · `Verified` (meets [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md))

---

## Guest / Public Website

| Feature                  | Status      | Owner       | Dependencies                          | Current Phase | Future Phase | Blocked                                     | Risk                                |
| ------------------------ | ----------- | ----------- | ------------------------------------- | ------------- | ------------ | ------------------------------------------- | ----------------------------------- |
| Public marketing website | Not Started | Engineering | Brand identity, site copy             | —             | Phase 1      | Yes — awaiting brand/content input          | Medium — content pipeline undefined |
| Admission enquiry form   | Not Started | Engineering | Enquiry field list confirmed          | —             | Phase 1      | Yes — awaiting field list from School Admin | Low                                 |
| Notice board             | Not Started | Engineering | Admin content management (write side) | —             | Phase 1      | No                                          | Low                                 |
| Gallery                  | Not Started | Engineering | Cloudinary config                     | —             | Phase 1      | No                                          | Low                                 |
| Document downloads       | Not Started | Engineering | Cloudinary config                     | —             | Phase 1      | No                                          | Low                                 |
| Contact form             | Not Started | Engineering | None                                  | —             | Phase 1      | No                                          | Low                                 |

## Admin

| Feature                    | Status      | Owner       | Dependencies                           | Current Phase | Future Phase | Blocked                                                                                 | Risk   |
| -------------------------- | ----------- | ----------- | -------------------------------------- | ------------- | ------------ | --------------------------------------------------------------------------------------- | ------ |
| Authentication (Admin)     | Not Started | Engineering | Auth.js provider strategy decision     | —             | Phase 2      | Yes — [ARCHITECTURE.md Open Question](./ARCHITECTURE.md#9-open-architectural-questions) | Low    |
| Student management         | Not Started | Engineering | Prisma schema                          | —             | Phase 2      | No                                                                                      | Low    |
| Teacher management         | Not Started | Engineering | Prisma schema                          | —             | Phase 2      | No                                                                                      | Low    |
| Attendance oversight       | Not Started | Engineering | Attendance data model                  | —             | Phase 3      | No                                                                                      | Low    |
| Examination management     | Not Started | Engineering | Grading model decision                 | —             | Phase 4      | Yes — awaiting School Admin decision (marks vs. grade-based)                            | Medium |
| Reports                    | Not Started | Engineering | Attendance + Examination modules       | —             | Phase 4      | No                                                                                      | Low    |
| School settings            | Not Started | Engineering | Academic year/term structure confirmed | —             | Phase 2      | Yes — awaiting School Admin input                                                       | Low    |
| Website content management | Not Started | Engineering | Cloudinary config                      | —             | Phase 1      | No                                                                                      | Low    |

## Teacher

| Feature               | Status      | Owner       | Dependencies                        | Current Phase | Future Phase | Blocked | Risk                                                                                                                          |
| --------------------- | ----------- | ----------- | ----------------------------------- | ------------- | ------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Teacher dashboard     | Not Started | Engineering | Attendance + Marks modules          | —             | Phase 5      | No      | Low                                                                                                                           |
| Attendance marking    | Not Started | Engineering | Auth + role-scoping                 | —             | Phase 3      | No      | Medium — role-scoping enforcement discipline, see [PROJECT_CONTEXT.md § Current Risks](./PROJECT_CONTEXT.md#13-current-risks) |
| Marks entry           | Not Started | Engineering | Examination management (Admin side) | —             | Phase 4      | No      | Low                                                                                                                           |
| Student list (scoped) | Not Started | Engineering | Auth + role-scoping                 | —             | Phase 3      | No      | Low                                                                                                                           |
| Teacher profile       | Not Started | Engineering | Auth                                | —             | Phase 5      | No      | Low                                                                                                                           |
| Leave request         | Not Started | Engineering | Auth                                | —             | Phase 5      | No      | Low                                                                                                                           |

## Foundational / Cross-Cutting

| Item                                        | Status      | Owner                      | Dependencies                         | Current Phase | Future Phase | Blocked                          | Risk   |
| ------------------------------------------- | ----------- | -------------------------- | ------------------------------------ | ------------- | ------------ | -------------------------------- | ------ |
| Documentation foundation                    | Built       | Engineering                | None                                 | Phase 0A.1    | —            | No                               | Low    |
| Next.js project scaffolding                 | Built       | Engineering                | None                                 | Phase 0B.1    | —            | No                               | Low    |
| Tooling (ESLint, Prettier, Husky)           | Built       | Engineering                | None                                 | Phase 0B.1    | —            | No                               | Low    |
| Prisma installation (zero models)           | Built       | Engineering                | None                                 | Phase 0B.1    | —            | No                               | Low    |
| Prisma schema design (real models)          | Not Started | Engineering                | Academic year/grading decisions      | —             | Phase 0B.2   | Yes                              | Medium |
| Auth.js package installation                | Built       | Engineering                | None                                 | Phase 0B.1    | —            | No                               | Low    |
| Auth.js role/session strategy (lib/auth.ts) | Not Started | Engineering                | Provider strategy decision           | —             | Phase 0B.2   | Yes                              | Low    |
| next-intl / next-pwa installation           | Built       | Engineering                | None                                 | Phase 0B.1    | —            | No                               | Low    |
| next-intl locale routing activation         | Not Started | Engineering                | Locale-routing architecture decision | —             | Future       | Yes                              | Low    |
| next-pwa manifest/service worker            | Not Started | Engineering                | Brand icon set                       | —             | Future       | Yes — see [TASKS.md](./TASKS.md) | Low    |
| Design token finalization (brand colors)    | Not Started | School Admin → Engineering | Brand identity input                 | —             | Phase 1      | Yes — see [TASKS.md](./TASKS.md) | Medium |

---

## Relationship to Other Documents

- [ROADMAP.md](./ROADMAP.md) — what each phase delivers and its acceptance criteria.
- [TASKS.md](./TASKS.md) — current sprint's day-to-day work items.
- [PRODUCT_REQUIREMENTS.md § Feature List](./PRODUCT_REQUIREMENTS.md#5-feature-list-version-1) — the authoritative feature list and priorities this dashboard tracks.
- [PROJECT_CONTEXT.md § Current Risks](./PROJECT_CONTEXT.md#13-current-risks) — project-level risks; this document tracks feature-level risk.
