"use client"

import * as React from "react"
import { PolarGrid, RadialBar, RadialBarChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/primitives/chart"
import { cn } from "@workspace/ui/lib/utils"

interface GaugeChartProps {
  percentage: number
  className?: string
}

const chartConfig = {
  success: {
    label: "Success Rate",
    color: "var(--accent-success)",
  },
} satisfies ChartConfig

export function GaugeChart({ percentage, className }: GaugeChartProps) {
  const chartData = [
    { name: "success", value: percentage, fill: "var(--color-success)" },
  ]

  return (
    <div className={cn("relative w-full h-40 flex items-center justify-center overflow-hidden", className)}>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full max-h-[160px]"
      >
        <RadialBarChart 
          data={chartData} 
          innerRadius={45} 
          outerRadius={80} 
          startAngle={90} 
          endAngle={-270}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel nameKey="name" />}
          />
          <PolarGrid gridType="circle" stroke="var(--border)" strokeDasharray="3 3" />
          <RadialBar dataKey="value" background={{ fill: "var(--muted)" }} cornerRadius={0} />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground font-heading text-2xl font-bold"
          >
            {percentage}%
          </text>
        </RadialBarChart>
      </ChartContainer>
    </div>
  )
}
