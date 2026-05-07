"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/primitives/dialog"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RiWhatsappLine, RiFileCopyLine, RiCheckLine } from "@workspace/ui/icons"

// ─────────────────────────────────────────────────────────────────────────────
// Phone normalisation — accept any reasonable Indian-number entry, emit a
// digits-only E.164 string (no `+`) ready for the wa.me URL.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strip everything but digits, then ensure a `91` country prefix for any
 * 10-digit Indian mobile. Returns `null` if the input doesn't yield at
 * least 10 trailing digits.
 *
 *   "9876543210"        → "919876543210"
 *   "+91 98765 43210"   → "919876543210"
 *   "0091-98765-43210"  → "919876543210" (drops the leading 00)
 *   "98765"             → null
 */
function normalisePhoneE164IN(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.length < 10) return null
  let trimmed = digits
  // Drop leading 00 international prefix.
  if (trimmed.startsWith("00")) trimmed = trimmed.slice(2)
  // Already has country code.
  if (trimmed.length === 12 && trimmed.startsWith("91")) return trimmed
  if (trimmed.length === 11 && trimmed.startsWith("0")) {
    // Stray leading 0 on a 10-digit Indian mobile.
    trimmed = trimmed.slice(1)
  }
  if (trimmed.length === 10 && /^[6-9]/.test(trimmed)) {
    return `91${trimmed}`
  }
  // Anything else (foreign / odd length): use as-is if it's reasonable.
  if (trimmed.length >= 11 && trimmed.length <= 15) return trimmed
  return null
}

function formatPhoneForDisplay(raw: string): string {
  const e164 = normalisePhoneE164IN(raw)
  if (!e164) return raw
  // +91 98765 43210
  if (e164.startsWith("91") && e164.length === 12) {
    return `+91 ${e164.slice(2, 7)} ${e164.slice(7)}`
  }
  return `+${e164}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Message composer
// ─────────────────────────────────────────────────────────────────────────────

const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

interface InvoiceWhatsAppPayload {
  invoiceNumber: string
  awbNumber?: string
  customerName?: string
  totalAmount: number
  balance: number
  dueDate?: string | null
  trackingUrl?: string
  /** Sender / brand name shown on the closing line. Defaults to `TAC Express`. */
  senderLabel?: string
}

function composeInvoiceMessage(p: InvoiceWhatsAppPayload): string {
  const greeting = p.customerName
    ? `Hello ${p.customerName.split(/\s+/)[0]},`
    : "Hello,"
  const lines: string[] = [
    greeting,
    "",
    `Here is your *TAC Express* invoice:`,
    "",
    `• Invoice: *${p.invoiceNumber}*`,
  ]
  if (p.awbNumber) lines.push(`• AWB: ${p.awbNumber}`)
  lines.push(`• Total: ${inr(p.totalAmount)}`)
  if (p.balance > 0) {
    lines.push(`• Balance due: *${inr(p.balance)}*`)
  } else if (p.balance === 0 && p.totalAmount > 0) {
    lines.push(`• Status: Paid in full ✅`)
  }
  if (p.dueDate) {
    const d = new Date(p.dueDate)
    if (!Number.isNaN(d.valueOf())) {
      lines.push(
        `• Due by: ${d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`,
      )
    }
  }
  if (p.trackingUrl) {
    lines.push("", `Track shipment: ${p.trackingUrl}`)
  }
  lines.push(
    "",
    "Reply to this chat with any questions.",
    `— ${p.senderLabel ?? "TAC Express"}`,
  )
  return lines.join("\n")
}

// ─────────────────────────────────────────────────────────────────────────────
// Dialog
// ─────────────────────────────────────────────────────────────────────────────

interface SendInvoiceWhatsAppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: InvoiceWhatsAppPayload
  /** Pre-fill the phone field with the customer's saved number. */
  defaultPhone?: string
  /** Override the default tracking URL builder. */
  trackingUrl?: string
}

function SendInvoiceWhatsAppDialog({
  open,
  onOpenChange,
  invoice,
  defaultPhone,
  trackingUrl,
}: SendInvoiceWhatsAppDialogProps) {
  const [phone, setPhone] = React.useState(defaultPhone ?? "")
  const [message, setMessage] = React.useState(() =>
    composeInvoiceMessage({ ...invoice, trackingUrl }),
  )
  const [copied, setCopied] = React.useState(false)
  const [didCustomiseMessage, setDidCustomiseMessage] = React.useState(false)

  // Reset every time the dialog opens for a different invoice.
  React.useEffect(() => {
    if (!open) return
    setPhone(defaultPhone ?? "")
    setMessage(composeInvoiceMessage({ ...invoice, trackingUrl }))
    setDidCustomiseMessage(false)
    setCopied(false)
    // Only reset on dialog open / invoice change, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice.invoiceNumber])

  // If the invoice mutates while the dialog is open (e.g. balance just
  // dropped after recording a payment), refresh the un-edited template.
  React.useEffect(() => {
    if (!open || didCustomiseMessage) return
    setMessage(composeInvoiceMessage({ ...invoice, trackingUrl }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice.balance, invoice.totalAmount])

  const e164 = normalisePhoneE164IN(phone)
  const phoneValid = Boolean(e164)
  const messageTrimmed = message.trim()
  const messageValid = messageTrimmed.length > 0
  const canSend = phoneValid && messageValid

  const handleSend = () => {
    if (!canSend || !e164) return
    const url = `https://wa.me/${e164}?text=${encodeURIComponent(messageTrimmed)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageTrimmed)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard may be unavailable in non-https / restricted contexts.
    }
  }

  const handleResetTemplate = () => {
    setMessage(composeInvoiceMessage({ ...invoice, trackingUrl }))
    setDidCustomiseMessage(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RiWhatsappLine className="size-5 text-accent-success" aria-hidden />
            Send invoice via WhatsApp
          </DialogTitle>
          <DialogDescription>
            Opens WhatsApp Web (or the desktop / mobile app) pre-filled with the
            recipient and message. Nothing is sent until you press *Send* in
            WhatsApp itself.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Phone field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="wa-phone"
              className="font-mono text-2xs uppercase tracking-wider text-muted-foreground"
            >
              Recipient phone (India)
            </label>
            <input
              id="wa-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              aria-invalid={phone.length > 0 && !phoneValid}
              className={cn(
                "h-9 w-full border border-border bg-background px-3 font-mono text-sm tabular-nums",
                "placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none",
                "focus:ring-1 focus:ring-primary",
                phone.length > 0 && !phoneValid && "border-accent-warning",
              )}
            />
            <p className="font-mono text-2xs text-muted-foreground">
              {phoneValid && e164
                ? `Will dial ${formatPhoneForDisplay(phone)} (${e164})`
                : phone.length > 0
                  ? "Enter a valid Indian mobile (10 digits) or include country code."
                  : "Enter the recipient's WhatsApp number."}
            </p>
          </div>

          {/* Message preview / editor */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="wa-message"
                className="font-mono text-2xs uppercase tracking-wider text-muted-foreground"
              >
                Message
              </label>
              {didCustomiseMessage ? (
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="font-mono text-2xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
                >
                  Reset to template
                </button>
              ) : null}
            </div>
            <textarea
              id="wa-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setDidCustomiseMessage(true)
              }}
              rows={10}
              className={cn(
                "w-full resize-y border border-border bg-background px-3 py-2 font-sans text-sm leading-relaxed",
                "placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none",
                "focus:ring-1 focus:ring-primary",
              )}
              aria-invalid={!messageValid}
            />
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                {messageTrimmed.length} chars
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 font-mono text-2xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
              >
                {copied ? (
                  <>
                    <RiCheckLine className="size-3.5 text-accent-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <RiFileCopyLine className="size-3.5" />
                    Copy message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="gap-2 bg-accent-success text-background hover:bg-accent-success/90 disabled:opacity-50"
          >
            <RiWhatsappLine className="size-4" />
            Open WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export {
  SendInvoiceWhatsAppDialog,
  composeInvoiceMessage,
  normalisePhoneE164IN,
  formatPhoneForDisplay,
}
export type { InvoiceWhatsAppPayload, SendInvoiceWhatsAppDialogProps }
