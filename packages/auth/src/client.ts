"use client"

import { createBrowserClient } from "@workspace/database/client"
import type {
  AuthChangeEvent,
  Session,
} from "@workspace/database/supabase.types"
import { createAuthService, type AuthService } from "./auth.service"

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

export { getBrowserAuth, signOutBrowser, subscribeAuthChange }
