# Constraint Strategy

**Purpose:** What this schema enforces at the database layer versus what it leaves to application code, and why each choice was made deliberately rather than by default. [BUSINESS_RULES.md](../domain/BUSINESS_RULES.md) already classified rules as Code vs. Configuration; this document adds a third axis specific to physical design — **Database-enforced vs. Application-enforced** — since a rule can be "universal code" (per `BUSINESS_RULES.md`) while still being the kind of thing that should live in a `CHECK` constraint rather than only a Server Action.

---

## 1. The Core Question

**Would a bug or a race condition that skips the application layer entirely still be caught?** If yes only because "the code always calls the right function," that's an application-enforced rule, and it's one bad migration, one raw SQL fix, or one future engineer away from silent corruption. If a constraint makes the violation physically impossible regardless of which code path attempts it, it's database-enforced. Default to database-enforced whenever Postgres can express the rule at all — the cost is one line in a migration; the alternative cost is a production data-integrity incident that's expensive to detect and worse to clean up.

## 2. Foreign Keys — Always Real, Never Emulated

Every relation in [DATABASE_SCHEMA.md](../domain/DATABASE_SCHEMA.md) should be a real Postgres foreign key constraint, not Prisma's `relationMode = "prisma"` (emulated relations, needed only for databases without native FK support, like PlanetScale's MySQL mode). This system runs on Postgres, which has full native FK support — using emulated relations here would trade away real, `Postgres`-level referential integrity for nothing. See [PRISMA_IMPLEMENTATION_GUIDE.md § 4](./PRISMA_IMPLEMENTATION_GUIDE.md#4-relation-mode) for the specific Prisma configuration this implies.

**`onDelete` behavior**, since almost nothing in this schema hard-deletes (see [SOFT_DELETE_STRATEGY.md](./SOFT_DELETE_STRATEGY.md)): default every FK to `onDelete: Restrict`, not `Cascade`. A `Cascade` default is the wrong instinct for a system where "delete" is almost never the real operation — it would mean a rare, legitimate hard-delete (e.g., removing a duplicate `Student` record entered twice before any real data was attached to it) accidentally taking out unrelated history if the relation graph is ever misjudged. `Restrict` forces every hard-delete to be a deliberate, single-table operation performed only when nothing references the row — which, per [DATABASE_REVIEW.md § 14](./DATABASE_REVIEW.md#14-the-four-questions-answered-directly), should be true for almost every entity almost all of the time anyway.

## 3. Partial Unique Indexes

The single most-reused pattern in this review, used three times across [DATABASE_REVIEW.md](./DATABASE_REVIEW.md) and worth defining once, here:

```sql
CREATE UNIQUE INDEX <name> ON "<Table>" (<columns>) WHERE <condition>;
```

A **partial unique index** enforces uniqueness only among rows matching a condition — exactly what's needed whenever "exactly one X" only applies to a subset of rows, not the whole table. Prisma doesn't yet have first-class syntax for partial indexes in the schema file (as of the Prisma versions available when this review was written); they need to be added via a manual migration `.sql` edit after `prisma migrate dev` generates the base migration, or via `@@index` with a raw SQL block in newer Prisma versions that support it — a detail for [PRISMA_IMPLEMENTATION_GUIDE.md § 3](./PRISMA_IMPLEMENTATION_GUIDE.md#3-partial-indexes-in-prisma-migrations) to resolve at implementation time, not this document.

**The three uses in this schema:**

1. `AcademicYear`: exactly one `isCurrent = true` per `schoolId` — see [DATABASE_REVIEW.md § 4](./DATABASE_REVIEW.md#4-academic-year).
2. `TeacherAssignment`: exactly one `isClassTeacher = true` per `(sectionId, academicYearId)` — see [DATABASE_REVIEW.md § 7](./DATABASE_REVIEW.md#7-teacher-assignment).
3. Any future soft-deletable entity's "normal" unique constraint, scoped to `WHERE "deletedAt" IS NULL` — see [SOFT_DELETE_STRATEGY.md § 2](./SOFT_DELETE_STRATEGY.md#2-the-partial-unique-index-requirement).

## 4. Check Constraints

Postgres `CHECK` constraints for invariants that are simple, row-local, and never legitimately violated — not a substitute for application validation (which still owns the user-facing error message, per [DEVELOPMENT_CONVENTIONS.md § 8](../DEVELOPMENT_CONVENTIONS.md#8-error-handling)), but a last-line guarantee the database itself refuses to store an impossible value:

| Table                 | Check                                                         | Why database-enforced, not just application-enforced                                                                                                                  |
| --------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ExamSubjectSchedule` | `passMarks <= maxMarks`                                       | A row-local numeric invariant — cheap to check, catastrophic if silently violated (a nonsensical exam configuration would corrupt every downstream grade calculation) |
| `MarksRecord`         | `marksObtained >= 0`                                          | Same category — a negative mark is never valid regardless of which code path wrote it                                                                                 |
| `AcademicYear`        | `endDate > startDate`                                         | A row-local date invariant                                                                                                                                            |
| `DocumentRecord`      | `ownerType IN ('Student', 'Teacher', 'AdmissionApplication')` | See [ENUM_STRATEGY.md § 3](./ENUM_STRATEGY.md#3-the-documentrecord-polymorphic-case) for why this is a `CHECK`, not a native enum                                     |

**Explicitly not database-enforced:** `MarksRecord.marksObtained <= ExamSubjectSchedule.maxMarks`. This is a cross-row invariant (it depends on a _different table's_ value), which Postgres `CHECK` constraints cannot express directly (they can only reference columns in the same row). This one stays application-enforced, exactly where [BUSINESS_RULES.md § 5](../domain/BUSINESS_RULES.md#5-examinations--grading) already places it — the database-enforcement principle in § 1 has a real limit, and pretending otherwise (e.g., via a trigger) would add meaningful complexity for a rule the application layer already owns cleanly.

## 5. NOT NULL Policy

Default every field to `NOT NULL` unless nullability is a deliberate, named state, not just "we're not sure yet." Cross-checked against [DATA_DICTIONARY.md](../domain/DATA_DICTIONARY.md)'s own Null? column — three patterns of legitimate nullability appear there, each with a different physical implication:

1. **Genuinely optional facts** (`Guardian.email`, `Class.capacity`) — nullable, no further action needed.
2. **Not-yet-confirmed placeholders that will eventually be required** (this doesn't apply to the database layer at all — placeholder bracketing per [CONTENT_GUIDELINES.md § 12](../CONTENT_GUIDELINES.md#12-what-this-platform-never-says) is a _content_ concept, living in `src/config/`/page `content.ts` files today; once School Admin data moves into the database via Epic B's Website Content Management milestone, these become genuinely required `NOT NULL` fields with real values, not nullable database columns holding bracketed strings).
3. **Latent future-feature fields** (`RteDetails.reimbursementStatus`) — nullable now, correctly so, since the feature it supports isn't built.

## 6. Summary Table — Database-Enforced vs. Application-Enforced

| Rule category                                                                     | Enforcement                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uniqueness (including partial/conditional uniqueness)                             | **Database** — `@@unique` / partial unique index                                                                                                                                                                                                                      |
| Referential integrity (a FK must point to a real row)                             | **Database** — real Postgres FK, `Restrict` on delete                                                                                                                                                                                                                 |
| Row-local numeric/date invariants (`passMarks <= maxMarks`, etc.)                 | **Database** — `CHECK` constraint                                                                                                                                                                                                                                     |
| Cross-row/cross-table invariants (`marksObtained <= linked maxMarks`)             | **Application** — cannot be expressed as a same-row `CHECK`                                                                                                                                                                                                           |
| School-configurable business rules (promotion policy, age cutoffs, grading scale) | **Application** — by design, per [BUSINESS_RULES.md § 10](../domain/BUSINESS_RULES.md#10-summary--configuration-vs-code-at-a-glance); these must stay editable without a migration                                                                                    |
| Role/permission scoping (Teacher can only touch assigned sections)                | **Application** — server-side query filtering, per [PERMISSION_MATRIX.md § 8](../domain/PERMISSION_MATRIX.md#8-cross-cutting-enforcement-principles); not a database-level concern in this architecture (no Postgres Row-Level Security is in scope for V1 — see § 7) |

## 7. Row-Level Security — Considered, Not Adopted for V1

Postgres Row-Level Security (RLS) could enforce `schoolId` scoping and role-based access at the database layer, independent of application code. Considered and explicitly deferred, not rejected outright: RLS adds real operational complexity (every connection needs the right session variables set, migrations become harder to reason about, and Prisma's RLS support is not as mature as its core query API). For a single-tenant V1 with server-side scoping already required by [ARCHITECTURE.md § 7](../ARCHITECTURE.md#7-security-principles) and [NFR-7](../PRODUCT_REQUIREMENTS.md#9-non-functional-requirements), RLS would be defense-in-depth for a threat model (a compromised or buggy application server bypassing its own query filters) that doesn't yet justify its cost. **Revisit at Epic H** (real multi-tenancy) — RLS becomes considerably more attractive once `schoolId` scoping is protecting genuinely different customers from each other, not just organizing one customer's own data.
