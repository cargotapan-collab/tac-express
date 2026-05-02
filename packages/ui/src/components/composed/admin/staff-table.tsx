"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { UserRole } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"

export interface StaffProfile {
  id: string
  email: string
  name: string
  role: UserRole
  hubCode?: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "text-destructive border-destructive/40 bg-destructive/5",
  ADMIN: "text-primary border-primary/40 bg-primary/5",
  MANAGER: "text-accent-warning border-accent-warning/40 bg-accent-warning/5",
  OPS: "text-foreground border-border",
  INVOICE: "text-foreground border-border",
  SUPPORT: "text-muted-foreground border-border",
  WAREHOUSE_IMPHAL: "text-muted-foreground border-border",
  WAREHOUSE_DELHI: "text-muted-foreground border-border",
  WAREHOUSE_STAFF: "text-muted-foreground border-border",
  OPS_STAFF: "text-muted-foreground border-border",
  FINANCE_STAFF: "text-foreground border-border",
}

interface StaffTableProps {
  staff: StaffProfile[]
  onRoleChange?: (userId: string, role: UserRole) => void
  onToggleActive?: (userId: string, isActive: boolean) => void
  isLoading?: boolean
}

export function StaffTable({ staff, onRoleChange, onToggleActive, isLoading }: StaffTableProps) {
  if (isLoading) {
    return (
      <div className="bg-card p-5 space-y-2 tac-fui-panel">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="tac-fui-border overflow-hidden">
      <div className="bg-muted/50 grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 px-3 py-2">
        {["Name", "Email", "Role", "Hub", "Status"].map((h) => (
          <span key={h} className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">{h}</span>
        ))}
      </div>
      <div className="divide-y divide-border">
        {staff.map((s) => (
          <div key={s.id} className={cn("grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 px-3 py-2.5 items-center hover:bg-muted/30 transition-colors", !s.isActive && "opacity-50")}>
            <span className="font-mono text-sm uppercase tracking-wider text-foreground">{s.name || "—"}</span>
            <span className="font-mono text-xs text-muted-foreground px-3">{s.email}</span>
            <div className="px-3">
              {onRoleChange ? (
                <select
                  value={s.role}
                  onChange={(e) => onRoleChange(s.id, e.target.value as UserRole)}
                  className="h-7 border border-border bg-background font-mono text-2xs uppercase tracking-wider text-foreground px-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {Object.values(UserRole).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              ) : (
                <span className={cn("font-mono text-2xs uppercase tracking-wider border px-1.5 py-0.5", ROLE_COLORS[s.role] ?? "text-muted-foreground border-border")}>
                  {s.role}
                </span>
              )}
            </div>
            <span className="font-mono text-xs text-muted-foreground px-3">{s.hubCode ?? "—"}</span>
            <div className="flex items-center justify-end">
              {onToggleActive ? (
                <Button
                  variant={s.isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onToggleActive(s.id, !s.isActive)}
                  className={cn(
                    "font-mono text-2xs uppercase tracking-wider px-2 py-0.5 h-auto",
                    s.isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.isActive ? "Active" : "Inactive"}
                </Button>
              ) : (
                <span className={cn("font-mono text-2xs uppercase tracking-wider border px-1.5 py-0.5", s.isActive ? "text-primary border-primary/30" : "text-muted-foreground border-border")}>
                  {s.isActive ? "Active" : "Inactive"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
