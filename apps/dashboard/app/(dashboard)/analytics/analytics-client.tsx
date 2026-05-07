"use client"

import * as React from "react"

import {
  RiAlertLine,
  RiBox3Line,
  RiCheckLine,
  RiExchangeFundsLine,
  RiPlaneLine,
  RiTimeLine,
} from "@workspace/ui/icons"
import {
  ChartFrame,
  KpiTile,
  LaneHeatmap,
  ProgressMeter,
  RankBarChart,
  SegmentBar,
  StackedColumnChart,
  StepAreaChart,
} from "@workspace/ui/components/charts"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import {
  useAnalyticsKpis,
  useHubRank,
  useLaneHeatmap,
  useRevenueTrendSeries,
  useServiceMix,
  useShipmentTrendSeries,
  useSlaBreachBuckets,
  useStatusSegments,
  useTopCustomers,
} from "@workspace/services/hooks/use-orbital"

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
const compactInr = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`
  return `₹${n}`
}
const formatDay = (s: string | number) => {
  const d = new Date(s)
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
}
const formatMonth = (s: string | number) => {
  const d = new Date(typeof s === "string" ? `${s}-01` : s)
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
}

export function AnalyticsClient() {
  const { data: kpis } = useAnalyticsKpis()
  const { data: shipmentTrend = [] } = useShipmentTrendSeries(30)
  const { data: revenueTrend = [] } = useRevenueTrendSeries(6)
  const { data: statusSegments = [] } = useStatusSegments()
  const { data: hubRank = [] } = useHubRank()
  const { data: serviceMix = [] } = useServiceMix()
  const { data: topCustomers = [] } = useTopCustomers(10)
  const { data: slaBuckets = [] } = useSlaBreachBuckets(30)
  const { data: laneHeatmap } = useLaneHeatmap()

  return (
    <div className="space-y-6">
      <PageHeader
        overline="Business"
        title="Analytics"
        description="Operations overview across all hubs"
      />

      {/* KPI grid · row 1 */}
      <section
        aria-label="Primary indicators"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <KpiTile
          caption="Total shipments"
          icon={RiBox3Line}
          value={kpis ? kpis.totalShipments.value.toLocaleString() : "—"}
          spark={kpis?.totalShipments.spark}
          delta={kpis?.totalShipments.delta}
        />
        <KpiTile
          caption="Total revenue"
          icon={RiExchangeFundsLine}
          value={kpis ? inr(kpis.totalRevenue.value) : "—"}
          spark={kpis?.totalRevenue.spark}
          delta={kpis?.totalRevenue.delta}
        />
        <KpiTile
          caption="Delivered"
          icon={RiCheckLine}
          value={kpis ? kpis.delivered.value.toLocaleString() : "—"}
          sublabel={
            kpis
              ? `${Math.round(kpis.delivered.rate * 100)}% delivery rate`
              : undefined
          }
          spark={kpis?.delivered.spark}
        />
      </section>

      {/* KPI grid · row 2 */}
      <section
        aria-label="Operational indicators"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <KpiTile
          caption="In transit"
          icon={RiPlaneLine}
          value={kpis ? kpis.inTransit.value.toLocaleString() : "—"}
          spark={kpis?.inTransit.spark}
        />
        <KpiTile
          caption="Open exceptions"
          icon={RiAlertLine}
          value={kpis ? kpis.openExceptions.value.toLocaleString() : "—"}
          sublabel={
            kpis && kpis.openExceptions.value === 0 ? "All clear" : undefined
          }
        />
        <KpiTile
          caption="Avg delivery days"
          icon={RiTimeLine}
          value={
            kpis?.avgDeliveryDays.value !== null &&
            kpis?.avgDeliveryDays.value !== undefined
              ? `${kpis.avgDeliveryDays.value}d`
              : "N/A"
          }
        />
      </section>

      {/* Time-series row */}
      <section className="grid gap-4 lg:grid-cols-2">
        <ChartFrame caption="Shipment trend · 30 days">
          <StepAreaChart
            data={shipmentTrend}
            labels={{ y: "Shipments", y2: "Delivered" }}
            formatX={formatDay}
            formatY={(v) => v.toLocaleString()}
          />
        </ChartFrame>

        <ChartFrame caption="Revenue trend · 6 months">
          <StepAreaChart
            data={revenueTrend}
            labels={{ y: "Revenue" }}
            formatX={formatMonth}
            formatY={compactInr}
            formatTooltipValue={(v) => inr(v)}
          />
        </ChartFrame>
      </section>

      {/* Composition + ranking row */}
      <section className="grid gap-4 lg:grid-cols-2">
        <ChartFrame caption="Status distribution">
          <SegmentBar segments={statusSegments} />
        </ChartFrame>

        <ChartFrame caption="Hub performance">
          <RankBarChart items={hubRank} />
        </ChartFrame>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartFrame caption="Service mix">
          <SegmentBar segments={serviceMix} />
        </ChartFrame>

        <ChartFrame caption="Top customers · revenue">
          <RankBarChart items={topCustomers} formatValue={inr} />
        </ChartFrame>
      </section>

      {/* Delivery success — Progress meter complements the SLA bucket chart */}
      {kpis && kpis.totalShipments.value > 0 && (
        <section className="grid gap-4 lg:grid-cols-2">
          <ChartFrame caption="Delivery success">
            <ProgressMeter
              caption="Delivered on commit"
              value={Math.round(kpis.delivered.rate * 100)}
              max={100}
              target={85}
              sublabel={`${kpis.delivered.value.toLocaleString()} of ${kpis.totalShipments.value.toLocaleString()} delivered`}
            />
          </ChartFrame>

          <ChartFrame
            caption="SLA breach distribution"
            footer="Tones: green = ontime, amber = late, red = breached"
          >
            <StackedColumnChart data={slaBuckets} formatX={formatDay} />
          </ChartFrame>
        </section>
      )}

      {/* Lane heatmap */}
      {laneHeatmap && (
        <ChartFrame caption="Lane heatmap · origin × destination">
          <LaneHeatmap {...laneHeatmap} />
        </ChartFrame>
      )}
    </div>
  )
}
