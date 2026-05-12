import type { Metadata } from "next"

import {
  OpsFrame,
  OpsPageHead,
} from "@workspace/ui/components/composed/ops-console"

import { OpsCreateShipmentLive } from "./ops-create-shipment-live"

export const metadata: Metadata = {
  title: "New Shipment — TAC Express Ops Console",
}

export const dynamic = "force-dynamic"

export default function OpsCreateShipmentPage() {
  return (
    <OpsFrame>
      <OpsPageHead
        eyebrow="Operations"
        title="New Shipment"
        sub="Single-page form. AWB is generated server-side on commit."
      />
      <OpsCreateShipmentLive />
    </OpsFrame>
  )
}
