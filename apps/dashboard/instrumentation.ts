// Next.js instrumentation entry point.
// Loaded automatically by Next.js (15+ default; 16+ always).
//
// IMPORTANT: Sentry initialization is opt-in via env vars; if NEXT_PUBLIC_SENTRY_DSN
// is unset, the imported config files are no-ops.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config")
  }
}
