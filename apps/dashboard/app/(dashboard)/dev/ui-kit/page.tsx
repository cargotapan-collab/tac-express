import type { Metadata } from "next"

import { UiKitClient } from "./ui-kit-client"

export const metadata: Metadata = {
  title: "UI Kit · TAC Express",
  description:
    "Showcase of every primitive and composed component shipped by @workspace/ui.",
}

export default function UiKitPage() {
  return <UiKitClient />
}
