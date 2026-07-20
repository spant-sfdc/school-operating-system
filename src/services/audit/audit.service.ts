import {
  searchAuditLogs,
  findAuditLogById,
  listDistinctEntityTypes,
} from "@/repositories/auditLog";
import { findUsersByIds } from "@/repositories/user";
import { searchAuditEventsInputSchema, type SearchAuditEventsInput } from "@/lib/validations/audit";
import {
  toAuditEventDTO,
  toAuditEventDetailDTO,
  type AuditEventListDTO,
  type AuditEventDetailDTO,
} from "@/services/audit/dto";

// One label per actor: "Name (email)" when resolvable, else the raw
// actorUserId (a deactivated-and-purged actor, or a sentinel like
// "system-seed" — see findUsersByIds()'s own comment).
async function resolveActorLabels(actorUserIds: string[]): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(actorUserIds)];
  const users = await findUsersByIds(uniqueIds);
  const labels = new Map<string, string>();
  for (const user of users) {
    labels.set(user.id, user.name ? `${user.name} (${user.email})` : user.email);
  }
  return labels;
}

/**
 * The Audit Log Viewer's one search/list function — covers both "browse
 * everything" (all filters omitted) and any filtered combination, so a
 * separate listAuditEvents() would just be searchAuditEvents({}) with
 * extra indirection. Not exported as two functions per this project's own
 * "no unnecessary abstraction" discipline (AI_RULES.md § 5).
 */
export async function searchAuditEvents(input: SearchAuditEventsInput): Promise<AuditEventListDTO> {
  const validated = searchAuditEventsInputSchema.parse(input);
  const result = await searchAuditLogs(validated);
  const actorLabels = await resolveActorLabels(result.items.map((item) => item.actorUserId));

  return {
    items: result.items.map((item) => toAuditEventDTO(item, actorLabels)),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

export async function getAuditEvent(id: string): Promise<AuditEventDetailDTO | null> {
  const row = await findAuditLogById(id);
  if (!row) return null;
  const actorLabels = await resolveActorLabels([row.actorUserId]);
  return toAuditEventDetailDTO(row, actorLabels);
}

export async function listEntityTypeOptions(schoolId: string): Promise<string[]> {
  return listDistinctEntityTypes(schoolId);
}
