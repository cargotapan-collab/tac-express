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
 * Re-renders when the value changes in another tab (native `storage` event)
 * or in the current tab (synthetic `storage` dispatch from `setDesignVersion`).
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
