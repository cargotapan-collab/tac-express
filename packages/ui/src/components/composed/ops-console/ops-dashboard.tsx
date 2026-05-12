"use client"

import * as React from "react"
import Image from "next/image"

import { cn } from "@workspace/ui/lib/utils"
import {
  RiBarChart2Line,
  RiTruckLine,
  RiAlertLine,
} from "@workspace/ui/icons"
import { OpsFrame } from "./ops-frame"
import { OpsPageHead } from "./ops-page-head"
import { OpsCard } from "./ops-card"
import { OpsBadge } from "./ops-badge"
import { OpsButton } from "./ops-button"
import { OpsStatCard } from "./ops-stat-card"

interface OpsDashboardProps {
  activeShipments: number
  inTransit: number
  openExceptions: number
  growth: { value: number; target: number; delivered: number; total: number }
  upcoming: Array<{ id: string; label: string; eta: string }>
  volumePath: { fill: string; stroke: string; ticks: Array<{ x: number; label: string }> }
}

const DEFAULT_VOLUME_PATH = {
  // SVG paths borrowed from the design bundle's Pages.jsx — the area fill +
  // line stroke describe a 30-day step chart. Replace with real data via the
  // `volumePath` prop once charts are wired through @workspace/services.
  fill: "M0 100 L260 100 L260 30 L360 30 L360 120 L0 120 Z",
  stroke: "M0 100 L260 100 L260 30 L360 30",
  ticks: [
    { x: 0, label: "22 Apr" },
    { x: 160, label: "30 Apr" },
    { x: 320, label: "6 May" },
  ],
}

function OpsDashboard({
  activeShipments,
  inTransit,
  openExceptions,
  growth,
  upcoming,
  volumePath = DEFAULT_VOLUME_PATH,
}: OpsDashboardProps) {
  const growthPct = Math.min(100, Math.max(0, growth.value))

  return (
    <OpsFrame>
      <OpsPageHead
        eyebrow="Platform"
        title="Dashboard"
        sub="Real-time operations overview across the network"
      />

      {/* Hero banner — TAC Express network artwork. Brutalist hairline frame
          on the new Warm Linen palette; image carries the brand atmosphere so
          the overlay copy stays minimal. */}
      <div
        className={cn(
          "relative overflow-hidden border border-paper-line mb-5",
          "h-[220px] sm:h-[240px] lg:h-[260px]",
        )}
      >
        <Image
          src="/dashboard-banner.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 1200px, 100vw"
          className="object-cover object-[center_55%]"
        />

        {/* Bottom-left scrim — keeps the overlay copy legible against the
            painterly image without dimming the whole hero. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-paper-ink/70 via-paper-ink/30 to-transparent"
        />

        {/* DISPATCH · LIVE capsule */}
        <div className="absolute top-4 right-4 bg-paper-card border border-paper-line px-2.5 py-1.5 font-paper-mono font-medium text-[10px] tracking-[0.1em] text-paper-fg-1">
          <span
            aria-hidden
            className="inline-block size-1.5 bg-paper-ok mr-2 align-middle animate-pulse"
          />
          DISPATCH · LIVE
        </div>

        {/* Hero copy — sits over the bottom scrim */}
        <div className="absolute left-5 sm:left-6 bottom-4 sm:bottom-5 right-5 sm:right-6 text-white">
          <div className="font-paper-mono font-medium text-[10px] tracking-[0.18em] text-paper-violet-50">
            TAC EXPRESS · NETWORK
          </div>
          <div className="font-paper-display font-extrabold text-[22px] sm:text-[26px] leading-tight mt-1">
            Welcome back, Operator
          </div>
          <div className="font-paper-display text-[13px] mt-0.5 opacity-90">
            Live shipment, manifest, and SLA telemetry across every hub.
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <OpsStatCard
          icon={RiBarChart2Line}
          label="Active Shipments"
          value={activeShipments}
          href="/ops-console/shipments?status=active"
        />
        <OpsStatCard
          icon={RiTruckLine}
          label="In Transit"
          value={inTransit}
          href="/ops-console/shipments?status=in_transit"
        />
        <OpsStatCard
          icon={RiAlertLine}
          label="Open Exceptions"
          value={openExceptions}
          href="/ops-console/exceptions"
        />

        {/* Command Center */}
        <OpsCard>
          <div className="paper-label mb-2.5">Command Center</div>
          <div className="flex items-center gap-2">
            <OpsButton variant="primary" className="flex-1 justify-center">
              + Shipment
            </OpsButton>
            <OpsButton variant="default" className="flex-1 justify-center">
              + Manifest
            </OpsButton>
          </div>
        </OpsCard>
      </div>

      {/* Three-column detail row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Growth */}
        <OpsCard ticks>
          <div className="flex items-center justify-between">
            <div className="font-paper-display font-semibold text-[13px] text-paper-fg-1">
              Growth
            </div>
            <OpsBadge>6 months</OpsBadge>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div className="paper-label">Delivery success</div>
            <div className="paper-label">Target {growth.target}%</div>
          </div>
          <div className="paper-stat-value mt-1.5 mb-2.5">{growthPct}%</div>
          <div className="h-1.5 bg-paper-2 overflow-hidden">
            <div
              className="h-full bg-paper-violet"
              style={{ width: `${growthPct}%` }}
              aria-hidden
            />
          </div>
          <div className="paper-label mt-2">
            {growth.delivered} of {growth.total} delivered
          </div>
        </OpsCard>

        {/* Shipment Volume */}
        <OpsCard ticks>
          <div className="flex items-center justify-between">
            <div className="font-paper-display font-semibold text-[13px] text-paper-fg-1">
              Shipment Volume
            </div>
            <OpsBadge>30 days</OpsBadge>
          </div>
          <svg
            aria-hidden
            viewBox="0 0 360 120"
            className="w-full mt-3"
          >
            <line x1="0" y1="100" x2="360" y2="100" stroke="var(--paper-line)" strokeDasharray="2 3" />
            <line x1="0" y1="60" x2="360" y2="60" stroke="var(--paper-line)" strokeDasharray="2 3" />
            <line x1="0" y1="20" x2="360" y2="20" stroke="var(--paper-line)" strokeDasharray="2 3" />
            <path d={volumePath.fill} fill="var(--paper-violet-50)" />
            <path d={volumePath.stroke} stroke="var(--paper-violet)" strokeWidth="1.5" fill="none" />
            {volumePath.ticks.map((t) => (
              <text
                key={`${t.x}-${t.label}`}
                x={t.x}
                y="115"
                fontFamily="var(--paper-font-mono)"
                fontSize="8"
                fill="var(--paper-fg-3)"
              >
                {t.label}
              </text>
            ))}
          </svg>
        </OpsCard>

        {/* Upcoming Operations */}
        <OpsCard ticks>
          <div className="flex items-center justify-between">
            <div className="font-paper-display font-semibold text-[13px] text-paper-fg-1">
              Upcoming Operations
            </div>
            <OpsButton variant="dark" size="sm">
              View all
            </OpsButton>
          </div>
          <div className="font-paper-display text-[13px] text-paper-fg-3 mt-2.5">
            Scheduled manifests by departure date
          </div>
          {upcoming.length === 0 ? (
            <div className="paper-label mt-4">No scheduled departures</div>
          ) : (
            <ul className="mt-3 divide-y divide-paper-line">
              {upcoming.map((op) => (
                <li key={op.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="paper-label">{op.eta}</div>
                    <div className="font-paper-display font-semibold text-[13px] mt-0.5">
                      {op.label}
                    </div>
                  </div>
                  <span className="paper-id text-[12px]">{op.id}</span>
                </li>
              ))}
            </ul>
          )}
        </OpsCard>
      </div>
    </OpsFrame>
  )
}

export { OpsDashboard }
export type { OpsDashboardProps }
