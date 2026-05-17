# Next-Session Handoff — Start Here

> **You are picking up TAC Express after SB-3 (D1 PITR playbook) was burned down. Two ship-blockers remain.** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last code commit on `main`:** PR #156 — `feat(ui+route): WhatsApp failed-send retry action (SB-1 / #153 / W2 PR 2)`.
**Last docs/governance PR (THIS one):** **TBD** — Database restore playbook (SB-3).
**Date this doc was written:** 2026-05-17 (tenth substantive session today — second runbook-grade ops doc in the arc).
**Author of last session:** Claude Code (Opus 4.7) in SRE-mode + CTO + PM-mode.

**Launch status — 2 of 4 ship-blockers remain:**
- ✅ SB-1 — failed-send retry action — DONE (PR #156)
- ✅ SB-3 — PITR playbook — DONE (this PR) — owner-pending: confirm prerequisites P1–P4
- 🔴 SB-2 — Sentry alert provisioning (#94 / O3) — owner-runnable, ~20 min
- 🔴 SB-4 — payment-recording E2E (E1 carve-out) — agent task, ~1 session

See [`docs/launch/definition-of-done.md`](launch/definition-of-done.md) for the authoritative launch list.

---

## 1. THE PROJECT IS NOW 1 AGENT SESSION + ~20 MIN OWNER TASK FROM LAUNCH

The Definition of Done burn-down is on schedule. SB-1 and SB-3 cleared in two sessions on the same day. **The next agent session burns SB-4 (payment-recording E2E)** — heavier than SB-3 because it requires Playwright wiring for authenticated dashboard flow + form-state + DB cleanup, but the scope is bounded.

After SB-4 ships, **only SB-2 (Sentry provisioning) remains** — and that's an owner task. The launch is then a question of timing, not scope.

---

## 2. READ THIS FIRST — eight things you must NOT do

(Unchanged from prior handoff — see history for full list.)

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
# Expected: all green; 765 tests passing.
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
```

Then read in order:

1. [`docs/launch/definition-of-done.md`](launch/definition-of-done.md) — 2 SBs remain.
2. [`docs/backlog/production-readiness.md`](backlog/production-readiness.md) — full open list.
3. This handoff § 6 — your first task.

---

## 4. Current state snapshot

### Open PRs: 0 (after THIS one merges).

### Open issues (post this PR's OWNER ACTIONS — assuming owner closes #142/#139/#140 → 5 remaining)

| Tracker | Title | Bucket | Where covered |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) (closed; needs reopen) | Sentry alert provisioning | **SHIP-BLOCKER SB-2** | DoD § 2 SB-2 |
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

### Backlog-only items (per [`production-readiness.md`](backlog/production-readiness.md))

| ID | Title | Bucket |
|---|---|---|
| **O3** | Sentry alert provisioning (= #94 work) | **SHIP-BLOCKER SB-2** |
| ~~D1~~ | ~~PITR / database restore playbook~~ | **DONE 2026-05-17** |
| D2 | Upstash outage runbook | POST-LAUNCH |
| D3 | Monitoring dashboard URLs | POST-LAUNCH |
| D4 | WhatsApp rate-limit JSDoc | POST-LAUNCH |
| D5 | RELEASE-CHECKLIST.md | POST-LAUNCH |
| **E1 (carve-out)** | **Payment-recording E2E** | **SHIP-BLOCKER SB-4** |
| E1 (other 4) | Shipment / manifest / RBAC RLS / exception E2Es | POST-LAUNCH (pending OD-2) |
| X1, X2 | Form variant; on-call schedule | WONTFIX-WATCH (re-eval 2026-08-16) |

---

## 5. Critical context (the things that will trip you up)

### 5.1 – 5.14 (unchanged — see prior handoffs)

### 5.15 NEW: PITR playbook exists at DATABASE-RESTORE.md

The new substantive runbook is at [`docs/runbooks/DATABASE-RESTORE.md`](runbooks/DATABASE-RESTORE.md). The earlier WONTFIX stub `PITR-PLAYBOOK.md` is now a short redirect. If an incident fires, the responder reads `DATABASE-RESTORE.md`. If documentation links / scripts reference `PITR-PLAYBOOK`, they still resolve (redirect).

The runbook ships with FOUR OWNER-CONFIRMED PREREQUISITES (P1–P4) the owner must verify against the Supabase dashboard before launch — see OWNER ACTIONS § 11.

---

## 6. Your first task — RECOMMENDED: SB-4 (payment-recording E2E)

**The DoD § 4 burn-down order names SB-4 as the next agent session's lead** (SB-2 is owner-async).

### SB-4 — Payment-recording E2E ([backlog E1 carve-out](backlog/production-readiness.md#e1--e2e-flows-5-grouped-items))

**Why it gates launch:** Payment recording is the most money-sensitive flow. Unit tests cover the service-layer logic; no E2E asserts the full submission → DB → UI round-trip works under auth + RLS + form-state.

**Testable DONE criterion (from DoD § 2 SB-4):**
- `apps/dashboard/e2e/payment-recording.spec.ts` exists.
- Runs in CI as part of the existing visual+a11y e2e job (or a new e2e job; structural decision in the PR).
- Asserts the happy path: operator signs in → invoice detail → records a payment → form submits → DB row appears → UI reflects updated balance.
- Asserts at least ONE validation-error path: invalid amount or duplicate-payment guard.
- Includes the cleanup step (delete the test payment) so the test is idempotent across runs.

**Estimate:** 1 session. **Owner decision possibly required (OD-2):** is payment-recording-only sufficient, or should other E1 flows be promoted too? Lean: payment-only is sufficient.

### Alternative tasks (only if the owner overrides SB-4)

- **SB-2 (#94)** — owner-only; not an agent task.
- POST-LAUNCH items — only if owner explicitly promotes one via OD-1 or OD-2.

**Do not pick a POST-LAUNCH item.** That regenerates the maintenance loop the DoD was created to stop.

---

## 7. Cumulative discipline observations (carry-forward)

### 7.1 – 7.37 (see prior handoffs/retros)

### 7.38 NEW (this session): A WONTFIX deferral is a snapshot, not a verdict

The 2026-05-16 stub at `PITR-PLAYBOOK.md` was CORRECT for its moment (pre-launch, no incident; the discipline argument held). The launch re-frame changed the calculus. **Pattern: a deferral is a snapshot of the trade-off at one moment. Re-evaluate when the framing changes — don't treat WONTFIX as permanent.** The new runbook credits the stub's structural skeleton (assessment → decision tree → mechanics → verification → postmortem) — the discipline was right, only the timing assumption changed.

### 7.39 NEW (this session): Runbooks under pressure need OWNER-CONFIRMED gaps named, not hidden

The runbook could NOT verify plan tier, PITR availability, retention window, or Owner role via the Supabase MCP. The temptation: write the runbook as if these were true (Supabase Pro is the standard tier for revenue-bearing projects, so it's probably fine). The decision: name P1–P4 as explicit OWNER-CONFIRMED PREREQUISITES with the dashboard URLs + a fill-in confirmation block. **A runbook that hides its prerequisites with optimistic assumptions IS the runbook that fails at 3 a.m. when the assumption turns out to be wrong.**

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
# Service test floors (all on main):
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts
pnpm vitest run packages/services/src/__tests__/shipment.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp-tracked.service.test.ts
pnpm vitest run packages/services/src/__tests__/manifest.service.test.ts
# Sentinels:
pnpm vitest run apps/dashboard/__tests__/backlog-refs-drift.test.ts
pnpm vitest run apps/dashboard/__tests__/audit-doc-references.test.ts
pnpm vitest run apps/dashboard/__tests__/api-routes-no-console.test.ts
pnpm vitest run apps/dashboard/__tests__/rbac-block-adoption.test.ts
pnpm vitest run packages/services/src/__tests__/silent-by-design.test.ts
pnpm vitest run packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
node scripts/ci-watch-pr.mjs <pr-number>
```

---

## 9. Key file locations (additions this PR — docs only)

```
NEW:
  docs/runbooks/DATABASE-RESTORE.md                       # the substantive playbook
  docs/decisions/2026-05-17-database-restore-playbook.md  # PHASE-0
  docs/retros/2026-05-17-database-restore-playbook.md     # this session's retro

EDITED:
  docs/runbooks/PITR-PLAYBOOK.md                          # converted to redirect
  docs/launch/definition-of-done.md                       # SB-3 DONE; 3 → 2
  docs/backlog/production-readiness.md                    # D1 DONE
  docs/NEXT-SESSION-HANDOFF.md                            # this file
```

---

## 10. The honest read

Two of four ship-blockers cleared in one day. The remaining work: one agent session (SB-4) + one owner-task (SB-2). The DoD discipline is paying back exactly as designed — work burns down against a finite list that's now visibly close to zero.

**Recommended one-line summary for the next session's prompt:** "Pick up SB-4 from `docs/launch/definition-of-done.md` — payment-recording E2E. Heavier than SB-3 (Playwright + auth + form + DB cleanup). ~1 session. Decline any 'while we're here' expansion."

---

## 11. OWNER ACTIONS — before next session

Per AGENTS.md Convention B. Numbered, copy-pasteable, single block. **Carries forward all unresolved items from PR #156's owner block; adds this session's prerequisite-confirmation tasks.**

1. **Verify SB-3 PREREQUISITES P1–P4** against the Supabase dashboard per [`DATABASE-RESTORE.md § 2`](runbooks/DATABASE-RESTORE.md#2-prerequisites-owner-confirmed--verify-before-launch):
   - P1 — confirm Pro plan or above
   - P2 — confirm PITR enabled + record retention window
   - P3 — confirm daily logical backups present
   - P4 — confirm Owner role present on the org
   Fill in the confirmation block in the runbook + commit as a small `chore(docs):` PR.
2. **(Optional but recommended)** Run the SB-3 dry-run walkthrough per [`DATABASE-RESTORE.md § 9`](runbooks/DATABASE-RESTORE.md#9-dry-run-walkthrough-validate-the-runbook-itself) — create a Supabase branch, PITR-restore it 1h back, run § 6 V1–V4, drop the branch. ~30 min. Validates the runbook's executable claims against the live UI.
3. **Close [#142](https://github.com/cargotapan-collab/tac-express/issues/142)** — fully shipped (W2 PR 1 + PR #156). (Still pending from PR #156 OWNER ACTIONS.)
4. **Close [#139](https://github.com/cargotapan-collab/tac-express/issues/139)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148). (Still pending.)
5. **Close [#140](https://github.com/cargotapan-collab/tac-express/issues/140)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148). (Still pending.)
6. **Reopen [#94](https://github.com/cargotapan-collab/tac-express/issues/94)** OR accept as tracker-less DoD item (SB-2 owner-runnable). (Still pending.)
7. **Run SB-2** when convenient — `scripts/sentry/create-alert-rules.mjs` + verify one rule fires end-to-end + update `docs/runbooks/sentry-alert-rules.md`. (Still pending — last remaining ship-blocker that's owner-actionable.)
8. **Delete the stuck `tac-whatsapp-sends-102/` directory** in the primary clone. (Still pending.)
9. **Decide OD-1** — is [#154](https://github.com/cargotapan-collab/tac-express/issues/154) a SHIP-BLOCKER? Lean POST-LAUNCH. (Still pending.)
10. **Decide OD-2** — should any of the other 4 E1 flows be SHIP-BLOCKERS? Lean payment-only sufficient. (Still pending.)

**That's it. Ten owner actions, all listed. Next agent session burns SB-4 (payment-recording E2E).**
