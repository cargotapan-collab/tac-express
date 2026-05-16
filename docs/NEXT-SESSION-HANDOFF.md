# Next-Session Handoff — Start Here

> **You are picking up TAC Express after PR #<TBD> (#136 backlog-drift sentinel: repo-mirror + reference-existence CI gate).** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last code commit on `main`:** post-PR-#<TBD> merge — `feat(ci): backlog-drift sentinel — repo-mirror + reference-existence CI gate (#136)`.
**Date this doc was written:** 2026-05-17 (second substantive Sprint 2 session today — first was #141 whatsapp_sends in the morning).
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer.
**#102 risk-rank #1 status:** DISCHARGED (audit_logs, PRs #133 + #135).
**#102 risk-rank #2 status (whatsapp.service.ts test floor):** DISCHARGED (PR #138).
**#102 risk-rank #2 status (whatsapp_sends audit table + retry path):** DISCHARGED (PR #141).
**#136 backlog-drift sentinel status:** DISCHARGED (this PR).

> **New convention as of this PR — read § 2 item 7 carefully.** The open production-readiness backlog is now at [`docs/backlog/production-readiness.md`](backlog/production-readiness.md). That file is AUTHORITATIVE; `#102`-the-GitHub-issue is a human-facing pointer. Drift is mechanically detected by the `backlog-refs-drift` CI gate. Derive task references from the repo file, not the GitHub issue.

---

## 1. CADENCE PRE-COMMIT (load-bearing — EIGHT substantive PRs old)

**Status: HOLDS.** Eight real tests across the arc (post-#129, PR #132, #132's session boundary, #133, #134/#135, #137 META, #138, #141, #<TBD>). This session resisted three named bundle temptations:

1. **Re-curating the seed audit doc** — the strongest pull. Easy to "while I'm authoring this file, also tick everything that's actually done and re-renounce the stale items." Avoided. The DONE-BUT-UNTICKED set is an owner-action concern (`#102` issue body cleanup), not the open-backlog concern this file owns.
2. **Extending the sentinel beyond reference-existence** — to verify done-ness, signatures, or RPC arguments. Avoided. The boundary `EXISTENCE ONLY` is recorded at the top of the sentinel + in PHASE-0 (D) of `docs/decisions/2026-05-17-backlog-drift-sentinel.md` so the next agent sees the rule before considering extension.
3. **Promoting `pnpm test` to a generic CI gate** — tempting because the discovery that the four existing sentinels are NOT CI-gated today felt like a "while I'm in this area" fix. Avoided — that's a policy decision with bigger blast radius than this PR can responsibly make. Filed as a future-agent carry-forward in the retro § 7.3.

**New observation (this session):** the seed audit doc `docs/audits/2026-05-16-102-revalidation.md` was 24 hours old and ALREADY required deltas (whatsapp_sends merged in #141; #142–#145 filed alongside). That IS the exact failure mode #136 exists to prevent. The forcing function self-validated mid-session.

---

## 2. READ THIS FIRST — seven things you must NOT do

(Items 1–6 unchanged. Item 7 is NEW from this PR.)

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5`.
2. **Do NOT bump dependencies in feature PRs.** The `npm-audit` gate has been load-bearing since #108.
3. **Do NOT add Sentry tag keys without updating all four artifacts** (the cross-package tag-emission contract — see § 5.2 of the prior handoff).
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner runs it locally (#94, still pending).
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.** Sentinel at `apps/dashboard/__tests__/api-routes-no-console.test.ts`.
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** [`docs/backlog/production-readiness.md`](backlog/production-readiness.md) is authoritative. The issue body may be stale until the owner updates it; the repo file is current. The `backlog-refs-drift` CI gate verifies every code reference in the repo file resolves on main — drift fails CI. **Update the repo file when closing an item, not the issue body.**

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 659 tests passing (post-#<TBD>)
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
# NEW (this PR): the backlog-drift sentinel runs in pnpm test (file: apps/dashboard/__tests__/backlog-refs-drift.test.ts).
# CI also runs it as its own dedicated job `backlog-refs-drift` in architecture-gates.yml.
```

---

## 4. Current state snapshot

### Open PRs (0 after #<TBD> merges)

### Open issues — derive from [`docs/backlog/production-readiness.md`](backlog/production-readiness.md)

**The repo backlog file is authoritative.** This handoff lists tracker numbers for cross-reference convenience only.

| Tracker | Title | In repo backlog as | Priority |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Sentry alert-rule notification action | **O3** | P2 (owner-runnable) |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta — body now pointer-only | meta |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | (not in repo backlog — tooling improvement) | own session |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` type | (not in repo backlog — type-infra improvement) | own session |
| [#136](https://github.com/cargotapan-collab/tac-express/issues/136) | Backlog-drift sentinel | DISCHARGED (this PR) | — |
| [#139](https://github.com/cargotapan-collab/tac-express/issues/139) | WAMID-null redundant form-fallback fix | (not in repo backlog — small standalone bug) | own session |
| [#140](https://github.com/cargotapan-collab/tac-express/issues/140) | BASE-URL empty-string fallback | (not in repo backlog — small standalone bug) | own session |
| [#142](https://github.com/cargotapan-collab/tac-express/issues/142) | Operator retry UI for failed WhatsApp sends | **W2** | medium |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated background retry job | **W3** | low |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta delivery-callback webhook | **W4** | medium-low |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | App-layer immutability sentinel (whatsapp_sends) | **W5** | low |

(`#130`, `#131`, `#139`, `#140` are repo-quality / bug items, not production-readiness items per the seed audit doc's scope.)

**Recently resolved:** #134 (PR #135), audit_logs full discharge (#133+#135), #137 META re-validation, #138 whatsapp.service test floor, #141 whatsapp_sends table + retry path, #136 backlog-drift sentinel (this PR).

---

## 5. Critical context (the things that will trip you up)

### 5.1 audit_logs adoption (post-#135) — unchanged

### 5.2 Cross-package tag-emission contract — unchanged (includes `WHATSAPP_SEND_TAG_KEYS` per #141)

### 5.3 Shared mock-db helpers — unchanged

### 5.4 Six CI gates still load-bearing — UPDATED — and a SEVENTH narrow one as of this PR

The six are: `LAW gates` (`pnpm audit:governance`), `@tac registry sync + smoke`, `migrations apply on fresh DB`, `npm audit (production deps)`, `Sentry alert-rule structure lint`, `Bundle size`. Plus the e2e workflow's `visual + a11y` Playwright run.

**NEW this PR — a SEVENTH narrow job: `Backlog references drift check`** in `architecture-gates.yml`. Runs ONLY `apps/dashboard/__tests__/backlog-refs-drift.test.ts`. Failure name in the PR check list is unambiguous; failure message names the backlog item and the rotted ref.

**Important non-gate:** `pnpm test` (the full vitest suite) is STILL NOT a CI gate. The four existing sentinels (`rbac-block-adoption`, `api-routes-no-console`, `silent-by-design`, `audit-doc-references`, `audit-logs-no-update-delete`) plus the ~600 other unit tests run only locally. Whether to promote `pnpm test` to a generic gate is its own decision (see retro § 7.3).

### 5.5 CodeRabbit pattern catalog (9 entries) — unchanged. PR #141 went through both bots clean on first pass. This PR aims for the same.

### 5.6 Test-pattern shift for audit-wrapped methods (from #135) — unchanged

### 5.7 Test-floor pattern for non-Supabase services (PR #138) — unchanged

### 5.8 Service-wrapper pattern crossing fetch + Supabase (PR #141) — unchanged

### 5.9 Queued-row-first / NEVER-blocking pattern (PR #141, decision doc § E) — unchanged

### 5.10 NEW: Repo-mirror-plus-sentinel forcing-function pattern (this PR)

The pattern: take a doc that drifts because it lives in a non-CI-checked surface (a GitHub issue body, an external wiki, etc.); mirror it into a repo file with a structured reference format; build a sentinel that verifies references on every PR. Applied here to the production-readiness backlog. Could be applied later to: the RBAC denial audit doc (already partially via PR #121's sentinel); the runbook page; etc. If a future doc surface starts drifting in the same shape, the answer is "mirror it + write a sentinel" — same playbook.

The boundary discipline (EXISTENCE ONLY, never done-ness) is what makes the pattern maintainable. Without that boundary, every per-item rule becomes a special case and the sentinel becomes un-readable.

---

## 6. Your first task — recommended

**The next-lead source of truth is now [`docs/backlog/production-readiness.md`](backlog/production-readiness.md), NOT this handoff. This § 6 is a curated pointer; the backlog file has the full picture with refs.**

Per the new backlog file's risk-ranked open items:

### Option A — O1: `manifest.service.ts` full test floor (rank #4) — RECOMMENDED

The audit_logs + whatsapp.service test floor + whatsapp_sends + backlog-sentinel arc is complete. The next test-floor in the comfortable known-shape session is `manifest.service.ts`'s ~9 currently-uncovered methods (the narrow audit surface is covered by PR #135). Mirror PR #132's pattern. ~1 session.

**Repo backlog refs:** `packages/services/src/manifest.service.ts`, `packages/services/src/__tests__/manifest.service.test.ts`, symbols `createManifestService` + `removeShipmentFromManifest`. Sentinel verifies these on every PR; when you complete the test floor, update the backlog refs to point at the new test cases.

### Option B — O2: Cleanup the remaining `as unknown as` cast at `apps/dashboard/app/api/public/invoice-pdf/route.ts` (rank #5)

~30 min standalone. Or fold into the next PDF-touching PR.

### Option C — W2 / W3 / W4 / W5 — the four whatsapp_sends follow-ups

See backlog file for details + tracker numbers. W2 (operator retry UI) is the most actionable; W3 (automated retry) needs PHASE-0 first.

### Option D — D1 / D2 / D3 / D5 — docs-only items

Each ~30 min to 1-2 hours. Good "between bigger items" sessions.

### Option E — #130 / #131 — small standalone tooling / type-infra

Each is its own session. Do NOT bundle. (Not in repo backlog — repo-quality items, not production-readiness.)

### Option F — Promote `pnpm test` to a generic CI gate

The decision the brief carried forward (retro § 7.3). Pros: every existing sentinel becomes CI-gated. Cons: every flaky test becomes a recurring merge-blocker; ~3-5 min added CI time. Needs PHASE-0.

### Option G — #94 (5-min owner-runnable Sentry provisioning)

Not an agent task.

---

## 7. Cumulative discipline observations (carry-forward)

Distilled from PRs #105 → #<TBD>.

### 7.1 - 7.17 (unchanged — see prior handoff)

### 7.18 NEW (this session): Authoritative-repo-file beats authoritative-GitHub-issue for sentinel-able artifacts

When a backlog / list / inventory is shared between humans (GitHub issue) and machines (CI), the repo file MUST be the source of truth. If the issue body is authoritative + the repo is a mirror, the mirror drifts (the original problem). If the repo is authoritative + the issue is a pointer, the sentinel works (the new pattern).

This generalizes beyond backlog files. Any time a future PR proposes a "mirror the GitHub state into a repo file for tracking," ask: which side is authoritative? If the answer is "the GitHub side" — the mirror will drift. Make the repo authoritative or don't bother.

### 7.19 NEW (this session): A forcing function that self-validates mid-build is a strong signal

The seed audit doc was 24 hours old and ALREADY required deltas (whatsapp_sends + #142–#145). The PR being authored had to ACTIVELY reconcile those deltas, in writing, before the file could be written. That reconciliation step is exactly the discipline the sentinel exists to enforce. When the failure mode the forcing function targets shows up DURING the build of the forcing function — the design is correctly aimed.

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts
pnpm vitest run packages/services/src/__tests__/shipment.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp.service.test.ts          # 47 cases (PR #138)
pnpm vitest run packages/services/src/__tests__/whatsapp-tracked.service.test.ts  # 32 cases (PR #141)
pnpm vitest run apps/dashboard/__tests__/backlog-refs-drift.test.ts               # 23 cases (this PR) — NEW
pnpm vitest run packages/services/src/__tests__/audit.service.test.ts
pnpm vitest run packages/services/src/__tests__/with-audit.test.ts
pnpm vitest run packages/services/src/__tests__/destructive-op-registry-coverage.test.ts
pnpm vitest run packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
pnpm vitest run packages/services/src/__tests__/manifest.service.test.ts
pnpm vitest run packages/services/src/__tests__/silent-by-design.test.ts
pnpm vitest run apps/dashboard/__tests__/audit-doc-references.test.ts
node scripts/ci-watch-pr.mjs <pr-number>
```

---

## 9. Key file locations

(Additions this PR marked NEW.)

```
# Sentinel tests (FIVE in the family as of this PR)
apps/dashboard/__tests__/rbac-block-adoption.test.ts                   # PR #114
apps/dashboard/__tests__/api-routes-no-console.test.ts                 # PR #117
packages/services/src/__tests__/silent-by-design.test.ts               # PR #120
apps/dashboard/__tests__/audit-doc-references.test.ts                  # PR #121 (this PR's direct template)
packages/services/src/__tests__/audit-logs-no-update-delete.test.ts    # PR #133
apps/dashboard/__tests__/backlog-refs-drift.test.ts                    # PR #<TBD> (this PR) — NEW

# Authoritative backlog + supporting docs
docs/backlog/production-readiness.md                                   # PR #<TBD> (this PR) — NEW, authoritative
docs/decisions/2026-05-17-backlog-drift-sentinel.md                    # PR #<TBD> (this PR) — NEW
docs/audits/2026-05-16-102-revalidation.md                             # seed for the backlog (now historical)

# Decision docs (cumulative)
docs/decisions/2026-05-16-audit-logs-mechanism.md                      # audit_logs PHASE-0
docs/decisions/2026-05-17-whatsapp-sends-mechanism.md                  # whatsapp_sends PHASE-0
docs/decisions/2026-05-17-backlog-drift-sentinel.md                    # this PR's PHASE-0
```

---

## 10. The honest read

Tests 636 → 659 (+23 from the new sentinel). The backlog-drift forcing function shipped: 3 minutes of CI per PR for the rest of the project's life makes one entire class of failure (backlog references pointing at code that no longer exists) mechanically impossible. The decision-doc-first discipline produced a sentinel where the scope boundary (`EXISTENCE only`) is recorded at the top of every relevant file — a future agent who's tempted to extend it has the rule in their face.

Zero new dependencies. Zero items in the master backlog re-curated. Zero "while I'm here" expansion. Six gates green; the new seventh meta-validates on this same PR.

**Recommended one-line summary for the next session's prompt:** "Pick up [`docs/backlog/production-readiness.md`](docs/backlog/production-readiness.md) item O1 — `manifest.service.ts` full test floor (rank #4). Mirror PR #132. ONE PR. Decline any 'while we're here' expansion." (Or one of options B–G in § 6 per owner priority.)

---

**Load the skills. Re-read § 1 (cadence pre-commit, EIGHT substantive PRs old). Pick a task from § 6 — or better, from `docs/backlog/production-readiness.md` directly. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff.
