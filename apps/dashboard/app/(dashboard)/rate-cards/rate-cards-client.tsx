"use client"

import * as React from "react"
import { useRateCards, useCreateRateCard, useDeactivateRateCard } from "@workspace/services/hooks/use-rate-cards"
import { RateCardTable } from "@workspace/ui/components/composed/finance/rate-card-table"
import { RateCardForm } from "@workspace/ui/components/composed/finance/rate-card-form"
import { useNotificationStore } from "@workspace/services/stores/notification.store"
import type { RateCardInput } from "@workspace/types"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/primitives/input"
import { RiAddLine } from "@workspace/ui/icons"

export function RateCardsClient() {
  const [showForm, setShowForm] = React.useState(false)
  const [routeFilter, setRouteFilter] = React.useState<{ origin?: string; dest?: string }>({})
  const addNotification = useNotificationStore((s) => s.addNotification)

  const { data: rateCards, isLoading } = useRateCards({
    originHub: routeFilter.origin || undefined,
    destHub: routeFilter.dest || undefined,
  })
  const createRateCard = useCreateRateCard()
  const deactivateRateCard = useDeactivateRateCard()

  async function handleCreate(values: RateCardInput) {
    try {
      await createRateCard.mutateAsync(values)
      addNotification({
        type: "success",
        title: "Rate card added",
        message: `${values.originHub} → ${values.destHub} ${values.serviceLevel}`,
      })
      setShowForm(false)
    } catch (err) {
      addNotification({ type: "error", title: "Failed to add rate card", message: String(err) })
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Deactivate this rate card?")) return
    try {
      await deactivateRateCard.mutateAsync(id)
      addNotification({ type: "success", title: "Rate card deactivated", message: id })
    } catch (err) {
      addNotification({ type: "error", title: "Failed", message: String(err) })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        overline="Business"
        title="Rate Cards"
        description="Pricing rules per route, service level, and weight slab"
        actions={
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <RiAddLine aria-hidden="true" />
            <span className="ml-1.5">Add Rate Card</span>
          </Button>
        }
      />

      {showForm && (
        <div className="bg-card p-5 space-y-3 tac-fui-panel">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
            New Rate Card
          </p>
          <RateCardForm onSubmit={handleCreate} isLoading={createRateCard.isPending} />
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={routeFilter.origin ?? ""}
          onChange={(e) => setRouteFilter((f) => ({ ...f, origin: e.target.value.toUpperCase() || undefined }))}
          placeholder="Filter origin (e.g. IMPHAL)"
          className="h-8 font-mono text-xs w-48"
        />
        <Input
          value={routeFilter.dest ?? ""}
          onChange={(e) => setRouteFilter((f) => ({ ...f, dest: e.target.value.toUpperCase() || undefined }))}
          placeholder="Filter destination"
          className="h-8 font-mono text-xs w-48"
        />
      </div>

      <RateCardTable
        rateCards={rateCards ?? []}
        isLoading={isLoading}
        onDeactivate={handleDeactivate}
      />
    </div>
  )
}
