"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"

import { useShipments } from "@workspace/services/hooks/use-shipments"
import { useRealtimeShipments } from "@workspace/services/hooks/use-realtime"
import type { ShipmentSummary } from "@workspace/types"
import {
  OpsShipmentsView,
  type ShipmentRow,
} from "@workspace/ui/components/composed/ops-console/pages"

function abbreviate(hub: string): string {
  const m: Record<string, string> = {
    IMPHAL: "IMF",
    NEW_DELHI: "DEL",
    "NEW DELHI": "DEL",
    GUWAHATI: "GAU",
  }
  return m[hub.toUpperCase()] ?? hub.slice(0, 3).toUpperCase()
}

function toRow(s: ShipmentSummary): ShipmentRow {
  return {
    id: s.awbNumber,
    customer: s.senderName,
    receiver: s.receiverName,
    route: `${abbreviate(s.originHub)} → ${abbreviate(s.destHub)}`,
    service: "STD",
    weight: `${s.chargeableWeight.toFixed(1)}kg`,
    status: titleCase(s.status),
    age: formatDistanceToNow(new Date(s.createdAt), { addSuffix: true }),
    detailHref: `/ops-console/shipments/${s.id}`,
  }
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split("_")
    .map((p) => (p ? p[0]!.toUpperCase() + p.slice(1) : p))
    .join(" ")
}

export function OpsShipmentsLive() {
  useRealtimeShipments()
  const query = useShipments({})
  const rows = (query.data ?? []).map(toRow)
  return (
    <OpsShipmentsView
      rows={rows}
      isLoading={query.isPending}
      isError={query.isError}
      onRetry={() => void query.refetch()}
    />
  )
}
