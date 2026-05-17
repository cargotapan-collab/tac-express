# Next-Session Handoff — Start Here

> **You are picking up TAC Express after SB-1 burned down.** The first DoD ship-blocker is closed. Three remain. Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last code commit on `main`:** PR closing [#153](https://github.com/cargotapan-collab/tac-express/issues/153) — `feat(ui+route): WhatsApp failed-send retry action (SB-1 / W2 PR 2)`.
**DoD authority:** [`docs/launch/definition-of-done.md`](launch/definition-of-done.md) v1.1 — **3 of 4 SHIP-BLOCKERS remain**.
**Date this doc was written:** 2026-05-17 (ninth substantive session today — SB-1 burn-down).
**Author of last session:** Claude Code (Opus 4.7) in Frontend-Architect + Designer primary + PM/CTO discipline.

---

## 1. CADENCE PRE-COMMIT — FOURTEEN substantive PRs old, still holds

Zero "while we're here" expansion fired in this session despite five named bundle temptations from the brief (automated retry / rebuild PR #152 components / mutation logic in packages/ui / styling shortcut / defer idempotency). All five resisted. Money-flow safety shipped IN scope.

**The DoD discipline:** SB-1 closed; SB-2/3/4 untouched (they are SHIP-BLOCKER-already, not bundle candidates). The next session is SB-3 only.

---

## 2. READ THIS FIRST — eight things you must NOT do

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per CLAUDE.md § 0.5.
2. **Do NOT bump dependencies in feature PRs.**
3. **Do NOT add Sentry tag keys without updating all four artifacts.**
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** That's SB-2; owner-only.
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.** (The new `retry-send` route is the FOURTH pino-migrated route.)
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** Use the DoD file (launch-gating) + backlog file (open-item list).
8. **Do NOT promote a POST-LAUNCH item to SHIP-BLOCKER without explicit owner decision.** Per AGENTS.md Convention A. The launch scope only grows by owner promotion + justification matching the hard test.

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 762 tests passing (post-this-PR; +13 from SB-1).
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
```

Then read in order:

1. [`docs/launch/definition-of-done.md`](launch/definition-of-done.md) — **the launch list.** SB-1 done; SB-3 is next.
2. This handoff § 6 — your first task (SB-3 PITR playbook).
3. [`docs/backlog/production-readiness.md`](backlog/production-readiness.md) — full open-item list (POST-LAUNCH items parked).

---

## 4. Current state snapshot

### Open PRs: 0 (after this one merges).

### DoD status (post this PR)

| # | SHIP-BLOCKER | Status | Estimate |
|---|---|---|---|
| ~~SB-1~~ | ~~Failed-send retry action ([#153](https://github.com/cargotapan-collab/tac-express/issues/153))~~ | **DONE** | — |
| **SB-2** | Sentry alert notification action ([#94](https://github.com/cargotapan-collab/tac-express/issues/94) / O3) | OPEN — owner-only | ~20 min owner |
| **SB-3** | PITR / database restore playbook (D1) | OPEN — agent-actionable, RECOMMENDED NEXT | 1-2 hours |
| **SB-4** | Payment-recording E2E (E1 carve-out) | OPEN — agent-actionable | 1 session |

**3 of 4 SHIP-BLOCKERS remain.** Realistic burn-down: 2-3 sessions remaining.

### Open issues (post-this-PR — owner closes #142 + #153 in addition to the existing #139 #140 #94 carry-forward)

| Tracker | Title | Bucket |
|---|---|---|
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | POST-LAUNCH |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` cluster | POST-LAUNCH |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated retry job (W3) | POST-LAUNCH |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta delivery webhook (W4) | POST-LAUNCH |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | Immutability sentinel (W5) | POST-LAUNCH |
| [#151](https://github.com/cargotapan-collab/tac-express/issues/151) | proxy.ts cast cleanup | POST-LAUNCH |
| [#154](https://github.com/cargotapan-collab/tac-express/issues/154) | RBAC auth-error sweep | POST-LAUNCH (pending OD-1) |

---

## 5. Critical context

### 5.1 – 5.14 (unchanged — see prior handoffs + DoD)

### 5.15 NEW: SB-1 shipped; W2 fully DONE

`/ops-console/whatsapp/failed-sends` is now a complete operator triage surface. MANAGER+ can SEE failed sends AND retry message-type failures. Three safety layers (service guards / route guards / UI in-flight lock) cover the realistic double-send surface. List query filters out superseded rows automatically. **W2 in the backlog file is DONE.**

V1 scope cut: template-message retries disabled with explanatory tooltip — they need `templateLanguage` metadata not stored on `whatsapp_sends`. POST-LAUNCH follow-up.

### 5.16 NEW: invoice-replay-payload builders extracted

`packages/services/src/whatsapp/invoice-replay-payload.ts` is the shared module — both `send-invoice/route.ts` and `retry-send/route.ts` import `buildInvoiceMessage`, `buildInvoiceTemplateComponents`, and `InvoiceLike` from there. Catalog #9 second-consumer pattern. Future invoice-WhatsApp consumers go through this module.

### 5.17 NEW: `getWhatsappSendById` service method

Tiny read-by-id method on `createTrackedWhatsAppService`. Returns null for missing-or-RLS-hidden rows (same privacy posture as the wrapper's internal retry lookup). Used by the retry route's pre-flight check; available to future consumers.

### 5.18 NEW: listFailedWhatsappSends leaf-filtering (two-query)

The query is no longer a single `WHERE status='failed'`. It runs a candidate query (2× overfetch) + a descendant query (which candidate ids are referenced as `original_send_id` by any row) + filter + final cap. A successfully-retried failed row drops off the list automatically.

---

## 6. Your first task — RECOMMENDED: SB-3 (D1 PITR playbook)

**The DoD § 4 burn-down order names SB-3 as the next agent session's lead** (SB-2 is owner-async; SB-4 is a heavier session that benefits from being later).

### SB-3 — PITR / database restore playbook (backlog D1)

**Why it gates launch:** Data-loss recovery procedure must exist BEFORE the incident, not Googled DURING it. Supabase has PITR; the steps to invoke it must be documented + the auth path named + an RTO target stated.

**Testable DONE criterion (from DoD § 2 SB-3):**
- `docs/runbooks/DATABASE-RESTORE.md` exists.
- Names Supabase PITR explicitly (link to current Supabase PITR docs URL).
- Documents the auth path (which dashboard, which project id, what permission required).
- Walks the exact steps for two scenarios:
  - (a) full project recovery to a point-in-time
  - (b) single-table restore from a backup
- Names an explicit RTO target (e.g., "PITR restore RTO ≤ 4 hours from incident detection").
- Notes a dry-run walkthrough (don't execute against production; walk the steps against staging or against the docs/UI to confirm validity).

**Estimate:** 1-2 hours. Pure doc work. Owner can review independently of any code change.

**Pattern reuse:** the existing `docs/PRODUCTION-RUNBOOK.md` has the operational-doc shape; the new file lives in `docs/runbooks/` alongside `sentry-alert-rules.md`. No new docs-area structure needed.

### Alternative tasks (only if the owner overrides SB-3)

- **SB-4 (payment-recording E2E)** — heavier session; Playwright e2e wiring for authenticated dashboard flow + form-state + DB cleanup. ~1 session.
- **SB-2 (#94)** — owner-only; not an agent task.

**Do not pick a POST-LAUNCH item.** That regenerates the maintenance loop the DoD was created to stop.

---

## 7. Cumulative discipline observations (carry-forward)

### 7.1 – 7.35 (see prior retros)

### 7.36 NEW (this session): The brief naming the seam pays back

PHASE-0 § B was explicit about the list-query staleness bug a retry would surface. Pre-warned → contained 30-LoC fix + 4 tests, all in the same PR as the feature. Without the pre-warning, this would have been a "we'll discover this in production via duplicate WhatsApp sends" pattern. **Pattern: when a brief writes the bailout/seam clause carefully, the bailout doesn't need to fire — the seam becomes a checklist item, not an obstacle.**

### 7.37 NEW (this session): Layered defense in a money-flow surface ships INSIDE the PR

Five named anti-patterns in the brief, all resisted. The non-obvious one was "defer the idempotency guards as a follow-up." A retry button that CAN spam a customer is not shippable. The layered approach (service + route + UI) is now the template for any future operator-mutation surface that touches money. Recorded as discipline rule.

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
# Service test floors:
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts
pnpm vitest run packages/services/src/__tests__/shipment.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp-tracked.service.test.ts   # NOW 44 cases (incl. +3 getWhatsappSendById + 4 leaf-filtering)
pnpm vitest run packages/services/src/__tests__/manifest.service.test.ts
# Sentinels:
pnpm vitest run apps/dashboard/__tests__/backlog-refs-drift.test.ts
pnpm vitest run apps/dashboard/__tests__/audit-doc-references.test.ts
pnpm vitest run apps/dashboard/__tests__/api-routes-no-console.test.ts
pnpm vitest run apps/dashboard/__tests__/rbac-block-adoption.test.ts
pnpm vitest run packages/services/src/__tests__/silent-by-design.test.ts
pnpm vitest run packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
# New / extended UI tests this PR:
pnpm vitest run packages/ui/src/components/composed/whatsapp/whatsapp-retry-button.test.tsx
pnpm vitest run packages/ui/src/components/composed/whatsapp/failed-sends-table.test.tsx
node scripts/ci-watch-pr.mjs <pr-number>
```

---

## 9. Key file locations (additions / extensions this PR)

```
# NEW pure UI
packages/ui/src/components/composed/whatsapp/whatsapp-retry-button.tsx
packages/ui/src/components/composed/whatsapp/whatsapp-retry-button.test.tsx

# NEW service module + method
packages/services/src/whatsapp/invoice-replay-payload.ts
packages/services/src/whatsapp-tracked.service.ts  # + getWhatsappSendById + leaf-filtering

# NEW API route
apps/dashboard/app/api/whatsapp/retry-send/route.ts

# NEW client wrapper (per-row in-flight state)
apps/dashboard/app/ops-console/whatsapp/failed-sends/ops-whatsapp-failed-sends-client.tsx

# Decision doc + retro
docs/decisions/2026-05-17-whatsapp-retry-action.md
docs/retros/2026-05-17-whatsapp-retry-action.md

# Updated governance
docs/launch/definition-of-done.md     # v1.1: SB-1 DONE; 4 → 3
docs/backlog/production-readiness.md  # W2 DONE
```

---

## 10. The honest read

SB-1 closed. The W2 surface is now an operator-complete triage + recovery loop for direct-mode WhatsApp failures. Money-flow safety is shipped (three layers, not deferred). The next agent session burns SB-3 (PITR playbook). Three SBs remain; realistic 2-3 sessions to launch.

**Recommended one-line summary for the next session's prompt:** "Pick up SB-3 (D1 PITR playbook) from `docs/launch/definition-of-done.md`. Pure doc work in `docs/runbooks/DATABASE-RESTORE.md`. ~1-2 hours. ONE PR. Decline any 'while we're here' expansion."

---

## 11. OWNER ACTIONS — before next session

Per AGENTS.md launch-scope Convention B. Numbered, copy-pasteable, single block. Carries forward unresolved items from PR #155's owner block, adds this session's two:

1. **Close [#142](https://github.com/cargotapan-collab/tac-express/issues/142)** — fully shipped (W2 PR 1 + this PR = both halves done).
2. **Close [#153](https://github.com/cargotapan-collab/tac-express/issues/153)** — closes when this PR merges (close-link in PR body).
3. **Close [#139](https://github.com/cargotapan-collab/tac-express/issues/139)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148). (Still pending from PR #155 OWNER ACTIONS.)
4. **Close [#140](https://github.com/cargotapan-collab/tac-express/issues/140)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148). (Still pending.)
5. **Reopen [#94](https://github.com/cargotapan-collab/tac-express/issues/94)** OR accept as tracker-less DoD item (SB-2 owner-runnable). (Still pending.)
6. **Run SB-2** when convenient — `scripts/sentry/create-alert-rules.mjs` + verify one rule fires end-to-end + update `docs/runbooks/sentry-alert-rules.md`. (Still pending.)
7. **Delete the stuck `tac-whatsapp-sends-102/` directory** in the primary clone. (Still pending.)
8. **Decide OD-1** — is [#154](https://github.com/cargotapan-collab/tac-express/issues/154) a SHIP-BLOCKER? Lean POST-LAUNCH. (Still pending.)
9. **Decide OD-2** — should any of the other 4 E1 flows be SHIP-BLOCKERS? Lean payment-only sufficient. (Still pending.)

**That's it. Nine owner actions, all listed. Next agent session burns SB-3.**
