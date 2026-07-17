# Workflows

**Purpose:** The actual step-by-step processes the entities in [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) exist to support. Where [PRODUCT_REQUIREMENTS.md § 6](../PRODUCT_REQUIREMENTS.md#6-user-journeys) already documents a user journey at the product level, this document goes one level deeper — which entity changes state at each step.

---

## 1. Admission Workflow

```mermaid
flowchart TD
    A[Guest submits enquiry] --> B[AdmissionEnquiry created, status NEW]
    B --> C{Admin triages}
    C -->|Not pursued| D[status CLOSED]
    C -->|Pursued| E[AdmissionApplication created, status SUBMITTED]
    E --> F[Guardian/Admin uploads documents]
    F --> G[DocumentRecord rows created]
    G --> H{Admission category}
    H -->|RTE| I[RteDetails created]
    H -->|General/Other| J[Continue]
    I --> J
    J --> K[Age-eligibility check against Class + AcademicYear cutoff]
    K -->|Below configured class threshold| L["Age-appropriate interaction, not a scored exam — BUSINESS_RULES.md § 2"]
    K -->|Above threshold, if school uses one| M[Entrance assessment, per school policy]
    L --> N[status UNDER_REVIEW]
    M --> N
    N --> O{Admin decision}
    O -->|Offer| P[status OFFER_MADE]
    O -->|Reject| Q[status REJECTED]
    P --> R[Documents verified]
    R --> S[status DOCUMENTS_VERIFIED]
    S --> T[status CONFIRMED]
    T --> U[Student record created]
    T --> V[Enrollment created — current AcademicYear, chosen Section, roll number assigned]
    U --> V
```

**Key rule callouts:** age-eligibility cutoffs and whether an entrance assessment exists at all are school/state-configurable, not fixed — see [BUSINESS_RULES.md § 2](./BUSINESS_RULES.md#2-admission-eligibility). RTE-category applications cannot reach `CONFIRMED` without a linked `RteDetails` — see [BUSINESS_RULES.md § 3](./BUSINESS_RULES.md#3-admission-categories--rte-quota).

---

## 2. Daily Attendance Workflow

```mermaid
flowchart TD
    A[Teacher opens Attendance for their assigned Section, today] --> B{AttendanceSession exists for section+date?}
    B -->|No| C[Create AttendanceSession]
    B -->|Yes| D[Load existing AttendanceSession + records, pre-filled]
    C --> E[Render one row per active Enrollment in the section]
    D --> E
    E --> F[Teacher marks Present/Absent/Half-Day/Leave per student]
    F --> G[Submit]
    G --> H[Upsert AttendanceRecord rows]
    H --> I[AuditLog entry per changed record]
    I --> J[Visible to Admin — Attendance oversight]
```

Matches [PRD's acceptance criteria](../PRODUCT_REQUIREMENTS.md#7-acceptance-criteria-representative-examples) directly: only the assigned section's students are listed; reopening a marked day pre-fills and allows editing, not re-creation.

---

## 3. Marks Entry Workflow

```mermaid
flowchart TD
    A[Teacher selects Examination + Subject + Section] --> B[System resolves ExamSubjectSchedule for that Examination+Subject]
    B --> C[Render one row per active Enrollment in the section]
    C --> D[Teacher enters marksObtained per student]
    D --> E{marksObtained <= maxMarks?}
    E -->|No| F[Reject with inline error — BUSINESS_RULES.md § 5]
    E -->|Yes| G[Upsert MarksRecord]
    G --> H[Derive grade from active GradeScale, if configured]
    H --> I[AuditLog entry]
    I --> J[Visible to Admin — Reports]
```

---

## 4. Examination Setup Workflow (Admin, precedes § 3)

```mermaid
flowchart TD
    A[Admin selects ExamTerm + Class] --> B[Create Examination]
    B --> C[For each Subject in that Class's ClassSubject list]
    C --> D[Create ExamSubjectSchedule: date, maxMarks, passMarks]
    D --> E[Examination ready for marks entry]
```

---

## 5. Promotion Workflow (End of Academic Year)

```mermaid
flowchart TD
    A[AcademicYear nears endDate] --> B[Admin reviews each active Enrollment]
    B --> C{AcademicYear.promotionPolicy for this class}
    C -->|No-detention| D[Outcome: PROMOTED, basis NoDetentionPolicy]
    C -->|Exam-based| E{Passed configured threshold?}
    E -->|Yes| F[Outcome: PROMOTED, basis ExamResult]
    E -->|No, re-exam allowed| G[Re-examination]
    G -->|Pass| H[Outcome: PROMOTED, basis ReExam]
    G -->|Fail| I[Outcome: DETAINED, basis ReExam]
    E -->|No, re-exam not applicable| I
    D --> J[Create PromotionRecord]
    F --> J
    H --> J
    I --> J
    J --> K{Outcome}
    K -->|PROMOTED| L[Create next-year Enrollment: Class+1, new Section, new roll number]
    K -->|DETAINED| M[Create next-year Enrollment: same Class, new Section if reorganized]
    L --> N[PromotionRecord.resultingEnrollment set]
    M --> N
```

**Key rule callout:** which branch applies (`No-detention` vs. `Exam-based`) is entirely `AcademicYear.promotionPolicy`-driven, per [BUSINESS_RULES.md § 6](./BUSINESS_RULES.md#6-promotion--detention-policy) — this diagram shows the shape of the decision, not a fixed national or Rajasthan-specific rule.

---

## 6. Transfer / Withdrawal Workflow

```mermaid
flowchart TD
    A[Guardian/Admin initiates withdrawal] --> B[Admin confirms reason for leaving]
    B --> C[System computes: workingDays, daysPresent from AttendanceRecord history for current Enrollment]
    C --> D[Admin confirms: qualifiedForPromotion, generalConduct, feeDuesStatus, subjectsStudied]
    D --> E[Generate TransferCertificate, assign tcNumber]
    E --> F[Student.status set to TRANSFERRED_OUT or WITHDRAWN]
    F --> G[Enrollment marked as final for this student]
    G --> H[TC issued — immutable record, DATABASE_SCHEMA.md]
    H --> I{Correction ever needed?}
    I -->|Yes| J[Issue a new dated TC referencing the same Student — original untouched]
    I -->|No| K[Done]
```

---

## 7. Teacher Onboarding Workflow

```mermaid
flowchart TD
    A[Admin adds new Teacher: name, contact, qualifications] --> B[Create User, role TEACHER]
    B --> C[Create Teacher profile, linked to User]
    C --> D[Create TeacherQualification rows]
    D --> E[Admin assigns: Sections + Subjects via TeacherAssignment]
    E --> F{Is this teacher a Class Teacher?}
    F -->|Yes| G[TeacherAssignment row with isClassTeacher = true for that Section]
    F -->|No| H[Subject-only TeacherAssignment rows]
    G --> I[System issues account credentials]
    H --> I
    I --> J[Teacher receives access, can log in — PRD § 6.4]
```

---

## 8. Academic Structure Setup Workflow (Start of Each Academic Year)

```mermaid
flowchart TD
    A[Admin creates new AcademicYear] --> B[Set promotionPolicy, term structure]
    B --> C[Create/roll-over Sections per Class]
    C --> D[Confirm ClassSubject list per Class for this year]
    D --> E[Set previous AcademicYear.isCurrent = false]
    E --> F[Set new AcademicYear.isCurrent = true]
    F --> G[Run Promotion Workflow § 5 for all continuing students]
    G --> H[Process new AdmissionApplications § 1 into fresh Enrollments]
    H --> I[Assign TeacherAssignments for the new year]
```

This is the one workflow that touches nearly every bounded context in [DOMAIN_MODEL.md § 2](./DOMAIN_MODEL.md#2-bounded-contexts) — worth Epic B treating as its own late-stage milestone once a full year's data exists to roll over, not something to build speculatively before there's a real first year to conclude.
