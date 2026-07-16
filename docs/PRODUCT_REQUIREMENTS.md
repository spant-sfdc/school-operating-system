# Product Requirements Document (PRD)

**Product:** Pant Public School Digital Platform
**Version:** 1.0
**Status:** Draft — Phase 0A
**Owner:** School Administration (Pant Public School, Vidyadhar Nagar, Jaipur)

---

## 1. Vision

Replace fragmented, manual school administration (paper registers, WhatsApp broadcasts, static informational websites) with one elegant, modern web platform that handles the school's public presence, student/teacher administration, attendance, and examinations — usable without training.

The product should feel closer to **Stripe Dashboard or Notion** than to a traditional school ERP.

---

## 2. Objectives

| Objective                                          | Success Looks Like                                                                  |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Give the school a credible public digital presence | Parents/guardians can learn about the school and submit an admission enquiry online |
| Digitize daily attendance                          | Teachers mark attendance in under 60 seconds per class                              |
| Digitize examination records                       | Admin can generate a class result report without spreadsheets                       |
| Reduce admin overhead                              | Admin manages student/teacher records in one place, not registers                   |
| Establish a foundation for future growth           | Architecture supports adding Parent/Student portals later without a rewrite         |

---

## 3. Scope (Version 1)

### 3.1 Guest (Public Website)

- Public marketing/informational website (About, Academics, Facilities, etc.)
- Admission enquiry form
- Notice board (public notices)
- Photo gallery
- Document downloads (circulars, forms, prospectus)
- Contact page / contact form

### 3.2 Admin

- Student management (create, edit, view, deactivate)
- Teacher management (create, edit, view, deactivate)
- Website content management (notices, gallery, documents)
- Attendance oversight (view/edit across classes)
- Examination management (create exams, enter/view results)
- Reports (attendance summaries, examination summaries)
- School settings (school profile, academic year, classes/sections)

### 3.3 Teacher

- Personal dashboard (today's classes, quick stats)
- Attendance marking for assigned classes
- Marks entry for assigned subjects/classes
- Student list (read-only, scoped to assigned classes)
- Profile management (own profile)
- Leave request submission

---

## 4. Out of Scope

The following are **explicitly excluded from Version 1**. They may be considered for future versions per [ROADMAP.md](./ROADMAP.md), but must not be built, scaffolded, or designed for in this phase.

| Excluded             | Reason                                                                             |
| -------------------- | ---------------------------------------------------------------------------------- |
| Parent login/portal  | Adds significant auth/permission complexity; not required for launch               |
| Student login/portal | Same as above                                                                      |
| Fee management       | Requires payment gateway integration and financial compliance; separate initiative |
| Library management   | Not a launch-critical workflow                                                     |
| Hostel management    | School does not currently require this                                             |
| Payroll              | Sensitive financial domain; requires dedicated design and compliance review        |
| Inventory management | Not a launch-critical workflow                                                     |
| Transport management | Not a launch-critical workflow                                                     |
| Homework module      | Deferred to keep v1 focused on core admin + attendance + exams                     |

Any request to build one of these must be flagged against this section before proceeding — see [AI_RULES.md](./AI_RULES.md).

---

## 5. Feature List (Version 1)

| #   | Feature                         | Role(s)        | Priority |
| --- | ------------------------------- | -------------- | -------- |
| 1   | Public marketing website        | Guest          | P0       |
| 2   | Admission enquiry form          | Guest          | P0       |
| 3   | Notice board                    | Guest, Admin   | P0       |
| 4   | Gallery                         | Guest, Admin   | P1       |
| 5   | Document downloads              | Guest, Admin   | P1       |
| 6   | Contact form                    | Guest          | P1       |
| 7   | Authentication (Admin, Teacher) | Admin, Teacher | P0       |
| 8   | Student management              | Admin          | P0       |
| 9   | Teacher management              | Admin          | P0       |
| 10  | Attendance marking              | Teacher        | P0       |
| 11  | Attendance oversight            | Admin          | P0       |
| 12  | Marks entry                     | Teacher        | P0       |
| 13  | Examination management          | Admin          | P0       |
| 14  | Reports                         | Admin          | P1       |
| 15  | School settings                 | Admin          | P1       |
| 16  | Teacher dashboard               | Teacher        | P0       |
| 17  | Teacher profile                 | Teacher        | P1       |
| 18  | Leave request                   | Teacher        | P2       |

Priority key: **P0** = required for launch · **P1** = required soon after launch · **P2** = nice to have for v1

---

## 6. User Journeys

### 6.1 Guest — Admission Enquiry

1. Guest lands on the homepage
2. Navigates to Admissions
3. Fills enquiry form (student name, class applying for, guardian contact)
4. Submits — receives on-screen confirmation
5. Admin sees the enquiry in the Admin panel

### 6.2 Teacher — Daily Attendance

1. Teacher logs in
2. Dashboard shows today's assigned classes
3. Teacher selects a class
4. Marks each student present/absent
5. Submits — attendance is saved and visible to Admin

### 6.3 Teacher — Marks Entry

1. Teacher logs in, navigates to Marks Entry
2. Selects exam + subject + class
3. Enters marks per student
4. Submits — marks are saved and visible to Admin in Reports

### 6.4 Admin — Managing a New Teacher

1. Admin logs in, navigates to Teacher Management
2. Adds new teacher (name, contact, subjects, assigned classes)
3. System creates teacher account credentials
4. Teacher receives access and can log in

---

## 7. Acceptance Criteria (Representative Examples)

**Admission Enquiry Form**

- Given a guest on the Admissions page, when they submit a valid form, then they see a success confirmation and the enquiry appears in Admin's enquiry list.
- Given required fields are empty, when the guest attempts submission, then inline validation errors are shown and the form is not submitted.

**Attendance Marking**

- Given a teacher assigned to Class 6-A, when they open Attendance for today, then only students of Class 6-A are listed.
- Given attendance has already been marked for a class today, when the teacher reopens it, then previously marked statuses are pre-filled and editable.

**Marks Entry**

- Given a teacher entering marks for an exam, when they enter a value exceeding the maximum marks for that subject, then the system rejects the entry with a clear error.

**Role Access**

- Given a Teacher account, when they attempt to access an Admin-only route, then they are redirected/denied access.

---

## 8. Functional Requirements

| ID   | Requirement                                                                                         |
| ---- | --------------------------------------------------------------------------------------------------- |
| FR-1 | System shall support three roles: Guest, Admin, Teacher                                             |
| FR-2 | Admin and Teacher accounts require authentication via Auth.js                                       |
| FR-3 | Teachers shall only access students/classes they are assigned to                                    |
| FR-4 | Admin shall have full CRUD on students, teachers, and content                                       |
| FR-5 | Attendance shall be recorded per student, per class, per day                                        |
| FR-6 | Marks shall be recorded per student, per subject, per exam                                          |
| FR-7 | Public site content (notices, gallery, documents) shall be manageable by Admin without code changes |
| FR-8 | Admission enquiries submitted by Guests shall be visible to Admin                                   |

## 9. Non-Functional Requirements

| ID    | Requirement                                                                                 |
| ----- | ------------------------------------------------------------------------------------------- |
| NFR-1 | Public pages must be responsive from 360px to desktop widths                                |
| NFR-2 | Core interactions (attendance, marks entry) must complete in under 3 taps/clicks per record |
| NFR-3 | Pages must meet WCAG 2.1 AA accessibility standards                                         |
| NFR-4 | System must be usable by non-technical staff without a training manual                      |
| NFR-5 | Application must be deployable on Vercel with zero manual server management                 |
| NFR-6 | Media assets (gallery, documents) must be served via Cloudinary, not stored in the app      |
| NFR-7 | All role-based data access must be enforced server-side, not only hidden in the UI          |

---

## 10. Future Roadmap (Beyond Version 1)

Indicative only — not committed scope. See [ROADMAP.md](./ROADMAP.md) for phased delivery plan.

- Parent portal (view-only attendance/marks/notices)
- Student portal
- Fee management with payment gateway
- Homework/assignment module
- SMS/email notification integrations
- Timetable management
- Library management

---

## 11. Open Product Questions

- Exact admission enquiry fields required by school office
- Whether examination grading uses marks-based or grade-based (A/B/C) reporting, or both
- Academic year start month and term structure (for School Settings)
- Volume of students/teachers expected (affects UI pagination/reporting defaults)
