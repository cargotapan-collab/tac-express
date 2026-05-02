import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { RiBox3Line, RiCheckboxCircleLine, RiFlightTakeoffLine } from "@workspace/ui/icons"
import { Border1 } from "@workspace/ui/components/pixel-perfect/border1"

interface HeroStatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  activeShipments?: number
  onTimeRate?: string
  nextFlight?: string
}

function HeroStatsCard({
  className,
  activeShipments = 127,
  onTimeRate = "98.2%",
  nextFlight = "14:30",
  ...props
}: HeroStatsCardProps) {
  return (
    <div
      data-slot="hero-stats-card"
      className={cn(
        "relative bg-card border border-border p-6 flex flex-col gap-4 min-w-60 rounded-none",
        className
      )}
      {...props}
    >
      <Border1 />
      <div className="relative z-20 flex items-center gap-3 text-sm text-foreground">
        <RiBox3Line className="size-5 text-primary" aria-hidden="true" />
        <span className="font-medium">Active: {activeShipments} shipments</span>
      </div>
      
      <div className="relative z-20 flex items-center gap-3 text-sm text-foreground">
        <RiCheckboxCircleLine className="size-5 text-primary" aria-hidden="true" />
        <span className="font-medium">On-time rate: {onTimeRate}</span>
      </div>
      
      <div className="relative z-20 flex items-center gap-3 text-sm text-foreground">
        <RiFlightTakeoffLine className="size-5 text-muted-foreground" aria-hidden="true" />
        <span className="font-medium">Next flight: {nextFlight}</span>
      </div>
    </div>
  )
}

export { HeroStatsCard }
export type { HeroStatsCardProps }
