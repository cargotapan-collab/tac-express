import type { Metadata } from "next"
import { cookies } from "next/headers"

import { getServerAuth } from "@workspace/auth/server"
import { PageHeader } from "@workspace/ui/components/composed/page-header"

import { NotificationsClient } from "./notifications-client"

export const metadata: Metadata = {
  title: "Notifications | TAC Express Dashboard",
  description: "System notifications and alerts",
}

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  const cookieStore = await cookies()
  const user = await getServerAuth(cookieStore).getUser()

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        overline="System"
        title="Notifications"
        description="System alerts and activity updates"
      />
      <NotificationsClient userId={user?.id ?? null} />
    </div>
  )
}
