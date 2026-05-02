import { createBrowserClient as supabaseCreateBrowserClient, createServerClient as supabaseCreateServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"

interface CookieStore {
  getAll(): Array<{ name: string; value: string }>
  set(name: string, value: string, options?: CookieOptions): void
}

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
  }
  return { url, key }
}

export function createBrowserClient() {
  const { url, key } = getEnv()
  return supabaseCreateBrowserClient(url, key)
}

export function createServerClient(cookieStore: CookieStore) {
  const { url, key } = getEnv()
  return supabaseCreateServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server component — cookies are read-only
        }
      },
    },
  })
}
