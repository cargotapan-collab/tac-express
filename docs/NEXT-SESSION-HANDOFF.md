# Next-Session Handoff — Start Here

> **You are picking up TAC Express after the Definition of Done re-frame session.** The project is now running against a finite, ordered launch list. Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last code commit on `main`:** PR #152 — `feat(ui): WhatsApp failed-sends operator view (W2 PR 1, visibility/read)`.
**Last docs/governance PR (THIS one):** **TBD** — Definition of Done + launch re-frame.
**Date this doc was written:** 2026-05-17 (eighth substantive session today — first META session in the arc).
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + CTO + engineer/designer advisory.

**The launch list is now AUTHORITATIVE.** See [`docs/launch/definition-of-done.md`](launch/definition-of-done.md) — 4 SHIP-BLOCKERS, finitely defined, ordered for burn-down. After all 4 are DONE, the launch criteria are met.

---

## 1. THE PROJECT IS NOW LAUNCH-RUN, NOT MAINTENANCE-LOOP

The fundamental shift from this session: work is burned down against a list that ENDS.

Until today, the project ran as "what is the highest-priority backlog item we can do next?" — a loop that never terminates because every feature PR correctly spawned follow-up issues. Today's re-frame produced:

- **4 SHIP-BLOCKERS** that must be true for launch. **Nothing else gates launch.**
- **13 POST-LAUNCH items** in a visible parking lot (the rest of the open backlog).
- **2 OWNER DECISIONS** that could expand SHIP-BLOCKER scope.

**The next session's task is SB-1 — direct continuation of PR #152.** Do not pick a different task without owner override. See § 6.

---

## 2. READ THIS FIRST — eight things you must NOT do

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per CLAUDE.md § 0.5.
2. **Do NOT bump dependencies in feature PRs.**
3. **Do NOT add Sentry tag keys without updating all four artifacts.**
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** That's SB-2; owner-only.
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.**
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** [`docs/backlog/production-readiness.md`](backlog/production-readiness.md) is authoritative for the OPEN-ITEM list; [`docs/launch/definition-of-done.md`](launch/definition-of-done.md) is authoritative for what gates LAUNCH. #102 itself is CLOSED.
8. **NEW: Do NOT promote a POST-LAUNCH item to SHIP-BLOCKER without explicit owner decision.** Per AGENTS.md launch-scope Convention A. Adding a new SB-N to the DoD requires the owner's say-so plus a justification matching the hard test.

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 749 tests passing (post-PR #152).
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
```

Then read in order:

1. [`docs/launch/definition-of-done.md`](launch/definition-of-done.md) — **the launch list.** Know the 4 SHIP-BLOCKERS by name.
2. [`docs/backlog/production-readiness.md`](backlog/production-readiness.md) — the full open-item list with `**Bucket:**` lines.
3. This handoff § 6 — your first task.

---

## 4. Current state snapshot

### Open PRs: 0 (after THIS one merges).

### Open issues (post this PR's OWNER ACTIONS — owner closes #139/#140/#142 → 8 remaining)

| Tracker | Title | Bucket | Where covered |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) (closed; needs reopen) | Sentry alert provisioning | **SHIP-BLOCKER SB-2** | DoD § 2 SB-2 |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | POST-LAUNCH | DoD § 6 |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` cluster | POST-LAUNCH | DoD § 6 |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated retry job (W3) | POST-LAUNCH | DoD § 6 |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta delivery webhook (W4) | POST-LAUNCH | DoD § 6 |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | Immutability sentinel (W5) | POST-LAUNCH | DoD § 6 |
| [#151](https://github.com/cargotapan-collab/tac-express/issues/151) | proxy.ts cast cleanup | POST-LAUNCH | DoD § 6 |
| **[#153](https://github.com/cargotapan-collab/tac-express/issues/153)** | **W2 PR 2 — retry action** | **SHIP-BLOCKER SB-1** | **DoD § 2 SB-1 — NEXT SESSION** |
| [#154](https://github.com/cargotapan-collab/tac-express/issues/154) | RBAC auth-error sweep | POST-LAUNCH (pending OD-1) | DoD § 5 |

(Owner closes #139, #140, #142 per OWNER ACTIONS § 9 of the retro.)

### Backlog-only items (per [`production-readiness.md`](backlog/production-readiness.md))

| ID | Title | Bucket |
|---|---|---|
| **O3** | Sentry alert provisioning (= #94 work) | **SHIP-BLOCKER SB-2** |
| **D1** | PITR / database restore playbook | **SHIP-BLOCKER SB-3** |
| D2 | Upstash outage runbook | POST-LAUNCH |
| D3 | Monitoring dashboard URLs | POST-LAUNCH |
| D4 | WhatsApp rate-limit JSDoc | POST-LAUNCH |
| D5 | RELEASE-CHECKLIST.md | POST-LAUNCH |
| **E1 (carve-out)** | **Payment-recording E2E** | **SHIP-BLOCKER SB-4** |
| E1 (other 4) | Shipment / manifest / RBAC RLS / exception E2Es | POST-LAUNCH (pending OD-2) |
| X1, X2 | Form variant; on-call schedule | WONTFIX-WATCH (re-eval 2026-08-16) |

---

## 5. Critical context (the things that will trip you up)

### 5.1 — 5.12 (unchanged — see [prior handoff](../../docs/retros/2026-05-17-whatsapp-retry-ui.md) and historic context)

### 5.13 NEW: The Definition of Done is the launch authority

`docs/launch/definition-of-done.md` is THE answer to "what's left to launch?" The backlog file remains the full open-item list; the DoD file is the launch-gating triage of it. Every backlog item carries a `**Bucket:**` line classifying it as SHIP-BLOCKER (and which SB-N) / POST-LAUNCH / WONTFIX-WATCH.

When a SHIP-BLOCKER ships: update the DoD's § 3 status table. When the owner promotes a POST-LAUNCH item: update both files.

### 5.14 NEW: Two launch-scope conventions in AGENTS.md

- **A: Follow-up issues default to POST-LAUNCH.** Promotion requires explicit owner decision + a justification matching the hard test in DoD § 1.
- **B: OWNER ACTIONS block ends every handoff and every retro.** Single, numbered, copy-pasteable — owner-only chores get exactly one slot per session.

---

## 6. Your first task — RECOMMENDED: SB-1 (#153)

**The DoD § 4 burn-down order names SB-1 (#153) as the next session's lead.** Don't pick something else without owner override.

### SB-1 — [#153](https://github.com/cargotapan-collab/tac-express/issues/153) — failed-send retry action

**Why this first:** it is the smallest concrete SHIP-BLOCKER unit AND a direct continuation of PR #152. Every primitive needed already exists on main:

- `retryWhatsappSend(originalSendId)` service method — shipped in PR #141 (`packages/services/src/whatsapp-tracked.service.ts`)
- `FailedSendsTable` pure component — shipped in PR #152 (`packages/ui/src/components/composed/whatsapp/failed-sends-table.tsx`)
- `OpsWhatsAppFailedSendsLive` server wrapper — shipped in PR #152 (the role-gate + data fetch)

**Scope (from [#153](https://github.com/cargotapan-collab/tac-express/issues/153)):**

1. New `POST /api/whatsapp/retry-send` route at `apps/dashboard/app/api/whatsapp/retry-send/route.ts`. Body validation via zod (`{ originalSendId: UUID }`). Role-gated MANAGER+ via `getServerAuth` + `isManagerOrAbove`. Rate-limit guard: at most one in-flight retry per `original_send_id` (rejects if a `queued` attempt already exists for the same original).
2. New `<RetryButton />` cell in `FailedSendsTable`, MANAGER+ only (prop-drilled `canRetry: boolean` from the live wrapper — UI stays pure). Optimistic UI: button disables → toast → revalidate.
3. Tests: route happy-path / role-deny / in-flight-guard / validation-error / primitive-throws. Component renders-only-when-canRetry / calls-API-on-click / disables-during-inflight / toasts-on-error. E2E if cheap.

**Done = the DoD § 2 SB-1 testable criterion is met.**

**Bailout-seam pre-call:** PR 1 / PR 2 split for #153 itself is unlikely — the scope is bounded (one route + one button + the in-flight handling). If PHASE-A reveals the in-flight state is more than a simple `useState`, the natural seam is "ship the route + button with naive double-submit guard now; ship the optimistic-UI polish next." Probably won't fire.

### Alternative tasks (only if the owner overrides SB-1)

- **SB-3 (D1 PITR playbook)** — pure doc work; ~1-2 hours. Could ship same-day as SB-1 if both are quick. Decline if SB-1 expands.
- **SB-4 (payment-recording E2E)** — most setup-heavy; benefits from being later in the burn-down once SB-1 has reinforced the money-flow surface understanding.
- **SB-2 (#94)** — owner-only; not an agent task.

**Do not pick a POST-LAUNCH item.** That regenerates the maintenance loop the DoD was created to stop.

---

## 7. Cumulative discipline observations (carry-forward)

### 7.1 – 7.28 (unchanged — see prior handoffs)

### 7.29 NEW (this session): The hard test is the gate against scope creep

The bar for SHIP-BLOCKER is intentionally ruthless: data loss / security / money / broken-irrecoverable-journey / legal. Most "we should fix this" items don't meet it. The ruthlessness IS the value — without it the list re-bloats. When tempted to promote a POST-LAUNCH item, re-read DoD § 1; if the answer to the hard test is anything softer than "yes, definitely one of those five," the item stays POST-LAUNCH.

### 7.30 NEW (this session): One META PR can buy many feature-PRs of clarity

This session shipped no production code. The deliverable is one DoD file + one reconciliation doc + two conventions in AGENTS.md + a retro + this handoff. It cost a session. It returns the rest of the project's sessions to a closeable destination instead of an open-ended optimization. Same pattern as PR #126 (maximum-sweep) and PR #137 (102-revalidation) — META PRs that pay back across many subsequent sessions.

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

## 9. Key file locations (additions this PR — all docs/governance, zero production code)

```
docs/launch/definition-of-done.md                          # NEW — authoritative launch list (4 SBs)
docs/audits/2026-05-17-launch-reframe-triage.md            # NEW — full reconciliation + triage
docs/retros/2026-05-17-definition-of-done.md               # NEW — this session's retro
docs/NEXT-SESSION-HANDOFF.md                               # REPLACED — this file
docs/backlog/production-readiness.md                       # EDITED — added **Bucket:** lines + header note
AGENTS.md                                                  # EDITED — launch-scope authority + two conventions
```

---

## 10. The honest read

The project's engineering quality is genuinely strong. The problem was never quality — it was shape. Until today the launch was an open-ended optimization problem; today it's a 4-item burn-down. Four sessions of work (three agent + ~20 min owner) and the launch criteria are met. After that, the work shifts from "next backlog item" to "first customer."

**Recommended one-line summary for the next session's prompt:** "Pick up SB-1 from `docs/launch/definition-of-done.md` — the failed-send retry action (#153). Pattern-reuses PR #152 + PR #141. ONE PR. Decline any 'while we're here' expansion."

---

## 11. OWNER ACTIONS — before next session

Per AGENTS.md launch-scope Convention B (now codified). Numbered, copy-pasteable, single block:

1. **Close [#139](https://github.com/cargotapan-collab/tac-express/issues/139)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148) — the `shouldFallback` semantic-failure logic shipped + verified present on main.
2. **Close [#140](https://github.com/cargotapan-collab/tac-express/issues/140)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148) — the `||` baseURL coalesce shipped + verified present on main.
3. **Resolve [#142](https://github.com/cargotapan-collab/tac-express/issues/142)** — recommended: close it (read half shipped in PR #152; retry half = [#153](https://github.com/cargotapan-collab/tac-express/issues/153)). One-feature-one-open-issue convention.
4. **Reopen [#94](https://github.com/cargotapan-collab/tac-express/issues/94)** OR accept as tracker-less DoD item — owner-runnable Sentry provisioning remains (SB-2).
5. **Run SB-2** when convenient — `scripts/sentry/create-alert-rules.mjs` with a `project:write` Sentry token; deliberately trip one rule to verify end-to-end notification; update `docs/runbooks/sentry-alert-rules.md`.
6. **Delete the stuck `tac-whatsapp-sends-102/` directory** in the primary clone (`C:\tac\tac-express\tac-whatsapp-sends-102/`) — leftover worktree artifact, currently untracked and inert. (Also `.tmp/` if no longer needed.)
7. **Decide OD-1** — is [#154](https://github.com/cargotapan-collab/tac-express/issues/154) a SHIP-BLOCKER? Lean: POST-LAUNCH (refresh is acceptable). "Yes" adds SB-5; +1 session to burn-down.
8. **Decide OD-2** — should any of the other 4 E1 flows (shipment / manifest / RBAC RLS / exception) be SHIP-BLOCKERS? Lean: payment-only is sufficient. Each "yes" = +1 session.

**That's it. Eight owner actions, all listed. The agent's next-session work is SB-1 (#153). No other agent work is queued.**
