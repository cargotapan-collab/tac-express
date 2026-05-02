"use client"

import * as React from "react"

import {
  ScanningConsole,
  type ScanMode,
  type ScanOutcome,
} from "@workspace/ui/components/composed/scanning/scanning-console"
import { ScannerDebug } from "@workspace/ui/components/composed/scanning/scanner-debug"
import {
  PodCapture,
  type PodPayload,
} from "@workspace/ui/components/composed/scanning/pod-capture"
import { useSyncScanEvent } from "@workspace/services/hooks/use-scan-sync"
import { useScanQueueStore } from "@workspace/services/stores/scan-queue.store"
import { useNotificationStore } from "@workspace/services/stores/notification.store"
import { ScanSource, HubCode, type UUID } from "@workspace/types"

type ManifestContext = {
  id: string
  manifestNumber: string
  fromHub: string
  toHub: string
  /** AWBs already scanned into this manifest in the current session. */
  scanned: Set<string>
}

export function ScanningClient() {
  const syncScanEvent = useSyncScanEvent()
  const isOnline = useScanQueueStore((s) => s.isOnline)
  const queue = useScanQueueStore((s) => s.queue)
  const enqueue = useScanQueueStore((s) => s.enqueue)
  const markSynced = useScanQueueStore((s) => s.markSynced)
  const markFailed = useScanQueueStore((s) => s.markFailed)
  const setOnline = useScanQueueStore((s) => s.setOnline)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [mode, setMode] = React.useState<ScanMode>("RECEIVE")
  const [showDebug, setShowDebug] = React.useState(false)
  const [activeManifest, setActiveManifest] =
    React.useState<ManifestContext | null>(null)
  const [pendingPodAwb, setPendingPodAwb] = React.useState<string | null>(null)

  // Track online state via the browser's events
  React.useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener("online", on)
    window.addEventListener("offline", off)
    setOnline(navigator.onLine)
    return () => {
      window.removeEventListener("online", on)
      window.removeEventListener("offline", off)
    }
  }, [setOnline])

  const pendingCount = queue.filter((q) => !q.synced).length
  const failedCount = queue.filter((q) => q.retryCount > 0 && !q.synced).length

  const handleScan = React.useCallback(
    async (
      awb: string,
      activeMode: ScanMode
    ): Promise<{ outcome: ScanOutcome; reason?: string }> => {
      // Manifest-mode dedup against the current session set
      if (
        (activeMode === "LOAD_MANIFEST" || activeMode === "VERIFY_MANIFEST") &&
        activeManifest
      ) {
        if (activeManifest.scanned.has(awb)) {
          return { outcome: "DUPLICATE", reason: "Already in this manifest" }
        }
      }

      // DELIVER mode pauses for POD capture before syncing
      if (activeMode === "DELIVER") {
        setPendingPodAwb(awb)
        return {
          outcome: "SUCCESS",
          reason: "POD pending — capture proof of delivery",
        }
      }

      const eventId = crypto.randomUUID()
      // Optimistic enqueue → background sync. The store keeps the queue
      // visible in the footer status bar; markSynced/markFailed update it.
      enqueue({
        awb,
        scanType:
          activeMode === "RECEIVE"
            ? "INBOUND"
            : activeMode === "LOAD_MANIFEST"
              ? "OUTBOUND"
              : activeMode === "VERIFY_MANIFEST"
                ? "MANIFEST"
                : "DELIVERY",
        location: HubCode.IMPHAL,
        scannedAt: new Date().toISOString(),
      })

      try {
        await syncScanEvent.mutateAsync({
          id: eventId,
          type: activeMode === "VERIFY_MANIFEST" ? "manifest" : "shipment",
          code: awb,
          timestamp: new Date().toISOString(),
          source: ScanSource.MANUAL,
          hubCode: HubCode.IMPHAL,
          staffId: crypto.randomUUID() as unknown as UUID,
          synced: false,
        })
        markSynced(eventId)

        // Track manifest-scope dedup
        if (
          (activeMode === "LOAD_MANIFEST" ||
            activeMode === "VERIFY_MANIFEST") &&
          activeManifest
        ) {
          setActiveManifest((m) =>
            m
              ? { ...m, scanned: new Set([...m.scanned, awb]) }
              : m
          )
        }
        return { outcome: "SUCCESS" }
      } catch (err) {
        markFailed(eventId, (err as Error).message)
        return { outcome: "ERROR", reason: (err as Error).message }
      }
    },
    [activeManifest, enqueue, markFailed, markSynced, syncScanEvent]
  )

  const handlePodSubmit = async (payload: PodPayload) => {
    // Phase 3 records the POD locally and emits a tracking event marking the
    // shipment DELIVERED. Phase 5 will upload the photo + signature to Storage.
    const eventId = crypto.randomUUID()
    enqueue({
      awb: payload.awbNumber,
      scanType: "DELIVERY",
      location: HubCode.IMPHAL,
      scannedAt: payload.capturedAt,
    })
    try {
      await syncScanEvent.mutateAsync({
        id: eventId,
        type: "shipment",
        code: payload.awbNumber,
        timestamp: payload.capturedAt,
        source: ScanSource.MANUAL,
        hubCode: HubCode.IMPHAL,
        staffId: crypto.randomUUID() as unknown as UUID,
        synced: false,
      })
      markSynced(eventId)
      addNotification({
        type: "success",
        title: "Delivered",
        message: `${payload.awbNumber} marked delivered with POD captured.`,
      })
    } catch (err) {
      markFailed(eventId, (err as Error).message)
      addNotification({
        type: "error",
        title: "POD sync failed",
        message: (err as Error).message,
      })
    }
    setPendingPodAwb(null)
  }

  const podRail =
    mode === "DELIVER" && pendingPodAwb ? (
      <PodCapture
        awbNumber={pendingPodAwb}
        onSubmit={handlePodSubmit}
        onCancel={() => setPendingPodAwb(null)}
      />
    ) : null

  return (
    <>
      <ScanningConsole
        mode={mode}
        onModeChange={(m) => {
          setMode(m)
          if (m !== "LOAD_MANIFEST" && m !== "VERIFY_MANIFEST") {
            setActiveManifest(null)
          }
          if (m !== "DELIVER") {
            setPendingPodAwb(null)
          }
        }}
        onScan={handleScan}
        activeManifest={activeManifest}
        onClearManifest={() => setActiveManifest(null)}
        isOnline={isOnline}
        pendingCount={pendingCount}
        failedCount={failedCount}
        onToggleDebug={() => setShowDebug((v) => !v)}
        rightRail={podRail}
      />
      {showDebug && <ScannerDebug onClose={() => setShowDebug(false)} />}
    </>
  )
}
