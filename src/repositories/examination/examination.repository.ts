import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { ExaminationStatus } from "@/generated/prisma/enums";

// Included consistently across every read below — the service-layer DTO
// mapper needs the term/year/class an Examination composes, not just bare
// foreign keys. A same-query Prisma `include`, not a call into another
// repository's exported functions — repositories may join tables, they
// may not call each other.
const EXAMINATION_INCLUDE = {
  examTerm: true,
  academicYear: true,
  schoolClass: true,
} satisfies Prisma.ExaminationInclude;

// Optional `tx` — a plain findUnique()+include is a single, non-decomposed
// query, so it's safe to call from inside a still-open transaction that
// just created/updated the row, via that same `tx` — see
// createExamination()'s own comment for why the create itself can't carry
// the same include.
export async function findExaminationById(id: string, tx: Prisma.TransactionClient = db) {
  return tx.examination.findUnique({ where: { id }, include: EXAMINATION_INCLUDE });
}

// The "is there already an examination for this term+class" check —
// mirrors findClassTeacherForSection()'s own existence-check shape
// (teacherAssignment.repository.ts). Not a uniqueness constraint (see the
// schema's own migration-header comment) — a school may legitimately want
// more than one, this is a UX pre-check, not a database guard.
export async function findExaminationByTermAndClass(examTermId: string, schoolClassId: string) {
  return db.examination.findFirst({
    where: { examTermId, schoolClassId, deletedAt: null },
    include: EXAMINATION_INCLUDE,
  });
}

export interface ExaminationFilters {
  academicYearId?: string;
  schoolClassId?: string;
  status?: ExaminationStatus;
}

export async function listExaminationsBySchool(schoolId: string, filters: ExaminationFilters = {}) {
  return db.examination.findMany({
    where: { schoolId, deletedAt: null, ...filters },
    include: EXAMINATION_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

// The deactivateExamTerm() guard's own dependency — see
// examTerm.repository.ts's own comment for why this lives here rather than
// being imported there.
export async function countExaminationsByExamTerm(examTermId: string) {
  return db.examination.count({ where: { examTermId, deletedAt: null } });
}

// Deliberately no `include` here — Prisma's query engine decomposes a
// `create()+include` call into multiple physical queries even for a single
// client call, and issuing those from inside an open interactive
// transaction (`tx`) triggers the "client already executing a query"
// warning found and fixed for Teacher/Attendance in Sprint D4 (D-046).
// Callers needing the full relational shape should call
// findExaminationById(id, tx) — same tx, still inside the transaction —
// as a separate, single-query read.
export async function createExamination(
  input: Prisma.ExaminationCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.examination.create({ data: input });
}

export async function updateExaminationStatus(
  id: string,
  status: ExaminationStatus,
  tx: Prisma.TransactionClient = db,
) {
  return tx.examination.update({ where: { id }, data: { status } });
}

// Sprint E9 — the one, terminal COMPLETED -> PUBLISHED transition,
// distinct from updateExaminationStatus() above (which any status
// transition could use) because this one always sets three fields
// together (status + publishedByUserId + publishedAt) — the same
// "actor + time recorded once, on the row, at the terminal action"
// pattern TransferCertificate's own issuedByUserId/dateOfIssue already
// established, not a status flip alone.
export async function publishExaminationRecord(
  id: string,
  publishedByUserId: string,
  tx: Prisma.TransactionClient = db,
) {
  return tx.examination.update({
    where: { id },
    data: { status: "PUBLISHED", publishedByUserId, publishedAt: new Date() },
  });
}
