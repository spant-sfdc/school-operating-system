# Roadmap

This roadmap defines the phased delivery plan for the Pant Public School Digital Platform. Phases are sequential — a phase does not begin until the prior phase's deliverables are complete and its acceptance criteria are met.

---

## Phase 0A — Project Foundation & Documentation

**Status:** In Progress

|                         |                                                                                                                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                | Establish complete product, architecture, and design documentation before any code is written                                                                                                                                |
| **Deliverables**        | `docs/PROJECT_CONTEXT.md`, `docs/PRODUCT_REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/UI_DESIGN_SYSTEM.md`, `docs/AI_RULES.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md`, `docs/TASKS.md`, `docs/CHANGELOG.md`, `README.md` |
| **Acceptance Criteria** | All documents exist, are internally consistent, and are approved by the school stakeholder. No application code exists.                                                                                                      |

---

## Phase 0B — Technical Scaffolding

**Status:** Not Started

|                         |                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                | Stand up the empty but fully configured Next.js project — the skeleton, not the features                                                                                                                                                                                                                                                                       |
| **Deliverables**        | Next.js 15 project initialized; TypeScript strict config; Tailwind v4 + Shadcn UI installed and themed with design tokens from `UI_DESIGN_SYSTEM.md`; Prisma connected to PostgreSQL with an empty baseline schema; Auth.js installed with role-based session scaffolding; GitHub repo with branch protection; Vercel project connected; Cloudinary configured |
| **Acceptance Criteria** | `pnpm dev` (or equivalent) runs a blank themed shell locally; a commit deploys successfully to a Vercel preview; lint/typecheck pass in CI                                                                                                                                                                                                                     |

---

## Phase 1 — Public Website (Guest Experience)

**Status:** Not Started

|                         |                                                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                | Ship the public-facing marketing site                                                                                                                                |
| **Deliverables**        | Homepage, About/Academics/Facilities pages, Admissions enquiry form, Notice board, Gallery, Document downloads, Contact form                                         |
| **Acceptance Criteria** | All Guest journeys in `PRODUCT_REQUIREMENTS.md` §6.1 pass; responsive across breakpoints in `UI_DESIGN_SYSTEM.md`; admission enquiries are persisted and retrievable |

---

## Phase 2 — Authentication & Admin Foundations

**Status:** Not Started

|                         |                                                                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                | Stand up secure login and core Admin data management                                                                                                                       |
| **Deliverables**        | Auth.js login flow for Admin/Teacher; role-based route protection; Student management (CRUD); Teacher management (CRUD); School settings (academic year, classes/sections) |
| **Acceptance Criteria** | Admin can fully manage students and teachers; unauthorized role access is blocked server-side; session persists correctly                                                  |

---

## Phase 3 — Attendance

**Status:** Not Started

|                         |                                                                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                | Digitize daily attendance for teachers and give Admin oversight                                                                                                |
| **Deliverables**        | Teacher attendance marking (scoped to assigned classes); Admin attendance oversight/editing; attendance data model                                             |
| **Acceptance Criteria** | Teacher journey in `PRODUCT_REQUIREMENTS.md` §6.2 passes; a class's attendance can be marked in under 60 seconds; Admin can view attendance across all classes |

---

## Phase 4 — Examinations & Marks

**Status:** Not Started

|                         |                                                                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Goal**                | Digitize examination setup and marks entry/reporting                                                                    |
| **Deliverables**        | Admin examination management (create exams, define subjects/max marks); Teacher marks entry; Admin/Teacher reports      |
| **Acceptance Criteria** | Teacher journey in `PRODUCT_REQUIREMENTS.md` §6.3 passes; Admin can generate a class result report without spreadsheets |

---

## Phase 5 — Teacher Experience Polish & Launch Readiness

**Status:** Not Started

|                         |                                                                                                                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                | Complete remaining Teacher-facing features and prepare for production launch                                                                                                                   |
| **Deliverables**        | Teacher dashboard (today's classes, quick stats); Teacher profile management; Leave request submission; production hardening (error states, monitoring, accessibility audit, performance pass) |
| **Acceptance Criteria** | All P0/P1 features in `PRODUCT_REQUIREMENTS.md` §5 are complete; WCAG 2.1 AA audit passes; production deployment is live and stable                                                            |

---

## Post-Launch / Future Consideration

Not committed scope — evaluated independently based on school priority after Version 1 launch:

- Parent portal (view-only attendance/marks/notices)
- Student portal
- Fee management with payment gateway integration
- Homework/assignment module
- SMS/email notification integrations
- Timetable management
- Library management
- Hostel management
- Transport management
- Payroll

---

## Phase Summary Table

| Phase | Focus                      | Status      |
| ----- | -------------------------- | ----------- |
| 0A    | Foundation & Documentation | In Progress |
| 0B    | Technical Scaffolding      | Not Started |
| 1     | Public Website (Guest)     | Not Started |
| 2     | Auth & Admin Foundations   | Not Started |
| 3     | Attendance                 | Not Started |
| 4     | Examinations & Marks       | Not Started |
| 5     | Polish & Launch Readiness  | Not Started |
