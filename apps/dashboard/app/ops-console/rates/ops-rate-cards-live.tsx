"use client"

import * as React from "react"

import { useRateCards } from "@workspace/services/hooks/use-rate-cards"
import type { RateCard } from "@workspace/types"
import {
  OpsRateCardsView,
  type RateCardRow,
} from "@workspace/ui/components/composed/ops-console/pages"

function toRow(rc: RateCard): RateCardRow {
  return {
    route: `${rc.originHub.replace(/_/g, " ")} → ${rc.destHub.replace(/_/g, " ")}`,
    service: rc.serviceLevel === "PRIORITY" || rc.serviceLevel === "EXPRESS" ? "Priority" : "Standard",
    slab:
      rc.weightSlabMax === Number.POSITIVE_INFINITY
        ? `${rc.weightSlabMin}–∞`
        : `${rc.weightSlabMin}–${rc.weightSlabMax}`,
    rate: `₹${rc.ratePerKg}`,
    docket: `₹${rc.docketCharge}`,
    fuelPct: `${rc.fuelSurchargePct}%`,
    handling: `₹${rc.handlingFee}`,
  }
}

export function OpsRateCardsLive() {
  const { data = [] } = useRateCards({ isActive: true })
  return <OpsRateCardsView rows={data.map(toRow)} />
}
