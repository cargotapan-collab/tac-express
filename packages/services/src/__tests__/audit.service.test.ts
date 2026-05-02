import { describe, it, expect, vi, beforeEach } from "vitest"
import { createAuditService } from "../audit.service"
import { mockDb } from "./helpers/mock-db"
import type { SupabaseClient } from "@workspace/database/supabase.types"

const SAMPLE_LOG_ROW = {
  id: "log-1",
  user_id: "user-1",
  action: "CREATE",
  entity_type: "shipment",
  entity_id: "ship-1",
  description: "Shipment created",
  old_values: null,
  new_values: { status: "BOOKED" },
  ip_address: "127.0.0.1",
  user_agent: "vitest",
  metadata: {},
  created_at: "2026-04-01T10:00:00Z",
}

function makeChain(result: object) {
  const c: Record<string, unknown> = {}
  ;["select", "eq", "order", "range", "limit", "gte", "lte", "insert"].forEach((m) => {
    c[m] = vi.fn(() => c)
  })
  c.then = (resolve: (v: unknown) => void) => Promise.resolve(result).then(resolve)
  return c
}

describe("createAuditService", () => {
  let db: SupabaseClient

  beforeEach(() => {
    db = mockDb()
  })

  it("listAuditLogs maps rows and returns pagination shape", async () => {
    const chain = makeChain({ data: [SAMPLE_LOG_ROW], error: null, count: 1 })
    vi.mocked(db.from).mockReturnValue(chain as unknown as ReturnType<SupabaseClient["from"]>)

    const result = await createAuditService(db).listAuditLogs()

    expect(result.data).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(result.page).toBe(1)
    expect(result.data[0]).toMatchObject({
      id: "log-1",
      action: "CREATE",
      entityType: "shipment",
    })
  })

  it("listAuditLogs handles zero results", async () => {
    const chain = makeChain({ data: [], error: null, count: 0 })
    vi.mocked(db.from).mockReturnValue(chain as unknown as ReturnType<SupabaseClient["from"]>)

    const result = await createAuditService(db).listAuditLogs()
    expect(result.data).toEqual([])
    expect(result.hasMore).toBe(false)
  })

  it("listAuditLogs throws on error", async () => {
    const chain = makeChain({ data: null, error: { message: "Audit DB error" }, count: null })
    vi.mocked(db.from).mockReturnValue(chain as unknown as ReturnType<SupabaseClient["from"]>)

    await expect(createAuditService(db).listAuditLogs()).rejects.toMatchObject({
      message: "Audit DB error",
    })
  })

  it("logEvent inserts a row without throwing", async () => {
    const chain = makeChain({ error: null })
    vi.mocked(db.from).mockReturnValue(chain as unknown as ReturnType<SupabaseClient["from"]>)

    await expect(
      createAuditService(db).logEvent({
        action: "update",
        entityType: "shipment",
        description: "Status updated",
      }),
    ).resolves.toBeUndefined()
  })
})
