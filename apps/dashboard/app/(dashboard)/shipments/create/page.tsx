import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { RiArrowLeftLine } from "@workspace/ui/icons"

import { CreateShipmentPageClient } from "./create-shipment-client"

export const metadata: Metadata = {
  title: "Create Shipment | TAC Express Dashboard",
}

export default function CreateShipmentPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Escape hatch — the multi-step wizard has no built-in "Cancel" at the
          top level. Operators landing here from /shipments need a one-tap
          return path while mid-form. */}
      <Link
        href="/shipments"
        className="inline-flex items-center gap-1.5 tac-mono-label text-muted-foreground hover:text-foreground transition-colors duration-fast focus-visible:outline-none focus-visible:tac-focus-premium"
      >
        <RiArrowLeftLine aria-hidden className="size-3.5" />
        Back to Shipments
      </Link>
      <PageHeader
        overline="Operations"
        title="Create Shipment"
        description="New AWB — fill sender, receiver and package details"
      />
      <CreateShipmentPageClient />
    </div>
  )
}
