"use client"

import * as React from "react"
import { Cell, Pie, PieChart, Label } from "recharts"

import { cn } from "@workspace/ui/lib/utils"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/primitives/chart"

export interface ServiceMixDataPoint {
  /** Bucket key — e.g. "STANDARD", "EXPRESS", "PRIORITY". */
  key: string
  /** Display label — e.g. "Standard", "Express", "Priority". */
  label: string
  /** Volume in this bucket. */
  value: number
  /** Optional revenue contribution for the bucket. */
  revenue?: number
}

interface ServiceMixDonutProps {
  data: ServiceMixDataPoint[]
  height?: number
  className?: string
  /** Locale + currency for revenue formatting in the tooltip. */
  locale?: string
  currency?: string
}

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

function fmtINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

const chartConfig = {
  value: {
    label: "Shipments",
  },
} satisfies ChartConfig

export function ServiceMixDonut({
  data,
  height = 240,
  className,
}: ServiceMixDonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const top = [...data].sort((a, b) => b.value - a.value)[0]

  return (
    <div data-slot="service-mix-donut" className={cn("relative", className)}>
      <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={1}
            stroke="var(--color-background)"
            strokeWidth={1}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.key}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
            {top && total > 0 && (
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-muted-foreground font-mono text-[10px] uppercase tracking-widest"
                        >
                          {top.label}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-foreground font-heading text-2xl font-bold tracking-tight"
                        >
                          {Math.round((top.value / total) * 100)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground font-mono text-[10px] uppercase tracking-widest"
                        >
                          of {total.toLocaleString("en-IN")}
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            )}
          </Pie>
          <ChartTooltip 
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(val, name, props) => {
                  const p = props.payload as ServiceMixDataPoint
                  const pct = total > 0 ? Math.round((p.value / total) * 100) : 0
                  return (
                    <div className="flex flex-col gap-1 w-full pt-1">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {p.label}
                      </p>
                      <p className="font-heading text-sm font-semibold">
                        {p.value.toLocaleString("en-IN")} shipments · {pct}%
                      </p>
                      {typeof p.revenue === "number" && (
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {fmtINR(p.revenue)}
                        </p>
                      )}
                    </div>
                  )
                }}
              />
            }
          />
        </PieChart>
      </ChartContainer>
    </div>
  )
}
