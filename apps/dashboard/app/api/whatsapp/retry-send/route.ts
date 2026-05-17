import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { captureRbacDenial } from "@workspace/auth"
import { getServerAuth } from "@workspace/auth/server"
import { isManagerOrAbove } from "@workspace/auth/rbac"
import { UserRole } from "@workspace/types"
import {
  createAdminServerService,
  createInvoiceServerService,
  createTrackedWhatsAppServerService,
} from "@workspace/services/server"
import {
  buildInvoiceMessage,
  type InvoiceLike,
} from "@workspace/services/whatsapp/invoice-replay-payload"
import { checkWhatsApp } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

/**
 * POST /api/whatsapp/retry-send
 *
 * Manual operator retry for a failed WhatsApp send (SB-1 / #153 / W2 PR 2).
 * Closes the write half of the W2 read/retry split opened by PR #152.
 *
 * Scope (V1):
 *   - Retries `sendmessage` (direct-mode) failures only. Template
 *     (`sendtemplatemessage`) retries require `templateLanguage` metadata
 *     not stored on `whatsapp_sends`; out of scope for V1 — the UI shows
 *     the retry button disabled with an explanatory tooltip for template
 *     rows. Filed as POST-LAUNCH follow-up.
 *   - Requires the original failed send to be linked to an invoice
 *     (invoice_id IS NOT NULL). All current sends are invoice-linked; this
 *     guard exists for forward-compatibility with future non-invoice sends.
 *
 * Layered safety (see decision § E):
 *   Layer 1 — Service guards (already shipped in PR #141): row exists +
 *     status=='failed' + endpoint matches. Defense-in-depth on every
 *     retryWhatsappSend call.
 *   Layer 2 — Route guards (this file): MANAGER+ role-gate + kill-switch
 *     check + Upstash rate-limit + scope guards (sendmessage-only,
 *     invoice-linked, invoice still readable). All BEFORE the service call.
 *   Layer 3 — UI guards (client wrapper): per-row in-flight lock; double-
 *     click is a no-op at the wrapper.
 *
 * Money-flow contract: a retry produces AT MOST one additional `sendmessage`
 * call to WPBox per click. The service's "status must be failed" guard
 * fires deterministically against the row id passed in, so a duplicate POST
 * (network retry, browser-back, etc.) cannot produce a second send for the
 * same `original_send_id` while the first attempt is in-flight (queued) or
 * has completed. See decision § E.
 */

const RequestBodySchema = z.object({
  originalSendId: z.string().uuid(),
})

const log = logger.child({ route: "/api/whatsapp/retry-send" })

export async function POST(req: NextRequest) {
  // ─── 0. Server-side kill switch (mirrors send-invoice) ──────────────
  if (process.env.WHATSAPP_ENABLED !== "true") {
    return NextResponse.json(
      {
        error:
          "WhatsApp sending is disabled. Set WHATSAPP_ENABLED=true to enable.",
      },
      { status: 503 },
    )
  }

  // ─── 1. Authn + Authz ───────────────────────────────────────────────
  const cookieStore = await cookies()
  const auth = getServerAuth(cookieStore)
  const user = await auth.getUser().catch(() => null)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminService = createAdminServerService(cookieStore)
  const profile = await adminService.getProfileById(user.id).catch(() => null)
  const role = profile?.role as UserRole | undefined
  if (!role || !isManagerOrAbove(role)) {
    captureRbacDenial({
      requiredRole: UserRole.MANAGER,
      actualRole: role ?? UserRole.OPS_STAFF,
      surface: "/api/whatsapp/retry-send",
    })
    return NextResponse.json(
      {
        error:
          "Insufficient permissions. Retrying a WhatsApp send requires MANAGER or above.",
      },
      { status: 403 },
    )
  }

  // ─── 2. Per-user rate limit (mirrors send-invoice) ──────────────────
  const rl = await checkWhatsApp(`user:${user.id}`)
  if (!rl.success) {
    return NextResponse.json(
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
    )
  }

  // ─── 3. Parse + validate body ───────────────────────────────────────
  let parsed: z.infer<typeof RequestBodySchema>
  try {
    const raw = await req.json()
    parsed = RequestBodySchema.parse(raw)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // ─── 4. Pre-flight check on the failed row ──────────────────────────
  const trackedSvc = createTrackedWhatsAppServerService(cookieStore)
  const failedRow = await trackedSvc
    .getWhatsappSendById(parsed.originalSendId)
    .catch(() => null)

  if (!failedRow) {
    return NextResponse.json(
      { error: "Failed send not found, or not visible to this user." },
      { status: 404 },
    )
  }

  if (failedRow.status !== "failed") {
    return NextResponse.json(
      {
        error: `This send is no longer in a retryable state (status=${failedRow.status}). Refresh the page.`,
      },
      { status: 409 },
    )
  }

  if (failedRow.endpoint !== "sendmessage") {
    // V1 scope cut — template retries need templateLanguage metadata that
    // isn't stored on whatsapp_sends today. See decision § A.
    return NextResponse.json(
      {
        error:
          "Template-message retries are not supported in this view yet. Re-send from the invoice detail page.",
      },
      { status: 422 },
    )
  }

  if (failedRow.invoice_id === null) {
    return NextResponse.json(
      {
        error:
          "Replay is supported only for invoice-linked sends in V1.",
      },
      { status: 422 },
    )
  }

  // ─── 5. Load the invoice (RLS-checked via cookie-bound Supabase) ────
  const invoiceService = createInvoiceServerService(cookieStore)
  const invoice = (await invoiceService
    .getInvoiceById(failedRow.invoice_id)
    .catch(() => null)) as InvoiceLike | null

  if (!invoice) {
    return NextResponse.json(
      {
        error:
          "Invoice no longer readable. It may have been cancelled or deleted since the original send.",
      },
      { status: 422 },
    )
  }

  // ─── 6. Reconstruct the replay payload ──────────────────────────────
  // Direct-mode only (V1). Phone comes from the original row — that is
  // the SAME number the original send used, preserving the IDOR guards
  // the original send-invoice route enforced at the time.
  const message = buildInvoiceMessage(invoice)

  // ─── 7. Call the wrapper (Layer 1 guards fire here too) ─────────────
  log.debug(
    {
      originalSendId: failedRow.id,
      invoiceNumber: invoice.invoiceNumber,
      attemptNo: failedRow.attempt_no,
      userId: user.id,
    },
    "retrying WhatsApp send",
  )

  let outcome: Awaited<ReturnType<typeof trackedSvc.retryWhatsappSend>>
  try {
    outcome = await trackedSvc.retryWhatsappSend(failedRow.id, {
      endpoint: "sendmessage",
      input: {
        phone: failedRow.phone,
        message,
        header: `TAC Express · ${invoice.invoiceNumber}`,
        footer: "Reply to this message for queries.",
      },
    })
  } catch (err) {
    log.error(
      {
        originalSendId: failedRow.id,
        invoiceNumber: invoice.invoiceNumber,
        errorMsg: err instanceof Error ? err.message : String(err),
      },
      "retryWhatsappSend threw",
    )
    return NextResponse.json(
      { error: "Retry threw unexpectedly. See server logs." },
      { status: 502 },
    )
  }

  if (!outcome.result.ok) {
    log.warn(
      {
        originalSendId: failedRow.id,
        invoiceNumber: invoice.invoiceNumber,
        newSendId: outcome.newSendId,
        errorMsg: outcome.result.error,
      },
      "retry attempt failed",
    )
    return NextResponse.json(
      {
        ok: false,
        error: outcome.result.error,
        newSendId: outcome.newSendId,
      },
      { status: 502 },
    )
  }

  log.info(
    {
      originalSendId: failedRow.id,
      invoiceNumber: invoice.invoiceNumber,
      newSendId: outcome.newSendId,
    },
    "retry succeeded",
  )

  return NextResponse.json({
    ok: true,
    newSendId: outcome.newSendId,
  })
}
