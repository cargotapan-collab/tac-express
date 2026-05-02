"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@workspace/ui/components/composed/data-table"
import { Button } from "@workspace/ui/components/button"
import { shipmentColumns } from "@workspace/ui/components/composed/shipments/shipment-columns"
import { useShipments } from "@workspace/services/hooks/use-shipments"
import { RiAddLine } from "@workspace/ui/icons"
import { ShipmentStatus } from "@workspace/types"

const STATUS_FILTERS: ShipmentStatus[] = [
  ShipmentStatus.CREATED,
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.OUT_FOR_DELIVERY,
  ShipmentStatus.DELIVERED,
  ShipmentStatus.EXCEPTION,
]

export function ShipmentsClient() {
  const router = useRouter()
  const [activeStatus, setActiveStatus] = React.useState<ShipmentStatus | undefined>()
  const { data, isLoading, error } = useShipments(
    activeStatus ? { status: [activeStatus] } : {}
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant={!activeStatus ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveStatus(undefined)}
            className="font-mono text-xs uppercase tracking-wider h-8"
          >
            All
          </Button>
          {STATUS_FILTERS.map((s) => (
            <Button
              key={s}
              variant={activeStatus === s ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveStatus(s === activeStatus ? undefined : s)}
              className="font-mono text-xs uppercase tracking-wider h-8"
            >
              {s.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
        <Button
          onClick={() => router.push("/shipments/create")}
          className="font-mono text-xs uppercase tracking-wider h-8"
        >
          <RiAddLine className="h-4 w-4 mr-1" />
          New Shipment
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted/30 animate-pulse border border-border" />
          ))}
        </div>
      )}

      {error && (
        <div className="border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="font-mono text-xs text-destructive">Failed to load shipments</p>
        </div>
      )}

      {!isLoading && !error && (
        <DataTable
          columns={shipmentColumns}
          data={data ?? []}
          searchKey="awbNumber"
          searchPlaceholder="Search AWB, sender, receiver..."
        />
      )}
    </div>
  )
}
