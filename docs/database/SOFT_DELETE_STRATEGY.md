# Soft Delete Strategy

**Purpose:** Which entities use `deletedAt`, which use a `status` field instead, which have no delete mechanism of any kind, and the one interaction between soft-delete and uniqueness constraints that's easy to get wrong and expensive to discover in production.

---

## 1. Three Categories, Not Two

[DOMAIN_MODEL.md](../domain/DOMAIN_MODEL.md) already assigns each entity a "Soft delete: Yes/No" answer. Reviewed as a physical design question, that binary collapses three genuinely different situations into one column — worth separating explicitly:

| Category                                                        | Mechanism                        | Entities                                                                                                                                                                                                                                                |
| --------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reference/administrative — deactivatable**                    | `deletedAt DateTime?`            | `Guardian`, `StudentGuardian`, `Class`, `Section`, `Subject`, `ClassSubject`, `TeacherAssignment`, `TeacherQualification`, `AdmissionEnquiry`, `AdmissionApplication`, `DocumentRecord`, `ExamTerm`, `Examination`, `ExamSubjectSchedule`, `GradeScale` |
| **Lifecycle-state entities — status, not a second delete flag** | `status` enum only               | `School`, `User`, `Teacher`, `Student`, `AcademicYear` — each already has a status/lifecycle field; adding `deletedAt` alongside it would create two competing answers to "is this gone," see § 3                                                       |
| **Historical fact/measurement — no delete mechanism at all**    | Neither `deletedAt` nor `status` | `Enrollment`, `AttendanceSession`, `AttendanceRecord`, `MarksRecord`, `PromotionRecord`, `TransferCertificate`, `ReportCard`, `AuditLog`, `RteDetails`                                                                                                  |

## 2. The Partial Unique Index Requirement

**The single most important, easy-to-miss correction this document makes to [DATABASE_SCHEMA.md](../domain/DATABASE_SCHEMA.md) as drafted.** A plain `@@unique` constraint on a soft-deletable table blocks a legitimate future insert the moment a row with that value has ever been soft-deleted. Concretely: if `Guardian.phone` (hypothetically unique — it isn't, per [DATABASE_REVIEW.md § 3](./DATABASE_REVIEW.md#3-guardian), but consider a table where a similar field genuinely is) is soft-deleted and the same phone number legitimately recurs for a new record years later, a plain unique constraint would reject the new row for a reason no one debugging it would immediately guess — the "conflicting" row is invisible in every normal query because the application always filters `WHERE deletedAt IS NULL`.

**Every unique constraint on a soft-deletable table in this schema should be a partial unique index scoped to `WHERE "deletedAt" IS NULL`**, using the same mechanism already established in [CONSTRAINT_STRATEGY.md § 3](./CONSTRAINT_STRATEGY.md#3-partial-unique-indexes):

```sql
CREATE UNIQUE INDEX <name> ON "<Table>" (<columns>) WHERE "deletedAt" IS NULL;
```

Applies to, at minimum: `Section`'s corrected `(classId, academicYearId, name)` constraint, `Subject`'s corrected `(schoolId, name)` constraint, `ClassSubject`'s `(academicYearId, classId, subjectId)`, `TeacherAssignment`'s subject-assignment uniqueness — every `@@unique` listed against a table in § 1's first category, in [INDEXING_STRATEGY.md](./INDEXING_STRATEGY.md). This is a schema-wide pattern, not a per-table judgment call — apply it uniformly to every soft-deletable table's unique constraints, no exceptions, since the failure mode (a mysterious, hard-to-reproduce insert rejection) is identical regardless of which table it happens on.

## 3. Why Lifecycle-State Entities Don't Also Get `deletedAt`

`Student.status` (`ACTIVE`/`ALUMNI`/`TRANSFERRED_OUT`/`WITHDRAWN`) already fully answers "is this record currently active" with more precision than a boolean `deletedAt IS NULL` check could — knowing _why_ a student is inactive (graduated vs. transferred vs. withdrawn) is itself operationally meaningful, not just a side effect of tracking deletion. Adding `deletedAt` alongside `status` would mean every query needs to reason about two independent signals that can, through a code bug, disagree (a student marked `WITHDRAWN` but with `deletedAt` still null, or vice versa) — a self-inflicted data-integrity risk with zero benefit over just using `status` as the single source of truth. This applies identically to `School`, `User`, `Teacher`, and `AcademicYear` — each already has (or should have, per [DATABASE_REVIEW.md](./DATABASE_REVIEW.md)) a status field that makes a second `deletedAt` column redundant at best, contradictory at worst.

## 4. Cascade Behavior on Soft Delete

Soft-deleting a `Teacher` (setting `status = EXITED`) should **not** cascade any change onto their `TeacherAssignment` rows — those rows remain exactly as they are, since "who taught Section 6-A in 2024" must stay answerable regardless of whether that teacher currently works at the school. A `TeacherAssignment` becoming _inactive_ (this teacher no longer has live access to this section) is already handled by `TeacherAssignment`'s own `deletedAt`, set independently when a reassignment happens — not derived from, or cascaded from, the `Teacher`'s own status. **The correct query-time behavior is a `WHERE` clause that checks both**: an active `TeacherAssignment` only grants live access if _both_ `TeacherAssignment.deletedAt IS NULL` _and_ the linked `Teacher.status = 'ACTIVE'` — reinforcing, at the physical-design level, the same principle [PERMISSION_MATRIX.md § 8](../domain/PERMISSION_MATRIX.md#8-cross-cutting-enforcement-principles) already states about a soft-deleted `TeacherAssignment` needing to stop granting access. This is a query-construction concern for whoever implements the permission-check layer, not a schema change — flagged here because it's the kind of detail a schema diagram alone doesn't make obvious.

## 5. Never Restore

No entity in this schema has an "undelete" operation in scope. Once `deletedAt` is set (or `status` moved to an inactive value), the only supported path back to active is a new, explicit Admin action that creates a fresh record or fresh assignment — not a toggle that clears the deletion timestamp. This keeps the audit trail honest: "deactivated on date X, reactivated on date Y" is a real, traceable pair of events (two `AuditLog` rows) rather than a single mutable flag whose history is only visible by inference.
