import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { getServerAuth } from "@workspace/auth/server"
import { isAdminOrAbove, isManagerOrAbove } from "@workspace/auth/rbac"
import { UserRole } from "@workspace/types"
import {
  createAdminServerService,
  createCustomerServerService,
  createInvoiceServerService,
} from "@workspace/services/server"
import {
  createWhatsAppServiceFromEnv,
  normalizePhone,
  buildHeaderMediaComponent,
  type WhatsAppTemplateComponent,
} from "@workspace/services/whatsapp.service"
import { buildSignedInvoicePdfUrl } from "@workspace/services/pdf/invoice-pdf-token"
import type { InvoicePdfData } from "@workspace/services/pdf/invoice-pdf"
import { checkWhatsApp } from "@/lib/rate-limit"
import {
  isPubliclyReachableHttpUrl,
  resolvePublicOrigin,
} from "@/lib/public-origin"

/**
 * POST /api/whatsapp/send-invoice
 *
 * Sends a WhatsApp summary message for an invoice to the customer.
 * Requires:
 *   - Authenticated user (Supabase session)
 *   - Role: MANAGER or above (Finance / WhatsApp messages cost money)
 *
 * Body (validated by zod):
 *   {
 *     invoiceId: string,                  // required, UUID
 *     phone?:    string,                  // optional override (E.164 / 10-digit IN)
 *     mode?:     "direct" | "template",   // default: "direct"
 *
 *     // Required when mode === "template":
 *     templateName?:     string,
 *     templateLanguage?: string,          // "en" / "en_US" / "hi"
 *     templateParams?:   Array<{ text: string }>,
 *   }
 *
 * Two delivery modes:
 *
 *   1. **direct** — uses the free-form `sendmessage` endpoint. Subject to
 *      WhatsApp's 24-hour customer service window: only delivers if the
 *      recipient has messaged your WhatsApp Business number in the past
 *      24 hours. WPBox will return success + a WAMID even when delivery
 *      will silently fail (this is a WhatsApp policy, not a WPBox bug).
 *
 *   2. **template** — uses `sendtemplatemessage` with a Meta-approved
 *      template. Delivers anytime, no 24h restriction. The template must
 *      already exist and be APPROVED in your LeminAi dashboard.
 */

/* ── Request schema (zod) ─────────────────────────────────────────────────
 * One source of truth for the body shape. The discriminated union ensures
 * `templateName` / `templateLanguage` are required when mode === "template"
 * without having to write that check by hand.
 * ──────────────────────────────────────────────────────────────────────── */

const TemplateParamSchema = z.object({
  text: z.string().min(1).max(1024),
})

const BaseBodySchema = z.object({
  invoiceId: z.string().min(1, "invoiceId is required"),
  phone: z.string().max(20).optional(),
  /**
   * If `phone` is provided AND it doesn't match the invoice's customer-of-record
   * phone (or the consignor/consignee phones in notes), the request is rejected
   * unless the caller sets `overridePhone: true` AND has role >= ADMIN. This
   * prevents an authenticated MANAGER from using the endpoint as an arbitrary
   * paid-WhatsApp relay to numbers unrelated to any of their invoices.
   */
  overridePhone: z.boolean().optional(),
})

const DirectModeSchema = BaseBodySchema.extend({
  mode: z.literal("direct").optional(),
})

const TemplateModeSchema = BaseBodySchema.extend({
  mode: z.literal("template"),
  templateName: z.string().min(1, "templateName is required for template mode"),
  templateLanguage: z
    .string()
    .min(1, "templateLanguage is required for template mode"),
  templateParams: z.array(TemplateParamSchema).max(20).optional(),
  /**
   * Public URL of the document (PDF) to attach to the template's HEADER
   * component. Required for templates whose HEADER format is DOCUMENT,
   * IMAGE, or VIDEO. WhatsApp fetches this URL server-side, so it must
   * be publicly resolvable (no auth, no localhost). The refinement
   * rejects loopback / RFC 1918 / link-local hosts at the schema
   * boundary so callers fail fast rather than at WPBox-fetch time.
   */
  templateMediaUrl: z
    .string()
    .url()
    .max(2048)
    .refine(isPubliclyReachableHttpUrl, {
      message:
        "templateMediaUrl must be a publicly reachable http(s) URL (no localhost, loopback, or RFC1918 private hosts).",
    })
    .optional(),
  /** Display filename for the document attachment (HEADER format=DOCUMENT). */
  templateMediaFilename: z.string().max(200).optional(),
  /** Override the default header media kind. Defaults to "document". */
  templateMediaKind: z.enum(["document", "image", "video"]).optional(),
})

const RequestBodySchema = z.union([DirectModeSchema, TemplateModeSchema])

interface InvoiceLike {
  invoiceNumber: string
  status: string
  createdAt: string
  customerName: string
  customerId?: string | null
  customerGstin?: string | null
  awbNumber?: string | null
  baseFreight: number
  docketCharge: number
  pickupCharge?: number | null
  packingCharge?: number | null
  fuelSurcharge: number
  handlingFee: number
  insurance: number
  discount: number
  tax: { cgst: number; sgst: number; igst: number; total: number }
  totalAmount: number
  advancePaid: number
  balance: number
  dueDate?: string | null
  notes?: string | null
  paymentMode: string
}

/** Maximum allowed length of `invoice.notes` we will attempt to JSON.parse.
 *  Higher than realistic but caps event-loop blocking from a hostile/oversize
 *  notes blob. */
const MAX_NOTES_BYTES = 64 * 1024

export async function POST(req: NextRequest) {
  /* ─── 0. Server-side kill switch ───────────────────────────────────
   * Set `WHATSAPP_ENABLED=true` to permit sends. Any other value (unset,
   * "false", typo) returns 503 immediately. This exists so when (not if)
   * Lemin AI changes their template schema, has an outage, or we need
   * to halt sends for any other operational reason, we flip a single
   * env var instead of redeploying. Tracked: issue #12 (DB-backed
   * follow-up for non-redeploy toggling). */
  if (process.env.WHATSAPP_ENABLED !== "true") {
    return NextResponse.json(
      {
        error:
          "WhatsApp sending is disabled. Set WHATSAPP_ENABLED=true to enable.",
      },
      { status: 503 },
    )
  }

  /* ─── 1. Authn + Authz ─── */
  const cookieStore = await cookies()
  const auth = getServerAuth(cookieStore)
  const user = await auth.getUser().catch(() => null)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  /**
   * Role lives on the `public.profiles` row mirrored against each signed-in
   * user — single source of truth across the whole codebase. The dashboard's
   * `useRBAC()` hook (packages/ui/src/hooks/use-rbac.ts:67) and the
   * admin/staff list (packages/services/src/admin.service.ts:32) both read
   * from there. RLS lets a user read their own row.
   *
   * NOT `user.user_metadata?.role` / `user.app_metadata?.role` — those are
   * unused for auth in this codebase. An earlier version of this route read
   * from metadata, which produced a 403 for every operator (because nobody's
   * metadata had ever been populated).
   */
  const adminService = createAdminServerService(cookieStore)
  const profile = await adminService.getProfileById(user.id).catch(() => null)
  const role = profile?.role as UserRole | undefined
  if (!role || !isManagerOrAbove(role)) {
    return NextResponse.json(
      {
        error:
          "Insufficient permissions. Sending invoices via WhatsApp requires MANAGER or above.",
      },
      { status: 403 },
    )
  }

  /* ─── 0a. Per-user rate limit ─── */
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

  /* ─── 1. Parse + validate body ─── */
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

  const mode: "direct" | "template" =
    parsed.mode === "template" ? "template" : "direct"

  /* ─── 2. Load invoice (RLS-checked via cookie-bound Supabase) ─── */
  const invoiceService = createInvoiceServerService(cookieStore)
  const invoice = (await invoiceService
    .getInvoiceById(parsed.invoiceId)
    .catch(() => null)) as InvoiceLike | null

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  /* ─── 3a. Build allow-list of legitimate phones for this invoice ───
   *
   * The "expected" phones are the customer-of-record phone (from the
   * customers table) plus the consignor / consignee phones embedded in
   * the invoice's notes JSON. body.phone is only honored if it normalises
   * to one of these — otherwise the caller must explicitly opt in via
   * `overridePhone: true` AND hold role >= ADMIN.
   *
   * ⚠ TRUST BOUNDARY:
   *   - `customer.phone` comes from the `customers` table, which only
   *     ADMIN/MANAGER roles can write to. Trustworthy.
   *   - `notes.consignor.phone` / `notes.consignee.phone` are written
   *     into `notes` JSON by ANY operator that creates an invoice
   *     (including the same MANAGER calling this endpoint).
   *
   * That means a manager who creates an invoice can effectively
   * pre-load the allow-list with whatever number they want, then send
   * to it without using the override. This is much narrower than the
   * original IDOR (it's a manager, not anonymous; the phone is on a
   * real invoice they authored), but real. Do NOT widen the allow-list
   * to include other operator-written fields without re-evaluating
   * this trust boundary. If we ever want to send to an arbitrary
   * number, USE the override path — that's why it exists.
   */
  const customerService = createCustomerServerService(cookieStore)
  const customer = invoice.customerId
    ? await customerService.getCustomerById(invoice.customerId).catch(() => null)
    : null

  const notesPhones = extractPhonesFromInvoice(invoice)
  const expectedRawPhones: string[] = []
  if (customer?.phone) expectedRawPhones.push(customer.phone)
  if (notesPhones.consignor) expectedRawPhones.push(notesPhones.consignor)
  if (notesPhones.consignee) expectedRawPhones.push(notesPhones.consignee)

  const expectedNormalised = new Set(
    expectedRawPhones
      .map((p) => normalizePhone(p))
      .filter((p): p is string => Boolean(p)),
  )

  /**
   * **Duplicate-phone shortcut.** When the consignor and consignee are
   * recorded with the same phone (a common case — same operator on both
   * legs, family-run businesses, point-to-point B2B routes), there's only
   * one possible destination. Treat it as a high-confidence single
   * recipient — no confirmation prompt, no override required even if the
   * caller omits `body.phone`. The trust bound is unchanged (still a
   * MANAGER-authored invoice), but the ambiguity that would normally
   * warrant a UI confirm step doesn't exist.
   */
  const consignorPhone = notesPhones.consignor ? normalizePhone(notesPhones.consignor) : null
  const consigneePhone = notesPhones.consignee ? normalizePhone(notesPhones.consignee) : null
  const isDuplicateContact =
    consignorPhone !== null &&
    consigneePhone !== null &&
    consignorPhone === consigneePhone

  /* ─── 3b. Resolve phone — explicit body.phone (with IDOR guard) > customer > notes ─── */
  let rawPhone: string | null = null
  let usingOverride = false

  if (parsed.phone) {
    const normalisedRequest = normalizePhone(parsed.phone)
    if (!normalisedRequest) {
      return NextResponse.json(
        { error: `Phone "${parsed.phone}" could not be normalised to E.164` },
        { status: 400 },
      )
    }
    if (expectedNormalised.has(normalisedRequest)) {
      // body.phone matches an on-record phone — fine, no override needed.
      rawPhone = parsed.phone
    } else {
      // The supplied phone is unrelated to any phone tied to this invoice.
      // Block unless the caller is explicitly invoking the override AND
      // holds a higher role than the baseline send permission.
      if (!parsed.overridePhone) {
        return NextResponse.json(
          {
            error:
              "The provided phone does not match the invoice's customer or " +
              "shipment contacts. To send to a different number, set " +
              "`overridePhone: true` (requires ADMIN role).",
          },
          { status: 403 },
        )
      }
      if (!isAdminOrAbove(role)) {
        return NextResponse.json(
          {
            error:
              "Override-phone requires ADMIN role or above. The supplied " +
              "phone is not on record for this invoice.",
          },
          { status: 403 },
        )
      }
      rawPhone = parsed.phone
      usingOverride = true
    }
  } else if (isDuplicateContact && notesPhones.consignor) {
    // Consignor === consignee — unambiguous destination. Fast-path skips
    // any UI-side confirmation gate.
    rawPhone = notesPhones.consignor
  } else if (customer?.phone) {
    rawPhone = customer.phone
  } else if (notesPhones.consignor) {
    rawPhone = notesPhones.consignor
  } else if (notesPhones.consignee) {
    rawPhone = notesPhones.consignee
  }

  if (!rawPhone) {
    return NextResponse.json(
      { error: "No phone number found for this invoice" },
      { status: 422 },
    )
  }

  const phone = normalizePhone(rawPhone)
  if (!phone) {
    return NextResponse.json(
      { error: `Phone "${rawPhone}" could not be normalised to E.164` },
      { status: 400 },
    )
  }

  /* ─── 4. Build the WhatsApp service from env ─── */
  let svc
  try {
    svc = createWhatsAppServiceFromEnv()
  } catch (err) {
    return NextResponse.json(
      {
        error: `WhatsApp not configured: ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      { status: 503 },
    )
  }

  /* ─── 5. Auto-generate signed PDF URL when template mode + no media URL ───
   *
   * If the caller is sending a template and didn't supply a
   * `templateMediaUrl`, build one ourselves: render the invoice as a PDF
   * via `/api/public/invoice-pdf` and pass that signed URL through to
   * WhatsApp. This is the production path for templates whose HEADER is
   * `DOCUMENT` — the dashboard owns the PDF generation rather than
   * asking the operator to host the file somewhere else.
   *
   * Skipped silently if the signing secret isn't configured — the
   * dialog's manual URL field still works as a fallback.                */
  let resolvedMediaUrl = parsed.mode === "template" ? parsed.templateMediaUrl : undefined
  let resolvedMediaFilename = parsed.mode === "template" ? parsed.templateMediaFilename : undefined
  let resolvedMediaKind = parsed.mode === "template" ? parsed.templateMediaKind : undefined

  if (parsed.mode === "template" && !resolvedMediaUrl) {
    const origin = resolvePublicOrigin(req)
    if (origin && process.env.INVOICE_PDF_SIGNING_SECRET) {
      try {
        // Tracking URL — encoded in the QR rendered inside the PDF.
        // Falls back to the dashboard origin alone when there's no AWB
        // (the public /track/[awb] page handles the bare-origin case).
        const trackingUrl = invoice.awbNumber
          ? `${origin}/track/${encodeURIComponent(invoice.awbNumber)}`
          : `${origin}/track`

        const pdfData = {
          ...buildPdfData(invoice, customer),
          trackingUrl,
        }
        resolvedMediaUrl = buildSignedInvoicePdfUrl({ origin, data: pdfData })
        resolvedMediaKind = "document"
        resolvedMediaFilename = `TAC-Invoice-${invoice.invoiceNumber}.pdf`
        if (process.env.NODE_ENV !== "production") {
          console.log(
            `[whatsapp] auto-generated signed PDF URL for ${invoice.invoiceNumber} ` +
              `(${resolvedMediaUrl.length} chars, tracking ${trackingUrl})`,
          )
        }
      } catch (err) {
        console.warn(
          `[whatsapp] could not auto-generate signed PDF URL: ${
            err instanceof Error ? err.message : String(err)
          }`,
        )
      }
    }
  }

  /* ─── 6. Dispatch — direct or template ─── */
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[whatsapp] sending invoice ${invoice.invoiceNumber} → ${phone} ` +
        `(mode=${mode}, by=${user.id}` +
        `${usingOverride ? ", OVERRIDE_PHONE" : ""}` +
        `${isDuplicateContact ? ", DUPLICATE_CONTACT_FAST_PATH" : ""})`,
    )
  }

  const result =
    parsed.mode === "template"
      ? await svc.sendTemplate({
          phone,
          templateName: parsed.templateName,
          templateLanguage: parsed.templateLanguage,
          components: buildTemplateComponents({
            params: parsed.templateParams,
            mediaUrl: resolvedMediaUrl,
            mediaFilename: resolvedMediaFilename,
            mediaKind: resolvedMediaKind,
            invoice,
          }),
        })
      : await svc.sendMessage({
          phone,
          message: buildInvoiceMessage(invoice),
          header: `TAC Express · ${invoice.invoiceNumber}`,
          footer: "Reply to this message for queries.",
        })

  if (!result.ok) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[whatsapp] send failed for ${invoice.invoiceNumber} → ${phone} (mode=${mode}):`,
        {
          error: result.error,
          status: result.status,
          attempted: result.attemptedFormats,
          rawResponse: result.rawResponse?.slice(0, 200),
        },
      )
    }
    return NextResponse.json(
      {
        error: result.error,
        status: result.status,
        rawResponse: result.rawResponse,
        attemptedFormats: result.attemptedFormats,
        mode,
      },
      { status: 502 },
    )
  }

  /* ─── 6. Extract WAMID + treat absent WAMID as a silent rejection ───
   *
   * WhatsApp returns 200 OK with no `wamid` when the message is
   * silently rejected (most commonly: template parameter mismatch, or
   * recipient outside the 24h window for direct sends). Surfacing this
   * as success would give operators false positives and suppress
   * retries — fail the request explicitly.
   */
  const wamid = extractWamid(result.data)
  if (!wamid) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[whatsapp] send returned no WAMID for ${invoice.invoiceNumber} → ${phone} (mode=${mode}) — treating as silent rejection`,
        { data: result.data },
      )
    }
    return NextResponse.json(
      {
        error:
          "WhatsApp accepted the request but did not return a message ID — the message was silently rejected. " +
          "Common causes: template parameter mismatch, recipient outside the 24h customer-service window (direct mode), or template HEADER format mismatch.",
        // The success-shape result has no `rawResponse` field — surface
        // the raw `data` instead so operators can diagnose what WPBox
        // actually returned.
        rawResponse:
          typeof result.data === "string"
            ? result.data
            : JSON.stringify(result.data ?? null),
        mode,
      },
      { status: 502 },
    )
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[whatsapp] send OK for ${invoice.invoiceNumber} → ${phone} (mode=${mode})`,
      { wamid },
    )
  }

  return NextResponse.json({
    ok: true,
    phone,
    invoiceNumber: invoice.invoiceNumber,
    mode,
    wamid,
    response: typeof result.data === "object" ? result.data : undefined,
  })
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  Helpers                                                                  */
/* ════════════════════════════════════════════════════════════════════════ */

/* `resolvePublicOrigin` and `isPubliclyReachableHttpUrl` are shared
 * with `apps/dashboard/app/api/whatsapp/test/route.ts` via
 * `@/lib/public-origin` so the dialog's "hide manual URL field" flag
 * matches the send route's auto-gen capability exactly. */

/**
 * Build the compact `InvoicePdfData` payload from the loaded invoice
 * (RLS-checked) and customer (RLS-checked) records. The notes JSON is
 * parsed once for billing-address surfacing.
 */
function buildPdfData(
  invoice: InvoiceLike,
  customer: { phone?: string | null; address?: unknown } | null,
): InvoicePdfData {
  let billingAddress: string | undefined
  // Prefer a structured billingAddress out of the notes JSON the wizard
  // persists; fall back to a stringified customer.address when absent.
  if (invoice.notes && invoice.notes.length <= MAX_NOTES_BYTES) {
    try {
      const trimmed = invoice.notes.trim()
      if (trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed) as { billingAddress?: unknown }
        if (typeof parsed.billingAddress === "string" && parsed.billingAddress) {
          billingAddress = parsed.billingAddress
        }
      }
    } catch {
      /* noop */
    }
  }
  if (!billingAddress && customer?.address) {
    if (typeof customer.address === "string") {
      billingAddress = customer.address
    } else if (typeof customer.address === "object") {
      billingAddress = JSON.stringify(customer.address)
    }
  }

  return {
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    createdAt: invoice.createdAt,
    dueDate: invoice.dueDate ?? null,
    paymentMode: invoice.paymentMode,
    awbNumber: invoice.awbNumber ?? null,
    customerName: invoice.customerName,
    customerGstin: invoice.customerGstin ?? null,
    customerPhone: customer?.phone ?? null,
    customerAddress: billingAddress ?? null,
    baseFreight: invoice.baseFreight,
    docketCharge: invoice.docketCharge,
    pickupCharge: invoice.pickupCharge ?? 0,
    packingCharge: invoice.packingCharge ?? 0,
    fuelSurcharge: invoice.fuelSurcharge,
    handlingFee: invoice.handlingFee,
    insurance: invoice.insurance,
    discount: invoice.discount,
    cgst: invoice.tax?.cgst ?? 0,
    sgst: invoice.tax?.sgst ?? 0,
    igst: invoice.tax?.igst ?? 0,
    totalAmount: invoice.totalAmount,
    advancePaid: invoice.advancePaid,
    balance: invoice.balance,
    notes: invoice.notes ?? null,
  }
}

/**
 * Returns `{ consignor, consignee }` phones from the invoice notes JSON.
 * Either or both may be `null`. Used to build the per-invoice phone
 * allow-list and to detect the "consignor === consignee" duplicate-
 * contact shortcut.
 *
 * Returning a structured object (rather than a tuple-array) eliminates
 * a positional bug: an earlier dense-array shape silently lost the
 * consignor/consignee role distinction when consignor was unset and
 * consignee was set — the consignee would land at index 0 and be
 * treated as the consignor by the duplicate-contact gate.
 *
 * Trust note: the same MANAGER who authored the invoice authored these
 * fields, so the allow-list bound is the same as `customer.phone`.
 */
interface InvoiceNotesPhones {
  consignor: string | null
  consignee: string | null
}

function extractPhonesFromInvoice(invoice: InvoiceLike): InvoiceNotesPhones {
  const empty: InvoiceNotesPhones = { consignor: null, consignee: null }
  if (!invoice.notes) return empty
  if (invoice.notes.length > MAX_NOTES_BYTES) return empty
  const trimmed = invoice.notes.trim()
  if (!trimmed.startsWith("{")) return empty
  try {
    const parsed = JSON.parse(trimmed) as {
      consignor?: { phone?: string }
      consignee?: { phone?: string }
    }
    return {
      consignor: parsed.consignor?.phone ? String(parsed.consignor.phone) : null,
      consignee: parsed.consignee?.phone ? String(parsed.consignee.phone) : null,
    }
  } catch {
    return empty
  }
}

/**
 * Compose the free-form message body for direct-mode delivery.
 * Uses WhatsApp's markdown subset (`*bold*`) for label emphasis.
 */
function buildInvoiceMessage(invoice: InvoiceLike): string {
  const formatINR = (n: number) =>
    `₹${Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const lines: Array<string | null> = [
    `Hello ${invoice.customerName || "customer"},`,
    "",
    "Your tax invoice has been generated.",
    "",
    `*Invoice:* ${invoice.invoiceNumber}`,
    invoice.awbNumber ? `*AWB:* ${invoice.awbNumber}` : null,
    `*Amount:* ${formatINR(invoice.totalAmount)}`,
    `*Balance Due:* ${formatINR(invoice.balance)}`,
    invoice.dueDate
      ? `*Due Date:* ${new Date(invoice.dueDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`
      : null,
    "",
    "Thank you for choosing TAC Express.",
  ]

  return lines.filter((l): l is string => l !== null).join("\n")
}

/**
 * Translate the dialog's flat template inputs into the nested
 * `components` array WPBox expects.
 *
 * Output shape (in order):
 *   1. HEADER (optional — only when `mediaUrl` is provided; matches
 *      the structure required by templates whose HEADER is DOCUMENT,
 *      IMAGE, or VIDEO).
 *   2. BODY (always — N text parameters matching the template's
 *      `{{1}}…{{N}}` placeholders).
 *
 * Falls back to sensible defaults from the invoice when no params were
 * supplied (lets a user fire-and-forget against any 3-param template).
 */
function buildTemplateComponents(input: {
  params: Array<{ text: string }> | undefined
  mediaUrl?: string
  mediaFilename?: string
  mediaKind?: "document" | "image" | "video"
  invoice: InvoiceLike
}): WhatsAppTemplateComponent[] {
  const formatINR = (n: number) =>
    `₹${Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const effectiveParams =
    input.params && input.params.length > 0
      ? input.params
      : [
          { text: input.invoice.customerName || "Customer" },
          { text: input.invoice.invoiceNumber },
          { text: formatINR(input.invoice.totalAmount) },
        ]

  const components: WhatsAppTemplateComponent[] = []

  if (input.mediaUrl) {
    const kind = input.mediaKind ?? "document"
    if (kind === "document") {
      components.push(
        buildHeaderMediaComponent({
          kind: "document",
          link: input.mediaUrl,
          filename:
            input.mediaFilename ?? `TAC-Invoice-${input.invoice.invoiceNumber}.pdf`,
        }),
      )
    } else if (kind === "image") {
      components.push(buildHeaderMediaComponent({ kind: "image", link: input.mediaUrl }))
    } else {
      components.push(buildHeaderMediaComponent({ kind: "video", link: input.mediaUrl }))
    }
  }

  components.push({
    type: "BODY",
    parameters: effectiveParams.map((p) => ({
      type: "text" as const,
      text: p.text,
    })),
  })

  return components
}

/**
 * Pull the WAMID (WhatsApp message ID) out of the WPBox response.
 * Different endpoints nest it differently — check the common shapes.
 */
function extractWamid(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined
  const obj = data as Record<string, unknown>
  if (typeof obj.message_wamid === "string") return obj.message_wamid
  if (typeof obj.wamid === "string") return obj.wamid
  if (
    obj.data &&
    typeof obj.data === "object" &&
    typeof (obj.data as Record<string, unknown>).message_wamid === "string"
  ) {
    return (obj.data as Record<string, unknown>).message_wamid as string
  }
  return undefined
}
