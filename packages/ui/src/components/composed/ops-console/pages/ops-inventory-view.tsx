import * as React from "react"

import { RiRefreshLine } from "@workspace/ui/icons"
import { OpsFrame } from "../ops-frame"
import { OpsPageHead } from "../ops-page-head"
import { OpsButton } from "../ops-button"
import { OpsBadge } from "../ops-badge"
import { OpsCard } from "../ops-card"

interface HubInventory {
  hubCode: string
  pieces: number
  rows: Array<{ label: string; value: number }>
}

interface OpsInventoryViewProps {
  hubs: HubInventory[]
}

function OpsInventoryView({ hubs }: OpsInventoryViewProps) {
  return (
    <OpsFrame>
      <OpsPageHead
        eyebrow="Operations"
        title="Hub Inventory"
        sub="Live shipment count by hub (excludes Delivered / Cancelled / RTO)"
        actions={
          <OpsButton>
            <RiRefreshLine aria-hidden className="size-3" />
            Refresh
          </OpsButton>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hubs.map((hub) => (
          <OpsCard key={hub.hubCode} ticks className="max-w-[520px]">
            <div className="flex items-center justify-between mb-3.5">
              <div className="paper-label text-paper-fg-1 text-[length:var(--text-paper-13)] tracking-[length:var(--tracking-paper-10)]">
                {hub.hubCode}
              </div>
              <OpsBadge>{hub.pieces} pcs</OpsBadge>
            </div>
            {hub.rows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between py-2.5 border-t border-paper-line"
              >
                <span className="font-paper-mono uppercase text-paper-fg-3 text-[length:var(--text-paper-11)] tracking-[length:var(--tracking-paper-10)]">
                  {r.label}
                </span>
                <span className="font-paper-display font-bold text-[length:var(--text-paper-14)]">
                  {r.value}
                </span>
              </div>
            ))}
          </OpsCard>
        ))}
      </div>
    </OpsFrame>
  )
}

export { OpsInventoryView }
export type { OpsInventoryViewProps, HubInventory }
