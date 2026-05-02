"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCreateInvoice } from "@workspace/services/hooks/use-invoices"
import { useRateLookupMutation } from "@workspace/services/hooks/use-rate-cards"
import { useNotificationStore } from "@workspace/services/stores/notification.store"
import { PaymentMode } from "@workspace/types"
import {
  InvoiceWizard,
  INITIAL_INVOICE_STATE,
  computeInvoiceTotals,
  type InvoiceWizardState,
} from "@workspace/ui/components/composed/finance/invoice-wizard"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { useFormAutosave } from "@workspace/ui/hooks/use-form-autosave"
import { Button } from "@workspace/ui/components/button"
import { format } from "date-fns"

const DRAFT_KEY = "invoice_draft"

export function CreateInvoiceClient() {
  const router = useRouter()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const createInvoice = useCreateInvoice()
  const rateLookup = useRateLookupMutation()

  const [state, setState] = React.useState<InvoiceWizardState>(INITIAL_INVOICE_STATE)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isLookingUp, setIsLookingUp] = React.useState(false)
  const [restorePromptShown, setRestorePromptShown] = React.useState(false)

  const patchState = (patch: Partial<InvoiceWizardState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }

  // Autosave the wizard state every 5s under `invoice_draft` so a refresh,
  // accidental nav, or idle-timeout doesn't lose work.
  const autosave = useFormAutosave<InvoiceWizardState>({
    key: DRAFT_KEY,
    value: state,
    intervalMs: 5000,
    shouldPersist: (v) => {
      // Only persist once the user has typed *something* meaningful.
      return Boolean(
        v.awbNumber || v.customerName || v.weightKg || v.baseFreight
      )
    },
  })

  // On mount: check for an existing draft and prompt the user to restore it.
  React.useEffect(() => {
    const draft = autosave.readDraft()
    if (draft && !restorePromptShown) {
      setRestorePromptShown(true)
      const shouldRestore = window.confirm(
        "We found an unfinished invoice draft from a previous session. Restore it?"
      )
      if (shouldRestore) {
        setState(draft)
      } else {
        autosave.clearDraft()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleRateLookup() {
    const weight = parseFloat(state.weightKg)
    if (!weight || weight <= 0) {
      addNotification({
        type: "warning",
        title: "Enter weight",
        message: "Weight must be > 0 to compute rate",
      })
      return
    }
    setIsLookingUp(true)
    try {
      const rate = await rateLookup.mutateAsync({
        originHub: state.origin,
        destHub: state.destination,
        serviceLevel: state.serviceLevel,
        weight,
      })
      if (!rate) {
        addNotification({
          type: "warning",
          title: "No rate found",
          message: `No active rate card for ${state.origin} → ${state.destination} ${state.serviceLevel}`,
        })
        return
      }
      const baseFreight = Math.round(weight * rate.ratePerKg * 100) / 100
      const fuelSurcharge =
        Math.round((weight * rate.ratePerKg * rate.fuelSurchargePct) / 100 * 100) / 100
      patchState({
        baseFreight,
        docketCharge: rate.docketCharge,
        fuelSurcharge,
        handlingFee: rate.handlingFee,
      })
      addNotification({
        type: "success",
        title: "Charges auto-populated",
        message: `₹${rate.ratePerKg}/kg applied`,
      })
    } catch (err) {
      addNotification({
        type: "error",
        title: "Rate lookup failed",
        message: String(err),
      })
    } finally {
      setIsLookingUp(false)
    }
  }

  async function handleSubmit() {
    const totals = computeInvoiceTotals(state)
    try {
      // NOTE: `billing_address` was previously sent here but the `invoices`
      // table has no such column — the value was being silently dropped by
      // Supabase. The form field is retained for now but isn't persisted.
      // Follow-up: either add a migration for the column or move it into
      // `notes`. See docs/CODEBASE-AUDIT-2026-05.md.
      const invoice = await createInvoice.mutateAsync({
        awb_number: state.awbNumber.trim().toUpperCase(),
        customer_id: state.customerId || null,
        customer_name: state.customerName || state.awbNumber.trim().toUpperCase(),
        customer_gstin: state.customerGstin || null,
        payment_mode: state.paymentMode as PaymentMode,
        base_freight: state.baseFreight,
        docket_charge: state.docketCharge,
        fuel_surcharge: state.fuelSurcharge,
        handling_fee: state.handlingFee,
        insurance: state.insurance,
        discount: state.discount,
        tax: {
          cgst: totals.gst / 2,
          sgst: totals.gst / 2,
          igst: 0,
          total: totals.gst,
        },
        total_amount: totals.total,
        balance: totals.total,
        notes: state.notes || null,
      })
      const inv = invoice as unknown as Record<string, unknown>
      autosave.clearDraft()
      addNotification({
        type: "success",
        title: "Invoice created",
        message: (inv.invoiceNumber as string) ?? "New invoice",
      })
      router.push(`/finance/${inv.id}`)
    } catch (err) {
      const msg = String(err)
      const isPermission =
        msg.includes("403") || msg.includes("row-level security") || msg.includes("permission")
      const isFkViolation =
        msg.includes("409") || msg.includes("foreign key") || msg.includes("violates")
      addNotification({
        type: "error",
        title: "Failed to create invoice",
        message: isPermission
          ? "Insufficient permissions. A Finance role (MANAGER, INVOICE, or FINANCE_STAFF) is required."
          : isFkViolation
            ? "AWB number not found. Enter a valid AWB that exists in the system, or leave it blank."
            : msg,
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        overline="Finance"
        title="Create Invoice"
        description="Generate an invoice for an existing AWB with automatic rate-card lookup"
        actions={
          autosave.savedAt ? (
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>
                Draft saved · {format(new Date(autosave.savedAt), "HH:mm:ss")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.confirm("Discard this draft?")) {
                    autosave.clearDraft()
                    setState(INITIAL_INVOICE_STATE)
                    setCurrentIndex(0)
                  }
                }}
              >
                Discard
              </Button>
            </div>
          ) : null
        }
      />

      <InvoiceWizard
        state={state}
        onChange={patchState}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
        onRateLookup={handleRateLookup}
        isLookingUp={isLookingUp}
        onSubmit={handleSubmit}
        isSubmitting={createInvoice.isPending}
        onCancel={() => router.back()}
      />
    </div>
  )
}
