#!/usr/bin/env node
// @ts-check
/* eslint-disable no-undef -- runs in Node; `process` is global. The
   workspace's flat eslint config doesn't auto-detect Node globals for
   .mjs scripts, so we suppress here rather than mutate config. */

/**
 * Sentry smoke test — verifies that the configured DSN routes events
 * to the right project end-to-end.
 *
 * ## Why raw HTTP rather than the SDK
 *
 * `@sentry/nextjs` v10 uses conditional ESM exports — the top-level
 * package doesn't surface `captureException` outside Webpack/Turbopack
 * bundling, so a plain `node script.mjs` invocation can't import it.
 * Trying to add `@sentry/node` as a script-only dep buys complication
 * for no extra confidence.
 *
 * Direct HTTP against the Sentry ingest API tests the actual wire
 * format the SDK would have used, plus DSN parsing, project routing,
 * and ingest auth. If this succeeds, the SDK path through the live
 * app will too — they share the same endpoint.
 *
 * ## Usage (from repo root)
 *
 *   pnpm --filter dashboard sentry:smoke
 *   # or directly:
 *   cd apps/dashboard && node --env-file=.env.local scripts/sentry-smoke.mjs
 *
 * ## Expected outcome
 *
 *   - Event posts to https://o4510226292932608.ingest.de.sentry.io/...
 *   - Issue appears at https://tapan-cargo-az.sentry.io/issues/?query=is:unresolved+kind:sentry-smoke-test
 *     within ~30 seconds.
 *   - Tagged `kind:sentry-smoke-test` so it's trivial to filter and
 *     resolve afterwards. Always create as level `info` so it doesn't
 *     pollute genuine error metrics.
 *
 * ## Exit codes
 *
 *   0 — event accepted (HTTP 2xx from ingest)
 *   1 — DSN env var missing
 *   2 — DSN format malformed
 *   3 — ingest endpoint rejected the event
 */

const DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN

if (!DSN) {
  console.error(
    "❌ Neither SENTRY_DSN nor NEXT_PUBLIC_SENTRY_DSN is set.\n" +
      "   Run with: cd apps/dashboard && node --env-file=.env.local scripts/sentry-smoke.mjs",
  )
  process.exit(1)
}

/* ── Parse the DSN ─────────────────────────────────────────────────────
 *
 * Sentry DSN shape:  https://<public_key>@<host>/<project_id>
 * Example:           https://abc123@o45102.ingest.de.sentry.io/451135
 *
 * The ingest endpoint we POST to is derived as:
 *   https://<host>/api/<project_id>/store/
 *
 * Auth goes in an `X-Sentry-Auth` header containing the public key.
 */
let publicKey
let host
let projectId
try {
  const u = new URL(DSN)
  publicKey = u.username
  host = u.host
  projectId = u.pathname.replace(/^\/+/, "")
  if (!publicKey || !host || !projectId) throw new Error("incomplete DSN")
} catch (err) {
  console.error(
    `❌ DSN appears malformed: ${err instanceof Error ? err.message : String(err)}`,
  )
  process.exit(2)
}

const ingestUrl = `https://${host}/api/${projectId}/store/`

/* ── Synthesize a Sentry event ─────────────────────────────────────────
 *
 * Minimal but valid. The `myUndefinedFunction()` call site is
 * synthesized into a stack frame so the issue reads as if it were
 * thrown by real code (matches the Sentry verification doc's example).
 */
const eventId = crypto.randomUUID().replace(/-/g, "")
const event = {
  event_id: eventId,
  timestamp: new Date().toISOString(),
  platform: "node",
  level: "info", // not "error" — we don't want to pollute real error metrics
  logger: "sentry-smoke",
  release: process.env.SENTRY_RELEASE ?? "smoke-test",
  environment:
    process.env.SENTRY_ENV ?? process.env.NODE_ENV ?? "smoke-test",
  message: {
    formatted:
      "Sentry smoke test — synthetic ReferenceError from myUndefinedFunction()",
  },
  tags: {
    kind: "sentry-smoke-test",
    origin: "scripts/sentry-smoke.mjs",
  },
  extra: {
    ranAt: new Date().toISOString(),
    node: process.version,
    platform: process.platform,
    cwd: process.cwd(),
  },
  exception: {
    values: [
      {
        type: "ReferenceError",
        value: "myUndefinedFunction is not defined",
        stacktrace: {
          frames: [
            {
              filename: "scripts/sentry-smoke.mjs",
              function: "<smoke-test>",
              in_app: true,
              lineno: 1,
            },
          ],
        },
      },
    ],
  },
}

/* ── POST it ───────────────────────────────────────────────────────── */

console.log(`→ posting smoke event to ${ingestUrl}`)
console.log(`   event_id: ${eventId}`)
console.log(`   project:  ${projectId}`)

const sentryClient = "tac-express-smoke/1.0"
const authHeader =
  `Sentry sentry_version=7, ` +
  `sentry_client=${sentryClient}, ` +
  `sentry_key=${publicKey}, ` +
  `sentry_timestamp=${Math.floor(Date.now() / 1000)}`

let response
try {
  response = await fetch(ingestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": sentryClient,
      "X-Sentry-Auth": authHeader,
    },
    body: JSON.stringify(event),
  })
} catch (err) {
  console.error(
    `❌ Network error posting to ingest: ${err instanceof Error ? err.message : String(err)}`,
  )
  process.exit(3)
}

const responseText = await response.text().catch(() => "<unreadable>")

if (!response.ok) {
  console.error(
    `❌ Ingest rejected the event (HTTP ${response.status})\n` +
      `   Response: ${responseText.slice(0, 500)}`,
  )
  process.exit(3)
}

console.log(
  `✅ Event accepted (HTTP ${response.status}) — response: ${responseText.slice(0, 200)}`,
)
console.log(
  `\n   View it at:\n` +
    `   https://tapan-cargo-az.sentry.io/issues/?query=is:unresolved+kind:sentry-smoke-test\n`,
)
process.exit(0)
