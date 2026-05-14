"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import {
  RiBox3Line,
  RiTruckLine,
  RiAlertLine,
  RiFlightTakeoffLine,
} from "@workspace/ui/icons"
import { PageShell } from "@workspace/ui/components/composed/page-shell"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { StatCard } from "@workspace/ui/components/composed/stat-card"

/**
 * V7OpsDashboard — NextAdmin-inspired Violet Grid v7 reference layout
 * (Phase 2b of the refactor).
 *
 * Rendered when `useDesignVersion()` resolves to `"v7"`. The Paper Ops
 * Console `<OpsDashboard />` remains the v6 default. Both share the same
 * service hooks via `ops-dashboard-live.tsx`; only the view changes.
 *
 * Composition contract:
 *   PageShell width="wide"  (1536px cap — accommodates 4-across KPI row)
 *   PageHeader              (existing v6 primitive, design-token compliant)
 *   <grid cols=4 gap=card-gap>
 *     StatCard × 4 — Active Shipments / In Transit / Open Exceptions / Next Flight
 *   </grid>
 *
 * Charts + upcoming operations panels are intentionally deferred to a
 * follow-up — this surface establishes the StatCard pattern on a real
 * route. See docs/REFACTOR-PHASE-1-SPEC.md for the full StatCard contract.
 */

interface V7OpsDashboardProps {
  activeShipments: number
  inTransit: number
  openExceptions: number
  nextFlightEta?: string
  className?: string
}

function V7OpsDashboard({
  activeShipments,
  inTransit,
  openExceptions,
  nextFlightEta,
  className,
}: V7OpsDashboardProps) {
  return (
    <PageShell width="wide" className={cn(className)}>
      <PageHeader
        overline="Platform"
        title="Dashboard"
        description="Real-time operations overview across the network."
      />

      <div
        data-slot="v7-ops-dashboard-kpis"
        className="grid grid-cols-1 gap-card-gap sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Active Shipments"
          value={activeShipments}
          visual={<RiBox3Line className="size-6 text-primary" aria-hidden="true" />}
        />
        <StatCard
          label="In Transit"
          value={inTransit}
          visual={<RiTruckLine className="size-6 text-primary" aria-hidden="true" />}
        />
        <StatCard
          label="Open Exceptions"
          value={openExceptions}
          visual={
            <RiAlertLine
              className={cn(
                "size-6",
                openExceptions > 0 ? "text-destructive" : "text-muted-foreground"
              )}
              aria-hidden="true"
            />
          }
        />
        <StatCard
          label="Next Flight ETA"
          value={nextFlightEta ?? "—"}
          monoValue={Boolean(nextFlightEta)}
          visual={
            <RiFlightTakeoffLine
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
          }
        />
      </div>
    </PageShell>
  )
}

export { V7OpsDashboard }
export type { V7OpsDashboardProps }
