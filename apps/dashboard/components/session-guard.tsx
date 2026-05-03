"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { subscribeAuthChange } from "@workspace/auth/client"

/**
 * Storage key shared with IdleGuard. When IdleGuard initiates a forced
 * sign-out, it stamps "idle" here before calling signOutBrowser() so this
 * guard can step aside and let IdleGuard's own redirect (with reason=idle)
 * win.
 *
 * Kept as sessionStorage (not localStorage) because the value is a one-shot
 * intent that should not survive across browser sessions.
 */
const SIGNOUT_REASON_KEY = "auth:signout-reason"

/**
 * Redirects to /sign-in whenever Supabase fires a SIGNED_OUT event — this
 * includes the stale-token case where the stored refresh token is no longer
 * recognised by the server ("Invalid Refresh Token: Refresh Token Not Found").
 *
 * Supabase internally catches the failed refresh, clears the session, then
 * fires SIGNED_OUT on onAuthStateChange. This guard turns that silent event
 * into an explicit redirect so the user can re-authenticate.
 *
 * Auth subscription is delegated to `subscribeAuthChange` from
 * @workspace/auth/client (LAW 6/7 — no direct DB calls in components).
 *
 * Coordinates with IdleGuard via SIGNOUT_REASON_KEY: if IdleGuard set
 * "idle" before triggering sign-out, this guard yields and lets IdleGuard
 * own the redirect with reason=idle.
 *
 * Renders nothing.
 */
export function SessionGuard() {
  const router = useRouter()

  React.useEffect(() => {
    return subscribeAuthChange((event) => {
      if (event !== "SIGNED_OUT") return

      // Yield to IdleGuard if this sign-out was idle-driven.
      if (typeof window !== "undefined") {
        try {
          const claimed = window.sessionStorage.getItem(SIGNOUT_REASON_KEY)
          if (claimed === "idle") {
            window.sessionStorage.removeItem(SIGNOUT_REASON_KEY)
            return
          }
        } catch {
          /* sessionStorage unavailable — fall through to redirect */
        }
      }

      const next = encodeURIComponent(
        window.location.pathname + window.location.search,
      )
      router.replace(`/sign-in?next=${next}&reason=session_expired`)
    })
  }, [router])

  return null
}

export { SIGNOUT_REASON_KEY }
