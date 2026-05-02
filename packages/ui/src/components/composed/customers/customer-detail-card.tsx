import * as React from "react"
import type { Customer } from "@workspace/types"
import { RiMapPinLine, RiPhoneLine, RiMailLine } from "@workspace/ui/icons"

interface CustomerDetailCardProps {
  customer: Customer
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-card p-3 space-y-0.5">
      <p className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-sans text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function CustomerDetailCard({ customer }: CustomerDetailCardProps) {
  const address = [customer.addressLine1, customer.addressLine2, customer.city, customer.state, customer.zip]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">{customer.name}</h2>
            {customer.gstin && (
              <p className="font-mono text-xs text-muted-foreground mt-0.5">GSTIN: {customer.gstin}</p>
            )}
          </div>
          <span className="font-mono text-2xs uppercase tracking-wider border border-primary/30 bg-primary/5 text-primary px-2 py-0.5">
            Customer
          </span>
        </div>

        <div className="divide-y divide-border">
          <div className="flex items-center gap-2 py-2">
            <RiPhoneLine className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-sans text-sm text-foreground">{customer.phone}</span>
          </div>
          {customer.email && (
            <div className="flex items-center gap-2 py-2">
              <RiMailLine className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-sans text-sm text-foreground">{customer.email}</span>
            </div>
          )}
          <div className="flex items-start gap-2 py-2">
            <RiMapPinLine className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="font-sans text-sm text-foreground">{address}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total Shipments" value={customer.totalShipments.toLocaleString()} />
        <Stat
          label="Total Revenue"
          value={`₹${customer.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
        />
        <Stat
          label="Outstanding"
          value={`₹${customer.outstandingBalance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
        />
      </div>
    </div>
  )
}
