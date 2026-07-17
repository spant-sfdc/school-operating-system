# Query Patterns

**Purpose:** The actual expected queries, in illustrative SQL shape, that [INDEXING_STRATEGY.md](./INDEXING_STRATEGY.md)'s choices exist to serve. **Illustrative only — not executable, not a migration, not application code**, the same convention [docs/domain/DATABASE_SCHEMA.md](../domain/DATABASE_SCHEMA.md) established for its own pseudo-schema. Each pattern below cites the [WORKFLOWS.md](../domain/WORKFLOWS.md) step or [REPORTING_MODEL.md](../domain/REPORTING_MODEL.md) report it comes from — nothing here is invented independently of those two documents.

---

## 1. Attendance Marking (Hot Path — Runs Every School Day, Every Section)

From [WORKFLOWS.md § 2](../domain/WORKFLOWS.md#2-daily-attendance-workflow):

```sql
-- Step 1: has today's session been marked?
SELECT * FROM "AttendanceSession"
WHERE "sectionId" = $1 AND "date" = $2;
-- Served by: the unique index on (sectionId, date) — exact match, index-only scan.

-- Step 2: render the roster (active enrollments in this section)
SELECT * FROM "Enrollment"
WHERE "sectionId" = $1;
-- Served by: the unique index on (sectionId, rollNumber) — sectionId leads, no extra index needed.

-- Step 3: permission check — is this teacher allowed to touch this section?
SELECT 1 FROM "TeacherAssignment"
WHERE "sectionId" = $1 AND "academicYearId" = $2 AND "teacherId" = $3 AND "deletedAt" IS NULL;
-- Served by: @@index([sectionId, academicYearId]) — the single hottest-path lookup in the schema,
-- since this runs on every attendance AND every marks mutation, not just attendance.
```

## 2. Student Attendance History (TC Generation, Promotion Eligibility, Reporting)

From [WORKFLOWS.md § 6](../domain/WORKFLOWS.md#6-transfer--withdrawal-workflow) and [REPORTING_MODEL.md § 2](../domain/REPORTING_MODEL.md#2-attendance-reports):

```sql
SELECT status, COUNT(*) FROM "AttendanceRecord"
WHERE "enrollmentId" = $1
GROUP BY status;
-- Served by: @@index([enrollmentId]) — the addition flagged in DATABASE_REVIEW.md § 9.
-- Without this index, this query would need a full scan of AttendanceRecord filtered by a
-- join through AttendanceSession, since the table's only other index leads with sessionId.
```

## 3. Marks Entry (Hot Path — Runs Per Exam, Per Subject, Per Section)

From [WORKFLOWS.md § 3](../domain/WORKFLOWS.md#3-marks-entry-workflow):

```sql
-- Resolve the schedule for this exam+subject
SELECT * FROM "ExamSubjectSchedule"
WHERE "examinationId" = $1 AND "subjectId" = $2;
-- Served by: the unique index on (examinationId, subjectId).

-- Upsert one MarksRecord per student in the roster (same Enrollment-scoped roster query as § 1)
INSERT INTO "MarksRecord" ("enrollmentId", "examSubjectScheduleId", "marksObtained", ...)
VALUES (...)
ON CONFLICT ("enrollmentId", "examSubjectScheduleId") DO UPDATE SET ...;
-- Served by: the unique index on (enrollmentId, examSubjectScheduleId), doubling as the
-- upsert's conflict target.
```

## 4. Class Examination Result Summary

From [REPORTING_MODEL.md § 3](../domain/REPORTING_MODEL.md#3-examination-reports):

```sql
SELECT e."studentId", SUM(mr."marksObtained"), AVG(mr."marksObtained")
FROM "MarksRecord" mr
JOIN "ExamSubjectSchedule" ess ON ess.id = mr."examSubjectScheduleId"
JOIN "Enrollment" e ON e.id = mr."enrollmentId"
WHERE ess."examinationId" = $1
GROUP BY e."studentId";
-- Served by: @@index([examSubjectScheduleId]) on MarksRecord — the addition flagged in
-- DATABASE_REVIEW.md § 10. Without it, "every mark for this exam across a whole class" would
-- have no efficient entry point, since the table's unique index leads with enrollmentId
-- (good for "one student's marks," useless for "one exam's marks across many students").
```

## 5. Admin Attendance Oversight (Cross-Section, Date-Range)

From [PERMISSION_MATRIX.md § 5](../domain/PERMISSION_MATRIX.md#5-attendance) ("Admin: RU (oversight, all sections)"):

```sql
SELECT * FROM "AttendanceSession"
WHERE "schoolId" = $1 AND "date" BETWEEN $2 AND $3;
-- Served by: @@index([schoolId, date]).
```

## 6. Front-Desk Guardian Lookup

Implied by `Contact`'s own emphasis on phone as the primary channel (not an explicit `WORKFLOWS.md` step, but a real, named operational pattern — see [DATABASE_REVIEW.md § 3](./DATABASE_REVIEW.md#3-guardian)):

```sql
SELECT g.*, s."firstName", s."lastName" FROM "Guardian" g
JOIN "StudentGuardian" sg ON sg."guardianId" = g.id
JOIN "Student" s ON s.id = sg."studentId"
WHERE g."phone" = $1;
-- Served by: @@index([phone]) on Guardian.
```

## 7. Enrollment/School Strength Report

From [REPORTING_MODEL.md § 4](../domain/REPORTING_MODEL.md#4-operational-reports):

```sql
SELECT c."name" AS class_name, sec."name" AS section_name, COUNT(*)
FROM "Enrollment" e
JOIN "Section" sec ON sec.id = e."sectionId"
JOIN "Class" c ON c.id = sec."classId"
WHERE e."academicYearId" = $1
GROUP BY c."name", sec."name";
-- Served by: the unique index on (sectionId, rollNumber) — sectionId leads, sufficient for
-- this aggregation; academicYearId filtering happens via the Section join, not a direct
-- Enrollment.academicYearId index, since Enrollment's own unique already leads with studentId
-- for the other direction. No additional index needed — confirmed in DATABASE_REVIEW.md § 8.
```

## 8. Promotion/Detention Summary

From [REPORTING_MODEL.md § 4](../domain/REPORTING_MODEL.md#4-operational-reports):

```sql
SELECT pr."outcome", COUNT(*)
FROM "PromotionRecord" pr
JOIN "Enrollment" e ON e.id = pr."sourceEnrollmentId"
WHERE e."academicYearId" = $1
GROUP BY pr."outcome";
-- Served by: the unique index on PromotionRecord.sourceEnrollmentId (join target) plus
-- Enrollment's existing indexes for the academicYearId filter via the join.
```

## 9. "Get the Current Academic Year" (Highest-Frequency Lookup in the Whole System)

Every request that needs "today's" context — attendance marking, marks entry, the homepage's own config-driven copy — resolves the current year first:

```sql
SELECT * FROM "AcademicYear"
WHERE "schoolId" = $1 AND "isCurrent" = true;
-- Served by: @@index([schoolId, isCurrent]) AND the partial unique index from
-- CONSTRAINT_STRATEGY.md § 3, which guarantees this query returns at most one row.
```

Frequent enough, and stable enough within a request's lifetime, to be a genuine candidate for request-scoped caching rather than re-querying — see [PERFORMANCE_GUIDELINES.md § 4](./PERFORMANCE_GUIDELINES.md#4-caching-considerations).

## 10. Audit Trail Lookup ("Full History of This Record")

The most common real-world use of `AuditLog` — a dispute or a correction needs "show me everything that happened to this specific row":

```sql
SELECT * FROM "AuditLog"
WHERE "entityType" = $1 AND "entityId" = $2
ORDER BY "timestamp" DESC;
-- Served by: @@index([entityType, entityId]).
```
