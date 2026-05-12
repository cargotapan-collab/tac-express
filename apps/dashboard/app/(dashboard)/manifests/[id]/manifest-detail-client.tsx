"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  useManifest,
  useManifestShipments,
  useCloseManifest,
  useDepartManifest,
  useArriveManifest,
  useReconcileManifest,
  useAddShipmentToManifest,
} from "@workspace/services/hooks/use-manifests"
import { ManifestActionBar } from "@workspace/ui/components/composed/manifests/manifest-action-bar"
import { ManifestShipmentsTable } from "@workspace/ui/components/composed/manifests/manifest-shipments-table"
import { ManifestStatus } from "@workspace/types"
import { useNotificationStore } from "@workspace/services/stores/notification.store"
import { RiArrowLeftLine, RiAddLine } from "@workspace/ui/icons"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/primitives/input"
import { cn } from "@workspace/ui/lib/utils"

interface ManifestDetailClientProps {
  manifestId: string
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-muted-foreground border-border",
  OPEN: "text-primary border-primary/30 bg-primary/5",
  CLOSED: "text-accent-warning border-accent-warning/30 bg-accent-warning/5",
  DEPARTED: "text-accent-warning border-accent-warning/40 bg-accent-warning/10",
  ARRIVED: "text-primary border-primary/30 bg-primary/5",
  RECONCILED: "text-muted-foreground border-border",
}

export function ManifestDetailClient({ manifestId }: ManifestDetailClientProps) {
  const router = useRouter()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const [awbInput, setAwbInput] = React.useState("")

  const { data: manifest, isLoading } = useManifest(manifestId)
  // Downstream queries (shipments, mutations) must use the UUID — `manifestId`
  // from the URL may be a human-readable manifest_number which getManifestById
  // resolves to a manifest, but manifest_shipments + mutations key off the UUID.
  const resolvedId = manifest?.id ?? manifestId
  const { data: shipments, isLoading: loadingShipments } = useManifestShipments(resolvedId)
  const closeManifest = useCloseManifest()
  const departManifest = useDepartManifest()
  const arriveManifest = useArriveManifest()
  const reconcileManifest = useReconcileManifest()
  const addShipment = useAddShipmentToManifest()

  async function handleAction(action: "close" | "depart" | "arrive" | "reconcile") {
    try {
      if (action === "close") await closeManifest.mutateAsync(resolvedId)
      else if (action === "depart") await departManifest.mutateAsync(resolvedId)
      else if (action === "arrive") await arriveManifest.mutateAsync(resolvedId)
      else await reconcileManifest.mutateAsync(resolvedId)
      addNotification({ type: "success", title: "Status updated", message: action.toUpperCase() })
    } catch (err) {
      addNotification({ type: "error", title: "Action failed", message: String(err) })
    }
  }

  async function handleAddAwb() {
    const awb = awbInput.trim().toUpperCase()
    if (!awb) return
    try {
      await addShipment.mutateAsync({ manifestId: resolvedId, awb })
      addNotification({ type: "success", title: "AWB added", message: awb })
      setAwbInput("")
    } catch (err) {
      addNotification({ type: "error", title: "Failed to add AWB", message: String(err) })
    }
  }

  const isActionLoading = closeManifest.isPending || departManifest.isPending || arriveManifest.isPending || reconcileManifest.isPending

  if (isLoading) {
    return <div className="h-48 border border-border bg-card animate-pulse" />
  }

  if (!manifest) {
    return (
      <div className="border border-dashed border-border p-8 text-center">
        <p className="font-mono text-sm text-muted-foreground">Manifest not found</p>
      </div>
    )
  }

  const shipmentRows = (shipments ?? []).map((s) => ({
    id: s.id,
    awb_number: s.awb_number,
    status: s.status,
    pieces: s.pieces,
    chargeable_weight: s.chargeable_weight,
  }))

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between pb-5 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground h-8 px-2"
        >
          <RiArrowLeftLine className="h-3.5 w-3.5" />
          Manifests
        </Button>
        <span className={cn("font-mono text-2xs uppercase tracking-wider border px-2 py-0.5", STATUS_COLORS[manifest.status] ?? "text-muted-foreground border-border")}>
          {manifest.status}
        </span>
      </div>

      <div className="border border-border bg-card p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs text-muted-foreground">Manifest Number</p>
            <p className="font-mono text-xl font-bold text-primary uppercase tracking-wider">{manifest.manifestNumber}</p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="font-mono text-xs text-muted-foreground">
              {(manifest as unknown as Record<string, unknown>).originHub as string} → {(manifest as unknown as Record<string, unknown>).destHub as string}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {manifest.transportMode} • {manifest.totalPieces} pcs • {manifest.totalWeight?.toFixed(2)} kg
            </p>
          </div>
        </div>
        {manifest.notes && (
          <p className="font-mono text-sm text-muted-foreground border-t border-border pt-2">{manifest.notes}</p>
        )}
      </div>

      <ManifestActionBar
        status={manifest.status}
        onClose={() => handleAction("close")}
        onDepart={() => handleAction("depart")}
        onArrive={() => handleAction("arrive")}
        onReconcile={() => handleAction("reconcile")}
        isLoading={isActionLoading}
      />

      {manifest.status === ManifestStatus.OPEN || manifest.status === ManifestStatus.DRAFT ? (
        <div className="flex gap-2 p-2 tac-fui-panel">
          <Input
            value={awbInput}
            onChange={(e) => setAwbInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddAwb() }}
            placeholder="Add AWB to manifest..."
            className="flex-1 h-9 font-mono text-sm"
          />
          <Button
            onClick={handleAddAwb}
            disabled={addShipment.isPending}
            size="sm"
            className="h-9 px-4 font-mono text-xs uppercase tracking-wider"
          >
            <RiAddLine className="h-4 w-4 mr-1.5" /> Add
          </Button>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Shipments ({shipmentRows.length})
        </p>
        <ManifestShipmentsTable shipments={shipmentRows} isLoading={loadingShipments} />
      </div>
    </div>
  )
}
