"use client"

import * as React from "react"

import { useInventoryByHub } from "@workspace/services/hooks/use-analytics"
import type { HubInventoryItem } from "@workspace/types"
import {
  OpsInventoryView,
  type HubInventory,
} from "@workspace/ui/components/composed/ops-console/pages"

function toHub(h: HubInventoryItem): HubInventory {
  return {
    hubCode: h.hub.replace(/_/g, " "),
    pieces: h.total,
    rows: [
      { label: "Created / Pending", value: h.created },
      { label: "In Transit", value: h.inTransit },
      { label: "Arrived at Hub", value: h.receivedAtDest },
      { label: "Out for Delivery", value: h.outForDelivery },
      { label: "Exceptions", value: h.exception },
    ],
  }
}

export function OpsInventoryLive() {
  const { data = [] } = useInventoryByHub()
  return <OpsInventoryView hubs={data.map(toHub)} />
}
