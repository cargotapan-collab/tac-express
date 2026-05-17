import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

import type { FailedWhatsappSendRow, UUID } from "@workspace/types"

import { WhatsAppRetryButton } from "./whatsapp-retry-button"

const asUUID = (s: string): UUID => s as unknown as UUID

const ROW: FailedWhatsappSendRow = {
  id: asUUID("ff111111-1111-1111-1111-111111111111"),
  invoice_id: asUUID("00000000-0000-0000-0000-000000000001"),
  original_send_id: null,
  attempt_no: 2,
  phone: "919876543210",
  endpoint: "sendmessage",
  template_name: null,
  status: "failed",
  error_message: "WhatsApp rejected (message_wamid: null)",
  queued_at: "2026-05-17T08:00:00Z",
  completed_at: "2026-05-17T08:00:02Z",
}

describe("WhatsAppRetryButton", () => {
  it("renders an enabled idle button by default", () => {
    render(
      <WhatsAppRetryButton
        row={ROW}
        canRetry
        isInflight={false}
        onRetry={() => {}}
      />,
    )
    const btn = screen.getByRole("button", { name: "Retry" })
    expect(btn).toBeInTheDocument()
    expect(btn).not.toBeDisabled()
    expect(btn.getAttribute("data-state")).toBe("idle")
    expect(btn.getAttribute("aria-busy")).toBe("false")
  })

  it("calls onRetry with the row when the user clicks", () => {
    const onRetry = vi.fn()
    render(
      <WhatsAppRetryButton
        row={ROW}
        canRetry
        isInflight={false}
        onRetry={onRetry}
      />,
    )
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onRetry).toHaveBeenCalledWith(ROW)
  })

  it("renders the in-flight state: disabled, busy, label 'Retrying…'", () => {
    const onRetry = vi.fn()
    render(
      <WhatsAppRetryButton row={ROW} canRetry isInflight onRetry={onRetry} />,
    )
    const btn = screen.getByRole("button", { name: "Retrying…" })
    expect(btn).toBeDisabled()
    expect(btn.getAttribute("aria-busy")).toBe("true")
    expect(btn.getAttribute("data-state")).toBe("inflight")
    fireEvent.click(btn)
    expect(onRetry).not.toHaveBeenCalled()
  })

  it("renders the disabled state when canRetry is false (no in-flight, no error)", () => {
    const onRetry = vi.fn()
    render(
      <WhatsAppRetryButton
        row={ROW}
        canRetry={false}
        isInflight={false}
        onRetry={onRetry}
        disabledReason="Template retries: re-send from the invoice detail page."
      />,
    )
    const btn = screen.getByRole("button", { name: "Retry" })
    expect(btn).toBeDisabled()
    expect(btn.getAttribute("data-state")).toBe("disabled")
    expect(btn.getAttribute("title")).toBe(
      "Template retries: re-send from the invoice detail page.",
    )
    fireEvent.click(btn)
    expect(onRetry).not.toHaveBeenCalled()
  })

  it("renders the error state: 'Retry again' + inline error text + destructive token", () => {
    const onRetry = vi.fn()
    render(
      <WhatsAppRetryButton
        row={ROW}
        canRetry
        isInflight={false}
        lastError="WhatsApp rejected (message_wamid: null)"
        onRetry={onRetry}
      />,
    )
    const btn = screen.getByRole("button", { name: "Retry again" })
    expect(btn).not.toBeDisabled()
    expect(btn.getAttribute("data-state")).toBe("error")
    expect(btn.className).toContain("text-destructive")
    expect(
      screen.getByText("WhatsApp rejected (message_wamid: null)"),
    ).toBeInTheDocument()
    fireEvent.click(btn)
    // Operator can click again on error state.
    expect(onRetry).toHaveBeenCalledWith(ROW)
  })

  it("truncates very long error messages but preserves the full text in title=", () => {
    const longErr =
      "This is a very long error message that goes well past eighty characters and needs to be truncated to stay readable in the operator triage table."
    render(
      <WhatsAppRetryButton
        row={ROW}
        canRetry
        isInflight={false}
        lastError={longErr}
        onRetry={() => {}}
      />,
    )
    const para = screen.getByTitle(longErr)
    expect(para).toBeInTheDocument()
    expect(para.textContent?.length).toBeLessThan(longErr.length)
  })

  it("uses ONLY semantic tokens (LAW 10 negative assertion: no raw Tailwind color classes)", () => {
    const { container } = render(
      <WhatsAppRetryButton
        row={ROW}
        canRetry
        isInflight={false}
        lastError="some error"
        onRetry={() => {}}
      />,
    )
    const root = container.querySelector(
      '[data-slot="whatsapp-retry-button-wrapper"]',
    ) as HTMLElement
    const allClasses = Array.from(root.querySelectorAll<HTMLElement>("*"))
      .concat([root])
      .map((el) => el.className)
      .join(" ")
    expect(allClasses).not.toMatch(/\bbg-red-\d+\b/)
    expect(allClasses).not.toMatch(/\btext-red-\d+\b/)
    expect(allClasses).not.toMatch(/\bborder-red-\d+\b/)
    expect(allClasses).not.toMatch(/\bbg-gray-\d+\b/)
  })
})
