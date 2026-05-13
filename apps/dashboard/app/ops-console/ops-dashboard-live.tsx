"use client"

import * as React from "react"

import { useDashboardKPIs } from "@workspace/services/hooks/use-dashboard"
import { useUpcomingOperations } from "@workspace/services/hooks/use-orbital"
import type { KPIData } from "@workspace/services/dashboard.service"
import type { UpcomingOp } from "@workspace/types/orbital"
import { useRealtimeDashboard } from "@workspace/ui/hooks/use-realtime"

import { OpsDashboard } from "@workspace/ui/components/composed/ops-console"

interface OpsDashboardLiveProps {
  initialKpis: KPIData
}

/**
 * Client wrapper that bridges the Paper Ops Console's <OpsDashboard /> view
 * to the same React Query hooks the Violet Grid home page already uses. The
 * server `page.tsx` does a single initial KPI fetch and seeds `initialKpis`;
 * the hooks below take over for live updates + realtime cache invalidation.
 *
 * Growth + Shipment Volume now render their own interactive recharts panels
 * (OpsGrowthAreaChart / OpsVolumeBarChart) with mock time-series data — wire
 * real hooks into those components when the service layer exposes them.
 */
export function OpsDashboardLive({ initialKpis }: OpsDashboardLiveProps) {
  useRealtimeDashboard()
  const kpisQuery = useDashboardKPIs()
  const upcomingQuery = useUpcomingOperations(5)

  const kpis = kpisQuery.data ?? initialKpis

  return (
    <OpsDashboard
      activeShipments={kpis.activeShipments ?? 0}
      inTransit={kpis.inTransit ?? 0}
      openExceptions={kpis.openExceptions ?? 0}
      upcoming={(upcomingQuery.data ?? []).map((op: UpcomingOp) => ({
        id: op.id,
        label: op.title,
        eta: op.eta,
        etaDate: op.etaDate,
      }))}
    />
  )
}
