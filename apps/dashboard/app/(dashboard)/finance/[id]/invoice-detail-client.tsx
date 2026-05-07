"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useInvoice, useIssueInvoice, useMarkPaid, useCancelInvoice } from "@workspace/services/hooks/use-invoices"
import { usePaymentsForInvoice, useRecordPayment, useDeletePayment } from "@workspace/services/hooks/use-payments"
import { useCustomer } from "@workspace/services/hooks/use-customers"
import { InvoiceStatus } from "@workspace/types"
import { useNotificationStore } from "@workspace/services/stores/notification.store"
import {
  RiArrowLeftLine,
  RiPrinterLine,
  RiEyeLine,
  RiMoneyDollarCircleLine,
  RiWhatsappLine,
} from "@workspace/ui/icons"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  InvoicePrintView,
  type InvoicePrintData,
} from "@workspace/ui/components/composed/finance/invoice-print-view"
import { PaymentTimeline } from "@workspace/ui/components/composed/finance/payment-timeline"
import {
  RecordPaymentDialog,
  type RecordPaymentValues,
} from "@workspace/ui/components/composed/finance/record-payment-dialog"
import { SendInvoiceWhatsAppDialog } from "@workspace/ui/components/composed/finance/send-invoice-whatsapp-dialog"

interface InvoiceDetailClientProps {
  invoiceId: string
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-muted-foreground border-border",
  ISSUED: "text-accent-warning border-accent-warning/30 bg-accent-warning/5",
  PAID: "text-primary border-primary/30 bg-primary/5",
  OVERDUE: "text-destructive border-destructive/30 bg-destructive/5",
  CANCELLED: "text-muted-foreground border-border",
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
      <span className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-mono text-sm text-foreground">{value}</span>
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
  const { data: customer } = useCustomer(invoice?.customerId)
  const [showPreview, setShowPreview] = React.useState(false)
  const [recordOpen, setRecordOpen] = React.useState(false)
  const [whatsappOpen, setWhatsappOpen] = React.useState(false)

  const handlePrint = React.useCallback(() => {
    if (!showPreview) setShowPreview(true)
    // Wait for the print view to mount before triggering print dialog
    setTimeout(() => window.print(), 200)
  }, [showPreview])

  const printData: InvoicePrintData | null = React.useMemo(() => {
    if (!invoice) return null
    return {
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      createdAt: invoice.createdAt,
      dueDate: invoice.dueDate,
      paymentMode: invoice.paymentMode,
      awbNumber: invoice.awbNumber,
      customerName: invoice.customerName,
      customerGstin: invoice.customerGstin,
      billingAddress: undefined,
      baseFreight: invoice.baseFreight,
      docketCharge: invoice.docketCharge,
      fuelSurcharge: invoice.fuelSurcharge,
      handlingFee: invoice.handlingFee,
      insurance: invoice.insurance,
      discount: invoice.discount,
      cgst: invoice.tax.cgst ?? 0,
      sgst: invoice.tax.sgst ?? 0,
      igst: invoice.tax.igst ?? 0,
      totalTax: invoice.tax.total,
      totalAmount: invoice.totalAmount,
      notes: invoice.notes,
    }
  }, [invoice])

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

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between pb-5 border-b border-border">
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
          <span className={cn("font-mono text-2xs uppercase tracking-wider border px-2 py-0.5", STATUS_COLORS[invoice.status] ?? "text-muted-foreground border-border")}>
            {invoice.status}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview((p) => !p)}
            className="h-7 px-3 font-mono text-2xs uppercase tracking-wider"
          >
            <RiEyeLine className="h-3.5 w-3.5 mr-1.5" /> {showPreview ? "Hide" : "Preview"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-7 px-3 font-mono text-2xs uppercase tracking-wider"
          >
            <RiPrinterLine className="h-3.5 w-3.5 mr-1.5" /> Print / PDF
          </Button>
          {invoice.status !== InvoiceStatus.CANCELLED && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWhatsappOpen(true)}
              className="h-7 px-3 font-mono text-2xs uppercase tracking-wider border-accent-success/40 text-accent-success hover:bg-accent-success/10 hover:text-accent-success"
            >
              <RiWhatsappLine className="h-3.5 w-3.5 mr-1.5" /> Send via WhatsApp
            </Button>
          )}
        </div>
      </div>

      <div className="border border-border bg-card p-4 space-y-1">
        <div className="flex items-start justify-between pb-3 border-b border-border">
          <div>
            <p className="font-mono text-xs text-muted-foreground">Invoice</p>
            <p className="font-mono text-xl font-bold text-primary uppercase tracking-wider">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="font-mono text-xs text-muted-foreground">AWB: {invoice.awbNumber}</p>
            {invoice.issuedAt && (
              <p className="font-mono text-2xs text-muted-foreground">
                Issued: {new Date(invoice.issuedAt).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>
        </div>
        <Row label="Customer" value={invoice.customerName} />
        {invoice.customerGstin && <Row label="GSTIN" value={invoice.customerGstin} />}
        <Row label="Payment Mode" value={invoice.paymentMode} />
        <Row label="Base Freight" value={fmt(invoice.baseFreight)} />
        {invoice.fuelSurcharge > 0 && <Row label="Fuel Surcharge" value={fmt(invoice.fuelSurcharge)} />}
        {invoice.handlingFee > 0 && <Row label="Handling Fee" value={fmt(invoice.handlingFee)} />}
        {invoice.insurance > 0 && <Row label="Insurance" value={fmt(invoice.insurance)} />}
        {invoice.discount > 0 && <Row label="Discount" value={`- ${fmt(invoice.discount)}`} />}
        <Row label="Tax" value={fmt(invoice.tax.total)} />
        <div className="flex items-center justify-between pt-2">
          <span className="font-mono text-sm uppercase tracking-wider font-bold text-foreground">Total</span>
          <span className="font-mono text-xl font-bold text-primary">{fmt(invoice.totalAmount)}</span>
        </div>
        {invoice.advancePaid > 0 && (
          <Row label="Advance Paid" value={fmt(invoice.advancePaid)} />
        )}
        <Row label="Balance Due" value={<span className={invoice.balance > 0 ? "text-accent-warning font-semibold" : "text-primary"}>{fmt(invoice.balance)}</span>} />
        {invoice.notes && <Row label="Notes" value={invoice.notes} />}
      </div>

      <div className="flex items-center gap-2 justify-end">
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

      <SendInvoiceWhatsAppDialog
        open={whatsappOpen}
        onOpenChange={setWhatsappOpen}
        defaultPhone={customer?.phone}
        invoice={{
          invoiceNumber: invoice.invoiceNumber,
          awbNumber: invoice.awbNumber,
          customerName: invoice.customerName,
          totalAmount: invoice.totalAmount,
          balance: invoice.balance,
          dueDate: invoice.dueDate,
          trackingUrl:
            typeof window !== "undefined"
              ? `${window.location.origin}/track/${invoice.awbNumber}`
              : undefined,
        }}
      />

      {showPreview && printData && (
        <div className="pt-6 border-t border-dashed border-border print:pt-0 print:border-0">
          <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground mb-3 print:hidden">
            Print Preview
          </p>
          <div id="invoice-print-target">
            <InvoicePrintView data={printData} />
          </div>
        </div>
      )}

    </div>
  )
}
