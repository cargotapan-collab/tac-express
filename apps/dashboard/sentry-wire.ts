// Wires the @sentry/nextjs SDK into the two workspace packages that
// have instrumentation hooks (packages/auth, packages/services).
//
// Why this exists:
//   Neither workspace package depends on @sentry/nextjs directly —
//   apps/web consumes packages/services and doesn't want Sentry pulled
//   into its bundle. Instead, each package exposes a tiny `registerSentry`
//   injector + emits via the injected backend or no-ops if unregistered.
//   This file is the apps/dashboard side of that contract.
//
// Called from sentry.server.config / sentry.edge.config / sentry.client.config
// AFTER `Sentry.init()` (or instead of it, when DSN is unset — wiring with
// an uninitialised Sentry is still useful because `captureException` is a
// no-op rather than a throw).

import * as Sentry from "@sentry/nextjs"

import {
  registerSentry as registerAuthSentry,
  type TagMap as AuthTagMap,
} from "@workspace/auth"
import {
  registerSentry as registerServicesSentry,
  type TagMap as ServicesTagMap,
} from "@workspace/services"

/**
 * Wire @sentry/nextjs as the backend for both workspace packages.
 *
 * Safe to call multiple times — `registerSentry` overwrites the
 * registration on each call. Each runtime (server / edge / client)
 * calls this once after Sentry.init.
 */
export function wireWorkspaceSentry(): void {
  const emit = (error: unknown, tags: AuthTagMap | ServicesTagMap) => {
    Sentry.withScope((scope) => {
      for (const [k, v] of Object.entries(tags)) {
        scope.setTag(k, v)
      }
      Sentry.captureException(error)
    })
  }

  registerAuthSentry({ captureException: emit })
  registerServicesSentry({ captureException: emit })
}
