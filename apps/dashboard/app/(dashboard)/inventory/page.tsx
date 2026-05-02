import type { Metadata } from "next"
import { InventoryClient } from "./inventory-client"

export const metadata: Metadata = { title: "Inventory | TAC Express" }

export default function InventoryPage() {
  return <InventoryClient />
}
