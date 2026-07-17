# Reporting Model

**Purpose:** What reports the school actually needs, and which entities each one aggregates — grounding [PRD § 3.2](../PRODUCT_REQUIREMENTS.md#32-admin)'s "Reports (attendance summaries, examination summaries)" and [Feature #14](../PRODUCT_REQUIREMENTS.md#5-feature-list-version-1) in the concrete data model from [DOMAIN_MODEL.md](./DOMAIN_MODEL.md), and separating what's V1-relevant from what's genuinely future analytics ([Epic G](../ROADMAP_V2.md#epic-g--analytics)).

---

## 1. Report Catalog (V1-relevant)

| Report                           | Priority (per PRD)                                                                                             | Primary consumer         |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Class/Section Attendance Summary | P0-adjacent (attendance oversight is P0; the report view is P1)                                                | Admin                    |
| Student Attendance History       | P1                                                                                                             | Admin                    |
| Class Examination Result Summary | P1 ([PRD § 2](../PRODUCT_REQUIREMENTS.md#2-objectives): "generate a class result report without spreadsheets") | Admin                    |
| Student Report Card              | P0-adjacent (the underlying `ReportCard` entity is core; print/export is the reporting layer)                  | Admin, (future) Guardian |
| Enrollment / School Strength     | P1 (implicit — needed for School Settings and general operations)                                              | Admin                    |
| Admission Funnel                 | P2 (not explicitly in PRD, but a natural byproduct of `AdmissionEnquiry`/`AdmissionApplication` existing)      | Admin                    |
| Promotion / Detention Summary    | P1 (implicit — end-of-year decision needs a working view before it needs a "report")                           | Admin                    |

## 2. Attendance Reports

### Class/Section Attendance Summary

- **Source:** `AttendanceRecord` joined through `AttendanceSession` → `Section`, filtered by date range.
- **Aggregation:** `COUNT(status = PRESENT) / COUNT(*)` per student, per section, over the selected range. Rolls up to a section-level average for a quick health check.
- **`HALF_DAY` weighting:** per [BUSINESS_RULES.md § 4](./BUSINESS_RULES.md#4-attendance), configurable — this report must read the school's configured weight, not assume 0.5 universally.

### Student Attendance History

- **Source:** `AttendanceRecord` filtered by `enrollmentId` (i.e., scoped to one student's one academic year — a student's attendance history across years is a _sequence_ of these reports, one per `Enrollment`, not a single flat query, matching [DOMAIN_MODEL.md § 1](./DOMAIN_MODEL.md#1-scope--assumptions)'s enrollment-per-year principle).
- **Feeds:** `TransferCertificate.workingDays`/`daysPresent` (see [WORKFLOWS.md § 6](./WORKFLOWS.md#6-transfer--withdrawal-workflow)) and `PromotionRecord` eligibility checks where attendance thresholds are part of a school's promotion policy.

## 3. Examination Reports

### Class Examination Result Summary

- **Source:** `MarksRecord` joined through `ExamSubjectSchedule` → `Examination`, filtered by `Examination` + `Class`.
- **Aggregation:** Per-student total/average across subjects; per-subject class average; pass/fail count against each `ExamSubjectSchedule.passMarks`.
- **Grade rendering:** If the class's active `GradeScale` exists, grades are shown alongside marks — this report must not assume a `GradeScale` always exists (a marks-only school is valid, per [BUSINESS_RULES.md § 5](./BUSINESS_RULES.md#5-examinations--grading)).

### Student Report Card

- **Source:** Directly reads the stored `ReportCard.snapshot`, not a live re-aggregation — per [DOMAIN_MODEL.md § 8.6](./DOMAIN_MODEL.md#86-reportcard), a report card is a frozen point-in-time record. Regenerating it (if marks were corrected) is an explicit re-generation action, not something this report silently does on every view.

## 4. Operational Reports

### Enrollment / School Strength

- **Source:** `Enrollment`, filtered by `AcademicYear` (typically the current one).
- **Aggregation:** Count per `Class`/`Section`; total school strength; year-over-year trend (multiple `AcademicYear`s' worth of this same count) is the first genuinely useful [Epic G](../ROADMAP_V2.md#epic-g--analytics) dashboard, per [PRODUCT_VISION.md § 9](../PRODUCT_VISION.md#9-future-expansion) ("Admin-facing enrollment/attendance trend dashboards").

### Admission Funnel

- **Source:** `AdmissionEnquiry` → `AdmissionApplication` → `Student`, by status, over a date range.
- **Aggregation:** Conversion rate at each stage (Enquiry → Application → Confirmed); breakdown by `AdmissionEnquiry.source` if that field is populated (see [DATA_DICTIONARY.md](./DATA_DICTIONARY.md)).

### Promotion / Detention Summary

- **Source:** `PromotionRecord`, filtered by the concluding `AcademicYear`.
- **Aggregation:** Count of `PROMOTED` vs. `DETAINED` vs. `TRANSFERRED_OUT`/`WITHDRAWN`, per class — the natural end-of-year companion to the [Promotion Workflow](./WORKFLOWS.md#5-promotion-workflow-end-of-academic-year).

## 5. Future Compliance Reports

Not V1 scope — named because they're a real, near-term-likely need for an Indian school specifically, referenced from [BUSINESS_RULES.md § 9](./BUSINESS_RULES.md#9-teacher-assignment--compliance-ratios):

| Report                           | Would source from                                               | Why it matters                                                                                                                                               |
| -------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pupil-Teacher Ratio (PTR)        | `Enrollment` count ÷ `Teacher` count (active), per school/class | RTE-prescribed norms; a school may need to demonstrate compliance during recognition renewal                                                                 |
| Teacher Qualification Compliance | `TeacherQualification`, filtered for TET/B.Ed presence          | Same RTE-driven compliance need                                                                                                                              |
| UDISE+ Data Export               | `Student.udisePen`, `Enrollment`, `Teacher`, `School.udiseCode` | Indian schools report enrollment/staffing data into the national UDISE+ system annually — a structured export, not a UI report, is the likely eventual shape |

## 6. Future Analytics (Epic G)

Per [ROADMAP_V2.md § Epic G](../ROADMAP_V2.md#epic-g--analytics): single-tenant trend dashboards (enrollment, attendance over time) become meaningful the moment real data from §§ 2–4 above exists — no new entities required, just visualization over what's already here. **Cross-tenant analytics are explicitly out of scope until a second real school exists** ([PRODUCT_VISION.md § 9](../PRODUCT_VISION.md#9-future-expansion)) — not a V1 or near-term concern, named here only for completeness against the task's "Reporting Model" ask.

## 7. Aggregation & Privacy Principle

Every report in §§ 2–4 operates on data scoped to the caller's role and permitted entities, per [PERMISSION_MATRIX.md](./PERMISSION_MATRIX.md) — a Teacher's version of the Class Attendance Summary is pre-filtered to their assigned sections at the query level, not filtered client-side after fetching everything. Any future cross-student aggregate shown to a non-Admin role (e.g., a class average shown to a Teacher) is a genuine aggregate, not a means of exposing every individual student's raw record to a role that shouldn't see them — worth stating explicitly since "just show the average" is an easy place for a report to accidentally leak the underlying rows via an API response, per [BUSINESS_RULES.md § 8](./BUSINESS_RULES.md#8-data-protection-dpdp-act-2023)'s data-protection principle.
