"use client"

/**
 * Sign-out reason coordination — sessionStorage-backed handshake between
 * IdleGuard and SessionGuard.
 *
 * Both guards observe Supabase's SIGNED_OUT event. When IdleGuard initiates
 * a forced sign-out it must own the redirect (with reason=idle) so the user
 * sees the correct messaging. Without coordination, SessionGuard would race
 * and overwrite the redirect with reason=session_expired.
 *
 * The contract:
 *  - IdleGuard calls `claimSignOutReason("idle")` before signOutBrowser()
 *  - SessionGuard calls `consumeSignOutReason()` in its SIGNED_OUT handler
 *    and yields if it returns a reason
 *  - IdleGuard calls `clearSignOutReason()` if signOutBrowser() rejects
 *    (so SIGNED_OUT never fires and consume never runs)
 *
 * sessionStorage (not localStorage) so the marker can't leak across tabs
 * or browser sessions.
 */

const SIGNOUT_REASON_KEY = "auth:signout-reason"

type SignOutReason = "idle"

function claimSignOutReason(reason: SignOutReason): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(SIGNOUT_REASON_KEY, reason)
  } catch {
    /* sessionStorage unavailable — caller may race; harmless */
  }
}

/**
 * Read and clear the in-flight sign-out reason. Returns the claimed reason
 * (and removes the marker) if one was claimed; null otherwise.
 */
function consumeSignOutReason(): SignOutReason | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(SIGNOUT_REASON_KEY)
    if (raw === "idle") {
      window.sessionStorage.removeItem(SIGNOUT_REASON_KEY)
      return raw
    }
    return null
  } catch {
    return null
  }
}

function clearSignOutReason(): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.removeItem(SIGNOUT_REASON_KEY)
  } catch {
    /* unavailable — already harmless */
  }
}

export {
  claimSignOutReason,
  clearSignOutReason,
  consumeSignOutReason,
  SIGNOUT_REASON_KEY,
  type SignOutReason,
}
