import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { AuditAction } from "@/generated/prisma/enums";

/**
 * Runs a trivial query to confirm the database is reachable. Not wired into
 * any route — callers (a future health-check endpoint, deploy script, etc.)
 * decide what to do with the result.
 */
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    await db.$queryRaw`SELECT 1`;
    return { healthy: true };
  } catch (error) {
    return { healthy: false, error: error instanceof Error ? error.message : String(error) };
  }
}

interface WriteAuditLogInput {
  schoolId: string;
  entityType: string;
  entityId: string;
  actorUserId: string;
  action: AuditAction;
  beforeValue?: Prisma.InputJsonValue;
  afterValue?: Prisma.InputJsonValue;
}

/**
 * Writes one AuditLog row. Per docs/database/TRANSACTION_BOUNDARIES.md § 1,
 * every mutation must write its own audit entry in the same transaction as
 * the mutation itself — pass the transaction client (`tx` from
 * `db.$transaction(async (tx) => ...)`), not the top-level `db` singleton,
 * once a real mutation exists to call this from.
 */
export async function writeAuditLog(tx: Prisma.TransactionClient, input: WriteAuditLogInput) {
  return tx.auditLog.create({ data: input });
}
