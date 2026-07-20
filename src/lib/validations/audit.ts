import { z } from "zod";

const auditActionSchema = z.enum(["CREATE", "UPDATE", "SOFT_DELETE"]);

// Filters panel's exact field list — Date (start/end), Action, Entity
// Type, Actor, Search — plus pagination. `query` searches entityId/
// entityType (see auditLog.repository.ts's searchAuditLogs()); a free-text
// search across beforeValue/afterValue's JSON content is deliberately not
// offered — those columns hold arbitrary per-entity shapes with no common
// text representation to search meaningfully, and Postgres JSON containment
// search is a materially bigger feature than this sprint's own "not more
// features" mission calls for.
export const searchAuditEventsInputSchema = z.object({
  schoolId: z.string().min(1),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  action: auditActionSchema.optional(),
  entityType: z.string().min(1).optional(),
  actorUserId: z.string().min(1).optional(),
  query: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export type SearchAuditEventsInput = z.input<typeof searchAuditEventsInputSchema>;
