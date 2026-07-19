# Go-Live Checklist — Client Deployment

**Purpose:** The hard gate before a client (Pant Public School or any future school) switches to live production traffic — [Epic H](./EPIC_ROADMAP.md#epic-h--deployment--go-live)'s concrete deliverable. **This checklist does not duplicate [docs/onboarding/GO_LIVE_CHECKLIST.md](../onboarding/GO_LIVE_CHECKLIST.md)** — that document is the narrower, already-established gate for the **public website's content readiness** specifically (every P0 content item published, placeholders removed). This document is the **broader** product gate: infrastructure, data, administration, and training readiness, of which public-site content is one section, not the whole. **As of this planning sprint, none of the epics this checklist gates are built yet** — it exists so "ready to go live" has a precise, checkable definition the moment they are, not so it looks done today.

---

## 1. Infrastructure Readiness

- [ ] Client repository cloned from the Master Repository, with `upstream` remote configured (per [FRAMEWORK_STRATEGY.md § 1](./FRAMEWORK_STRATEGY.md#1-the-model-upstream-not-control-plane))
- [ ] Hosting provisioned (Vercel), database instance provisioned (Neon), DNS configured for the client's real domain
- [ ] Every required environment variable set in the hosting platform's own secret store — `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `BOOTSTRAP_ADMIN_*`, Cloudinary keys once wired — **none committed to the repository**
- [ ] `pnpm run format:check && pnpm run lint && pnpm run typecheck && pnpm run build` all pass clean against the client repo's own state (not just the Master Repository's)

## 2. Database Readiness

- [ ] `prisma migrate deploy` run against the client's own database instance; `prisma migrate status` confirms every migration applied
- [ ] Reference data seeded (`Role` rows, the client's own `School`/`AcademicYear` row) — **not** the Sprint 0–5 generic sample data (`prisma/seed.ts`'s current classes/subjects/teachers/attendance fixtures), per [CLIENT_CUSTOMIZATION_GUIDE.md § 2](./CLIENT_CUSTOMIZATION_GUIDE.md#2-the-checklist--what-a-new-client-repository-must-change) item 11
- [ ] A direct query against the live database confirms zero rows reference `"seed-school"` or any other Pant-Public-School-specific literal `schoolId`

## 3. Data Integrity (Import Engine)

- [ ] Academic Structure imported/configured and manually spot-checked against the client's own source records
- [ ] Students and Teachers imported; [Manual Verification](./CLIENT_IMPLEMENTATION_PLAYBOOK.md#21-stage-by-stage) (step 9) completed and signed off by the client's own Admin, not just TechPulse
- [ ] Import error/skip counts reviewed — zero unexplained skipped rows; every flagged row from Preview either corrected-and-recommitted or explicitly accepted as out of scope
- [ ] `ImportBatch` records reviewed as the audit trail for what came from the migration, per [IMPORT_ENGINE_STRATEGY.md § 2.6](./IMPORT_ENGINE_STRATEGY.md#26-audit--two-layers-not-one)

## 4. Administration Readiness

- [ ] Bootstrap Admin created, logged in once, and **its own password changed** from the deployment-time temp value (per [ADMINISTRATION_STRATEGY.md § 2.2](./ADMINISTRATION_STRATEGY.md#22-password-lifecycle))
- [ ] The school's real named Administrator/Principal accounts provisioned (not everyone sharing the bootstrap login)
- [ ] Every imported Teacher has a corresponding `User` account they can actually log into — verified by at least one real Teacher successfully logging in with their own credentials
- [ ] Role assignments spot-checked against the school's actual staff roster (the right people have Admin-tier access, not more, not fewer)

## 5. Functional Readiness

- [ ] Public website: every check in [docs/onboarding/GO_LIVE_CHECKLIST.md](../onboarding/GO_LIVE_CHECKLIST.md) passed — this remains the authoritative content gate, referenced here, not repeated
- [ ] Attendance marking exercised end-to-end by a real Teacher account, for a real section, with real enrolled students (not a demo) — per [Epic E](./EPIC_ROADMAP.md#epic-e--academic-operations)'s Manual Verification Strategy
- [ ] Admin's cross-section attendance oversight view confirmed to show the same data the Teacher just entered
- [ ] Every epic marked **Required** in [EPIC_ROADMAP.md § 4](./EPIC_ROADMAP.md#4-epic-breakdown)'s Go-Live Readiness column is functional; every epic marked **Recommended/Not Required** has an explicit, named decision (not a silent gap) about whether it ships at this go-live or trails it

## 6. Training

- [ ] Admin/Principal trained on the account they'll actually use day to day (not the bootstrap account)
- [ ] At least one Teacher training session conducted on real, already-imported data (per [CLIENT_IMPLEMENTATION_PLAYBOOK.md § 2.1](./CLIENT_IMPLEMENTATION_PLAYBOOK.md#21-stage-by-stage) step 11's reasoning for why this must follow import, not precede it)
- [ ] A named point of contact at the school confirmed for post-go-live questions during the stabilization window

## 7. Sign-Off

- [ ] The school's own Admin/Principal has explicitly confirmed readiness — this checklist is TechPulse's own gate, but go-live is a joint decision, not something TechPulse declares unilaterally
- [ ] Post-Go-Live Stabilization window (§ [CLIENT_IMPLEMENTATION_PLAYBOOK.md § 2.1](./CLIENT_IMPLEMENTATION_PLAYBOOK.md#21-stage-by-stage) step 13) scheduled and staffed

---

## What This Checklist Deliberately Does Not Cover

Ongoing steady-state support terms, pricing, and contractual matters — business concerns outside a technical go-live gate's scope, per the same boundary [TRANSACTION_BOUNDARIES.md § 6](../database/TRANSACTION_BOUNDARIES.md#6-what-this-document-does-not-cover) already draws elsewhere in this project between technical and business/process concerns.
