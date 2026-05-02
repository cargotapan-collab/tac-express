import type { Metadata } from "next"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"

import { createShipmentServerService } from "@workspace/services/server"
import { ShipmentStepper } from "@workspace/ui/components/composed/shipments/shipment-stepper"
import { ShipmentStatusBadge } from "@workspace/ui/components/composed/shipments/shipment-status-badge"
import { TrackingTimeline } from "@workspace/ui/components/composed/shipments/tracking-timeline"
import { ShipmentDetailTabs } from "@workspace/ui/components/composed/shipments/shipment-detail-tabs"
import { UniversalBarcode } from "@workspace/ui/components/primitives/universal-barcode"
import { RiPrinterLine } from "@workspace/ui/icons"

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

  const [shipment, events] = await Promise.all([
    svc.getShipmentById(id).catch(() => null),
    svc.getTrackingEvents(id).catch(() => []),
  ])

  if (!shipment) notFound()

  const overview = (
    <div className="space-y-6">
      <ShipmentStepper currentStatus={shipment.status} />

      <div className="flex justify-center">
        <UniversalBarcode value={shipment.awbNumber} mode="screen" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="tac-fui-panel space-y-3 bg-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Sender
          </p>
          <div className="space-y-0.5">
            <p className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
              {shipment.sender.name}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {shipment.sender.phone}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {shipment.sender.address.line1}, {shipment.sender.address.city} -{" "}
              {shipment.sender.address.zip}
            </p>
          </div>
        </div>
        <div className="tac-fui-panel space-y-3 bg-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Receiver
          </p>
          <div className="space-y-0.5">
            <p className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
              {shipment.receiver.name}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {shipment.receiver.phone}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {shipment.receiver.address.line1},{" "}
              {shipment.receiver.address.city} -{" "}
              {shipment.receiver.address.zip}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          <div key={label} className="border border-border bg-card p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  const tracking = (
    <div className="tac-fui-panel space-y-4 bg-card p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Tracking History
      </p>
      <TrackingTimeline events={events} />
    </div>
  )

  return (
    <div className="max-w-5xl space-y-6">
      <header className="flex items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            AWB Number
          </p>
          <h1 className="mt-0.5 font-mono text-2xl font-bold tracking-widest text-foreground">
            {shipment.awbNumber}
          </h1>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Link
            href={`/print/label/${shipment.awbNumber}`}
            target="_blank"
            rel="noopener"
            className="inline-flex h-8 items-center gap-1.5 border border-border px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
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
