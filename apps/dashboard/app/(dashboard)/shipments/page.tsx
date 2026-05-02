import type { Metadata } from "next"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { ShipmentsClient } from "./shipments-client"

export const metadata: Metadata = {
  title: "Shipments | TAC Express Dashboard",
  description: "Manage and track all shipments",
}

export default function ShipmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        overline="Operations"
        title="Shipments"
        description="All shipments — search, filter, and manage"
      />
      <ShipmentsClient />
    </div>
  )
}
