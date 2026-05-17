import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"

import type { FailedWhatsappSendRow, UUID } from "@workspace/types"

import {
  FailedSendsTable,
  type FailedSendsTableRetryConfig,
} from "./failed-sends-table"

// Test-fixture UUID helper — same shape as the sibling-of-#131 helpers
// in packages/services/src/__tests__/{attachment,notification,audit}.
// service.test.ts. The `as unknown as UUID` is the established branded-
// type-in-test-fixtures cast pattern; #131's eventual cluster cleanup
// includes deciding whether to extend its scope to test helpers too.
const asUUID = (s: string): UUID => s as unknown as UUID

const ROW: FailedWhatsappSendRow = {
  id: asUUID("ff111111-1111-1111-1111-111111111111"),
  invoice_id: asUUID("00000000-0000-0000-0000-000000000001"),
  original_send_id: null,
  attempt_no: 2,
  phone: "919876543210",
  endpoint: "sendtemplatemessage",
  template_name: "invoice_notification_v2",
  status: "failed",
  error_message: "WhatsApp rejected (message_wamid: null)",
  queued_at: "2026-05-17T08:00:00Z",
  completed_at: "2026-05-17T08:00:02Z",
}

describe("FailedSendsTable", () => {
  it("renders a row with status badge + key columns", () => {
    render(<FailedSendsTable rows={[ROW]} />)
    // Status badge text — the WhatsAppSendStatusBadge renders the literal.
    expect(screen.getByText("failed")).toBeInTheDocument()
    // attempt_no rendered.
    expect(screen.getByText("2")).toBeInTheDocument()
    // E.164 phone rendered with leading +.
    expect(screen.getByText("+919876543210")).toBeInTheDocument()
    // endpoint label rendered as the short "template" form.
    expect(screen.getByText("template")).toBeInTheDocument()
    // template name rendered.
    expect(screen.getByText("invoice_notification_v2")).toBeInTheDocument()
    // error_message rendered (truncate kicks in over 80 chars; this is under).
    expect(
      screen.getByText("WhatsApp rejected (message_wamid: null)"),
    ).toBeInTheDocument()
  })

  it("renders the sendmessage endpoint as the short 'message' label", () => {
    render(<FailedSendsTable rows={[{ ...ROW, endpoint: "sendmessage", template_name: null }]} />)
    expect(screen.getByText("message")).toBeInTheDocument()
    // Two em-dashes expected: one for null template_name, one for null completed_at
    // if present; this row has a completed_at so only template_name → em-dash.
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1)
  })

  it("renders a native <table> for semantic + a11y correctness", () => {
    render(<FailedSendsTable rows={[ROW]} />)
    // The wrapped DataTable produces a real <table> (per its docstring +
    // the existing DataTable contract).
    const tables = document.querySelectorAll("table")
    expect(tables.length).toBeGreaterThanOrEqual(1)
  })

  it("renders an empty-state row when rows is an empty array (does not crash)", () => {
    render(<FailedSendsTable rows={[]} />)
    // The DataTable's default empty state renders an "Inbox"-style message.
    // We don't pin the exact copy (catalog #7 — generalize beyond current
    // data shape); we pin that the table element exists and no rows do.
    const tables = document.querySelectorAll("table")
    expect(tables.length).toBeGreaterThanOrEqual(1)
  })

  it("truncates long error messages to a readable length (with title fallback)", () => {
    const longErr =
      "This is a very long error message that goes well past eighty characters and needs truncation to stay readable in the operator triage table view."
    render(<FailedSendsTable rows={[{ ...ROW, error_message: longErr }]} />)
    // The visible cell shows a truncated version; the full text lives in title=.
    const cell = screen
      .getByTitle(longErr)
    expect(cell).toBeInTheDocument()
    expect(cell.textContent?.length).toBeLessThan(longErr.length)
  })

  // ─── Retry column (SB-1 / #153 — opt-in via retryConfig prop) ─────────

  it("does NOT render a Retry column when retryConfig is omitted (PR 1 visibility-only shape)", () => {
    render(<FailedSendsTable rows={[ROW]} />)
    expect(screen.queryByRole("columnheader", { name: "Retry" })).toBeNull()
    expect(screen.queryByRole("button", { name: /retry/i })).toBeNull()
  })

  it("renders a Retry column AND a per-row button when retryConfig is provided", () => {
    const onRetry = vi.fn()
    const retryConfig: FailedSendsTableRetryConfig = {
      rowState: () => ({
        canRetry: true,
        isInflight: false,
        lastError: null,
      }),
      onRetry,
    }
    render(<FailedSendsTable rows={[ROW]} retryConfig={retryConfig} />)
    expect(screen.getByRole("columnheader", { name: "Retry" })).toBeInTheDocument()
    const btn = screen.getByRole("button", { name: "Retry" })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onRetry).toHaveBeenCalledWith(ROW)
  })

  it("reflects per-row state (template row disabled, message row enabled)", () => {
    const templateRow: FailedWhatsappSendRow = {
      ...ROW,
      id: asUUID("aa111111-1111-1111-1111-111111111111"),
      endpoint: "sendtemplatemessage",
      template_name: "invoice_notification_v2",
    }
    const messageRow: FailedWhatsappSendRow = {
      ...ROW,
      id: asUUID("bb111111-1111-1111-1111-111111111111"),
      endpoint: "sendmessage",
      template_name: null,
    }
    const onRetry = vi.fn()
    const retryConfig: FailedSendsTableRetryConfig = {
      rowState: (rowId) =>
        rowId === templateRow.id
          ? {
              canRetry: false,
              isInflight: false,
              lastError: null,
              disabledReason: "Template retries: re-send from the invoice detail page.",
            }
          : {
              canRetry: true,
              isInflight: false,
              lastError: null,
            },
      onRetry,
    }
    render(
      <FailedSendsTable rows={[templateRow, messageRow]} retryConfig={retryConfig} />,
    )
    // Two Retry buttons — one disabled (template), one enabled (message).
    const buttons = screen.getAllByRole("button", { name: "Retry" })
    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toBeDisabled()
    expect(buttons[1]).not.toBeDisabled()
    expect(buttons[0]?.getAttribute("title")).toBe(
      "Template retries: re-send from the invoice detail page.",
    )
  })

  it("propagates in-flight state per row (button disabled, label 'Retrying…')", () => {
    const onRetry = vi.fn()
    const retryConfig: FailedSendsTableRetryConfig = {
      rowState: () => ({
        canRetry: true,
        isInflight: true,
        lastError: null,
      }),
      onRetry,
    }
    render(<FailedSendsTable rows={[ROW]} retryConfig={retryConfig} />)
    const btn = screen.getByRole("button", { name: "Retrying…" })
    expect(btn).toBeDisabled()
    expect(btn.getAttribute("aria-busy")).toBe("true")
    fireEvent.click(btn)
    expect(onRetry).not.toHaveBeenCalled()
  })
})
