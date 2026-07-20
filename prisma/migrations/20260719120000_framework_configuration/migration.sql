-- Migration 008: Framework Configuration (Sprint B3)
-- A new, standalone singleton table — one row per deployment, no FKs in or
-- out. Purely additive: no existing table is touched. See
-- prisma/schema.prisma's own header comment on FrameworkConfig and
-- docs/DECISIONS.md's Sprint B3 entry (D-039) for the full reasoning.

-- CreateTable
CREATE TABLE "framework_config" (
    "id" TEXT NOT NULL,
    "framework_version" TEXT NOT NULL,
    "database_version" TEXT,
    "migration_version" TEXT,
    "setup_completed" BOOLEAN NOT NULL DEFAULT false,
    "setup_completed_at" TIMESTAMPTZ(3),
    "setup_completed_by" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "framework_config_pkey" PRIMARY KEY ("id")
);
