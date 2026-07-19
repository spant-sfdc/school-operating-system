# Import Engine Strategy — Data Migration Engine

**Purpose:** The complete design for [Epic D — Data Migration Engine](./EPIC_ROADMAP.md#epic-d--data-migration-engine-import-engine): a reusable, generic import pipeline covering Students, Teachers, Academic Structure today, and any future module tomorrow. **This is a design document — nothing here is implemented.**

---

## 1. Design Principle: One Engine, Not One Importer Per Entity

Every entity type this engine will ever import (Student, Teacher, Academic Structure, and — later — Examination/Admission data) goes through the same five stages. What varies per entity type is a small, declarative **import profile** (column mapping targets, validation schema, the service function to call on commit) — not a bespoke pipeline. This is the same discipline [ENGINEERING_PRINCIPLES.md](../engineering/ENGINEERING_PRINCIPLES.md) already applies to repositories/services (one consistent shape, reused, not reinvented per entity), extended to a new layer.

```
Upload → Column Mapping → Validation → Preview → Commit → (AuditLog, automatic)
```

## 2. The Five Stages

### 2.1 Upload

- Accepts CSV or XLSX — the format every school already has, per [§ 5](#5-rajasthan-rte-integration-research)'s market research: even competing school-ERP vendors' own "RTE import" feature is fundamentally "get the data into a spreadsheet, then upload it."
- File is parsed and stored (temporarily, or as a permanent audit artifact — see § 2.6) **before** any commit — the raw upload is never written directly to `Student`/`Teacher`/etc. tables.

### 2.2 Column Mapping

- The uploaded file's actual column headers (which will not match this schema's field names — no real school's spreadsheet has a column literally named `admissionNumber`) are mapped, by an Admin, to the target entity's known fields.
- A saved mapping (per client, per entity type) means the second batch of the same client's data doesn't require re-mapping — a real usability win for a multi-batch migration (e.g., importing Nursery–Class 4 this week, Class 5–8 next week).
- Required vs. optional fields are declared per entity type, reusing the same Zod schemas the regular service layer already validates against (`registerStudentInputSchema`, `registerTeacherInputSchema`, etc.) — the mapping step's job is only to get raw spreadsheet columns into the shape those schemas already expect, not to define a second, parallel notion of "what's required."

### 2.3 Validation

- Runs **every** mapped row through the **same** Zod schema the manual Admin-form path would use — no duplicated validation logic, per [AI_RULES.md § 2](../AI_RULES.md#2-code--component-discipline)'s "no duplicate logic" rule.
- Additional import-specific checks beyond field-level Zod validation: duplicate `admissionNumber`/email **within the uploaded file itself** (not just against the database), and referential checks (does the row's `className`/`sectionName` resolve to an actual `SchoolClass`/`Section` — critically, this means **Academic Structure should typically be imported before Student/Teacher data** for a real client, since a student row needs a section to enroll into).
- **Validation runs for every row before any commit begins** — a full dry-run pass, not a fail-fast-on-first-error pass. This is what makes Preview (§ 2.4) meaningful: the Admin sees every problem at once, not one at a time across five failed upload attempts.

### 2.4 Preview

- Mandatory. **There is no direct upload-and-commit path** — an Admin always sees, before anything is written: how many rows will succeed, how many are flagged with an error (and exactly which field, on which row, and why), and — for rows that would succeed — a summary of what will be created (e.g., "42 new Students, 42 new Enrollments into Class 3-A through Class 5-B").
- The Admin then makes an **explicit, informed choice**: fix the source file and re-upload, or proceed with only the clean rows (flagged rows are skipped, not silently dropped — they remain visible in the batch's own record for a later corrected re-import). Never a silent partial commit the Admin didn't ask for.

### 2.5 Commit — Chunked, Not One Giant Transaction

- Committing 500+ rows in a single `db.$transaction()` would hold row locks across a large fraction of a fresh client's data for the entire commit duration — the same real contention risk [TRANSACTION_BOUNDARIES.md § 4](../database/TRANSACTION_BOUNDARIES.md#4-the-one-exception-academic-year-rollover-should-not-be-one-transaction) already identified for Academic Year Rollover, a structurally identical problem (a large batch operation, not a 40-row attendance submission [TRANSACTION_BOUNDARIES.md § 3](../database/TRANSACTION_BOUNDARIES.md#3-batch-size--why-a-40-row-transaction-is-fine-and-when-that-stops-being-true) already established is fine at small scale).
- **Recommendation: process in chunks (e.g., 50–100 rows per transaction), sequentially, each chunk fully atomic on its own** — mirroring `TRANSACTION_BOUNDARIES.md § 4`'s own recommended pattern for rollover ("one transaction per student or small batch... its own progress-tracking record").
- Each committed row calls the **existing** lifecycle service (`registerStudent()`, `enrollStudent()`, `registerTeacher()`, `assignTeacher()`, `createSchoolClassWithSections()`, `createAcademicSubject()`) — never a bulk-insert bypass. This is deliberate, not just convenient: every imported row gets the exact same business-rule enforcement, transaction-boundary correctness, and `AuditLog` coverage a manually-entered row gets, for free, because it's the same code path.
- A resumable **`ImportBatch`** record (new entity, § 2.6) tracks progress chunk by chunk, so an interruption partway through (a deploy, a connection blip) doesn't require restarting from zero — the same resumability principle `TRANSACTION_BOUNDARIES.md § 4` names for rollover, applied here first since an import is far more likely to actually happen at this product's current stage than a full-year rollover is.

### 2.6 Audit — Two Layers, Not One

- **`AuditLog`** — already automatic. Every row committed through an existing service writes its own `AuditLog` entry exactly as it would for manual entry. Nothing new needed here.
- **`ImportBatch`** — genuinely new, and the most reusable capability this epic produces (see [EPIC_ROADMAP.md § Self Review](./EPIC_ROADMAP.md) framing). Tracks the batch itself, not each row: `id`, `schoolId`, `entityType` (`Student`/`Teacher`/`AcademicStructure`/...), `sourceFileName`, `columnMapping` (JSON, saved for reuse), `status` (`Uploaded → Mapped → Validated → Previewed → Committing → Completed | Failed | PartiallyCompleted`), `totalRows`, `successCount`, `errorCount`, `createdByUserId`, `createdAt`, `completedAt`. This is the record that answers "show me everything that came from the March 2027 migration" — a question `AuditLog` alone can't answer efficiently, since it isn't grouped by import run.

## 3. Failure Handling and Rollback — An Honest Boundary, Not a Universal Promise

A clean, automated "undo the whole import" button is **not honestly buildable for every entity type**, and this document says so directly rather than promising a feature that can't be delivered correctly:

| When                                                                                                                  | What's actually possible                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Before commit** (during Preview)                                                                                    | Fully clean — nothing has been written yet. Abort, discard, re-upload. No rollback machinery needed at all.                                                                                                                                                                                                                                                                                               |
| **After commit, entity supports soft-delete** (`Student`, `Teacher`, `Guardian`, `SchoolClass`, `Section`, `Subject`) | A supported corrective action — deactivate the batch's rows via their existing `status`/`deletedAt` mechanism. Not automatic; an Admin-reviewed, explicit action, same as any other deactivation (§ [ADMINISTRATION_STRATEGY.md § 2.5](./ADMINISTRATION_STRATEGY.md#25-account-deactivation)'s "never automatic" principle, applied here too).                                                            |
| **After commit, entity has no delete mechanism at all** (`Enrollment`)                                                | **No automated rollback.** Per [DATABASE_REVIEW.md § 14](../database/DATABASE_REVIEW.md#14-the-four-questions-answered-directly), `Enrollment` is deliberately never deleted, soft or hard — a bad import that created 40 wrong `Enrollment` rows needs a **manual correction procedure** (documented, not automated), the same way a manual data-entry mistake in this exact table would need one today. |

This asymmetry is not a gap to close later — it is the same "never soft-deleted, never hard-deleted" design already established for historical-fact tables ([SOFT_DELETE_STRATEGY.md § 1](../database/SOFT_DELETE_STRATEGY.md#1-three-categories-not-two)), correctly inherited by the Import Engine rather than worked around.

## 4. Error Reporting

- Row-level, not batch-level: every flagged row names its source row number, the specific field, and a plain-language reason ("Column 'Class' value 'Class 9' does not match any existing SchoolClass — this school's academic structure only goes up to Class 8"), not a stack trace or a generic "validation failed."
- Errors are groupable by type (e.g., "12 rows have a duplicate admission number," "3 rows reference a section that doesn't exist") so an Admin fixing a spreadsheet can fix a whole column-level mistake once, not row by row.

## 5. Rajasthan RTE Integration Research

**Task:** Evaluate whether Rajasthan RTE (Right to Education Act, Section 12(1)(c)) student information is realistically integrable with the Import Engine — official sources only, no speculation, and an explicit recommendation against unsupported scraping if no supported integration exists.

### 5.1 What Exists

- **`rajpsp.nic.in`** (Rajasthan Private School Portal / RTE Portal) is the official government portal private schools use for RTE Section 12(1)(c) 25%-quota admissions — school profile, student data entry, and the RTE lottery/allotment process all happen here. [Right To Education Rajasthan](https://rajpsp.nic.in/)
- Schools access it via a **School Login** (government-issued PSP unique code + password, delivered by SMS to a registered mobile) — this is a government-authenticated, credentialed portal, not a public data source. [School Login | RTE](https://rajpsp.nic.in/PSP2/Home/schoollogin.aspx)
- Rajasthan separately runs **Integrated Shala Darpan** (`rajshaladarpan.rajasthan.gov.in`), the broader state school-MIS covering government schools' infrastructure, enrollment, staff, and academic performance, developed by NIC Rajasthan. An API subdomain (`sdapi.rajasthan.gov.in`) exists for this system. [Integrated Shala Darpan | NIC](https://www.nic.gov.in/project/integrated-shala-darpan/)

### 5.2 What Does Not Exist

- **No official public API for `rajpsp.nic.in`** was found in any official government source, developer portal, or NIC documentation. Search specifically for API/web-service/bulk-export documentation for this portal returned no results from the Rajasthan government, NIC, or the Department of School Education — only third-party informational sites.
- **No official bulk-export feature** for private-school RTE student data was found on `rajpsp.nic.in` itself.
- **`sdapi.rajasthan.gov.in`'s** existence confirms Shala Darpan (the government-schools MIS) has _some_ API surface, but nothing found indicates it is (a) publicly documented, (b) open for third-party vendor registration, or (c) applicable to a **private, unaided** school's RTE data at all — Shala Darpan's primary scope is government-run schools, not private schools' RTE quota seats specifically. This is a real, named unknown, not assumed either way — see § 5.4.

### 5.3 What the Market Actually Does Today

The clearest evidence of the real, practical answer: a competing school-ERP vendor (Vedmarg) publishes its own instructions for "importing" RTE student data from `rajpsp.nic.in`. [Import Student's Data From RAJPSP.NIC.IN To Vedmarg School ERP](https://vedmarg.com/import-students-data-from-rajpsp-nic-to-vedmarg-school-erp/) The documented process, verbatim in substance:

1. A school staff member logs into `rajpsp.nic.in` with their own government-issued credentials.
2. Navigates to the on-screen student list.
3. **Manually selects and copies the HTML table** (drag-select, `Ctrl+C`).
4. Pastes it into a blank Excel file, adds the vendor's required column headers.
5. Uploads that Excel file through the vendor's own ordinary CSV/Excel import feature.

This is **not** an API integration. It is **not** automated scraping either — it's a manual, human-driven copy-paste-into-Excel workflow performed by someone with their own legitimate portal login, using nothing but a browser's native copy/paste. No vendor found (including this one) claims or documents anything beyond this.

### 5.4 Recommendation

**Do not build an automated integration (API client or scraper) against `rajpsp.nic.in`.** Three concrete reasons:

1. **No supported integration exists.** Nothing found — across the official portal, NIC's own project pages, or third-party vendor documentation — describes a sanctioned API or bulk-export path. Building against an undocumented, unauthenticated-for-third-parties government system would be exactly the "unsupported scraping" this research was explicitly asked to evaluate and, if unsupported, recommend against.
2. **The portal requires government-issued, school-specific credentials.** Any automation would need to operate under a real school employee's personal government login — a materially different (and higher) risk than scraping a public page, since it implicates the school's own compliance standing with the state, not just a vendor's terms-of-service exposure.
3. **The market's own answer is already "manual export," and that's a legitimate, buildable target.** The Import Engine's ordinary CSV/XLSX upload path (§ 2.1–2.2) **already covers this exact workflow** — a school office staffer copies their RTE roster into a spreadsheet (using the school's own legitimate portal access, the same way every competing vendor's customers already do it today) and uploads it. No special RTE-specific integration code is needed; `RteDetails`'s own fields (income/category certificate references, lottery reference number, reimbursement status — per [DOMAIN_MODEL.md § 5.3](../domain/DOMAIN_MODEL.md#53-rtedetails)) are simply additional mapped columns in the same Student/Admission import profile.

**What this means for Epic F (Admission Management):** `RteDetails` remains Admin-entered (typed in, or imported via spreadsheet like everything else) — never government-integrated — for the foreseeable future. If Rajasthan (or NIC) ever publishes a genuine, documented, vendor-accessible API, that would be a new, separately-scoped decision at that time, not something to build speculatively against today's undocumented system.

**Sources:**

- [RTE Portal | Right To Education Rajasthan](https://rajpsp.nic.in/)
- [School Login | RTE](https://rajpsp.nic.in/PSP2/Home/schoollogin.aspx)
- [StudentEntry | RTE](https://rajpsp.nic.in/PSP3/StudentEntry/Home.aspx)
- [Import Student's Data From RAJPSP.NIC.IN To Vedmarg School ERP](https://vedmarg.com/import-students-data-from-rajpsp-nic-to-vedmarg-school-erp/)
- [Integrated Shala Darpan | National Informatics Centre](https://www.nic.gov.in/project/integrated-shala-darpan/)
- [Shaladarpan APIs](https://sdapi.rajasthan.gov.in/rksmbk/)

## 6. What This Epic Does Not Cover

Continuous synchronization (keeping a client's data in sync with a legacy system on an ongoing basis) is explicitly out of scope — per this task's own framing, every client performs one **initial** migration, not continuous sync. If a future client genuinely needs ongoing sync with an existing system, that is a materially different, separately-scoped integration project, not an extension of this engine.
