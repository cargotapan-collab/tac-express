import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { getServerAuth } from "@workspace/auth/server"
import { isManagerOrAbove } from "@workspace/auth/rbac"
import { UserRole } from "@workspace/types"
import { createInvoiceServerService } from "@workspace/services/server"
import {
  createWhatsAppServiceFromEnv,
  normalizePhone,
  type WhatsAppTemplateComponent,
} from "@workspace/services/whatsapp.service"
import { checkWhatsApp } from "@/lib/rate-limit"

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
})

const RequestBodySchema = z.union([DirectModeSchema, TemplateModeSchema])

interface InvoiceLike {
  invoiceNumber: string
  customerName: string
  awbNumber?: string | null
  totalAmount: number
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
  /* ─── 0. Authn + Authz ─── */
  const cookieStore = await cookies()
  const auth = getServerAuth(cookieStore)
  const user = await auth.getUser().catch(() => null)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // user_metadata.role is the canonical place for role per existing usage.
  const role =
    (user.user_metadata?.role as UserRole | undefined) ??
    (user.app_metadata?.role as UserRole | undefined)
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

  /* ─── 3. Resolve phone — override > consignor > consignee ─── */
  const rawPhone = parsed.phone ?? extractPhoneFromInvoice(invoice)
  if (!rawPhone) {
    return NextResponse.json(
      { error: "No phone number found for this invoice" },
      { status: 422 },
    )
  }

  const phone = normalizePhone(rawPhone)
  if (!phone) {
    return NextResponse.json(
      { error: `Phone "${rawPhone}" could not be normalized to E.164` },
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

  /* ─── 5. Dispatch — direct or template ─── */
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[whatsapp] sending invoice ${invoice.invoiceNumber} → ${phone} (mode=${mode}, by=${user.id})`,
    )
  }

  const result =
    parsed.mode === "template"
      ? await svc.sendTemplate({
          phone,
          templateName: parsed.templateName,
          templateLanguage: parsed.templateLanguage,
          components: buildTemplateComponents(parsed.templateParams, invoice),
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

  /* ─── 6. Extract WAMID for success surfacing ─── */
  const wamid = extractWamid(result.data)

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

function extractPhoneFromInvoice(invoice: InvoiceLike): string | null {
  if (!invoice.notes) return null
  // Cap to avoid event-loop block from an oversized notes blob.
  if (invoice.notes.length > MAX_NOTES_BYTES) return null
  const trimmed = invoice.notes.trim()
  if (!trimmed.startsWith("{")) return null
  try {
    const parsed = JSON.parse(trimmed) as {
      consignor?: { phone?: string }
      consignee?: { phone?: string }
    }
    if (parsed.consignor?.phone) return String(parsed.consignor.phone)
    if (parsed.consignee?.phone) return String(parsed.consignee.phone)
  } catch {
    /* fall through */
  }
  return null
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
 * Translate the dialog's flat `templateParams` array into the nested
 * `components` shape WPBox expects:
 *
 *   [{ type: "BODY", parameters: [{ type: "text", text: "..." }, ...] }]
 *
 * Falls back to sensible defaults from the invoice when no params were
 * supplied (lets a user fire-and-forget against any 3-param template).
 */
function buildTemplateComponents(
  params: Array<{ text: string }> | undefined,
  invoice: InvoiceLike,
): WhatsAppTemplateComponent[] {
  const formatINR = (n: number) =>
    `₹${Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const effectiveParams =
    params && params.length > 0
      ? params
      : [
          { text: invoice.customerName || "Customer" },
          { text: invoice.invoiceNumber },
          { text: formatINR(invoice.totalAmount) },
        ]

  return [
    {
      type: "BODY",
      parameters: effectiveParams.map((p) => ({
        type: "text" as const,
        text: p.text,
      })),
    },
  ]
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
