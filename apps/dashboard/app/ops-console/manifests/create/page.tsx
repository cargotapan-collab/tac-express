import type { Metadata } from "next"

import {
  OpsFrame,
  OpsPageHead,
} from "@workspace/ui/components/composed/ops-console"

import { OpsCreateManifestLive } from "./ops-create-manifest-live"

export const metadata: Metadata = { title: "New Manifest — TAC Express Ops Console" }
export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <OpsFrame>
      <OpsPageHead
        eyebrow="Operations"
        title="New Manifest"
        sub="Single-page setup. Add shipments from the detail page after creation."
      />
      <OpsCreateManifestLive />
    </OpsFrame>
  )
}
