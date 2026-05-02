"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useManifests } from "@workspace/services/hooks/use-manifests"
import { Button } from "@workspace/ui/components/button"
import { ManifestCard } from "@workspace/ui/components/composed/manifests/manifest-card"
import { RiAddLine } from "@workspace/ui/icons"
import { ManifestStatus } from "@workspace/types"

const STATUS_FILTERS: ManifestStatus[] = [
  ManifestStatus.DRAFT,
  ManifestStatus.BUILDING,
  ManifestStatus.OPEN,
  ManifestStatus.CLOSED,
  ManifestStatus.DEPARTED,
  ManifestStatus.ARRIVED,
]

export function ManifestsClient() {
  const router = useRouter()
  const [activeStatus, setActiveStatus] = React.useState<ManifestStatus | undefined>()
  const { data, isLoading, error } = useManifests(
    activeStatus ? { status: [activeStatus] } : {}
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant={!activeStatus ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveStatus(undefined)}
            className="font-mono text-xs uppercase tracking-wider h-8"
          >
            All
          </Button>
          {STATUS_FILTERS.map((s) => (
            <Button
              key={s}
              variant={activeStatus === s ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveStatus(s === activeStatus ? undefined : s)}
              className="font-mono text-xs uppercase tracking-wider h-8"
            >
              {s}
            </Button>
          ))}
        </div>
        <Button
          onClick={() => router.push("/manifests/create")}
          className="font-mono text-xs uppercase tracking-wider h-8"
        >
          <RiAddLine className="h-4 w-4 mr-1" />
          New Manifest
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted/30 animate-pulse tac-fui-panel" />
          ))}
        </div>
      )}

      {error && (
        <div className="tac-fui-border bg-destructive/5 px-4 py-3">
          <p className="font-mono text-xs text-destructive">Failed to load manifests</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {(data ?? []).map((manifest) => (
            <ManifestCard
              key={manifest.id}
              manifest={manifest}
              onClick={() => router.push(`/manifests/${manifest.id}`)}
            />
          ))}
          {data?.length === 0 && (
            <div className="col-span-full tac-fui-border border-dashed h-32 flex items-center justify-center">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                No manifests found
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
