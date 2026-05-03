"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  consumeSignOutReason,
  subscribeAuthChange,
} from "@workspace/auth/client"

/**
 * Redirects to /sign-in whenever Supabase fires a SIGNED_OUT event — this
 * includes the stale-token case where the stored refresh token is no longer
 * recognised by the server ("Invalid Refresh Token: Refresh Token Not Found").
 *
 * Supabase internally catches the failed refresh, clears the session, then
 * fires SIGNED_OUT on onAuthStateChange. This guard turns that silent event
 * into an explicit redirect so the user can re-authenticate.
 *
 * Auth subscription is delegated to `subscribeAuthChange` (LAW 6/7 — no
 * direct DB calls in components). The handshake with IdleGuard goes through
 * `consumeSignOutReason()`: if IdleGuard claimed "idle" before triggering
 * sign-out, this guard yields and lets IdleGuard's redirect win.
 *
 * Renders nothing.
 */
export function SessionGuard() {
  const router = useRouter()

  React.useEffect(() => {
    return subscribeAuthChange((event) => {
      if (event !== "SIGNED_OUT") return

      // Yield to IdleGuard if this sign-out was idle-driven.
      if (consumeSignOutReason() === "idle") return

      const next = encodeURIComponent(
        window.location.pathname + window.location.search,
      )
      router.replace(`/sign-in?next=${next}&reason=session_expired`)
    })
  }, [router])

  return null
}
