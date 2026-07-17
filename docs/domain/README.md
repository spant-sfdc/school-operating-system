# School Domain Model

**Purpose:** This is the complete domain model for the School Operating System (SOS) — the source of truth for every future database, API, and business-logic implementation, starting with [Epic B — Administration](../ROADMAP_V2.md#epic-b--administration). It answers "what does a school actually consist of, and how does it actually run" independent of any specific board, state, or implementation detail.

**Status:** Architecture only. **Nothing in `docs/domain/` has been implemented.** There is no Prisma schema, no database, no API route, no React component behind any of this yet — see [PROJECT_CONTEXT.md § 3](../PROJECT_CONTEXT.md#3-current-architecture-summary): Prisma has zero models today. This document set exists so that when Epic B actually begins, the data model is designed once, deliberately, against real Indian-school domain knowledge — not improvised table-by-table under implementation pressure.

---

## 1. Why This Exists Now, Ahead of Any Code

[PRODUCT_VISION.md § 6](../PRODUCT_VISION.md#6-engineering-philosophy) and [PRODUCT_ARCHITECTURE.md § 2](../PRODUCT_ARCHITECTURE.md#2-future-architecture) already establish that every future Prisma model should carry `schoolId` scoping from its first migration, because retrofitting that after real relational data exists is expensive. The same logic applies one level up: getting the _shape_ of `Student`, `Enrollment`, `AttendanceRecord`, `MarksRecord`, and `TransferCertificate` right before the first migration is exists is cheap; discovering mid-Epic-B that Indian schools need a `PromotionRecord` per academic year rather than a single mutable "current class" field on `Student` — after real attendance/marks data already references the wrong shape — is not.

This is architecture work explicitly authorized ahead of implementation, the same way [Product Architecture Foundation](../DECISIONS.md#d-019--product-pivot-school-operating-system-sos-pant-public-school-as-first-implementation) and the [Content Readiness Framework](../onboarding/README.md) were architecture/process work done ahead of (respectively, alongside) the features they support.

## 2. What This Is Not

- **Not a build authorization.** No Prisma model, migration, API route, or UI component should be created from reading this document set alone. Epic B's actual implementation still needs its own scoped task, per [MASTER_PROMPT.md § 3](../MASTER_PROMPT.md#3-workflow).
- **Not a scope expansion.** Every entity and workflow here stays inside [PRODUCT_REQUIREMENTS.md § 3](../PRODUCT_REQUIREMENTS.md#3-scope-version-1)'s Guest/Admin/Teacher scope for what gets _built_ in V1. Where this document set names a future integration point — Fee, Transport, Parent Portal, Student Portal — it is documenting an **extension seam**, not designing the module itself. Building any of those still requires the [Module Approval Process](../PROJECT_GUARDRAILS.md#2-module-approval-process) first, per [PROJECT_GUARDRAILS.md § G-8](../PROJECT_GUARDRAILS.md#1-the-core-guardrails). See § 5 below.
- **Not CBSE-only, not Rajasthan-only.** Pant Public School is a Rajasthan-based, Nursery–Class 8 school, and it is the first real implementation — but the model is deliberately designed for the ~80% of independent Indian K-8 schools that share its shape (see [DOMAIN_MODEL.md § 1](./DOMAIN_MODEL.md#1-scope--assumptions)), with school-specific and state-specific variation pushed into configuration and data, not hardcoded into the schema.

## 3. Document Map

Read in this order — each builds on the one before it:

| Document                                       | Answers                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [DOMAIN_MODEL.md](./DOMAIN_MODEL.md)           | What are the bounded contexts, the major entities, and the lifecycles that connect them?                      |
| [ERD.md](./ERD.md)                             | How do those entities relate to each other, structurally?                                                     |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)     | What would each entity look like as a table — illustrative shape, not an executable schema?                   |
| [DATA_DICTIONARY.md](./DATA_DICTIONARY.md)     | What is every field, its type, its constraints, and its PII classification?                                   |
| [BUSINESS_RULES.md](./BUSINESS_RULES.md)       | What rules govern this data, and which are universal code vs. per-school configuration?                       |
| [WORKFLOWS.md](./WORKFLOWS.md)                 | What are the actual step-by-step processes — admission, attendance, exams, promotion, TC?                     |
| [EVENT_MODEL.md](./EVENT_MODEL.md)             | What domain events occur, and what future consumers (notifications, audit, reports) need them?                |
| [PERMISSION_MATRIX.md](./PERMISSION_MATRIX.md) | Who — Guest, Admin, Teacher, and future Parent/Student — can do what, to which data?                          |
| [REPORTING_MODEL.md](./REPORTING_MODEL.md)     | What reports does the school need, and what do they aggregate from?                                           |
| [API_BOUNDARIES.md](./API_BOUNDARIES.md)       | What are the logical module boundaries for the future internal API, and where does external API access begin? |

## 4. Research Basis

This model is grounded in the regulatory and operational reality of independent Indian K-8 schools, not invented generically. Specifically accounted for — cited inline throughout these documents wherever they shape a concrete modeling decision, not just asserted here:

- **RTE Act 2009** — 25% Economically Weaker Section (EWS) reservation in private unaided schools (Section 12(1)(c)), minimum teacher qualification norms, Pupil-Teacher Ratio (PTR) norms, and the no-detention policy up to Class 8 as originally enacted.
- **RTE Amendment Act 2019** — allows individual states to reintroduce a detention/re-examination policy for Class 5 and Class 8. Rajasthan is one of the states that has done so. This is why promotion policy is modeled as **configuration**, not a hardcoded rule — see [BUSINESS_RULES.md § 6](./BUSINESS_RULES.md#6-promotion--detention-policy).
- **UDISE+ (Unified District Information System for Education)** — the national school- and student-level identifier system every recognized Indian school, regardless of board or state, reports into. Modeled explicitly (`School.udiseCode`, `Student.udisePen`) because it is a real, near-universal compliance fact, not a Pant-Public-School-specific one.
- **Board affiliation is not board exams, for this school's age range.** CBSE/ICSE/State Board affiliation governs syllabus alignment and (for Nursery–Class 8) mostly _recognition_ status, not exam administration — board-conducted exams begin at Class 9/10 for essentially every Indian board. This is why `Examination`, `GradeScale`, and `MarksRecord` are modeled as fully school-defined and school-configured, not board-driven — see [DOMAIN_MODEL.md § 4.6](./DOMAIN_MODEL.md#46-examination) and [BUSINESS_RULES.md § 5](./BUSINESS_RULES.md#5-examinations--grading).
- **Age-cutoff and admission-interview norms vary by state and are actively litigated/regulated** (several states, including Delhi, restrict formal interviews for pre-primary/Class 1 admission). Modeled as configuration (age cutoffs) and a documented business rule (no formal entrance test below a configurable class), not a hardcoded number — see [BUSINESS_RULES.md § 2](./BUSINESS_RULES.md#2-admission-eligibility).
- **The Transfer Certificate (TC)** is a legally mandated, state-format-prescribed document with a specific, near-universal set of required fields (admission number, category, attendance, conduct, promotion status, reason for leaving) — modeled as its own entity with that field set, not a generic "document," because its content is legally constrained, not editorial. See [DOMAIN_MODEL.md § 4.9](./DOMAIN_MODEL.md#49-transfercertificate) and [WORKFLOWS.md § 6](./WORKFLOWS.md#6-transfer--withdrawal-workflow).

## 5. Future Integration Points — Named, Not Designed

Per [PROJECT_GUARDRAILS.md § 2](../PROJECT_GUARDRAILS.md#2-module-approval-process), Fee Management, Transport, Parent Portal, and Student Portal all remain **out of Version 1 scope** and require their own Module Approval Process before any real design work begins on them. What this document set does — because the task that produced it explicitly asked for these integration points to be _named_ — is mark the **seams**: which existing entity a future module would attach to, and what shape that attachment would likely take, so that Epic B's real schema doesn't accidentally foreclose them. It does not define their fields, workflows, or business rules. Everywhere one of these appears, it is labeled **Future — not in scope, requires Module Approval Process** to keep this distinction unambiguous for any future reader. See [PRODUCT_VISION.md § 9](../PRODUCT_VISION.md#9-future-expansion) for the same framing already applied to Parent/Student portals at the product-vision level.

## 6. Configuration vs. Database — Reconciling with `CONFIGURATION_GUIDE.md`

[CONFIGURATION_GUIDE.md](../CONFIGURATION_GUIDE.md) already classifies `src/config/school.ts`'s `SCHOOL.classes` (today: a flat display array like `["Nursery", "LKG", ..., "Class 8"]`, used only to render marketing copy on the public website) as **Configuration**. Once Epic B builds the real academic-structure tables, `Class`/`Section`/`Subject` become genuine **Database** entities — they're created, edited, and queried by user action (an Admin adding a new section when enrollment grows), not by a developer editing a file, which is exactly [CONFIGURATION_GUIDE.md § 4](../CONFIGURATION_GUIDE.md#4-what-belongs-in-a-future-database)'s own rule of thumb for what belongs in the database. These are not in conflict: `src/config/school.ts`'s static list becomes **seed data** for the real `Class` table the day Epic B ships, and the marketing site keeps reading from config (or, later, from the database via the same values) — the two representations of "what classes does this school teach" converge in content, not in mechanism. See [DOMAIN_MODEL.md § 4.2](./DOMAIN_MODEL.md#42-class).

## 7. Self Review

- **Did this invent Indian-education facts, or derive them from established regulation?** Derived — every India-specific rule cited in § 4 above (RTE quota, UDISE, TC field requirements, admission-interview restrictions, state-level detention policy variance) is real, publicly documented regulation or near-universal school practice, not invented for this project. Where a specific number or policy varies by state (age cutoffs, PTR ratios, detention policy), it is explicitly modeled as configuration, not hardcoded as if Rajasthan's (or CBSE's) value were universal.
- **Did this assume CBSE-only or Rajasthan-only?** No — checked explicitly per entity; anywhere a board- or state-specific fact would otherwise leak into a hardcoded field or rule, it is pushed into `School`-level or `AcademicYear`-level configuration instead (grading scale, promotion policy, admission categories, age cutoffs).
- **Did this over-design ahead of real need?** The entity count (~29) is larger than a minimal V1 slice — deliberately, because the task's own brief asked for the _complete_ domain model as a durable source of truth, not an MVP schema. [DOMAIN_MODEL.md § 8](./DOMAIN_MODEL.md#8-recommended-build-order) explicitly states that Epic B should still implement incrementally (Student/Teacher/Enrollment first), not build all 29 tables in one migration — the completeness lives in the documentation, not in a mandate to build everything at once. This preserves the project's own YAGNI discipline at _build_ time while giving that build a correct target to build incrementally toward.
