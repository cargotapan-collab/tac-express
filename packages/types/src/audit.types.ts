import type { UUID } from "./domain.types"

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "role_change"
  | "permission_change"
  | "impersonate"

export interface AuditLog {
  id: UUID
  userId: UUID | null
  action: AuditAction
  entityType: string
  entityId: UUID | null
  description: string
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface AuditLogFilters {
  userId?: UUID
  entityType?: string
  entityId?: UUID
  action?: AuditAction
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}
