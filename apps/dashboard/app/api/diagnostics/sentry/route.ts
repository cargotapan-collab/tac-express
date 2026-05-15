// Sentry wiring diagnostic — for issue #22 P1 verification.
//
// GET  /api/diagnostics/sentry        — Reports whether Sentry is configured
//                                       (DSN present + Sentry.init() actually
//                                       installed an active hub). Does NOT
//                                       emit any event.
//
// POST /api/diagnostics/sentry        — Fires a CONTROLLED synthetic event
//                                       with `kind=sentry_smoke_test` +
//                                       `module=ops` tags, returns the
//                                       event ID. The operator then verifies
//                                       it lands in the Sentry project
//                                       within 60 seconds.
//
// Why this endpoint exists:
//   Per docs/PRODUCTION-RUNBOOK.md § 4, `Sentry.captureException` is a no-op
//   when SENTRY_DSN is unset — Sentry.init() short-circuits and the build
//   stays clean. That's the intended privacy posture, but it makes it hard
//   to tell from inside the app whether the pipeline is live. This route
//   resolves the ambiguity: GET reports config state, POST round-trips a
//   tagged event you can search for.
//
// Authn / authz:
//   - MANAGER+ only. This is an internal ops surface — anon callers
//     could otherwise burn the Sentry event quota with junk.
//
// Reference:
//   - Issue #22
//   - apps/dashboard/sentry.server.config.ts — DSN gating
//   - apps/dashboard/app/(dashboard)/finance/[id]/invoice-detail-client.tsx
//     — the captureException consumer this verifies
//   - docs/PRODUCTION-RUNBOOK.md § 4

import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"

import { getServerAuth } from "@workspace/auth/server"
import { captureRbacDenial } from "@workspace/auth"
import { isManagerOrAbove } from "@workspace/auth/rbac"
import { UserRole } from "@workspace/types"
import { createAdminServerService } from "@workspace/services/server"
import { logger } from "@/lib/logger"
import { checkAuth } from "@/lib/rate-limit"

const log = logger.child({ route: "/api/diagnostics/sentry" })

export const dynamic = "force-dynamic"

type GateResult =
  | { allowed: false; response: NextResponse }
  | { allowed: true; userId: string }

async function requireManager(): Promise<GateResult> {
  const cookieStore = await cookies()
  const auth = getServerAuth(cookieStore)

  // Log unexpected auth-service failures at warn level so a network
  // hiccup doesn't masquerade as 401 in observability. We still return
  // null (and 401 below) so the response shape doesn't depend on
  // upstream availability — but ops gets a paper trail.
  const user = await auth.getUser().catch((err: unknown) => {
    log.warn(
      { err: err instanceof Error ? { message: err.message, name: err.name } : { value: String(err) } },
      "auth.getUser failed",
    )
    return null
  })
  if (!user) {
    return { allowed: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  const adminService = createAdminServerService(cookieStore)
  const profile = await adminService.getProfileById(user.id).catch((err: unknown) => {
    log.warn(
      { err: err instanceof Error ? { message: err.message, name: err.name } : { value: String(err) } },
      "adminService.getProfileById failed",
    )
    return null
  })

  // Defense-in-depth: don't trust the DB row to contain a valid UserRole.
  // Migration drift or a manual edit could leave a stale string here, and
  // passing an off-list value to isManagerOrAbove would short-circuit
  // unpredictably. Validate membership at the boundary.
  const rawRole = profile?.role
  const role = Object.values(UserRole).includes(rawRole as UserRole)
    ? (rawRole as UserRole)
    : undefined
  if (!role || !isManagerOrAbove(role)) {
    // BLOCK adoption per audit doc § 2.1. Tag values are deterministic:
    // UserRole enum for actualRole (sentinel OPS_STAFF when role is
    // missing/invalid, which puts unauthenticated traffic in the lowest
    // role bucket without leaking identity), hardcoded route surface.
    captureRbacDenial({
      requiredRole: UserRole.MANAGER,
      actualRole: role ?? UserRole.OPS_STAFF,
      surface: "/api/diagnostics/sentry",
    })
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Insufficient permissions. Sentry diagnostics require MANAGER or above." },
        { status: 403 },
      ),
    }
  }

  // Per-user rate limit (10 req/min via authRateLimit bucket). MANAGER+
  // gating already prevents anon abuse, but the route comment notes that
  // a logged-in caller could otherwise burn the Sentry event quota with
  // POST loops. Reuses the same bucket as /api/whatsapp/test.
  const rl = await checkAuth(`sentry-diag:${user.id}`)
  if (!rl.success) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: "Too many requests. Try again in a minute.",
          limit: rl.limit,
          remaining: rl.remaining,
          reset: rl.reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rl.limit),
            "X-RateLimit-Remaining": String(rl.remaining),
            "X-RateLimit-Reset": String(rl.reset),
          },
        },
      ),
    }
  }

  return { allowed: true, userId: user.id }
}

/**
 * GET — Report Sentry config without emitting any event.
 *
 * The presence of `process.env.SENTRY_DSN` alone isn't enough; we also
 * check Sentry's internal client state, because `Sentry.init()` may have
 * short-circuited for other reasons (e.g. malformed DSN). When `enabled`
 * is true, `captureException` will actually reach Sentry's ingestion.
 */
export async function GET() {
  const gate = await requireManager()
  if (!gate.allowed) return gate.response

  const dsnEnv = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || null
  const client = Sentry.getClient()
  const enabled = Boolean(client && client.getOptions().dsn)
  const dsnHost = (() => {
    if (!dsnEnv) return null
    try {
      // Sentry DSNs look like https://<public_key>@<host>/<project_id>
      return new URL(dsnEnv).host
    } catch {
      return null
    }
  })()

  return NextResponse.json({
    enabled,
    dsnConfigured: Boolean(dsnEnv),
    dsnHost,
    environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV ?? null,
    release: process.env.SENTRY_RELEASE ?? process.env.NEXT_PUBLIC_SENTRY_RELEASE ?? null,
    runtime: "nodejs",
    notes: enabled
      ? "Sentry is initialized. Use POST /api/diagnostics/sentry to fire a controlled smoke-test event."
      : "Sentry is NOT initialized. Set SENTRY_DSN in the environment, redeploy, then re-check.",
  })
}

/**
 * POST — Fire a synthetic, tagged smoke-test event end-to-end.
 *
 * Tags match the runbook filter (`tags.module = ops`) plus a unique
 * `kind = sentry_smoke_test` so the event is searchable and can't be
 * confused with a real production error. Returns the event ID so the
 * operator can paste it directly into Sentry's search bar.
 */
export async function POST() {
  const gate = await requireManager()
  if (!gate.allowed) return gate.response

  const client = Sentry.getClient()
  if (!client || !client.getOptions().dsn) {
    return NextResponse.json(
      {
        ok: false,
        reason: "Sentry not initialized — SENTRY_DSN is unset. captureException would be a no-op.",
      },
      { status: 503 },
    )
  }

  const correlationId = `smoke-${Date.now()}`
  const eventId = Sentry.captureException(
    new Error(`Sentry wiring smoke test (${correlationId}) — safe to ignore`),
    {
      tags: {
        kind: "sentry_smoke_test",
        module: "ops",
        correlation_id: correlationId,
      },
      level: "info",
    },
  )

  // Ensure the event is flushed before the route handler returns —
  // serverless runtimes can otherwise tear down the process before
  // the event leaves the buffer.
  await Sentry.flush(2000)

  return NextResponse.json({
    ok: true,
    eventId,
    correlationId,
    searchQuery: `tags.kind:sentry_smoke_test correlation_id:${correlationId}`,
    notes:
      "Event submitted. Confirm it appears in the Sentry project within 60s. " +
      "If it doesn't, the DSN is pointed at the wrong project or ingestion is blocked.",
  })
}
