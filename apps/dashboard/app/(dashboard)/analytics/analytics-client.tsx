"use client"

import * as React from "react"

import {
  useAnalyticsSummary,
  useShipmentTrend,
  useRevenueTrend,
  useStatusDistribution,
  useHubPerformance,
} from "@workspace/services/hooks/use-analytics"
import { useShipments } from "@workspace/services/hooks/use-shipments"
import { useInvoices } from "@workspace/services/hooks/use-invoices"
import {
  RevenueTrendChart,
  ShipmentTrendChart,
  StatusDistributionChart,
  HubPerformanceChart,
  ServiceMixDonut,
  TopCustomersBar,
  SlaBreachChart,
  LaneHeatmap,
  type ServiceMixDataPoint,
  type TopCustomerDataPoint,
  type SlaBreachBucket,
  type LaneHeatmapCell,
} from "@workspace/ui/components/composed/charts"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { KPICard } from "@workspace/ui/components/composed/dashboard/kpi-card"
import {
  RiBox3Line,
  RiExchangeFundsLine,
  RiCheckLine,
  RiPlaneLine,
  RiAlertLine,
  RiTimeLine,
} from "@workspace/ui/icons"

export function AnalyticsClient() {
  const { data: summary, isLoading: loadingSummary } = useAnalyticsSummary()
  const { data: shipmentTrend } = useShipmentTrend(30)
  const { data: revenueTrend } = useRevenueTrend(6)
  const { data: statusDist } = useStatusDistribution()
  const { data: hubPerf } = useHubPerformance()

  // Derived chart inputs — pulled from the underlying shipment + invoice
  // queries the dashboard already issues, no new analytics RPCs required.
  const { data: shipments = [] } = useShipments({ pageSize: 500 })
  const { data: invoices = [] } = useInvoices({})

  const serviceMix = React.useMemo<ServiceMixDataPoint[]>(() => {
    const counts: Record<string, ServiceMixDataPoint> = {}
    for (const s of shipments) {
      const key = (s as unknown as { serviceLevel?: string }).serviceLevel ?? "STANDARD"
      counts[key] ??= {
        key,
        label: key.charAt(0) + key.slice(1).toLowerCase(),
        value: 0,
        revenue: 0,
      }
      counts[key].value += 1
    }
    return Object.values(counts)
  }, [shipments])

  const topCustomers = React.useMemo<TopCustomerDataPoint[]>(() => {
    const byCustomer = new Map<
      string,
      { name: string; revenue: number; count: number }
    >()
    for (const inv of invoices) {
      const id = inv.customerId ?? "unknown"
      const cur = byCustomer.get(id) ?? {
        name: inv.customerName ?? "—",
        revenue: 0,
        count: 0,
      }
      cur.revenue += inv.totalAmount ?? 0
      cur.count += 1
      byCustomer.set(id, cur)
    }
    return Array.from(byCustomer.entries()).map(([customerId, v]) => ({
      customerId,
      customerName: v.name,
      value: v.revenue,
      secondary: v.count,
    }))
  }, [invoices])

  const slaBuckets = React.useMemo<SlaBreachBucket[]>(() => {
    if (!shipmentTrend) return []
    // Heuristic v1 — until SLA tables ship in Phase 6.5, derive on-time vs
    // late vs breached from the shipmentTrend series. Phase 6.5 replaces this
    // with real `sla_breaches` data.
    return shipmentTrend.slice(-12).map((d) => {
      const total = d.shipments ?? 0
      const delivered = d.delivered ?? 0
      const late = Math.max(0, total - delivered) // rough proxy
      const breached = Math.round(late * 0.2)
      return {
        bucket: d.date.slice(5),
        onTime: delivered,
        late: Math.max(0, late - breached),
        breached,
      }
    })
  }, [shipmentTrend])

  const laneOrigins = React.useMemo(() => {
    const set = new Set<string>()
    shipments.forEach((s) => set.add(s.originHub))
    return Array.from(set)
  }, [shipments])
  const laneDestinations = React.useMemo(() => {
    const set = new Set<string>()
    shipments.forEach((s) => set.add(s.destHub))
    return Array.from(set)
  }, [shipments])
  const laneCells = React.useMemo<LaneHeatmapCell[]>(() => {
    const map = new Map<string, LaneHeatmapCell>()
    for (const s of shipments) {
      const key = `${s.originHub}-${s.destHub}`
      const cur = map.get(key) ?? {
        origin: s.originHub,
        destination: s.destHub,
        value: 0,
      }
      cur.value += 1
      map.set(key, cur)
    }
    return Array.from(map.values())
  }, [shipments])

  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`

  return (
    <div className="space-y-6">
      <PageHeader
        overline="Business"
        title="Analytics"
        description="Operations overview across all hubs"
      />

      {loadingSummary ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse border border-border bg-card"
            />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <KPICard
            label="Total Shipments"
            value={summary.totalShipments.toLocaleString()}
            icon={<RiBox3Line className="h-4 w-4" />}
          />
          <KPICard
            label="Total Revenue"
            value={fmt(summary.totalRevenue)}
            icon={<RiExchangeFundsLine className="h-4 w-4" />}
            accent="success"
          />
          <KPICard
            label="Delivered"
            value={summary.deliveredCount.toLocaleString()}
            deltaLabel={`${summary.totalShipments > 0 ? Math.round((summary.deliveredCount / summary.totalShipments) * 100) : 0}% delivery rate`}
            icon={<RiCheckLine className="h-4 w-4" />}
            accent="success"
            delta="positive"
          />
          <KPICard
            label="In Transit"
            value={summary.inTransitCount.toLocaleString()}
            icon={<RiPlaneLine className="h-4 w-4" />}
            accent="warning"
          />
          <KPICard
            label="Open Exceptions"
            value={summary.exceptionCount.toLocaleString()}
            deltaLabel={
              summary.exceptionCount > 0 ? "Needs attention" : "All clear"
            }
            icon={<RiAlertLine className="h-4 w-4" />}
            accent={summary.exceptionCount > 0 ? "danger" : "primary"}
            delta={summary.exceptionCount > 0 ? "negative" : "neutral"}
          />
          <KPICard
            label="Avg Delivery Days"
            value={
              summary.avgDeliveryDays > 0
                ? `${summary.avgDeliveryDays}d`
                : "N/A"
            }
            icon={<RiTimeLine className="h-4 w-4" />}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {shipmentTrend && shipmentTrend.length > 0 && (
          <ChartCard title="Shipment Trend · 30 days">
            <ShipmentTrendChart
              data={shipmentTrend.map((d) => ({
                date: d.date,
                shipments: d.shipments,
                delivered: d.delivered,
              }))}
            />
          </ChartCard>
        )}
        {revenueTrend && revenueTrend.length > 0 && (
          <ChartCard title="Revenue Trend · 6 months">
            <RevenueTrendChart data={revenueTrend} />
          </ChartCard>
        )}
        {statusDist && statusDist.length > 0 && (
          <ChartCard title="Status Distribution">
            <StatusDistributionChart
              data={statusDist.map((d) => ({
                status: d.status,
                count: d.count,
                label: d.label,
              }))}
            />
          </ChartCard>
        )}
        {hubPerf && hubPerf.length > 0 && (
          <ChartCard title="Hub Performance">
            <HubPerformanceChart
              data={hubPerf.map((d) => ({
                hub: d.hub,
                dispatched: d.dispatched,
                delivered: d.delivered,
              }))}
            />
          </ChartCard>
        )}
        {serviceMix.length > 0 && (
          <ChartCard title="Service Mix">
            <ServiceMixDonut data={serviceMix} />
          </ChartCard>
        )}
        {topCustomers.length > 0 && (
          <ChartCard title="Top Customers · revenue">
            <TopCustomersBar data={topCustomers} />
          </ChartCard>
        )}
        {slaBuckets.length > 0 && (
          <div className="lg:col-span-2">
            <ChartCard title="SLA breach distribution">
              <SlaBreachChart data={slaBuckets} />
            </ChartCard>
          </div>
        )}
        {laneCells.length > 0 && (
          <div className="lg:col-span-2">
            <ChartCard title="Lane heatmap · origin × destination">
              <LaneHeatmap
                origins={laneOrigins}
                destinations={laneDestinations}
                cells={laneCells}
              />
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  )
}

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="tac-fui-panel space-y-3 bg-card p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  )
}
