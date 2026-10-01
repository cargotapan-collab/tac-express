import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

import { ContactLeadsView } from "./contact-leads-view"
import type { ContactLeadRow } from "@workspace/types"

const NEW_LEAD: ContactLeadRow = {
  id: "lead-1",
  name: "Aman Sharma",
  email: "aman@example.com",
  company: "Tea Cooperative",
  reason: "sales",
  message: "Looking for a quote to Imphal.",
  status: "new",
  notification_status: "sent",
  notification_sent_at: "2026-05-21T10:00:00Z",
  whatsapp_send_id: "wa-1",
  ip_address: null,
  user_agent: null,
  created_at: "2026-05-21T09:59:00Z",
}

const CONTACTED_LEAD: ContactLeadRow = {
  ...NEW_LEAD,
  id: "lead-2",
  name: "Bina Devi",
  email: "bina@example.com",
  company: null,
  reason: "support",
  message: "Need help with a delayed parcel.",
  status: "contacted",
  notification_status: "failed",
}

describe("ContactLeadsView", () => {
  it("renders the page heading + lead count", () => {
    render(<ContactLeadsView leads={[NEW_LEAD]} onStatusChange={vi.fn()} />)
    expect(
      screen.getByRole("heading", { level: 1, name: /contact inbox/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/1 lead\b/i)).toBeInTheDocument()
  })

  it("renders the loading skeleton when isLoading", () => {
    const { container } = render(
      <ContactLeadsView leads={[]} isLoading onStatusChange={vi.fn()} />,
    )
    expect(screen.queryByText("Aman Sharma")).not.toBeInTheDocument()
    // SkeletonTable renders aria-hidden placeholder rows.
    expect(container.querySelector("[data-slot='skeleton'], .animate-pulse")).toBeTruthy()
  })

  it("renders the error state when isError", () => {
    render(<ContactLeadsView leads={[]} isError onStatusChange={vi.fn()} />)
    expect(screen.getByText(/couldn't load leads/i)).toBeInTheDocument()
  })

  it("renders the empty state when there are no leads", () => {
    render(<ContactLeadsView leads={[]} onStatusChange={vi.fn()} />)
    expect(screen.getByText(/no leads yet/i)).toBeInTheDocument()
  })

  it("renders a row per lead", () => {
    render(
      <ContactLeadsView
        leads={[NEW_LEAD, CONTACTED_LEAD]}
        onStatusChange={vi.fn()}
      />,
    )
    expect(screen.getByText("Aman Sharma")).toBeInTheDocument()
    expect(screen.getByText("Bina Devi")).toBeInTheDocument()
  })

  it("filters by the active status tab", () => {
    render(
      <ContactLeadsView
        leads={[NEW_LEAD, CONTACTED_LEAD]}
        onStatusChange={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText("CONTACTED"))
    expect(screen.getByText("Bina Devi")).toBeInTheDocument()
    expect(screen.queryByText("Aman Sharma")).not.toBeInTheDocument()
  })

  it("filters by the search box (name/email/company)", () => {
    render(
      <ContactLeadsView
        leads={[NEW_LEAD, CONTACTED_LEAD]}
        onStatusChange={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText(/search leads/i), {
      target: { value: "bina" },
    })
    expect(screen.getByText("Bina Devi")).toBeInTheDocument()
    expect(screen.queryByText("Aman Sharma")).not.toBeInTheDocument()
  })

  it("expands a row to reveal the message + fires onStatusChange on a status change", () => {
    const onStatusChange = vi.fn()
    render(<ContactLeadsView leads={[NEW_LEAD]} onStatusChange={onStatusChange} />)

    // Row collapsed: the full message is not shown yet.
    expect(screen.queryByText(/looking for a quote to imphal/i)).not.toBeInTheDocument()

    // The disclosure button is the keyboard-operable expand control.
    fireEvent.click(screen.getByRole("button", { name: /expand details for aman sharma/i }))
    expect(screen.getByText(/looking for a quote to imphal/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/triage status/i), {
      target: { value: "contacted" },
    })
    expect(onStatusChange).toHaveBeenCalledWith("lead-1", "contacted")
  })
})
