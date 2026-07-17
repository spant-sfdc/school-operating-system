-- Migration 000: Audit Foundation
-- See docs/database/MIGRATION_PLAN.md § 1-2 and docs/database/AUDIT_STRATEGY.md.
--
-- Deliberately deferred, not applied here:
--  - Append-only enforcement (REVOKE UPDATE, DELETE ON "audit_logs" FROM <app_role>;
--    GRANT INSERT, SELECT ON "audit_logs" TO <app_role>;) per AUDIT_STRATEGY.md § 2 —
--    requires knowing the real Postgres role the application's connection string
--    authenticates as, which isn't chosen yet (see PRISMA_IMPLEMENTATION_GUIDE.md § 9
--    checklist). Apply as a follow-up migration once that role exists.
--  - Partitioning per AUDIT_STRATEGY.md § 3 — deliberately not adopted yet. This table
--    has no composite primary key or unique constraint, so converting to a partitioned
--    table later remains possible without a breaking schema change.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('CREATE', 'UPDATE', 'SOFT_DELETE');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "action" "audit_action" NOT NULL,
    "before_value" JSONB,
    "after_value" JSONB,
    "timestamp" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_timestamp_idx" ON "audit_logs"("actor_user_id", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_school_id_timestamp_idx" ON "audit_logs"("school_id", "timestamp");
