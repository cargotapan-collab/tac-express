"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  claimSignOutReason,
  clearSignOutReason,
  signOutBrowser,
} from "@workspace/auth/client"
import { getIdleMinutesForRole } from "@workspace/auth/rbac"
import { useRBAC } from "@workspace/ui/hooks/use-rbac"
import { IdleTimeoutBoundary } from "@workspace/ui/components/composed/idle-timeout-boundary"

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
    claimSignOutReason("idle")
    let signOutSucceeded = false
    try {
      await signOutBrowser()
      signOutSucceeded = true
    } catch {
      /* even if signOut fails, scrub local state and redirect */
    }
    // If sign-out rejected, SIGNED_OUT never fires and SessionGuard won't
    // consume the marker — clear it so a later sign-out in the same tab
    // isn't misclassified.
    if (!signOutSucceeded) {
      clearSignOutReason()
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
