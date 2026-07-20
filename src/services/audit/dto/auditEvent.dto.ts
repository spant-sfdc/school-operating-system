import type { AuditLog } from "@/generated/prisma/client";
import type { AuditAction } from "@/generated/prisma/enums";

// Defense in depth, not the primary guarantee — every writeAuditLog() call
// site in this codebase was audited (Sprint B4) and confirmed to never
// store a password hash, secret, token, or session value in
// beforeValue/afterValue (only IDs, names, statuses, dates, and boolean
// flags such as `{ passwordReset: true }`). This redaction still runs on
// every read specifically so a future mutation that carelessly logs a
// sensitive field is caught at render time, not discovered later in a
// support ticket — matches docs/database/AUDIT_STRATEGY.md § 6's own
// "redact at the point sensitive data would otherwise surface" guidance.
//
// An exact-match denylist, not a substring pattern — a substring match
// (e.g. /password/i) would also catch `passwordReset`/`mustChangePassword`/
// `passwordChangedBySelf`, the safe boolean *event* flags this codebase
// deliberately logs instead of the secret itself (see D-036). Redacting
// those would defeat the audit log's own purpose (confirmed by a live
// regression during this sprint's own verification — fixed before ship).
const REDACTED_KEYS = new Set([
  "password",
  "passwordhash",
  "hash",
  "secret",
  "secretkey",
  "token",
  "accesstoken",
  "refreshtoken",
  "sessiontoken",
  "apikey",
  "apisecret",
  "privatekey",
]);

function redactSensitiveKeys(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redactSensitiveKeys);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, val]) => [
      key,
      REDACTED_KEYS.has(key.toLowerCase()) ? "[REDACTED]" : redactSensitiveKeys(val),
    ]),
  );
}

export interface AuditEventDTO {
  id: string;
  timestamp: string;
  actorUserId: string;
  actorLabel: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  schoolId: string;
  summary: string;
}

export interface AuditEventDetailDTO extends AuditEventDTO {
  beforeValue: unknown;
  afterValue: unknown;
}

export interface AuditEventListDTO {
  items: AuditEventDTO[];
  total: number;
  page: number;
  pageSize: number;
}

function buildSummary(action: AuditAction, entityType: string): string {
  const verb = { CREATE: "Created", UPDATE: "Updated", SOFT_DELETE: "Deactivated" }[action];
  return `${verb} ${entityType}`;
}

// actorLabels: a pre-resolved id -> display label map (built once per page
// via a batch findUsersByIds() lookup, not per-row) — falls back to the raw
// actorUserId for sentinels like "system-seed" or an actor row that no
// longer resolves (see findUsersByIds()'s own comment on why that's
// possible by design, not a bug).
export function toAuditEventDTO(row: AuditLog, actorLabels: Map<string, string>): AuditEventDTO {
  return {
    id: row.id,
    timestamp: row.timestamp.toISOString(),
    actorUserId: row.actorUserId,
    actorLabel: actorLabels.get(row.actorUserId) ?? row.actorUserId,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    schoolId: row.schoolId,
    summary: buildSummary(row.action, row.entityType),
  };
}

export function toAuditEventDetailDTO(
  row: AuditLog,
  actorLabels: Map<string, string>,
): AuditEventDetailDTO {
  return {
    ...toAuditEventDTO(row, actorLabels),
    beforeValue: redactSensitiveKeys(row.beforeValue),
    afterValue: redactSensitiveKeys(row.afterValue),
  };
}
