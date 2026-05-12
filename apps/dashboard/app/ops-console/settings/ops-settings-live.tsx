"use client"

import * as React from "react"

import { useSession } from "@workspace/ui/hooks/use-session"
import {
  OpsSettingsView,
} from "@workspace/ui/components/composed/ops-console/pages"

export function OpsSettingsLive() {
  const { user } = useSession()
  // Profile fields come from `user.user_metadata` on the Supabase user record.
  const email = user?.email ?? "admin@tac.app"
  const meta = (user?.user_metadata ?? {}) as { display_name?: string; hub_code?: string }
  const displayName = meta.display_name ?? ""
  const hubCode = meta.hub_code ?? ""

  const pendingItems = [
    !displayName ? "Display name" : null,
    !hubCode ? "Hub code" : null,
  ].filter(Boolean) as string[]
  const completionPct = Math.round(
    ((2 - pendingItems.length) / 2) * 100,
  )

  return (
    <OpsSettingsView
      email={email}
      displayName={displayName}
      hubCode={hubCode}
      completionPct={completionPct}
      pendingItems={pendingItems}
      version="TAC Express v1.0"
      environment={process.env.NODE_ENV === "production" ? "production" : "development"}
    />
  )
}
