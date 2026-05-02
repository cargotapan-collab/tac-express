"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  useCreateManifest,
  useAddShipmentToManifest,
  useCloseManifest,
} from "@workspace/services/hooks/use-manifests"
import { useHubs } from "@workspace/services/hooks/use-hubs"
import { useNotificationStore } from "@workspace/services/stores/notification.store"

import { ManifestBuilderWizard } from "@workspace/ui/components/composed/manifests/manifest-builder/manifest-builder-wizard"
import type { ManifestSetupValue } from "@workspace/ui/components/composed/manifests/manifest-builder/step-setup"
import type {
  ManifestShipmentRow,
  ScanResult,
} from "@workspace/ui/components/composed/manifests/manifest-builder/step-add-shipments"

import { shipmentService } from "@workspace/services/hooks/use-shipments"

export function CreateManifestClient() {
  const router = useRouter()
  const { data: hubs = [] } = useHubs(true)
  const createManifest = useCreateManifest()
  const addAwb = useAddShipmentToManifest()
  const closeManifest = useCloseManifest()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const hubOptions = React.useMemo(
    () =>
      hubs.map((h) => ({
        value: h.id,
        label: `${h.name} · ${h.code}`,
      })),
    [hubs]
  )

  const hubByCode = React.useCallback(
    (id: string) => hubs.find((h) => h.id === id)?.code ?? id,
    [hubs]
  )

  const handleSetupCommit = async (setup: ManifestSetupValue) => {
    const m = await createManifest.mutateAsync({
      transportMode: setup.type,
      originHub: hubByCode(setup.fromHubId),
      destHub: hubByCode(setup.toHubId),
      notes: setup.notes,
    })
    return { manifestId: m.id }
  }

  const handleAddAwb = async (manifestId: string, awb: string) => {
    try {
      // Pre-validate the AWB exists before attempting to attach.
      const shipment = await shipmentService.getShipmentByAwb(awb)
      if (!shipment) {
        return { result: "ERROR" as ScanResult, reason: "AWB not found" }
      }
      await addAwb.mutateAsync({ manifestId, awb })
      const row: ManifestShipmentRow = {
        awbNumber: shipment.awbNumber,
        consigneeName: shipment.receiver?.name,
        consigneeCity: shipment.receiver?.address?.city,
        consignorName: shipment.sender?.name,
        consignorCity: shipment.sender?.address?.city,
        pieces: shipment.pieces,
        weightKg: shipment.weight?.chargeable,
        status: shipment.status,
      }
      return { result: "SUCCESS" as ScanResult, row }
    } catch (err) {
      const msg = (err as Error).message
      const result: ScanResult = /duplicate|already/i.test(msg)
        ? "DUPLICATE"
        : "ERROR"
      return { result, reason: msg }
    }
  }

  const handleSaveOpen = async (manifestId: string) => {
    // Manifest stays in DRAFT/BUILDING; navigate to the detail page where it
    // can be re-opened or closed later.
    addNotification({
      type: "success",
      title: "Manifest saved",
      message: "Open — still editable from the manifest detail page.",
    })
    router.push(`/manifests/${manifestId}`)
  }

  const handleClose = async (manifestId: string) => {
    await closeManifest.mutateAsync(manifestId)
    addNotification({
      type: "success",
      title: "Manifest closed",
      message: "Loadlist locked. Ready to depart.",
    })
    router.push(`/manifests/${manifestId}`)
  }

  return (
    <ManifestBuilderWizard
      hubs={hubOptions}
      onSetupCommit={handleSetupCommit}
      onAddAwb={handleAddAwb}
      onSaveOpen={handleSaveOpen}
      onClose={handleClose}
      onExit={() => router.push("/manifests")}
    />
  )
}
