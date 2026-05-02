"use client"

import { createBrowserClient } from "@workspace/database/client"
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

export { getBrowserAuth, signOutBrowser }
