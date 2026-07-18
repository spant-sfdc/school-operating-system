import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findGuardianById(id: string) {
  return db.guardian.findUnique({ where: { id } });
}

// No uniqueness on phone (docs/database/DATABASE_REVIEW.md § 3 — two
// guardians can legitimately share a number), so this returns every match,
// not a single record.
export async function findGuardiansByPhone(schoolId: string, phone: string) {
  return db.guardian.findMany({ where: { schoolId, phone, deletedAt: null } });
}

export async function createGuardian(
  input: Prisma.GuardianCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.guardian.create({ data: input });
}

// DATABASE_REVIEW.md § 3 query pattern (c) — needed once a guardian has
// more than one child at the school.
export async function listStudentsForGuardian(guardianId: string) {
  return db.studentGuardian.findMany({
    where: { guardianId, deletedAt: null },
    include: { student: true },
  });
}
