# Architecture

**Status:** Infrastructure scaffolding complete as of Phase 0B.1 (project skeleton, tooling, empty folder structure — no business functionality, pages, or database schema yet). This document is the canonical, detailed reference — [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) holds only a condensed summary and links here. For naming/formatting conventions that implement this architecture, see [DEVELOPMENT_CONVENTIONS.md](./DEVELOPMENT_CONVENTIONS.md).

---

## 1. High-Level Architecture

A single Next.js 15 application (App Router) serves three distinct experiences from one codebase:

```
┌─────────────────────────────────────────────────────┐
│                  Next.js 15 App                       │
│                                                        │
│  ┌───────────┐   ┌───────────┐   ┌─────────────────┐ │
│  │  Public    │   │   Admin    │   │    Teacher       │ │
│  │  Website   │   │  Console   │   │   Dashboard      │ │
│  │ (Guest)    │   │            │   │                  │ │
│  └───────────┘   └───────────┘   └─────────────────┘ │
│         │               │                  │           │
│         └───────────────┴──────────────────┘           │
│                          │                              │
│                 Route Handlers (API)                    │
│                          │                              │
│                    Prisma ORM                           │
└──────────────────────────┼──────────────────────────────┘
                           │
                  ┌────────┴─────────┐
                  │   PostgreSQL      │
                  └───────────────────┘

              External: Auth.js (sessions) · Cloudinary (media)
```

There is no separate backend service. Business logic lives in Route Handlers and Server Actions within the Next.js app. This keeps the system deployable as a single Vercel project with no infrastructure to manage.

---

## 2. Folder Structure

Application code is nested under `src/`; `prisma/`, `public/`, `docs/`, and root config files stay at the repository root — see [DECISIONS.md § D-007](./DECISIONS.md#d-007--src-directory-layout). The internal composition below (route groups, component categories, lib organization) is unchanged from the original design.

```
/
├── src/
│   ├── app/
│   │   ├── (public)/              # Guest-facing marketing site — no auth
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── admissions/
│   │   │   ├── notices/
│   │   │   ├── gallery/
│   │   │   ├── contact/
│   │   │   └── layout.tsx
│   │   ├── (auth)/                 # Sign-in flow — shared by Admin & Teacher
│   │   │   └── login/
│   │   ├── (admin)/                # Admin-only route group
│   │   │   ├── layout.tsx            # Auth guard + admin shell
│   │   │   ├── students/
│   │   │   ├── teachers/
│   │   │   ├── attendance/
│   │   │   ├── examinations/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── (teacher)/              # Teacher-only route group
│   │   │   ├── layout.tsx            # Auth guard + teacher shell
│   │   │   ├── dashboard/
│   │   │   ├── attendance/
│   │   │   ├── marks/
│   │   │   ├── students/
│   │   │   ├── profile/
│   │   │   └── leave/
│   │   └── api/                     # Route Handlers (REST-style endpoints)
│   │       ├── auth/
│   │       ├── students/
│   │       ├── teachers/
│   │       ├── attendance/
│   │       └── examinations/
│   ├── components/
│   │   ├── ui/                      # Shadcn primitives (button, input, dialog, table…) + typography
│   │   ├── shared/                  # Cross-role reusable composites (theme provider/toggle, empty state, page header)
│   │   ├── website/                 # Guest/public-site composites (header, footer, hero) — see DECISIONS.md § D-011
│   │   ├── admin/                   # Admin-specific composites
│   │   └── teacher/                 # Teacher-specific composites
│   ├── lib/
│   │   ├── auth.ts                  # Auth.js configuration (Phase 2)
│   │   ├── db.ts                    # Prisma client singleton (Phase 0B/2)
│   │   ├── motion.ts                # Shared Framer Motion durations/easing/variants
│   │   ├── validations/              # Zod schemas
│   │   └── utils.ts                 # cn() and other shared helpers
│   ├── hooks/                       # Shared custom hooks
│   └── types/                       # Shared TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/                            # This documentation set
└── public/                          # Static assets (favicon, static images)
```

**Principle:** Route groups `(public)`, `(admin)`, `(teacher)` create hard visual and logical boundaries. A file inside `(admin)` should never be reachable by a Teacher session, enforced at the layout level, not just by UI hiding.

---

## 3. Routing Strategy

- **App Router** exclusively — no Pages Router usage.
- Route groups segment by role: `(public)`, `(auth)`, `(admin)`, `(teacher)`.
- Each protected route group has a `layout.tsx` that verifies session + role server-side before rendering any child route. Unauthorized access redirects to `/login`, not a client-side error state.
- Dynamic segments (e.g., `students/[id]`) used for entity detail views.
- No route should perform role checks only on the client. Server-side enforcement is mandatory (see Security Principles).

---

## 4. Rendering Strategy — Server vs Client Components

**Default: Server Components.** A component is a Client Component only when it needs one of:

- Interactivity (`onClick`, `onChange`, form state)
- Browser-only APIs
- React hooks (`useState`, `useEffect`, etc.)
- Third-party libraries that require the client (e.g., some Framer Motion usage)

**Pattern:**

- Pages fetch data on the server (Server Components / Server Actions) and pass minimal, serializable props down.
- Interactive leaves (a form, a filter, a modal trigger) are isolated Client Components, kept as small as possible.
- Avoid marking entire pages `"use client"` — push the boundary down to the smallest necessary component.

**Data mutations** use Server Actions where practical (forms, simple mutations); Route Handlers are used for endpoints consumed by client-side fetch/polling or external integrations.

---

## 5. State Management Strategy

This product intentionally avoids heavyweight global state libraries.

| Type of state                                    | Approach                                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Server data (students, attendance, etc.)         | Fetched in Server Components; re-fetched via Server Actions/router refresh after mutation |
| Form state                                       | Local component state, or `react-hook-form` where forms are non-trivial                   |
| Auth/session state                               | Auth.js session, accessed server-side via `auth()` helper                                 |
| Transient UI state (modals, tabs, toasts)        | Local `useState`, lifted only as far as necessary                                         |
| Cross-cutting UI state (theme, sidebar collapse) | React Context, minimal and scoped                                                         |

No Redux, Zustand, Jotai, or similar libraries in Version 1 unless a specific, documented need arises (see [AI_RULES.md](./AI_RULES.md) on introducing dependencies).

---

## 6. Component Hierarchy

```
Layout (role shell: sidebar/topbar)
 └─ Page (Server Component — fetches data)
     └─ Section (Server Component — composes UI)
         └─ Feature Composite (e.g., AttendanceTable)
             └─ Shadcn Primitives (Table, Badge, Button)
             └─ Client Islands (e.g., AttendanceRowToggle — "use client")
```

- **Primitives** (`components/ui`): unmodified or lightly themed Shadcn components, plus cross-cutting presentational primitives like typography. Never role-specific.
- **Shared composites** (`components/shared`): reusable across roles — page headers, empty states, confirmation dialogs, theme provider/toggle.
- **Role composites** (`components/website`, `components/admin`, `components/teacher`): feature-specific, built from primitives + shared composites. `website/` serves the Guest role (see [DECISIONS.md § D-011](./DECISIONS.md#d-011--componentswebsite-folder)).

---

## 7. Security Principles

1. **Server-enforced authorization.** Every protected route and every Route Handler independently verifies the session and role — the UI never being the only gate.
2. **Least privilege by role.** Teachers can only query/mutate data scoped to their own assigned classes; this is enforced in the data layer (query filters), not just the UI.
3. **Input validation everywhere data enters the system.** All form and API inputs validated with Zod schemas before touching the database.
4. **No secrets in client code.** Environment variables containing secrets are server-only (no `NEXT_PUBLIC_` prefix unless genuinely public).
5. **Session security.** Auth.js sessions use secure, httpOnly cookies; no tokens stored in `localStorage`.
6. **Auditability.** Sensitive mutations (student records, marks, attendance) should be attributable to the acting user for future audit-log support.

---

## 8. Performance Principles

1. **Server Components first** — reduces client JS shipped for content-heavy pages (public site, tables).
2. **Streaming & Suspense** for slower data fetches (e.g., report generation) so the shell renders immediately.
3. **Image optimization** via `next/image` and Cloudinary transformations — never unoptimized `<img>` for content images.
4. **Minimal client bundle** — Framer Motion and other client-heavy libraries loaded only where used, not globally.
5. **Database access patterns** — Prisma queries scoped and indexed appropriately; avoid N+1 patterns in list views (attendance, student lists).
6. **Caching** — static/public content (marketing pages, notices) leverages Next.js caching/ISR where appropriate; authenticated dashboards remain dynamic.

---

## 9. Open Architectural Questions

- Exact Auth.js provider strategy (credentials-based vs. email magic link) for Admin/Teacher accounts
- Multi-tenancy: this is single-school in v1 — confirm no multi-school abstraction is needed prematurely
- File/document storage conventions in Cloudinary (folder/naming strategy)

Tracked alongside product-level open questions in [PROJECT_CONTEXT.md § Open Questions](./PROJECT_CONTEXT.md#12-open-questions) and [FEATURE_STATUS.md](./FEATURE_STATUS.md).
