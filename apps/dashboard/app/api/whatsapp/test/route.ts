import { NextResponse, type NextRequest } from "next/server"

import { createWhatsAppServiceFromEnv } from "@workspace/services/whatsapp.service"

/**
 * GET /api/whatsapp/test
 *
 * Verifies the WPBox configuration AND fetches the list of approved
 * templates the user can pick from when sending invoices.
 *
 * Returns each template's `name`, `language`, `status`, `body`, and —
 * critically — `headerFormat` (DOCUMENT / IMAGE / VIDEO / undefined).
 * The dialog uses `headerFormat` to decide whether to require a media
 * URL field. Sending a template with HEADER but omitting the media
 * causes WhatsApp to silently reject the message (returns null WAMID).
 */
export const dynamic = "force-dynamic"

interface TemplateSummary {
  name: string
  language: string
  status?: string
  body?: string
  /** "DOCUMENT" | "IMAGE" | "VIDEO" | "TEXT" | undefined */
  headerFormat?: string
}

export async function GET(req: NextRequest) {
  /* ── 0. PDF auto-gen availability ──
   *
   * The dialog uses this flag to hide the manual "Document URL" field
   * when the server can produce signed `/api/public/invoice-pdf` URLs
   * itself. Two preconditions:
   *   - `INVOICE_PDF_SIGNING_SECRET` is set (server can HMAC-sign).
   *   - The dashboard origin is publicly reachable (WhatsApp can fetch it).
   *
   * `localhost` / `127.0.0.1` resolve to "no" because Meta's servers
   * can't reach the dev machine. Tunneling tools (ngrok, Cloudflare
   * Tunnel) flip this to true once `NEXT_PUBLIC_DASHBOARD_URL` is set
   * to the tunneled origin.
   */
  const pdfAutoGenAvailable = checkPdfAutoGenAvailable(req)

  /* ── 1. Config check ── */
  let svc
  try {
    svc = createWhatsAppServiceFromEnv()
  } catch (err) {
    return NextResponse.json({
      ok: false,
      configured: false,
      connected: false,
      pdfAutoGenAvailable,
      error: err instanceof Error ? err.message : String(err),
    })
  }

  /* ── 2. Connectivity + auth check + fetch template catalog ── */
  const result = await svc.getTemplates()
  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      configured: true,
      connected: false,
      pdfAutoGenAvailable,
      error: result.error,
      rawResponse: result.rawResponse,
      status: result.status,
    })
  }

  /* ── 3. Extract template list (best-effort across response shapes) ── */
  const rawTemplates = extractTemplatesArray(result.data)
  const templates: TemplateSummary[] = rawTemplates
    .map(normalizeTemplate)
    .filter((t): t is TemplateSummary => t !== null)

  return NextResponse.json({
    ok: true,
    configured: true,
    connected: true,
    pdfAutoGenAvailable,
    templates,
  })
}

/**
 * Returns true when the server is able to mint a signed PDF URL that
 * WhatsApp can reach. Two preconditions:
 *   1. `INVOICE_PDF_SIGNING_SECRET` is set (HMAC signing works).
 *   2. The resolved public origin is not `localhost` / `127.0.0.1`.
 *
 * Mirrors the logic in `apps/dashboard/app/api/whatsapp/send-invoice/route.ts`'s
 * `resolvePublicOrigin` so the dialog's "URL needed?" gate matches the
 * server's "auto-inject?" decision exactly.
 */
function checkPdfAutoGenAvailable(req: NextRequest): boolean {
  if (!process.env.INVOICE_PDF_SIGNING_SECRET) return false

  const explicit = process.env.NEXT_PUBLIC_DASHBOARD_URL?.trim()
  if (explicit) {
    return !/localhost|127\.0\.0\.1/.test(explicit)
  }

  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host")
  if (!host) return false
  return !/localhost|127\.0\.0\.1/.test(host)
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  Helpers — defensive parsers, since the WPBox response shape varies      */
/* ════════════════════════════════════════════════════════════════════════ */

function extractTemplatesArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.templates)) return obj.templates
    if (Array.isArray(obj.data)) return obj.data
    if (Array.isArray(obj.results)) return obj.results
  }
  return []
}

interface TemplateComponentLike {
  type?: unknown
  format?: unknown
  text?: unknown
  body?: unknown
  content?: unknown
}

/**
 * Normalize a single template entry to the lean shape the dialog needs.
 *
 * WPBox returns `components` as a JSON STRING (escaped JSON). We unwrap
 * it once before walking, then look for:
 *   - HEADER component → expose its `format` so the dialog can decide
 *     whether to require a media URL
 *   - BODY component → expose its `text` so the dialog can count `{{N}}`
 *     placeholders for parameter prefilling
 */
function normalizeTemplate(t: unknown): TemplateSummary | null {
  if (!t || typeof t !== "object") return null
  const obj = t as Record<string, unknown>

  const name = pickString(obj, ["name", "template_name"])
  if (!name) return null

  const language =
    pickString(obj, ["language", "template_language", "lang", "locale"]) ?? "en"
  const status = pickString(obj, ["status", "template_status"])

  // First: try the flat top-level shapes some APIs use.
  let body = pickString(obj, ["body", "body_text", "text", "content"])
  let headerFormat: string | undefined

  // Then: parse `components`. WPBox returns this as either an array or a
  // JSON-encoded string, so handle both.
  const componentsField = obj.components
  let components: TemplateComponentLike[] = []
  if (Array.isArray(componentsField)) {
    components = componentsField as TemplateComponentLike[]
  } else if (typeof componentsField === "string") {
    try {
      const parsed = JSON.parse(componentsField)
      if (Array.isArray(parsed)) components = parsed as TemplateComponentLike[]
    } catch {
      /* malformed JSON — skip */
    }
  }

  for (const c of components) {
    if (!c || typeof c !== "object") continue
    const cType = String(c.type ?? "").toUpperCase()
    if (cType === "HEADER") {
      const fmt = c.format
      if (typeof fmt === "string" && fmt.length > 0) {
        headerFormat = fmt.toUpperCase()
      }
    }
    if (cType === "BODY" && !body) {
      const t = c.text ?? c.body ?? c.content
      if (typeof t === "string" && t.length > 0) body = t
    }
  }

  return { name, language, status, body, headerFormat }
}

function pickString(
  obj: Record<string, unknown>,
  keys: readonly string[]
): string | undefined {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === "string" && value.length > 0) return value
  }
  return undefined
}
