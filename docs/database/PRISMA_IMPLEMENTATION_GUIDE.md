# Prisma Implementation Guide

**Purpose:** Practical guidance for whoever actually writes `prisma/schema.prisma` — schema organization, naming conventions, migration workflow, relation mode, and seeding. **Guidance, not code** — no `.prisma` file was created or edited to produce this document; every code-shaped block below is illustrative.

---

## 1. Schema File Organization

Prisma supports splitting `schema.prisma` across multiple files in a `prisma/schema/` folder (the `prismaSchemaFolder` preview feature, stabilizing across recent Prisma versions). **Recommend adopting this once the schema exceeds roughly 15 models** — a single ~29-model file is workable but genuinely harder to review and navigate than the same models split along the same lines this project already uses conceptually. Recommend one file per [docs/domain/DOMAIN_MODEL.md § 2](../domain/DOMAIN_MODEL.md#2-bounded-contexts) bounded context:

```
prisma/schema/
  school.prisma          (School, AcademicYear, Class, Section, Subject, ClassSubject)
  identity.prisma         (User, Teacher, TeacherQualification)
  people.prisma            (Student, Guardian, StudentGuardian)
  admission.prisma          (AdmissionEnquiry, AdmissionApplication, RteDetails, DocumentRecord)
  enrollment.prisma          (Enrollment, TeacherAssignment, PromotionRecord, TransferCertificate)
  attendance.prisma           (AttendanceSession, AttendanceRecord)
  examination.prisma           (ExamTerm, Examination, ExamSubjectSchedule, GradeScale, MarksRecord, ReportCard)
  audit.prisma                  (AuditLog)
```

Mirrors [MIGRATION_PLAN.md](./MIGRATION_PLAN.md)'s own grouping closely (not identically — migrations are ordered by dependency, files are organized by concern) — not a coincidence, both derive from the same bounded-context structure.

## 2. Datasource Configuration

Per [PERFORMANCE_GUIDELINES.md § 3](./PERFORMANCE_GUIDELINES.md#3-connection-pooling), the pooled/unpooled split still applies, but **not** as a `schema.prisma` `datasource` block — Prisma 7 removed `url`/`directUrl` from schema files entirely (found during Sprint 0's implementation, see [D-027](../DECISIONS.md#d-027--sprint-0-data-foundation-migrations-000-001-implemented-prisma-7-config-model-schoolstatusseed-placeholders)). The split is expressed in two places instead:

```
// prisma.config.ts — used by Prisma Migrate (migrate dev/deploy/diff)
datasource: {
  url: process.env["DIRECT_URL"],   // unpooled
}
```

```
// src/lib/db.ts — used by the runtime client, via a driver adapter
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL }); // pooled
export const db = new PrismaClient({ adapter });
```

`schema.prisma`'s own `datasource db` block keeps only `provider = "postgresql"` — no connection URL.

## 3. Partial Indexes in Prisma Migrations

Prisma's schema syntax doesn't yet have first-class support for `CREATE UNIQUE INDEX ... WHERE ...` (partial indexes). The three partial unique indexes this review recommends ([CONSTRAINT_STRATEGY.md § 3](./CONSTRAINT_STRATEGY.md#3-partial-unique-indexes), plus every soft-delete-scoped unique per [SOFT_DELETE_STRATEGY.md § 2](./SOFT_DELETE_STRATEGY.md#2-the-partial-unique-index-requirement)) need to be added by hand-editing the generated migration `.sql` file after running `prisma migrate dev --create-only`, before applying it — Prisma will preserve hand-edited SQL in a migration file as long as it isn't regenerated. Document this explicitly in each affected migration's own comment header, since it's the one place this schema requires stepping outside `schema.prisma`'s declarative syntax, and a future engineer diffing the schema file against the database could otherwise be confused about why a constraint they can't find in `schema.prisma` exists in Postgres.

## 4. Relation Mode

Explicit, real foreign keys — the default `relationMode = "foreignKeys"` behavior, not `relationMode = "prisma"` (emulated relations). See [CONSTRAINT_STRATEGY.md § 2](./CONSTRAINT_STRATEGY.md#2-foreign-keys--always-real-never-emulated) for the reasoning; this section exists only to state the concrete Prisma configuration implication: **do not set `relationMode` at all** (Postgres's native FK support is the default and correct choice; `relationMode = "prisma"` exists specifically for databases, like PlanetScale's MySQL mode, that lack native FK support, which doesn't apply here).

## 5. Seeding

`prisma/seed.ts` should seed exactly one `School` row and one `AcademicYear` row (`isCurrent = true`), sourced from `src/config/school.ts`'s existing static values — the literal migration path [PRODUCT_ARCHITECTURE.md § 2](../PRODUCT_ARCHITECTURE.md#2-future-architecture) step 3 already named: "`src/config/school.ts`'s static object becomes the fallback/seed for a `School` database record." This is not new guidance, just the concrete implementation of an already-approved direction. Recommend also seeding a minimal `GradeScale` and the `Class` list (Nursery–Class 8) from the same config file, since both are needed before any other migration's data can be meaningfully created, and both already exist as real, non-placeholder values in `src/config/school.ts` today.

## 6. Migration Workflow

- **Local development:** `prisma migrate dev` — generates and applies a migration, regenerates the Prisma Client.
- **CI/CD deploy:** `prisma migrate deploy` — applies pending migrations only, never generates new ones; this is the only command that should ever run against a production database.
- **Never** `prisma db push` against any environment holding real data — `db push` diffs the schema and applies changes directly without a migration history, which is appropriate only for rapid local prototyping before the first real migration exists, never after. Worth stating as an explicit guardrail since `db push`'s convenience makes it an easy shortcut to reach for under deadline pressure, exactly the kind of "faster now, expensive later" tradeoff [AI_RULES.md § 5](../AI_RULES.md#5-quality-bar) already warns against generally, applied here to migrations specifically.

## 7. Naming Conventions

| Prisma-side (schema.prisma)                   | Postgres-side (via `@@map`/`@map`)                                                 | Why the split                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PascalCase` model names (`AttendanceRecord`) | `snake_case` table names (`attendance_records`), via `@@map("attendance_records")` | Prisma-side stays idiomatic TypeScript convention; Postgres-side stays idiomatic SQL convention — lets both ends of the stack follow their own community's norms rather than forcing one language's convention onto the other's tooling (`psql`, database GUIs, raw SQL debugging all read more naturally in snake_case). |
| `camelCase` field names (`admissionNumber`)   | `snake_case` column names (`admission_number`), via `@map("admission_number")`     | Same reasoning, one level down.                                                                                                                                                                                                                                                                                           |

This is a one-time decision to make explicitly before the first migration, not something to retrofit — renaming tables/columns after real data and any external tooling (BI dashboards, direct SQL reports) depend on the old names is a real, avoidable migration cost.

## 8. Type Mapping Notes

- `Decimal` (Prisma) → Postgres `numeric` for `MarksRecord.marksObtained` — **not** `Float`/`Int`. Marks can be fractional (e.g., `87.5`) in some schools' grading conventions, and floating-point representation error is exactly the kind of subtle bug that corrupts a sum/average silently — `Decimal`/`numeric` is the correct type for any value that will be arithmetically aggregated and displayed to a parent as an official result.
- `Json` (Prisma) → Postgres `jsonb`, not `json` — `jsonb` is binary-stored and indexable if ever needed later; there's no scenario in this schema where plain `json`'s advantage (preserving exact input formatting/whitespace) matters, so `jsonb` should be the default, not a per-field decision.
- `DateTime` (Prisma) → Postgres `timestamptz`, not `timestamp` — always store timestamps timezone-aware, even though this system's initial deployment is single-timezone (India). Free to get right now, genuinely painful to migrate later if the platform ever serves a school outside IST.

## 9. Ready-for-Prisma Checklist

**Update (Sprint 0, 2026-07-18):** Migrations 000 (`AuditLog`) and 001 (`School`, `AcademicYear`) are now implemented — see [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) and [D-027](../DECISIONS.md#d-027--sprint-0-data-foundation-migrations-000-001-implemented-prisma-7-config-model-schoolstatusseed-placeholders). Schema-validated and SQL-generated via `prisma migrate diff` only — no live PostgreSQL was available to actually run `prisma migrate dev`/`deploy`. The checklist below still gates Migration 002 onward.

Before running the first `prisma migrate dev`:

- [x] The three schema gaps in [DATABASE_REVIEW.md § 15](./DATABASE_REVIEW.md#15-gaps-found-in-the-conceptual-model) are folded into [docs/domain/DATABASE_SCHEMA.md](../domain/DATABASE_SCHEMA.md) — done during the pre-Prisma consistency verification (2026-07-18), see [D-026](../DECISIONS.md#d-026--pre-prisma-consistency-verification-transaction-boundaries-added-schema-gaps-closed).
- [ ] Postgres host selected with pooling support confirmed (§ 3 of [PERFORMANCE_GUIDELINES.md](./PERFORMANCE_GUIDELINES.md)).
- [ ] Auth.js provider decision made ([ARCHITECTURE.md § 9](../ARCHITECTURE.md#9-open-architectural-questions)) — blocks Migration 003.
- [ ] Partitioning decision for `AuditLog` made explicitly, one way or the other (§ 3 of [AUDIT_STRATEGY.md](./AUDIT_STRATEGY.md)) — not left implicit.
- [ ] `app_role` grant-revocation plan (§ 2 of [AUDIT_STRATEGY.md](./AUDIT_STRATEGY.md)) confirmed feasible with the chosen Postgres host (some managed hosts restrict `REVOKE`/`GRANT` on the default connection role — verify before relying on it).
- [ ] Every mutation in the implementation plan is checked against [TRANSACTION_BOUNDARIES.md](./TRANSACTION_BOUNDARIES.md)'s table — multi-table writes (including a mutation's own `AuditLog` entry) wrapped in `$transaction`, never issued as separate calls.
