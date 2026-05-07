import * as React from "react";
import {
  RiAddLine,
  RiAlertLine,
  RiBox3Line,
  RiPlaneLine,
} from "@remixicon/react";
import { Button } from "@repo/ui/components/button";
import {
  ChartFrame,
  KpiTile,
  ProgressMeter,
  RankBarChart,
  StepAreaChart,
} from "@repo/ui/components/charts";
import {
  getCommandCenterKpis,
  getDeliverySuccessGrowth,
  getShipmentVolume,
  getSuccessRate,
  getTopHubs,
  getUpcomingOperations,
} from "@repo/services/dashboard";

const formatDay = (s: string | number) => {
  const d = new Date(s);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

export default async function OverviewPage() {
  const [kpis, growth, volume, hubs, successRate, upcoming] = await Promise.all([
    getCommandCenterKpis(),
    getDeliverySuccessGrowth(),
    getShipmentVolume({ days: 30 }),
    getTopHubs(),
    getSuccessRate(),
    getUpcomingOperations({ limit: 5 }),
  ]);

  return (
    <main className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <p className="tac-tag">Command center</p>
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          Operations overview
        </h1>
      </header>

      {/* KPI row + command actions */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          caption="Active shipments"
          icon={RiBox3Line}
          value={kpis.active.value.toLocaleString()}
          spark={kpis.active.spark}
          delta={kpis.active.delta}
        />
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

        <article className="flex flex-col justify-between gap-3 rounded border border-chart-grid bg-card p-4">
          <h3 className="tac-caption">Command center</h3>
          <div className="flex flex-col gap-2">
            <Button size="sm" className="rounded">
              <RiAddLine aria-hidden className="size-4" />
              Shipment
            </Button>
            <Button size="sm" variant="outline" className="rounded">
              <RiAddLine aria-hidden className="size-4" />
              Manifest
            </Button>
          </div>
        </article>
      </section>

      {/* Growth + Volume + Upcoming */}
      <section className="grid gap-4 lg:grid-cols-3">
        <ChartFrame
          caption="Growth"
          footer="Delivery success growth · monthly"
        >
          <ProgressMeter
            caption="Success"
            value={growth.value}
            max={growth.max}
            target={growth.target}
            sublabel={growth.label}
          />
        </ChartFrame>

        <ChartFrame caption="Shipment volume" badge="Monthly">
          <StepAreaChart
            data={volume}
            labels={{ y: "Volume", y2: "Prior" }}
            formatX={formatDay}
            formatY={(v) => v.toLocaleString()}
            height={200}
          />
        </ChartFrame>

        <ChartFrame caption="Upcoming operations">
          {upcoming.length === 0 ? (
            <p className="tac-tag">Scheduled events and manifests</p>
          ) : (
            <ul className="flex flex-col divide-y divide-chart-grid">
              {upcoming.map((op) => (
                <li key={op.id} className="flex items-center justify-between gap-2 py-2">
                  <div>
                    <p className="text-sm font-medium">{op.title}</p>
                    <p className="tac-tag">{op.kind}</p>
                  </div>
                  <span className="tac-axis tac-readout">{op.eta}</span>
                </li>
              ))}
            </ul>
          )}
        </ChartFrame>
      </section>

      {/* Hubs + Success rate */}
      <section className="grid gap-4 lg:grid-cols-3">
        <ChartFrame caption="Top hubs" className="lg:col-span-2">
          <RankBarChart items={hubs} />
        </ChartFrame>

        <ChartFrame caption="Success rate">
          <ProgressMeter
            caption="Delivered on commit"
            value={successRate.value}
            max={successRate.max}
            target={successRate.target}
          />
        </ChartFrame>
      </section>
    </main>
  );
}
