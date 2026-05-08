// Sentry server-side initialization (Node.js runtime).
//
// IMPORTANT: To activate, set SENTRY_DSN (or NEXT_PUBLIC_SENTRY_DSN) in
// the environment. Without a DSN, Sentry.init is a no-op and the build
// remains clean — the app works with no telemetry rather than crashing.
//
// Privacy posture (intentional, do NOT relax):
//   - `sendDefaultPii: false` — we explicitly DON'T capture request
//     headers / IPs / user agents. Operators can correlate via the
//     custom `tags` we set at capture sites instead.
//   - Logs are enabled but `Sentry.logger.*` calls should still avoid
//     PII; the SDK doesn't redact strings for you.

import * as Sentry from "@sentry/nextjs"

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE ?? process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    enableLogs: true,
    sendDefaultPii: false,
  })
}
