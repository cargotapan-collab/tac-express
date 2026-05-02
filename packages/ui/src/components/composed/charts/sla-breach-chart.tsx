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
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@workspace/ui/components/primitives/chart"

export interface SlaBreachBucket {
  /** Time bucket label — e.g. "Wk 14", "Apr 22". */
  bucket: string
  onTime: number
  late: number
  breached: number
}

interface SlaBreachChartProps {
  data: SlaBreachBucket[]
  height?: number
  className?: string
}

const chartConfig = {
  onTime: {
    label: "On time",
    color: "var(--color-chart-1)",
  },
  late: {
    label: "Late",
    color: "var(--color-chart-3)",
  },
  breached: {
    label: "Breached",
    color: "var(--color-destructive)",
  },
} satisfies ChartConfig

export function SlaBreachChart({
  data,
  height = 280,
  className,
}: SlaBreachChartProps) {
  return (
    <div data-slot="sla-breach-chart" className={cn("", className)}>
      <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
          stackOffset="sign"
        >
          <CartesianGrid
            stroke="var(--color-border)"
            strokeDasharray="2 4"
            strokeOpacity={0.4}
            vertical={false}
          />
          <XAxis
            dataKey="bucket"
            tick={{
              fill: "var(--color-muted-foreground)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
            }}
            tickLine={{ stroke: "var(--color-border)" }}
            axisLine={{ stroke: "var(--color-border)" }}
          />
          <YAxis
            tick={{
              fill: "var(--color-muted-foreground)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
            }}
            tickLine={{ stroke: "var(--color-border)" }}
            axisLine={{ stroke: "var(--color-border)" }}
          />
          <ChartTooltip
            cursor={{ fill: "var(--color-muted)", fillOpacity: 0.3 }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="onTime" stackId="sla" fill="var(--color-onTime)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="late" stackId="sla" fill="var(--color-late)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="breached" stackId="sla" fill="var(--color-breached)" radius={[0, 0, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
