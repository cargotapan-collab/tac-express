import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { TrackingResultView } from "@workspace/ui/components/composed/tracking-result-view"
import { createPublicTrackingService } from "@workspace/services/public-tracking.service"

interface TrackPageProps {
  params: Promise<{ awb: string }>
}

export async function generateMetadata({ params }: TrackPageProps): Promise<Metadata> {
  const { awb } = await params
  return {
    title: `Track ${decodeURIComponent(awb)} — TAC Express`,
    description: `Real-time tracking for shipment ${decodeURIComponent(awb)}`,
  }
}

function getTrackingService() {
  return createPublicTrackingService({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  })
}

export default async function TrackPage({ params }: TrackPageProps) {
  const { awb: rawAwb } = await params
  const awb = decodeURIComponent(rawAwb).toUpperCase()
  const tracking = getTrackingService()

  const [shipment, events] = await Promise.all([
    tracking.getShipmentByAwb(awb),
    tracking.getTrackingEvents(awb),
  ])

  return (
    <div className="tac-fui-grid min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/#tracking"
            className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            ← Back to tracking
          </Link>
          <h1 className="font-sans text-2xl font-semibold text-foreground mt-4">
            Shipment Status
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1 uppercase tracking-wider">
            {awb}
          </p>
        </div>

        <TrackingResultView awb={awb} shipment={shipment} events={events} />
      </div>
    </div>
  )
}
