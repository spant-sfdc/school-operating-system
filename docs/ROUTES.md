# Routes

**Purpose:** The complete routing map for the platform. Planned ahead of implementation so route naming, guards, and navigation relationships are decided once — not improvised page by page. Update this document in the same change that adds, removes, or moves a route.

**Status as of the Document Center Experience milestone:** `/` (Hero-only homepage), `/about`, `/admissions` (informational — see below), `/academics`, `/campus`, `/school-life`, `/contact` (informational — see below), and `/documents` (informational — see below) are implemented — see [FEATURE_STATUS.md](./FEATURE_STATUS.md). `/dev/playground` exists as a development-only utility route (§5) — not a product route. All other routes below remain the _planned_ route map derived from [PRODUCT_REQUIREMENTS.md § Feature List](./PRODUCT_REQUIREMENTS.md#5-feature-list-version-1) and [ARCHITECTURE.md § Folder Structure](./ARCHITECTURE.md#2-folder-structure). Treat unimplemented paths as provisional until their phase confirms them — nav links pointing to them will 404 until then, which is expected.

---

## 1. Public Routes — `(public)` route group

No authentication required.

| Path                  | Purpose                                                                                                                              | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                   | Homepage                                                                                                                             | **Built (Phase 1A):** Hero section only (headline, CTAs, stat strip) per the Phase 1A "no homepage sections" scope — About/Academics/Facilities-style content sections come in a later phase                                                                                                                                                                                                                                         |
| `/about`              | About the school                                                                                                                     | **Built (Phase 1C):** see [COMPONENT_INVENTORY.md § Website Pages](./COMPONENT_INVENTORY.md#website-pages) — several fields hold bracketed content placeholders pending School Admin input                                                                                                                                                                                                                                           |
| `/academics`          | Academics overview                                                                                                                   | **Built (Milestone 5):** see [COMPONENT_INVENTORY.md § Website Pages](./COMPONENT_INVENTORY.md#website-pages) — several fields hold bracketed content placeholders pending School Admin input                                                                                                                                                                                                                                        |
| `/campus`             | Campus Experience — safety, classrooms, library, computer learning, sports, wellbeing, gallery preview                               | **Built (Milestone 6B):** see [COMPONENT_INVENTORY.md § Website Pages](./COMPONENT_INVENTORY.md#website-pages) — several fields hold bracketed content placeholders pending School Admin input                                                                                                                                                                                                                                       |
| `/facilities`         | Facilities overview                                                                                                                  | Superseded in practice by `/campus` (Milestone 6B), which covers the same ground as a narrative page rather than a static list — revisit whether this route is still needed before building it                                                                                                                                                                                                                                       |
| `/school-life`        | School Life Experience — annual events, sports, cultural activities, celebrations, achievements, gallery preview, parent testimonial | **Built (School Life milestone):** see [COMPONENT_INVENTORY.md § Website Pages](./COMPONENT_INVENTORY.md#website-pages) — several fields hold bracketed content placeholders pending School Admin input; Gallery Preview cites [docs/onboarding/IMAGE_REGISTRY.md](./onboarding/IMAGE_REGISTRY.md) `IMG-009`–`IMG-012`                                                                                                               |
| `/admissions`         | Admissions Experience — informational page (overview, journey, eligibility, documents, fees, FAQ, timings)                           | **Built (Milestone 4):** see [COMPONENT_INVENTORY.md § Website Pages](./COMPONENT_INVENTORY.md#website-pages) — no form, several fields hold bracketed content placeholders                                                                                                                                                                                                                                                          |
| `/admissions/enquiry` | Admission enquiry form                                                                                                               | Planned — not yet built; `/admissions`'s CTAs already link here (expected 404 until this route exists, per the pattern above)                                                                                                                                                                                                                                                                                                        |
| `/notices`            | Public notice board                                                                                                                  | Admin-managed list                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `/notices/[id]`       | Single notice detail                                                                                                                 | Dynamic segment                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `/gallery`            | Photo gallery                                                                                                                        | Cloudinary-backed, Admin-managed                                                                                                                                                                                                                                                                                                                                                                                                     |
| `/documents`          | Document Center — admission/academic documents, mandatory public disclosures, school policies, FAQ, contact CTA                      | **Built (Document Center milestone):** see [COMPONENT_INVENTORY.md § Website Pages](./COMPONENT_INVENTORY.md#website-pages) — **no form**, informational only, every document is a bracketed placeholder citing [docs/onboarding/DOCUMENT_REGISTRY.md](./onboarding/DOCUMENT_REGISTRY.md) `DOC-001`–`DOC-013`; real files will eventually be Cloudinary-backed, per [NFR-6](./PRODUCT_REQUIREMENTS.md#9-non-functional-requirements) |
| `/contact`            | Contact & Visit Experience — office information, school timings, visit guidance, map placeholder, FAQ, admission enquiry CTA         | **Built (Contact & Visit milestone):** see [COMPONENT_INVENTORY.md § Website Pages](./COMPONENT_INVENTORY.md#website-pages) — **no form**, informational only, forwards admission-related contact to `/admissions/enquiry`; several fields hold bracketed content placeholders; Map Placeholder cites [docs/onboarding/IMAGE_REGISTRY.md](./onboarding/IMAGE_REGISTRY.md) `IMG-013`                                                  |

## 2. Auth Routes — `(auth)` route group

Shared sign-in flow for Admin and Teacher. Not reachable while already authenticated (redirects to the appropriate dashboard).

| Path     | Purpose                       | Notes                                                    |
| -------- | ----------------------------- | -------------------------------------------------------- |
| `/login` | Sign-in for Admin and Teacher | Auth.js credential flow; redirects by role after success |

## 3. Admin Routes — `(admin)` route group

Requires authenticated session with `role: admin`. See § Route Guards.

| Path                       | Purpose                               | Notes                                                 |
| -------------------------- | ------------------------------------- | ----------------------------------------------------- |
| `/admin`                   | Admin dashboard / landing             | Summary stats                                         |
| `/admin/students`          | Student list                          | Table, filters, pagination                            |
| `/admin/students/new`      | Create student                        |                                                       |
| `/admin/students/[id]`     | Student detail / edit                 | Dynamic segment                                       |
| `/admin/teachers`          | Teacher list                          | Table, filters, pagination                            |
| `/admin/teachers/new`      | Create teacher                        |                                                       |
| `/admin/teachers/[id]`     | Teacher detail / edit                 | Dynamic segment                                       |
| `/admin/attendance`        | Attendance oversight                  | Cross-class view/edit                                 |
| `/admin/examinations`      | Examination management                | Create exams, define subjects/max marks               |
| `/admin/examinations/[id]` | Exam detail / results entry oversight | Dynamic segment                                       |
| `/admin/reports`           | Reports                               | Attendance & examination summaries                    |
| `/admin/settings`          | School settings                       | Academic year, classes/sections, school profile       |
| `/admin/content`           | Website content management            | Notices, gallery, documents (feeds the public routes) |
| `/admin/enquiries`         | Admission enquiries inbox             | Fed by the future `/admissions/enquiry` public form   |

## 4. Teacher Routes — `(teacher)` route group

Requires authenticated session with `role: teacher`. All data scoped server-side to the teacher's assigned classes — see [ARCHITECTURE.md § Security Principles](./ARCHITECTURE.md#7-security-principles).

| Path                                | Purpose                               | Notes                         |
| ----------------------------------- | ------------------------------------- | ----------------------------- |
| `/teacher`                          | Teacher dashboard                     | Today's classes, quick stats  |
| `/teacher/attendance`               | Attendance marking                    | Scoped to assigned classes    |
| `/teacher/attendance/[classId]`     | Mark attendance for a specific class  | Dynamic segment               |
| `/teacher/marks`                    | Marks entry                           | Select exam + subject + class |
| `/teacher/marks/[examId]/[classId]` | Marks entry for a specific exam/class | Dynamic segment               |
| `/teacher/students`                 | Student list (read-only)              | Scoped to assigned classes    |
| `/teacher/profile`                  | Own profile management                |                               |
| `/teacher/leave`                    | Leave request submission              |                               |

## 5. Development-Only Routes

Not part of the product surface — exist purely to support implementation. Guarded to 404 in production builds (verified: `pnpm build && pnpm start` returns HTTP 404).

| Path              | Purpose                                                                              | Notes                                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dev/playground` | Renders every Marketing Section Library component with sample data for manual review | `if (process.env.NODE_ENV === "production") notFound();` at the top of the page — see [DECISIONS.md § D-015](./DECISIONS.md#d-015--permanent-devplayground-route-replaces-temporary-preview-and-delete-pattern) |

## 6. Future Routes (Not in Version 1)

Placeholder only — do not implement without a recorded decision per [PROJECT_GUARDRAILS.md § Module Approval Process](./PROJECT_GUARDRAILS.md#2-module-approval-process).

| Path (indicative) | Purpose            | Depends on                                        |
| ----------------- | ------------------ | ------------------------------------------------- |
| `/parent/*`       | Parent portal      | Parent role — not approved for v1                 |
| `/student/*`      | Student portal     | Student role — not approved for v1                |
| `/admin/fees`     | Fee management     | Payment gateway integration — not approved for v1 |
| `/admin/library`  | Library management | Not approved for v1                               |

---

## 6. Route Guards

| Guard                  | Applies to                                                               | Behavior                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin guard            | `(admin)/*`                                                              | `layout.tsx` verifies session + `role: admin` server-side; unauthenticated → redirect `/login`; authenticated non-admin → redirect to their own role's landing page |
| Teacher guard          | `(teacher)/*`                                                            | `layout.tsx` verifies session + `role: teacher` server-side; same redirect behavior                                                                                 |
| Authenticated redirect | `(auth)/login`                                                           | If a session already exists, redirect to `/admin` or `/teacher` per role instead of showing the login form                                                          |
| Class-scope guard      | `/teacher/attendance/[classId]`, `/teacher/marks/*`, `/teacher/students` | Route/action verifies the requested class is actually assigned to the session's teacher before returning data — not just hiding it in the UI                        |

Full rationale: [ARCHITECTURE.md § Routing Strategy](./ARCHITECTURE.md#3-routing-strategy) and [§ Security Principles](./ARCHITECTURE.md#7-security-principles).

---

## 7. Breadcrumbs

Breadcrumb pattern (once built) follows the route hierarchy directly — no custom breadcrumb labels that diverge from the page title:

- `Admin / Students / [Student Name]`
- `Admin / Examinations / [Exam Name] / Results`
- `Teacher / Marks Entry / [Exam Name] / [Class]`

Public routes do not use breadcrumbs (single-level marketing navigation).

---

## 8. Navigation Relationships

| Surface                 | Primary nav items                                                                          | Notes                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public site header      | Home, About, Academics, Campus, School Life, Admissions, Gallery, News, Downloads, Contact | **Built (Phase 1A; "Campus" added Milestone 6B; "School Life" added School Life milestone).** "News" labels the `/notices` route, "Downloads" labels `/documents` — see [CONTENT_GUIDELINES.md](./CONTENT_GUIDELINES.md) for label rationale. Utility items (Login, Language, Theme) live alongside, not in this list. Single source of truth: `src/config/navigation.ts` |
| Admin sidebar           | Dashboard, Students, Teachers, Attendance, Examinations, Reports, Content, Settings        | Enquiries surfaced as a badge/count on Dashboard, not a top-level nav item                                                                                                                                                                                                                                                                                                |
| Teacher sidebar/tab bar | Dashboard, Attendance, Marks, Students, Leave, Profile                                     | Tab bar on mobile/tablet per [UI_DESIGN_SYSTEM.md § Responsive Breakpoints](./UI_DESIGN_SYSTEM.md#13-responsive-breakpoints) — Teacher is the primary tablet-use role                                                                                                                                                                                                     |

---

## Relationship to Other Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — routing strategy and folder structure this map implements.
- [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md) — the feature list each route serves.
- [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md) — components each route composes.
