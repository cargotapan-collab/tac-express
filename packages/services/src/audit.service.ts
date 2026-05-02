import type { SupabaseClient } from "@workspace/database/supabase.types"
import type {
  AuditLog,
  AuditLogFilters,
  PaginatedResult,
} from "@workspace/types"
import { clampPagination } from "@workspace/types"

function mapAuditLog(row: Record<string, unknown>): AuditLog {
  return {
    id: row.id as AuditLog["id"],
    userId: (row.user_id as AuditLog["userId"]) ?? null,
    action: row.action as AuditLog["action"],
    entityType: row.entity_type as string,
    entityId: (row.entity_id as AuditLog["entityId"]) ?? null,
    description: (row.description as string) ?? "",
    oldValues: (row.old_values as AuditLog["oldValues"]) ?? null,
    newValues: (row.new_values as AuditLog["newValues"]) ?? null,
    ipAddress: (row.ip_address as string | null) ?? null,
    userAgent: (row.user_agent as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  }
}

export function createAuditService(db: SupabaseClient) {
  return {
    async listAuditLogs(filters: AuditLogFilters = {}): Promise<PaginatedResult<AuditLog>> {
      const { page, pageSize } = clampPagination({
        page: filters.offset !== undefined ? Math.floor(filters.offset / (filters.limit ?? 25)) + 1 : 1,
        pageSize: filters.limit,
      })
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = db
        .from("audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to)

      if (filters.userId) query = query.eq("user_id", filters.userId)
      if (filters.entityType) query = query.eq("entity_type", filters.entityType)
      if (filters.entityId) query = query.eq("entity_id", filters.entityId)
      if (filters.action) query = query.eq("action", filters.action)
      if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom)
      if (filters.dateTo) query = query.lte("created_at", filters.dateTo)

      const { data, error, count } = await query
      if (error) throw error

      const total = count ?? 0
      return {
        data: (data ?? []).map(mapAuditLog),
        total,
        page,
        pageSize,
        hasMore: from + (data?.length ?? 0) < total,
      }
    },

    async logEvent(params: {
      action: AuditLog["action"]
      entityType: string
      entityId?: string
      description?: string
      oldValues?: Record<string, unknown> | null
      newValues?: Record<string, unknown> | null
      metadata?: Record<string, unknown>
    }): Promise<void> {
      const { error } = await db.from("audit_logs").insert({
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId ?? null,
        description: params.description ?? "",
        old_values: params.oldValues ?? null,
        new_values: params.newValues ?? null,
        metadata: params.metadata ?? {},
      })
      if (error) throw error
    },
  }
}

export type AuditService = ReturnType<typeof createAuditService>
