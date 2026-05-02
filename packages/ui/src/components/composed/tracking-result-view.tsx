import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { StatusBadge } from "@workspace/ui/components/composed/dashboard/status-badge"
import type { ShipmentSummary, TrackingEvent } from "@workspace/types"

interface TrackingResultViewProps {
  awb: string
  shipment: ShipmentSummary | null
  events: TrackingEvent[]
  className?: string
}

function TrackingResultView({ awb, shipment, events, className }: TrackingResultViewProps) {
  if (!shipment) {
    return (
      <div
        data-slot="tracking-result-view"
        className={cn(
          "border border-border bg-card p-8 text-center space-y-2 max-w-xl mx-auto",
          className
        )}
      >
        <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
          Not Found
        </p>
        <p className="font-sans text-sm text-foreground font-semibold">
          No shipment found for AWB <span className="text-primary font-mono">{awb}</span>
        </p>
        <p className="font-sans text-xs text-muted-foreground">
          Please verify your AWB number and try again.
        </p>
      </div>
    )
  }

  return (
    <div
      data-slot="tracking-result-view"
      className={cn("space-y-4 max-w-3xl mx-auto", className)}
    >
      {/* Shipment summary card */}
      <div className="border border-border bg-card p-6 space-y-4 shadow-brutal-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground mb-1">
              AWB Number
            </p>
            <p className="font-mono text-lg font-bold text-primary tracking-wider">{shipment.awbNumber}</p>
          </div>
          <StatusBadge variant={shipment.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground mb-1">
              From
            </p>
            <p className="font-sans text-sm text-foreground font-medium">{shipment.senderName}</p>
            <p className="font-mono text-xs text-primary uppercase tracking-wider mt-0.5">
              {shipment.originHub}
            </p>
          </div>
          <div>
            <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground mb-1">
              To
            </p>
            <p className="font-sans text-sm text-foreground font-medium">{shipment.receiverName}</p>
            <p className="font-mono text-xs text-primary uppercase tracking-wider mt-0.5">
              {shipment.destHub}
            </p>
          </div>
        </div>
      </div>

      {/* Tracking timeline */}
      <div className="border border-border bg-card shadow-brutal-sm">
        <div className="px-6 py-3 border-b border-border">
          <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            Tracking History
            <span className="ml-2 text-primary">{events.length} events</span>
          </p>
        </div>

        {events.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="font-sans text-sm text-muted-foreground">
              No tracking events recorded yet.
            </p>
          </div>
        ) : (
          <ol className="divide-y divide-border">
            {events.map((event, i) => (
              <li key={event.id} className={cn("px-6 py-4 flex gap-4", i === 0 && "bg-primary/5")}>
                <div className="shrink-0 pt-0.5">
                  <span
                    className={cn(
                      "block h-2 w-2 rounded-none mt-1.5",
                      i === 0 ? "bg-primary" : "bg-border"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge variant={event.status} />
                    {event.hubCode && (
                      <span className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                        {event.hubCode}
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-sm text-foreground mt-1">
                    {event.description || event.location}
                  </p>
                  {event.location && event.description && (
                    <p className="font-mono text-xs text-muted-foreground">{event.location}</p>
                  )}
                  <p className="font-mono text-2xs text-muted-foreground/70 pt-1">
                    {new Date(event.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

export { TrackingResultView }
export type { TrackingResultViewProps }
