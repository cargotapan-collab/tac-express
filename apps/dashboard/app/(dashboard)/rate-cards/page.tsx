import type { Metadata } from "next"
import { RateCardsClient } from "./rate-cards-client"

export const metadata: Metadata = { title: "Rate Cards | TAC Express" }

export default function RateCardsPage() {
  return <RateCardsClient />
}
