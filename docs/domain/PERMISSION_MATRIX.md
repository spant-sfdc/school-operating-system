# Permission Matrix

**Purpose:** Who can do what, to which data. Directly operationalizes [ARCHITECTURE.md § 7](../ARCHITECTURE.md#7-security-principles)'s security principles and [NFR-7](../PRODUCT_REQUIREMENTS.md#9-non-functional-requirements) ("all role-based data access must be enforced server-side, not only hidden in the UI") at the entity level. **Guest, Admin, Teacher are the only roles that exist in V1** ([D-001](../DECISIONS.md#d-001--three-roles-only-for-version-1)); Parent and Student columns are included because the task asked for future integration points to be named, and are marked **Future** throughout — no access exists for them today, and building it requires the [Module Approval Process](../PROJECT_GUARDRAILS.md#2-module-approval-process).

**Legend:** C = Create · R = Read · U = Update · D = Soft-delete/deactivate · **—** = No access · _(scoped)_ = restricted to a subset, detailed in the Scope Notes column.

---

## 1. School & Academic Structure

| Entity                 | Guest              | Admin | Teacher             | Parent (Future) | Student (Future) | Scope Notes                                                                                                 |
| ---------------------- | ------------------ | ----- | ------------------- | --------------- | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| School                 | R _(display only)_ | CRUD  | R                   | —               | —                | Guest sees public-site config values ([`src/config/`](../CONFIGURATION_GUIDE.md)), not the DB entity itself |
| AcademicYear           | —                  | CRUD  | R                   | —               | —                |                                                                                                             |
| Class / Section        | —                  | CRUD  | R _(assigned only)_ | —               | —                | Teacher sees only sections they're assigned to via `TeacherAssignment`                                      |
| Subject / ClassSubject | —                  | CRUD  | R                   | —               | —                |                                                                                                             |

## 2. People & Identity

| Entity                     | Guest | Admin                 | Teacher                     | Parent (Future)           | Student (Future) | Scope Notes                                                                                                                                                                   |
| -------------------------- | ----- | --------------------- | --------------------------- | ------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User                       | —     | CRUD _(not own role)_ | RU _(own only)_             | —                         | —                | Admin manages accounts; a Teacher can read/update only their own `User` row ([PRD § 3.3](../PRODUCT_REQUIREMENTS.md#33-teacher) "Profile management")                         |
| Teacher                    | —     | CRUD                  | RU _(own profile only)_     | —                         | —                |                                                                                                                                                                               |
| TeacherQualification       | —     | CRUD                  | RU _(own only)_             | —                         | —                |                                                                                                                                                                               |
| Student                    | —     | CRUD                  | R _(assigned classes only)_ | R _(own linked children)_ | R _(own record)_ | Teacher scope directly implements [ARCHITECTURE.md § 7](../ARCHITECTURE.md#7-security-principles): "Teachers can only query/mutate data scoped to their own assigned classes" |
| Guardian / StudentGuardian | —     | CRUD                  | R _(assigned classes only)_ | RU _(own record)_         | —                |                                                                                                                                                                               |

## 3. Admission

| Entity               | Guest                                                       | Admin | Teacher                             | Parent (Future) | Student (Future) | Scope Notes                                                                                                                                     |
| -------------------- | ----------------------------------------------------------- | ----- | ----------------------------------- | --------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| AdmissionEnquiry     | C _(own submission only, no read-back beyond confirmation)_ | CRUD  | —                                   | —               | —                | [PRD § 6.1](../PRODUCT_REQUIREMENTS.md#61-guest--admission-enquiry): Guest submits, sees only an on-screen confirmation, not a queryable record |
| AdmissionApplication | —                                                           | CRUD  | —                                   | —               | —                |                                                                                                                                                 |
| RteDetails           | —                                                           | CRUD  | —                                   | —               | —                | Sensitive — see [DATA_DICTIONARY.md](./DATA_DICTIONARY.md), Admin-only by design                                                                |
| DocumentRecord       | C _(admission-linked only, upload during application)_      | CRUD  | R _(own uploads/assigned students)_ | —               | —                |                                                                                                                                                 |

## 4. Enrollment & Progression

| Entity              | Guest | Admin                                                           | Teacher                                                 | Parent (Future)                  | Student (Future)        | Scope Notes                                                                                                                                |
| ------------------- | ----- | --------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Enrollment          | —     | CRUD                                                            | R _(assigned sections only)_                            | R _(own children)_               | R _(own)_               |                                                                                                                                            |
| TeacherAssignment   | —     | CRUD                                                            | R _(own assignments only)_                              | —                                | —                       |                                                                                                                                            |
| PromotionRecord     | —     | CRUD                                                            | R _(assigned students, read-only recommendation input)_ | R _(own children)_               | R _(own)_               | Teacher may contribute exam-result input via `MarksRecord`, but does not decide/write `PromotionRecord` directly — Admin owns the decision |
| TransferCertificate | —     | CRUD _(create=issue; update=reissue only, never edit original)_ | R _(if involved historically)_                          | R _(own children, if withdrawn)_ | R _(own, if withdrawn)_ |                                                                                                                                            |

## 5. Attendance

| Entity            | Guest | Admin                          | Teacher                        | Parent (Future)    | Student (Future) | Scope Notes                                                                                                                                                                                     |
| ----------------- | ----- | ------------------------------ | ------------------------------ | ------------------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AttendanceSession | —     | RU _(oversight, all sections)_ | CRU _(assigned sections only)_ | —                  | —                | [PRD § 3.2](../PRODUCT_REQUIREMENTS.md#32-admin) "Attendance oversight (view/edit across classes)" vs. [§ 3.3](../PRODUCT_REQUIREMENTS.md#33-teacher) "Attendance marking for assigned classes" |
| AttendanceRecord  | —     | RU _(all)_                     | CRU _(assigned sections only)_ | R _(own children)_ | R _(own)_        |                                                                                                                                                                                                 |

## 6. Examination

| Entity                                       | Guest | Admin                   | Teacher                                 | Parent (Future)    | Student (Future) | Scope Notes                                                                                    |
| -------------------------------------------- | ----- | ----------------------- | --------------------------------------- | ------------------ | ---------------- | ---------------------------------------------------------------------------------------------- |
| ExamTerm / Examination / ExamSubjectSchedule | —     | CRUD                    | R                                       | —                  | —                | [PRD § 3.2](../PRODUCT_REQUIREMENTS.md#32-admin) "Examination management" is Admin-only        |
| GradeScale                                   | —     | CRUD                    | R                                       | —                  | —                |                                                                                                |
| MarksRecord                                  | —     | RU _(all, via Reports)_ | CRU _(assigned subjects/sections only)_ | R _(own children)_ | R _(own)_        | [PRD § 3.3](../PRODUCT_REQUIREMENTS.md#33-teacher) "Marks entry for assigned subjects/classes" |
| ReportCard                                   | —     | CRUD                    | R _(assigned students only)_            | R _(own children)_ | R _(own)_        |                                                                                                |

## 7. System / Cross-Cutting

| Entity   | Guest | Admin                                     | Teacher | Parent (Future) | Student (Future) | Scope Notes                                                                                                         |
| -------- | ----- | ----------------------------------------- | ------- | --------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| AuditLog | —     | R _(read-only, never editable by anyone)_ | —       | —               | —                | Append-only, per [DOMAIN_MODEL.md § 9.1](./DOMAIN_MODEL.md#91-auditlog) — no role has write access, including Admin |

---

## 8. Cross-Cutting Enforcement Principles

- **Server-side enforcement only, per [NFR-7](../PRODUCT_REQUIREMENTS.md#9-non-functional-requirements).** Every _(scoped)_ restriction in the tables above must be enforced in the query/mutation layer (e.g., a Server Action filtering by the caller's `TeacherAssignment` rows), never only by hiding UI elements — directly reaffirming [ARCHITECTURE.md § 7](../ARCHITECTURE.md#7-security-principles).
- **"Assigned classes only" is always resolved via `TeacherAssignment`,** never a flat "all sections this teacher has ever touched" — a `TeacherAssignment` that's been soft-deleted (reassigned away) should stop granting access, not just stop appearing in the UI.
- **`schoolId` scoping is implicit everywhere in this table,** the same way it's implicit in every entity per [PRODUCT_ARCHITECTURE.md § 2](../PRODUCT_ARCHITECTURE.md#2-future-architecture) — every row above additionally assumes "within the caller's own school," which is trivially true today (one school) and becomes a real filter at Epic H.
- **Parent/Student columns describe an intended future shape, not a commitment to that exact shape.** When the Parent Portal epic is actually scoped ([PRODUCT_ARCHITECTURE.md § 6](../PRODUCT_ARCHITECTURE.md#6-parent-portal)), this matrix's Future columns are a starting reference, not a final specification — that epic's own scoping work should confirm or revise them.
