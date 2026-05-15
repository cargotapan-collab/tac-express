import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Sentinel for the two silent-by-design observability decisions made
 * in #115 (resolution of PR #114's audit § 6 follow-ups).
 *
 * Two sites in the codebase intentionally do NOT emit to Sentry, even
 * though they're surfaces that COULD be wrapped with `withRpc` or
 * `captureRbacDenial`. The runbook § 4.1 + § 4.2 documents the full
 * rationale + revisit triggers. This test pins the source-comment
 * markers so a future contributor doesn't:
 *   - regress to the old `SENTRY-MIGRATION-DEFERRED` marker (signals
 *     "decision pending" when the decision is in fact made)
 *   - silently delete the marker comment + add Sentry emission without
 *     reading the runbook section first
 *
 * What this pins (per site):
 *   1. The source file contains the `SENTRY-SILENT-BY-DESIGN` or
 *      `RBAC-EMISSION SILENT-BY-DESIGN` marker.
 *   2. The source file does NOT contain the old `SENTRY-MIGRATION-DEFERRED`
 *      marker (would indicate the decision was regressed).
 *   3. The comment references decision #115 + the runbook section.
 *
 * If a future PR wants to ADD emission at one of these sites, that PR
 * needs to:
 *   - Update the runbook § 4.1/§ 4.2 to remove the silent-by-design entry
 *   - Update this sentinel's expected list
 *   - Update the source marker
 * The forcing function is the right kind of friction.
 */

const REPO_ROOT = join(__dirname, "..", "..", "..", "..")

interface SilentByDesignSite {
  description: string
  filePath: string
  expectedMarker: string
  runbookSection: string
}

const SILENT_BY_DESIGN_SITES: SilentByDesignSite[] = [
  {
    description: "dashboard.service.ts getSLABreaches — detect_sla_breaches RPC",
    filePath: join(REPO_ROOT, "packages/services/src/dashboard.service.ts"),
    expectedMarker: "SENTRY-SILENT-BY-DESIGN",
    runbookSection: "§ 4.1",
  },
  {
    description:
      "whatsapp/send-invoice route — isAdminOrAbove compound-condition sub-gate",
    filePath: join(
      REPO_ROOT,
      "apps/dashboard/app/api/whatsapp/send-invoice/route.ts",
    ),
    expectedMarker: "RBAC-EMISSION SILENT-BY-DESIGN",
    runbookSection: "§ 4.1",
  },
]

describe("silent-by-design observability decisions (#115)", () => {
  for (const site of SILENT_BY_DESIGN_SITES) {
    describe(site.description, () => {
      const source = readFileSync(site.filePath, "utf8")

      it(`contains the SILENT-BY-DESIGN marker "${site.expectedMarker}"`, () => {
        expect(source).toContain(site.expectedMarker)
      })

      it("does NOT contain the legacy SENTRY-MIGRATION-DEFERRED marker", () => {
        // The old marker meant "decision pending." #115 resolved the
        // decisions; the new marker is SILENT-BY-DESIGN. If a future
        // contributor restores the legacy marker, that signals a
        // regression of the resolution — fail loudly.
        expect(source).not.toContain("SENTRY-MIGRATION-DEFERRED")
      })

      it("references the decision (#115) in the comment", () => {
        expect(source).toMatch(/#115/)
      })

      it(`references the runbook section ${site.runbookSection}`, () => {
        expect(source).toContain(site.runbookSection)
      })
    })
  }

  it("the SILENT_BY_DESIGN_SITES set has exactly the expected size (sentinel)", () => {
    // Hardcoded count + entries. Adding/removing a silent-by-design
    // site requires conscious update of this list + the runbook section.
    expect(SILENT_BY_DESIGN_SITES).toHaveLength(2)
  })
})
