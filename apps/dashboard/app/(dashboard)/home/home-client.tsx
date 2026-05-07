"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { useRealtimeDashboard } from "@workspace/ui/hooks/use-realtime"
import {
  useDashboardKPIs,
  useOperationalHealth,
  useSLABreaches,
} from "@workspace/services/hooks/use-dashboard"
import { useStatusDistribution, useHubPerformance } from "@workspace/services/hooks/use-analytics"
import {
  useDeliverySuccessGrowth,
  useShipmentVolume,
  useSuccessRate,
  useTopHubs,
  useUpcomingOperations,
} from "@workspace/services/hooks/use-orbital"
import {
  RiArrowRightLine,
  RiArrowUpLine,
  RiBuilding4Line,
  RiTruckLine,
  RiAlertFill,
  RiBarChart2Fill,
} from "@workspace/ui/icons"
import type { KPIData } from "@workspace/services/dashboard.service"
import { ProgressMeter, StepAreaChart } from "@workspace/ui/components/charts"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import Image from "next/image"
import Link from "next/link"

interface HomeClientProps {
  initialKpis: KPIData
}

const formatDay = (s: string | number) => {
  const d = new Date(s)
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
}

export function HomeClient({ initialKpis }: HomeClientProps) {
  // The realtime hook subscribes to Supabase channels and warms the
  // shared dashboard caches; calls below are kept for their cache-warming
  // side-effects even where the return value isn't consumed in this view.
  useRealtimeDashboard()

  const kpisQuery = useDashboardKPIs()
  useOperationalHealth()
  useSLABreaches(8)
  useStatusDistribution()
  useHubPerformance()

  const { data: growth } = useDeliverySuccessGrowth()
  const { data: volume = [] } = useShipmentVolume(30)
  const { data: successRate } = useSuccessRate()
  const { data: topHubs = [] } = useTopHubs()
  const { data: upcoming = [] } = useUpcomingOperations(5)

  const kpis = kpisQuery.data ?? initialKpis

  return (
    <div className="space-y-6">
      <PageHeader
        overline="Platform"
        title="Dashboard"
        description="Real-time operations overview across the network"
      />

      {/* ── BANNER ILLUSTRATION ── decorative panel, no embedded controls */}
      <section
        aria-label="Network status banner"
        className="relative h-40 w-full overflow-hidden border border-border bg-card shadow-md lg:h-48"
      >
        <Image
          src="/dashboard-banner.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 1200px, 100vw"
          className="object-cover object-center opacity-80 dark:opacity-60"
        />
        {/* Gradient overlay for text legibility — solid token, not random hex */}
        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-transparent" />

        {/* L-bracket markers — consistent with viewport frame vocabulary */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 h-4 w-4 border-l-2 border-t-2 border-primary"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 z-10 h-4 w-4 border-b-2 border-r-2 border-border"
        />

        {/* Hazard band along the bottom edge */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-1 tac-hazard-stripes opacity-60"
        />

        {/* Banner copy on the left — solid stack, no glassmorphism */}
        <div className="relative z-20 flex h-full max-w-xl flex-col justify-center gap-2 px-6 lg:px-8">
          <span className="t-overline text-primary">TAC EXPRESS · NETWORK</span>
          <h2 className="t-h2 text-foreground">Welcome back, Operator</h2>
          <p className="t-body-sm text-muted-foreground">
            Live shipment, manifest, and SLA telemetry across every hub.
          </p>
        </div>

        {/* Status tag, top-right */}
        <div className="absolute right-5 top-5 z-20 flex items-center gap-2 border border-border bg-background px-2 py-1">
          <span
            aria-hidden
            className="inline-block size-1.5 bg-accent-success tac-blink motion-reduce:animate-none"
          />
          <span className="tac-tag text-foreground">DISPATCH · LIVE</span>
        </div>
      </section>

      {/* ── KPI ROW ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 — Active Shipments */}
        <div className="bg-surface tac-fui-hover relative flex h-32 flex-col justify-between border border-border p-5 shadow-brutal-sm group">
          <div className="flex items-center gap-2">
            <RiBarChart2Fill className="h-4 w-4 text-primary" />
            <span className="t-body-sm font-medium text-muted-foreground">Active Shipments</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-mono text-4xl font-bold transition-colors group-hover:text-primary">
              {kpis?.activeShipments?.toLocaleString() ?? "0"}
            </span>
            <div className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-border bg-background shadow-2xs transition-colors group-hover:bg-primary group-hover:text-background">
              <RiArrowUpLine className="h-4 w-4 rotate-45" />
            </div>
          </div>
        </div>

        {/* Card 2 — In Transit */}
        <div className="bg-surface tac-fui-hover relative flex h-32 flex-col justify-between border border-border p-5 shadow-brutal-sm group">
          <div className="flex items-center gap-2">
            <RiTruckLine className="h-4 w-4 text-primary" />
            <span className="t-body-sm font-medium text-muted-foreground">In Transit</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-mono text-4xl font-bold transition-colors group-hover:text-primary">
              {kpis?.inTransit?.toLocaleString() ?? "0"}
            </span>
            <div className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-border bg-background shadow-2xs transition-colors group-hover:bg-primary group-hover:text-background">
              <RiArrowUpLine className="h-4 w-4 rotate-45" />
            </div>
          </div>
        </div>

        {/* Card 3 — Open Exceptions */}
        <div className="bg-surface tac-fui-hover relative flex h-32 flex-col justify-between border border-border p-5 shadow-brutal-sm group">
          <div className="flex items-center gap-2">
            <RiAlertFill className="h-4 w-4 text-accent-warning" />
            <span className="t-body-sm font-medium text-muted-foreground">Open Exceptions</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-mono text-4xl font-bold transition-colors group-hover:text-primary">
              {kpis?.openExceptions?.toLocaleString() ?? "0"}
            </span>
            <div className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-border bg-background shadow-2xs transition-colors group-hover:bg-primary group-hover:text-background">
              <RiArrowUpLine className="h-4 w-4 rotate-45" />
            </div>
          </div>
        </div>

        {/* Card 4 — Command Center */}
        <div className="tac-fui-hover flex h-32 flex-col justify-between border border-primary/30 bg-card p-5 shadow-brutal-sm">
          <span className="t-body-sm font-semibold text-foreground">Command Center</span>
          <div className="flex items-center gap-2">
            <Link
              href="/shipments/create"
              className="t-body-sm flex flex-1 items-center justify-center gap-1 border border-primary bg-primary px-3 py-2 text-center font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              + Shipment
            </Link>
            <Link
              href="/manifests/create"
              className="t-body-sm flex flex-1 items-center justify-center gap-1 border border-border bg-background px-3 py-2 text-center font-medium text-foreground transition-colors hover:bg-muted"
            >
              + Manifest
            </Link>
          </div>
        </div>
      </div>

      {/* ── MIDDLE SECTION (3 Cols) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Growth — delivery success rate vs. 6-month target */}
        <div className="bg-surface min-h-panel-xl relative flex flex-col border border-border p-6 shadow-brutal-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="t-h3 font-semibold">Growth</h3>
            <span className="border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
              6 months
            </span>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <ProgressMeter
              caption="Delivery success"
              value={growth?.value ?? 0}
              max={growth?.max ?? 100}
              target={growth?.target ?? 85}
              sublabel={growth?.label}
            />
          </div>
        </div>

        {/* Shipment Volume — current 30-day vs prior period */}
        <div className="bg-surface flex flex-col border border-border p-6 shadow-brutal-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="t-h3 font-semibold">Shipment Volume</h3>
            <span className="border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
              30 days
            </span>
          </div>
          <div className="min-h-panel-sm flex-1">
            <StepAreaChart
              data={volume}
              labels={{ y: "Current", y2: "Prior" }}
              formatX={formatDay}
              formatY={(v) => v.toLocaleString()}
              height={220}
            />
          </div>
        </div>

        {/* Upcoming Operations — manifests with future departure dates */}
        <div className="bg-surface flex flex-col border border-border p-6 shadow-brutal-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="t-h3 font-semibold">Upcoming Operations</h3>
            <Link
              href="/manifests"
              className="bg-foreground px-4 py-1.5 text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              View All
            </Link>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Scheduled manifests by departure date
          </p>
          <div className="max-h-panel-md scrollbar-hide flex-1 overflow-y-auto pr-2">
            {upcoming.length === 0 ? (
              <p className="tac-tag">No scheduled departures</p>
            ) : (
              upcoming.map((op) => (
                <Link
                  key={op.id}
                  href={`/manifests/${op.id}`}
                  className="-mx-2 flex items-center justify-between border-b border-border px-2 py-3 transition-colors last:border-0 hover:bg-muted/50"
                >
                  <div>
                    <p className="tac-tag mb-1">{op.eta}</p>
                    <p className="t-body-sm font-semibold">{op.title}</p>
                    <p className="tac-tag">{op.kind}</p>
                  </div>
                  <RiArrowRightLine className="h-4 w-4 -rotate-45 text-muted-foreground" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM SECTION (3 Cols) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.5fr_1fr]">
        {/* 12 Days left */}
        <div className="bg-surface flex flex-col justify-between border border-border p-6 shadow-brutal-sm">
          <div>
            <h3 className="t-h2 mb-2 font-bold tracking-tight">12 Days left</h3>
            <p className="t-body-sm leading-relaxed text-muted-foreground">
              We are pleased to announce that we will be celebrating our 16th anniversary.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-10 gap-2">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={cn("h-2 w-2", i < 18 ? "bg-accent-warning" : "bg-muted")}
              />
            ))}
          </div>
        </div>

        {/* Top Hubs — ranked by deliveries */}
        <div className="bg-surface relative flex flex-col border border-border p-6 text-foreground shadow-brutal-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="t-h3 font-semibold">Top Hubs</h3>
            <span className="border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
              All time
            </span>
          </div>
          <div className="flex-1 space-y-3">
            {topHubs.length === 0 ? (
              <p className="tac-tag">No hub data</p>
            ) : (
              topHubs.slice(0, 3).map((h, i) => (
                <Link
                  key={h.key}
                  href={`/inventory?hub=${encodeURIComponent(h.key)}`}
                  className="-mx-2 flex items-center justify-between border-b border-border px-2 py-1 pb-3 transition-colors last:border-0 last:pb-0 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="t-h4 flex h-10 w-10 items-center justify-center overflow-hidden border border-border bg-muted font-bold">
                      <RiBuilding4Line className="h-5 w-5 opacity-60" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{h.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.value.toLocaleString()} delivered
                        {h.caption ? ` · ${h.caption}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="tac-axis tac-readout text-muted-foreground">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Success Rate — delivered on commit, target 90% */}
        <div className="bg-surface relative flex flex-col border border-border p-6 shadow-brutal-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="t-h3 font-semibold">Success Rate</h3>
            <div className="flex h-6 w-6 items-center justify-center bg-foreground text-background">
              <RiBarChart2Fill className="h-3 w-3" />
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center pt-2">
            <ProgressMeter
              caption="Delivered on commit"
              value={successRate?.value ?? 0}
              max={successRate?.max ?? 100}
              target={successRate?.target ?? 90}
              sublabel={successRate?.label}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
