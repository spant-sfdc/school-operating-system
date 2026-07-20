-- Migration 009: Client Configuration Foundation (Sprint C1)
-- Purely additive: eleven nullable columns on the existing "schools" table,
-- no new tables, no FKs. See prisma/schema.prisma's own header comment on
-- School and docs/DECISIONS.md's Sprint C1 entry for the full reasoning.

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "favicon_url" TEXT,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "medium" TEXT,
ADD COLUMN     "office_timings" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "principal_name" TEXT,
ADD COLUMN     "principal_title" TEXT,
ADD COLUMN     "school_timings" TEXT,
ADD COLUMN     "tagline" TEXT;
