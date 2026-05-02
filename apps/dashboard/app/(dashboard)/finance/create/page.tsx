import type { Metadata } from "next"
import { CreateInvoiceClient } from "./create-invoice-client"

export const metadata: Metadata = { title: "Create Invoice | TAC Express" }

export default function CreateInvoicePage() {
  return <CreateInvoiceClient />
}
