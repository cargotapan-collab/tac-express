import type { Metadata } from "next"
import { CustomersClient } from "./customers-client"

export const metadata: Metadata = { title: "Customers | TAC Express" }

export default function CustomersPage() {
  return <CustomersClient />
}
