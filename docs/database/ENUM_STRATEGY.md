# Enum Strategy

**Purpose:** For every field in [DATABASE_SCHEMA.md](../domain/DATABASE_SCHEMA.md) that looks enum-shaped, decide whether it should be a native Postgres enum, a plain string (optionally `CHECK`-constrained), or a small lookup table — and state the rule that makes the decision repeatable for any _future_ field, not just the ones reviewed here.

## 1. The Core Question

**Is this set of values fixed at the code level, or can a school (today) or a future tenant (eventually) need a value outside it?** This is the same underlying question [CONFIGURATION_GUIDE.md § The Core Question](../CONFIGURATION_GUIDE.md#the-core-question) already asks about configuration vs. code — applied here specifically to "should this be a database type." A native Postgres enum is a schema object: adding a value is a migration (`ALTER TYPE ... ADD VALUE`, which is non-blocking in modern Postgres but still a deploy event, not a data change an Admin can make). If there's any realistic chance a school-specific or future-tenant-specific value needs to be added without a code deploy, it isn't a native-enum candidate — full stop, regardless of how small or stable the set looks today.

## 2. Fields That Should Be Native Postgres Enums

Fixed, universal, never Admin-editable, genuinely closed sets:

| Field                              | Values                                                 | Why it's safe as a native enum                                                                                                                               |
| ---------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `User.role`                        | `ADMIN`, `TEACHER` (reserved: `PARENT`, `STUDENT`)     | A code-level authorization concept, per [D-001](../DECISIONS.md#d-001--three-roles-only-for-version-1) — never school-configurable                           |
| `School.status`                    | `ACTIVE` (only value in V1)                            | Lifecycle state, code-owned                                                                                                                                  |
| `AcademicYear.status`              | `ACTIVE`, `CLOSED`                                     | Lifecycle state, code-owned                                                                                                                                  |
| `Teacher.status`                   | `ACTIVE`, `ON_LEAVE`, `EXITED`                         | Lifecycle state, code-owned                                                                                                                                  |
| `Student.status`                   | `ACTIVE`, `ALUMNI`, `TRANSFERRED_OUT`, `WITHDRAWN`     | Lifecycle state, code-owned                                                                                                                                  |
| `AdmissionEnquiry.status`          | `NEW`, `CONTACTED`, `CONVERTED`, `CLOSED`              | Workflow state, code-owned                                                                                                                                   |
| `AdmissionApplication.status`      | `SUBMITTED` → ... → `CONFIRMED`/`REJECTED`/`WITHDRAWN` | Workflow state, code-owned                                                                                                                                   |
| `AttendanceRecord.status`          | `PRESENT`, `ABSENT`, `HALF_DAY`, `LEAVE`               | [DOMAIN_MODEL.md § 7.2](../domain/DOMAIN_MODEL.md#72-attendancerecord) already states this is fixed, not school-configurable                                 |
| `StudentGuardian.relationshipType` | `FATHER`, `MOTHER`, `LEGAL_GUARDIAN`, `OTHER`          | [DATA_DICTIONARY.md](../domain/DATA_DICTIONARY.md) already states "fixed small enum, not school-configurable"                                                |
| `PromotionRecord.outcome`          | `PROMOTED`, `DETAINED`, `TRANSFERRED_OUT`, `WITHDRAWN` | Code-level decision outcome                                                                                                                                  |
| `PromotionRecord.basis`            | `EXAM_RESULT`, `NO_DETENTION_POLICY`, `RE_EXAM`        | **Currently a plain `String` in the illustrative schema — recommend promoting to an enum**, see [DATABASE_REVIEW.md § 13](./DATABASE_REVIEW.md#13-promotion) |
| `AuditLog.action`                  | `CREATE`, `UPDATE`, `SOFT_DELETE`                      | Fixed, code-level, append-only-log vocabulary                                                                                                                |

## 3. Fields That Should Not Be Native Enums

Values a school configures, a future tenant might extend, or a government/regulatory list that genuinely varies by state — already correctly modeled as `String` in [DATABASE_SCHEMA.md](../domain/DATABASE_SCHEMA.md); confirmed here, not changed:

| Field                                    | Why it must stay a string (or JSON)                                                                                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `School.affiliationBoard`                | CBSE/ICSE/State Board/Unaffiliated — school-configurable, per [BUSINESS_RULES.md § 10](../domain/BUSINESS_RULES.md#10-summary--configuration-vs-code-at-a-glance) |
| `Student.category`                       | General/SC/ST/OBC/EWS/... — government-defined but state lists genuinely vary; a new category value must never require a code deploy                              |
| `AdmissionApplication.admissionCategory` | General/RTE/Management Quota/Staff Ward/Sibling/... — explicitly school-configurable                                                                              |
| `ExamTerm.name`                          | "Unit Test 1"/"Half-Yearly"/"FA1"/... — explicitly school-configurable, per [BUSINESS_RULES.md § 1](../domain/BUSINESS_RULES.md#1-academic-year)                  |
| `GradeScale.bands`                       | Structured, school-defined, potentially multiple scales per school — correctly JSON, see § 4 below                                                                |
| `AcademicYear.promotionPolicy`           | Structured, state/school-configurable policy — correctly JSON, see § 4 below                                                                                      |

### 3.1 The `DocumentRecord` Polymorphic Case

`DocumentRecord.ownerType` (`"Student"` / `"Teacher"` / `"AdmissionApplication"`) is a genuinely fixed, code-level set today — a native-enum candidate by § 1's own rule. Recommended as a `String` with a `CHECK` constraint instead (see [CONSTRAINT_STRATEGY.md § 4](./CONSTRAINT_STRATEGY.md#4-check-constraints)), for a narrower reason than the school-configurability argument above: polymorphic-owner sets are the one category of "fixed" enum that realistically grows as the schema grows (a future `TeacherQualification` certificate upload, or a `Guardian` document, are both plausible additions within this same codebase's own roadmap, not a hypothetical future tenant's need). A `CHECK` constraint is a one-line migration to extend; a native enum's `ALTER TYPE ADD VALUE` carries the same practical cost but signals (misleadingly) that the set is closed the way `AttendanceRecord.status` genuinely is.

## 4. JSON Fields That Are Correctly Not Relational

`GradeScale.bands` and `AcademicYear.promotionPolicy` are structured, multi-value, school-configurable data that could theoretically be normalized into their own tables (a `GradeBand` table with `minPercent`/`maxPercent`/`grade`/`gradePoint` columns, a `PromotionPolicyRule` table). **Recommend keeping both as JSON columns, not normalizing them** — three reasons: (1) neither is ever queried _by its internal structure_ (no query pattern in [WORKFLOWS.md](../domain/WORKFLOWS.md) or [REPORTING_MODEL.md](../domain/REPORTING_MODEL.md) filters "grade bands where gradePoint > 8" — they're always read whole and applied in application code), (2) both are read far more often than written (a grade scale changes rarely; it's read on every marks-entry and report-generation call), making JSON's lack of join overhead a genuine win, not just a convenience, and (3) normalizing them would be exactly the kind of premature relational purity this project's YAGNI culture already pushes back on elsewhere — revisit only if a real query pattern emerges that needs to search _inside_ these structures, which nothing in the current domain model does.

## 5. Lookup Table Recommendation: `TeacherQualification.qualificationType`

The one field in this review that's currently drafted as a plain `String` but deserves neither a native enum nor to stay a bare string: [DATA_DICTIONARY.md](../domain/DATA_DICTIONARY.md) already describes it as "a small reference list, not school-configurable" — TET, B.Ed, M.Ed, and similar. Recommend a small **lookup table** (`QualificationType`: `id`, `code`, `label`, `satisfiesRteMinimum: Boolean`) instead of either extreme, because the RTE-driven compliance reporting this field exists to support ([REPORTING_MODEL.md § 5](../domain/REPORTING_MODEL.md#5-future-compliance-reports) — Teacher Qualification Compliance) needs more than a bare label: it needs to know _which_ qualifications count toward the RTE minimum-qualification norm, a fact that's naturally a property of the qualification type itself, not something to hardcode into a report query's `WHERE qualificationType IN (...)` clause every time the report is written. A lookup table lets that fact live once, next to the value it describes, and lets a future Admin-facing settings screen manage the list without a migration — something neither a native enum nor a bare string cleanly supports.

## 6. Summary Rule

| Shape of the value set                                                                                      | Physical choice               |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Fixed, universal, code-owned, small, genuinely never grows without a deploy anyway                          | Native Postgres enum          |
| Fixed today but plausibly extended by _this codebase's own_ future work (not a school's configuration need) | `String` + `CHECK` constraint |
| School-configurable, or varies by state/government regulation                                               | `String`, no `CHECK`          |
| Small reference set needing descriptive metadata beyond a bare label                                        | Lookup table                  |
| Structured, multi-field, school-configurable, never queried by internal structure                           | JSON column                   |
