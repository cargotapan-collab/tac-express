import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

import { OpsManifestsView } from "./ops-manifests-view"

const DRAFT_MANIFEST = {
  id: "M-1001",
  from: "Bangalore",
  to: "Delhi",
  shipments: 14,
  weight: "212",
  date: "08 May",
  status: "Draft" as const,
  detailHref: "/ops-console/manifests/draft-uuid",
}

const ARRIVED_MANIFEST = {
  id: "M-0997",
  from: "Mumbai",
  to: "Chennai",
  shipments: 22,
  weight: "318",
  date: "06 May",
  status: "Arrived" as const,
  detailHref: "/ops-console/manifests/arrived-uuid",
}

describe("OpsManifestsView", () => {
  it("renders the page heading", () => {
    render(<OpsManifestsView items={[]} />)
    expect(
      screen.getByRole("heading", { level: 1, name: /manifests/i })
    ).toBeInTheDocument()
  })

  it("renders the New Manifest CTA pointing to the v6 wizard", () => {
    // Non-empty items so the page renders cards (not the empty-state CTA),
    // and the only "New Manifest" link is the one in the page header.
    render(<OpsManifestsView items={[DRAFT_MANIFEST]} />)
    const cta = screen.getByRole("link", { name: /new manifest/i })
    expect(cta).toHaveAttribute("href", "/manifests/create")
  })

  it("renders a card per manifest with id, route, shipment count, weight", () => {
    render(<OpsManifestsView items={[DRAFT_MANIFEST]} />)
    expect(screen.getByText("M-1001")).toBeInTheDocument()
    expect(screen.getByText(/bangalore → delhi/i)).toBeInTheDocument()
    expect(screen.getByText(/\b14\b/)).toBeInTheDocument()
    expect(screen.getByText(/\b212\b/)).toBeInTheDocument()
  })

  it("wraps the card in a Link when detailHref is provided", () => {
    render(<OpsManifestsView items={[DRAFT_MANIFEST]} />)
    expect(
      screen.getByRole("link", { name: /M-1001/i })
    ).toHaveAttribute("href", "/ops-console/manifests/draft-uuid")
  })

  it("filters manifests by the active status tab", () => {
    render(
      <OpsManifestsView items={[DRAFT_MANIFEST, ARRIVED_MANIFEST]} />
    )
    fireEvent.click(screen.getByRole("tab", { name: /^arrived$/i }))
    expect(screen.queryByText("M-1001")).not.toBeInTheDocument()
    expect(screen.getByText("M-0997")).toBeInTheDocument()
  })

  it("renders nothing in the grid when items is empty", () => {
    render(<OpsManifestsView items={[]} />)
    expect(screen.queryByText(/M-\d+/)).not.toBeInTheDocument()
  })
})
