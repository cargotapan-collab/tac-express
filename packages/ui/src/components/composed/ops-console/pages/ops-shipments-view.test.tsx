import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

import { OpsShipmentsView } from "./ops-shipments-view"
import type { ShipmentRow } from "./ops-shipments-view"

const ROW_DELIVERED: ShipmentRow = {
  id: "AWB-001",
  customer: "Acme Logistics",
  receiver: "North Hub",
  route: "BLR → DEL",
  service: "STD",
  weight: "12.5kg",
  status: "Delivered",
  age: "2 hours ago",
  detailHref: "/ops-console/shipments/uuid-001",
}

const ROW_IN_TRANSIT: ShipmentRow = {
  id: "AWB-002",
  customer: "Beta Couriers",
  receiver: "South Hub",
  route: "MAA → BOM",
  service: "PRIORITY",
  weight: "3.0kg",
  status: "In Transit",
  age: "1 day ago",
}

describe("OpsShipmentsView", () => {
  it("renders the page heading", () => {
    render(<OpsShipmentsView rows={[]} />)
    expect(
      screen.getByRole("heading", { level: 1, name: /shipments/i })
    ).toBeInTheDocument()
  })

  it("renders the New Shipment CTA pointing to the v6 wizard", () => {
    // Non-empty rows so the page renders the table (not the empty-state CTA),
    // leaving the page-header link as the only "New Shipment" link in the DOM.
    render(<OpsShipmentsView rows={[ROW_DELIVERED]} />)
    const cta = screen.getByRole("link", { name: /new shipment/i })
    expect(cta).toHaveAttribute("href", "/shipments/create")
  })

  it("renders a row for each provided shipment", () => {
    render(<OpsShipmentsView rows={[ROW_DELIVERED, ROW_IN_TRANSIT]} />)
    expect(screen.getByText("AWB-001")).toBeInTheDocument()
    expect(screen.getByText("AWB-002")).toBeInTheDocument()
    expect(screen.getByText("Acme Logistics")).toBeInTheDocument()
    expect(screen.getByText("Beta Couriers")).toBeInTheDocument()
  })

  it("renders the View link with the row's detailHref when provided", () => {
    render(<OpsShipmentsView rows={[ROW_DELIVERED]} />)
    expect(
      screen.getByRole("link", { name: /view/i })
    ).toHaveAttribute("href", "/ops-console/shipments/uuid-001")
  })

  it("renders a disabled View button when detailHref is missing", () => {
    render(<OpsShipmentsView rows={[ROW_IN_TRANSIT]} />)
    // Row 2 has no detailHref — its action renders as a disabled button.
    const buttons = screen.getAllByRole("button", { name: /view/i })
    expect(buttons[0]).toBeDisabled()
  })

  it("renders an empty body when no rows are provided", () => {
    render(<OpsShipmentsView rows={[]} />)
    // The page heading + headers + CTA still mount; only rows are absent.
    expect(screen.queryByText(/AWB-/)).not.toBeInTheDocument()
  })

  it("filters rows by the active status tab", () => {
    render(<OpsShipmentsView rows={[ROW_DELIVERED, ROW_IN_TRANSIT]} />)
    fireEvent.click(screen.getByRole("tab", { name: /^delivered$/i }))
    expect(screen.getByText("AWB-001")).toBeInTheDocument()
    expect(screen.queryByText("AWB-002")).not.toBeInTheDocument()
  })

  it("accepts search input and updates the controlled value", () => {
    render(<OpsShipmentsView rows={[ROW_DELIVERED]} />)
    const input = screen.getByLabelText(/search shipments/i)
    fireEvent.change(input, { target: { value: "ACME" } })
    expect((input as HTMLInputElement).value).toBe("ACME")
  })
})
