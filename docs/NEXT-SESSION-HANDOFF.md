# Next-Session Handoff — Start Here

> **TAC Express is ONE OWNER ACTION (~20 min) from launch.** All three agent-owned ship-blockers (SB-1, SB-3, SB-4) closed in one day. Only **SB-2 (owner-runnable Sentry alert provisioning)** stands between the project and production.

**Last code commit on `main`:** PR #156 — `feat(ui+route): WhatsApp failed-send retry action (SB-1 / #153 / W2 PR 2)`.
**Last governance PRs since:** #155 (DoD re-frame), #159 (PITR playbook), **TBD (this PR — payment-recording E2E)**.
**Date this doc was written:** 2026-05-17/18 (eleventh substantive session today — third ship-blocker burned down in the same day).
**Author of last session:** Claude Code (Opus 4.7) in test-architect + full-stack + CTO + PM-mode.

**Launch status — 1 of 4 ship-blockers remains:**
- ✅ SB-1 — failed-send retry action — DONE (PR #156)
- 🔴 **SB-2 — Sentry alert provisioning (#94 / O3) — owner-runnable, ~20 min — THE LAST GATE**
- ✅ SB-3 — PITR playbook — DONE (PR #159) — owner-pending: confirm prerequisites P1–P4
- ✅ SB-4 — payment-recording E2E — DONE (this PR)

See [`docs/launch/definition-of-done.md`](launch/definition-of-done.md) for the authoritative launch list.

---

## 1. THE NEXT "SESSION" IS AN OWNER ACTION

There is **no further agent task that gates launch**. The remaining work is the owner's ~20-minute SB-2 task — provision the Sentry alert rules via `scripts/sentry/create-alert-rules.mjs` and verify one rule fires end-to-end. The runbook for SB-2 is at [`docs/runbooks/sentry-alert-rules.md § 5.3`](runbooks/sentry-alert-rules.md).

After SB-2, launch.

If the owner instead wants to advance a POST-LAUNCH item, that is a fresh agent session — but **none of those gate launch**, and the DoD's Convention A explicitly says follow-up items default POST-LAUNCH unless owner-promoted.

---

## 2. READ THIS FIRST — eight things you must NOT do

(Unchanged from prior handoffs.)

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per CLAUDE.md § 0.5.
2. **Do NOT bump dependencies in feature PRs.**
3. **Do NOT add Sentry tag keys without updating all four artifacts.**
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** That's SB-2; owner-only.
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.**
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** [`docs/backlog/production-readiness.md`](backlog/production-readiness.md) is authoritative.
8. **Do NOT promote a POST-LAUNCH item to SHIP-BLOCKER without explicit owner decision.** Convention A.

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 774 tests passing (unchanged from prior — E2E adds 1 Playwright spec, not vitest).
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
```

Then read in order:

1. [`docs/launch/definition-of-done.md`](launch/definition-of-done.md) — only SB-2 remains.
2. [`docs/runbooks/sentry-alert-rules.md § 5.3`](runbooks/sentry-alert-rules.md) — the SB-2 owner procedure (if you're the owner).
3. This handoff § 6 — your first task (depends on owner intent).

---

## 4. Current state snapshot

### Open PRs: 0 (after THIS one merges).

### Open issues (post this PR's OWNER ACTIONS — assuming owner closes #142/#139/#140 → 5 remaining)

| Tracker | Title | Bucket | Notes |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) (closed; needs reopen) | Sentry alert provisioning | **SHIP-BLOCKER SB-2 — THE LAUNCH GATE** | Runbook ready; ~20 min owner work |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | POST-LAUNCH | DoD § 6 |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` cluster | POST-LAUNCH | DoD § 6 |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated retry job (W3) | POST-LAUNCH | DoD § 6 |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta delivery webhook (W4) | POST-LAUNCH | DoD § 6 |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | Immutability sentinel (W5) | POST-LAUNCH | DoD § 6 |
| [#151](https://github.com/cargotapan-collab/tac-express/issues/151) | proxy.ts cast cleanup | POST-LAUNCH | DoD § 6 |
| [#154](https://github.com/cargotapan-collab/tac-express/issues/154) | RBAC auth-error sweep | POST-LAUNCH (pending OD-1) | DoD § 5 |
| [#157](https://github.com/cargotapan-collab/tac-express/issues/157) | Cross-process retry concurrency hardening | POST-LAUNCH | filed PR #156 |
| [#158](https://github.com/cargotapan-collab/tac-express/issues/158) | Request-signing sweep | POST-LAUNCH | filed PR #156 |

(Owner closes #139, #140, #142 per OWNER ACTIONS § 11.)

### Backlog-only items

| ID | Title | Bucket |
|---|---|---|
| **O3** | Sentry alert provisioning (= #94 work) | **SHIP-BLOCKER SB-2 — last gate** |
| ~~D1~~ | ~~PITR playbook~~ | **DONE 2026-05-17** |
| D2 | Upstash outage runbook | POST-LAUNCH |
| D3 | Monitoring dashboard URLs | POST-LAUNCH |
| D4 | WhatsApp rate-limit JSDoc | POST-LAUNCH |
| D5 | RELEASE-CHECKLIST.md | POST-LAUNCH |
| ~~E1 (carve-out)~~ | ~~Payment-recording E2E~~ | **DONE 2026-05-17** |
| E1 (other 4) | Shipment / manifest / RBAC RLS / exception E2Es | POST-LAUNCH (pending OD-2) |
| X1, X2 | Form variant; on-call schedule | WONTFIX-WATCH (re-eval 2026-08-16) |

---

## 5. Critical context (the things that will trip you up)

### 5.1 – 5.15 (see prior handoffs)

### 5.16 NEW: Payment-recording E2E lives at `apps/dashboard/e2e/payment-recording.spec.ts`

The spec covers the operator's payment-recording journey end-to-end: log in (auth state reused) → invoice detail → record payment → DB write verified via service-role PostgREST fetch. The helper at `apps/dashboard/e2e/_helpers/payment-fixture.ts` seeds + tears down a self-contained test invoice (no upstream customer/shipment seed needed; cascade-DELETE on teardown).

**The spec uses raw `fetch` against Supabase's PostgREST API** — NOT `@supabase/supabase-js` — because adding that JS client would have introduced a new direct dep at the dashboard package (forbidden by the SB-4 brief; the classifier correctly enforced it). Future E2E specs needing DB access should follow the same pattern.

**Env vars required** (all already in CI workflow secrets): `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`. Missing locally → spec skips gracefully via `hasAuthSession()` + `hasServiceRoleEnv()` gates.

---

## 6. Your first task — depends on owner intent

### If you are the OWNER reading this:

**Run SB-2 — the last ship-blocker.** Procedure at [`docs/runbooks/sentry-alert-rules.md § 5.3`](runbooks/sentry-alert-rules.md). ~20 minutes. After this, launch.

### If you are an AGENT picking up the next session:

There is no agent task that gates launch. Three possibilities, in order of legitimacy:

1. **The owner has explicitly directed you to a specific POST-LAUNCH item** — promote it per OD-1 / OD-2 process (Convention A), then execute.
2. **The owner has directed you to verify SB-3 prerequisites (P1–P4) and run the SB-3 dry-run** — these are owner tasks but an agent could draft a `chore(docs):` PR to fill in the runbook's confirmation block after the owner verifies.
3. **The owner has directed you to OD-1 or OD-2 resolution** — produce the analysis + recommendation, but the decision is owner's.

**Without explicit owner direction, the right answer is "wait for SB-2."** Do not regenerate maintenance-loop work by picking POST-LAUNCH items autonomously.

---

## 7. Cumulative discipline observations (carry-forward)

### 7.1 – 7.39 (see prior handoffs/retros)

### 7.40 NEW (this session): The auto-mode classifier is a discipline layer, not just a permission layer

The brief explicitly forbade new deps. The initial helper draft would have added `@supabase/supabase-js` to `apps/dashboard/package.json` (it's a transitive dep — the addition felt minor). The classifier correctly blocked it, citing the brief. **Pivoted to raw fetch against Supabase's PostgREST API** — same three primitives needed (INSERT / SELECT / DELETE), Node 22's built-in fetch is sufficient. The result is actually cleaner (no version coupling, no client construction). **The classifier turned a discipline failure into a code improvement.**

### 7.41 NEW (this session): Heightened-self-review posture pays back even when nothing's "wrong"

CodeRabbit's billing warning made its status uncertain. Posture per brief: over-prepare. The mandatory full-catalog audit caught a catalog #5 violation (hardcoded line numbers in marker comments) that a normal-posture session would have shipped. **A catalog audit IS a self-review tool — running it under the heightened posture is cheap insurance.**

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
# E2E (full suite — visual + a11y + the new payment-recording):
pnpm --filter dashboard exec playwright test
# E2E (just the new spec):
pnpm --filter dashboard exec playwright test payment-recording.spec.ts
# Sentinels:
pnpm vitest run apps/dashboard/__tests__/backlog-refs-drift.test.ts
node scripts/ci-watch-pr.mjs <pr-number>
```

---

## 9. Key file locations (additions this PR — test code only)

```
NEW:
  apps/dashboard/e2e/payment-recording.spec.ts            # the E2E test
  apps/dashboard/e2e/_helpers/payment-fixture.ts          # service-role seed/teardown via raw fetch
  docs/decisions/2026-05-17-payment-recording-e2e.md      # PHASE-0
  docs/retros/2026-05-17-payment-recording-e2e.md         # this session's retro

EDITED:
  docs/launch/definition-of-done.md                       # SB-4 DONE; 2 → 1
  docs/backlog/production-readiness.md                    # E1 carve-out DONE
  docs/NEXT-SESSION-HANDOFF.md                            # this file
  turbo.json                                              # +2 env-var declarations
```

Zero application source touched.

---

## 10. The honest read

In one day, the project went from a 4-item ship-blocker list to a single owner task. The DoD discipline (PR #155) is paying back exactly as designed — work burned down against a finite list. SB-1 (money-flow operator action), SB-3 (data-loss recovery procedure), SB-4 (money-flow E2E) — three substantively different kinds of ship-blocker, all closed by following the same PHASE-0 → execute → ship cadence. The launch is now a question of owner timing, not engineering scope.

**Recommended one-line summary for the next session's prompt (if there is one):** "There is no agent task that gates launch. SB-2 is the owner's ~20-minute task. If you have explicit owner direction to pick a POST-LAUNCH item, follow OD-1/OD-2 process; otherwise wait for SB-2."

---

## 11. OWNER ACTIONS — before launch

Per AGENTS.md Convention B. Numbered, copy-pasteable, single block. **Item 1 is THE launch gate.**

1. **🚀 Run SB-2 — THE last ship-blocker.** `scripts/sentry/create-alert-rules.mjs` + verify one rule fires end-to-end + update `docs/runbooks/sentry-alert-rules.md`. ~20 minutes. **After this, the DoD launch criteria are met.**
2. **Verify SB-3 PREREQUISITES P1–P4** against the Supabase dashboard per [`DATABASE-RESTORE.md § 2`](runbooks/DATABASE-RESTORE.md#2-prerequisites-owner-confirmed--verify-before-launch).
3. **(Optional but recommended)** Run the SB-3 dry-run walkthrough per [`DATABASE-RESTORE.md § 9`](runbooks/DATABASE-RESTORE.md#9-dry-run-walkthrough-validate-the-runbook-itself) (~30 min).
4. **Close [#142](https://github.com/cargotapan-collab/tac-express/issues/142)** — fully shipped (W2 PR 1 + PR #156). (Still pending.)
5. **Close [#139](https://github.com/cargotapan-collab/tac-express/issues/139)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148). (Still pending.)
6. **Close [#140](https://github.com/cargotapan-collab/tac-express/issues/140)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148). (Still pending.)
7. **Reopen [#94](https://github.com/cargotapan-collab/tac-express/issues/94)** OR accept as tracker-less DoD item. (Same as item 1; bundling for one-stop.)
8. **Delete the stuck `tac-whatsapp-sends-102/` directory** in the primary clone. (Still pending.)
9. **Decide OD-1** — is [#154](https://github.com/cargotapan-collab/tac-express/issues/154) a SHIP-BLOCKER? Lean POST-LAUNCH. (Still pending.)
10. **Decide OD-2** — should any of the other 4 E1 flows be SHIP-BLOCKERS? Lean payment-only sufficient. (Still pending.)
11. **CodeRabbit billing** — update payment method or pay pending invoices to restore CodeRabbit reviews (surfaced on PR #159).

**Eleven owner actions. Item 1 is the launch gate. Items 2–11 are housekeeping that can happen any time — but item 1 is the one that flips the project from "ready to launch" to "launched."**
