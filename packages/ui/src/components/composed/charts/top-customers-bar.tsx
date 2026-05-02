"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  Cell,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@workspace/ui/lib/utils"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/primitives/chart"

export interface TopCustomerDataPoint {
  customerId: string
  customerName: string
  /** Aggregated metric — revenue or shipment count. */
  value: number
  /** Optional secondary metric — e.g. shipment count when value is revenue. */
  secondary?: number
}

interface TopCustomersBarProps {
  data: TopCustomerDataPoint[]
  /** Height of the chart in pixels. */
  height?: number
  /** Format the primary value (e.g. "₹") for the axis + tooltip. */
  valueFormat?: "currency" | "count"
  /** Cap the displayed list to top N. Default 10. */
  topN?: number
  className?: string
}

const fmtINR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
  notation: "compact",
})

const fmtCount = new Intl.NumberFormat("en-IN", {
  notation: "compact",
})

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

export function TopCustomersBar({
  data,
  height = 320,
  valueFormat = "currency",
  topN = 10,
  className,
}: TopCustomersBarProps) {
  const sorted = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, topN)

  const fmt = valueFormat === "currency" ? fmtINR : fmtCount

  return (
    <div data-slot="top-customers-bar" className={cn("", className)}>
      <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
        >
          <XAxis
            type="number"
            tickFormatter={(v: number) => fmt.format(v)}
            tick={{
              fill: "var(--color-muted-foreground)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
            }}
            tickLine={{ stroke: "var(--color-border)" }}
            axisLine={{ stroke: "var(--color-border)" }}
          />
          <YAxis
            type="category"
            dataKey="customerName"
            width={140}
            interval={0}
            tick={{
              fill: "var(--color-foreground)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
            }}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip
            cursor={{ fill: "var(--color-muted)", fillOpacity: 0.4 }}
            content={
              <ChartTooltipContent
                indicator="dot"
                hideLabel
                formatter={(val, name, props) => {
                  const p = props.payload
                  return (
                    <div className="flex flex-col gap-1 w-full pt-1">
                      <div className="flex items-center justify-between w-full gap-4">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {p.customerName}
                        </span>
                        <span className="font-heading text-sm font-semibold">
                          {fmt.format(val as number)}
                        </span>
                      </div>
                      {typeof p.secondary === "number" && (
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">
                          {p.secondary.toLocaleString("en-IN")} shipments
                        </div>
                      )}
                    </div>
                  )
                }}
              />
            }
          />
          <Bar dataKey="value" radius={0}>
            {sorted.map((d, i) => (
              <Cell
                key={d.customerId}
                fill={i === 0 ? "var(--color-value)" : "var(--color-chart-2)"}
                fillOpacity={i === 0 ? 1 : 0.85 - (i / sorted.length) * 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}
