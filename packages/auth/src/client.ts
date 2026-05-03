"use client"

import { createBrowserClient } from "@workspace/database/client"
import type {
  AuthChangeEvent,
  Session,
} from "@workspace/database/supabase.types"
import { createAuthService, type AuthService } from "./auth.service"
import {
  claimSignOutReason,
  clearSignOutReason,
  consumeSignOutReason,
} from "./sign-out-reason"

let _instance: AuthService | null = null

/**
 * Lazily-instantiated browser auth service singleton.
 * Use this from "use client" components instead of importing
 * @workspace/database directly (LAW 6/7/8).
 */
function getBrowserAuth(): AuthService {
  if (!_instance) {
    _instance = createAuthService(createBrowserClient())
  }
  return _instance
}

/** Sign the current user out via the browser-side Supabase client. */
async function signOutBrowser(): Promise<void> {
  return getBrowserAuth().signOut()
}

/**
 * Subscribe to browser-side auth-state changes. Returns an unsubscribe
 * function. Use from `useEffect` cleanup. This is the LAW-6/7-compliant way
 * for UI components to react to sign-out / token-refresh events without
 * importing Supabase directly.
 */
function subscribeAuthChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  return getBrowserAuth().onAuthChange(callback)
}

/**
 * Idle-driven sign-out orchestrator. Claims the "idle" reason marker so
 * SessionGuard yields, performs the sign-out, and clears the marker on
 * failure (when SIGNED_OUT never fires and consumeSignOutReason wouldn't
 * otherwise run).
 *
 * Returns `true` if the underlying signOutBrowser() resolved, `false` if
 * it rejected. Callers can ignore the boolean if they always proceed with
 * post-sign-out cleanup regardless.
 */
async function performIdleSignOut(): Promise<boolean> {
  claimSignOutReason("idle")
  try {
    await signOutBrowser()
    return true
  } catch {
    clearSignOutReason()
    return false
  }
}

/**
 * Decide where to send the user when an unexpected SIGNED_OUT fires
 * (e.g., a stale refresh token). Returns the redirect path with the
 * caller's current location encoded as `next`, or `null` if this
 * sign-out was idle-driven (in which case IdleGuard owns the redirect
 * and SessionGuard yields).
 *
 * Pure of router/window globals — caller passes the current pathname
 * and search so this can be unit-tested without a DOM.
 */
function resolveSignOutRedirect(
  pathname: string,
  search: string,
): string | null {
  if (consumeSignOutReason() === "idle") return null
  const next = encodeURIComponent(pathname + search)
  return `/sign-in?next=${next}&reason=session_expired`
}

export {
  claimSignOutReason,
  clearSignOutReason,
  consumeSignOutReason,
  getBrowserAuth,
  performIdleSignOut,
  resolveSignOutRedirect,
  signOutBrowser,
  subscribeAuthChange,
}
