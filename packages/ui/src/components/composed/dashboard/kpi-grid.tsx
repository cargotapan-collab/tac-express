"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { KPICard } from "./kpi-card"
import {
  RiBox3Fill,
  RiPlaneFill,
  RiCheckFill,
  RiAlertFill,
  RiExchangeFundsFill,
  RiFileList3Fill,
  RiBarcodeBoxFill,
  RiRefreshLine,
} from "@workspace/ui/icons"

export interface KPIGridData {
  activeShipments: number
  inTransit: number
  delivered: number
  openExceptions: number
  totalRevenueToday: number
  pendingInvoices: number
  activeManifests: number
  shipmentsCreatedToday: number
}

interface KPIGridProps {
  data?: KPIGridData
  loading?: boolean
  currency?: string
  className?: string
}

function formatCurrency(value: number, code = "INR"): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${code} ${value.toLocaleString()}`
  }
}

function KPIGrid({ data, loading, currency = "INR", className }: KPIGridProps) {
  if (loading || !data) {
    return (
      <div
        data-slot="kpi-grid"
        className={cn(
          "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4",
          className
        )}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <KPICard
            key={i}
            label=""
            value=""
            icon={<RiRefreshLine className="h-4 w-4" />}
            loading
          />
        ))}
      </div>
    )
  }

  return (
    <div
      data-slot="kpi-grid"
      className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}
    >
      <KPICard
        label="Active Shipments"
        value={data.activeShipments}
        icon={<RiBox3Fill className="h-4 w-4" />}
        deltaLabel={`+${data.shipmentsCreatedToday} today`}
        delta="neutral"
        accent="primary"
      />
      <KPICard
        label="In Transit"
        value={data.inTransit}
        icon={<RiPlaneFill className="h-4 w-4" />}
        delta="neutral"
        accent="warning"
      />
      <KPICard
        label="Delivered Today"
        value={data.delivered}
        icon={<RiCheckFill className="h-4 w-4" />}
        delta="positive"
        accent="success"
      />
      <KPICard
        label="Open Exceptions"
        value={data.openExceptions}
        icon={<RiAlertFill className="h-4 w-4" />}
        delta={data.openExceptions > 0 ? "negative" : "neutral"}
        deltaLabel={data.openExceptions > 0 ? "Needs attention" : "All clear"}
        accent={data.openExceptions > 0 ? "danger" : "primary"}
      />
      <KPICard
        label="Revenue Today"
        value={formatCurrency(data.totalRevenueToday, currency)}
        icon={<RiExchangeFundsFill className="h-4 w-4" />}
        delta="positive"
        accent="success"
      />
      <KPICard
        label="Pending Invoices"
        value={data.pendingInvoices}
        icon={<RiFileList3Fill className="h-4 w-4" />}
        delta={data.pendingInvoices > 20 ? "negative" : "neutral"}
        accent={data.pendingInvoices > 20 ? "danger" : "warning"}
      />
      <KPICard
        label="Active Manifests"
        value={data.activeManifests}
        icon={<RiBarcodeBoxFill className="h-4 w-4" />}
        delta="neutral"
        accent="primary"
      />
      <KPICard
        label="Created Today"
        value={data.shipmentsCreatedToday}
        icon={<RiRefreshLine className="h-4 w-4" />}
        delta="neutral"
        accent="primary"
      />
    </div>
  )
}

export { KPIGrid }
