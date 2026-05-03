"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { signOutBrowser } from "@workspace/auth/client"
import { getIdleMinutesForRole } from "@workspace/auth/rbac"
import { useRBAC } from "@workspace/ui/hooks/use-rbac"
import { IdleTimeoutBoundary } from "@workspace/ui/components/composed/idle-timeout-boundary"

import { SIGNOUT_REASON_KEY } from "@/components/session-guard"

interface IdleGuardProps {
  /**
   * Optional override. If omitted, the timeout is derived from the user's
   * role via `getIdleMinutesForRole`. While the role is loading we fall back
   * to the safe default (30 minutes).
   */
  idleMinutes?: number
}

/**
 * Client-only wrapper that mounts the IdleTimeoutBoundary in the dashboard
 * layout. The timeout adapts to the user's role (warehouse staff get a tighter
 * 15min window, admins get 60min). On forced logout it calls Supabase `signOut`,
 * scrubs draft keys from localStorage (`invoice_draft`, `shipment_*`, `print_*`,
 * `label_*`, `tac-*`), then navigates to /sign-in?next=…
 */
export function IdleGuard({ idleMinutes }: IdleGuardProps) {
  const router = useRouter()
  const { role } = useRBAC()
  const effectiveMinutes = idleMinutes ?? getIdleMinutesForRole(role)

  const handleLogout = React.useCallback(async () => {
    // Claim ownership of this sign-out so SessionGuard yields and the
    // user lands on /sign-in?reason=idle rather than reason=session_expired.
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(SIGNOUT_REASON_KEY, "idle")
      } catch {
        /* sessionStorage unavailable — SessionGuard may race; harmless */
      }
    }
    let signOutSucceeded = false
    try {
      await signOutBrowser()
      signOutSucceeded = true
    } catch {
      /* even if signOut fails, scrub local state and redirect */
    }
    // If the sign-out rejected before SIGNED_OUT could fire, SessionGuard
    // never gets a chance to consume the flag — clear it manually so a
    // subsequent (e.g. manual) sign-out in the same tab isn't misclassified.
    if (!signOutSucceeded && typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(SIGNOUT_REASON_KEY)
      } catch {
        /* unavailable — already harmless */
      }
    }
    if (typeof window !== "undefined") {
      const prefixes = [
        "invoice_draft",
        "shipment_",
        "print_",
        "label_",
        "tac-",
      ]
      try {
        for (const key of Object.keys(window.localStorage)) {
          if (prefixes.some((p) => key.startsWith(p))) {
            window.localStorage.removeItem(key)
          }
        }
      } catch {
        /* quota — ignore */
      }
    }
    const next = encodeURIComponent(
      window.location.pathname + window.location.search
    )
    router.replace(`/sign-in?next=${next}&reason=idle`)
  }, [router])

  return (
    <IdleTimeoutBoundary
      idleMinutes={effectiveMinutes}
      onLogout={() => {
        void handleLogout()
      }}
    />
  )
}
