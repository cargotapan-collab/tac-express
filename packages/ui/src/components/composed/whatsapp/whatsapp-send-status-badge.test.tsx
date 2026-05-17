import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"

import { WhatsAppSendStatusBadge } from "./whatsapp-send-status-badge"

describe("WhatsAppSendStatusBadge", () => {
  it("renders the status text uppercased (a11y: status not conveyed by color alone)", () => {
    render(<WhatsAppSendStatusBadge status="failed" />)
    // The badge's textContent is `failed`; CSS upper-cases the visual; the
    // accessible-name remains the raw text. Both a sighted user (uppercased
    // brutalist label) and an assistive-tech user (text node) get the signal.
    expect(screen.getByText("failed")).toBeInTheDocument()
  })

  it("applies the failed-status semantic-token classes (no Tailwind color classes)", () => {
    render(<WhatsAppSendStatusBadge status="failed" />)
    const badge = screen.getByText("failed")
    expect(badge.className).toContain("text-destructive")
    expect(badge.className).toContain("border-destructive/40")
    // Negative: no raw Tailwind color class (LAW 10).
    expect(badge.className).not.toMatch(/\bbg-red-\d+\b/)
    expect(badge.className).not.toMatch(/\btext-red-\d+\b/)
  })

  it("applies the queued-status semantic-token classes", () => {
    render(<WhatsAppSendStatusBadge status="queued" />)
    const badge = screen.getByText("queued")
    expect(badge.className).toContain("text-accent-warning")
  })

  it("applies the sent-status semantic-token classes", () => {
    render(<WhatsAppSendStatusBadge status="sent" />)
    const badge = screen.getByText("sent")
    expect(badge.className).toContain("text-primary")
  })

  it("exposes data-slot for downstream styling hooks", () => {
    render(<WhatsAppSendStatusBadge status="failed" />)
    expect(screen.getByText("failed")).toHaveAttribute(
      "data-slot",
      "whatsapp-send-status-badge",
    )
  })

  it("merges caller-provided className without dropping status classes", () => {
    render(<WhatsAppSendStatusBadge status="failed" className="my-custom-class" />)
    const badge = screen.getByText("failed")
    expect(badge.className).toContain("my-custom-class")
    // Status-specific classes still present.
    expect(badge.className).toContain("text-destructive")
  })
})
