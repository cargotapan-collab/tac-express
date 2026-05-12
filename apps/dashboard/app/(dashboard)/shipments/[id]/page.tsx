import type { Metadata } from "next"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { addDays, format, parseISO } from "date-fns"

import { createShipmentServerService } from "@workspace/services/server"
import { ShipmentStepper } from "@workspace/ui/components/composed/shipments/shipment-stepper"
import { ShipmentStatusBadge } from "@workspace/ui/components/composed/shipments/shipment-status-badge"
import { TrackingTimeline } from "@workspace/ui/components/composed/shipments/tracking-timeline"
import { ShipmentDetailTabs } from "@workspace/ui/components/composed/shipments/shipment-detail-tabs"
import { UniversalBarcode } from "@workspace/ui/components/primitives/universal-barcode"
import {
  RiArrowLeftLine,
  RiErrorWarningLine,
  RiPrinterLine,
} from "@workspace/ui/icons"

import { ShipmentNotesTab } from "./notes-tab"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: `Shipment ${id} | TAC Express Dashboard` }
}

export default async function ShipmentDetailPage({ params }: Props) {
  const { id } = await params
  const cookieStore = await cookies()
  const svc = createShipmentServerService(cookieStore)

  // Surface tracking-fetch errors to the UI instead of silently swallowing
  // them — the empty array used to be indistinguishable from "no events" vs
  // "fetch failed". `eventsError` reaches the Tracking tab below.
  const [shipment, trackingResult] = await Promise.all([
    svc.getShipmentById(id).catch(() => null),
    svc
      .getTrackingEvents(id)
      .then((events) => ({ ok: true as const, events }))
      .catch((err: unknown) => ({
        ok: false as const,
        message: err instanceof Error ? err.message : "Failed to load tracking events.",
      })),
  ])

  if (!shipment) notFound()

  const events = trackingResult.ok ? trackingResult.events : []
  const eventsError = trackingResult.ok ? null : trackingResult.message

  const overview = (
    <div className="space-y-6">
      <ShipmentStepper currentStatus={shipment.status} />

      <div className="flex justify-center">
        <UniversalBarcode value={shipment.awbNumber} mode="screen" />
      </div>

      {/* Unified 12-col grid — Sender/Receiver span 6 each (Row 1) and the
          4 metadata cards span 3 each (Row 2), so the column boundaries
          align perfectly. Single gap value (gap-4) on both rows. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="bg-surface-elevated space-y-3 border border-border shadow-sm p-4 md:col-span-6">
          <p className="tac-mono-label text-muted-foreground">Sender</p>
          <div className="space-y-0.5">
            <p className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
              {shipment.sender.name}
            </p>
            <p className="t-mono-sm text-muted-foreground">
              {shipment.sender.phone}
            </p>
            <p className="t-mono-sm text-muted-foreground">
              {shipment.sender.address.line1}, {shipment.sender.address.city} -{" "}
              {shipment.sender.address.zip}
            </p>
          </div>
        </div>
        <div className="bg-surface-elevated space-y-3 border border-border shadow-sm p-4 md:col-span-6">
          <p className="tac-mono-label text-muted-foreground">Receiver</p>
          <div className="space-y-0.5">
            <p className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
              {shipment.receiver.name}
            </p>
            <p className="t-mono-sm text-muted-foreground">
              {shipment.receiver.phone}
            </p>
            <p className="t-mono-sm text-muted-foreground">
              {shipment.receiver.address.line1},{" "}
              {shipment.receiver.address.city} -{" "}
              {shipment.receiver.address.zip}
            </p>
          </div>
        </div>

        {[
          {
            label: "Route",
            value: `${shipment.originHub} → ${shipment.destHub}`,
          },
          {
            label: "Weight",
            value: `${shipment.weight.chargeable.toFixed(2)} kg`,
          },
          { label: "Payment", value: shipment.paymentMode },
          { label: "Service", value: shipment.serviceLevel },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="border border-border bg-surface-elevated shadow-sm p-4 col-span-1 md:col-span-3"
          >
            <p className="tac-mono-label text-muted-foreground">{label}</p>
            <p className="mt-1 t-mono tabular-nums font-semibold text-foreground">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  const tracking = (
    <div className="bg-surface-elevated space-y-4 border border-border shadow-sm p-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-base">
      <p className="tac-mono-label text-muted-foreground">Tracking History</p>
      {eventsError ? (
        <div
          role="alert"
          aria-live="assertive"
          className="border border-accent-danger/40 bg-card p-4 grid grid-cols-12 gap-3"
        >
          <div className="col-span-1 pt-0.5">
            <RiErrorWarningLine aria-hidden className="size-5 text-accent-danger" />
          </div>
          <div className="col-span-11 space-y-2">
            <span className="tac-mono-label text-accent-danger">TRACKING · ERROR</span>
            <p className="t-body-sm text-foreground">Could not load tracking events.</p>
            <p className="t-mono-sm text-muted-foreground">{eventsError}</p>
            <p className="t-caption text-muted-foreground">
              Reload the page or contact support if the issue persists.
            </p>
          </div>
        </div>
      ) : (
        <TrackingTimeline events={events} />
      )}
    </div>
  )

  return (
    <div className="max-w-5xl space-y-6">
      <header className="flex items-start justify-between gap-4 border-b border-border pb-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-base">
        <div>
          {/* Explicit Back-to-Shipments affordance — the breadcrumb in the
              chrome header is small; operators landing here from the create
              flow want a one-tap return path. */}
          <Link
            href="/shipments"
            className="inline-flex items-center gap-1.5 tac-mono-label text-muted-foreground hover:text-foreground transition-colors duration-fast focus-visible:outline-none focus-visible:tac-focus-premium"
          >
            <RiArrowLeftLine aria-hidden className="size-3.5" />
            Back to Shipments
          </Link>
          <p className="tac-mono-label text-muted-foreground mt-3">AWB Number</p>
          <h1 className="mt-0.5 t-display font-mono tabular-nums tracking-widest text-foreground">
            {shipment.awbNumber}
          </h1>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {/* ETA chip — surfaces estimated delivery date next to the status
              badge so it's visible without scrolling. Moves out of the
              metadata grid below (which then balances cleanly to 4 cards). */}
          <span className="inline-flex h-8 items-center gap-1.5 border border-border px-3 tac-mono-label text-muted-foreground">
            ETA ·{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {computeEta({
                status: shipment.status,
                createdAt: shipment.createdAt,
                serviceLevel: shipment.serviceLevel,
              })}
            </span>
          </span>
          <Link
            href={`/print/label/${shipment.awbNumber}`}
            target="_blank"
            rel="noopener"
            className="inline-flex h-8 items-center gap-1.5 border border-border px-3 tac-mono-label text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:tac-focus-premium"
          >
            <RiPrinterLine className="h-3.5 w-3.5" aria-hidden="true" />
            Label
          </Link>
          <ShipmentStatusBadge status={shipment.status} />
        </div>
      </header>

      <ShipmentDetailTabs
        overview={overview}
        tracking={tracking}
        notes={<ShipmentNotesTab shipmentId={id} />}
      />
    </div>
  )
}

/**
 * Compute Estimated Delivery date from a shipment.
 *
 *   PRIORITY / EXPRESS → +1 business day from createdAt
 *   STANDARD / default → +3 business days from createdAt
 *
 * Terminal states (DELIVERED, CANCELLED, RTO) get a static label. This is a
 * best-effort estimate — once the back-end exposes a real `estimated_delivery`
 * column the helper can read from it instead.
 */
function computeEta(shipment: {
  status?: string
  createdAt?: string
  serviceLevel?: string
}): string {
  const terminal = ["DELIVERED", "CANCELLED", "RTO"]
  if (shipment.status && terminal.includes(shipment.status)) {
    return shipment.status === "DELIVERED" ? "Delivered" : "—"
  }
  if (!shipment.createdAt) return "—"
  const sla = /priority|express/i.test(shipment.serviceLevel ?? "") ? 1 : 3
  try {
    return format(addDays(parseISO(shipment.createdAt), sla), "dd MMM yyyy")
  } catch {
    return "—"
  }
}
