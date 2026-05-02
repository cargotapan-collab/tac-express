"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useInvoices } from "@workspace/services/hooks/use-invoices"
import { InvoiceStatusBadge } from "@workspace/ui/components/composed/finance/invoice-status-badge"
import { AgingBuckets } from "@workspace/ui/components/composed/finance/aging-buckets"
import { Button } from "@workspace/ui/components/button"
import { RiAddLine } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import { InvoiceStatus } from "@workspace/types"

const STATUS_FILTERS: InvoiceStatus[] = [
  InvoiceStatus.DRAFT,
  InvoiceStatus.ISSUED,
  InvoiceStatus.PAID,
  InvoiceStatus.OVERDUE,
]

export function FinanceClient() {
  const router = useRouter()
  const [activeStatus, setActiveStatus] = React.useState<InvoiceStatus | undefined>()

  const { data, isLoading, error } = useInvoices(activeStatus ? { status: [activeStatus] } : {})

  // Aging is computed across the *full* invoice set, not the filtered slice,
  // so the buckets stay stable as the user changes the status pill above.
  const { data: allInvoices } = useInvoices({})

  return (
    <div className="space-y-6">
      {allInvoices && allInvoices.length > 0 && (
        <AgingBuckets
          invoices={allInvoices}
          onSelect={(b) => {
            // Selecting a bucket is a list-page filter affordance. We
            // currently surface only the status filter; future Phase 4.5
            // can route this through nuqs to a dedicated `?aging=` param.
            if (b.label === "Current") setActiveStatus(InvoiceStatus.ISSUED)
            else setActiveStatus(InvoiceStatus.OVERDUE)
          }}
        />
      )}

      <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant={!activeStatus ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveStatus(undefined)}
            className="h-7 px-3 font-mono text-2xs uppercase tracking-wider"
          >
            All
          </Button>
          {STATUS_FILTERS.map((s) => (
            <Button
              key={s}
              variant={activeStatus === s ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveStatus(s === activeStatus ? undefined : s)}
              className="h-7 px-3 font-mono text-2xs uppercase tracking-wider"
            >
              {s}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          onClick={() => router.push("/finance/create")}
          className="font-mono text-xs uppercase tracking-wider"
        >
          <RiAddLine className="h-3.5 w-3.5" />
          New Invoice
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted/30 animate-pulse tac-fui-panel" />
          ))}
        </div>
      )}

      {error && (
        <div className="border-destructive/30 bg-destructive/5 px-4 py-3 tac-fui-border">
          <p className="font-mono text-xs text-destructive">Failed to load invoices</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="tac-fui-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Invoice #", "AWB", "Customer", "Status", "Amount", "Due", ""].map((h) => (
                  <th key={h} className="font-mono text-2xs uppercase tracking-wider text-muted-foreground text-left px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data ?? []).map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-3 py-2 font-mono text-xs font-semibold text-primary">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {inv.awbNumber ?? "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground">
                    {inv.customerName}
                  </td>
                  <td className="px-3 py-2">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                  <td className={cn("px-3 py-2 font-mono text-xs", inv.status === "OVERDUE" ? "text-destructive font-semibold" : "text-foreground")}>
                    ₹{inv.totalAmount?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {inv.dueDate
                      ? new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/finance/${inv.id}`)}
                      className="font-mono text-2xs uppercase tracking-wider h-7 px-2"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center font-mono text-xs text-muted-foreground">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  )
}
