# Performance Guidelines

**Purpose:** Concrete growth numbers (not hand-waving) and the operational practices — connection pooling, pagination, caching, N+1 avoidance — that keep this schema performing well as those numbers materialize, on a real Vercel + serverless Postgres deployment.

---

## 1. The Deployment Shape This Assumes

Per [PRD § 9](../PRODUCT_REQUIREMENTS.md#9-non-functional-requirements) (NFR-5) and [DECISIONS.md § D-004](../DECISIONS.md#d-004--tech-stack-selection): Next.js on Vercel, PostgreSQL, no dedicated always-on server. This shape has one performance consequence every recommendation below assumes: **every database connection is short-lived and comes from a serverless function invocation, not a long-running process with a stable connection pool.** Recommendations that would be obvious defaults on a traditional server (e.g., "just open a connection pool at startup") don't apply directly here.

## 2. Growth Projections

Not estimates for their own sake — these numbers are what justify (or rule out) every partitioning/indexing decision elsewhere in this review. Based on [PRODUCT_VISION.md § 3](../PRODUCT_VISION.md#3-target-audience)'s target of 200–2,000 students per school, ~220 school days/year, one school (today's actual scale):

| Table                 | Rows/year (low end) | Rows/year (high end) | Rows after 15 years (low) | Rows after 15 years (high) |
| --------------------- | ------------------- | -------------------- | ------------------------- | -------------------------- |
| `Enrollment`          | 200                 | 2,000                | 3,000                     | 30,000                     |
| `AttendanceRecord`    | 44,000              | 440,000              | 660,000                   | 6,600,000                  |
| `MarksRecord`         | 3,600               | 100,000              | 54,000                    | 1,500,000                  |
| `AuditLog`            | ~150,000            | ~1,500,000           | ~2,250,000                | ~22,500,000                |
| `TransferCertificate` | <50                 | <200                 | <750                      | <3,000                     |

`AuditLog`'s estimate assumes roughly 3× the combined `AttendanceRecord`+`MarksRecord` row count, since it captures every mutation across all 29 entities, not just these two — a conservative multiplier, likely an undercount once Admin/Teacher CRUD activity is included.

**These numbers are for one school.** At real Epic H multi-tenant scale — even a modest 20–50 schools, well short of any ambitious platform target — `AttendanceRecord` alone reaches the 10–300 million row range within 15 years. This is the concrete case for [DATABASE_REVIEW.md § 9](./DATABASE_REVIEW.md#9-attendance-attendancesession--attendancerecord)'s partitioning recommendation: these are not hypothetically large numbers, they're the direct consequence of the product actually succeeding at the scale [PRODUCT_VISION.md](../PRODUCT_VISION.md) describes.

## 3. Connection Pooling

**Required, not optional, given § 1's deployment shape.** Every serverless function invocation opening a fresh direct Postgres connection exhausts Postgres's connection limit (typically low hundreds) far faster than request volume alone would suggest, since connections aren't reused across invocations the way they would be on a long-running server. Recommend:

- Use a pooled connection string (PgBouncer in transaction mode, or a managed equivalent — most serverless-friendly Postgres hosts, e.g., Neon or Supabase, provide this natively) for the application's runtime `DATABASE_URL`.
- Keep a separate, unpooled `DIRECT_URL` for Prisma Migrate — migrations need a direct connection since some DDL operations aren't compatible with transaction-mode pooling. This is a standard, well-documented Prisma pattern (`datasource db { url = env("DATABASE_URL") directUrl = env("DIRECT_URL") }`) — cited here as a requirement for [PRISMA_IMPLEMENTATION_GUIDE.md § 2](./PRISMA_IMPLEMENTATION_GUIDE.md#2-datasource-configuration) to implement, not re-derived independently.

## 4. Caching Considerations

Not a caching _layer_ recommendation (out of scope for a database review, and premature — no real load exists yet to cache against) but two specific, cheap opportunities worth naming since they fell directly out of this review's own query-pattern analysis:

- **"Current academic year"** ([QUERY_PATTERNS.md § 9](./QUERY_PATTERNS.md#9-get-the-current-academic-year-highest-frequency-lookup-in-the-whole-system)) — read on nearly every request, changes at most once a year. A genuine candidate for request-scoped memoization (React's `cache()`/Next.js's per-request deduplication) at minimum, and possibly a short-TTL (a few minutes) cache at the edge once real traffic patterns are observed. Not urgent for V1 — the query itself is already index-backed and cheap; this is a "nice, low-risk win" not a performance requirement.
- **`GradeScale.bands`** — read on every marks-entry and report-generation call, changes rarely. Same reasoning as above.

Explicitly **not** recommended for V1: a general-purpose query cache (Redis or similar) — no evidence yet of a query that's both expensive and hot enough to justify the added infrastructure and cache-invalidation complexity. Revisit only once real production load data exists to point at a specific slow, hot query — the same "generalize from one real proof, not speculation" discipline [PRODUCT_VISION.md § 7](../PRODUCT_VISION.md#7-product-philosophy) already applies elsewhere.

## 5. N+1 Avoidance

A schema-adjacent risk, not a schema property — worth stating as a guideline since the entities most prone to it (`Enrollment` → `Student` + `Section` + `Class`, `MarksRecord` → `Enrollment` → `Student`) are exactly the ones every list-view report in [REPORTING_MODEL.md](../domain/REPORTING_MODEL.md) touches. Recommend a standing code-review checklist item for Epic B: any list endpoint rendering N rows of related data must use a single query with `include`/`select` (Prisma's relation-loading) or an explicit join, never a loop issuing one query per row. This is a code-quality guideline for the implementation team, not something the schema itself can enforce — flagged here because the query patterns in this review make the risk concrete (e.g., the Class Examination Result Summary report touching `MarksRecord` × `Enrollment` × `Student` for every student in a class is a classic N+1 trap if implemented naively).

## 6. Pagination

Any Admin-facing list that can exceed a page (`Student` list, `Enrollment` history, `AuditLog` browsing) should use **keyset pagination** (`WHERE (createdAt, id) < ($lastSeenCreatedAt, $lastSeenId) ORDER BY createdAt DESC, id DESC LIMIT N`), not `OFFSET`-based pagination. `OFFSET` pagination degrades linearly with page depth (page 500 requires scanning and discarding the first 4,999 rows) and produces inconsistent results if rows are inserted/deleted between page loads — both real problems for a table like `AuditLog` that's actively being written to while an Admin might be browsing it. Cheap to design correctly from the first list-view built; expensive to retrofit once client code has already been written against an `OFFSET`-shaped API contract.

## 7. Deferred Optimizations

Named explicitly so they're tracked, not forgotten, without being built prematurely:

- **Trigram/fuzzy name search** on `Student`/`Guardian` (`pg_trgm` GIN index) — see [INDEXING_STRATEGY.md § 8](./INDEXING_STRATEGY.md#8-deliberately-not-indexed). Revisit once a school's real student count and Admin search frequency make an unindexed `ILIKE` scan a measured bottleneck, not before.
- **Read replicas** — no case for this at any scale this review projects (§ 2's 15-year numbers are still comfortably within a single well-indexed Postgres primary's capability). Revisit only if Epic H's multi-tenant scale, combined with real reporting load, produces measured primary-database contention.
- **Materialized views for reporting aggregates** — `REPORTING_MODEL.md`'s reports are all straightforward `GROUP BY` aggregations over indexed columns; no evidence yet that any of them are slow enough to need pre-computation. Revisit if a specific report is measured to be slow at real data volume, not speculatively.
