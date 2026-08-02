import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// The "has this already been generated" read — the idempotency check
// generateReportCard() uses (get-or-create semantics, not
// reject-on-duplicate; see the schema's own migration-header comment for
// why this differs from PromotionRecord's own idempotency shape).
export async function findReportCardByEnrollmentAndExamination(
  enrollmentId: string,
  examinationId: string,
) {
  return db.reportCard.findUnique({
    where: { enrollmentId_examinationId: { enrollmentId, examinationId } },
  });
}

export async function findReportCardById(id: string, tx: Prisma.TransactionClient = db) {
  return tx.reportCard.findUnique({ where: { id } });
}

// Deliberately no `include` here — matches every other create() in this
// codebase's own established avoidance of the create()+include
// decomposition warning inside an open transaction (D-046).
export async function createReportCard(
  input: Prisma.ReportCardCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.reportCard.create({ data: input });
}
