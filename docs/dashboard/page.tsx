import * as React from "react";
import {
  RiAlertLine,
  RiBox3Line,
  RiCheckboxCircleLine,
  RiHandCoinLine,
  RiPlaneLine,
  RiTimeLine,
} from "@remixicon/react";
import {
  ChartFrame,
  KpiTile,
  LaneHeatmap,
  RankBarChart,
  SegmentBar,
  StackedColumnChart,
  StepAreaChart,
} from "@repo/ui/components/charts";
import {
  getAnalyticsKpis,
  getHubPerformance,
  getLaneHeatmap,
  getRevenueTrend,
  getServiceMix,
  getShipmentTrend,
  getSlaBreachDistribution,
  getStatusDistribution,
  getTopCustomers,
} from "@repo/services/analytics";

/* ── pure UI formatters; not business logic ──────────────────────── */

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const compactInr = (n: number) => {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${n}`;
};
const formatDay = (s: string | number) => {
  const d = new Date(s);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};
const formatMonth = (s: string | number) => {
  const d = new Date(typeof s === "string" ? `${s}-01` : s);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
};

/* ── page ─────────────────────────────────────────────────────────── */

export default async function AnalyticsPage() {
  const [
    kpis,
    shipmentTrend,
    revenueTrend,
    statusDistribution,
    hubPerformance,
    serviceMix,
    topCustomers,
    slaBreach,
    laneHeatmap,
  ] = await Promise.all([
    getAnalyticsKpis(),
    getShipmentTrend({ days: 30 }),
    getRevenueTrend({ months: 6 }),
    getStatusDistribution(),
    getHubPerformance(),
    getServiceMix(),
    getTopCustomers({ limit: 10 }),
    getSlaBreachDistribution({ days: 30 }),
    getLaneHeatmap(),
  ]);

  return (
    <main className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <p className="tac-tag">Business</p>
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Operations overview across all hubs
        </p>
      </header>

      {/* KPI grid · row 1 */}
      <section
        aria-label="Primary indicators"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <KpiTile
          caption="Total shipments"
          icon={RiBox3Line}
          value={kpis.totalShipments.value.toLocaleString()}
          spark={kpis.totalShipments.spark}
          delta={kpis.totalShipments.delta}
        />
        <KpiTile
          caption="Total revenue"
          icon={RiHandCoinLine}
          value={inr(kpis.totalRevenue.value)}
          spark={kpis.totalRevenue.spark}
          delta={kpis.totalRevenue.delta}
        />
        <KpiTile
          caption="Delivered"
          icon={RiCheckboxCircleLine}
          value={kpis.delivered.value.toLocaleString()}
          sublabel={`${Math.round(kpis.delivered.rate * 100)}% delivery rate`}
          spark={kpis.delivered.spark}
        />
      </section>

      {/* KPI grid · row 2 */}
      <section
        aria-label="Operational indicators"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <KpiTile
          caption="In transit"
          icon={RiPlaneLine}
          value={kpis.inTransit.value.toLocaleString()}
          spark={kpis.inTransit.spark}
        />
        <KpiTile
          caption="Open exceptions"
          icon={RiAlertLine}
          value={kpis.openExceptions.value.toLocaleString()}
          sublabel={kpis.openExceptions.value === 0 ? "All clear" : undefined}
          spark={kpis.openExceptions.spark}
        />
        <KpiTile
          caption="Avg delivery days"
          icon={RiTimeLine}
          value={
            kpis.avgDeliveryDays.value === null
              ? "N/A"
              : kpis.avgDeliveryDays.value.toFixed(1)
          }
          spark={kpis.avgDeliveryDays.spark}
        />
      </section>

      {/* Time-series row */}
      <section className="grid gap-4 lg:grid-cols-2">
        <ChartFrame caption="Shipment trend · 30 days">
          <StepAreaChart
            data={shipmentTrend}
            labels={{ y: "Shipments" }}
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
          <SegmentBar segments={statusDistribution} />
        </ChartFrame>

        <ChartFrame caption="Hub performance">
          <RankBarChart items={hubPerformance} />
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

      {/* SLA */}
      <ChartFrame
        caption="SLA breach distribution"
        footer="Semantic tones: green = ontime, amber = late, red = breached"
      >
        <StackedColumnChart data={slaBreach} formatX={formatDay} />
      </ChartFrame>

      {/* Lanes */}
      <ChartFrame caption="Lane heatmap · origin × destination">
        <LaneHeatmap {...laneHeatmap} />
      </ChartFrame>
    </main>
  );
}
