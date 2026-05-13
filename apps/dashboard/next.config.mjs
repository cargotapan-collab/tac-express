/* eslint-disable no-undef -- runs in Node; `process` is global. The
   workspace's flat eslint config doesn't auto-detect Node globals for
   .mjs config files, so we suppress here rather than mutate config. */
import { withSentryConfig } from "@sentry/nextjs"

/**
 * Legacy v6 path → canonical Paper Ops Console redirects.
 *
 * The `(dashboard)` route group was deleted as part of the single-shell
 * migration (May 2026). Internal navigation already points at
 * `/ops-console/*` (see `nav-config.ts`), but bookmarks, deep links from
 * email/Slack, and any cached external references still hit the legacy
 * `/foo` shape. These redirects keep those references working.
 *
 * 308 permanent — search engines + browsers cache the redirect, so a
 * second visit goes straight to the canonical URL. Dynamic segments use
 * `:path*` so `/customers/123/abc` correctly redirects to
 * `/ops-console/customers/123/abc`.
 */
const LEGACY_REDIRECTS = [
  // Top-level list/section roots
  "analytics",
  "shipments",
  "manifests",
  "scanning",
  "inventory",
  "exceptions",
  "finance",
  "customers",
  "management",
  "notifications",
  "settings",
  "audit",
  "arrival-audit",
  "shift-report",
  "bookings",
].flatMap((slug) => [
  {
    source: `/${slug}`,
    destination: `/ops-console/${slug}`,
    permanent: true,
  },
  {
    source: `/${slug}/:path*`,
    destination: `/ops-console/${slug}/:path*`,
    permanent: true,
  },
])

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@workspace/types",
    "@workspace/services",
    "@workspace/database",
    "@workspace/auth",
  ],
  allowedDevOrigins: ["192.168.1.246", "localhost", "127.0.0.1", "*.localhost"],
  async redirects() {
    return [
      // Special-case renames (v6 path → ops-console path with different slug).
      { source: "/home", destination: "/ops-console", permanent: true },
      { source: "/rate-cards", destination: "/ops-console/rates", permanent: true },
      { source: "/rate-cards/:path*", destination: "/ops-console/rates/:path*", permanent: true },
      // Generic v6 list-section redirects.
      ...LEGACY_REDIRECTS,
    ]
  },
}

/**
 * Wrap with Sentry's build plugin for source map uploads + ad-blocker
 * tunneling. Active only in builds where SENTRY_AUTH_TOKEN is set —
 * on dev / unauthenticated builds it's a near-noop wrapper.
 *
 * - `org` / `project` — scope source maps to the right Sentry project.
 * - `tunnelRoute` — proxies Sentry traffic through our own origin so
 *   browser ad-blockers don't drop it. Routes through
 *   `/sentry-tunnel` on this app.
 * - `silent: !CI` — suppresses build-plugin chatter on local dev.
 * - `disableLogger: true` — strips Sentry's internal debug logger
 *   from the client bundle in production.
 */
export default withSentryConfig(nextConfig, {
  org: "tapan-cargo-az",
  project: "javascript-nextjs",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  tunnelRoute: "/sentry-tunnel",
  silent: !process.env.CI,
  disableLogger: true,
})
