"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

export interface InvoicePrintData {
  invoiceNumber: string
  status: string
  createdAt: string
  dueDate?: string
  paymentMode: string

  awbNumber: string
  customerName: string
  customerGstin?: string
  billingAddress?: string

  baseFreight: number
  docketCharge: number
  fuelSurcharge: number
  handlingFee: number
  insurance: number
  discount: number

  cgst: number
  sgst: number
  igst: number
  totalTax: number
  totalAmount: number

  notes?: string
  companyName?: string
  companyAddress?: string
  companyGstin?: string
}

interface InvoicePrintViewProps {
  data: InvoicePrintData
  className?: string
}

function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(iso?: string): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

const COMPANY = {
  name: "TAC Express Logistics Pvt. Ltd.",
  address: "Imphal, Manipur, India",
  gstin: "14AAAAA0000A1Z5",
}

const InvoicePrintView = React.forwardRef<HTMLDivElement, InvoicePrintViewProps>(
  function InvoicePrintView({ data, className }, ref) {
    const companyName = data.companyName ?? COMPANY.name
    const companyAddress = data.companyAddress ?? COMPANY.address
    const companyGstin = data.companyGstin ?? COMPANY.gstin

    const subtotal =
      data.baseFreight +
      data.docketCharge +
      data.fuelSurcharge +
      data.handlingFee +
      data.insurance
    const taxable = Math.max(0, subtotal - data.discount)

    return (
      <div
        ref={ref}
        data-slot="invoice-print-view"
        className={cn(
          "bg-card text-foreground p-10 mx-auto max-w-3xl border border-border shadow-brutal",
          "font-sans text-sm",
          "print:border-0 print:shadow-none print:p-6 print:max-w-none",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-foreground">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-2xl font-bold text-foreground leading-tight">
              {companyName}
            </h1>
            <p className="text-xs text-muted-foreground">{companyAddress}</p>
            <p className="font-mono text-xs text-muted-foreground">
              GSTIN: {companyGstin}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground mb-1">
              Tax Invoice
            </p>
            <p className="font-mono text-lg font-bold text-foreground">
              {data.invoiceNumber}
            </p>
            <p className="font-mono text-2xs uppercase tracking-widest mt-2 text-muted-foreground">
              Status: <span className="text-foreground">{data.status}</span>
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-4 py-5 border-b border-border">
          <div>
            <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground mb-1">
              Invoice Date
            </p>
            <p className="text-foreground">{formatDate(data.createdAt)}</p>
          </div>
          <div>
            <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground mb-1">
              Due Date
            </p>
            <p className="text-foreground">{formatDate(data.dueDate)}</p>
          </div>
          <div>
            <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground mb-1">
              Payment Mode
            </p>
            <p className="font-mono text-foreground">{data.paymentMode}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-6 py-5 border-b border-border">
          <div>
            <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground mb-2">
              Bill To
            </p>
            <p className="font-semibold text-foreground">{data.customerName}</p>
            {data.billingAddress && (
              <p className="text-xs text-muted-foreground whitespace-pre-line mt-1">
                {data.billingAddress}
              </p>
            )}
            {data.customerGstin && (
              <p className="font-mono text-xs text-muted-foreground mt-1">
                GSTIN: {data.customerGstin}
              </p>
            )}
          </div>
          <div>
            <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground mb-2">
              Against AWB
            </p>
            <p className="font-mono text-lg font-bold text-foreground">
              {data.awbNumber}
            </p>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full mt-5 border-collapse">
          <thead>
            <tr className="border-b-2 border-foreground">
              <th className="text-left font-mono text-2xs uppercase tracking-widest text-muted-foreground py-2">
                Description
              </th>
              <th className="text-right font-mono text-2xs uppercase tracking-widest text-muted-foreground py-2">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              { label: "Base Freight", value: data.baseFreight },
              { label: "Docket Charge", value: data.docketCharge },
              { label: "Fuel Surcharge", value: data.fuelSurcharge },
              { label: "Handling Fee", value: data.handlingFee },
              { label: "Insurance", value: data.insurance },
              { label: "Discount", value: -data.discount },
            ].map((line) => (
              <tr key={line.label}>
                <td className="py-2 text-foreground">{line.label}</td>
                <td className="py-2 text-right font-mono tabular-nums text-foreground">
                  {formatINR(line.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-5 ml-auto w-full max-w-xs space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono tabular-nums">{formatINR(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-mono tabular-nums">−{formatINR(data.discount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Taxable Amount</span>
            <span className="font-mono tabular-nums">{formatINR(taxable)}</span>
          </div>
          {data.cgst > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">CGST (9%)</span>
              <span className="font-mono tabular-nums">{formatINR(data.cgst)}</span>
            </div>
          )}
          {data.sgst > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">SGST (9%)</span>
              <span className="font-mono tabular-nums">{formatINR(data.sgst)}</span>
            </div>
          )}
          {data.igst > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">IGST (18%)</span>
              <span className="font-mono tabular-nums">{formatINR(data.igst)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t-2 border-foreground">
            <span className="font-mono text-2xs uppercase tracking-widest font-semibold">
              Total Payable
            </span>
            <span className="font-mono text-xl font-bold tabular-nums">
              {formatINR(data.totalAmount)}
            </span>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="mt-8 pt-4 border-t border-border">
            <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground mb-1">
              Notes
            </p>
            <p className="text-xs text-muted-foreground whitespace-pre-line">
              {data.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-border text-center">
          <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            Computer-generated invoice — no signature required
          </p>
        </div>
      </div>
    )
  }
)

export { InvoicePrintView }
