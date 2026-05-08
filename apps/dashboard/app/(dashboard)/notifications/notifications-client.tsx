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
import { RiNotification3Line } from "@workspace/ui/icons"

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
      <NotificationInbox
        notifications={inboxItems}
        unreadCount={unreadCount}
        loading={isLoading}
        onMarkRead={(id) => markRead.mutate({ id, userId })}
        onMarkAllRead={() => markAllRead.mutate()}
      />
    </PageShell>
  )
}
