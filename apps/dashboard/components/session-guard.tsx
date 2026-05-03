"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@workspace/database/client"

/**
 * Redirects to /sign-in whenever Supabase fires a SIGNED_OUT event — this
 * includes the stale-token case where the stored refresh token is no longer
 * recognised by the server ("Invalid Refresh Token: Refresh Token Not Found").
 *
 * Supabase internally catches the failed refresh, clears the session, then
 * fires SIGNED_OUT on onAuthStateChange.  This guard turns that silent event
 * into an explicit redirect so the user can re-authenticate.
 *
 * Mounts alongside IdleGuard in the dashboard layout; renders nothing.
 */
export function SessionGuard() {
  const router = useRouter()

  React.useEffect(() => {
    const db = createBrowserClient()
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        const next = encodeURIComponent(
          window.location.pathname + window.location.search,
        )
        router.replace(`/sign-in?next=${next}&reason=session_expired`)
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  return null
}
