// Sentry client-side initialization for the dashboard app.
// Loaded by Next.js 16's instrumentation register hook.
//
// IMPORTANT: To activate, set NEXT_PUBLIC_SENTRY_DSN in your environment.
// Without a DSN, Sentry.init is a no-op and the build remains clean.
//
// Sampling policy (Phase 9 launch):
//  - tracesSampleRate: 0.1 in production (10% of transactions), 1.0 in dev
//    so tracing matches local debugging. Tune down to 0.02 once the volume
//    proves out.
//  - replaysSessionSampleRate: 0.05 in production (5% of sessions), 0.0 in
//    dev (replays are noisy locally). This catches enough usage to debug
//    without blowing the Sentry quota.
//  - replaysOnErrorSampleRate: 1.0 — every errored session gets a replay,
//    so we always have a video of the bug.
//
// Privacy: PII is scrubbed from breadcrumbs (Supabase URLs collapsed to
// `[supabase-redacted]`). Replays mask all text by default, with explicit
// opt-out per-element via `data-sentry-mask="false"` if the page chooses.

import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const isProd = process.env.NODE_ENV === "production"

if (dsn) {
  Sentry.init({
    dsn,
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENV ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: isProd ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: isProd ? 0.05 : 0.0,
    enableLogs: true,
    sendDefaultPii: false,
    integrations: [
      Sentry.replayIntegration({
        // Mask all text by default — replays are debugging tools, never PII
        // exfiltration. Pages that need readable text in replays can opt in
        // per-element with `data-sentry-mask="false"`.
        maskAllText: true,
        // Block all media — POD photos, signature pads, scanned documents
        // must never be captured.
        blockAllMedia: true,
        // Network capture: omit request/response bodies to keep replays
        // free of payment + personal data.
        networkDetailAllowUrls: [],
      }),
    ],
    // Strip server-only fields from breadcrumbs so secrets never leak.
    beforeBreadcrumb(crumb) {
      if (
        crumb.category === "fetch" &&
        crumb.data?.url?.includes("supabase")
      ) {
        crumb.data = {
          method: crumb.data.method,
          status_code: crumb.data.status_code,
          url: "[supabase-redacted]",
        }
      }
      return crumb
    },
    // Drop low-signal noise so the budget covers real bugs.
    ignoreErrors: [
      "ResizeObserver loop completed",
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
    ],
  })
}
