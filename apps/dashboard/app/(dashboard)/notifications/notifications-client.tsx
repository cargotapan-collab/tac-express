"use client"

import * as React from "react"

import {
  useNotificationsForUser,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useRealtimeNotifications,
} from "@workspace/services/hooks/use-notifications"
import {
  NotificationInbox,
  type InboxNotification,
} from "@workspace/ui/components/composed/notifications/notification-inbox"
import { EmptyState } from "@workspace/ui/components/primitives/empty-state"
import { PageShell } from "@workspace/ui/components/composed/page-shell"
import {
  RiNotification3Line,
  RiSignalTowerLine,
  RiInformationLine,
} from "@workspace/ui/icons"

interface NotificationsClientProps {
  userId: string | null
}

export function NotificationsClient({ userId }: NotificationsClientProps) {
  // Realtime subscription invalidates the inbox + unread-count queries
  // whenever a notification row changes server-side.
  useRealtimeNotifications(userId ?? undefined)

  const { data: notifications = [], isLoading } = useNotificationsForUser(
    userId ?? undefined,
    { limit: 100 }
  )
  const { data: unreadCount = 0 } = useUnreadNotificationCount(
    userId ?? undefined
  )
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead(userId ?? undefined)

  const inboxItems: InboxNotification[] = React.useMemo(
    () =>
      notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        link: n.link,
        channel: n.channel,
        entityType: n.entityType,
        entityId: n.entityId,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
    [notifications]
  )

  if (!userId) {
    return (
      <PageShell>
        <EmptyState
          icon={<RiNotification3Line />}
          title="Sign in required"
          description="Sign in to view your notifications."
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NotificationInbox
            notifications={inboxItems}
            unreadCount={unreadCount}
            loading={isLoading}
            onMarkRead={(id) => markRead.mutate({ id, userId })}
            onMarkAllRead={() => markAllRead.mutate()}
          />
        </div>
        <aside className="space-y-6">
          <SystemStatusCard />
          <ChannelLegendCard />
        </aside>
      </div>
    </PageShell>
  )
}

/**
 * System status snapshot — operator-facing platform health indicator.
 * For Phase 5 this surfaces a static "all systems normal" reading;
 * later phases wire it to a real status feed (Supabase Realtime
 * heartbeat + edge-function health checks). The card lives in the
 * notifications sidebar because the user's mental model "did I miss
 * something?" maps cleanly to "is the platform itself OK?".
 */
function SystemStatusCard() {
  const services: { label: string; status: "ok" | "warn" | "down" }[] = [
    { label: "API", status: "ok" },
    { label: "Database", status: "ok" },
    { label: "Realtime", status: "ok" },
    { label: "PDF service", status: "ok" },
    { label: "Webhooks", status: "ok" },
  ]
  const overall = services.every((s) => s.status === "ok")
    ? "All systems normal"
    : services.some((s) => s.status === "down")
      ? "Service incident"
      : "Degraded performance"
  const pulseTone = services.every((s) => s.status === "ok")
    ? "bg-accent-success"
    : services.some((s) => s.status === "down")
      ? "bg-accent-danger"
      : "bg-accent-warning"

  return (
    <div className="tac-fui-panel space-y-3 bg-card p-5">
      <p className="flex items-center gap-2 border-b border-border pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <RiSignalTowerLine className="size-3.5" aria-hidden="true" />
        System status
      </p>

      <div className="flex items-center gap-2">
        <span className="relative inline-flex">
          <span className={`size-2 ${pulseTone}`} aria-hidden="true" />
          <span
            className={`absolute inset-0 size-2 ${pulseTone} opacity-60 animate-skeleton-pulse`}
            aria-hidden="true"
          />
        </span>
        <span className="font-mono text-xs uppercase tracking-wider text-foreground">
          {overall}
        </span>
      </div>

      <ul className="space-y-1 pt-1">
        {services.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between py-0.5 font-mono text-[10px] uppercase tracking-widest"
          >
            <span className="text-muted-foreground">{s.label}</span>
            <span
              className={
                s.status === "ok"
                  ? "text-accent-success"
                  : s.status === "warn"
                    ? "text-accent-warning"
                    : "text-accent-danger"
              }
            >
              {s.status === "ok" ? "● operational" : s.status === "warn" ? "⚠ degraded" : "✖ incident"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Channel legend — helps operators recognise notification badge
 * variants without reading docs. The taxonomy mirrors what
 * `packages/services/src/notification.service.ts` emits.
 */
function ChannelLegendCard() {
  const channels: { code: string; label: string; description: string }[] = [
    { code: "SYSTEM", label: "System", description: "Platform alerts, scheduled jobs, sync state" },
    { code: "OPS", label: "Operations", description: "Manifests, scans, dispatch, exceptions" },
    { code: "FINANCE", label: "Finance", description: "Invoices, payments, COD, settlement" },
    { code: "CUSTOMER", label: "Customer", description: "Customer-initiated bookings + WhatsApp replies" },
    { code: "SLA", label: "SLA", description: "Breach warnings, due-soon alerts, escalations" },
  ]

  return (
    <div className="tac-fui-panel space-y-3 bg-card p-5">
      <p className="flex items-center gap-2 border-b border-border pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <RiInformationLine className="size-3.5" aria-hidden="true" />
        Notification channels
      </p>
      <ul className="space-y-2">
        {channels.map((c) => (
          <li key={c.code} className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex h-5 shrink-0 items-center border border-border bg-muted px-1.5 font-mono text-2xs uppercase tracking-wider text-foreground">
              {c.code}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-foreground">
                {c.label}
              </p>
              <p className="text-xs text-muted-foreground">{c.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
