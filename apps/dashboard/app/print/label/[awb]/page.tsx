import type { Metadata } from "next"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { createShipmentServerService } from "@workspace/services/server"
import { PrintLabelClient } from "./print-label-client"

export const metadata: Metadata = {
  title: "Print Label | TAC Express",
  description: "Shipping label for printing",
}

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ awb: string }>
}

export default async function PrintLabelPage({ params }: PageProps) {
  const { awb } = await params
  const cookieStore = await cookies()
  const shipmentService = createShipmentServerService(cookieStore)

  const shipment = await shipmentService.getShipmentByAwb(awb).catch(() => null)

  if (!shipment) {
    notFound()
  }

  return <PrintLabelClient shipment={shipment} />
}
