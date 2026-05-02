"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "@workspace/ui/lib/utils"
import type { HubPerformanceDataPoint } from "@workspace/types"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/primitives/chart"

interface HubPerformanceChartProps {
  data: HubPerformanceDataPoint[]
  className?: string
  height?: number
}

const chartConfig = {
  dispatched: {
    label: "Dispatched",
    color: "var(--color-chart-1)",
  },
  delivered: {
    label: "Delivered",
    color: "var(--color-chart-4)",
  },
} satisfies ChartConfig

function HubPerformanceChart({ data, className, height = 240 }: HubPerformanceChartProps) {
  return (
    <div data-slot="hub-performance-chart" className={cn("w-full", className)}>
      <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="hub"
            tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <ChartTooltip cursor={{ fill: "var(--color-muted)", fillOpacity: 0.3 }} content={<ChartTooltipContent indicator="dot" />} />
          <Bar dataKey="dispatched" fill="var(--color-dispatched)" radius={[1, 1, 0, 0]} maxBarSize={32} />
          <Bar dataKey="delivered" fill="var(--color-delivered)" radius={[1, 1, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}

export { HubPerformanceChart }
