"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

export interface LaneHeatmapCell {
  origin: string
  destination: string
  /** Aggregated metric — typically shipment count. */
  value: number
}

interface LaneHeatmapProps {
  /** Hub codes for the rows (origins). */
  origins: string[]
  /** Hub codes for the columns (destinations). */
  destinations: string[]
  cells: LaneHeatmapCell[]
  /** Optional label for the metric (shown in the corner cell + tooltip). */
  metricLabel?: string
  className?: string
  /** Hand off click events for drill-through. */
  onCellClick?: (cell: LaneHeatmapCell) => void
}

/**
 * Origin × Destination matrix heatmap. Hand-rolled because Recharts doesn't
 * ship a native heatmap, and a CSS Grid implementation is both lighter and
 * more accessible (no SVG aria-walking required).
 */
export function LaneHeatmap({
  origins,
  destinations,
  cells,
  metricLabel = "Shipments",
  className,
  onCellClick,
}: LaneHeatmapProps) {
  // Index cells for O(1) lookup
  const cellByKey = React.useMemo(() => {
    const m = new Map<string, LaneHeatmapCell>()
    for (const c of cells) {
      m.set(`${c.origin}-${c.destination}`, c)
    }
    return m
  }, [cells])

  const max = React.useMemo(() => {
    return Math.max(0, ...cells.map((c) => c.value))
  }, [cells])

  return (
    <div
      data-slot="lane-heatmap"
      className={cn(
        "border border-border bg-card",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-border bg-card px-2 py-2 text-left font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {metricLabel}
              </th>
              {destinations.map((d) => (
                <th
                  key={d}
                  className="border-b border-border px-2 py-2 text-center font-mono text-[10px] uppercase tracking-widest text-foreground"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {origins.map((o) => (
              <tr key={o}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-border bg-card px-2 py-1 text-left font-mono text-[10px] font-semibold uppercase tracking-widest"
                >
                  {o}
                </th>
                {destinations.map((d) => {
                  const cell = cellByKey.get(`${o}-${d}`)
                  const v = cell?.value ?? 0
                  const intensity = max > 0 ? v / max : 0
                  const isSelf = o === d
                  return (
                    <td
                      key={`${o}-${d}`}
                      data-empty={v === 0 || isSelf}
                      className="relative border-r border-b border-border/40 p-0"
                    >
                      <button
                        type="button"
                        onClick={() => cell && onCellClick?.(cell)}
                        disabled={isSelf || v === 0}
                        title={
                          isSelf
                            ? `${o} → ${d} (self)`
                            : `${o} → ${d} · ${v.toLocaleString("en-IN")} ${metricLabel.toLowerCase()}`
                        }
                        aria-label={`${o} to ${d}, ${v} ${metricLabel.toLowerCase()}`}
                        className={cn(
                          "flex size-full min-h-[2rem] min-w-[3rem] items-center justify-center font-mono text-[11px] font-semibold transition-colors",
                          isSelf && "cursor-not-allowed bg-muted/30 text-muted-foreground/50",
                          !isSelf && v === 0 && "text-muted-foreground/40",
                          !isSelf && v > 0 && "text-foreground hover:outline hover:outline-1 hover:outline-primary"
                        )}
                        style={
                          isSelf
                            ? undefined
                            : {
                                backgroundColor: `oklch(50% calc(${intensity} * 0.20) 260 / ${0.05 + intensity * 0.95})`,
                              }
                        }
                      >
                        {isSelf ? "—" : v > 0 ? v.toLocaleString("en-IN") : ""}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
