import type { Metadata } from "next"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { ExceptionsClient } from "./exceptions-client"

export const metadata: Metadata = {
  title: "Exceptions | TAC Express Dashboard",
  description: "Manage shipment exceptions and anomalies",
}

export default function ExceptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        overline="Operations"
        title="Exceptions"
        description="Shipment exceptions requiring attention"
      />
      <ExceptionsClient />
    </div>
  )
}
