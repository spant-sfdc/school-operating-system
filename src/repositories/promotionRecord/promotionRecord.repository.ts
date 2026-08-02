import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// Included consistently across every read below — the service-layer DTO
// mapper needs the source/resulting Enrollment's own section/class/year,
// not just bare foreign keys. Same-query Prisma `include`, not a call into
// another repository's exported functions.
const PROMOTION_RECORD_INCLUDE = {
  sourceEnrollment: {
    include: { section: { include: { schoolClass: true } }, academicYear: true },
  },
  resultingEnrollment: {
    include: { section: { include: { schoolClass: true } }, academicYear: true },
  },
} satisfies Prisma.PromotionRecordInclude;

// The idempotency guard (Sprint E11's own Q16/Q17) — one PromotionRecord
// per source Enrollment, enforced by the schema's own `@@unique` on
// sourceEnrollmentId, this is the pre-write existence check mirroring
// every other "does this already exist" read in this codebase
// (findMarksSubmissionByScheduleAndSection() etc.).
export async function findPromotionRecordBySourceEnrollment(
  sourceEnrollmentId: string,
  tx: Prisma.TransactionClient = db,
) {
  return tx.promotionRecord.findUnique({
    where: { sourceEnrollmentId },
    include: PROMOTION_RECORD_INCLUDE,
  });
}

export async function findPromotionRecordById(id: string, tx: Prisma.TransactionClient = db) {
  return tx.promotionRecord.findUnique({ where: { id }, include: PROMOTION_RECORD_INCLUDE });
}

// The Promotion Review Workspace's own bulk read — one query for an
// entire section's worth of students (a few dozen at most), never one
// query per student. Mirrors listMarksSubmissionsForExamination()'s own
// "bounded, not scanned" shape.
export async function listPromotionRecordsBySourceEnrollments(sourceEnrollmentIds: string[]) {
  if (sourceEnrollmentIds.length === 0) return [];
  return db.promotionRecord.findMany({
    where: { sourceEnrollmentId: { in: sourceEnrollmentIds } },
    include: PROMOTION_RECORD_INCLUDE,
  });
}

// Student 360 / Academic History's own read (Sprint E11's own Q22) — every
// promotion decision ever made for this student, across every year.
export async function listPromotionRecordsForStudent(studentId: string) {
  return db.promotionRecord.findMany({
    where: { studentId },
    include: PROMOTION_RECORD_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

// Deliberately no `include` here — matches every other create() in this
// codebase's own established avoidance of the create()+include
// decomposition warning inside an open transaction (D-046). Callers
// needing the full relational shape call findPromotionRecordById(id, tx)
// — same tx, still inside the transaction — as a separate, single-query
// read.
export async function createPromotionRecord(
  input: Prisma.PromotionRecordCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.promotionRecord.create({ data: input });
}
