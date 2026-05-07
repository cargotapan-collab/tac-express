"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/primitives/input"
import { Label } from "@workspace/ui/components/primitives/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/primitives/dialog"
import {
  RiWhatsappLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiLoader4Line,
} from "@workspace/ui/icons"

export type DeliveryMode = "direct" | "template"

export interface WhatsAppTemplateOption {
  name: string
  language: string
  status?: string
  body?: string
}

export interface SendWhatsAppValues {
  phone: string
  mode: DeliveryMode
  /** Required when mode === "template" */
  templateName?: string
  templateLanguage?: string
  /** Body parameters in order. */
  templateParams?: Array<{ text: string }>
}

export interface WhatsappTestStatus {
  ok: boolean
  configured: boolean
  connected: boolean
  error?: string
  templates?: WhatsAppTemplateOption[]
}

interface SendWhatsAppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerName: string
  defaultPhone?: string
  invoiceNumber: string
  totalAmount: number
  awbNumber?: string
  onSubmit: (values: SendWhatsAppValues) => Promise<void> | void
  isSubmitting?: boolean
  testStatus?: WhatsappTestStatus
  testLoading?: boolean
  onRetryTest?: () => void
  className?: string
}

/**
 * Confirmation dialog for sending an invoice summary via WhatsApp.
 *
 * ## Two delivery modes
 *
 *   1. **Direct** (default) — uses the free-form `sendmessage` API.
 *      Subject to WhatsApp's **24-hour customer service window**: only
 *      delivers if the recipient has messaged your WhatsApp Business
 *      number in the past 24 hours. WPBox returns "success" + a real
 *      WAMID even when delivery will silently fail — this is a Meta
 *      policy, not a bug. Best for active conversations.
 *
 *   2. **Template** — uses `sendtemplatemessage` with a Meta-approved
 *      template. Delivers anytime, no 24h restriction. The template
 *      must already be approved in your LeminAi dashboard. Parameters
 *      are auto-filled from invoice data; user can override per send.
 *
 * The mode toggle is hidden when no approved templates are available
 * (sender can only do direct in that case).
 */
export function SendWhatsAppDialog({
  open,
  onOpenChange,
  customerName,
  defaultPhone = "",
  invoiceNumber,
  totalAmount,
  awbNumber,
  onSubmit,
  isSubmitting,
  testStatus,
  testLoading,
  onRetryTest,
  className,
}: SendWhatsAppDialogProps) {
  const [phone, setPhone] = React.useState(defaultPhone)
  const [mode, setMode] = React.useState<DeliveryMode>("direct")
  const [templateName, setTemplateName] = React.useState<string>("")
  const [templateParams, setTemplateParams] = React.useState<string[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [errorDetail, setErrorDetail] = React.useState<string | null>(null)
  const [showDetail, setShowDetail] = React.useState(false)

  /* Available approved templates — drives the dropdown + mode availability */
  const templates = testStatus?.templates ?? []
  const hasTemplates = templates.length > 0

  /* When the dialog opens or the default phone changes, reset state.
   * Logged so the browser console shows that the dialog actually mounted. */
  React.useEffect(() => {
    if (open) {
      console.log("[whatsapp:client] dialog opened", {
        customerName,
        invoiceNumber,
        defaultPhone,
      })
      setPhone(defaultPhone)
      setError(null)
      setErrorDetail(null)
      setShowDetail(false)
    } else {
      console.log("[whatsapp:client] dialog closed")
    }
  }, [open, defaultPhone, customerName, invoiceNumber])

  /* When a template is selected, prefill its parameters from invoice
   * data. The parser counts `{{N}}` placeholders in the template body
   * to pick the right number of params. */
  React.useEffect(() => {
    if (!templateName) return
    const tmpl = templates.find((t) => t.name === templateName)
    if (!tmpl) return
    const placeholderCount = countPlaceholders(tmpl.body ?? "")
    const defaults = buildParamDefaults({
      customerName,
      invoiceNumber,
      totalAmount,
      awbNumber,
    })
    const next: string[] = []
    for (let i = 0; i < Math.max(placeholderCount, defaults.length); i++) {
      next.push(defaults[i] ?? "")
    }
    setTemplateParams(next)
  }, [templateName, templates, customerName, invoiceNumber, totalAmount, awbNumber])

  /* When the user enables template mode and templates have arrived,
   * preselect the first one so the dropdown isn't empty. */
  React.useEffect(() => {
    if (mode === "template" && !templateName && templates.length > 0) {
      setTemplateName(templates[0]!.name)
    }
  }, [mode, templates, templateName])

  /* Live preview body — direct mode shows actual message; template
   * mode shows the template body with placeholders resolved. */
  const previewMessage = React.useMemo(() => {
    if (mode === "template") {
      const tmpl = templates.find((t) => t.name === templateName)
      if (!tmpl?.body) return "Template body not available — message will be rendered by WhatsApp."
      return resolvePlaceholders(tmpl.body, templateParams)
    }
    return buildDirectPreview({ customerName, invoiceNumber, totalAmount, awbNumber })
  }, [mode, templates, templateName, templateParams, customerName, invoiceNumber, totalAmount, awbNumber])

  async function handleSubmit() {
    setError(null)
    setErrorDetail(null)
    setShowDetail(false)
    const trimmedPhone = phone.trim()
    if (!trimmedPhone) {
      setError("Phone number is required")
      return
    }
    const digits = trimmedPhone.replace(/\D/g, "")
    if (digits.length < 10) {
      setError("Phone number must include at least 10 digits")
      return
    }
    if (mode === "template" && !templateName) {
      setError("Select a template to send")
      return
    }

    const tmpl = templates.find((t) => t.name === templateName)
    const values: SendWhatsAppValues = {
      phone: trimmedPhone,
      mode,
      ...(mode === "template" && tmpl
        ? {
            templateName: tmpl.name,
            templateLanguage: tmpl.language,
            templateParams: templateParams.map((text) => ({ text })),
          }
        : {}),
    }

    try {
      await onSubmit(values)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      const raw =
        err && typeof err === "object" && "rawResponse" in err
          ? String((err as { rawResponse?: unknown }).rawResponse ?? "")
          : ""
      if (raw) setErrorDetail(raw)
    }
  }

  const sendDisabled =
    isSubmitting ||
    Boolean(testStatus && !testStatus.ok) ||
    Boolean(testLoading) ||
    (mode === "template" && !templateName)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RiWhatsappLine className="h-4 w-4 text-primary" aria-hidden="true" />
            Send invoice via WhatsApp
          </DialogTitle>
          <DialogDescription>
            A summary of invoice {invoiceNumber} will be delivered to the
            customer's WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Pre-flight config / connectivity pill */}
          <ConfigStatusPill
            status={testStatus}
            loading={testLoading}
            onRetry={onRetryTest}
          />

          {/* Mode toggle — only shown when templates are available */}
          {hasTemplates && (
            <ModeToggle mode={mode} onChange={setMode} templateCount={templates.length} />
          )}

          {/* 24-hour policy notice — direct mode only */}
          {mode === "direct" && <Direct24hNotice hasTemplates={hasTemplates} />}

          {/* Recipient name (read-only) */}
          <div className="space-y-1.5">
            <Label className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
              Recipient
            </Label>
            <div className="flex h-9 items-center border border-border bg-muted/40 px-3 font-sans text-sm text-foreground">
              {customerName || "—"}
            </div>
          </div>

          {/* Editable phone */}
          <div className="space-y-1.5">
            <Label
              htmlFor="wa-phone"
              className="font-mono text-2xs uppercase tracking-widest text-muted-foreground"
            >
              WhatsApp number
            </Label>
            <Input
              id="wa-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              autoFocus
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="font-mono"
            />
            <p className="font-sans text-xs text-muted-foreground/80">
              Country code optional — Indian numbers default to +91.
            </p>
          </div>

          {/* Template controls — only in template mode */}
          {mode === "template" && hasTemplates && (
            <TemplateControls
              templates={templates}
              selected={templateName}
              onSelect={setTemplateName}
              params={templateParams}
              onParamChange={(idx, value) =>
                setTemplateParams((prev) => {
                  const next = [...prev]
                  next[idx] = value
                  return next
                })
              }
            />
          )}

          {/* Live message preview */}
          <div className="space-y-1.5">
            <Label className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
              Preview
            </Label>
            <pre className="border border-border bg-muted/30 px-3 py-2 font-sans text-xs leading-snug text-foreground/90 whitespace-pre-wrap break-words">
              {previewMessage}
            </pre>
          </div>

          {/* Inline error with optional raw-response expandable */}
          {error && (
            <div className="space-y-1.5 border border-destructive/40 bg-destructive/5 p-3">
              <p className="font-sans text-xs font-semibold text-destructive break-words">
                {error}
              </p>
              {errorDetail && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDetail((v) => !v)}
                    className="font-mono text-2xs uppercase tracking-widest text-destructive/80 hover:text-destructive underline-offset-2 hover:underline"
                  >
                    {showDetail ? "Hide raw response" : "View raw WPBox response"}
                  </button>
                  {showDetail && (
                    <pre className="mt-1 max-h-32 overflow-auto border border-destructive/20 bg-background/60 px-2 py-1.5 font-mono text-2xs leading-snug text-foreground/80 whitespace-pre-wrap break-all">
                      {errorDetail}
                    </pre>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={sendDisabled}
            className="font-mono text-xs uppercase tracking-wider"
          >
            <RiWhatsappLine className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="ml-1.5">
              {isSubmitting
                ? "Sending…"
                : mode === "template"
                  ? "Send template"
                  : "Send WhatsApp"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  Sub-components                                                           */
/* ════════════════════════════════════════════════════════════════════════ */

function ConfigStatusPill({
  status,
  loading,
  onRetry,
}: {
  status: WhatsappTestStatus | undefined
  loading: boolean | undefined
  onRetry?: () => void
}) {
  if (loading || !status) {
    return (
      <div className="flex items-center gap-2 border border-border/60 bg-muted/30 px-3 py-2">
        <RiLoader4Line
          className="h-3.5 w-3.5 text-muted-foreground animate-spin"
          aria-hidden="true"
        />
        <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
          Verifying WPBox configuration…
        </p>
      </div>
    )
  }

  if (status.ok) {
    return (
      <div className="flex items-center gap-2 border border-primary/40 bg-primary/5 px-3 py-2">
        <RiCheckLine className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <p className="font-mono text-2xs uppercase tracking-widest text-primary">
          WhatsApp connected
          {status.templates && status.templates.length > 0
            ? ` · ${status.templates.length} template${status.templates.length === 1 ? "" : "s"}`
            : " · no templates"}
        </p>
      </div>
    )
  }

  const headline = !status.configured
    ? "WhatsApp not configured"
    : "WhatsApp connection failed"

  return (
    <div className="space-y-1 border border-destructive/40 bg-destructive/5 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <RiErrorWarningLine
            className="h-3.5 w-3.5 text-destructive shrink-0"
            aria-hidden="true"
          />
          <p className="font-mono text-2xs uppercase tracking-widest text-destructive">
            {headline}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="font-mono text-2xs uppercase tracking-widest text-destructive/80 hover:text-destructive underline-offset-2 hover:underline shrink-0"
          >
            Retry
          </button>
        )}
      </div>
      {status.error && (
        <p className="font-mono text-2xs leading-snug text-destructive/80 break-words pl-5">
          {status.error}
        </p>
      )}
      {!status.configured && (
        <p className="font-sans text-2xs leading-snug text-muted-foreground pl-5">
          Set <code className="font-mono">WPBOX_API_TOKEN</code> and{" "}
          <code className="font-mono">WPBOX_USER_ID</code> in{" "}
          <code className="font-mono">apps/dashboard/.env.local</code>, then
          restart the dev server.
        </p>
      )}
    </div>
  )
}

function ModeToggle({
  mode,
  onChange,
  templateCount,
}: {
  mode: DeliveryMode
  onChange: (mode: DeliveryMode) => void
  templateCount: number
}) {
  const opts: Array<{ value: DeliveryMode; label: string; sub: string }> = [
    { value: "direct", label: "Direct", sub: "free-form · 24h limit" },
    {
      value: "template",
      label: "Template",
      sub: `pre-approved · always delivers · ${templateCount} avail.`,
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-2">
      {opts.map((opt) => {
        const active = mode === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col items-start gap-0.5 border px-3 py-2 text-left transition-colors",
              active
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <span
              className={cn(
                "font-mono text-2xs uppercase tracking-widest",
                active ? "text-primary" : "text-foreground"
              )}
            >
              {opt.label}
            </span>
            <span className="font-sans text-2xs text-muted-foreground leading-tight">
              {opt.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function Direct24hNotice({ hasTemplates }: { hasTemplates: boolean }) {
  return (
    <div className="border border-amber-500/40 bg-amber-500/5 px-3 py-2 space-y-1">
      <div className="flex items-center gap-2">
        <RiErrorWarningLine
          className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 shrink-0"
          aria-hidden="true"
        />
        <p className="font-mono text-2xs uppercase tracking-widest text-amber-700 dark:text-amber-400">
          24-hour delivery window
        </p>
      </div>
      <p className="font-sans text-2xs leading-snug text-muted-foreground pl-5">
        WhatsApp Business policy: free-form messages only deliver if the
        recipient has messaged your WhatsApp Business number in the past
        24 hours. The API may report success even when delivery will
        silently fail.
        {hasTemplates && " For cold contacts, switch to Template mode."}
      </p>
    </div>
  )
}

function TemplateControls({
  templates,
  selected,
  onSelect,
  params,
  onParamChange,
}: {
  templates: WhatsAppTemplateOption[]
  selected: string
  onSelect: (name: string) => void
  params: string[]
  onParamChange: (idx: number, value: string) => void
}) {
  return (
    <div className="space-y-3 border border-border bg-muted/20 p-3">
      <div className="space-y-1.5">
        <Label
          htmlFor="wa-template"
          className="font-mono text-2xs uppercase tracking-widest text-muted-foreground"
        >
          Template
        </Label>
        <select
          id="wa-template"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="h-9 w-full border border-border bg-background px-3 font-sans text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {templates.map((t) => (
            <option key={`${t.name}|${t.language}`} value={t.name}>
              {t.name} ({t.language}
              {t.status ? ` · ${t.status}` : ""})
            </option>
          ))}
        </select>
      </div>

      {params.length > 0 && (
        <div className="space-y-2">
          <Label className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            Parameters · auto-filled from invoice
          </Label>
          <div className="space-y-1.5">
            {params.map((value, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-mono text-2xs text-muted-foreground/70 w-10 shrink-0">
                  {`{{${idx + 1}}}`}
                </span>
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => onParamChange(idx, e.target.value)}
                  className="font-sans text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  Helpers                                                                  */
/* ════════════════════════════════════════════════════════════════════════ */

/** Format an INR amount the same way the route handler does. */
function formatINR(n: number): string {
  return `₹${Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function buildDirectPreview(input: {
  customerName: string
  invoiceNumber: string
  totalAmount: number
  awbNumber?: string
}): string {
  const lines: Array<string | null> = [
    `Hello ${input.customerName || "customer"},`,
    "",
    "Your tax invoice has been generated.",
    "",
    `*Invoice:* ${input.invoiceNumber}`,
    input.awbNumber ? `*AWB:* ${input.awbNumber}` : null,
    `*Amount:* ${formatINR(input.totalAmount)}`,
    "",
    "Thank you for choosing TAC Express.",
  ]
  return lines.filter((l): l is string => l !== null).join("\n")
}

/** Default param order: name, invoice #, amount, AWB. Trimmed by template needs. */
function buildParamDefaults(input: {
  customerName: string
  invoiceNumber: string
  totalAmount: number
  awbNumber?: string
}): string[] {
  return [
    input.customerName || "Customer",
    input.invoiceNumber,
    formatINR(input.totalAmount),
    input.awbNumber ?? "",
  ]
}

function countPlaceholders(body: string): number {
  const matches = body.match(/\{\{\s*\d+\s*\}\}/g)
  return matches ? matches.length : 0
}

function resolvePlaceholders(body: string, params: string[]): string {
  return body.replace(/\{\{\s*(\d+)\s*\}\}/g, (_match, idx) => {
    const i = parseInt(String(idx), 10) - 1
    return params[i] ?? `{{${idx}}}`
  })
}
