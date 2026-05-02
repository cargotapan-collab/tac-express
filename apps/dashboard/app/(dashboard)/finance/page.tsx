import type { Metadata } from "next"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { FinanceClient } from "./finance-client"

export const metadata: Metadata = {
  title: "Finance | TAC Express Dashboard",
  description: "Invoices, billing, and financial reports",
}

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        overline="Business"
        title="Finance"
        description="Invoices, billing and financial reports"
      />
      <FinanceClient />
    </div>
  )
}
