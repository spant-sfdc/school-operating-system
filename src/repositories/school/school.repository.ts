import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findSchoolById(schoolId: string) {
  return db.school.findUnique({ where: { schoolId } });
}

// This platform is one repository per school (no multi-tenant filtering,
// see docs/product/EPIC_ROADMAP.md § 2) — "the first row" is always "the
// school," used where a caller doesn't already have a schoolId in hand
// (e.g. a system-readiness check run before any session exists).
export async function findFirstSchool() {
  return db.school.findFirst();
}

export async function updateSchool(
  schoolId: string,
  input: Prisma.SchoolUpdateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.school.update({ where: { schoolId }, data: input });
}

export async function upsertSchool(
  schoolId: string,
  input: Prisma.SchoolCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.school.upsert({
    where: { schoolId },
    update: {},
    create: input,
  });
}
