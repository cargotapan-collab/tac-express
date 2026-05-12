import * as React from "react"

import {
  RiBox3Line,
  RiMoneyDollarCircleLine,
  RiCheckboxCircleLine,
  RiPlaneLine,
  RiAlertLine,
  RiTimeLine,
  RiSignalWifiErrorLine,
} from "@workspace/ui/icons"
import { OpsFrame } from "../ops-frame"
import { OpsPageHead } from "../ops-page-head"
import { OpsCard } from "../ops-card"

interface AnalyticsKpis {
  totalShipments: number
  totalRevenue: string
  delivered: number
  deliveryRate: number
  inTransit: number
  openExceptions: number
  avgDeliveryDays: string
}

interface OpsAnalyticsViewProps {
  kpis: AnalyticsKpis
}

function OpsAnalyticsView({ kpis }: OpsAnalyticsViewProps) {
  return (
    <OpsFrame>
      <OpsPageHead
        eyebrow="Business"
        title="Analytics"
        sub="Operations overview across all hubs"
      />

      {/* Top stats — violet-underline */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <OpsCard accent="violet-under">
          <div className="paper-label flex items-center gap-2">
            <RiBox3Line aria-hidden className="size-3.5" />
            <span>Total Shipments</span>
          </div>
          <div className="paper-stat-value mt-2.5">{kpis.totalShipments}</div>
        </OpsCard>
        <OpsCard accent="violet-under">
          <div className="paper-label flex items-center gap-2">
            <RiMoneyDollarCircleLine aria-hidden className="size-3.5" />
            <span>Total Revenue</span>
          </div>
          <div className="paper-stat-value mt-2.5">{kpis.totalRevenue}</div>
        </OpsCard>
        <OpsCard accent="violet-under">
          <div className="paper-label flex items-center gap-2">
            <RiCheckboxCircleLine aria-hidden className="size-3.5" />
            <span>Delivered</span>
          </div>
          <div className="paper-stat-value mt-2.5">{kpis.delivered}</div>
          <div className="paper-label mt-1">
            {kpis.deliveryRate}% delivery rate
          </div>
        </OpsCard>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <OpsCard>
          <div className="paper-label flex items-center gap-2">
            <RiPlaneLine aria-hidden className="size-3.5" />
            <span>In Transit</span>
          </div>
          <div className="font-paper-display font-extrabold text-[length:var(--text-paper-28)] mt-2.5">
            {kpis.inTransit}
          </div>
        </OpsCard>
        <OpsCard>
          <div className="paper-label flex items-center gap-2">
            <RiAlertLine aria-hidden className="size-3.5" />
            <span>Open Exceptions</span>
          </div>
          <div className="font-paper-display font-extrabold text-[length:var(--text-paper-28)] mt-2.5">
            {kpis.openExceptions}
          </div>
          <div className="paper-label mt-1">All clear</div>
        </OpsCard>
        <OpsCard>
          <div className="paper-label flex items-center gap-2">
            <RiTimeLine aria-hidden className="size-3.5" />
            <span>Avg Delivery Days</span>
          </div>
          <div className="font-paper-display font-extrabold text-[length:var(--text-paper-28)] mt-2.5">
            {kpis.avgDeliveryDays}
          </div>
        </OpsCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <OpsCard ticks>
          <div className="paper-label mb-2.5">Shipment Trend · 30 days</div>
          <svg aria-hidden viewBox="0 0 360 120" className="w-full">
            <line x1="0" y1="100" x2="360" y2="100" stroke="var(--paper-line)" strokeDasharray="2 3" />
            <line x1="0" y1="60" x2="360" y2="60" stroke="var(--paper-line)" strokeDasharray="2 3" />
            <path
              d="M0 100 L260 100 L260 30 L360 30 L360 120 L0 120 Z"
              fill="var(--paper-violet-50)"
            />
            <path
              d="M0 100 L260 100 L260 30 L360 30"
              stroke="var(--paper-violet)"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </OpsCard>
        <OpsCard ticks className="flex flex-col">
          <div className="paper-label">Revenue Trend · 6 months</div>
          <div className="flex-1 flex flex-col items-center justify-center text-center mt-4">
            <RiSignalWifiErrorLine aria-hidden className="size-7 text-paper-fg-3" />
            <div className="paper-label mt-2">Awaiting Signal</div>
            <div className="font-paper-display text-[length:var(--text-paper-13)] text-paper-fg-3 mt-1">
              2 · resumes at N ≥ 3
            </div>
          </div>
        </OpsCard>
      </div>
    </OpsFrame>
  )
}

export { OpsAnalyticsView }
export type { OpsAnalyticsViewProps, AnalyticsKpis }
