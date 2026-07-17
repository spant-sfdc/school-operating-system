# Database Schema (Illustrative)

**⚠️ This document is documentation, not code.** Every code block below is **illustrative pseudo-schema** — Prisma-like syntax chosen because it's the most compact, precise notation for engineers who will eventually build this, not because a `.prisma` file exists. There is no `prisma/schema.prisma` in this repository yet, and this task does not create one — see [README.md](./README.md). When Epic B actually begins, this document is the _starting reference_ for the real schema, not a copy-paste source — the real implementation task should re-derive field types against whatever Prisma/database version is current at that time.

Field-by-field rationale (why each field exists, its constraints, its PII classification) lives in [DATA_DICTIONARY.md](./DATA_DICTIONARY.md). This document shows _shape_ — types and relations — organized by the same bounded contexts as [DOMAIN_MODEL.md](./DOMAIN_MODEL.md).

---

## 1. The `schoolId` Convention

Every model below that represents school-owned data carries `schoolId String` as its first relational field, per [PRODUCT_ARCHITECTURE.md § 2](../PRODUCT_ARCHITECTURE.md#2-future-architecture) step 2 — cheap to include now (defaults to the one real school), expensive to retrofit once real relational data exists. It is omitted from the code blocks below only where a model is already scoped transitively through a parent that itself carries `schoolId` (e.g., `Section` doesn't need its own `schoolId` if `Class.schoolId` already scopes it) — noted per-model where that applies.

## 2. Common Conventions

- `id String @id @default(cuid())` on every model — omitted from each block below to reduce repetition; assume every model has one, **except** `AttendanceRecord`, `MarksRecord`, and `AuditLog`, which should use a time-ordered ID (ULID or UUIDv7) instead, per [docs/database/DATABASE_REVIEW.md § 11](../database/DATABASE_REVIEW.md#11-primary-key-strategy-summary) — B-tree insert locality genuinely matters at the row counts those three tables reach; every other table's insert volume is low enough that the choice doesn't matter.
- `createdAt DateTime`, `updatedAt DateTime` on every model — same, omitted for brevity.
- Soft-deletable models carry `deletedAt DateTime?` rather than a hard `delete` — see each entity's "Soft delete" note in [DOMAIN_MODEL.md](./DOMAIN_MODEL.md).
- Enum values shown in `UPPER_SNAKE_CASE` are illustrative; final naming is a real implementation-task decision, not fixed here.

---

## 3. School & Academic Structure

```
model School {
  schoolId          String   @id
  name              String
  shortName         String?
  affiliationBoard  String?           // CBSE | ICSE | StateBoard | Unaffiliated | ... (configurable, not enum-fixed)
  udiseCode         String?  @unique  // UDISE+ school code — see DOMAIN_MODEL.md § 4.2.1 for the student-level equivalent
  status            SchoolStatus @default(ACTIVE)
}

model AcademicYear {
  schoolId       String
  school         School   @relation(fields: [schoolId], references: [schoolId])
  label          String            // "2026-27"
  startDate      DateTime
  endDate        DateTime
  isCurrent      Boolean  @default(false)   // exactly one true per school — business rule, see BUSINESS_RULES.md § 1;
  // schema-enforced via a partial unique index (WHERE isCurrent = true), see
  // docs/database/CONSTRAINT_STRATEGY.md § 3 — not left as an application-only invariant.
  status         AcademicYearStatus @default(ACTIVE)   // ACTIVE | CLOSED
  promotionPolicy Json             // { noDetentionUntilClass: "Class 5", reExamAllowed: true, ... } — see BUSINESS_RULES.md § 6
}

model Class {
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [schoolId])
  name        String            // "Nursery", "LKG", "UKG", "Class 1" ... "Class 8"
  sortOrder   Int               // school-configurable sequencing, not assumed alphabetical
  deletedAt   DateTime?
}

model Section {
  academicYearId String
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
  classId        String
  class          Class    @relation(fields: [classId], references: [id])
  name           String            // "A", "B" — combined with Class.name for display, e.g. "6-A"
  capacity       Int?
  deletedAt      DateTime?

  @@unique([classId, academicYearId, name])
  // Partial (WHERE deletedAt IS NULL) per docs/database/SOFT_DELETE_STRATEGY.md § 2 —
  // found missing in docs/database/DATABASE_REVIEW.md § 15, added here.
}

model Subject {
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [schoolId])
  name        String            // "Mathematics", "Environmental Studies", ...
  code        String?
  deletedAt   DateTime?

  @@unique([schoolId, name])
  // Partial (WHERE deletedAt IS NULL) per docs/database/SOFT_DELETE_STRATEGY.md § 2 —
  // found missing in docs/database/DATABASE_REVIEW.md § 15, added here.
}

model ClassSubject {
  academicYearId String
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
  classId        String
  class          Class    @relation(fields: [classId], references: [id])
  subjectId      String
  subject        Subject  @relation(fields: [subjectId], references: [id])

  @@unique([academicYearId, classId, subjectId])
}
```

## 4. People & Identity

```
model User {
  schoolId       String
  school         School   @relation(fields: [schoolId], references: [schoolId])
  email          String   @unique
  passwordHash   String?           // nullable — depends on Auth.js provider decision, ARCHITECTURE.md § 9
  role           UserRole          // ADMIN | TEACHER | (reserved) PARENT | STUDENT — see D-001
  deactivatedAt  DateTime?
}

model Teacher {
  schoolId       String
  school         School   @relation(fields: [schoolId], references: [schoolId])
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  firstName      String
  lastName       String
  phone          String
  gender         String?
  dateOfBirth    DateTime?
  photoUrl       String?           // Cloudinary — NFR-6
  status         TeacherStatus @default(ACTIVE)   // ACTIVE | ON_LEAVE | EXITED
}

model TeacherQualification {
  teacherId       String
  teacher         Teacher  @relation(fields: [teacherId], references: [id])
  qualificationType String          // "B.Ed" | "TET" | "M.Ed" | ... — small reference list, not school-configurable
  institution     String?
  yearCompleted   Int?
  certificateDocumentId String?     // FK to DocumentRecord, optional
  deletedAt       DateTime?
}

model Student {
  schoolId        String
  school          School   @relation(fields: [schoolId], references: [schoolId])
  firstName       String
  lastName        String
  dateOfBirth     DateTime
  gender          String?
  photoUrl        String?
  udisePen        String?  @unique  // Permanent Education Number — persists across schools, DOMAIN_MODEL.md § 4.2.1
  admissionNumber String   @unique  // school-issued, not the same as udisePen
  category        String?           // General | SC | ST | OBC | EWS | ... — used by admission category & TC, configurable list
  status          StudentStatus @default(ACTIVE)   // ACTIVE | ALUMNI | TRANSFERRED_OUT | WITHDRAWN
}

model Guardian {
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [schoolId])
  firstName   String
  lastName    String
  phone       String
  email       String?
  address     String?
  deletedAt   DateTime?
}

model StudentGuardian {
  studentId              String
  student                Student  @relation(fields: [studentId], references: [id])
  guardianId             String
  guardian               Guardian @relation(fields: [guardianId], references: [id])
  relationshipType       String            // FATHER | MOTHER | LEGAL_GUARDIAN | OTHER — fixed small enum
  isPrimaryContact       Boolean  @default(false)
  isAuthorizedForPickup  Boolean  @default(false)
  deletedAt              DateTime?

  @@unique([studentId, guardianId])
}
```

## 5. Admission

```
model AdmissionEnquiry {
  schoolId        String
  school          School   @relation(fields: [schoolId], references: [schoolId])
  studentName     String
  classAppliedFor String
  guardianName    String
  guardianPhone   String
  guardianEmail   String?
  source          String?           // "Website" | "Walk-in" | "Referral" — reporting-relevant, see REPORTING_MODEL.md
  status          EnquiryStatus @default(NEW)   // NEW | CONTACTED | CONVERTED | CLOSED
}

model AdmissionApplication {
  schoolId          String
  school            School   @relation(fields: [schoolId], references: [schoolId])
  enquiryId         String?
  enquiry           AdmissionEnquiry? @relation(fields: [enquiryId], references: [id])
  classAppliedFor   String
  admissionCategory String            // General | RTE | ManagementQuota | StaffWard | Sibling | ... — school-configurable list
  status            ApplicationStatus @default(SUBMITTED)
  // SUBMITTED | UNDER_REVIEW | OFFER_MADE | DOCUMENTS_VERIFIED | CONFIRMED | REJECTED | WITHDRAWN
  resultingStudentId String?  @unique  // set once confirmed
  resultingStudent   Student? @relation(fields: [resultingStudentId], references: [id])
  // Relation was missing — every other *Id field in this document pairs with a declared
  // relation; this is the FK WORKFLOWS.md § 1 ("Student record created") and
  // MIGRATION_PLAN.md § 2's Migration 009 note both already assume exists.
}

model RteDetails {
  applicationId         String   @unique
  application           AdmissionApplication @relation(fields: [applicationId], references: [id])
  incomeCertificateDocumentId  String?
  categoryCertificateDocumentId String?
  lotteryReferenceNumber String?
  reimbursementStatus    String? // PENDING | SUBMITTED | RECEIVED — future Fee-module territory beyond V1 tracking
}

model DocumentRecord {
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [schoolId])
  ownerType   String            // "Student" | "Teacher" | "AdmissionApplication" — see § 9 below;
  // CHECK (ownerType IN (...)) recommended over a native enum, see
  // docs/database/ENUM_STRATEGY.md § 3.1 and docs/database/CONSTRAINT_STRATEGY.md § 4.
  ownerId     String
  documentType String           // "BirthCertificate" | "PreviousTC" | "CategoryCertificate" | "Photo" | ...
  fileUrl     String            // Cloudinary — NFR-6
  uploadedByUserId String
  deletedAt   DateTime?
}
```

## 6. Enrollment & Progression

```
model Enrollment {
  schoolId       String
  school         School   @relation(fields: [schoolId], references: [schoolId])
  studentId      String
  student        Student  @relation(fields: [studentId], references: [id])
  academicYearId String
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
  sectionId      String
  section        Section  @relation(fields: [sectionId], references: [id])
  rollNumber     String

  @@unique([studentId, academicYearId])
  @@unique([sectionId, rollNumber])
}

model TeacherAssignment {
  academicYearId  String
  academicYear    AcademicYear @relation(fields: [academicYearId], references: [id])
  teacherId       String
  teacher         Teacher  @relation(fields: [teacherId], references: [id])
  sectionId       String
  section         Section  @relation(fields: [sectionId], references: [id])
  subjectId       String?           // nullable when isClassTeacher = true and this row is the class-teacher designation
  subject         Subject? @relation(fields: [subjectId], references: [id])
  isClassTeacher  Boolean  @default(false)
  deletedAt       DateTime?

  @@unique([academicYearId, sectionId, subjectId])
  // Covers subject-assignment rows (one teacher per subject per section per year).
  // The separate "exactly one isClassTeacher = true per section per year" rule needs a
  // partial unique index instead (subjectId is null on that row) — see
  // docs/database/CONSTRAINT_STRATEGY.md § 3 and docs/database/DATABASE_REVIEW.md § 7.
}

model PromotionRecord {
  sourceEnrollmentId  String   @unique
  sourceEnrollment    Enrollment @relation("SourceEnrollment", fields: [sourceEnrollmentId], references: [id])
  outcome             PromotionOutcome  // PROMOTED | DETAINED | TRANSFERRED_OUT | WITHDRAWN
  resultingEnrollmentId String? @unique
  resultingEnrollment Enrollment? @relation("ResultingEnrollment", fields: [resultingEnrollmentId], references: [id])
  basis               PromotionBasis    // EXAM_RESULT | NO_DETENTION_POLICY | RE_EXAM — see BUSINESS_RULES.md § 6.
  // Promoted from a plain String to a native enum per docs/database/ENUM_STRATEGY.md § 2 —
  // found inconsistent (its sibling field `outcome` was already an enum) in
  // docs/database/DATABASE_REVIEW.md § 13.
  decidedByUserId     String
}

model TransferCertificate {
  schoolId           String
  school             School   @relation(fields: [schoolId], references: [schoolId])
  // Added directly (not left transitive-via-Student) specifically so tcNumber's
  // uniqueness below can be scoped per school — a same-table @@unique can't span a join.
  studentId          String   @unique
  student            Student  @relation(fields: [studentId], references: [id])
  finalEnrollmentId  String
  finalEnrollment    Enrollment @relation(fields: [finalEnrollmentId], references: [id])
  tcNumber           String
  dateOfIssue        DateTime
  dateOfAdmission    DateTime
  classAdmittedInto  String
  classCurrentlyIn   String
  qualifiedForPromotion Boolean
  subjectsStudied    String[]
  workingDays        Int
  daysPresent        Int
  generalConduct     String
  reasonForLeaving   String
  feeDuesStatus      String
  issuedByUserId     String
  // Content shape per DOMAIN_MODEL.md § 6.4 — near-universal TC field set; state-specific format layered at print time

  @@unique([schoolId, tcNumber])
  // Corrected from a globally-unique tcNumber — found in docs/database/DATABASE_REVIEW.md § 15
  // and § 12: a global constraint would break the moment a second school's independently
  // numbered TCs collide with the first's, at Epic H.
}
```

## 7. Attendance

```
model AttendanceSession {
  sectionId        String
  section          Section  @relation(fields: [sectionId], references: [id])
  date             DateTime @db.Date
  markedByUserId   String
  lastEditedByUserId String?
  lastEditedAt     DateTime?

  @@unique([sectionId, date])
}

model AttendanceRecord {
  sessionId    String
  session      AttendanceSession @relation(fields: [sessionId], references: [id])
  enrollmentId String
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id])
  status       AttendanceStatus  // PRESENT | ABSENT | HALF_DAY | LEAVE

  @@unique([sessionId, enrollmentId])
}
```

## 8. Examination

```
model ExamTerm {
  academicYearId String
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
  name           String            // "Unit Test 1" | "Half-Yearly" | "Annual" | "FA1" | ... school-configurable
  sortOrder      Int
  weightagePercent Int?            // toward final promotion decision, if the school's policy uses weighted terms
  deletedAt      DateTime?
}

model Examination {
  examTermId     String
  examTerm       ExamTerm @relation(fields: [examTermId], references: [id])
  classId        String
  class          Class    @relation(fields: [classId], references: [id])
  name           String            // "Half-Yearly Examination — Class 6"
  deletedAt      DateTime?
}

model ExamSubjectSchedule {
  examinationId  String
  examination    Examination @relation(fields: [examinationId], references: [id])
  subjectId      String
  subject        Subject  @relation(fields: [subjectId], references: [id])
  examDate       DateTime?
  maxMarks       Int
  passMarks      Int
  deletedAt      DateTime?

  @@unique([examinationId, subjectId])
}

model GradeScale {
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [schoolId])
  name        String            // "CBSE 9-Point" | "Nursery Descriptive" | ...
  bands       Json              // [{ minPercent: 91, maxPercent: 100, grade: "A1", gradePoint: 10 }, ...]
  deletedAt   DateTime?
}

model MarksRecord {
  enrollmentId          String
  enrollment            Enrollment @relation(fields: [enrollmentId], references: [id])
  examSubjectScheduleId String
  examSubjectSchedule   ExamSubjectSchedule @relation(fields: [examSubjectScheduleId], references: [id])
  marksObtained         Decimal
  grade                 String?           // derived from GradeScale at entry time, re-derivable, not authoritative over marksObtained
  enteredByUserId       String
  lastEditedByUserId    String?
  lastEditedAt          DateTime?

  @@unique([enrollmentId, examSubjectScheduleId])
}

model ReportCard {
  enrollmentId   String
  enrollment     Enrollment @relation(fields: [enrollmentId], references: [id])
  examinationId  String?           // null when this is an annual/consolidated card spanning multiple examinations
  examination    Examination? @relation(fields: [examinationId], references: [id])
  snapshot       Json              // frozen marks/grades/attendance% at generation time — see DOMAIN_MODEL.md § 8.6
  generatedByUserId String
  generatedAt    DateTime
}
```

## 9. `DocumentRecord` — A Note on the Polymorphic Reference

`DocumentRecord.ownerType` + `ownerId` (§ 5) is a deliberate departure from Prisma's normal strongly-typed relation pattern — a real implementation could instead give `Student`, `Teacher`, and `AdmissionApplication` each their own `documents DocumentRecord[]` via three nullable FK columns on `DocumentRecord`. Both are legitimate; the polymorphic shape shown here trades referential-integrity strictness (a bad `ownerId` isn't caught by a foreign key) for a single table instead of N nearly-identical ones. **This tradeoff is explicitly left open for the real implementation task to decide**, not settled here — flagged so a future engineer doesn't mistake this document's choice for a final decision.

## 10. Cross-Cutting: `AuditLog`

```
model AuditLog {
  schoolId     String
  entityType   String            // "Student" | "MarksRecord" | "AttendanceRecord" | ...
  entityId     String
  actorUserId  String
  action       AuditAction       // CREATE | UPDATE | SOFT_DELETE — enum per docs/database/ENUM_STRATEGY.md § 2
  beforeValue  Json?
  afterValue   Json?
  timestamp    DateTime @default(now())
  // Append-only — no updatedAt, no deletedAt. See DOMAIN_MODEL.md § 9.1.
}
```
