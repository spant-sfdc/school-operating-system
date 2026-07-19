-- Migration 007: Administration Foundation (Sprint B2)
-- Adds User.must_change_password — a single additive column, backward
-- compatible with every existing row (defaults to false). No other schema
-- change this sprint; see docs/DECISIONS.md's Sprint B2 entry (D-036) for
-- why this was judged additive rather than a redesign of the frozen
-- Identity schema (Sprint 1).

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT false;
