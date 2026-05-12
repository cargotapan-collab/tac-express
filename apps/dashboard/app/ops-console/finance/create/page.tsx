import type { Metadata } from "next"

import {
  OpsFrame,
  OpsPageHead,
} from "@workspace/ui/components/composed/ops-console"

import { OpsCreateInvoiceLive } from "./ops-create-invoice-live"

export const metadata: Metadata = { title: "New Invoice — TAC Express Ops Console" }
export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <OpsFrame>
      <OpsPageHead
        eyebrow="Business"
        title="New Invoice"
        sub="Single-page MVP. Wizard with rate lookup ports later."
      />
      <OpsCreateInvoiceLive />
    </OpsFrame>
  )
}
