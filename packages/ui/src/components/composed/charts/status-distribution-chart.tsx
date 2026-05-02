"use client"

import * as React from "react"
import {
  Cell,
  Pie,
  PieChart,
} from "recharts"
import { cn } from "@workspace/ui/lib/utils"
import type { StatusDistributionDataPoint } from "@workspace/types"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/primitives/chart"

interface StatusDistributionChartProps {
  data: StatusDistributionDataPoint[]
  className?: string
  height?: number
}

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

const chartConfig = {
  count: {
    label: "Count",
  },
} satisfies ChartConfig

function StatusDistributionChart({ data, className, height = 240 }: StatusDistributionChartProps) {
  return (
    <div data-slot="status-distribution-chart" className={cn("w-full", className)}>
      <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <ChartTooltip 
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(val, name, props) => {
                  const item = props.payload as StatusDistributionDataPoint
                  return (
                    <div className="flex flex-col gap-1 w-full pt-1">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        {item.label ?? item.status}
                      </p>
                      <p className="font-mono text-sm font-semibold text-foreground">{item.count}</p>
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

export { StatusDistributionChart }
