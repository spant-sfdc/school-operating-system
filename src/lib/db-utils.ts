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

/**
 * Confirms at least one migration has been applied, by reading Prisma's own
 * `_prisma_migrations` bookkeeping table — not a domain model, so this
 * lives alongside checkDatabaseHealth() here rather than in a repository
 * (same reasoning: a raw query against Prisma's own infrastructure table,
 * not application data). Returns the most recent migration's name too, so
 * callers (checkSystemReadiness(), the Setup Wizard) can display it without
 * a second query.
 */
export async function checkMigrationsApplied(): Promise<{
  applied: boolean;
  latestMigration?: string;
  error?: string;
}> {
  try {
    const rows = await db.$queryRaw<Array<{ migration_name: string }>>`
      SELECT migration_name FROM "_prisma_migrations"
      WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
      ORDER BY finished_at DESC
      LIMIT 1
    `;
    return { applied: rows.length > 0, latestMigration: rows[0]?.migration_name };
  } catch (error) {
    return { applied: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * The Postgres server's own reported version string — a one-time
 * informational snapshot for FrameworkConfig at setup-completion time, not
 * something any business logic branches on.
 */
export async function getDatabaseVersion(): Promise<string | undefined> {
  try {
    const rows = await db.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    return rows[0]?.version;
  } catch {
    return undefined;
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
