"use client"

import * as React from "react"

import {
  DESIGN_FLAG_STORAGE_KEY,
  type DesignVersion,
  getDesignVersion,
  setDesignVersion as setDesignVersionStorage,
} from "@workspace/ui/lib/design-flag"

/**
 * Subscribe to the active design version.
 *
 * Initial state is seeded from the server-safe `getDesignVersion()` so the
 * first render matches SSR (no `window`, env-or-default). On mount we
 * re-read with `localStorage` access available — if the user-override
 * differs, the resulting `setVersion()` triggers a client re-render that
 * swaps the design without a redeploy.
 *
 * Also re-renders when the value changes in another tab (native `storage`
 * event) or in the current tab (synthetic `storage` dispatch from
 * `setDesignVersion`).
 *
 * Wraps the rollback flag from `lib/design-flag` so composed components can
 * branch on it without touching `localStorage` directly — see
 * `docs/ROLLBACK-PLAYBOOK.md § NextAdmin Refactor`.
 */
export function useDesignVersion(): {
  version: DesignVersion
  setVersion: (next: DesignVersion) => void
} {
  const [version, setVersion] = React.useState<DesignVersion>(() => getDesignVersion())

  React.useEffect(() => {
    if (typeof window === "undefined") return
    // Hydration sync — the SSR pass had no `window`, so the initial state
    // is env-or-default. Re-read now that `localStorage` is available so a
    // per-user override actually takes effect on first client render.
    setVersion(getDesignVersion())

    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== DESIGN_FLAG_STORAGE_KEY) return
      setVersion(getDesignVersion())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const updateVersion = React.useCallback((next: DesignVersion) => {
    setDesignVersionStorage(next)
    setVersion(next)
  }, [])

  return { version, setVersion: updateVersion }
}
