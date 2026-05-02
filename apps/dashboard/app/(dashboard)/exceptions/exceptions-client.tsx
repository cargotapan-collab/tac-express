"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useShipments } from "@workspace/services/hooks/use-shipments"
import { ShipmentStatus } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import { ShipmentStatusBadge } from "@workspace/ui/components/composed/shipments/shipment-status-badge"

export function ExceptionsClient() {
  const router = useRouter()
  const { data, isLoading, error } = useShipments({ status: [ShipmentStatus.EXCEPTION] })

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted/30 animate-pulse tac-fui-panel" />
          ))}
        </div>
      )}

      {error && (
        <div className="tac-fui-border bg-destructive/5 px-4 py-3">
          <p className="font-mono text-xs text-destructive">Failed to load exceptions</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="tac-fui-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["AWB", "Status", "Sender", "Receiver", "Route", ""].map((h) => (
                  <th key={h} className="font-mono text-2xs uppercase tracking-wider text-muted-foreground text-left px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data ?? []).map((s) => (
                <tr key={s.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold text-primary">
                    {s.awbNumber}
                  </td>
                  <td className="px-3 py-2.5">
                    <ShipmentStatusBadge status={s.status} />
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-foreground uppercase tracking-widest">{s.senderName}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-foreground uppercase tracking-widest">{s.receiverName}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                    {s.originHub} → {s.destHub}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/shipments/${s.id}`)}
                      className="font-mono text-2xs uppercase tracking-wider px-2 py-1 h-auto"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center font-mono text-xs text-muted-foreground">
                    No exceptions — all clear
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
