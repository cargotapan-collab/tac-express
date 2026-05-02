"use client"

import * as React from "react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { cn } from "@workspace/ui/lib/utils"
import type { RevenueTrendDataPoint } from "@workspace/types"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/primitives/chart"

interface RevenueTrendChartProps {
  data: RevenueTrendDataPoint[]
  className?: string
  formatValue?: (value: number) => string
  height?: number
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig

function RevenueTrendChart({ data, className, formatValue: _formatValue, height = 240 }: RevenueTrendChartProps) {
  return (
    <div data-slot="revenue-trend-chart" className={cn("w-full", className)}>
      <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            width={48}
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3", stroke: "var(--color-border)" }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-revenue)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "var(--color-revenue)", stroke: "var(--color-background)", strokeWidth: 2 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}

export { RevenueTrendChart }
