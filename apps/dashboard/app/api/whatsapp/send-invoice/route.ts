import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

import { createInvoiceServerService } from "@workspace/services/server"
import {
  createWhatsAppServiceFromEnv,
  normalizePhone,
  type WhatsAppTemplateComponent,
} from "@workspace/services/whatsapp.service"

/**
 * POST /api/whatsapp/send-invoice
 *
 * Sends a WhatsApp summary message for an invoice to the customer.
 *
 * Body:
 *   {
 *     invoiceId: string,                  // required
 *     phone?:    string,                  // optional override
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

interface RequestBody {
  invoiceId?: string
  phone?: string
  mode?: "direct" | "template"
  templateName?: string
  templateLanguage?: string
  templateParams?: Array<{ text: string }>
}

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

export async function POST(req: NextRequest) {
  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.invoiceId || typeof body.invoiceId !== "string") {
    return NextResponse.json({ error: "invoiceId is required" }, { status: 400 })
  }

  const mode: "direct" | "template" = body.mode === "template" ? "template" : "direct"

  /* Validate template fields when in template mode */
  if (mode === "template") {
    if (!body.templateName) {
      return NextResponse.json(
        { error: "templateName is required for template mode" },
        { status: 400 }
      )
    }
    if (!body.templateLanguage) {
      return NextResponse.json(
        { error: "templateLanguage is required for template mode" },
        { status: 400 }
      )
    }
  }

  /* ─── 1. Load invoice (RLS-checked via cookie-bound Supabase) ─── */
  const cookieStore = await cookies()
  const invoiceService = createInvoiceServerService(cookieStore)
  const invoice = (await invoiceService
    .getInvoiceById(body.invoiceId)
    .catch(() => null)) as InvoiceLike | null

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  /* ─── 2. Resolve phone — override > consignor > consignee ─── */
  const rawPhone = body.phone ?? extractPhoneFromInvoice(invoice)
  if (!rawPhone) {
    return NextResponse.json(
      { error: "No phone number found for this invoice" },
      { status: 422 }
    )
  }

  const phone = normalizePhone(rawPhone)
  if (!phone) {
    return NextResponse.json(
      { error: `Phone "${rawPhone}" could not be normalized to E.164` },
      { status: 400 }
    )
  }

  /* ─── 3. Build the WhatsApp service from env ─── */
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
      { status: 503 }
    )
  }

  /* ─── 4. Dispatch — direct or template ─── */
  console.log(
    `[whatsapp] sending invoice ${invoice.invoiceNumber} → ${phone} (mode=${mode})`
  )

  const result =
    mode === "template"
      ? await svc.sendTemplate({
          phone,
          templateName: body.templateName!,
          templateLanguage: body.templateLanguage!,
          components: buildTemplateComponents(body.templateParams, invoice),
        })
      : await svc.sendMessage({
          phone,
          message: buildInvoiceMessage(invoice),
          header: `TAC Express · ${invoice.invoiceNumber}`,
          footer: "Reply to this message for queries.",
        })

  if (!result.ok) {
    console.error(
      `[whatsapp] send failed for ${invoice.invoiceNumber} → ${phone} (mode=${mode}):`,
      {
        error: result.error,
        status: result.status,
        attempted: result.attemptedFormats,
        rawResponse: result.rawResponse?.slice(0, 200),
      }
    )
    return NextResponse.json(
      {
        error: result.error,
        status: result.status,
        rawResponse: result.rawResponse,
        attemptedFormats: result.attemptedFormats,
        mode,
      },
      { status: 502 }
    )
  }

  /* ─── 5. Extract WAMID for success surfacing ─── */
  const wamid = extractWamid(result.data)

  console.log(
    `[whatsapp] send OK for ${invoice.invoiceNumber} → ${phone} (mode=${mode})`,
    { wamid }
  )

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
  invoice: InvoiceLike
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
