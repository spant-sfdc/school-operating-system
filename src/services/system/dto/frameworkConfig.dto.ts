import type { FrameworkConfig } from "@/generated/prisma/client";

// A write-once bookkeeping snapshot — "what was true when setup was
// completed," never live-recomputed (see SystemReadinessDTO for the live
// counterpart). Matches docs/product/VERSIONING_STRATEGY.md § 2's own
// "record the framework version a deployment was synced to" recommendation.
export interface FrameworkConfigDTO {
  id: string;
  frameworkVersion: string;
  databaseVersion: string | null;
  migrationVersion: string | null;
  setupCompleted: boolean;
  setupCompletedAt: string | null;
  setupCompletedBy: string | null;
}

export function toFrameworkConfigDTO(row: FrameworkConfig): FrameworkConfigDTO {
  return {
    id: row.id,
    frameworkVersion: row.frameworkVersion,
    databaseVersion: row.databaseVersion,
    migrationVersion: row.migrationVersion,
    setupCompleted: row.setupCompleted,
    setupCompletedAt: row.setupCompletedAt?.toISOString() ?? null,
    setupCompletedBy: row.setupCompletedBy,
  };
}
