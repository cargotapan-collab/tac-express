/* eslint-disable no-undef -- runs in Node; `process` is global. The
   workspace's flat eslint config doesn't auto-detect Node globals for
   .mjs config files, so we suppress here rather than mutate config. */
import { withSentryConfig } from "@sentry/nextjs"

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
