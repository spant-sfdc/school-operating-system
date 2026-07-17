# Data Dictionary

**Purpose:** Field-by-field detail for every entity in [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) — type, nullability, constraints, and PII classification. Where [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) shows _shape_, this document shows _meaning and sensitivity_, one field at a time.

---

## PII Classification Legend

Most students in this system's scope are minors — this matters specifically under India's **Digital Personal Data Protection (DPDP) Act 2023**, which imposes heightened obligations for processing a child's personal data (Section 9: verifiable parental consent, no tracking/behavioral-monitoring/targeted-advertising directed at children). Every field below is classified so a future implementation can apply the right handling without re-deriving this analysis per field:

| Class             | Meaning                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Non-PII**       | Operational/administrative data; does not identify a specific person                                                              |
| **PII**           | Directly identifies a person (name, phone, email, address, photo)                                                                 |
| **Sensitive PII** | Reveals a protected/sensitive attribute (category/caste, income-certificate references, health)                                   |
| **Minor PII**     | PII belonging to a child (any `Student` field, since this platform's students are Nursery–Class 8) — subject to DPDP Act 2023 § 9 |

This classification is descriptive, not a compliance implementation — an actual consent/retention/access-control mechanism is a future engineering task, flagged in [BUSINESS_RULES.md § 8](./BUSINESS_RULES.md#8-data-protection--dpdp-act-2023).

---

## 1. School & Academic Structure

### School

| Field            | Type   | Null? | Constraints         | PII     | Notes                                                     |
| ---------------- | ------ | ----- | ------------------- | ------- | --------------------------------------------------------- |
| schoolId         | String | No    | Primary key         | Non-PII | Also the tenant identifier once Epic H exists             |
| name             | String | No    |                     | Non-PII |                                                           |
| shortName        | String | Yes   |                     | Non-PII |                                                           |
| affiliationBoard | String | Yes   | School-configurable | Non-PII | CBSE / ICSE / State Board / Unaffiliated — not enum-fixed |
| udiseCode        | String | Yes   | Unique              | Non-PII | Government school identifier, UDISE+                      |
| status           | Enum   | No    | ACTIVE only in V1   | Non-PII |                                                           |

### AcademicYear

| Field           | Type     | Null? | Constraints                                                                                                                                                                                                                                         | PII     | Notes                                                                          |
| --------------- | -------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------ |
| label           | String   | No    |                                                                                                                                                                                                                                                     | Non-PII | "2026-27"                                                                      |
| startDate       | DateTime | No    |                                                                                                                                                                                                                                                     | Non-PII |                                                                                |
| endDate         | DateTime | No    | Must be after `startDate`                                                                                                                                                                                                                           | Non-PII |                                                                                |
| isCurrent       | Boolean  | No    | Exactly one `true` per school — [BUSINESS_RULES.md § 1](./BUSINESS_RULES.md#1-academic-year), schema-enforced via partial unique index, see [docs/database/CONSTRAINT_STRATEGY.md § 3](../database/CONSTRAINT_STRATEGY.md#3-partial-unique-indexes) | Non-PII |                                                                                |
| status          | Enum     | No    | ACTIVE \| CLOSED                                                                                                                                                                                                                                    | Non-PII |                                                                                |
| promotionPolicy | JSON     | No    |                                                                                                                                                                                                                                                     | Non-PII | See [BUSINESS_RULES.md § 6](./BUSINESS_RULES.md#6-promotion--detention-policy) |

### Class

| Field     | Type   | Null? | Constraints                  | PII     | Notes                   |
| --------- | ------ | ----- | ---------------------------- | ------- | ----------------------- |
| name      | String | No    | Unique per school            | Non-PII | "Nursery" ... "Class 8" |
| sortOrder | Int    | No    | School-configurable sequence | Non-PII |                         |

### Section

| Field    | Type   | Null? | Constraints                      | PII     | Notes    |
| -------- | ------ | ----- | -------------------------------- | ------- | -------- |
| name     | String | No    | Unique per (class, academicYear) | Non-PII | "A", "B" |
| capacity | Int    | Yes   |                                  | Non-PII |          |

### Subject / ClassSubject

| Field          | Type   | Null? | Constraints       | PII     | Notes |
| -------------- | ------ | ----- | ----------------- | ------- | ----- |
| name (Subject) | String | No    | Unique per school | Non-PII |       |
| code (Subject) | String | Yes   |                   | Non-PII |       |

---

## 2. People & Identity

### User

| Field         | Type     | Null? | Constraints                 | PII     | Notes                                                                                               |
| ------------- | -------- | ----- | --------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| email         | String   | No    | Unique                      | PII     |                                                                                                     |
| passwordHash  | String   | Yes   | Depends on Auth.js provider | Non-PII | Never stored plaintext; nullable if OAuth-only                                                      |
| role          | Enum     | No    | ADMIN \| TEACHER (V1)       | Non-PII | PARENT \| STUDENT reserved, unused — [D-001](../DECISIONS.md#d-001--three-roles-only-for-version-1) |
| deactivatedAt | DateTime | Yes   |                             | Non-PII |                                                                                                     |

### Teacher

| Field                | Type     | Null? | Constraints                  | PII           | Notes                                               |
| -------------------- | -------- | ----- | ---------------------------- | ------------- | --------------------------------------------------- |
| firstName / lastName | String   | No    |                              | PII           |                                                     |
| phone                | String   | No    |                              | PII           |                                                     |
| gender               | String   | Yes   |                              | PII           |                                                     |
| dateOfBirth          | DateTime | Yes   |                              | Sensitive PII | Adult, but still a birthdate — moderate sensitivity |
| photoUrl             | String   | Yes   | Cloudinary URL               | PII           |                                                     |
| status               | Enum     | No    | ACTIVE \| ON_LEAVE \| EXITED | Non-PII       |                                                     |

### TeacherQualification

| Field                 | Type   | Null? | Constraints          | PII                       | Notes                                                                     |
| --------------------- | ------ | ----- | -------------------- | ------------------------- | ------------------------------------------------------------------------- |
| qualificationType     | String | No    | Small reference list | Non-PII                   |                                                                           |
| institution           | String | Yes   |                      | Non-PII                   |                                                                           |
| yearCompleted         | Int    | Yes   |                      | Non-PII                   |                                                                           |
| certificateDocumentId | String | Yes   | FK → DocumentRecord  | PII (via linked document) | The certificate file itself may contain the teacher's full legal name/DOB |

### Student

| Field                | Type     | Null? | Constraints                                                                                              | PII                  | Notes                                                                    |
| -------------------- | -------- | ----- | -------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------ |
| firstName / lastName | String   | No    |                                                                                                          | Minor PII            |                                                                          |
| dateOfBirth          | DateTime | No    | Used for admission-age validation ([BUSINESS_RULES.md § 2](./BUSINESS_RULES.md#2-admission-eligibility)) | Minor PII            |                                                                          |
| gender               | String   | Yes   |                                                                                                          | Minor PII            |                                                                          |
| photoUrl             | String   | Yes   | Cloudinary URL                                                                                           | Minor PII            |                                                                          |
| udisePen             | String   | Yes   | Unique when present                                                                                      | Minor PII, Sensitive | Government identifier — persists across schools, DOMAIN_MODEL.md § 4.2.1 |
| admissionNumber      | String   | No    | Unique per school                                                                                        | Non-PII              | School-issued, not a national identifier                                 |
| category             | String   | Yes   | School-configurable list                                                                                 | Sensitive PII        | General/SC/ST/OBC/EWS — reveals a protected social category              |
| status               | Enum     | No    | ACTIVE \| ALUMNI \| TRANSFERRED_OUT \| WITHDRAWN                                                         | Non-PII              |                                                                          |

### Guardian / StudentGuardian

| Field                           | Type    | Null? | Constraints                                 | PII     | Notes                                     |
| ------------------------------- | ------- | ----- | ------------------------------------------- | ------- | ----------------------------------------- |
| firstName / lastName (Guardian) | String  | No    |                                             | PII     |                                           |
| phone (Guardian)                | String  | No    |                                             | PII     | Primary school-to-family contact channel  |
| email (Guardian)                | String  | Yes   |                                             | PII     |                                           |
| address (Guardian)              | String  | Yes   |                                             | PII     |                                           |
| relationshipType (join)         | String  | No    | FATHER \| MOTHER \| LEGAL_GUARDIAN \| OTHER | Non-PII |                                           |
| isPrimaryContact (join)         | Boolean | No    |                                             | Non-PII |                                           |
| isAuthorizedForPickup (join)    | Boolean | No    |                                             | Non-PII | Safety-relevant, not identity data itself |

---

## 3. Admission

### AdmissionEnquiry

| Field           | Type   | Null? | Constraints                                                                                               | PII       | Notes                                                               |
| --------------- | ------ | ----- | --------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------- |
| studentName     | String | No    | Field list itself pending confirmation — [PRD § 11](../PRODUCT_REQUIREMENTS.md#11-open-product-questions) | Minor PII |                                                                     |
| classAppliedFor | String | No    |                                                                                                           | Non-PII   |                                                                     |
| guardianName    | String | No    |                                                                                                           | PII       |                                                                     |
| guardianPhone   | String | No    |                                                                                                           | PII       |                                                                     |
| guardianEmail   | String | Yes   |                                                                                                           | PII       |                                                                     |
| source          | String | Yes   |                                                                                                           | Non-PII   | Reporting dimension, see [REPORTING_MODEL.md](./REPORTING_MODEL.md) |
| status          | Enum   | No    | NEW \| CONTACTED \| CONVERTED \| CLOSED                                                                   | Non-PII   |                                                                     |

### AdmissionApplication

| Field              | Type   | Null? | Constraints                                    | PII           | Notes                                                                                             |
| ------------------ | ------ | ----- | ---------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| classAppliedFor    | String | No    |                                                | Non-PII       |                                                                                                   |
| admissionCategory  | String | No    | School-configurable list                       | Sensitive PII | Includes RTE — see [BUSINESS_RULES.md § 3](./BUSINESS_RULES.md#3-admission-categories--rte-quota) |
| status             | Enum   | No    | SUBMITTED → ... → CONFIRMED/REJECTED/WITHDRAWN | Non-PII       |                                                                                                   |
| resultingStudentId | String | Yes   | Unique, set on confirmation                    | Non-PII       |                                                                                                   |

### RteDetails

| Field                         | Type   | Null? | Constraints         | PII           | Notes                                                         |
| ----------------------------- | ------ | ----- | ------------------- | ------------- | ------------------------------------------------------------- |
| incomeCertificateDocumentId   | String | Yes   | FK → DocumentRecord | Sensitive PII | Income data is highly sensitive                               |
| categoryCertificateDocumentId | String | Yes   | FK → DocumentRecord | Sensitive PII |                                                               |
| lotteryReferenceNumber        | String | Yes   |                     | Non-PII       | Government-issued reference, not personally identifying alone |
| reimbursementStatus           | String | Yes   |                     | Non-PII       |                                                               |

### DocumentRecord

| Field            | Type   | Null? | Constraints                                      | PII                                            | Notes                                                                                                                                          |
| ---------------- | ------ | ----- | ------------------------------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| ownerType        | String | No    | "Student" \| "Teacher" \| "AdmissionApplication" | Non-PII                                        |                                                                                                                                                |
| ownerId          | String | No    |                                                  | Non-PII                                        | See [DATABASE_SCHEMA.md § 9](./DATABASE_SCHEMA.md#9-documentrecord--a-note-on-the-polymorphic-reference)                                       |
| documentType     | String | No    |                                                  | Non-PII                                        |                                                                                                                                                |
| fileUrl          | String | No    | Cloudinary URL                                   | **Varies — treat as Sensitive PII by default** | The file's _contents_ (birth certificate, category certificate) are almost always sensitive even though the URL field itself is just a pointer |
| uploadedByUserId | String | No    |                                                  | Non-PII                                        |                                                                                                                                                |

---

## 4. Enrollment & Progression

### Enrollment

| Field      | Type   | Null? | Constraints                      | PII     | Notes |
| ---------- | ------ | ----- | -------------------------------- | ------- | ----- |
| rollNumber | String | No    | Unique per (section, this field) | Non-PII |       |

### TeacherAssignment

| Field          | Type    | Null? | Constraints                                                                                                                                                                 | PII     | Notes |
| -------------- | ------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----- |
| subjectId      | String  | Yes   | Null only when `isClassTeacher = true`; one teacher per subject per section per year (`@@unique([academicYearId, sectionId, subjectId])`)                                   | Non-PII |       |
| isClassTeacher | Boolean | No    | Exactly one `true` per section per year — partial unique index, see [docs/database/CONSTRAINT_STRATEGY.md § 3](../database/CONSTRAINT_STRATEGY.md#3-partial-unique-indexes) | Non-PII |       |

### PromotionRecord

| Field           | Type   | Null? | Constraints                                          | PII                                                                   | Notes                                                                                                                                                                                                                                           |
| --------------- | ------ | ----- | ---------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| outcome         | Enum   | No    | PROMOTED \| DETAINED \| TRANSFERRED_OUT \| WITHDRAWN | Non-PII (about a minor's academic record, but not itself identifying) |                                                                                                                                                                                                                                                 |
| basis           | Enum   | No    | EXAM_RESULT \| NO_DETENTION_POLICY \| RE_EXAM        | Non-PII                                                               | Promoted from `String` to match `outcome` — see [BUSINESS_RULES.md § 6](./BUSINESS_RULES.md#6-promotion--detention-policy) and [docs/database/ENUM_STRATEGY.md § 2](../database/ENUM_STRATEGY.md#2-fields-that-should-be-native-postgres-enums) |
| decidedByUserId | String | No    |                                                      | Non-PII                                                               |                                                                                                                                                                                                                                                 |

### TransferCertificate

| Field                                | Type     | Null? | Constraints                                                                                                                                                                          | PII           | Notes                                                                                                   |
| ------------------------------------ | -------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------- |
| schoolId                             | String   | No    |                                                                                                                                                                                      | Non-PII       | Direct, not transitive-via-Student — required so `tcNumber`'s uniqueness below can be scoped per school |
| tcNumber                             | String   | No    | Unique per school (`schoolId` + `tcNumber`), not global — corrected in [docs/database/DATABASE_REVIEW.md § 15](../database/DATABASE_REVIEW.md#15-gaps-found-in-the-conceptual-model) | Non-PII       |                                                                                                         |
| dateOfIssue / dateOfAdmission        | DateTime | No    |                                                                                                                                                                                      | Non-PII       |                                                                                                         |
| classAdmittedInto / classCurrentlyIn | String   | No    |                                                                                                                                                                                      | Non-PII       |                                                                                                         |
| qualifiedForPromotion                | Boolean  | No    |                                                                                                                                                                                      | Minor PII     | Academic outcome about a specific minor                                                                 |
| subjectsStudied                      | String[] | No    |                                                                                                                                                                                      | Non-PII       |                                                                                                         |
| workingDays / daysPresent            | Int      | No    |                                                                                                                                                                                      | Minor PII     | Attendance % is derivable, which is a fact about a specific minor                                       |
| generalConduct                       | String   | No    | Free text                                                                                                                                                                            | Sensitive PII | A conduct remark is an evaluative statement about a minor — handle with care                            |
| reasonForLeaving                     | String   | No    | Free text                                                                                                                                                                            | Sensitive PII | May reference family/financial/disciplinary circumstances                                               |
| feeDuesStatus                        | String   | No    |                                                                                                                                                                                      | Sensitive PII | Financial data                                                                                          |

---

## 5. Attendance

### AttendanceSession

| Field              | Type   | Null? | Constraints        | PII     | Notes |
| ------------------ | ------ | ----- | ------------------ | ------- | ----- |
| date               | Date   | No    | Unique per section | Non-PII |       |
| markedByUserId     | String | No    |                    | Non-PII |       |
| lastEditedByUserId | String | Yes   |                    | Non-PII |       |

### AttendanceRecord

| Field  | Type | Null? | Constraints                            | PII       | Notes                                                        |
| ------ | ---- | ----- | -------------------------------------- | --------- | ------------------------------------------------------------ |
| status | Enum | No    | PRESENT \| ABSENT \| HALF_DAY \| LEAVE | Minor PII | A specific fact about a specific minor's whereabouts pattern |

---

## 6. Examination

### ExamTerm / Examination / ExamSubjectSchedule

| Field                                      | Type   | Null? | Constraints             | PII     | Notes |
| ------------------------------------------ | ------ | ----- | ----------------------- | ------- | ----- |
| name (ExamTerm)                            | String | No    | School-configurable     | Non-PII |       |
| weightagePercent                           | Int    | Yes   |                         | Non-PII |       |
| maxMarks / passMarks (ExamSubjectSchedule) | Int    | No    | `passMarks <= maxMarks` | Non-PII |       |

### GradeScale

| Field | Type | Null? | Constraints                                                                                          | PII     | Notes |
| ----- | ---- | ----- | ---------------------------------------------------------------------------------------------------- | ------- | ----- |
| bands | JSON | No    | Non-overlapping percent bands — [BUSINESS_RULES.md § 5](./BUSINESS_RULES.md#5-examinations--grading) | Non-PII |       |

### MarksRecord

| Field           | Type    | Null? | Constraints                                                                                             | PII       | Notes                                            |
| --------------- | ------- | ----- | ------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------ |
| marksObtained   | Decimal | No    | `0 <= marksObtained <= maxMarks` — [BUSINESS_RULES.md § 5](./BUSINESS_RULES.md#5-examinations--grading) | Minor PII | A specific minor's specific academic performance |
| grade           | String  | Yes   | Derived, re-derivable, not authoritative                                                                | Minor PII |                                                  |
| enteredByUserId | String  | No    |                                                                                                         | Non-PII   |                                                  |

### ReportCard

| Field       | Type     | Null? | Constraints               | PII       | Notes                                                |
| ----------- | -------- | ----- | ------------------------- | --------- | ---------------------------------------------------- |
| snapshot    | JSON     | No    | Frozen at generation time | Minor PII | Aggregates marks + attendance for one specific minor |
| generatedAt | DateTime | No    |                           | Non-PII   |                                                      |

---

## 7. Cross-Cutting: `AuditLog`

| Field                    | Type   | Null? | Constraints                     | PII                                                              | Notes                                                                                                                                                   |
| ------------------------ | ------ | ----- | ------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| entityType               | String | No    |                                 | Non-PII                                                          |                                                                                                                                                         |
| entityId                 | String | No    |                                 | Non-PII                                                          |                                                                                                                                                         |
| actorUserId              | String | No    |                                 | Non-PII                                                          |                                                                                                                                                         |
| action                   | Enum   | No    | CREATE \| UPDATE \| SOFT_DELETE | Non-PII                                                          | Promoted from `String` — see [docs/database/ENUM_STRATEGY.md § 2](../database/ENUM_STRATEGY.md#2-fields-that-should-be-native-postgres-enums)           |
| beforeValue / afterValue | JSON   | Yes   | Snapshot of changed fields      | **Inherits the PII class of whatever entity/field it snapshots** | An audit row touching `Student.category` is itself Sensitive PII by inheritance — access-control the audit log at least as strictly as the data it logs |

**A note on `AuditLog` and PII:** because this table snapshots _other_ entities' field values, its own sensitivity is not fixed — it inherits the highest classification of whatever it's logging at that moment. A real implementation should not treat `AuditLog` as a uniformly low-sensitivity table just because its own schema looks generic.
