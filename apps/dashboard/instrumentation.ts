// Next.js instrumentation entry point.
// Loaded automatically by Next.js (15+ default; 16+ always).
//
// IMPORTANT: Sentry initialization is opt-in via env vars; if
// NEXT_PUBLIC_SENTRY_DSN / SENTRY_DSN are unset, the imported config
// files are no-ops.

import * as Sentry from "@sentry/nextjs"

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config")
  }
}

/**
 * Capture errors thrown in App Router server components / route handlers
 * that Next.js surfaces via this hook (Next 15+). Required for full
 * coverage — without it, server-thrown exceptions show up in the Next
 * dev overlay but never reach Sentry.
 */
export const onRequestError = Sentry.captureRequestError
