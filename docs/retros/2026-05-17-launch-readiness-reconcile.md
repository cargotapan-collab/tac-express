# Retro — Launch-readiness reconciliation (2026-05-17)

**PR:** TBD (this PR).
**Type:** META session — zero feature code; reconciliation + evidenced launch verdict.
**Role:** PM + CTO primary; engineer advisory.
**Branch:** `chore/launch-readiness-reconcile` from main `329003a`.

---

## 1. TL;DR

Reconciled the GitHub issue tracker, the DoD file, and the Sentry MCP evidence stream to TAC Express's true launch-ready state. **Verdict: 1 GATE REMAINING — SB-2.**

The Sentry MCP independently confirms what could be evidenced: project `tapan-cargo-az/javascript-nextjs` exists; ZERO `api/diagnostics` synthetic events have ever been recorded; ZERO unresolved Sentry issues in the last 30 days. The SB-2 verification procedure REQUIRES a synthetic event from `POST /api/diagnostics/sentry` to land in the issue stream. **It hasn't. SB-2 has not been run.**

Owner-pending non-launch-gating items also recorded honestly (SB-3 P1–P4, OD-1, OD-2, #94 reopen-or-accept, the stuck-directory deletion, the CodeRabbit billing).

---

## 2. Issue reconciliation (PHASE A)

GitHub MCP queried for all open issues on `cargotapan-collab/tac-express`. **9 open**, all correctly POST-LAUNCH per the DoD § 6 bucket:

| # | Title | Verdict | DoD bucket |
|---|---|---|---|
| #130 | Promote regex-alternation grep | OPEN | POST-LAUNCH |
| #131 | Brand ServiceLevel type | OPEN | POST-LAUNCH |
| #143 | Automated background retry job (W3) | OPEN | POST-LAUNCH |
| #144 | Meta delivery webhook (W4) | OPEN | POST-LAUNCH |
| #145 | App-layer immutability sentinel (W5) | OPEN | POST-LAUNCH |
| #151 | proxy.ts casts cleanup | OPEN | POST-LAUNCH |
| #154 | RBAC auth-error sweep | OPEN | POST-LAUNCH (pending OD-1) |
| #157 | TOCTOU race in retryWhatsappSend | OPEN | POST-LAUNCH |
| #158 | Request-signing sweep | OPEN | POST-LAUNCH |

**Recommended-close issues from prior owner-action blocks (#139, #140, #142):** verified **already CLOSED** by owner at 2026-05-17T15:39 (auto-close via PR #156's close-links + the owner's housekeeping pass). No agent mutations required.

**#94 (SB-2 owner-runnable):** verified **still CLOSED** (prematurely on 2026-05-15). Per the DoD's documented choice, owner either reopens it for tracker visibility OR accepts as a tracker-less DoD item. Either way, the work — provisioning Sentry alert rules — remains open.

**Reconciliation conclusion:** the tracker is HEALTHY. No fixed-but-open, no stale, no surprises. Everything that's open is correctly POST-LAUNCH per the DoD.

---

## 3. Sentry MCP verification (PHASE B) — THE LOAD-BEARING CHECK

The Sentry MCP exposes `find_projects` / `search_issues` / `search_events`. It does **NOT** expose `GET /api/0/projects/{org}/{project}/rules/`, so alert-rule configuration cannot be enumerated directly. **However**, the rule-firing path IS observable: a fired rule produces a new Sentry issue + visible event stream. That's the verification channel.

### What the MCP confirms

| Check | Result | Tool |
|---|---|---|
| Project exists | ✅ `tapan-cargo-az/javascript-nextjs` on `de.sentry.io` | `find_projects` |
| Authenticated identity matches runbook | ✅ `cargotapan@gmail.com` (User ID `4015622`) | `whoami` |
| Recent issues (last 7d) | 5 issues, all `ignored`/`resolved`, all unrelated to `api/diagnostics` (mix of `controller[kState]` TypeError + middleware/proxy conflict + 3 undefined-symbol ReferenceErrors from `GET /ops-console/*` paths) | `search_issues` `firstSeen:-7d` |
| Last 30d unresolved issues | **0** | `search_issues` `is:unresolved firstSeen:-30d` |
| `api/diagnostics` events ever | **0** | `search_issues` `api/diagnostics` |

### What the MCP cannot verify (honest limits)

- **Whether alert rules are configured** (no list-rules tool surfaced).
- **Whether notifications were delivered** (out-of-band: email/Slack/PagerDuty receipt is the owner's inbox).
- **Whether the create-alert-rules script returned `1 created, 5 skipped` or anything else**.

### What the MCP DOES sufficiently rule out

The runbook's § 5.3 Step 5 procedure produces a Sentry issue from `POST /api/diagnostics/sentry`. The route is deliberately error-throwing for exactly this verification. **If SB-2 had been run end-to-end, an `api/diagnostics` issue would exist in the stream.** None does, in any time window. Therefore: **SB-2 not run**, evidenced.

### SB-2 verdict

**NOT DONE.** The launch gate stands. SB-2 marked OPEN in the DoD with the verification trail recorded.

---

## 4. Owner-pending items recorded (PHASE C + D)

The session was not given the owner's outputs for these. Per the brief: do not guess, do not fabricate, flag pending.

| Item | Status | Documented lean |
|---|---|---|
| SB-3 P1 (Pro plan or above) | Owner-pending; runbook § 2 confirmation block blank | Lean: confirmed standard for revenue-bearing Supabase projects |
| SB-3 P2 (PITR enabled + retention window) | Owner-pending; runbook § 2 blank | Lean: 7d (Pro default) or 28d (Team) |
| SB-3 P3 (daily logical backups present) | Owner-pending; runbook § 2 blank | Lean: standard on Pro+ |
| SB-3 P4 (Owner role present on org) | Owner-pending; runbook § 2 blank | Lean: confirmed (cargotapan@gmail.com is owner on the Supabase org per the runbook coordinates) |
| OD-1 (#154 promotion?) | Owner-pending; not stated | DoD lean: POST-LAUNCH (refresh is acceptable workaround) |
| OD-2 (other 4 E1 flows promotion?) | Owner-pending; not stated | DoD lean: payment-only-sufficient |
| SB-3 dry-run walkthrough | Owner-pending (optional but recommended) | ~30 min against a Supabase branch |
| #94 reopen-or-accept | Owner-pending; issue still CLOSED on tracker | DoD allows either |
| Stuck `tac-whatsapp-sends-102/` directory | Owner-pending | Still in the untracked-files list |
| CodeRabbit billing | Owner-pending | Surfaced on PR #159 + #160 |

None of these are LAUNCH-GATING beyond SB-2. They are housekeeping that should land but doesn't gate the production cutover.

---

## 5. DoD update (PHASE E)

[`docs/launch/definition-of-done.md`](../launch/definition-of-done.md) updated:
- Version bumped to 1.3 with the reconciliation note.
- SB-2 section reframed as "OPEN — THE LAUNCH GATE" with the full Sentry MCP verification trail (3 confirmations, 2 honest limits, 1 sufficient ruling-out).
- Current standing table reflects SB-2 still open with the MCP-evidence pointer.
- NEW § 3a "LAUNCH VERDICT (evidenced)" — single-paragraph evidenced verdict + the list of non-launch-gating owner-pending items.

[`docs/backlog/production-readiness.md`](../backlog/production-readiness.md) — no per-item changes needed (the DoD is the canonical source for SB-status; backlog item O3 already says "owner task; not agent-actionable" + "ship-blocker SB-2 in DoD" which remains accurate).

[`docs/NEXT-SESSION-HANDOFF.md`](../NEXT-SESSION-HANDOFF.md) — replaced. § 6 now states the verdict plainly + names the owner-pending items.

---

## 6. Discipline observations

### 6.1 The "mark SB-2 done on the owner's word" temptation — not triggered

The owner did not say SB-2 was run; no claim to evaluate. But the brief's anti-pattern was: "DO NOT mark SB-2 done on the owner's say-so without the MCP verification, OR mark it done when the MCP evidence is absent." Both rules held. The MCP query was the actual gate.

### 6.2 The MCP's "find_projects + search_issues + search_events" was enough

I worried briefly that the absence of a list-rules tool would make verification impossible. It didn't — the SB-2 runbook deliberately produces a Sentry ISSUE as the verification signal (Step 5 — the synthetic event from `/api/diagnostics/sentry`). Issue-stream observation is what the MCP does well. So the verification path was: "if SB-2 has been run, an `api/diagnostics` issue exists; the search returned zero; SB-2 has not been run." Decision tree fits the available tooling cleanly.

### 6.3 The "while I'm here, run something" temptation — resisted

The Sentry MCP is authenticated and could theoretically update issue states / run analyses / etc. None of that is part of the reconciliation. Bypassed.

### 6.4 The "fabricate the owner inputs to clear the doc" temptation — resisted

The brief documented "leans" for OD-1, OD-2, P1–P4. Tempting to write them in as "owner is on record leaning this way" and move on. The brief explicitly said: never guess a decision, never fabricate a verification. Recorded as still-pending with the leans noted as recommendations, not decisions.

### 6.5 Honest reporting cost ≈ 0; honest reporting value = the launch

A reconciliation pass that says "launch-ready" when SB-2 isn't done risks the project shipping to production with no alerting, which is exactly the failure shape SB-2 was promoted to ship-blocker to prevent. The evidence-based verdict — "1 GATE REMAINING" — is the value of the heightened-rigor MCP-evidence-required posture this brief enforced.

---

## 7. OWNER ACTIONS — before launch

Per AGENTS.md Convention B. Numbered, copy-pasteable, single block. **Item 1 is THE launch gate.**

1. **🚀 RUN SB-2 — THE last ship-blocker.** Procedure: [`docs/runbooks/sentry-alert-rules.md § 5.3`](../runbooks/sentry-alert-rules.md). ~20 minutes total: `scripts/sentry/create-alert-rules.mjs` with a `project:write` token, then `POST /api/diagnostics/sentry` to trigger the synthetic event, then verify the notification arrived at your chosen channel. After this, the next reconciliation pass can mark SB-2 DONE with MCP evidence (an `api/diagnostics` issue will exist in the stream).
2. **Verify SB-3 PREREQUISITES P1–P4** against the Supabase dashboard per [`DATABASE-RESTORE.md § 2`](../runbooks/DATABASE-RESTORE.md#2-prerequisites-owner-confirmed--verify-before-launch). Fill in the runbook's confirmation block + commit as a small `chore(docs):` PR.
3. **(Optional but recommended)** Run the SB-3 dry-run walkthrough per [`DATABASE-RESTORE.md § 9`](../runbooks/DATABASE-RESTORE.md#9-dry-run-walkthrough-validate-the-runbook-itself) — ~30 min.
4. **Decide OD-1** — is [#154](https://github.com/cargotapan-collab/tac-express/issues/154) a SHIP-BLOCKER? DoD lean: POST-LAUNCH.
5. **Decide OD-2** — should any of the other 4 E1 flows be SHIP-BLOCKERS? DoD lean: payment-only-sufficient.
6. **Reopen [#94](https://github.com/cargotapan-collab/tac-express/issues/94)** OR accept as tracker-less DoD item. (Same activity as item 1; bundling for one-stop.)
7. **Delete `C:\tac\tac-express\tac-whatsapp-sends-102/`** (untracked worktree artifact).
8. **CodeRabbit billing** — update payment method or pay pending invoices.

**Already-completed owner actions verified in this session:**
- ✅ #139, #140, #142 already CLOSED on tracker (2026-05-17T15:39).
