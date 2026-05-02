"use client"

import * as React from "react"
import { useInventoryByHub } from "@workspace/services/hooks/use-analytics"
import { HubInventoryCard } from "@workspace/ui/components/composed/inventory/hub-inventory-card"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { Button } from "@workspace/ui/components/button"
import { RiRefreshLine } from "@workspace/ui/icons"

export function InventoryClient() {
  const { data: inventory, isLoading, refetch, isFetching } = useInventoryByHub()

  return (
    <div className="space-y-6">
      <PageHeader
        overline="Operations"
        title="Hub Inventory"
        description="Live shipment count by hub (excludes Delivered / Cancelled / RTO)"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RiRefreshLine
              className={isFetching ? "animate-spin" : undefined}
              aria-hidden="true"
            />
            <span className="ml-1.5">Refresh</span>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 bg-card animate-pulse tac-fui-panel" />
          ))}
        </div>
      ) : !inventory?.length ? (
        <div className="border-dashed h-40 flex items-center justify-center tac-fui-border">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">No active shipments</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {inventory.map((item) => (
            <HubInventoryCard key={item.hub} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
