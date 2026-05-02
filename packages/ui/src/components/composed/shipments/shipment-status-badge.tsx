import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"
import type { ShipmentStatus } from "@workspace/types"

const shipmentStatusVariants = cva(
  "inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-2xs font-semibold uppercase tracking-wider border",
  {
    variants: {
      status: {
        CREATED:           "bg-muted text-muted-foreground border-border",
        PICKUP_SCHEDULED:  "bg-muted text-foreground border-border",
        PICKED_UP:         "bg-primary/10 text-primary border-primary/20",
        RECEIVED_AT_ORIGIN:"bg-primary/10 text-primary border-primary/20",
        IN_TRANSIT:        "bg-primary/20 text-primary border-primary/30",
        RECEIVED_AT_DEST:  "bg-primary/10 text-primary border-primary/20",
        OUT_FOR_DELIVERY:  "bg-primary/15 text-primary border-primary/25",
        DELIVERED:         "bg-primary/10 text-primary border-primary/20",
        CANCELLED:         "bg-destructive/10 text-destructive border-destructive/20",
        RTO:               "bg-destructive/10 text-destructive border-destructive/20",
        EXCEPTION:         "bg-destructive/20 text-destructive border-destructive/30",
      },
    },
    defaultVariants: { status: "CREATED" },
  }
)

const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  CREATED: "Created",
  PICKUP_SCHEDULED: "Pickup Scheduled",
  PICKED_UP: "Picked Up",
  RECEIVED_AT_ORIGIN: "At Origin Hub",
  IN_TRANSIT: "In Transit",
  RECEIVED_AT_DEST: "At Dest. Hub",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RTO: "RTO",
  EXCEPTION: "Exception",
}

interface ShipmentStatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof shipmentStatusVariants> {
  status: ShipmentStatus
}

function ShipmentStatusBadge({ status, className, ...props }: ShipmentStatusBadgeProps) {
  return (
    <span
      data-slot="shipment-status-badge"
      className={cn(shipmentStatusVariants({ status }), className)}
      {...props}
    >
      <span className="h-1.5 w-1.5 shrink-0 bg-current" aria-hidden />
      {SHIPMENT_STATUS_LABELS[status]}
    </span>
  )
}

export { ShipmentStatusBadge, shipmentStatusVariants, SHIPMENT_STATUS_LABELS }
