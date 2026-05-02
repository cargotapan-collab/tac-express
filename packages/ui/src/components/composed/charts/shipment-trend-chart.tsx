"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import type { ShipmentTrendDataPoint } from "@workspace/types"
import { cn } from "@workspace/ui/lib/utils"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/primitives/chart"

interface ShipmentTrendChartProps {
  data: ShipmentTrendDataPoint[]
  className?: string
  height?: number
}

const chartConfig = {
  shipments: {
    label: "Dispatched",
    color: "var(--primary)",
  },
  delivered: {
    label: "Delivered",
    color: "color-mix(in oklch, var(--primary) 40%, transparent)",
  },
} satisfies ChartConfig

export function ShipmentTrendChart({ data, className, height = 240 }: ShipmentTrendChartProps) {
  return (
    <div data-slot="shipment-trend-chart" className={cn("w-full relative", className)}>
      <ChartContainer
        config={chartConfig}
        className="w-full"
        style={{ height }}
      >
        <AreaChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="fillShipments" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-shipments)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--color-shipments)"
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="fillDelivered" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-delivered)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--color-delivered)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--color-muted-foreground)" }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }}
          />
          <ChartTooltip
            cursor={{ stroke: "var(--muted)", strokeWidth: 2, strokeDasharray: "4 4" }}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
                indicator="dot"
              />
            }
          />
          <Area
            dataKey="delivered"
            type="natural"
            fill="url(#fillDelivered)"
            stroke="var(--color-delivered)"
            strokeWidth={2}
            stackId="a"
          />
          <Area
            dataKey="shipments"
            type="natural"
            fill="url(#fillShipments)"
            stroke="var(--color-shipments)"
            strokeWidth={2}
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
