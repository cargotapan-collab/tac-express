import { NextResponse } from "next/server"

import { createWhatsAppServiceFromEnv } from "@workspace/services/whatsapp.service"

/**
 * GET /api/whatsapp/test
 *
 * Verifies the WPBox configuration AND fetches the list of approved
 * templates the user can pick from when sending invoices.
 *
 * The dialog uses this to:
 *   - Show a status pill BEFORE the user clicks Send
 *   - Populate the template dropdown when "Send as template" is selected
 *
 * Response shape:
 *   { ok, configured, connected, error?, templates? }
 *
 * `templates` is an array of `{ name, language, status?, body? }` objects
 * — best-effort extraction since WPBox's getTemplates response shape isn't
 * fully documented. We pass through whatever is recognizably present.
 */
export const dynamic = "force-dynamic"

interface TemplateSummary {
  name: string
  language: string
  status?: string
  body?: string
}

export async function GET() {
  /* ── 1. Config check ── */
  let svc
  try {
    svc = createWhatsAppServiceFromEnv()
  } catch (err) {
    return NextResponse.json({
      ok: false,
      configured: false,
      connected: false,
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
    templates,
  })
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

/**
 * Normalize a single template entry to the lean shape the dialog needs.
 * Different WhatsApp tooling uses slightly different keys; we look for
 * any of the common ones.
 */
function normalizeTemplate(t: unknown): TemplateSummary | null {
  if (!t || typeof t !== "object") return null
  const obj = t as Record<string, unknown>

  const name = pickString(obj, ["name", "template_name"])
  if (!name) return null

  const language =
    pickString(obj, ["language", "template_language", "lang", "locale"]) ?? "en"
  const status = pickString(obj, ["status", "template_status"])

  /* Body extraction — some APIs flatten the body into `body_text`; others
   * nest it inside a `components` array (as the docs example shows).      */
  let body: string | undefined = pickString(obj, ["body", "body_text", "text", "content"])
  if (!body && Array.isArray(obj.components)) {
    const bodyComp = obj.components.find(
      (c) =>
        c &&
        typeof c === "object" &&
        ((c as Record<string, unknown>).type === "BODY" ||
          (c as Record<string, unknown>).type === "body")
    ) as Record<string, unknown> | undefined
    if (bodyComp) {
      body = pickString(bodyComp, ["text", "body", "content"]) ?? undefined
    }
  }

  return { name, language, status, body }
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
