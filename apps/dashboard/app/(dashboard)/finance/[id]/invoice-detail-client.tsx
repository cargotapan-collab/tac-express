"use client"

import * as React from "react"
import * as Sentry from "@sentry/nextjs"
import { useRouter } from "next/navigation"
import { useInvoice, useIssueInvoice, useMarkPaid, useCancelInvoice } from "@workspace/services/hooks/use-invoices"
import { usePaymentsForInvoice, useRecordPayment, useDeletePayment } from "@workspace/services/hooks/use-payments"
import { useSendInvoiceWhatsapp, useWhatsappTest } from "@workspace/services/hooks/use-whatsapp"
import { PaymentResponseLostError } from "@workspace/services/payment.service"
import { InvoiceStatus } from "@workspace/types"
import { useNotificationStore } from "@workspace/services/stores/notification.store"
import {
  RiArrowLeftLine,
  RiPrinterLine,
  RiEyeLine,
  RiMoneyDollarCircleLine,
  RiBarcodeBoxLine,
  RiWhatsappLine,
} from "@workspace/ui/icons"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { InvoiceStatusBadge } from "@workspace/ui/components/composed/finance/invoice-status-badge"
import { PaymentTimeline } from "@workspace/ui/components/composed/finance/payment-timeline"
import {
  RecordPaymentDialog,
  type RecordPaymentValues,
} from "@workspace/ui/components/composed/finance/record-payment-dialog"
import {
  SendWhatsAppDialog,
  type SendWhatsAppValues,
} from "@workspace/ui/components/composed/finance/send-whatsapp-dialog"

interface InvoiceDetailClientProps {
  invoiceId: string
}

interface ParsedNotes {
  freeText?: string
  remarks?: string
  bookingDate?: string
  natureOfQuantity?: string
  declaredValue?: string
  consignor?: { name?: string; phone?: string; address?: string }
  consignee?: { name?: string; phone?: string; address?: string }
  billingAddress?: string
  actualWeightKg?: string | number
  externalAwbNumber?: string
}

function parseNotes(raw?: string): ParsedNotes | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith("{")) return { freeText: raw }
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>
    return {
      freeText: typeof parsed.notes === "string" ? parsed.notes : undefined,
      remarks: typeof parsed.remarks === "string" ? parsed.remarks : undefined,
      bookingDate: typeof parsed.bookingDate === "string" ? parsed.bookingDate : undefined,
      natureOfQuantity:
        typeof parsed.natureOfQuantity === "string" ? parsed.natureOfQuantity : undefined,
      declaredValue:
        typeof parsed.declaredValue === "string" ? parsed.declaredValue : undefined,
      consignor: parsed.consignor as ParsedNotes["consignor"],
      consignee: parsed.consignee as ParsedNotes["consignee"],
      billingAddress:
        typeof parsed.billingAddress === "string" ? parsed.billingAddress : undefined,
      actualWeightKg: parsed.actualWeightKg as ParsedNotes["actualWeightKg"],
      externalAwbNumber:
        typeof parsed.externalAwbNumber === "string" ? parsed.externalAwbNumber : undefined,
    }
  } catch {
    return { freeText: raw }
  }
}

function Row({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 last:border-b-0">
      <span className="font-mono text-2xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-sm tabular-nums text-foreground",
          accent && "text-primary"
        )}
      >
        {value}
      </span>
    </div>
  )
}

function Field({
  label,
  value,
  className,
}: {
  label: string
  value?: React.ReactNode
  className?: string
}) {
  if (value === undefined || value === null || value === "") return null
  return (
    <div className={cn("space-y-1", className)}>
      <p className="font-mono text-2xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-xs text-foreground whitespace-pre-line break-words">
        {value}
      </p>
    </div>
  )
}

export function InvoiceDetailClient({ invoiceId }: InvoiceDetailClientProps) {
  const router = useRouter()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const { data: invoice, isLoading } = useInvoice(invoiceId)
  const { data: payments = [] } = usePaymentsForInvoice(invoiceId)
  const issueInvoice = useIssueInvoice()
  const markPaid = useMarkPaid()
  const cancelInvoice = useCancelInvoice()
  const recordPayment = useRecordPayment()
  const deletePayment = useDeletePayment()
  const sendWhatsapp = useSendInvoiceWhatsapp()
  const [recordOpen, setRecordOpen] = React.useState(false)
  const [whatsappOpen, setWhatsappOpen] = React.useState(false)
  /**
   * Pre-flight WPBox config check — runs on page load (not just when
   * the dialog opens) so the "Send via WhatsApp" button knows the
   * upstream state before the operator clicks it. Per issue #12:
   * when the kill-switch flag is on (`WHATSAPP_ENABLED!=='true'`)
   * or WPBox is unreachable, the button disables itself with a
   * tooltip rather than letting the operator hit a 503/502 inside
   * the dialog.
   *
   * `staleTime: 60_000` in the underlying hook caps re-fetch
   * frequency to once per minute per session — cheap enough to
   * always-enable.
   */
  const whatsappTest = useWhatsappTest(true)
  const whatsappAvailable = whatsappTest.data?.ok !== false

  const parsedNotes = React.useMemo(() => parseNotes(invoice?.notes), [invoice?.notes])

  async function handleIssue() {
    try {
      await issueInvoice.mutateAsync(invoiceId)
      addNotification({ type: "success", title: "Invoice issued", message: String(invoice?.invoiceNumber ?? "") })
    } catch (err) {
      addNotification({ type: "error", title: "Failed", message: String(err) })
    }
  }

  async function handleMarkPaid() {
    try {
      await markPaid.mutateAsync({ id: invoiceId })
      addNotification({ type: "success", title: "Marked as paid", message: String(invoice?.invoiceNumber ?? "") })
    } catch (err) {
      addNotification({ type: "error", title: "Failed", message: String(err) })
    }
  }

  async function handleSendWhatsapp(values: SendWhatsAppValues) {
    try {
      const result = await sendWhatsapp.mutateAsync({
        invoiceId,
        phone: values.phone,
        mode: values.mode,
        templateName: values.templateName,
        templateLanguage: values.templateLanguage,
        templateParams: values.templateParams,
        templateMediaUrl: values.templateMediaUrl,
        templateMediaFilename: values.templateMediaFilename,
        templateMediaKind: values.templateMediaKind,
      })

      // Direct mode: be honest about WhatsApp's 24h policy. The API
      // returns success + a real WAMID even when delivery silently
      // fails for cold contacts. Template mode: delivery is real.
      const phoneOut = result.phone ?? values.phone
      const invNo = result.invoiceNumber ?? invoice?.invoiceNumber ?? ""
      const isDirect = (result.mode ?? values.mode) === "direct"
      const wamidTag = result.wamid
        ? ` · WAMID ${result.wamid.slice(0, 22)}…`
        : ""

      addNotification({
        type: "success",
        title: isDirect ? "WhatsApp queued" : "Template sent",
        message: isDirect
          ? `Invoice ${invNo} accepted by WhatsApp for ${phoneOut}${wamidTag}. Delivery requires recipient to have messaged you in the last 24h — switch to Template mode for guaranteed delivery.`
          : `Template delivered to ${phoneOut} for invoice ${invNo}${wamidTag}.`,
      })
      setWhatsappOpen(false)
    } catch (err) {
      // Re-throw so the dialog can surface the error inline.
      throw err instanceof Error ? err : new Error(String(err))
    }
  }

  async function handleRecordPayment(values: RecordPaymentValues) {
    try {
      await recordPayment.mutateAsync({
        invoiceId,
        amount: values.amount,
        method: values.method,
        reference: values.reference,
        notes: values.notes,
        receivedAt: values.receivedAt,
      })
      addNotification({
        type: "success",
        title: "Payment recorded",
        message: `₹${values.amount.toLocaleString("en-IN")} via ${values.method.replace(/_/g, " ").toLowerCase()}.`,
      })
    } catch (err) {
      // Special-case the "RPC succeeded but response was empty" branch.
      // The server-side mutation has already happened — the user MUST
      // refresh, NOT retry. We discriminate by `code` for bundle safety
      // across package boundaries; instanceof is a redundant inner guard.
      const isResponseLost =
        (err instanceof PaymentResponseLostError) ||
        (typeof err === "object" &&
          err !== null &&
          (err as { code?: unknown }).code === "PAYMENT_RESPONSE_LOST")

      if (isResponseLost) {
        // High-severity capture: this indicates an RPC contract bug
        // (returning null on success) and ops needs to know within
        // minutes, not at month-end reconciliation. The Sentry tags
        // make it filterable and grouping-friendly.
        Sentry.captureException(err, {
          level: "error",
          tags: {
            module: "finance",
            kind: "payment_response_lost",
            invoice_id: invoiceId,
          },
          extra: {
            invoiceNumber: invoice?.invoiceNumber,
            amount: values.amount,
            method: values.method,
            userId: invoice?.createdBy,
          },
        })
        addNotification({
          type: "warning",
          title: "Payment recorded — verify before retrying",
          message:
            "The payment was saved on the server, but we did not receive " +
            "a confirmation row. Refresh the invoice to verify the entry " +
            "appears. Do NOT click Record Payment again — that would " +
            "create a duplicate.",
        })
        return
      }

      addNotification({
        type: "error",
        title: "Payment failed",
        message: String(err),
      })
    }
  }

  function handleDeletePayment(id: string) {
    if (!confirm("Delete this payment record?")) return
    deletePayment.mutate({ id, invoiceId })
  }

  async function handleCancel() {
    if (!confirm("Cancel this invoice?")) return
    try {
      await cancelInvoice.mutateAsync(invoiceId)
      addNotification({ type: "success", title: "Invoice cancelled", message: String(invoice?.invoiceNumber ?? "") })
    } catch (err) {
      addNotification({ type: "error", title: "Failed", message: String(err) })
    }
  }

  const isActionLoading = issueInvoice.isPending || markPaid.isPending || cancelInvoice.isPending

  if (isLoading) return <div className="h-64 border border-border bg-card animate-pulse" />

  if (!invoice) {
    return (
      <div className="border border-dashed border-border p-8 text-center">
        <p className="font-mono text-sm text-muted-foreground">Invoice not found</p>
      </div>
    )
  }

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const subtotal =
    invoice.baseFreight +
    invoice.docketCharge +
    invoice.pickupCharge +
    invoice.packingCharge +
    invoice.fuelSurcharge +
    invoice.handlingFee +
    invoice.insurance
  const taxable = Math.max(0, subtotal - invoice.discount)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground h-8 px-2"
        >
          <RiArrowLeftLine className="h-3.5 w-3.5" />
          Finance
        </Button>
        <div className="flex items-center gap-2">
          <InvoiceStatusBadge status={invoice.status} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/print/invoice/${invoiceId}`, "_blank")}
            className="h-7 px-3 font-mono text-2xs uppercase tracking-wider"
          >
            <RiEyeLine className="h-3.5 w-3.5 mr-1.5" /> Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/print/invoice/${invoiceId}?print=1`, "_blank")}
            className="h-7 px-3 font-mono text-2xs uppercase tracking-wider"
          >
            <RiPrinterLine className="h-3.5 w-3.5 mr-1.5" /> Print / PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/print/invoice-label/${invoiceId}?print=1`, "_blank")}
            className="h-7 px-3 font-mono text-2xs uppercase tracking-wider"
          >
            <RiBarcodeBoxLine className="h-3.5 w-3.5 mr-1.5" /> Print Label
          </Button>
          {invoice.status !== InvoiceStatus.CANCELLED && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWhatsappOpen(true)}
              disabled={!whatsappAvailable}
              title={
                whatsappAvailable
                  ? undefined
                  : whatsappTest.data?.error ??
                    "WhatsApp send is currently unavailable — check the WHATSAPP_ENABLED kill switch or WPBox upstream."
              }
              aria-label={
                whatsappAvailable
                  ? "Send invoice via WhatsApp"
                  : "Send via WhatsApp (currently unavailable)"
              }
              className="h-7 px-3 font-mono text-2xs uppercase tracking-wider border-accent-success/40 text-accent-success hover:bg-accent-success/10 hover:text-accent-success disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent-success"
            >
              <RiWhatsappLine className="h-3.5 w-3.5 mr-1.5" /> Send via WhatsApp
            </Button>
          )}
        </div>
      </div>

      <div className="tac-fui-panel space-y-4 p-4">
        {/* Header strip */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
          <div className="space-y-0.5">
            <p className="font-mono text-2xs uppercase tracking-[0.18em] text-muted-foreground">
              Invoice
            </p>
            <p className="font-mono text-xl font-bold uppercase tracking-wider text-primary">
              {invoice.invoiceNumber}
            </p>
          </div>
          <div className="space-y-0.5 text-right">
            <p className="font-mono text-2xs uppercase tracking-[0.18em] text-muted-foreground">
              AWB
            </p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {invoice.awbNumber || "—"}
            </p>
            {invoice.issuedAt && (
              <p className="font-mono text-2xs text-muted-foreground">
                Issued {new Date(invoice.issuedAt).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>
        </div>

        {/* Charges breakdown */}
        <div className="space-y-0">
          <Row label="Customer" value={invoice.customerName} />
          {invoice.customerGstin && <Row label="GSTIN" value={invoice.customerGstin} />}
          <Row label="Payment Mode" value={invoice.paymentMode} />
          <Row label="Base Freight" value={fmt(invoice.baseFreight)} />
          {invoice.docketCharge > 0 && <Row label="Docket Charge" value={fmt(invoice.docketCharge)} />}
          {invoice.pickupCharge > 0 && <Row label="Pickup Charge" value={fmt(invoice.pickupCharge)} />}
          {invoice.packingCharge > 0 && <Row label="Packing Charge" value={fmt(invoice.packingCharge)} />}
          {invoice.fuelSurcharge > 0 && <Row label="Fuel Surcharge" value={fmt(invoice.fuelSurcharge)} />}
          {invoice.handlingFee > 0 && <Row label="Handling Fee" value={fmt(invoice.handlingFee)} />}
          {invoice.insurance > 0 && <Row label="Insurance" value={fmt(invoice.insurance)} />}
          <Row label="Subtotal" value={fmt(subtotal)} />
          {invoice.discount > 0 && <Row label="Discount" value={`− ${fmt(invoice.discount)}`} />}
          {invoice.discount > 0 && <Row label="Taxable" value={fmt(taxable)} />}
          {(invoice.tax.cgst ?? 0) > 0 && (
            <Row label="CGST" value={fmt(invoice.tax.cgst ?? 0)} />
          )}
          {(invoice.tax.sgst ?? 0) > 0 && (
            <Row label="SGST" value={fmt(invoice.tax.sgst ?? 0)} />
          )}
          {(invoice.tax.igst ?? 0) > 0 && (
            <Row label="IGST" value={fmt(invoice.tax.igst ?? 0)} />
          )}
        </div>

        {/* Total band */}
        <div className="flex items-center justify-between border-t-2 border-foreground/80 pt-3">
          <span className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-foreground">
            Total
          </span>
          <span className="font-heading text-2xl font-bold tabular-nums text-primary">
            {fmt(invoice.totalAmount)}
          </span>
        </div>

        {/* Settlement band */}
        <div className="space-y-0 border-t border-dashed border-border pt-2">
          {invoice.advancePaid > 0 && (
            <Row label="Advance Paid" value={`− ${fmt(invoice.advancePaid)}`} />
          )}
          <Row
            label="Balance Due"
            value={
              <span
                className={cn(
                  "font-semibold",
                  invoice.balance > 0 ? "text-accent-warning" : "text-primary"
                )}
              >
                {fmt(invoice.balance)}
              </span>
            }
          />
        </div>
      </div>

      {/* Booking metadata (parsed from notes JSON) */}
      {parsedNotes && (parsedNotes.consignor || parsedNotes.consignee || parsedNotes.bookingDate) && (
        <section className="tac-fui-panel space-y-4 p-4">
          <div className="flex items-center gap-2">
            <span aria-hidden className="inline-block h-3 w-1 bg-primary" />
            <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
              Shipment metadata
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Booking date" value={parsedNotes.bookingDate} />
            <Field label="Nature of goods" value={parsedNotes.natureOfQuantity} />
            <Field label="Declared value" value={parsedNotes.declaredValue} />
            <Field
              label="Actual weight"
              value={
                parsedNotes.actualWeightKg !== undefined && parsedNotes.actualWeightKg !== ""
                  ? `${parsedNotes.actualWeightKg} kg`
                  : undefined
              }
            />
            <Field label="External AWB" value={parsedNotes.externalAwbNumber} />
            <Field label="Billing address" value={parsedNotes.billingAddress} />
          </div>

          {(parsedNotes.consignor || parsedNotes.consignee) && (
            <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
              {parsedNotes.consignor && (
                <div className="space-y-1.5">
                  <p className="font-mono text-2xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Consignor
                  </p>
                  <Field label="Name" value={parsedNotes.consignor.name} />
                  <Field label="Phone" value={parsedNotes.consignor.phone} />
                  <Field label="Address" value={parsedNotes.consignor.address} />
                </div>
              )}
              {parsedNotes.consignee && (
                <div className="space-y-1.5">
                  <p className="font-mono text-2xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Consignee
                  </p>
                  <Field label="Name" value={parsedNotes.consignee.name} />
                  <Field label="Phone" value={parsedNotes.consignee.phone} />
                  <Field label="Address" value={parsedNotes.consignee.address} />
                </div>
              )}
            </div>
          )}

          {(parsedNotes.freeText || parsedNotes.remarks) && (
            <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <Field label="Notes" value={parsedNotes.freeText} />
              <Field label="Remarks" value={parsedNotes.remarks} />
            </div>
          )}
        </section>
      )}

      <div className="flex items-center justify-end gap-2">
        {invoice.status === InvoiceStatus.DRAFT && (
          <Button
            onClick={handleIssue}
            disabled={isActionLoading}
            size="sm"
            className="font-mono text-xs uppercase tracking-wider h-8 px-5"
          >
            Issue Invoice
          </Button>
        )}
        {invoice.status === InvoiceStatus.ISSUED && (
          <>
            <Button
              variant="outline"
              onClick={() => setRecordOpen(true)}
              disabled={isActionLoading || invoice.balance <= 0}
              size="sm"
              className="font-mono text-xs uppercase tracking-wider h-8 px-4"
            >
              <RiMoneyDollarCircleLine className="size-3.5" />
              Record Payment
            </Button>
            <Button
              onClick={handleMarkPaid}
              disabled={isActionLoading}
              size="sm"
              className="font-mono text-xs uppercase tracking-wider h-8 px-5"
            >
              Mark Fully Paid
            </Button>
          </>
        )}
        {(invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.ISSUED) && (
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isActionLoading}
            size="sm"
            className="font-mono text-xs uppercase tracking-wider h-8 px-4 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
          >
            Cancel
          </Button>
        )}
      </div>

      <PaymentTimeline
        payments={payments}
        onDelete={handleDeletePayment}
      />

      <RecordPaymentDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        maxAmount={invoice.balance}
        onSubmit={handleRecordPayment}
      />

      <SendWhatsAppDialog
        open={whatsappOpen}
        onOpenChange={setWhatsappOpen}
        customerName={invoice.customerName}
        defaultPhone={parsedNotes?.consignor?.phone ?? parsedNotes?.consignee?.phone ?? ""}
        invoiceNumber={invoice.invoiceNumber}
        totalAmount={invoice.totalAmount}
        awbNumber={invoice.awbNumber ?? undefined}
        onSubmit={handleSendWhatsapp}
        isSubmitting={sendWhatsapp.isPending}
        testStatus={whatsappTest.data}
        testLoading={whatsappTest.isLoading || whatsappTest.isFetching}
        onRetryTest={() => {
          void whatsappTest.refetch()
        }}
      />

    </div>
  )
}
