import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

import { OpsFinanceView } from "./ops-finance-view"

const ROW_PAID = {
  id: "INV-0001",
  customer: "Acme Logistics",
  status: "Paid",
  tone: "ok" as const,
  amount: "₹12,450",
  due: "08 May",
  detailHref: "/ops-console/finance/uuid-paid",
}

const ROW_OVERDUE = {
  id: "INV-0002",
  customer: "Beta Couriers",
  status: "Overdue",
  tone: "err" as const,
  amount: "₹3,000",
  due: "01 May",
  detailHref: "/ops-console/finance/uuid-overdue",
}

const BUCKETS = [
  { label: "Current", amount: "₹0", sub: "0 invoices", toneClass: "border-l-paper-ok" },
  { label: "0–30 days", amount: "₹15,000", sub: "2 invoices · 60%", toneClass: "border-l-paper-warn" },
  { label: "31–60 days", amount: "₹10,000", sub: "1 invoices · 40%", toneClass: "border-l-paper-fg-3" },
  { label: "61–90 days", amount: "₹0", sub: "0 invoices", toneClass: "border-l-paper-fg-3" },
]

describe("OpsFinanceView", () => {
  it("renders the page heading", () => {
    render(
      <OpsFinanceView
        outstanding="₹25,000"
        totalInvoices={3}
        buckets={BUCKETS}
        rows={[]}
      />
    )
    expect(
      screen.getByRole("heading", { level: 1, name: /finance/i })
    ).toBeInTheDocument()
  })

  it("renders the New Invoice CTA pointing to the v6 wizard", () => {
    // Non-empty rows so the page renders the table (not the empty-state CTA),
    // leaving the page-header link as the only "New Invoice" link in the DOM.
    render(
      <OpsFinanceView
        outstanding="₹12,450"
        totalInvoices={1}
        buckets={BUCKETS}
        rows={[ROW_PAID]}
      />
    )
    expect(
      screen.getByRole("link", { name: /new invoice/i })
    ).toHaveAttribute("href", "/finance/create")
  })

  it("renders aging-bucket cards from the provided buckets prop", () => {
    render(
      <OpsFinanceView
        outstanding="₹25,000"
        totalInvoices={3}
        buckets={BUCKETS}
        rows={[]}
      />
    )
    expect(screen.getByText("0–30 days")).toBeInTheDocument()
    expect(screen.getByText("₹15,000")).toBeInTheDocument()
    expect(screen.getByText(/60%/)).toBeInTheDocument()
  })

  it("renders a row per invoice with id, customer, amount", () => {
    render(
      <OpsFinanceView
        outstanding="₹15,450"
        totalInvoices={2}
        buckets={BUCKETS}
        rows={[ROW_PAID, ROW_OVERDUE]}
      />
    )
    expect(screen.getByText("INV-0001")).toBeInTheDocument()
    expect(screen.getByText("INV-0002")).toBeInTheDocument()
    expect(screen.getByText("Acme Logistics")).toBeInTheDocument()
    expect(screen.getByText("₹3,000")).toBeInTheDocument()
  })

  it("filters rows by the active status tab", () => {
    render(
      <OpsFinanceView
        outstanding="₹15,450"
        totalInvoices={2}
        buckets={BUCKETS}
        rows={[ROW_PAID, ROW_OVERDUE]}
      />
    )
    fireEvent.click(screen.getByRole("tab", { name: /^paid$/i }))
    expect(screen.getByText("INV-0001")).toBeInTheDocument()
    expect(screen.queryByText("INV-0002")).not.toBeInTheDocument()
  })

  it("renders the View link with the row's detailHref", () => {
    render(
      <OpsFinanceView
        outstanding="₹12,450"
        totalInvoices={1}
        buckets={BUCKETS}
        rows={[ROW_PAID]}
      />
    )
    const link = screen.getByRole("link", { name: /view/i })
    expect(link).toHaveAttribute("href", "/ops-console/finance/uuid-paid")
  })
})
