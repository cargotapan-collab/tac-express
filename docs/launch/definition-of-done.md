# TAC Express — Definition of Done

> **This file is authoritative for launch scope.** It defines, finitely, what must be true for TAC Express to go to production. The list ENDS. Once these criteria are met, work shifts from "what's next" to "first customer."
>
> **Pair file:** [`docs/backlog/production-readiness.md`](../backlog/production-readiness.md) is the open-item backlog (engineering hygiene + post-launch enhancements). This file is the launch-gating subset of that backlog plus owner actions.

**Version:** 1.1 — 2026-05-17, **SB-1 DONE** (W2 retry action shipped in the PR closing [#153](https://github.com/cargotapan-collab/tac-express/issues/153)). 4 → 3 ship-blockers remaining.
**Version:** 1.0 — initial framing, 2026-05-17.
**Authority chain:** AGENTS.md § 0 → this file → backlog. The backlog file remains the authoritative open-item list; this file is the launch-gating triage of it.

---

## 0. Why this file exists (the re-frame)

TAC Express has shipped 13+ disciplined PRs and the engineering quality is genuinely strong. Tests are in place (749 unit tests, 8 load-bearing CI gates, 6 sentinel tests guarding cross-cutting invariants). The problem has never been quality.

The problem is **shape**.

Until today the project ran as an open-ended "what is the next-highest backlog item" loop. That loop never terminates: every feature PR correctly spawns follow-up issues (#151, #153, #154 in the last day alone), so the backlog regenerates as fast as it drains. The root cause: [#102](https://github.com/cargotapan-collab/tac-express/issues/102) was a "production-readiness audit," but "production-ready" was never converted into a FINITE list of SHIP-BLOCKING criteria. The project had an infinite "everything could be better" list and no finite "must be true to launch" list.

This document is the second list. **After this document, work is burned down against criteria that END.**

---

## 1. The hard test (how an item earns SHIP-BLOCKER status)

Every candidate is evaluated against ONE question:

> **If we launched tomorrow without this, would it cause one of:**
> - **data loss**, or
> - **a security hole**, or
> - **a money-flow error**, or
> - **a broken core user journey** (the operator literally cannot complete the task), or
> - **a legal / contractual breach**?

If the honest answer is **no**, the item is **NOT** a ship-blocker — regardless of how valuable, polished, or "the right thing to do" it might be. Hygiene items (branded types, cast cleanups, an extra sentinel, a LAW-gate promotion, a JSDoc improvement) **never** meet the hard test unless they sit on a money-flow / auth boundary that is materially broken without them.

This test is intentionally ruthless. The SHIP-BLOCKER bucket is small by design. The POST-LAUNCH bucket is large by design and is a legitimate visible parking lot, not a graveyard.

---

## 2. The Ship-Blocker list — finite, ordered

**Four items.** All four must be true before launch.

### SB-1 — Failed-send retry action ([#153](https://github.com/cargotapan-collab/tac-express/issues/153)) — **DONE 2026-05-17**

**Closed in:** the PR closing #153 (W2 PR 2 — retry action). PHASE-0 decision: [`docs/decisions/2026-05-17-whatsapp-retry-action.md`](../decisions/2026-05-17-whatsapp-retry-action.md). Retro: [`docs/retros/2026-05-17-whatsapp-retry-action.md`](../retros/2026-05-17-whatsapp-retry-action.md).

**What shipped:**
- `POST /api/whatsapp/retry-send` route at [apps/dashboard/app/api/whatsapp/retry-send/route.ts](../../apps/dashboard/app/api/whatsapp/retry-send/route.ts) — MANAGER+ role-gated; calls `retryWhatsappSend` (PR #141 primitive).
- Pure `WhatsAppRetryButton` in [packages/ui/.../whatsapp/whatsapp-retry-button.tsx](../../packages/ui/src/components/composed/whatsapp/whatsapp-retry-button.tsx).
- `FailedSendsTable` extended with an opt-in `retryConfig` prop (Retry column visible only when MANAGER+ visits the page).
- Client wrapper in apps/dashboard owns per-row in-flight state + `router.refresh()` on successful retry.
- `listFailedWhatsappSends` query adjusted to filter superseded rows (leaf-only) — a successfully-retried send drops off the failed list automatically. Fix for the money-flow correctness bug surfaced by the retry action (PHASE-0 § B).
- Layered safety (PHASE-0 § E): service guards (status='failed' + endpoint match) + route guards (MANAGER+ + kill switch + rate-limit + invoice-linkage + sendmessage-only) + UI in-flight lock.
- Replay-payload builders extracted to [packages/services/src/whatsapp/invoice-replay-payload.ts](../../packages/services/src/whatsapp/invoice-replay-payload.ts) (catalog #9 — second-consumer pattern).

**V1 scope cut documented:** template-message retries (`sendtemplatemessage`) are disabled in V1 with an explanatory tooltip. The schema doesn't persist `templateLanguage` — a POST-LAUNCH follow-up either persists that column or defaults it.

**Tests:** 749 → 762 (+13 net new: 4 leaf-filtering + 3 getWhatsappSendById + 7 retry-button + 4 retry-column in failed-sends-table; minor existing-test adjustments for the 2× overfetch).

---

### SB-2 — Sentry alert-rule notification action ([#94](https://github.com/cargotapan-collab/tac-express/issues/94) — owner-runnable; backlog [O3](../backlog/production-readiness.md#o3--sentry-alert-rule-notification-action-owner-runnable-provisioning))

**Why it gates launch:** Sentry events are captured today but no notification fires. A solo-owner production app without alerting means a money-flow error (failed payment, silent invoice rejection, RBAC breach attempt) can fire in Sentry and the owner never learns about it until a customer complains. That is the canonical silent-incident shape.

**Testable DONE criterion:**
- Owner runs `scripts/sentry/create-alert-rules.mjs` once with a `project:write` token (existing script; ships the 6 canonical rules from `scripts/sentry/canonical-rules.mjs`).
- At least one rule produces an end-to-end notification (email or Slack) verified by the owner deliberately tripping it.
- `docs/runbooks/sentry-alert-rules.md` reflects the live config (channel, severity routing).
- `node scripts/sentry/lint-alert-rules.mjs` passes (already enforced in CI; this is a sanity check).

**Estimate:** 5 minutes owner-execution + 15 minutes verification = ~20 minutes total. Owner task — agent cannot run from a session (per next-session handoff "do not do" list).

**Reopen status:** Issue [#94](https://github.com/cargotapan-collab/tac-express/issues/94) is currently CLOSED (closed prematurely on 2026-05-15 before the work was actually completed). See OWNER ACTIONS § 8 — owner reopens or accepts as a tracker-less DoD item.

---

### SB-3 — Database restore (PITR) playbook ([backlog D1](../backlog/production-readiness.md#d1--pitr--database-restore-playbook)) — **DONE**

**Why it gated launch:** No documented procedure existed for "Supabase project lost" or "table accidentally truncated" recovery. Supabase has PITR available, but if the incident had happened BEFORE the procedure was documented, the recovery clock would have started at "owner Googles supabase pitr how to" — multiplying RTO by an unknown factor on the worst possible day.

**Status:** DONE — runbook at [`docs/runbooks/DATABASE-RESTORE.md`](../runbooks/DATABASE-RESTORE.md) shipped in the PR that closes SB-3. PHASE-0 decision doc at [`docs/decisions/2026-05-17-database-restore-playbook.md`](../decisions/2026-05-17-database-restore-playbook.md). The runbook covers the three in-scope scenarios (bad migration; data deletion/corruption; full project loss), with explicit decision tree, 4-step verification, 5 safety guards, and named OWNER-CONFIRMED PREREQUISITES (P1–P4) the owner verifies once via the Supabase dashboard.

**Testable DONE criterion (all satisfied):**
- ✅ `docs/runbooks/DATABASE-RESTORE.md` exists.
- ✅ Names the Supabase PITR feature explicitly (link to current Supabase PITR docs URL at `https://supabase.com/docs/guides/platform/backups#point-in-time-recovery`).
- ✅ Documents the auth path (Supabase org Owner role; project ref `mdvnphbucrpspntrezmj`; org `ppwavecghnfqsmzqlhgb`).
- ✅ Walks the exact steps for the three in-scope scenarios — including (a) full project recovery to a point-in-time, (b) single-table restore (via Supabase branches + parallel project + targeted re-insert).
- ✅ Names explicit RTO targets: ≤ 4 hours for scenarios 1+2; ≤ 8 hours for scenario 3.
- ✅ Dry-run walkthrough recorded in § 9; owner-side validation procedure documented (~30 minutes against a Supabase branch).

**Owner-pending:** the four OWNER-CONFIRMED PREREQUISITES (P1 Pro plan, P2 PITR enabled + retention, P3 daily backups, P4 Owner role) must be verified by the owner via the Supabase dashboard. The runbook's § 2 includes a fill-in confirmation block.

---

### SB-4 — Payment-recording E2E ([backlog E1, carve-out](../backlog/production-readiness.md#e1--e2e-flows-5-grouped-items))

**Why it gates launch:** Payment recording is the most money-sensitive flow in the app. Unit tests on `payment.service.ts` cover the service-layer logic (29+ cases on main), but no end-to-end test asserts that the form submission → server action → DB write → UI reflection actually round-trips correctly with auth + RLS + form-state interactions in place. Manual QA has caught zero regressions through 13+ PRs, but launch is the moment the path starts running against real money, real users.

**Out of scope for SHIP-BLOCKER:** the other 4 E1 flows (shipment-creation wizard, manifest-creation wizard, RBAC RLS isolation, exception lifecycle) are POST-LAUNCH. Unit tests + manual QA + Sentry alerting (SB-2) is a defensible posture for those four. **Payment is the carve-out because it touches money directly.**

**Testable DONE criterion:**
- `apps/dashboard/e2e/payment-recording.spec.ts` exists.
- Runs in CI as part of the existing visual+a11y e2e job (or a new e2e job; structural decision in the PR).
- Asserts the happy path: operator signs in → navigates to invoice detail → records a payment (amount, method, date) → form submits → DB row appears in `payments` table → UI reflects updated balance.
- Asserts at least ONE validation-error path: invalid amount or duplicate-payment guard.
- Includes the cleanup step (delete the test payment) so the test is idempotent across runs.

**Estimate:** 1 session. **Owner decision required:** is payment-recording-only sufficient, or should other E1 flows be promoted? See § 5.

---

## 3. Current standing

| Ship-blocker | Status | Blocker |
|---|---|---|
| SB-1 — Failed-send retry action (#153) | **DONE 2026-05-17** | — |
| SB-2 — Sentry alert provisioning (#94 / O3) | OPEN | ~20 min owner-task; agent-untouchable |
| SB-3 — PITR playbook (D1) | **DONE 2026-05-17** | Owner-pending: P1–P4 prerequisite confirmation against the Supabase dashboard (see runbook § 2) |
| SB-4 — Payment-recording E2E (E1 carve-out) | OPEN | Not started; ~1 session of work |

**Open ship-blockers:** 2 of 4 remain (SB-2, SB-4).
**Realistic burn-down:** **1-2 sessions remaining** — SB-4 is 1 session of agent work; SB-2 is the owner's ~20-minute task and can run in parallel.

After all 4 are DONE, the launch criteria are met. POST-LAUNCH work continues against the same backlog file, but **does not gate launch**.

---

## 4. Recommended burn-down order

1. ~~**SB-1 first** ([#153](https://github.com/cargotapan-collab/tac-express/issues/153)) — direct continuation of PR #152.~~ **DONE 2026-05-17.**
2. ~~**SB-3 next** (D1 PITR playbook).~~ **DONE 2026-05-17** — runbook at [`docs/runbooks/DATABASE-RESTORE.md`](../runbooks/DATABASE-RESTORE.md).
3. **SB-4 third** (payment-recording E2E) — requires the most setup (Playwright e2e wiring for an authenticated dashboard flow with form-state + DB cleanup). The next agent session burns this.
4. **SB-2 fourth** (owner Sentry provisioning) — owner-only; can run in parallel with SB-4; must be done before first real-user traffic.

**Ordering reasoning:** SB-1 and SB-3 closed in order. SB-4 is the only remaining agent-actionable ship-blocker; SB-2 is owner-async. The launch is one focused agent session + one ~20-minute owner task away.

---

## 5. Owner decisions required

Two open product-level decisions the agent cannot make. They do not block burn-down of the other items; they shape the final shape of the SHIP-BLOCKER list:

### OD-1 — Is [#154](https://github.com/cargotapan-collab/tac-express/issues/154) (RBAC auth-error sweep) a SHIP-BLOCKER?

**Context:** 4+ RBAC-gated sites use `.catch(() => null)` on `auth.getUser()` and `getProfileById()`. Transient errors (network blip, Postgres pool exhausted) currently collapse into the unauth/forbidden fallback shape — producing a false `captureRbacDenial` event in Sentry and rendering "Sign in required." / "Not authorized." to the user instead of surfacing as a server error. The workaround for the user is a page refresh.

**Lean:** POST-LAUNCH. The false RBAC denial is a real correctness bug at the auth boundary, but it does not meet the hard test — no data loss, no money-flow error, no broken-irrecoverable-journey. The operator refreshes; the workaround is fast.

**Owner choice:** if the answer is "no — refresh is acceptable at launch," #154 stays POST-LAUNCH. If the answer is "yes — transient blips mistaken for RBAC denials are launch-unacceptable," #154 becomes SB-5 and adds a session to the burn-down.

### OD-2 — Should the OTHER 4 E1 flows be SHIP-BLOCKERS?

**Context:** E1 is 5 E2E flows (payment, shipment wizard, manifest wizard, RBAC RLS isolation, exception lifecycle). SB-4 carves out payment-recording. The other 4 are POST-LAUNCH per the hard test (unit tests + manual QA + Sentry alerting from SB-2 is defensible).

**Lean:** payment-only is sufficient. The other 4 flows have been exercised through 13+ PRs without regressions caught in production.

**Owner choice:** if "no — payment-only is sufficient," current scope holds. If "yes — at least RBAC RLS isolation OR shipment-wizard should also be E2E-gated," each promoted flow adds a session to the burn-down.

---

## 6. POST-LAUNCH bucket (legitimate parking lot, NOT a graveyard)

These items are real, valuable work that the product can ship without and that can be done once real users exist. They are NOT abandoned — they remain visible in [`docs/backlog/production-readiness.md`](../backlog/production-readiness.md) and ship in priority order after launch.

**Tracker issues (8):**
- [#130](https://github.com/cargotapan-collab/tac-express/issues/130) — regex-alternation LAW gate (tooling; prevents a class of future bug)
- [#131](https://github.com/cargotapan-collab/tac-express/issues/131) — `ServiceLevel` branded-type cluster (structural fix; the user-visible bug from PR #128 is already fixed)
- [#143](https://github.com/cargotapan-collab/tac-express/issues/143) — automated background WhatsApp retry job (operator-triggered retry from SB-1 is the floor)
- [#144](https://github.com/cargotapan-collab/tac-express/issues/144) — Meta delivery-callback webhook (adds `delivered`/`read` status — current `queued/sent/failed` is the launch floor)
- [#145](https://github.com/cargotapan-collab/tac-express/issues/145) — application-layer immutability sentinel for `whatsapp_sends` (defense-in-depth; discipline already holds)
- [#151](https://github.com/cargotapan-collab/tac-express/issues/151) — `as unknown as` cleanup in `apps/web/proxy.ts` (30-min hygiene)
- [#154](https://github.com/cargotapan-collab/tac-express/issues/154) — RBAC auth-error handling sweep (pending OD-1)
- (and the recommended owner-action of closing the 3 FIXED-BUT-OPEN / PARTIALLY-DONE issues — see § 8)

**Backlog-only items (6):**
- **D2** — Upstash outage runbook entry (fails-open is deliberate; not launch-gating)
- **D3** — monitoring dashboard URLs in `PRODUCTION-RUNBOOK.md` (15-min sweep; nice-to-have; could be done same-day as SB-3 if convenient)
- **D4** — WhatsApp rate-limit bucket JSDoc (pure docs)
- **D5** — `docs/RELEASE-CHECKLIST.md` (only matters when manual release becomes possible; currently continuous deploy)
- **E1 (the other 4 flows)** — shipment wizard, manifest wizard, RBAC RLS isolation, exception lifecycle E2Es (pending OD-2)

**WONTFIX-WATCH (2, per CLAUDE.md § 6, still valid):**
- **X1** — form variant canonical pick (re-evaluate 2026-08-16)
- **X2** — on-call schedule + escalation policy (re-evaluate 2026-08-16)

---

## 7. The two new conventions (codified in AGENTS.md)

To stop the maintenance loop from regenerating launch scope, two governance conventions are added to AGENTS.md alongside this file:

### Convention A — Follow-up issues default to POST-LAUNCH

Every new issue a PR spawns is tagged POST-LAUNCH by default. The launch scope only grows when the owner explicitly promotes an issue to SHIP-BLOCKER with a justification matching the hard test in § 1. Promotion is recorded in this file; demotion is recorded the same way.

**Why:** without this rule, every "we caught a real bug, let's fix it next session" issue silently expands the launch scope. The hard test is the gate; the promotion is the gate's exercise.

### Convention B — OWNER ACTIONS block in every session handoff and retro

Every session handoff (`docs/NEXT-SESSION-HANDOFF.md`) and every retro (`docs/retros/*.md`) ends with a single numbered, copy-pasteable **"OWNER ACTIONS — before next session"** block. Owner-only chores get exactly ONE predictable slot per session — they don't trickle out into prose paragraphs and accumulate silently across handoffs until "what owner-actions are pending" becomes its own re-validation pass.

**Why:** today's owner-actions (close #139, close #140, resolve #142, run #94, delete a stuck directory) are real but scattered across multiple session-end summaries. A single explicit block per session keeps them tracked.

---

## 8. OWNER ACTIONS this session surfaced (carry into the OWNER ACTIONS block of this session's handoff)

1. **Close [#139](https://github.com/cargotapan-collab/tac-express/issues/139)** as FIXED — the `shouldFallback` semantic-failure logic shipped in PR #148, verified present on main.
2. **Close [#140](https://github.com/cargotapan-collab/tac-express/issues/140)** as FIXED — the `||` baseURL coalesce shipped in PR #148, verified present on main.
3. **Resolve [#142](https://github.com/cargotapan-collab/tac-express/issues/142)** — close it (read half shipped in PR #152; the retry half lives at [#153](https://github.com/cargotapan-collab/tac-express/issues/153)) OR annotate the body to say PARTIAL and link to #153. Recommended convention going forward: **one feature, one open issue** — close #142, let #153 carry the remainder.
4. **Reopen [#94](https://github.com/cargotapan-collab/tac-express/issues/94)** OR accept as a tracker-less DoD item — the issue closed 2026-05-15 but the owner-runnable work remains (per backlog O3 + SB-2 of this file).
5. **Run SB-2** — `scripts/sentry/create-alert-rules.mjs` with a `project:write` token; verify one rule fires end-to-end; update `docs/runbooks/sentry-alert-rules.md`.
6. **Delete the stuck `tac-whatsapp-sends-102/` directory** in the primary clone (`C:\tac\tac-express\tac-whatsapp-sends-102/`) — leftover from a prior worktree creation, currently untracked and inert.
7. **Decide OD-1 and OD-2** — the two open product decisions in § 5. Each promotion adds a session to the burn-down.

---

## 9. Maintenance

This file is updated when:

- A SHIP-BLOCKER goes DONE → strike its row in § 2 + update § 3's current standing.
- The owner promotes a POST-LAUNCH item to SHIP-BLOCKER → add as new SB-N with justification matching the hard test.
- A POST-LAUNCH item ships → no DoD update needed; the backlog file is the authoritative open-item list and tracks its closure there.
- Launch happens → this file moves to `docs/_archive/` with the final "Launched on YYYY-MM-DD; the four ship-blockers were …" footer, and a successor file (or just the backlog) takes over post-launch tracking.

The list IS finite. The launch IS reachable.
