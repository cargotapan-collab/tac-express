import type { Metadata } from "next"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { ScanningClient } from "./scanning-client"

export const metadata: Metadata = {
  title: "Scanning | TAC Express Dashboard",
  description: "Scan shipment and manifest barcodes",
}

export default function ScanningPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        overline="Operations"
        title="Scanning"
        description="Scan AWBs and manifests — works offline with auto-sync"
      />
      <ScanningClient />
    </div>
  )
}
