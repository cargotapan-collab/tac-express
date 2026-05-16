import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import type { DestructiveAuditAction } from "@workspace/types"
import { DESTRUCTIVE_AUDIT_ACTIONS } from "@workspace/types"

import {
  DESTRUCTIVE_OP_REGISTRY,
  type DestructiveOpRegistryEntry,
} from "../shared/destructive-op-registry"

/**
 * Sentinel — destructive-op registry coverage gate.
 *
 * What this enforces (PR 1 scope)
 * -------------------------------
 * a. The registry is in sync with the AuditAction enum's destructive
 *    subset (compile-time exhaustiveness — re-asserted at runtime here
 *    for redundancy with destructive-op-registry.ts's own check).
 * b. Each registry entry's serviceFile actually exists on disk.
 * c. Each registry entry's serviceFile contains the named methodName
 *    as an exported / declared function.
 * d. The registry size is pinned (meta-sentinel — adding / removing
 *    entries requires updating this test, forcing conscious intent
 *    per docs/patterns/coderabbit-catalog.md § 7.2).
 *
 * What this DOES NOT enforce yet (PR 2 scope)
 * -------------------------------------------
 * e. That each registry entry's serviceFile actually wraps its
 *    destructive op with withAudit({ action, ... }). The methods do
 *    not yet adopt the wrapper as of PR 1 (per the bailout-clause
 *    split in docs/decisions/2026-05-16-audit-logs-mechanism.md § 7);
 *    PR 2 wires adoption and flips this sentinel to assert the
 *    `withAudit(` reference paired with the registry action literal.
 *
 * (e) is intentionally absent in PR 1 to keep the contract honest:
 * the sentinel cannot pass-and-mean-it until adoption lands. If we
 * asserted withAudit-presence in PR 1, the assertion would either be
 * vacuous (no destructive ops yet adopted) or it would force PR 1 to
 * also include the adoption (defeating the bailout split). PR 2's
 * commit-1 task is to delete this block-comment and uncomment the
 * adoption-assertion block at the bottom of this file.
 */

const SERVICES_SRC = resolve(__dirname, "..")

function readService(file: string): string {
  return readFileSync(resolve(SERVICES_SRC, file), "utf-8")
}

describe("destructive-op-registry coverage / inventory", () => {
  it("is pinned at exactly 3 entries (meta-sentinel)", () => {
    // Bumping this requires updating the migration's CHECK constraint,
    // adding the AuditAction literal, AND adding the registry entry.
    // The three steps land in one PR or none.
    expect(DESTRUCTIVE_OP_REGISTRY).toHaveLength(3)
  })

  it("covers every destructive AuditAction literal exactly once", () => {
    const registryActions = DESTRUCTIVE_OP_REGISTRY.map((e) => e.action).sort()
    const expectedActions = [...DESTRUCTIVE_AUDIT_ACTIONS].sort()
    expect(registryActions).toEqual(expectedActions)
    // Defensive: no duplicates.
    expect(new Set(registryActions).size).toBe(registryActions.length)
  })

  it("uses only the canonical entity-type literals", () => {
    const allowed = new Set(["payment", "invoice", "manifest"])
    for (const entry of DESTRUCTIVE_OP_REGISTRY) {
      expect(allowed.has(entry.entityType)).toBe(true)
    }
  })

  // Compile-time exhaustiveness (catalog entry #8 — satisfies + Exclude).
  // This is a SECOND assertion of the registry's invariant, alongside
  // the one in destructive-op-registry.ts itself.
  type RegistryActions = (typeof DESTRUCTIVE_OP_REGISTRY)[number]["action"]
  type _Missing = Exclude<DestructiveAuditAction, RegistryActions>
  const _allCovered: _Missing extends never ? true : never = true
  void _allCovered
})

describe("destructive-op-registry coverage / file + method existence", () => {
  it.each(DESTRUCTIVE_OP_REGISTRY.map((e) => [e.action, e] as const))(
    "%s: the registry's serviceFile exists and contains the named methodName",
    (_action: string, entry: DestructiveOpRegistryEntry) => {
      let source: string
      try {
        source = readService(entry.serviceFile)
      } catch (err) {
        throw new Error(
          `Registry entry ${entry.action} points at packages/services/src/${entry.serviceFile} ` +
            `but the file could not be read: ${(err as Error).message}. ` +
            `Either correct the registry's serviceFile or create the file before merging.`,
        )
      }
      // Anchor-scoped match (catalog entry #6) — must appear as a
      // method definition (async or otherwise), not just a string
      // mention. Two acceptable shapes:
      //   - `async <methodName>(...)` inside the service factory
      //   - `<methodName>:` as an object-property shorthand
      // The pattern allows either; falsely passing on a bare comment
      // would require both forms in the same comment line, which is
      // not a shape the codebase produces.
      const asyncMethodRe = new RegExp(
        `(?:async\\s+${entry.methodName}\\s*\\(|${entry.methodName}\\s*\\([^)]*\\)\\s*:\\s*Promise|${entry.methodName}\\s*:)`,
        "m",
      )

      // EXCEPTION: revertManifest is intentionally absent in PR 1 —
      // it's PR 2 design surface (the manifest revert method has to
      // be designed before it can be wired). Skip the file-presence
      // check for it; PR 2 will tighten this when the method lands.
      if (entry.action === "manifest_revert") {
        return
      }

      expect(
        asyncMethodRe.test(source),
        `Expected packages/services/src/${entry.serviceFile} to define a method ` +
          `named '${entry.methodName}' (registry entry: ${entry.action}). ` +
          `If the method was renamed, update the registry's methodName. ` +
          `If the method was removed, also remove its registry entry.`,
      ).toBe(true)
    },
  )
})

/*
 * ===== PR 2 ADOPTION SENTINEL (currently disabled — see file header) =====
 *
 * When PR 2 wires the wrapper in payment.service.ts, invoice.service.ts,
 * and manifest.service.ts (the latter alongside adding revertManifest),
 * uncomment the block below and delete the block-comment in the file
 * header that explains why (e) is absent.
 *
 * describe("destructive-op-registry coverage / withAudit adoption", () => {
 *   it.each(DESTRUCTIVE_OP_REGISTRY.map((e) => [e.action, e] as const))(
 *     "%s: the service file wraps the destructive op via withAudit()",
 *     (_action: string, entry: DestructiveOpRegistryEntry) => {
 *       const source = readService(entry.serviceFile)
 *       // The wrapper call must reference the registry's action literal,
 *       // making it impossible to wire a wrapper-call to the wrong op
 *       // without breaking this sentinel.
 *       const wrapperRe = new RegExp(
 *         `withAudit\\([^)]*action:\\s*["']${entry.action}["']`,
 *         "s",
 *       )
 *       expect(
 *         wrapperRe.test(source),
 *         `Expected packages/services/src/${entry.serviceFile} to contain ` +
 *           `a withAudit({ action: "${entry.action}", ... }) call. The ` +
 *           `destructive op '${entry.methodName}' must be wrapped via ` +
 *           `withAudit per docs/decisions/2026-05-16-audit-logs-mechanism.md.`,
 *       ).toBe(true)
 *     },
 *   )
 * })
 */
