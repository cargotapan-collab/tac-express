"use client"

import * as React from "react"
import Link from "next/link"

import { RiAddLine, RiFileList3Line } from "@workspace/ui/icons"
import { OpsFrame } from "../ops-frame"
import { OpsPageHead } from "../ops-page-head"
import { OpsButton } from "../ops-button"
import { OpsBadge } from "../ops-badge"
import { OpsTabs } from "../ops-tabs"
import { OpsCard } from "../ops-card"
import { OpsSkeleton } from "../ops-skeleton"
import { OpsEmptyState } from "../ops-empty-state"
import { OpsErrorState } from "../ops-error-state"

interface ManifestRow {
  id: string
  from: string
  to: string
  shipments: number
  weight: string
  date: string
  status: "Draft" | "Building" | "Open" | "Closed" | "Departed" | "Arrived"
  /** Detail page href (typically `/ops-console/manifests/<uuid>`). */
  detailHref?: string
}

interface OpsManifestsViewProps {
  items: ManifestRow[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

const TABS = [
  "All",
  "Draft",
  "Building",
  "Open",
  "Closed",
  "Departed",
  "Arrived",
] as const

function OpsManifestsView({
  items,
  isLoading,
  isError,
  onRetry,
}: OpsManifestsViewProps) {
  const [tab, setTab] = React.useState<string>("All")
  const filtered = items.filter((m) => (tab === "All" ? true : m.status === tab))

  return (
    <OpsFrame>
      <OpsPageHead
        eyebrow="Operations"
        title="Manifests"
        sub="Transit manifests — create, build, depart and receive"
        actions={
          // Links to v6 manifest wizard (setup → barcode-scan-to-add → review
          // → close). The paper variant at /ops-console/manifests/create is a
          // simplified preview without the scan loop.
          <OpsButton asChild variant="primary">
            <Link href="/manifests/create">
              <RiAddLine aria-hidden className="size-3" />
              New Manifest
            </Link>
          </OpsButton>
        }
      />
      <OpsTabs items={[...TABS]} value={tab} onChange={setTab} />
      {isError ? (
        <OpsErrorState
          code="MANIFESTS · FETCH FAILED"
          headline="Could not load manifests"
          message="The manifests API didn't respond. Retry the request, or contact support if the issue persists."
          onRetry={onRetry}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <OpsSkeleton key={`m-sk-${i}`} className="h-32 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <OpsEmptyState
          icon={RiFileList3Line}
          eyebrow={tab === "All" ? "NO MANIFESTS" : `NO "${tab.toUpperCase()}" MANIFESTS`}
          headline={
            tab === "All"
              ? "No manifests yet"
              : `Nothing matches the ${tab} filter`
          }
          description={
            tab === "All"
              ? "Build the first manifest to start consolidating freight for hub-to-hub transit."
              : "Try switching to the All tab, or build a new manifest."
          }
          cta={
            <OpsButton asChild variant="primary">
              <Link href="/manifests/create">
                <RiAddLine aria-hidden className="size-3" />
                New Manifest
              </Link>
            </OpsButton>
          }
        />
      ) : (
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((m) => (
          <OpsCard key={m.id} ticks>
            <div className="flex items-center justify-between mb-2">
              <span className="paper-id text-[length:var(--text-paper-14)]">
                {m.id}
              </span>
              <OpsBadge>{m.status}</OpsBadge>
            </div>
            <div className="font-paper-mono text-[length:var(--text-paper-12)] text-paper-fg-3">
              {m.from} → {m.to}
            </div>
            <div className="flex items-start justify-between mt-4 pt-3.5 border-t border-paper-line">
              <div>
                <div className="paper-label">Shipments</div>
                <div className="font-paper-display font-bold text-[length:var(--text-paper-18)] mt-0.5">
                  {m.shipments}
                </div>
              </div>
              <div>
                <div className="paper-label">Weight</div>
                <div className="font-paper-display font-bold text-[length:var(--text-paper-18)] mt-0.5">
                  {m.weight} kg
                </div>
              </div>
              <div className="text-right">
                <div className="paper-label">Created</div>
                <div className="font-paper-mono text-[length:var(--text-paper-13)] mt-0.5">
                  {m.date}
                </div>
              </div>
            </div>
            {/* Explicit View CTA so test automation has an unambiguous
                clickable element — previous "wrap-the-card-in-Link" pattern
                left some automation tools unable to discover the link. */}
            <div className="flex justify-end mt-3 pt-3 border-t border-paper-line">
              {m.detailHref ? (
                <OpsButton asChild size="sm" variant="ghost">
                  <Link href={m.detailHref} aria-label={`View manifest ${m.id}`}>
                    View →
                  </Link>
                </OpsButton>
              ) : (
                <OpsButton size="sm" variant="ghost" disabled>
                  View →
                </OpsButton>
              )}
            </div>
          </OpsCard>
        ))}
      </div>
      )}
    </OpsFrame>
  )
}

export { OpsManifestsView }
export type { OpsManifestsViewProps, ManifestRow }
