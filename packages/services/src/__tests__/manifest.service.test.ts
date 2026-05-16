import { beforeEach, describe, expect, it, vi } from "vitest"

import { createManifestService } from "../manifest.service"
import { makeDb } from "./helpers/make-db"
import { makeBuilderSpy } from "./helpers/make-builder-spy"

/**
 * Focused test floor for the audit-wired surface of manifest.service.ts —
 * the `removeShipmentFromManifest` destructive op (PR #134 / #102 risk-
 * rank #1 adoption).
 *
 * Scope
 * -----
 * This is NOT the full manifest.service test floor — that's a separate
 * Sprint 2 item (the next session's natural lead per the post-#134
 * handoff). The cases here are the minimum needed to satisfy the
 * adoption acceptance criteria for #134:
 *
 *   - `removeShipmentFromManifest` reads the join row first (forensic
 *     before_state), writes the audit row, then deletes — call ordering
 *     pinned.
 *   - Action literal is `manifest_shipment_remove` (the value the CHECK
 *     constraint accepts post-migration-20260516000002) — protects
 *     against drift between the service and the constraint.
 *   - No-double-audit assertion (audit_logs hit exactly once).
 *   - Audit-write failure: `AuditWriteFailedError` surfaces, DELETE never
 *     runs.
 *   - No-row short-circuit (preserves the prior idempotent semantics —
 *     a stale or double-click DELETE call does NOT spuriously audit).
 *
 * Out of scope (covered by other files):
 *   - The wrapper's ordering, fail-loud, and Sentry-tag semantics live in
 *     `with-audit.test.ts`.
 *   - The registry's withAudit-adoption assertion lives in
 *     `destructive-op-registry-coverage.test.ts`.
 *   - The DB CHECK constraint enforcement lives in the migration's own
 *     do$$ block + the `migrations-fresh-apply` CI gate.
 *   - The non-destructive manifest methods (getManifests, createManifest,
 *     addShipmentToManifest, closeManifest, etc.) belong to the full
 *     manifest.service test floor — a separate sprint item.
 *
 * Pattern: mirrors the payment.service + invoice.service + shipment.service
 * test floors (PRs #118 / #123 / #132) — `makeDb` + `makeBuilderSpy` for
 * the shared mock surface; no new mock builder.
 */

beforeEach(() => {
  vi.clearAllMocks()
})

describe("manifest.service / removeShipmentFromManifest (audit-wired)", () => {
  const MANIFEST_ID = "11111111-1111-1111-1111-111111111111"
  const AWB = "AWB-001"
  const JOIN_ID = "22222222-2222-2222-2222-222222222222"
  const SAMPLE_JOIN_ROW = {
    id: JOIN_ID,
    manifest_id: MANIFEST_ID,
    awb_number: AWB,
    added_at: "2026-05-16T10:00:00Z",
    added_by: "user-1",
  }

  it("reads the join row, writes one audit row, then deletes — table-call ordering", async () => {
    const tableCalls: string[] = []
    const db = makeDb({
      tableCalls,
      fromResults: {
        manifest_shipments: { data: SAMPLE_JOIN_ROW, error: null },
        audit_logs: { data: null, error: null },
      },
    })
    const service = createManifestService(db)
    await expect(
      service.removeShipmentFromManifest(MANIFEST_ID, AWB),
    ).resolves.toBeUndefined()
    // Audit-first ordering is the load-bearing tamper-evidence
    // property; pinning the sequence in a sentinel protects it from
    // accidental refactor.
    expect(tableCalls).toEqual([
      "manifest_shipments", // SELECT for before_state
      "audit_logs",         // audit INSERT (audit-first)
      "manifest_shipments", // DELETE
    ])
  })

  it("audit payload carries the canonical action + entity + before_state shape", async () => {
    const db = makeDb({})
    const { builder, spy } = makeBuilderSpy({
      data: SAMPLE_JOIN_ROW,
      error: null,
    })
    vi.mocked(db.from).mockReturnValue(builder)
    const service = createManifestService(db)
    await service.removeShipmentFromManifest(MANIFEST_ID, AWB)
    const insertPayload = spy.firstCallArgs("insert")?.[0] as
      | Record<string, unknown>
      | undefined
    // CHECK-constraint contract: action MUST be the literal the
    // migration accepts. Drift between this literal and migration
    // 20260516000002's enum would surface as a 23514 violation at
    // runtime; pinning it here catches the drift at test time.
    expect(insertPayload?.action).toBe("manifest_shipment_remove")
    expect(insertPayload?.entity_type).toBe("manifest")
    expect(insertPayload?.entity_id).toBe(JOIN_ID)
    expect(insertPayload?.before_state).toEqual(SAMPLE_JOIN_ROW)
    const metadata = insertPayload?.metadata as Record<string, unknown> | undefined
    expect(metadata?.manifest_id).toBe(MANIFEST_ID)
    expect(metadata?.awb_number).toBe(AWB)
  })

  it("no-double-audit: the audit_logs table is hit exactly once per call", async () => {
    const tableCalls: string[] = []
    const db = makeDb({
      tableCalls,
      fromResults: {
        manifest_shipments: { data: SAMPLE_JOIN_ROW, error: null },
        audit_logs: { data: null, error: null },
      },
    })
    const service = createManifestService(db)
    await service.removeShipmentFromManifest(MANIFEST_ID, AWB)
    expect(tableCalls.filter((t) => t === "audit_logs")).toHaveLength(1)
  })

  it("short-circuits silently with no audit when the join row is already gone", async () => {
    const tableCalls: string[] = []
    const db = makeDb({
      tableCalls,
      fromResults: {
        manifest_shipments: { data: null, error: null }, // no row found
        audit_logs: { data: null, error: null },
      },
    })
    const service = createManifestService(db)
    await expect(
      service.removeShipmentFromManifest(MANIFEST_ID, AWB),
    ).resolves.toBeUndefined()
    // Only one .from() — the SELECT that found nothing. NO audit row,
    // NO delete attempt. Preserves the prior idempotent semantics
    // (matters for double-click / stale-request cases).
    expect(tableCalls).toEqual(["manifest_shipments"])
  })

  it("audit-write failure: AuditWriteFailedError surfaces and the DELETE never runs", async () => {
    const tableCalls: string[] = []
    const db = makeDb({
      tableCalls,
      fromResults: {
        manifest_shipments: { data: SAMPLE_JOIN_ROW, error: null },
        audit_logs: {
          data: null,
          error: { code: "23514", message: "violates audit_logs CHECK" },
        },
      },
    })
    const service = createManifestService(db)
    await expect(
      service.removeShipmentFromManifest(MANIFEST_ID, AWB),
    ).rejects.toMatchObject({ code: "AUDIT_WRITE_FAILED" })
    // SELECT happened, audit INSERT was attempted, DELETE was NOT.
    // The fail-loud contract is the whole point.
    expect(tableCalls).toEqual(["manifest_shipments", "audit_logs"])
  })

  it("rethrows on DB error from the SELECT pre-fetch", async () => {
    const db = makeDb({
      fromResults: {
        manifest_shipments: {
          data: null,
          error: { code: "P0001", message: "RLS denied" },
        },
      },
    })
    const service = createManifestService(db)
    await expect(
      service.removeShipmentFromManifest(MANIFEST_ID, AWB),
    ).rejects.toMatchObject({ code: "P0001" })
  })
})
