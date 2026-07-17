# Indexing Strategy

**Purpose:** Every index this schema needs, in one place, each tied to the specific query it exists to serve. [DATABASE_REVIEW.md](./DATABASE_REVIEW.md) derives these per-entity; this document is the consolidated reference — what an implementer should actually type into `schema.prisma`'s `@@index`/`@@unique` blocks, without re-deriving the reasoning each time. See [QUERY_PATTERNS.md](./QUERY_PATTERNS.md) for the query shapes these indexes serve, spelled out in full.

**Rule of thumb used throughout:** every unique constraint is also an index (Postgres builds one automatically) — don't add a redundant plain index covering the same leading column(s) a unique constraint already provides. The additions below are specifically the indexes _not_ already implied by a uniqueness requirement.

---

## 1. School & Academic Structure

| Table          | Constraint / Index                                                                                                                                 | Type                                                                                                          | Serves                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `AcademicYear` | `@@unique([schoolId, label])`                                                                                                                      | Unique                                                                                                        | Prevent duplicate year labels per school                                     |
| `AcademicYear` | `@@index([schoolId, isCurrent])`                                                                                                                   | Index                                                                                                         | "Get the current year" — the hottest lookup in the schema                    |
| `AcademicYear` | Partial unique on `(schoolId) WHERE isCurrent = true`                                                                                              | Partial unique (raw SQL, see [CONSTRAINT_STRATEGY.md § 3](./CONSTRAINT_STRATEGY.md#3-partial-unique-indexes)) | Physically enforce "exactly one current year per school"                     |
| `Class`        | `@@unique([schoolId, name])`                                                                                                                       | Unique                                                                                                        | Prevent duplicate class names per school                                     |
| `Section`      | **`@@unique([classId, academicYearId, name])`** — _gap, see [DATABASE_REVIEW.md § 15](./DATABASE_REVIEW.md#15-gaps-found-in-the-conceptual-model)_ | Unique                                                                                                        | Prevent two "6-A" sections in the same year; also serves as the roster index |
| `Subject`      | **`@@unique([schoolId, name])`** — _gap, see [DATABASE_REVIEW.md § 15](./DATABASE_REVIEW.md#15-gaps-found-in-the-conceptual-model)_                | Unique                                                                                                        | Prevent duplicate subject names per school                                   |
| `ClassSubject` | `@@unique([academicYearId, classId, subjectId])`                                                                                                   | Unique                                                                                                        | Already correct in [DATABASE_SCHEMA.md](../domain/DATABASE_SCHEMA.md)        |

## 2. People & Identity

| Table             | Constraint / Index                      | Type   | Serves                                                                                                                 |
| ----------------- | --------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| `User`            | `@@unique([email])`                     | Unique | Login lookup                                                                                                           |
| `Teacher`         | `@@unique([userId])`                    | Unique | 1:1 join to `User`                                                                                                     |
| `Student`         | `@@unique([schoolId, admissionNumber])` | Unique | Admission-number lookup, scoped per school (not global — see [DATABASE_REVIEW.md § 2](./DATABASE_REVIEW.md#2-student)) |
| `Student`         | `@@unique([udisePen])` (nullable)       | Unique | National identifier — correctly global, not per-school                                                                 |
| `Student`         | `@@index([schoolId, status])`           | Index  | "Active students" filter — the default scope for nearly every Admin query                                              |
| `Guardian`        | `@@index([phone])`                      | Index  | Front-desk "look up a parent by phone" workflow — see [DATABASE_REVIEW.md § 3](./DATABASE_REVIEW.md#3-guardian)        |
| `StudentGuardian` | `@@unique([studentId, guardianId])`     | Unique | Already correct                                                                                                        |
| `StudentGuardian` | `@@index([guardianId])`                 | Index  | "All children of this guardian" — the unique above leads with `studentId`, not usable for this direction               |

## 3. Admission

| Table                  | Constraint / Index                          | Type   | Serves                                                                                                             |
| ---------------------- | ------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| `AdmissionEnquiry`     | `@@index([schoolId, status])`               | Index  | Admin's enquiry triage list, filtered by status                                                                    |
| `AdmissionApplication` | `@@unique([resultingStudentId])` (nullable) | Unique | Already correct                                                                                                    |
| `AdmissionApplication` | `@@index([schoolId, status])`               | Index  | Admin's application pipeline view                                                                                  |
| `RteDetails`           | `@@unique([applicationId])`                 | Unique | 1:1 join, already correct                                                                                          |
| `DocumentRecord`       | `@@index([ownerType, ownerId])`             | Index  | Resolving "all documents for this Student/Teacher/Application" — the polymorphic lookup's only real access pattern |

## 4. Enrollment & Progression

| Table                 | Constraint / Index                                                                                                                            | Type           | Serves                                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `Enrollment`          | `@@unique([studentId, academicYearId])`                                                                                                       | Unique         | Student-history lookups; already correct                                                                                              |
| `Enrollment`          | `@@unique([sectionId, rollNumber])`                                                                                                           | Unique         | Section-roster lookups; already correct — no additional index needed, see [DATABASE_REVIEW.md § 8](./DATABASE_REVIEW.md#8-enrollment) |
| `TeacherAssignment`   | Partial unique on `(sectionId, academicYearId) WHERE isClassTeacher = true`                                                                   | Partial unique | Exactly one Class Teacher per section per year                                                                                        |
| `TeacherAssignment`   | `@@unique([academicYearId, sectionId, subjectId])` (subject-assignment rows)                                                                  | Unique         | One teacher per subject per section per year                                                                                          |
| `TeacherAssignment`   | `@@index([teacherId, academicYearId])`                                                                                                        | Index          | A teacher's own schedule/dashboard                                                                                                    |
| `TeacherAssignment`   | `@@index([sectionId, academicYearId])`                                                                                                        | Index          | Permission-check query — runs on every attendance/marks mutation                                                                      |
| `PromotionRecord`     | `@@unique([sourceEnrollmentId])`                                                                                                              | Unique         | Already correct                                                                                                                       |
| `PromotionRecord`     | `@@unique([resultingEnrollmentId])` (nullable)                                                                                                | Unique         | Already correct                                                                                                                       |
| `TransferCertificate` | **`@@unique([schoolId, tcNumber])`** — _corrected, see [DATABASE_REVIEW.md § 15](./DATABASE_REVIEW.md#15-gaps-found-in-the-conceptual-model)_ | Unique         | Per-school TC numbering, not global                                                                                                   |
| `TransferCertificate` | `@@unique([studentId])`                                                                                                                       | Unique         | Already correct                                                                                                                       |

## 5. Attendance

| Table               | Constraint / Index                                                                                                                           | Type   | Serves                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| `AttendanceSession` | `@@unique([sectionId, date])`                                                                                                                | Unique | "Has today's session been marked" — already correct                                   |
| `AttendanceSession` | `@@index([schoolId, date])`                                                                                                                  | Index  | Admin's cross-section date-range oversight view                                       |
| `AttendanceRecord`  | `@@unique([sessionId, enrollmentId])`                                                                                                        | Unique | Write-path invariant — already correct                                                |
| `AttendanceRecord`  | **`@@index([enrollmentId])`** — _added, see [DATABASE_REVIEW.md § 9](./DATABASE_REVIEW.md#9-attendance-attendancesession--attendancerecord)_ | Index  | "This student's attendance history" — TC generation, promotion eligibility, reporting |

## 6. Examination

| Table                 | Constraint / Index                                                                                                                                                                                   | Type   | Serves                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| `ExamTerm`            | `@@index([academicYearId, sortOrder])`                                                                                                                                                               | Index  | Ordered term list for a year                                                               |
| `Examination`         | `@@index([examTermId, classId])`                                                                                                                                                                     | Index  | "The Half-Yearly for Class 6, this year" — setup and lookup                                |
| `ExamSubjectSchedule` | `@@unique([examinationId, subjectId])`                                                                                                                                                               | Unique | Already correct                                                                            |
| `GradeScale`          | `@@index([schoolId])`                                                                                                                                                                                | Index  | Resolving a school's active scale(s); small table, mostly for completeness                 |
| `MarksRecord`         | `@@unique([enrollmentId, examSubjectScheduleId])`                                                                                                                                                    | Unique | "This student's marks for this exam" — already correct                                     |
| `MarksRecord`         | **`@@index([examSubjectScheduleId])`** — _added, see [DATABASE_REVIEW.md § 10](./DATABASE_REVIEW.md#10-examination-examterm--examination--examsubjectschedule--gradescale--marksrecord--reportcard)_ | Index  | "This exam+subject's results across a class" — the Class Examination Result Summary report |
| `ReportCard`          | `@@index([enrollmentId, examinationId])`                                                                                                                                                             | Index  | "This student's report card for this exam"                                                 |

## 7. Cross-Cutting

| Table      | Constraint / Index                  | Type  | Serves                                                                                                                                          |
| ---------- | ----------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuditLog` | `@@index([entityType, entityId])`   | Index | "Full history of this record" — the primary audit-trail read pattern                                                                            |
| `AuditLog` | `@@index([actorUserId, timestamp])` | Index | "Everything this user did" — security/compliance investigation pattern                                                                          |
| `AuditLog` | `@@index([schoolId, timestamp])`    | Index | Time-range queries within a school — also the natural partition-pruning column, see [AUDIT_STRATEGY.md § 3](./AUDIT_STRATEGY.md#3-partitioning) |

---

## 8. Deliberately Not Indexed

Worth stating explicitly, since an unindexed column can look like an oversight rather than a decision:

- **`Student` name fields (`firstName`/`lastName`).** A B-tree index doesn't serve partial/fuzzy name search well. At V1 scale (hundreds of students per school), an unindexed `ILIKE` scan is fast enough that adding a `pg_trgm` GIN trigram index now would be optimizing a query pattern that isn't a real bottleneck yet. Revisit if/when a school's student count and search frequency actually make it one — see [PERFORMANCE_GUIDELINES.md § 5](./PERFORMANCE_GUIDELINES.md#5-deferred-optimizations).
- **`TransferCertificate.generalConduct` / `.reasonForLeaving`, `AttendanceRecord`/`MarksRecord`'s free-text-adjacent fields.** No query pattern in [WORKFLOWS.md](../domain/WORKFLOWS.md) or [REPORTING_MODEL.md](../domain/REPORTING_MODEL.md) filters or searches on these — indexing them would be speculative.
- **`AuditLog.beforeValue`/`.afterValue` (JSON columns).** No query pattern searches _inside_ these blobs — they're read whole, by `entityId`, not queried by their contents. A `GIN` index on JSON content would be pure overhead against zero real use.
