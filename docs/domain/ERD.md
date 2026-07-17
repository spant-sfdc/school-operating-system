# Entity Relationship Diagram

**Purpose:** The structural relationships between every entity in [DOMAIN_MODEL.md](./DOMAIN_MODEL.md), as a diagram and a cardinality reference table. Illustrative — not generated from an actual schema, since none exists yet ([README.md](./README.md)).

---

## 1. Full ERD

```mermaid
erDiagram
    SCHOOL ||--o{ ACADEMIC_YEAR : has
    SCHOOL ||--o{ CLASS : offers
    SCHOOL ||--o{ SUBJECT : catalogs
    SCHOOL ||--o{ GRADE_SCALE : defines
    SCHOOL ||--o{ USER : employs
    SCHOOL ||--o{ STUDENT : enrolls

    ACADEMIC_YEAR ||--o{ SECTION : "scopes"
    ACADEMIC_YEAR ||--o{ CLASS_SUBJECT : "scopes"
    ACADEMIC_YEAR ||--o{ ENROLLMENT : "scopes"
    ACADEMIC_YEAR ||--o{ EXAM_TERM : "scopes"

    CLASS ||--o{ SECTION : "divided into"
    CLASS ||--o{ CLASS_SUBJECT : teaches
    CLASS ||--o{ EXAMINATION : "scheduled for"
    SUBJECT ||--o{ CLASS_SUBJECT : "taught in"

    SECTION ||--o{ ENROLLMENT : contains
    SECTION ||--o{ TEACHER_ASSIGNMENT : "assigned to"
    SECTION ||--o{ ATTENDANCE_SESSION : "taken for"

    USER ||--o| TEACHER : "is a"
    TEACHER ||--o{ TEACHER_QUALIFICATION : holds
    TEACHER ||--o{ TEACHER_ASSIGNMENT : assigned
    TEACHER ||--o{ ATTENDANCE_SESSION : marks
    TEACHER ||--o{ MARKS_RECORD : enters

    STUDENT ||--o{ ENROLLMENT : "enrolled via"
    STUDENT ||--o{ STUDENT_GUARDIAN : linked
    STUDENT ||--o| ADMISSION_APPLICATION : "originated from"
    STUDENT ||--o| TRANSFER_CERTIFICATE : "may have"
    GUARDIAN ||--o{ STUDENT_GUARDIAN : linked

    ADMISSION_ENQUIRY ||--o| ADMISSION_APPLICATION : "converts to"
    ADMISSION_APPLICATION ||--o| RTE_DETAILS : "may have"

    ENROLLMENT ||--o{ ATTENDANCE_RECORD : "attendance in"
    ENROLLMENT ||--o{ MARKS_RECORD : "marks in"
    ENROLLMENT ||--o{ REPORT_CARD : "report cards for"
    ENROLLMENT ||--o| PROMOTION_RECORD : "concludes via"
    ENROLLMENT ||--o| TRANSFER_CERTIFICATE : "may end via"

    ATTENDANCE_SESSION ||--o{ ATTENDANCE_RECORD : contains

    EXAM_TERM ||--o{ EXAMINATION : contains
    EXAMINATION ||--o{ EXAM_SUBJECT_SCHEDULE : schedules
    EXAM_SUBJECT_SCHEDULE ||--o{ MARKS_RECORD : "scores recorded against"
    GRADE_SCALE ||--o{ MARKS_RECORD : "grades derived from"
    EXAMINATION ||--o{ REPORT_CARD : "aggregated into"
```

## 2. Cardinality Reference

| Relationship                                            | Cardinality      | Notes                                                                                                            |
| ------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| `School` → `AcademicYear`                               | 1 : N            | One school, many years over its lifetime; exactly one `isCurrent` at a time (business rule, not schema-enforced) |
| `School` → `Class` / `Subject` / `GradeScale`           | 1 : N            | School-scoped catalogs                                                                                           |
| `AcademicYear` → `Section`                              | 1 : N            | Sections are recreated/renamed per year                                                                          |
| `Class` → `Section`                                     | 1 : N            | Per academic year                                                                                                |
| `Class` × `Subject` → `ClassSubject`                    | M : N            | Join entity; a subject may apply to several classes, a class has several subjects                                |
| `Section` → `Enrollment`                                | 1 : N            | Many students per section, one section per enrollment                                                            |
| `Section` → `TeacherAssignment`                         | 1 : N            | One Class Teacher + several subject-teacher assignments per section                                              |
| `User` → `Teacher`                                      | 1 : 0..1         | Only `role = TEACHER` users have a `Teacher` profile; `ADMIN` users do not in V1                                 |
| `Teacher` → `TeacherQualification`                      | 1 : N            |                                                                                                                  |
| `Teacher` × `Section` × `Subject` → `TeacherAssignment` | M : N (via join) | One teacher can teach several section/subject combinations; one combination has one teacher at a time            |
| `Student` → `Enrollment`                                | 1 : N            | One row per academic year the student was enrolled                                                               |
| `Student` × `Guardian` → `StudentGuardian`              | M : N            | A guardian may have several children; a student may have several guardians                                       |
| `AdmissionEnquiry` → `AdmissionApplication`             | 1 : 0..1         | Not every enquiry converts                                                                                       |
| `AdmissionApplication` → `RteDetails`                   | 1 : 0..1         | Present only when `admissionCategory = RTE`                                                                      |
| `Enrollment` → `AttendanceRecord`                       | 1 : N            | Via `AttendanceSession`, one record per school day the section met                                               |
| `AttendanceSession` → `AttendanceRecord`                | 1 : N            | One record per enrolled student in that section, that day                                                        |
| `Enrollment` → `MarksRecord`                            | 1 : N            | One per exam-subject combination the student was scheduled for                                                   |
| `ExamSubjectSchedule` → `MarksRecord`                   | 1 : N            | One per enrolled student in the scheduled class                                                                  |
| `Enrollment` → `PromotionRecord`                        | 1 : 0..1         | One per academic year concluded (absent only if still in-progress)                                               |
| `Enrollment` → `TransferCertificate`                    | 1 : 0..1         | Present only if the student's enrollment ended in withdrawal/transfer, not promotion                             |

## 3. Reading Notes

- **Every `School`-owned entity carries an implicit `schoolId`**, not drawn per-edge above to avoid visual noise — see [PRODUCT_ARCHITECTURE.md § 2](../PRODUCT_ARCHITECTURE.md#2-future-architecture) step 2 and [DATABASE_SCHEMA.md § 1](./DATABASE_SCHEMA.md#1-the-schoolid-convention).
- **`Enrollment` is the hub, not `Student`.** Notice that `AttendanceRecord`, `MarksRecord`, `ReportCard`, `PromotionRecord`, and `TransferCertificate` all key off `Enrollment`, not `Student` directly — this is the structural expression of [DOMAIN_MODEL.md § 1](./DOMAIN_MODEL.md#1-scope--assumptions)'s third avoided assumption: a student's academic life is a sequence of yearly enrollments, not one mutable "current class" pointer.
- **`DocumentRecord` and `AuditLog` are intentionally absent from the diagram above** — both use a polymorphic owner reference (`ownerType`/`ownerId` and `entityType`/`entityId` respectively) that doesn't render meaningfully as a fixed ERD edge; see [DATABASE_SCHEMA.md § 9](./DATABASE_SCHEMA.md#9-documentrecord--a-note-on-the-polymorphic-reference) for the shape and its tradeoffs.
- **Future entities (Fee, Transport, Parent/Student `User` roles) are not drawn** — per [DOMAIN_MODEL.md § 10](./DOMAIN_MODEL.md#10-future-integration-seams-not-designed), only their attachment points are named in prose, not modeled as diagram nodes, to avoid implying a design that doesn't exist yet.
