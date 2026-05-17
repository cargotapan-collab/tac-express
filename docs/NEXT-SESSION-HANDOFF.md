# Next-Session Handoff — Start Here

> **TAC Express is ONE OWNER ACTION (~20 min) from launch. SB-2 remains.**
>
> This session ran an evidence-based reconciliation: GitHub MCP for the issue tracker, Sentry MCP for the SB-2 verification. The tracker is healthy; the Sentry MCP shows ZERO `api/diagnostics` synthetic events have ever been recorded, and ZERO unresolved Sentry issues in the last 30 days — **SB-2 has not been run.** Owner-pending items (P1–P4 confirmation, OD-1, OD-2) recorded as still-pending, not fabricated.

**Last code commit on `main`:** PR #160 — `test(e2e): payment-recording money-flow E2E (SB-4 / E1 carve-out)`.
**Last governance PR (THIS one):** TBD — Launch-readiness reconciliation.
**Date this doc was written:** 2026-05-17 (twelfth substantive session today — second META reconciliation in the arc).
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + CTO + Sentry-MCP-verification.

**LAUNCH STATUS (evidenced):**
- ✅ SB-1 — failed-send retry action (PR #156)
- 🔴 **SB-2 — Sentry alert provisioning — THE LAUNCH GATE — owner task, ~20 min** (verified NOT-run via Sentry MCP this session)
- ✅ SB-3 — PITR playbook (PR #159) — owner-pending P1–P4 confirmation
- ✅ SB-4 — payment-recording E2E (PR #160)

See [`docs/launch/definition-of-done.md`](launch/definition-of-done.md) — version 1.3, includes a "LAUNCH VERDICT (evidenced)" section in § 3a.

---

## 1. NO AGENT TASK GATES LAUNCH

The owner runs SB-2 ([`docs/runbooks/sentry-alert-rules.md § 5.3`](runbooks/sentry-alert-rules.md)). After that, a follow-up Sentry MCP query will show the `api/diagnostics` synthetic event in the issue stream — that's the evidence channel that flips SB-2 to DONE in the next reconciliation pass.

If the owner instead wants to advance a POST-LAUNCH item, that is a fresh agent session — but **none of those gate launch**, and Convention A explicitly says follow-up items default POST-LAUNCH unless owner-promoted.

---

## 2. READ THIS FIRST — eight things you must NOT do

(Unchanged.)

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per CLAUDE.md § 0.5.
2. **Do NOT bump dependencies in feature PRs.**
3. **Do NOT add Sentry tag keys without updating all four artifacts.**
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner-only.
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.**
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** [`docs/backlog/production-readiness.md`](backlog/production-readiness.md) is authoritative.
8. **Do NOT promote a POST-LAUNCH item to SHIP-BLOCKER without explicit owner decision.** Convention A.
9. **NEW: Do NOT mark SB-2 done on the owner's word alone.** The Sentry MCP must show the `api/diagnostics` synthetic event in the issue stream as evidence the runbook's § 5.3 procedure ran end-to-end.

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 774 unit tests + 117+ Playwright tests passing.
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
```

Then read in order:

1. [`docs/launch/definition-of-done.md`](launch/definition-of-done.md) — § 3a LAUNCH VERDICT (evidenced) tells you the state in 2 sentences.
2. [`docs/runbooks/sentry-alert-rules.md § 5.3`](runbooks/sentry-alert-rules.md) — the SB-2 owner procedure (if you're the owner).
3. This handoff § 6 — your first task (depends on whether the owner has run SB-2 since).

---

## 4. Current state snapshot

### Open PRs: 0 (after THIS one merges).

### Open issues (9 total, verified 2026-05-17 via GitHub MCP)

| Tracker | Title | Bucket | Notes |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) (CLOSED on tracker) | Sentry alert provisioning | **SHIP-BLOCKER SB-2 — THE LAUNCH GATE** | Owner reopens OR accepts tracker-less; either way SB-2 work outstanding |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | POST-LAUNCH | DoD § 6 |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` cluster | POST-LAUNCH | DoD § 6 |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated retry job (W3) | POST-LAUNCH | DoD § 6 |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta delivery webhook (W4) | POST-LAUNCH | DoD § 6 |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | Immutability sentinel (W5) | POST-LAUNCH | DoD § 6 |
| [#151](https://github.com/cargotapan-collab/tac-express/issues/151) | proxy.ts cast cleanup | POST-LAUNCH | DoD § 6 |
| [#154](https://github.com/cargotapan-collab/tac-express/issues/154) | RBAC auth-error sweep | POST-LAUNCH (pending OD-1) | DoD § 5 |
| [#157](https://github.com/cargotapan-collab/tac-express/issues/157) | TOCTOU retry concurrency hardening | POST-LAUNCH | DoD § 6 |
| [#158](https://github.com/cargotapan-collab/tac-express/issues/158) | Request-signing sweep | POST-LAUNCH | DoD § 6 |

**Already-closed by owner since the prior handoff (verified 2026-05-17 via GitHub MCP):** #139, #140, #142 — all CLOSED at 2026-05-17T15:39:05Z.

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

## 5. Critical context

### 5.1 – 5.16 (unchanged; see prior handoffs)

### 5.17 NEW: Sentry MCP verification is the SB-2 evidence channel

The Sentry MCP exposes `find_projects` / `search_issues` / `search_events` / `whoami` — enough to verify SB-2 indirectly. **It does NOT expose `GET /api/0/projects/{org}/{project}/rules/`** (alert-rule listing). But the runbook's § 5.3 Step 5 deliberately produces a Sentry ISSUE (`POST /api/diagnostics/sentry` throws a tagged exception) as the verification signal. So the SB-2 check shape is:

```
mcp__sentry__search_issues({ query: "api/diagnostics", limit: 10 })
→ if results > 0 with recent timestamp: SB-2 was run (and an issue was created from the synthetic POST)
→ if 0 results: SB-2 has not been run
```

The next reconciliation session should re-run this query.

---

## 6. Your first task

### If you are the OWNER reading this:

**Run SB-2 — the last ship-blocker.** Procedure at [`docs/runbooks/sentry-alert-rules.md § 5.3`](runbooks/sentry-alert-rules.md). ~20 minutes. After this, the next reconciliation session can mark SB-2 DONE with MCP evidence.

### If you are an AGENT picking up the next session:

No agent task gates launch. Three legitimate options, in order:

1. **The owner has explicitly directed you to re-run the reconciliation** (presumably after running SB-2) — query the Sentry MCP for `api/diagnostics` issues; if found, mark SB-2 DONE in the DoD and flip the verdict to LAUNCH-READY. The DoD § 9 "Maintenance" rule then archives the file with a "Launched on YYYY-MM-DD" footer.
2. **The owner has provided SB-3 P1–P4 confirmations** — fill in the runbook § 2 confirmation block + commit as `chore(docs):`.
3. **The owner has explicitly directed you to a specific POST-LAUNCH item** — promote per OD-1/OD-2 process (Convention A), then execute.

**Without explicit owner direction, the right answer is "wait for SB-2."** Do not regenerate maintenance-loop work by picking POST-LAUNCH items autonomously.

### Post-launch (after SB-2 lands)

The DoD § 9 maintenance rule: this file moves to `docs/_archive/` with a final "Launched on YYYY-MM-DD" footer. A successor file (or just the backlog) takes over post-launch tracking. **Recommended one-time follow-up:** a triage session that re-ranks the POST-LAUNCH pool using real Sentry data from the now-armed alert rules (the Sentry MCP becomes a useful prioritization tool once real user traffic is flowing).

---

## 7. Cumulative discipline observations (carry-forward)

### 7.1 – 7.41 (see prior handoffs/retros)

### 7.42 NEW (this session): An MCP without a list-X tool can still verify X by its observable side-effects

The Sentry MCP doesn't list alert rules. But the SB-2 verification procedure deliberately produces a visible side-effect (a Sentry issue from a known endpoint) that the MCP CAN observe. The trick was to map the verification claim ("SB-2 was run") to an observable proxy ("an `api/diagnostics` issue exists in the stream"). Decision tree fits the available tooling cleanly. **Pattern: when an MCP doesn't expose direct introspection of X, look for X's observable side-effects.**

### 7.43 NEW (this session): Honest reporting cost ≈ 0; honest reporting value = the launch

The temptation under PM-mode reconciliation pressure is to call something done if it MIGHT be done. The brief enforced the opposite: evidence required, fabrication forbidden. The MCP query was unambiguous — zero `api/diagnostics` events ever — and so the verdict was unambiguous. A reconciliation that says LAUNCH-READY when SB-2 isn't done risks production with no alerting, which is exactly what SB-2 was promoted to ship-blocker to prevent.

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
# E2E (full suite):
pnpm --filter dashboard exec playwright test
# Sentinels:
pnpm vitest run apps/dashboard/__tests__/backlog-refs-drift.test.ts
node scripts/ci-watch-pr.mjs <pr-number>
# Sentry MCP — the SB-2 verification query:
# mcp__sentry__search_issues({
#   organizationSlug: "tapan-cargo-az",
#   regionUrl: "https://de.sentry.io",
#   projectSlugOrId: "javascript-nextjs",
#   query: "api/diagnostics",
# })
```

---

## 9. Key file locations (additions this PR — docs only)

```
EDITED:
  docs/launch/definition-of-done.md          # version 1.3 + § 3a LAUNCH VERDICT (evidenced) + SB-2 verification trail
  docs/NEXT-SESSION-HANDOFF.md               # this file
NEW:
  docs/retros/2026-05-17-launch-readiness-reconcile.md   # session retro
```

Zero application source touched. No issue mutations (the work was already done by the owner: #139/#140/#142 closed at 2026-05-17T15:39).

---

## 10. The honest read

The project is one ~20-minute owner task from launch. The reconciliation pass confirmed the tracker is healthy and the DoD is accurate. The Sentry MCP confirmed the launch gate is real (SB-2 has not been run) — it did not confirm something convenient (rules exist, owner ran something) that wasn't evidenced.

**Recommended one-line summary for the next session's prompt:** "Run the Sentry MCP `api/diagnostics` query — if an issue exists, SB-2 is done; mark it in the DoD and flip the verdict to LAUNCH-READY. Otherwise wait for SB-2."

---

## 11. OWNER ACTIONS — before launch

Per AGENTS.md Convention B. Numbered, copy-pasteable, single block. **Item 1 is THE launch gate.**

1. **🚀 RUN SB-2 — THE last ship-blocker.** Procedure: [`docs/runbooks/sentry-alert-rules.md § 5.3`](runbooks/sentry-alert-rules.md). `scripts/sentry/create-alert-rules.mjs` with a `project:write` token + verify one rule fires end-to-end (the `POST /api/diagnostics/sentry` synthetic event) + update the runbook. ~20 minutes. **After this, the next reconciliation pass will see the synthetic event in the Sentry MCP stream and mark SB-2 DONE.**
2. **Verify SB-3 PREREQUISITES P1–P4** against the Supabase dashboard per [`DATABASE-RESTORE.md § 2`](runbooks/DATABASE-RESTORE.md#2-prerequisites-owner-confirmed--verify-before-launch). Fill the runbook's confirmation block + commit as small `chore(docs):` PR.
3. **(Optional but recommended)** Run the SB-3 dry-run walkthrough per [`DATABASE-RESTORE.md § 9`](runbooks/DATABASE-RESTORE.md#9-dry-run-walkthrough-validate-the-runbook-itself) (~30 min).
4. **Decide OD-1** — is [#154](https://github.com/cargotapan-collab/tac-express/issues/154) a SHIP-BLOCKER? DoD lean: POST-LAUNCH.
5. **Decide OD-2** — should any of the other 4 E1 flows be SHIP-BLOCKERS? DoD lean: payment-only-sufficient.
6. **Reopen [#94](https://github.com/cargotapan-collab/tac-express/issues/94)** OR accept as tracker-less DoD item. (Same activity as item 1.)
7. **Delete `C:\tac\tac-express\tac-whatsapp-sends-102/`** (untracked worktree artifact).
8. **CodeRabbit billing** — update payment method or pay pending invoices.

**Already-completed owner actions (verified 2026-05-17 in this session via GitHub MCP):**
- ✅ #139, #140, #142 closed on tracker (auto-closed 2026-05-17T15:39:05Z).
