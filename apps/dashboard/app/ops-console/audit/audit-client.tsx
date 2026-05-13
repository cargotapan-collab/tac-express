"use client"

import * as React from "react"

import { useAuditLogs } from "@workspace/services/hooks/use-audit-logs"
import type { AuditLog } from "@workspace/types"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { Input } from "@workspace/ui/components/primitives/input"
import { SkeletonTable } from "@workspace/ui/components/primitives/skeleton"
import { EmptyState } from "@workspace/ui/components/primitives/empty-state"
import { Badge } from "@workspace/ui/components/primitives/badge"
import { AuditDiffViewer } from "@workspace/ui/components/composed/audit/audit-diff-viewer"
import {
  RiHistoryLine,
  RiSearchLine,
  RiFilterLine,
  RiArrowDownSLine,
} from "@workspace/ui/icons"

const ENTITIES = [
  "all",
  "shipments",
  "manifests",
  "invoices",
  "exceptions",
  "customers",
  "rate_cards",
  "webhooks",
  "api_keys",
  "hubs",
  "staff",
] as const

const ACTIONS = [
  "all",
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "role_change",
  "permission_change",
] as const

export function AuditClient() {
  const [entityType, setEntityType] =
    React.useState<(typeof ENTITIES)[number]>("all")
  const [action, setAction] = React.useState<(typeof ACTIONS)[number]>("all")
  const [search, setSearch] = React.useState("")
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const query = useAuditLogs({
    entityType: entityType === "all" ? undefined : entityType,
    action: action === "all" ? undefined : (action as AuditLog["action"]),
    limit: 100,
  })

  const filtered = React.useMemo(() => {
    if (!query.data) return []
    const term = search.trim().toLowerCase()
    if (!term) return query.data.data
    return query.data.data.filter(
      (row) =>
        row.description.toLowerCase().includes(term) ||
        row.entityType.toLowerCase().includes(term) ||
        (row.entityId ?? "").toLowerCase().includes(term) ||
        (row.userId ?? "").toLowerCase().includes(term)
    )
  }, [query.data, search])

  return (
    <div className="space-y-6">
      <PageHeader
        overline="System"
        title="Audit Log"
        description="Append-only record of every change made through the dashboard."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div
          className="relative flex-1"
          style={{ minWidth: "260px" }}
        >
          <RiSearchLine
            className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description, entity, ID, actor…"
            className="pl-8"
          />
        </div>
        <Filter
          label="Entity"
          options={ENTITIES.map((v) => ({
            value: v,
            label: v.replace("_", " "),
          }))}
          value={entityType}
          onChange={(v) => setEntityType(v as (typeof ENTITIES)[number])}
        />
        <Filter
          label="Action"
          options={ACTIONS.map((v) => ({ value: v, label: v }))}
          value={action}
          onChange={(v) => setAction(v as (typeof ACTIONS)[number])}
        />
      </div>

      {query.isLoading && <SkeletonTable columns={6} rows={10} />}

      {!query.isLoading && filtered.length === 0 && (
        <EmptyState
          icon={<RiHistoryLine className="size-6" aria-hidden="true" />}
          title="No audit events"
          description="Try widening the filters or expanding the time range."
        />
      )}

      {!query.isLoading && filtered.length > 0 && (
        <div className="border border-border bg-background">
          <div className="grid grid-cols-[150px_110px_140px_1fr_140px_140px_32px] border-b border-border bg-muted/40 px-3 py-2 font-mono text-paper-10 uppercase tracking-widest text-muted-foreground">
            <span>Time</span>
            <span>Action</span>
            <span>Entity</span>
            <span>Description</span>
            <span>Actor</span>
            <span>IP</span>
            <span />
          </div>
          {filtered.map((log) => {
            const isOpen = expandedId === log.id
            return (
              <React.Fragment key={log.id}>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId((prev) => (prev === log.id ? null : log.id))
                  }
                  aria-expanded={isOpen}
                  className="grid w-full grid-cols-[150px_110px_140px_1fr_140px_140px_32px] items-center border-b border-border px-3 py-2 text-left text-sm transition-colors last:border-0 hover:bg-muted/30"
                >
                  <span className="font-mono text-paper-11 text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                  <span>
                    <ActionBadge action={log.action} />
                  </span>
                  <span className="truncate font-mono text-paper-11 uppercase tracking-widest">
                    {log.entityType}
                  </span>
                  <span className="truncate">{log.description}</span>
                  <span className="truncate font-mono text-paper-11 text-muted-foreground">
                    {log.userId ? log.userId.slice(0, 8) + "…" : "system"}
                  </span>
                  <span className="truncate font-mono text-paper-11 text-muted-foreground">
                    {log.ipAddress ?? "—"}
                  </span>
                  <span
                    className={`flex justify-center text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  >
                    <RiArrowDownSLine className="size-3.5" />
                  </span>
                </button>
                {isOpen && (
                  <div className="grid gap-3 border-b border-border bg-muted/10 px-4 py-4 last:border-0 md:grid-cols-[1fr_2fr]">
                    <div className="space-y-2 font-mono text-paper-11">
                      <Detail label="Audit ID" value={log.id} />
                      <Detail
                        label="Entity ID"
                        value={log.entityId ?? "—"}
                      />
                      <Detail
                        label="Actor"
                        value={log.userId ?? "system"}
                      />
                      <Detail
                        label="IP"
                        value={log.ipAddress ?? "—"}
                      />
                      <Detail
                        label="User Agent"
                        value={log.userAgent ?? "—"}
                      />
                    </div>
                    <AuditDiffViewer
                      before={log.oldValues}
                      after={log.newValues}
                    />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface FilterProps {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

function Filter({ label, options, value, onChange }: FilterProps) {
  return (
    <label className="inline-flex items-center gap-2 border border-border bg-card px-2 py-1 text-xs">
      <RiFilterLine
        className="size-3.5 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-foreground outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function ActionBadge({ action }: { action: AuditLog["action"] }) {
  const variant =
    action === "create"
      ? "default"
      : action === "delete"
        ? "destructive"
        : "secondary"
  return (
    <Badge variant={variant} className="font-mono">
      {action}
    </Badge>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-paper-10 uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="break-all font-mono text-paper-11">{value}</p>
    </div>
  )
}
