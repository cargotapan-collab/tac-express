import type { Metadata } from "next"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { CreateShipmentPageClient } from "./create-shipment-client"

export const metadata: Metadata = {
  title: "Create Shipment | TAC Express Dashboard",
}

export default function CreateShipmentPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        overline="Operations"
        title="Create Shipment"
        description="New AWB — fill sender, receiver and package details"
      />
      <CreateShipmentPageClient />
    </div>
  )
}
