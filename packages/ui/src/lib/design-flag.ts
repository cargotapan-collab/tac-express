/**
 * Design version vocabulary — selects between the current Violet Grid v6
 * layout (`v6`) and the NextAdmin-inspired refactor (`v7`).
 *
 * Lives in `lib/` rather than a hook because the value is needed in both
 * server (RSC, route handlers) and browser contexts, and primitives must
 * not depend on React-only hooks for a config read.
 *
 * Resolution order (highest precedence first):
 *  1. `window.localStorage['tac-design']` — per-user override
 *  2. `process.env.NEXT_PUBLIC_DESIGN` — per-deploy default
 *  3. `'v6'` — current production
 *
 * Used by the rollback playbook (`docs/ROLLBACK-PLAYBOOK.md § NextAdmin
 * Refactor`) — flipping the localStorage key reverts a single user's
 * session to v6 without a redeploy.
 */

export type DesignVersion = "v6" | "v7"

const STORAGE_KEY = "tac-design"
const DEFAULT_VERSION: DesignVersion = "v6"

function normalize(value: string | null | undefined): DesignVersion | null {
  if (value === "v6" || value === "v7") return value
  return null
}

/**
 * Resolve the active design version. Safe to call from server and browser.
 * On the server, only `process.env.NEXT_PUBLIC_DESIGN` is consulted.
 */
export function getDesignVersion(): DesignVersion {
  if (typeof window !== "undefined") {
    const local = normalize(window.localStorage.getItem(STORAGE_KEY))
    if (local) return local
  }
  const fromEnv = normalize(process.env.NEXT_PUBLIC_DESIGN)
  return fromEnv ?? DEFAULT_VERSION
}

/**
 * Browser-only setter. No-op on the server.
 * Returns the value that's now active so callers can update state in one step.
 */
export function setDesignVersion(version: DesignVersion): DesignVersion {
  if (typeof window === "undefined") return DEFAULT_VERSION
  window.localStorage.setItem(STORAGE_KEY, version)
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: version }))
  return version
}

export const DESIGN_FLAG_STORAGE_KEY = STORAGE_KEY
