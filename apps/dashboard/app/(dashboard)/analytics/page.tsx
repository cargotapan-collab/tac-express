import type { Metadata } from "next"
import { AnalyticsClient } from "./analytics-client"

export const metadata: Metadata = { title: "Analytics | TAC Express" }

export default function AnalyticsPage() {
  return <AnalyticsClient />
}
