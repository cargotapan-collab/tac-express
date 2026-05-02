import type { Metadata } from "next"
import { ManagementClient } from "./management-client"

export const metadata: Metadata = { title: "Management | TAC Express" }

export default function ManagementPage() {
  return <ManagementClient />
}
