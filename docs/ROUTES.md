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

Shared sign-in flow for Admin and Teacher.

| Path            | Purpose                           | Notes                                                                                                                                                                                                                            |
| --------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/login`        | Sign-in for Admin and Teacher     | **Built (Sprint B1):** Auth.js Credentials flow (Login ID = `User.email` + password); redirects to `callbackUrl` on success. Not yet wired to redirect an already-authenticated visitor away — see § Route Guards below for why. |
| `/unauthorized` | Interim "wrong role" landing page | **Built (Sprint B1):** the temporary target for an authenticated session whose role doesn't match the route it tried to reach — see § Route Guards, not the final design.                                                        |

### 2b. Shared Authenticated Route

Requires only a valid session (any `accessLevel`) — not scoped to `/admin` or `/teacher`.

| Path               | Purpose                      | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/change-password` | Self-service password change | **Built (Sprint B2):** requires current password as confirmation; the only path that clears `User.mustChangePassword`. `/admin/*` and `/teacher/*` layouts redirect here whenever `mustChangePassword` is `true`, before anything else in either surface is reachable — see [DECISIONS.md § D-036](./DECISIONS.md#d-036--sprint-b2-administration--user-management-foundation-usermustchangepassword-column-centralized-libauthorization-orchestrated-not-modified-registerteachercreateidentityuser-cookie-flashed-temporary-passwords). |

## 3. Admin Routes — `(admin)` route group

Requires authenticated session with `role: admin`. See § Route Guards.

| Path                               | Purpose                                | Notes                                                                                                                                                                                     |
| ---------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin`                           | Admin dashboard / landing              | Summary stats; links to `/admin/users`                                                                                                                                                    |
| `/admin/users`                     | User list — search, filter, pagination | **Built (Sprint B2):** Administrator/Principal/Teacher accounts (Student/Guardian management is explicitly out of this sprint's scope)                                                    |
| `/admin/users/new`                 | Create user (Administrator or Teacher) | **Built (Sprint B2):** one form, branches server-side on the selected Role's `accessLevel`; generated temporary password shown once via a flash cookie on redirect to `/admin/users/[id]` |
| `/admin/users/[id]`                | User details                           | **Built (Sprint B2):** shows the flashed temporary password immediately after creation/reset (`?created=1`); Edit/Reset Password/Activate/Deactivate actions                              |
| `/admin/users/[id]/edit`           | Edit user (name, role)                 | **Built (Sprint B2):** an Admin can never change their own role, enforced server-side                                                                                                     |
| `/admin/users/[id]/reset-password` | Admin-initiated password reset         | **Built (Sprint B2):** generates a new temporary password, sets `mustChangePassword: true`                                                                                                |
| `/admin/students`                  | Student list                           | Table, filters, pagination                                                                                                                                                                |
| `/admin/students/new`              | Create student                         |                                                                                                                                                                                           |
| `/admin/students/[id]`             | Student detail / edit                  | Dynamic segment                                                                                                                                                                           |
| `/admin/teachers`                  | Teacher list                           | Table, filters, pagination                                                                                                                                                                |
| `/admin/teachers/new`              | Create teacher                         |                                                                                                                                                                                           |
| `/admin/teachers/[id]`             | Teacher detail / edit                  | Dynamic segment                                                                                                                                                                           |
| `/admin/attendance`                | Attendance oversight                   | Cross-class view/edit                                                                                                                                                                     |
| `/admin/examinations`              | Examination management                 | Create exams, define subjects/max marks                                                                                                                                                   |
| `/admin/examinations/[id]`         | Exam detail / results entry oversight  | Dynamic segment                                                                                                                                                                           |
| `/admin/reports`                   | Reports                                | Attendance & examination summaries                                                                                                                                                        |
| `/admin/settings`                  | School settings                        | Academic year, classes/sections, school profile                                                                                                                                           |
| `/admin/content`                   | Website content management             | Notices, gallery, documents (feeds the public routes)                                                                                                                                     |
| `/admin/enquiries`                 | Admission enquiries inbox              | Fed by the future `/admissions/enquiry` public form                                                                                                                                       |

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

**Built (Sprint B1), as a two-tier split — see [DECISIONS.md § D-035](./DECISIONS.md#d-035--sprint-b1-authentication-foundation-jwt-session-strategy-corrects-d-030-empirically-confirmed-incompatible-with-credentials-only-argon2id-in-libsecurity-auth-as-its-own-service-adminteacher-route-groups-renamed-to-real-path-segments) for the full technical reasoning:**

1. **`src/middleware.ts`** (Edge runtime) — a fast, coarse pre-check: `getToken()` verifies the session JWT's signature (no database access) for every non-public path; no valid token → redirect to `/login?callbackUrl=<path>`. Does **not** check role or live deactivation status — that would require a database read, which the Edge runtime cannot perform with this app's Prisma driver adapter.
2. **`src/app/admin/layout.tsx` / `src/app/teacher/layout.tsx`** (Node.js runtime, Server Components) — the authoritative check: calls the real `auth()`, which re-resolves the user from the database on every request (`resolveActiveSessionUser()`) and attaches `accessLevel` only if the account is still active. Missing/mismatched `accessLevel` → redirect to `/unauthorized`. This is what actually enforces role scoping and instant-effect deactivation, not step 1.
3. **Force password change (Sprint B2):** immediately after the `accessLevel` check succeeds, both layouts also check `session.user.mustChangePassword` — `true` → redirect to `/change-password`, before anything else in either surface is reachable. Not checked in `src/middleware.ts` (only a JWT signature check runs there, per D-035's Edge/Node split) — this is a second, independent gate at the same Node-runtime layer as the `accessLevel` check.

`(admin)`/`(teacher)` were renamed from route groups to real path segments (`src/app/admin/`, `src/app/teacher/`) this sprint specifically so `/admin/*` and `/teacher/*` are genuinely distinct URLs, matching this table's own path column below (a route group adds no URL segment, and the two would otherwise have collided on every identically-named child path, e.g. `/attendance`).

| Guard                  | Applies to                                                               | Behavior                                                                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin guard            | `/admin/*`                                                               | `layout.tsx` verifies session + `accessLevel: ADMIN` server-side; unauthenticated → redirect `/login`; authenticated non-admin → redirect `/unauthorized` (interim — see § 2's note; not yet "their own role's landing page," since no dashboard exists to redirect to) |
| Teacher guard          | `/teacher/*`                                                             | `layout.tsx` verifies session + `accessLevel: TEACHER` server-side; same redirect behavior                                                                                                                                                                              |
| Authenticated redirect | `(auth)/login`                                                           | **Not yet built** — deferred until `/admin`/`/teacher` have real dashboards to redirect an already-authenticated visitor to; an authenticated user can still reach `/login` today, which is a UX gap, not a security one                                                |
| Class-scope guard      | `/teacher/attendance/[classId]`, `/teacher/marks/*`, `/teacher/students` | Not yet built — these routes don't exist yet (Epic B's Academic Operations epic); route/action must verify the requested class is actually assigned to the session's teacher before returning data, not just hide it in the UI                                          |

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
