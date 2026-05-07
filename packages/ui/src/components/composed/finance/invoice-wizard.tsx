"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  SmartAddressFields,
  type SmartAddressValue,
} from "@workspace/ui/components/composed/smart-address-fields"
import { WizardStepper, type WizardStep } from "./wizard-stepper"
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCalculatorLine,
  RiCheckLine,
} from "@workspace/ui/icons"

/**
 * Serialise the SmartAddressFields struct back to the legacy single-string
 * `billingAddress` shape that downstream invoice persistence + print view
 * already consume.
 */
function joinBillingAddress(parts: {
  line1?: string
  city?: string
  state?: string
  zip?: string
}): string {
  const segments = [
    parts.line1?.trim(),
    [parts.city?.trim(), parts.state?.trim()].filter(Boolean).join(", "),
    parts.zip?.trim(),
  ].filter((seg): seg is string => Boolean(seg && seg.length > 0))
  return segments.join(", ")
}

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type PaymentModeLiteral = "PAID" | "TO_PAY" | "TBB"
export type ServiceLevelLiteral = "STANDARD" | "PRIORITY" | "EXPRESS"
export type HubCodeLiteral = "IMPHAL" | "NEW_DELHI" | "GUWAHATI"

export interface InvoiceWizardState {
  // Basics
  awbNumber: string
  paymentMode: PaymentModeLiteral
  notes: string

  // Parties
  customerId: string
  customerName: string
  customerGstin: string
  /**
   * Joined billing address (street, city, state PIN). Auto-derived from the
   * structured `billing*` fields below; kept as a single string for legacy
   * consumers (print view, downstream invoice persistence).
   */
  billingAddress: string
  /** Structured billing-address parts driven by SmartAddressFields. */
  billingLine1: string
  billingCity: string
  billingState: string
  billingZip: string

  // Cargo / Rate Lookup
  origin: HubCodeLiteral
  destination: HubCodeLiteral
  serviceLevel: ServiceLevelLiteral
  weightKg: string
  pieces: string

  // Payment / Charges
  baseFreight: number
  docketCharge: number
  fuelSurcharge: number
  handlingFee: number
  insurance: number
  discount: number
}

export const INVOICE_WIZARD_STEPS: WizardStep[] = [
  { id: "basics", label: "Basics" },
  { id: "parties", label: "Parties" },
  { id: "cargo", label: "Cargo" },
  { id: "payment", label: "Charges" },
]

export const INITIAL_INVOICE_STATE: InvoiceWizardState = {
  awbNumber: "",
  paymentMode: "PAID",
  notes: "",
  customerId: "",
  customerName: "",
  customerGstin: "",
  billingAddress: "",
  billingLine1: "",
  billingCity: "",
  billingState: "",
  billingZip: "",
  origin: "IMPHAL",
  destination: "NEW_DELHI",
  serviceLevel: "STANDARD",
  weightKg: "",
  pieces: "1",
  baseFreight: 0,
  docketCharge: 0,
  fuelSurcharge: 0,
  handlingFee: 0,
  insurance: 0,
  discount: 0,
}

/* ------------------------------------------------------------------ */
/*  Shared field primitives                                           */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
  hint?: string
  error?: string
  className?: string
}

function Field({ label, required, children, hint, error, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)} data-slot="wizard-field">
      <label className="flex items-center gap-1 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="font-sans text-xs text-muted-foreground/70">{hint}</p>
      )}
      {error && (
        <p className="font-sans text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

const inputClass =
  "h-9 w-full border border-border bg-background px-3 font-sans text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
const monoInputClass =
  "h-9 w-full border border-border bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
const selectClass =
  "h-9 w-full border border-border bg-background px-3 font-sans text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"

/* ------------------------------------------------------------------ */
/*  Step 1: Basics                                                    */
/* ------------------------------------------------------------------ */

function BasicsStep({
  state,
  onChange,
  errors,
}: {
  state: InvoiceWizardState
  onChange: (patch: Partial<InvoiceWizardState>) => void
  errors: Partial<Record<keyof InvoiceWizardState, string>>
}) {
  return (
    <div className="space-y-4" data-slot="basics-step">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="AWB Number" required error={errors.awbNumber} hint="Must match an existing shipment AWB">
          <input
            value={state.awbNumber}
            onChange={(e) => onChange({ awbNumber: e.target.value.toUpperCase() })}
            placeholder="TIL2500001"
            className={monoInputClass}
            autoFocus
          />
        </Field>
        <Field label="Payment Mode" required>
          <select
            value={state.paymentMode}
            onChange={(e) => onChange({ paymentMode: e.target.value as PaymentModeLiteral })}
            className={selectClass}
          >
            <option value="PAID">PAID — Prepaid</option>
            <option value="TO_PAY">TO PAY — Cash on delivery</option>
            <option value="TBB">TBB — To be billed</option>
          </select>
        </Field>
      </div>
      <Field label="Internal Notes" hint="Optional — not printed on invoice">
        <textarea
          value={state.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={2}
          className={cn(inputClass, "h-auto py-2 resize-none")}
          placeholder="Special handling requirements, reference IDs, etc."
        />
      </Field>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 2: Parties                                                   */
/* ------------------------------------------------------------------ */

function PartiesStep({
  state,
  onChange,
  errors,
}: {
  state: InvoiceWizardState
  onChange: (patch: Partial<InvoiceWizardState>) => void
  errors: Partial<Record<keyof InvoiceWizardState, string>>
}) {
  return (
    <div className="space-y-4" data-slot="parties-step">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Customer Name" required error={errors.customerName}>
          <input
            value={state.customerName}
            onChange={(e) => onChange({ customerName: e.target.value })}
            placeholder="Customer / Company name"
            className={inputClass}
          />
        </Field>
        <Field label="Customer GSTIN" hint="Optional — 15 character identifier">
          <input
            value={state.customerGstin}
            onChange={(e) => onChange({ customerGstin: e.target.value.toUpperCase() })}
            placeholder="22AAAAA0000A1Z5"
            maxLength={15}
            className={monoInputClass}
          />
        </Field>
        <Field label="Customer ID" hint="Links to customers table">
          <input
            value={state.customerId}
            onChange={(e) => onChange({ customerId: e.target.value })}
            placeholder="Leave blank if none"
            className={monoInputClass}
          />
        </Field>
      </div>
      <SmartAddressFields
        label="Billing address"
        value={
          {
            line1: state.billingLine1,
            city: state.billingCity,
            state: state.billingState,
            zip: state.billingZip,
          } satisfies SmartAddressValue
        }
        onChange={(next) => {
          const nextLine1 = next.line1 ?? ""
          const nextCity = next.city ?? ""
          const nextState = next.state ?? ""
          const nextZip = next.zip ?? ""
          onChange({
            billingLine1: nextLine1,
            billingCity: nextCity,
            billingState: nextState,
            billingZip: nextZip,
            billingAddress: joinBillingAddress({
              line1: nextLine1,
              city: nextCity,
              state: nextState,
              zip: nextZip,
            }),
          })
        }}
        idPrefix="invoice-billing"
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 3: Cargo / Rate Lookup                                       */
/* ------------------------------------------------------------------ */

export interface RateLookupResult {
  ratePerKg: number
  docketCharge: number
  fuelSurchargePct: number
  handlingFee: number
}

function CargoStep({
  state,
  onChange,
  errors,
  onRateLookup,
  isLookingUp,
}: {
  state: InvoiceWizardState
  onChange: (patch: Partial<InvoiceWizardState>) => void
  errors: Partial<Record<keyof InvoiceWizardState, string>>
  onRateLookup?: () => void
  isLookingUp?: boolean
}) {
  const weight = parseFloat(state.weightKg) || 0

  return (
    <div className="space-y-4" data-slot="cargo-step">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Origin Hub" required>
          <select
            value={state.origin}
            onChange={(e) => onChange({ origin: e.target.value as HubCodeLiteral })}
            className={selectClass}
          >
            <option value="IMPHAL">IMPHAL</option>
            <option value="NEW_DELHI">NEW DELHI</option>
            <option value="GUWAHATI">GUWAHATI</option>
          </select>
        </Field>
        <Field label="Destination Hub" required>
          <select
            value={state.destination}
            onChange={(e) => onChange({ destination: e.target.value as HubCodeLiteral })}
            className={selectClass}
          >
            <option value="IMPHAL">IMPHAL</option>
            <option value="NEW_DELHI">NEW DELHI</option>
            <option value="GUWAHATI">GUWAHATI</option>
          </select>
        </Field>
        <Field label="Service Level" required>
          <select
            value={state.serviceLevel}
            onChange={(e) => onChange({ serviceLevel: e.target.value as ServiceLevelLiteral })}
            className={selectClass}
          >
            <option value="STANDARD">Standard</option>
            <option value="PRIORITY">Priority</option>
            <option value="EXPRESS">Express</option>
          </select>
        </Field>
        <Field label="Chargeable Weight (kg)" required error={errors.weightKg}>
          <input
            type="number"
            step="0.001"
            min={0}
            value={state.weightKg}
            onChange={(e) => onChange({ weightKg: e.target.value })}
            placeholder="0.000"
            className={monoInputClass}
          />
        </Field>
        <Field label="Pieces">
          <input
            type="number"
            min={1}
            step={1}
            value={state.pieces}
            onChange={(e) => onChange({ pieces: e.target.value })}
            className={monoInputClass}
          />
        </Field>
      </div>

      {onRateLookup && (
        <div className="flex items-end justify-between gap-3 border border-dashed border-border bg-muted/30 p-3">
          <div className="flex-1">
            <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground mb-0.5">
              Rate Card Lookup
            </p>
            <p className="font-sans text-xs text-muted-foreground">
              Auto-populate base freight, docket, fuel surcharge, and handling based on active rate cards.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRateLookup}
            disabled={!weight || isLookingUp}
          >
            <RiCalculatorLine aria-hidden="true" />
            <span className="ml-1.5">{isLookingUp ? "Looking up..." : "Calculate"}</span>
          </Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 4: Charges / Payment                                         */
/* ------------------------------------------------------------------ */

interface ChargeLineDef {
  key: keyof Pick<
    InvoiceWizardState,
    "baseFreight" | "docketCharge" | "fuelSurcharge" | "handlingFee" | "insurance" | "discount"
  >
  label: string
  signedNegative?: boolean
}

const CHARGE_LINES: ChargeLineDef[] = [
  { key: "baseFreight", label: "Base Freight" },
  { key: "docketCharge", label: "Docket Charge" },
  { key: "fuelSurcharge", label: "Fuel Surcharge" },
  { key: "handlingFee", label: "Handling Fee" },
  { key: "insurance", label: "Insurance" },
  { key: "discount", label: "Discount", signedNegative: true },
]

export interface InvoiceTotals {
  subtotal: number
  discount: number
  taxable: number
  gst: number
  total: number
}

export function computeInvoiceTotals(state: InvoiceWizardState, gstRate = 0.18): InvoiceTotals {
  const subtotal =
    state.baseFreight +
    state.docketCharge +
    state.fuelSurcharge +
    state.handlingFee +
    state.insurance
  const discount = state.discount
  const taxable = Math.max(0, subtotal - discount)
  const gst = taxable * gstRate
  const total = taxable + gst
  return { subtotal, discount, taxable, gst, total }
}

function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function PaymentStep({
  state,
  onChange,
}: {
  state: InvoiceWizardState
  onChange: (patch: Partial<InvoiceWizardState>) => void
}) {
  const totals = computeInvoiceTotals(state)

  return (
    <div className="space-y-4" data-slot="payment-step">
      <div className="border border-border bg-card">
        <div className="border-b border-border px-4 py-2">
          <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            Line Items
          </p>
        </div>
        <ul className="divide-y divide-border">
          {CHARGE_LINES.map((line) => (
            <li key={line.key} className="flex items-center gap-4 px-4 py-2.5">
              <span className="font-sans text-sm text-foreground flex-1">
                {line.label}
                {line.signedNegative && (
                  <span className="ml-1 font-mono text-2xs text-muted-foreground">(−)</span>
                )}
              </span>
              <div className="relative w-40">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={state[line.key]}
                  onChange={(e) => onChange({ [line.key]: parseFloat(e.target.value) || 0 })}
                  className={cn(monoInputClass, "pl-7 text-right")}
                />
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-border p-4 space-y-1.5 bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
              Subtotal
            </span>
            <span className="font-mono tabular-nums text-foreground">
              {formatINR(totals.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
              Discount
            </span>
            <span className="font-mono tabular-nums text-foreground">
              −{formatINR(totals.discount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
              GST (18%)
            </span>
            <span className="font-mono tabular-nums text-foreground">
              {formatINR(totals.gst)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
            <span className="font-mono text-xs uppercase tracking-widest text-foreground font-semibold">
              Total Payable
            </span>
            <span className="font-mono text-lg font-bold text-primary tabular-nums">
              {formatINR(totals.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Wizard Shell                                                      */
/* ------------------------------------------------------------------ */

export interface InvoiceWizardProps {
  state: InvoiceWizardState
  onChange: (patch: Partial<InvoiceWizardState>) => void
  currentIndex: number
  onIndexChange: (index: number) => void
  onRateLookup?: () => void
  isLookingUp?: boolean
  onSubmit: () => void
  isSubmitting?: boolean
  onCancel?: () => void
  className?: string
}

export function validateStep(
  index: number,
  state: InvoiceWizardState
): Partial<Record<keyof InvoiceWizardState, string>> {
  const errors: Partial<Record<keyof InvoiceWizardState, string>> = {}
  if (index === 0) {
    if (!state.awbNumber.trim()) errors.awbNumber = "AWB number is required"
    else if (state.awbNumber.trim().length < 6) errors.awbNumber = "AWB must be at least 6 chars"
  }
  if (index === 1) {
    if (!state.customerName.trim()) errors.customerName = "Customer name is required"
  }
  if (index === 2) {
    const w = parseFloat(state.weightKg)
    if (!w || w <= 0) errors.weightKg = "Weight must be greater than 0"
  }
  return errors
}

function InvoiceWizard({
  state,
  onChange,
  currentIndex,
  onIndexChange,
  onRateLookup,
  isLookingUp,
  onSubmit,
  isSubmitting,
  onCancel,
  className,
}: InvoiceWizardProps) {
  const [errors, setErrors] = React.useState<Partial<Record<keyof InvoiceWizardState, string>>>({})
  const isLast = currentIndex === INVOICE_WIZARD_STEPS.length - 1

  const handleNext = () => {
    const stepErrors = validateStep(currentIndex, state)
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length > 0) return
    if (isLast) onSubmit()
    else onIndexChange(currentIndex + 1)
  }

  const handleBack = () => {
    setErrors({})
    if (currentIndex === 0) {
      onCancel?.()
    } else {
      onIndexChange(currentIndex - 1)
    }
  }

  return (
    <div data-slot="invoice-wizard" className={cn("space-y-5", className)}>
      <WizardStepper
        steps={INVOICE_WIZARD_STEPS}
        currentIndex={currentIndex}
        onStepClick={(idx) => {
          if (idx <= currentIndex) onIndexChange(idx)
        }}
      />

      <div className="border border-border bg-card p-5 shadow-brutal-sm">
        {currentIndex === 0 && <BasicsStep state={state} onChange={onChange} errors={errors} />}
        {currentIndex === 1 && <PartiesStep state={state} onChange={onChange} errors={errors} />}
        {currentIndex === 2 && (
          <CargoStep
            state={state}
            onChange={onChange}
            errors={errors}
            onRateLookup={onRateLookup}
            isLookingUp={isLookingUp}
          />
        )}
        {currentIndex === 3 && <PaymentStep state={state} onChange={onChange} />}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" size="sm" onClick={handleBack}>
          <RiArrowLeftLine aria-hidden="true" />
          <span className="ml-1.5">{currentIndex === 0 ? "Cancel" : "Back"}</span>
        </Button>
        <div className="flex items-center gap-1 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
          Step {currentIndex + 1} of {INVOICE_WIZARD_STEPS.length}
        </div>
        <Button type="button" size="sm" onClick={handleNext} disabled={isSubmitting}>
          {isLast ? (
            <>
              <RiCheckLine aria-hidden="true" />
              <span className="ml-1.5">{isSubmitting ? "Creating..." : "Create Invoice"}</span>
            </>
          ) : (
            <>
              <span className="mr-1.5">Continue</span>
              <RiArrowRightLine aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export { InvoiceWizard, BasicsStep, PartiesStep, CargoStep, PaymentStep, Field }
