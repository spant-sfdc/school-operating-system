import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// Singleton by convention, not by schema constraint — exactly one row is
// ever created (see the service layer's own get-or-create logic); reading
// "the first row" is therefore always correct, matching this platform's
// one-repository-per-school model (no multi-row case to disambiguate).
export async function findFrameworkConfig() {
  return db.frameworkConfig.findFirst();
}

export async function createFrameworkConfig(
  input: Prisma.FrameworkConfigCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.frameworkConfig.create({ data: input });
}

export async function updateFrameworkConfig(
  id: string,
  input: Prisma.FrameworkConfigUpdateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.frameworkConfig.update({ where: { id }, data: input });
}
