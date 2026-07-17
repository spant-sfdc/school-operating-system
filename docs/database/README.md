# Physical Database Review

**Purpose:** [docs/domain/](../domain/README.md) answered "what does a school consist of, and how does it run" — the conceptual model. This folder answers the next question, one level down: "how should that model actually be built as a Postgres database that a real team maintains for the next 15 years." Same discipline as the domain model: **architecture only, nothing implemented.** No `prisma/schema.prisma` was touched, no migration was created, no SQL was run against any database. Every code-shaped block in these documents is illustrative, the same convention [docs/domain/DATABASE_SCHEMA.md](../domain/DATABASE_SCHEMA.md) already established.

## 1. Why This Review Exists, and Why Now

[docs/domain/DATABASE_SCHEMA.md](../domain/DATABASE_SCHEMA.md) is a **shape** — it establishes which fields exist and how tables relate. It was explicitly not a physical design: it doesn't decide primary-key generation strategy, which constraints are enforced in the database versus only in application code, which tables need partitioning, or in what order migrations should actually ship. Those are exactly the questions that are cheap to get right before the first migration and expensive to fix after real attendance/marks data exists across millions of rows — the same "cheap now, expensive later" argument that already justified `schoolId`-from-day-one ([PRODUCT_ARCHITECTURE.md § 2](../PRODUCT_ARCHITECTURE.md#2-future-architecture)) and `Enrollment`-not-a-flat-field ([D-022](../DECISIONS.md#d-022--school-domain-model-board-agnostic-enrollment-centric-rte-aware)). This review exists to close that gap deliberately, ahead of Epic B, rather than improvising it migration-by-migration under implementation pressure.

## 2. What This Is Not

- **Not a build authorization.** No Prisma model, migration, index, or constraint should be created from reading this document set alone.
- **Not a re-litigation of the domain model.** Entity existence, relationships, and business rules were decided in [docs/domain/](../domain/README.md) and are treated here as settled input, not reopened — this review is about physical realization, not conceptual redesign. Where a physical concern reveals a genuine gap in the conceptual model (three were found — see [DATABASE_REVIEW.md § 8](./DATABASE_REVIEW.md#8-gaps-found-in-the-conceptual-model)), it's flagged as a correction to carry back, not silently patched over.
- **Not scope-expanding.** Every recommendation stays inside the same ~29-entity, Guest/Admin/Teacher, non-multi-tenant-yet scope [docs/domain/README.md § 2](../domain/README.md#2-what-this-is-not) already established.

## 3. Document Map

Read in this order:

| Document                                                           | Answers                                                                                               |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| [DATABASE_REVIEW.md](./DATABASE_REVIEW.md)                         | Entity-by-entity physical review — PK strategy, constraints, indexes, audit, soft delete, growth      |
| [INDEXING_STRATEGY.md](./INDEXING_STRATEGY.md)                     | Every index this schema needs, and the specific query each one serves                                 |
| [CONSTRAINT_STRATEGY.md](./CONSTRAINT_STRATEGY.md)                 | What's enforced by the database versus only by application code, and why                              |
| [ENUM_STRATEGY.md](./ENUM_STRATEGY.md)                             | Native Postgres enum vs. plain string vs. lookup table, per field                                     |
| [AUDIT_STRATEGY.md](./AUDIT_STRATEGY.md)                           | How `AuditLog` is physically enforced append-only, partitioned, and retained                          |
| [SOFT_DELETE_STRATEGY.md](./SOFT_DELETE_STRATEGY.md)               | Which entities soft-delete, which never delete at all, and the partial-unique-index gotcha            |
| [QUERY_PATTERNS.md](./QUERY_PATTERNS.md)                           | The actual expected queries, in the shape that justifies the indexing strategy                        |
| [TRANSACTION_BOUNDARIES.md](./TRANSACTION_BOUNDARIES.md)           | Which multi-table writes must be atomic, and what happens on partial failure                          |
| [MIGRATION_PLAN.md](./MIGRATION_PLAN.md)                           | Small, independent, ordered migrations — no mega migration                                            |
| [PERFORMANCE_GUIDELINES.md](./PERFORMANCE_GUIDELINES.md)           | Growth projections, connection pooling, pagination, N+1 avoidance                                     |
| [PRISMA_IMPLEMENTATION_GUIDE.md](./PRISMA_IMPLEMENTATION_GUIDE.md) | Schema organization, naming, migration workflow, relation mode, seeding — for whoever implements this |

## 4. Reading Basis

Every recommendation in this folder is grounded in something already established, not invented fresh:

- Entity shapes and relationships: [docs/domain/DATABASE_SCHEMA.md](../domain/DATABASE_SCHEMA.md), [docs/domain/DATA_DICTIONARY.md](../domain/DATA_DICTIONARY.md).
- Business rules that constrain physical design (promotion policy variance, RTE quota, grading configurability): [docs/domain/BUSINESS_RULES.md](../domain/BUSINESS_RULES.md).
- Query shapes: [docs/domain/WORKFLOWS.md](../domain/WORKFLOWS.md), [docs/domain/REPORTING_MODEL.md](../domain/REPORTING_MODEL.md), [docs/domain/PERMISSION_MATRIX.md](../domain/PERMISSION_MATRIX.md).
- Platform trajectory (`schoolId`-from-day-one, `getCurrentSchool()` seam, eventual multi-tenancy): [PRODUCT_ARCHITECTURE.md § 2](../PRODUCT_ARCHITECTURE.md#2-future-architecture).
- Build sequencing precedent: [docs/domain/DOMAIN_MODEL.md § 11](../domain/DOMAIN_MODEL.md#11-recommended-build-order), reordered here based on physical (not conceptual) dependencies — see [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) for where and why the order changes.

## 5. Self Review

- **Did this re-decide anything the domain model already settled?** No — every entity, field, and relationship is treated as fixed input. Three real gaps were found (a missing `Section` uniqueness constraint, a missing `Subject` uniqueness constraint, and `TransferCertificate.tcNumber`'s uniqueness scope) — these are physical omissions in [docs/domain/DATABASE_SCHEMA.md](../domain/DATABASE_SCHEMA.md), not conceptual disagreements, and are flagged for that document to be corrected in its own future edit, not silently fixed here.
- **Did this over-engineer for scale this system doesn't have yet?** Checked explicitly per recommendation. `AuditLog` partitioning is flagged as a real, considered tradeoff (cheap now, painful to retrofit) rather than a mandate — see [AUDIT_STRATEGY.md § 3](./AUDIT_STRATEGY.md#3-partitioning). Time-ordered IDs are recommended only for the three genuinely high-volume append-heavy tables (`AttendanceRecord`, `MarksRecord`, `AuditLog`), not applied blanket across all 29 entities, which would be exactly the kind of premature uniformity this project's YAGNI culture ([D-013](../DECISIONS.md#d-013--phase-1b1-architecture-review-reaffirmed-role-segmented-components-added-a-feature-subgrouping-threshold-rule), [D-014](../DECISIONS.md#d-014--sectiondivider-yagni-simplification)) already rejects elsewhere.
- **Is this ready for Prisma?** Yes, with the three flagged gaps folded in first — see the final report for the precise Freeze/Blocked-equivalent verdict.
