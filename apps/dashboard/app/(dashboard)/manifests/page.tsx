import type { Metadata } from "next"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { ManifestsClient } from "./manifests-client"

export const metadata: Metadata = {
  title: "Manifests | TAC Express Dashboard",
  description: "Manage transit manifests",
}

export default function ManifestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        overline="Operations"
        title="Manifests"
        description="Transit manifests — create, build, depart and receive"
      />
      <ManifestsClient />
    </div>
  )
}
