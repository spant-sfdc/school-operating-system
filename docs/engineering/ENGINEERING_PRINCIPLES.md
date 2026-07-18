# Engineering Principles

**Purpose:** The permanent, project-wide rules governing how backend code is layered and organized — established incrementally across Sprints 1-4 ([D-028](../DECISIONS.md#d-028--sprint-1-identity-foundation-role-as-a-lookup-table-with-accesslevel-user-merges-authjss-adapter-shape-repositoryservice-layer-introduced), [D-030](../DECISIONS.md#d-030--sprint-2-academic-foundation-schoolclass-naming-classsubject-deferred-repository-retrofit-for-schoolacademicyear), [D-031](../DECISIONS.md#d-031--sprint-3-student-foundation-dto-layer-introduced-admissionnumber-scope-fix-two-lifecycle-operations-instead-of-one-transaction-contention-bug-found-and-fixed), [D-032](../DECISIONS.md#d-032--sprint-4-teacher-foundation-repository-dependency-rule-made-explicit-registerteacher-composes-createuser-updateteacherassignment-soft-deletes-rather-than-mutates)) but never previously collected in one place. This document doesn't introduce anything new — it names what every sprint since Sprint 1 has already been doing, so the rule is documented permanently rather than only discoverable by reading prior sprints' code and decision records.

---

## 1. The Layering Model

```
Repository → Service → DTO → API → UI
```

- **Repository** — the only code allowed to call Prisma directly for a given model. Pure data access: `find*`, `list*`, `create*`, `update*`. No validation, no business rules, no multi-step orchestration, no transaction boundaries of its own.
- **Service** — orchestrates one or more repositories into a real business/lifecycle operation. Owns validation (via `src/lib/validations/`), transaction boundaries (`db.$transaction`), audit logging, and DTO mapping.
- **DTO** — the service's output contract. Plain objects only; never a raw Prisma model.
- **API** (not yet built) — a future Route Handler. Must map a service's DTO to whatever the API's own response shape is — never return a DTO (let alone a raw Prisma model) directly without that explicit mapping step being a conscious decision, not an accident of convenience.
- **UI** (not yet built) — consumes the API.

## 2. Repositories Never Call Repositories

**A repository may only touch its own model's table(s) via Prisma — including joins expressed as Prisma `include`/`select` within its own queries — but it may never import and call another repository's exported function.**

This is deliberately narrower than "a repository may only touch one table." A repository _is_ allowed to `include` related tables in its own queries — e.g., `src/repositories/enrollment/enrollment.repository.ts` includes `student`, `academicYear`, and `section.schoolClass` when fetching an `Enrollment`, and `src/repositories/teacherAssignment/teacherAssignment.repository.ts` does the same for `teacher`/`academicYear`/`section.schoolClass`/`subject`. That's a single SQL-level join, not a dependency on another module. What's forbidden is a repository file importing from `@/repositories/<something-else>` and calling one of its functions — that kind of cross-repository composition is a service's job, not a repository's.

**Why this matters:** if repositories could call each other, the dependency graph between them would grow unpredictably as the schema grows — `teacherAssignment` calling into `section`, which might someday call into `schoolClass`, and so on — and it would become unclear which repository "owns" a given multi-table operation's correctness. Keeping repositories strictly single-model (with joins, not calls) means the _service_ layer is always the place that answers "what does this operation actually touch," which is exactly where `docs/database/TRANSACTION_BOUNDARIES.md`'s own reasoning already expects that answer to live.

**Services, by contrast, are expected to call multiple repositories — including repositories from a different conceptual "domain."** `src/services/teacher/teacher.service.ts`'s `registerTeacher()` calls `createUser` (`@/repositories/user`, the identity domain) _and_ `createTeacher`/`createTeacherQualification` (the teacher domain) inside one transaction — this is correct, not a violation, because the rule constrains repository-to-repository calls specifically, not service-to-repository calls across domains.

## 3. Every Repository Method Optionally Accepts a Transaction Client

Every repository function that **writes** (`create*`, `update*`, `deactivate*`) has the shape:

```ts
export async function createX(input: Prisma.XCreateInput, tx: Prisma.TransactionClient = db) {
  return tx.x.create({ data: input });
}
```

Defaulting to the shared `db` singleton (`src/lib/db.ts`) when no `tx` is supplied, so a caller outside a transaction doesn't have to pass one explicitly. Read methods (`find*`, `list*`) do **not** take a `tx` parameter — they always read via the shared singleton. This is a deliberate asymmetry, not an oversight: a read that needs to participate in a transaction's isolation should be resolved by the _service_, before the transaction opens, not by threading `tx` through every read too — see § 4.

## 4. Resolve Reads Before Opening a Transaction, Not Inside It

**A service should resolve every read it needs — existence checks, duplicate checks, referenced records it needs to reuse — before calling `db.$transaction()`, not from inside the transaction callback.**

This was learned the hard way in Sprint 3 ([D-031](../DECISIONS.md#d-031--sprint-3-student-foundation-dto-layer-introduced-admissionnumber-scope-fix-two-lifecycle-operations-instead-of-one-transaction-contention-bug-found-and-fixed)): `registerStudent()`'s first implementation looked up an existing `Guardian` via the shared `db` singleton from _inside_ an open `db.$transaction()` callback — a read competing with the transaction's own dedicated connection for the same Neon connection pool, which surfaced as a real driver deprecation warning the first time the code's create path actually ran (not caught by `typecheck`/`lint`/`prisma validate`). Sprint 4's `updateTeacherAssignment()` follows the corrected pattern from the start: every existence/duplicate check runs before `db.$transaction()` opens; only writes (and reads of already-fetched, in-memory objects) happen inside it.

## 5. Services Are Organized Around Lifecycle Operations, Not CRUD

A service's exported functions should name real business/domain events — `registerStudent()`, `enrollStudent()`, `registerTeacher()`, `assignTeacher()`, `updateTeacherAssignment()`, `deactivateTeacher()` — not a generic `create`/`read`/`update`/`delete` per entity. Two consequences follow from this, both already applied:

- **A single lifecycle event may span multiple tables in one transaction** (`registerTeacher()` creates `User` + `Teacher` + `TeacherQualification` × N, per `docs/database/TRANSACTION_BOUNDARIES.md`'s "Teacher onboarding" row), while **two operationally distinct events stay as separate functions even when they're related** (`registerStudent()`/`enrollStudent()`; `registerTeacher()`/`assignTeacher()` — matching `docs/domain/EVENT_MODEL.md`'s own event catalog treating them as distinct events with distinct payloads).
- **"Update" often means end-and-replace, not mutate-in-place**, when the row being changed is itself a historical record. `updateTeacherAssignment()` soft-deletes the existing `TeacherAssignment` and creates a new one, rather than changing `sectionId`/`subjectId` on the live row — per `docs/database/DATABASE_REVIEW.md` § 7's own reasoning: mutating a `TeacherAssignment` in place would corrupt the historical fact "who was actually assigned to teach this section/subject during the period the old row was active," which future `AttendanceRecord`/`MarksRecord` provenance depends on remaining answerable.

## 6. Services Return DTOs; Repositories Return Prisma Models

From Sprint 3 onward: every function a service exports must return a DTO (or a plain object composed of DTOs), never a raw Prisma model. Repositories are the only layer that returns Prisma models — and only to their own service, never further up the stack. This is verified mechanically, not just by convention: `grep` for `db\.<model>\.` outside `src/repositories/`, and a check that no exported service function's return type is a bare Prisma model.

**This requirement is not retroactive.** Sprint 1's `src/services/identity/` and Sprint 2's `src/services/academic/` predate it and still return raw Prisma models — a known, intentionally-not-silently-fixed inconsistency (see [D-031](../DECISIONS.md#d-031--sprint-3-student-foundation-dto-layer-introduced-admissionnumber-scope-fix-two-lifecycle-operations-instead-of-one-transaction-contention-bug-found-and-fixed)'s Future Review Required note). Reconciling them to the same standard is real, named future work, not something to do incidentally while touching an unrelated sprint.

## 7. DTOs Are Colocated With Their Producing Service Until a Second Consumer Justifies Promotion

DTOs live inside the service module that produces them (`src/services/student/*.dto.ts`; `src/services/teacher/dto/*.dto.ts`) — not a shared top-level `src/dtos/` folder — for the same reason this project promotes a UI component to a shared library only on its second real consumer ([D-020](../DECISIONS.md#d-020--prose-promoted-from-page-local-helper-to-shared-component), [D-023](../DECISIONS.md#d-023--datatable-promoted-from-page-local-helper-to-shared-component)): nothing yet needs a `StudentDTO` or `TeacherDTO` from outside the module that defines it, so a shared location would be speculative generalization ahead of a real need.

A DTO's field list is a deliberate choice, not a mechanical copy of the underlying model — `StudentDTO` excludes `udisePen` (a minor's government ID, DPDP Act 2023-relevant PII per `docs/domain/BUSINESS_RULES.md` § 8); a field this sensitive has no reason to appear in a general-purpose "list of students" shape by default.

## 8. `src/lib/validations/` Is the One Canonical Zod Location

Established in [D-029](../DECISIONS.md#d-029--final-identity-architecture-review-validators-consolidated-into-libvalidations-roleiduseraccesslevel-design-affirmed): every Zod schema, for every domain, lives under `src/lib/validations/` (`identity.ts`, `academic.ts`, `student.ts`, `teacher.ts`) — not a separate top-level `src/validators/` folder, which existed briefly in Sprint 1 and was consolidated away.

---

## How to Use This File

This document describes rules already in force across every sprint referenced above — it is not itself a place to introduce a new rule. If a future sprint's instructions establish a genuinely new, permanent cross-cutting rule (not specific to one entity or one sprint), add it here, in the same style: state the rule, then the reasoning, with links to the sprint/decision that established it. Entity-specific or sprint-specific reasoning belongs in `docs/DECISIONS.md` and `docs/IMPLEMENTATION_LOG.md`, not here.
