/**
 * Unit tests for GET /api/track/[awb].
 *
 * Pattern: mock the service factory + rate-limit helper, capture the
 * arguments passed (per CodeRabbit catalog #1 — value-contract over
 * call-existence). Assertions verify the response payload, not just
 * the status code.
 */

import { describe, expect, it, vi, beforeEach } from "vitest"

// ── Module mocks ───────────────────────────────────────────────────────────

const checkTrackLookup = vi.fn()
const getShipmentByAwb = vi.fn()
const getTrackingEvents = vi.fn()
const createPublicTrackingService = vi.fn((_cfg?: unknown) => ({
  getShipmentByAwb,
  getTrackingEvents,
}))

vi.mock("../../../../lib/rate-limit", () => ({
  checkTrackLookup: (id: string) => checkTrackLookup(id),
}))

vi.mock("@workspace/services/public-tracking.service", () => ({
  createPublicTrackingService: (cfg: { supabaseUrl: string; anonKey: string }) =>
    createPublicTrackingService(cfg),
}))

// Import AFTER mocks so the route resolves the mocked modules.
const { GET } = await import("./route")

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(awb: string, ip = "1.2.3.4") {
  // The NextRequest type is structural enough that a minimal object with
  // .headers.get(name) covers the route's use.
  const req = {
    headers: {
      get: (name: string) => (name === "x-forwarded-for" ? ip : null),
    },
  }
  // The handler's RouteContext expects ctx.params to be a Promise.
  return [req, { params: Promise.resolve({ awb }) }] as const
}

beforeEach(() => {
  vi.clearAllMocks()
  checkTrackLookup.mockResolvedValue({
    success: true,
    limit: 30,
    remaining: 29,
    reset: 0,
  })
})

describe("GET /api/track/[awb]", () => {
  it("returns 200 with the shipment + events on a valid AWB", async () => {
    const shipment = { awbNumber: "TAC12345678", status: "in_transit" }
    const events = [{ id: "e1", status: "picked_up" }]
    getShipmentByAwb.mockResolvedValue(shipment)
    getTrackingEvents.mockResolvedValue(events)

    // Lowercase input — the route should uppercase before lookup.
    const [req, ctx] = makeRequest("tac12345678")
    // @ts-expect-error -- NextRequest stub: only .headers.get is used by the route
    const res = await GET(req, ctx)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      ok: true,
      awb: "TAC12345678",
      shipment,
      events,
    })
    // The service was called with the UPPERCASED AWB, not the raw input.
    expect(getShipmentByAwb).toHaveBeenCalledWith("TAC12345678")
    expect(getTrackingEvents).toHaveBeenCalledWith("TAC12345678")
  })

  it("returns 404 with the AWB echoed in the payload when shipment is null", async () => {
    getShipmentByAwb.mockResolvedValue(null)
    getTrackingEvents.mockResolvedValue([])

    const [req, ctx] = makeRequest("TAC99999999")
    // @ts-expect-error -- NextRequest stub: only .headers.get is used by the route
    const res = await GET(req, ctx)

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.awb).toBe("TAC99999999")
    expect(body.error).toContain("TAC99999999")
  })

  it("returns 400 when the AWB shape is invalid", async () => {
    const [req, ctx] = makeRequest("ab") // too short

    // @ts-expect-error -- NextRequest stub: only .headers.get is used by the route
    const res = await GET(req, ctx)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.error).toBeTruthy()
    // Service must NOT have been called when validation fails.
    expect(getShipmentByAwb).not.toHaveBeenCalled()
    expect(getTrackingEvents).not.toHaveBeenCalled()
  })

  it("returns 400 when the AWB contains illegal characters", async () => {
    const [req, ctx] = makeRequest("TAC12;DROP")

    // @ts-expect-error -- NextRequest stub: only .headers.get is used by the route
    const res = await GET(req, ctx)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(getShipmentByAwb).not.toHaveBeenCalled()
  })

  it("returns 400 when the AWB has malformed percent-encoding", async () => {
    // `%E0%A4%A` is a partial UTF-8 sequence — decodeURIComponent throws
    // URIError. The guard converts this to 400 (was 500 before WS-3a fixup).
    const [req, ctx] = makeRequest("%E0%A4%A")

    // @ts-expect-error -- NextRequest stub: only .headers.get is used by the route
    const res = await GET(req, ctx)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(getShipmentByAwb).not.toHaveBeenCalled()
    expect(getTrackingEvents).not.toHaveBeenCalled()
  })

  it("returns 503 when the tracking service throws (network / upstream failure)", async () => {
    // The service handles non-2xx upstream by returning null/[]. This case
    // covers the pathological path: fetch rejection, DNS failure, malformed
    // JSON — anything that lets the service rethrow.
    getShipmentByAwb.mockRejectedValueOnce(new Error("fetch failed"))
    // getTrackingEvents may or may not have resolved; the Promise.all rejects
    // as soon as one side throws.
    getTrackingEvents.mockResolvedValueOnce([])

    const [req, ctx] = makeRequest("TAC12345678")
    // @ts-expect-error -- NextRequest stub: only .headers.get is used by the route
    const res = await GET(req, ctx)

    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.error).toMatch(/unavailable|try again/i)
  })

  it("returns 429 when rate-limited; service is NOT called", async () => {
    checkTrackLookup.mockResolvedValueOnce({
      success: false,
      limit: 30,
      remaining: 0,
      reset: 0,
    })

    const [req, ctx] = makeRequest("TAC12345678")
    // @ts-expect-error -- NextRequest stub: only .headers.get is used by the route
    const res = await GET(req, ctx)

    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.error).toMatch(/too many/i)
    expect(getShipmentByAwb).not.toHaveBeenCalled()
    expect(getTrackingEvents).not.toHaveBeenCalled()
  })

  it("rate-limits by the first hop of x-forwarded-for", async () => {
    getShipmentByAwb.mockResolvedValue({ awbNumber: "TAC12345678" })
    getTrackingEvents.mockResolvedValue([])

    const [req, ctx] = makeRequest("TAC12345678", "203.0.113.5, 10.0.0.1")
    // @ts-expect-error -- NextRequest stub: only .headers.get is used by the route
    await GET(req, ctx)

    expect(checkTrackLookup).toHaveBeenCalledWith("203.0.113.5")
  })
})
