"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import { useInventoryByHub } from "@workspace/services/hooks/use-analytics"
import type { HubInventoryItem } from "@workspace/types"
import {
  OpsInventoryView,
  type HubInventory,
} from "@workspace/ui/components/composed/ops-console/pages"

function toHub(h: HubInventoryItem): HubInventory {
  return {
    // Normalize whitespace into underscores so the view can pin
    // defaults by canonical code (e.g. "NEW_DELHI").
    hubCode: h.hub.replace(/\s+/g, "_").toUpperCase(),
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
  const queryClient = useQueryClient()
  const { data = [], isFetching } = useInventoryByHub()

  const handleRefresh = React.useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["analytics", "inventory-by-hub"],
    })
  }, [queryClient])

  return (
    <OpsInventoryView
      hubs={data.map(toHub)}
      isLoading={isFetching}
      onRefresh={handleRefresh}
    />
  )
}
