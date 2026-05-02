"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { useRealtimeDashboard } from "@workspace/ui/hooks/use-realtime"
import {
  useDashboardKPIs,
  useActivityFeed,
  useOperationalHealth,
  useSLABreaches,
} from "@workspace/services/hooks/use-dashboard"
import { useStatusDistribution, useHubPerformance } from "@workspace/services/hooks/use-analytics"
import {
  RiSearchLine,
  RiArrowRightLine,
  RiArrowUpLine,
  RiSettingsLine,
  RiBuilding4Line,
  RiTruckLine,
  RiAlertFill,
  RiBarChart2Fill,
} from "@workspace/ui/icons"
import type { KPIData } from "@workspace/services/dashboard.service"
import { ServiceMixDonut } from "@workspace/ui/components/composed/charts/service-mix-donut"
import { ShipmentTrendChart } from "@workspace/ui/components/composed/charts/shipment-trend-chart"
import { NotificationBell } from "@workspace/ui/components/composed/notification-bell"
import { UserMenu } from "@workspace/ui/components/composed/user-menu"
import { ThemeToggle } from "@workspace/ui/components/composed/dashboard-header"
import { GaugeChart } from "@workspace/ui/components/composed/charts/gauge-chart"
import Link from "next/link"

interface HomeClientProps {
  initialKpis: KPIData
}

export function HomeClient({ initialKpis }: HomeClientProps) {
  // The realtime hook subscribes to Supabase channels and warms the
  // shared dashboard caches; calls below are kept for their cache-warming
  // side-effects even where the return value isn't consumed in this view.
  useRealtimeDashboard()

  const kpisQuery = useDashboardKPIs()
  const activityQuery = useActivityFeed(20)
  useOperationalHealth()
  useSLABreaches(8)
  useStatusDistribution()
  useHubPerformance()

  const kpis = kpisQuery.data ?? initialKpis

  const growthData = [
    { key: "success", label: "Success", value: 62 },
    { key: "remaining", label: "Remaining", value: 38 }
  ]

  const trendData = [
    { date: "2026-04-20", shipments: 222, delivered: 150 },
    { date: "2026-04-21", shipments: 97, delivered: 180 },
    { date: "2026-04-22", shipments: 167, delivered: 120 },
    { date: "2026-04-23", shipments: 242, delivered: 260 },
    { date: "2026-04-24", shipments: 373, delivered: 290 },
    { date: "2026-04-25", shipments: 301, delivered: 340 },
    { date: "2026-04-26", shipments: 245, delivered: 180 },
  ]

  return (
    <div className="min-h-full pb-8 bg-background font-sans">

      {/* ── HERO BANNER ── tac-hero-bleed handles all breakpoints via globals.css */}
      <div className="tac-hero-bleed relative -mt-6 lg:-mt-8 h-panel-sm lg:h-panel-lg overflow-hidden bg-card border-b border-border">
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/dashboard-banner.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'bottom',
            opacity: 0.65,
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/30 to-background/90" />

        {/* Top nav bar inside hero — re-add padding to match content area */}
        <div className="relative z-10 flex items-center justify-between px-5 sm:px-8 lg:px-10 pt-6 gap-4">
          <div className="flex items-center shrink-0 group">
            <span className="font-sans font-black italic text-primary text-2xl tracking-tighter uppercase">TAC</span>
            <span className="font-sans font-bold italic text-foreground text-2xl tracking-tighter uppercase ml-1.5">
              E<span className="text-accent-warning">X</span>PRESS
            </span>
            <div className="w-5 h-5 flex items-center justify-center text-accent-warning ml-1 mt-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" className="w-full h-full transform translate-x-0 group-hover:translate-x-1 transition-transform">
                 <polyline points="2,12 20,12" />
                 <polyline points="12,4 20,12 12,20" />
              </svg>
            </div>
          </div>

          <div className="relative w-full max-w-md">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search here"
              className="w-full h-10 pl-10 pr-12 bg-background/80 border border-border text-sm focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 t-mono-sm text-muted-foreground border border-border bg-background px-1">⌘K</kbd>
          </div>

          <div className="flex items-center gap-2 bg-background/80 border border-border p-1 shrink-0">
            <ThemeToggle />
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </div>

      {/* ── OVERLAPPING KPI CARDS ── Negative top margin overlaps hero bottom edge */}
      <div className="grid grid-cols-4 gap-4 -mt-28 relative z-10 mb-8">
        {/* Card 1 — Active Shipments */}
        <div className="bg-surface p-5 border border-border shadow-brutal-sm flex flex-col justify-between h-32 tac-fui-hover relative group">
          <div className="flex items-center gap-2">
            <RiBarChart2Fill className="w-4 h-4 text-primary" />
            <span className="t-body-sm text-muted-foreground font-medium">Active Shipments</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold font-mono group-hover:text-primary transition-colors">{kpis?.activeShipments?.toLocaleString() ?? "2,635"}</span>
            <div className="w-8 h-8 bg-background border border-border flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-primary group-hover:text-background transition-colors cursor-pointer">
              <RiArrowUpLine className="w-4 h-4 rotate-45" />
            </div>
          </div>
        </div>

        {/* Card 2 — In Transit */}
        <div className="bg-surface p-5 border border-border shadow-brutal-sm flex flex-col justify-between h-32 tac-fui-hover relative group">
          <div className="flex items-center gap-2">
            <RiTruckLine className="w-4 h-4 text-primary" />
            <span className="t-body-sm text-muted-foreground font-medium">In Transit</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold font-mono group-hover:text-primary transition-colors">{kpis?.inTransit?.toLocaleString() ?? "29"}</span>
            <div className="w-8 h-8 bg-background border border-border flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-primary group-hover:text-background transition-colors cursor-pointer">
              <RiArrowUpLine className="w-4 h-4 rotate-45" />
            </div>
          </div>
        </div>

        {/* Card 3 — Open Exceptions */}
        <div className="bg-surface p-5 border border-border shadow-brutal-sm flex flex-col justify-between h-32 tac-fui-hover relative group">
          <div className="flex items-center gap-2">
            <RiAlertFill className="w-4 h-4 text-accent-warning" />
            <span className="t-body-sm text-muted-foreground font-medium">Open Exceptions</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold font-mono group-hover:text-primary transition-colors">{kpis?.openExceptions?.toLocaleString() ?? "60"}</span>
            <div className="w-8 h-8 bg-background border border-border flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-primary group-hover:text-background transition-colors cursor-pointer">
              <RiArrowUpLine className="w-4 h-4 rotate-45" />
            </div>
          </div>
        </div>

        {/* Card 4 — Command Center */}
        <div className="bg-card p-5 border border-primary/30 shadow-brutal-sm flex flex-col justify-between h-32 tac-fui-hover">
          <span className="t-body-sm text-foreground font-semibold">Command Center</span>
          <div className="flex items-center gap-2">
            <Link href="/shipments/create" className="flex-1 bg-primary text-primary-foreground border border-primary py-2 px-3 text-center t-body-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1">
              + Shipment
            </Link>
            <Link href="/manifests/create" className="flex-1 bg-background text-foreground border border-border py-2 px-3 text-center t-body-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1">
              + Manifest
            </Link>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION (3 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
         {/* Growth */}
         <div className="bg-surface p-6 border border-border shadow-brutal-sm flex flex-col relative min-h-panel-xl">
            <div className="flex items-center justify-between mb-6">
               <h3 className="t-h3 font-semibold">Growth</h3>
               <span className="bg-background border border-border px-2 py-1 text-xs text-muted-foreground flex items-center gap-1 cursor-pointer hover:bg-muted">Monthly <span>⌄</span></span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center relative -ml-4">
               <ServiceMixDonut data={growthData} height={180} />
            </div>
            <div className="mt-4 flex items-center justify-between text-muted-foreground text-sm">
               <span>Delivery success growth</span>
               <div className="w-8 h-8 bg-foreground flex items-center justify-center text-background cursor-pointer hover:bg-foreground/90 transition-colors">
                 <RiSettingsLine className="w-4 h-4" />
               </div>
            </div>
         </div>

         {/* Shipment Volume */}
         <div className="bg-surface p-6 border border-border shadow-brutal-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h3 className="t-h3 font-semibold">Shipment Volume</h3>
               <span className="bg-background border border-border px-2 py-1 text-xs text-muted-foreground flex items-center gap-1 cursor-pointer hover:bg-muted">Monthly <span>⌄</span></span>
            </div>
            <div className="flex-1 min-h-panel-sm">
               <ShipmentTrendChart data={trendData} />
            </div>
         </div>

         {/* Upcoming Operations */}
         <div className="bg-surface p-6 border border-border shadow-brutal-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h3 className="t-h3 font-semibold">Upcoming Operations</h3>
               <Link href="/shipments" className="bg-foreground text-background px-4 py-1.5 text-xs font-semibold hover:bg-foreground/90 transition-colors">View All</Link>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Scheduled events and manifests!</p>
            <div className="flex-1 overflow-y-auto max-h-panel-md pr-2 scrollbar-hide">
               {activityQuery.data?.slice(0, 5).map((item) => (
                 <div key={item.id} className="border-b border-border py-3 last:border-0 flex items-center justify-between">
                   <div>
                     <p className="t-caption text-muted-foreground mb-1">{new Date(item.timestamp).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                     <p className="t-body-sm font-semibold">{item.title}</p>
                   </div>
                   <div className="w-6 h-6 border border-border bg-background flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted">
                     <span className="mb-2">...</span>
                   </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* BOTTOM SECTION (3 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1fr] gap-6">
         {/* 12 Days left */}
         <div className="bg-surface p-6 border border-border shadow-brutal-sm flex flex-col justify-between">
            <div>
              <h3 className="t-h2 font-bold tracking-tight mb-2">12 Days left</h3>
              <p className="t-body-sm text-muted-foreground leading-relaxed">
                We are pleased to announce that we will be celebrating our 16th anniversary.
              </p>
            </div>
            <div className="grid grid-cols-10 gap-2 mt-6">
               {Array.from({ length: 30 }).map((_, i) => (
                 <div key={i} className={cn("w-2 h-2", i < 18 ? "bg-accent-warning" : "bg-muted")} />
               ))}
            </div>
         </div>

         {/* Top Hubs */}
         <div className="bg-surface text-foreground p-6 border border-border shadow-brutal-sm flex flex-col relative">
            <div className="flex items-center justify-between mb-6">
               <h3 className="t-h3 font-semibold">Top Hubs</h3>
               <div className="flex gap-2">
                 <span className="border border-border px-3 py-1 text-xs cursor-pointer hover:bg-muted">All Time</span>
                 <span className="bg-accent-warning/10 border border-accent-warning/30 text-accent-warning px-3 py-1 text-xs cursor-pointer">This year</span>
               </div>
            </div>
            <div className="space-y-4">
               {[
                 { name: "Imphal", role: "Primary Transit", idx: 1 },
                 { name: "New Delhi", role: "Port Gateway", idx: 2 },
                 { name: "Guwahati", role: "Tech Node", idx: 3 },
               ].map((h) => (
                 <div key={h.idx} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted flex items-center justify-center t-h4 font-bold overflow-hidden border border-border">
                        <RiBuilding4Line className="w-5 h-5 opacity-60" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{h.name}</p>
                        <p className="text-xs text-muted-foreground">{h.role}</p>
                      </div>
                    </div>
                    <RiArrowRightLine className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors -rotate-45" />
                 </div>
               ))}
            </div>
         </div>

         {/* Success Rate */}
         <div className="bg-surface p-6 border border-border shadow-brutal-sm flex flex-col relative">
            <div className="flex items-center justify-between mb-4">
               <h3 className="t-h3 font-semibold">Success Rate</h3>
               <div className="w-6 h-6 bg-foreground text-background flex items-center justify-center cursor-pointer hover:bg-foreground/90">
                 <RiBarChart2Fill className="w-3 h-3" />
               </div>
            </div>
            <div className="flex-1 flex items-center justify-center pt-8">
               <GaugeChart percentage={52} />
            </div>
         </div>
      </div>
    </div>
  )
}
