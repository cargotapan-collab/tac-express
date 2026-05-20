import { describe, expect, it, vi, afterEach, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

import { TrackingResultDialog } from "./tracking-result-dialog"

// ── fetch mock helpers ───────────────────────────────────────────────────────

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

const SHIPMENT = {
  id: "s1",
  awbNumber: "TAC12345678",
  status: "in_transit",
  senderName: "Tea Estate Co",
  receiverName: "Delhi Distributor",
  originHub: "IMF",
  destHub: "DEL",
  chargeableWeight: 12,
  totalAmount: 4500,
  pieces: 3,
  createdAt: "2026-05-01T10:00:00Z",
  updatedAt: "2026-05-02T10:00:00Z",
}

const EVENTS = [
  {
    id: "e1",
    awbNumber: "TAC12345678",
    status: "in_transit",
    description: "Departed origin hub",
    location: "Imphal",
    source: "scan",
    createdAt: "2026-05-02T10:00:00Z",
  },
]

beforeEach(() => {
  vi.restoreAllMocks()
})
afterEach(() => {
  vi.restoreAllMocks()
})

function renderDialog(awb: string | null = "TAC12345678", open = true) {
  const onOpenChange = vi.fn()
  const onRetryAwb = vi.fn()
  const utils = render(
    <TrackingResultDialog
      open={open}
      onOpenChange={onOpenChange}
      awb={awb}
      onRetryAwb={onRetryAwb}
    />,
  )
  return { onOpenChange, onRetryAwb, ...utils }
}

describe("<TrackingResultDialog>", () => {
  it("LOADED — renders the shipment AWB + status when the route returns 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(200, { ok: true, awb: "TAC12345678", shipment: SHIPMENT, events: EVENTS }),
      ),
    )
    renderDialog()
    // The TrackingResultView renders the AWB number prominently.
    expect(await screen.findAllByText("TAC12345678")).not.toHaveLength(0)
    // Fetch hit the right endpoint.
    expect(fetch).toHaveBeenCalledWith(
      "/api/track/TAC12345678",
      expect.objectContaining({ signal: expect.any(Object) }),
    )
  })

  it("EMPTY — renders NOT FOUND + retry input when the route returns 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(404, { ok: false, error: "No shipment found", awb: "TAC99999999" }),
      ),
    )
    renderDialog("TAC99999999")
    expect(await screen.findByText("NOT FOUND")).toBeInTheDocument()
    // Retry AwbInput is present (its accessible label).
    expect(screen.getByLabelText(/AWB or cargo ID/i)).toBeInTheDocument()
  })

  it("ERROR — renders UNAVAILABLE when the route returns 503", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(503, { ok: false, error: "unavailable" })),
    )
    renderDialog()
    expect(await screen.findByText("UNAVAILABLE")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /contact support/i })).toBeInTheDocument()
  })

  it("ERROR — renders UNAVAILABLE when fetch rejects (network failure)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")))
    renderDialog()
    expect(await screen.findByText("UNAVAILABLE")).toBeInTheDocument()
  })

  it("does NOT fetch when the dialog is closed", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    renderDialog("TAC12345678", false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("does NOT fetch when awb is null", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    renderDialog(null, true)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
