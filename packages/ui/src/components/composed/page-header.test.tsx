import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"

import { PageHeader } from "./page-header"

describe("PageHeader", () => {
  it("renders the title", () => {
    render(<PageHeader title="Shipments" />)
    expect(
      screen.getByRole("heading", { level: 1, name: /shipments/i })
    ).toBeInTheDocument()
  })

  it("renders the overline when provided", () => {
    render(<PageHeader overline="Operations" title="Shipments" />)
    expect(screen.getByText(/operations/i)).toBeInTheDocument()
  })

  it("omits the overline when not provided", () => {
    render(<PageHeader title="Shipments" />)
    // The overline uses the .t-overline class — neither element is mounted
    // when no overline prop is passed.
    expect(screen.queryByText(/operations/i)).not.toBeInTheDocument()
  })

  it("renders the description when provided", () => {
    render(
      <PageHeader
        title="Shipments"
        description="Manage AWBs across the network"
      />
    )
    expect(screen.getByText(/manage awbs/i)).toBeInTheDocument()
  })

  it("omits the description when not provided", () => {
    render(<PageHeader title="Shipments" />)
    expect(screen.queryByText(/manage awbs/i)).not.toBeInTheDocument()
  })

  it("renders the actions slot content when provided", () => {
    render(
      <PageHeader
        title="Shipments"
        actions={<button type="button">New Shipment</button>}
      />
    )
    expect(
      screen.getByRole("button", { name: /new shipment/i })
    ).toBeInTheDocument()
  })

  it("omits the actions slot when not provided", () => {
    const { container } = render(<PageHeader title="Shipments" />)
    expect(
      container.querySelector('[data-slot="page-header-actions"]')
    ).toBeNull()
  })

  it("renders the actions slot wrapper with the canonical data-slot when provided", () => {
    const { container } = render(
      <PageHeader
        title="Shipments"
        actions={<button type="button">New Shipment</button>}
      />
    )
    expect(
      container.querySelector('[data-slot="page-header-actions"]')
    ).not.toBeNull()
  })

  it("exposes data-slot='page-header' on the outer header", () => {
    const { container } = render(<PageHeader title="X" />)
    const header = container.querySelector('[data-slot="page-header"]')
    expect(header).not.toBeNull()
    expect(header?.tagName).toBe("HEADER")
  })

  it("applies the gradient class on the title when gradient=true", () => {
    render(<PageHeader title="Premium" gradient />)
    const h1 = screen.getByRole("heading", { level: 1, name: /premium/i })
    expect(h1).toHaveClass("t-gradient-primary")
  })

  it("does not apply the gradient class by default", () => {
    render(<PageHeader title="Plain" />)
    const h1 = screen.getByRole("heading", { level: 1, name: /plain/i })
    expect(h1).not.toHaveClass("t-gradient-primary")
  })

  it("merges custom className onto the outer header", () => {
    const { container } = render(
      <PageHeader title="X" className="custom-page-header" />
    )
    expect(
      container.querySelector('[data-slot="page-header"]')
    ).toHaveClass("custom-page-header")
  })
})
