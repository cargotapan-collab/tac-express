"use client"

import * as React from "react"

import { useDashboardKPIs } from "@workspace/services/hooks/use-dashboard"
import {
  useDeliverySuccessGrowth,
  useUpcomingOperations,
} from "@workspace/services/hooks/use-orbital"
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
 */
export function OpsDashboardLive({ initialKpis }: OpsDashboardLiveProps) {
  useRealtimeDashboard()
  const kpisQuery = useDashboardKPIs()
  const growthQuery = useDeliverySuccessGrowth()
  const upcomingQuery = useUpcomingOperations(5)

  const kpis = kpisQuery.data ?? initialKpis

  return (
    <OpsDashboard
      activeShipments={kpis.activeShipments ?? 0}
      inTransit={kpis.inTransit ?? 0}
      openExceptions={kpis.openExceptions ?? 0}
      growth={{
        value: growthQuery.data?.value ?? 0,
        target: growthQuery.data?.target ?? 85,
        delivered: kpis.delivered ?? 0,
        total: kpis.activeShipments ?? 0,
      }}
      upcoming={(upcomingQuery.data ?? []).map((op: UpcomingOp) => ({
        id: op.id,
        label: op.title,
        eta: op.eta,
      }))}
      volumePath={{
        fill: "M0 100 L260 100 L260 30 L360 30 L360 120 L0 120 Z",
        stroke: "M0 100 L260 100 L260 30 L360 30",
        ticks: [
          { x: 0, label: "22 Apr" },
          { x: 160, label: "30 Apr" },
          { x: 320, label: "6 May" },
        ],
      }}
    />
  )
}
