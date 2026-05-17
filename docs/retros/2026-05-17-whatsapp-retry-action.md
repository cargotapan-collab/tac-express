# Retro — WhatsApp failed-send retry action (SB-1 / #153 / W2 PR 2)

**PR:** TBD (this PR). **Closes:** [#153](https://github.com/cargotapan-collab/tac-express/issues/153) (W2 PR 2) and DoD SB-1.
**Type:** SHIP-BLOCKER burn-down — **first SB closed**. DoD count: 4 → 3.
**Role:** Frontend Architect + Designer primary; PM + CTO discipline throughout.
**Branch:** `feat/whatsapp-retry-action-153` from main `4ce8156`.
**Predecessor PRs:** #141 (`retryWhatsappSend` primitive + row model), #152 (W2 read half), #155 (DoD framing).

---

## 1. TL;DR

Operators with role MANAGER+ on `/ops-console/whatsapp/failed-sends` can now retry any failed `sendmessage` (direct-mode) WhatsApp send via a pure TAC-Orbital-compliant button wired through a role-gated API route to the existing `retryWhatsappSend` service method. Layered safety (service guards + route guards + UI in-flight lock) prevents unintended re-sends. The failed-sends list query was adjusted to filter superseded rows, fixing a money-flow correctness bug surfaced by the retry action (already-retried rows would otherwise stay in the list and invite double-sends).

**Tests:** 749 → 762 (+13 net). **All 8 load-bearing CI gates green locally.**

---

## 2. PHASE-0 decision (A–E summary)

Full decision doc: [`docs/decisions/2026-05-17-whatsapp-retry-action.md`](../decisions/2026-05-17-whatsapp-retry-action.md).

| § | Decision |
|---|---|
| **A. Retry action path** | Pure button (packages/ui) → client wrapper (apps/dashboard) → POST /api/whatsapp/retry-send → retryWhatsappSend (packages/services). Each layer's responsibility named. |
| **B. List coherence after retry** | Query adjusted to "leaf failed rows only" — two-query pattern: candidates with 2× overfetch + descendant lookup + filter + cap. Fixes the staleness bug that would otherwise invite double-sends. |
| **C. Per-row in-flight** | Client-side Map keyed by row id; per-row disabled+loading state; multiple distinct rows retry independently; same row cannot double-retry. ARIA: aria-busy + aria-disabled; status never color-only. |
| **D. Feedback** | Inline functional feedback per TAC Orbital — success drops row off the list (router.refresh + leaf-filter); failure shows inline error text + destructive border. No toasts. |
| **E. Idempotency + safety (money-flow crux)** | Layered: service guards (status='failed' + endpoint match) + route guards (MANAGER+ + kill-switch + rate-limit + invoice-linkage + sendmessage-only V1 scope) + UI in-flight lock. Bailout condition: no need for a dedicated idempotency-key store yet — the service-layer status guard fires deterministically against the original_send_id. |

### V1 scope cut (documented in PHASE-0 § A)

Template-message retries (`sendtemplatemessage`) disabled with explanatory tooltip ("Template retries: re-send from the invoice detail page."). Reason: `templateLanguage` is not persisted on `whatsapp_sends`. POST-LAUNCH follow-up.

---

## 3. What shipped vs what was extended

| Layer | NEW | EXTENDED |
|---|---|---|
| Pure UI | `WhatsAppRetryButton` + its test | `FailedSendsTable` + its test (opt-in `retryConfig` prop) |
| Page-shape view | — | `OpsWhatsAppFailedSendsView` (forwards optional `retryConfig`) |
| App composition | `ops-whatsapp-failed-sends-client.tsx` (`"use client"`; per-row in-flight state + router.refresh()) | `ops-whatsapp-failed-sends-live.tsx` (renders client wrapper with `canRetry`) |
| API route | `POST /api/whatsapp/retry-send` | — |
| Service | `getWhatsappSendById` method | `listFailedWhatsappSends` (leaf-filtering) |
| Shared (catalog #9 extraction) | `packages/services/src/whatsapp/invoice-replay-payload.ts` with `buildInvoiceMessage` + `buildInvoiceTemplateComponents` + `InvoiceLike` | `send-invoice/route.ts` (refactored to import from extracted module; zero behavior change) |

---

## 4. Idempotency / safety attestation

The retry surface is money-flow per [AGENTS.md § 7a](../../AGENTS.md). The layered defense in PHASE-0 § E is verified end-to-end:

- **Service layer** (PR #141, on main): `retryWhatsappSend` rejects (returns `ok:false`, no INSERT, no underlying send) when row missing / status != 'failed' / endpoint mismatches the replay payload.
- **Route layer** (this PR): MANAGER+ role-gate + `WHATSAPP_ENABLED` kill switch + Upstash rate-limit + invoice still readable + invoice_id is not null + endpoint is `sendmessage`. Each guard returns a clear structured error.
- **UI layer** (this PR): per-row in-flight Map; button disabled while in-flight; `onClick` short-circuits if already in-flight (double-defense against assistive-tech paths that bypass `disabled`).

**Double-send scenarios prevented:**
- Operator double-click → in-flight lock fires; second click is a no-op.
- Network blip → browser retries POST → service's status='failed' guard fires on the second request (the first attempt's INSERT is already visible to the second; either it's `queued` so the second is for a "status now queued" row → rejected, or completed so the second is for a "status now sent/failed" row that doesn't match the expected target).
- Concurrent operators clicking same row → first POST's INSERT shifts the row's status → second POST sees not-failed → rejected.

No dedicated idempotency-key store added — the service guard's deterministic behavior covers the realistic surface. POST-LAUNCH if double-send incidents are observed.

---

## 5. Design-system attestation (TAC Express v5.0 Violet Grid)

- **LAW 14 (no rebuild):** `WhatsAppRetryButton` wraps the existing shadcn `<Button>` primitive — `variant=outline` for idle, `variant=ghost` for disabled. Zero replicated button styling.
- **LAW 2 (icons):** `@workspace/ui/icons` only — `refresh` + `loader` via the `Icon` component.
- **LAW 10 (no Tailwind color classes):** zero. Semantic tokens only (`text-destructive`, `text-foreground`, `text-muted-foreground`, `border-destructive/40`). Negative-asserted in the button test: `expect(allClasses).not.toMatch(/\bbg-red-\d+\b/)` plus three more.
- **LAW 11 (no arbitrary values):** zero `w-[..]` / `p-[..]` / `text-[..]`.
- **LAW 13 (radius):** inherits `rounded-[var(--radius-sm)]` from the Button primitive; no `rounded-*` added.
- **LAW 5 (UI in packages/ui only):** all reusable UI in `packages/ui/src/components/composed/whatsapp/`. The client wrapper in apps/dashboard is page-specific composition + mutation glue, not reusable UI.
- **LAW 6 / LAW 7 (no DB / no business logic in UI):** button is pure (props in, callback out); table is pure; client wrapper owns the mutation logic and lives in apps/.
- **LAW 3 (animation):** `motion/react` not added — the `animate-spin` utility on the loader icon is the project's existing tw-animate-css pattern (no new animation library, no new keyframes).
- **LAW 12 (pnpm):** zero new dependencies added.

---

## 6. Data-flow attestation

```
[OpsWhatsAppFailedSendsLive] (server)
   ├─ getServerAuth + isManagerOrAbove → captureRbacDenial on denial
   └─ listFailedWhatsappSends({ sinceDays: 7 })  ← NEW: leaf-filtered query
        └─ <OpsWhatsAppFailedSendsClient initialRows canRetry>  (client)
             ├─ per-row in-flight Map + lastError Map
             ├─ onRetry → fetch POST /api/whatsapp/retry-send
             │             ├─ MANAGER+ gate + kill switch + rate-limit
             │             ├─ getWhatsappSendById(originalSendId)  ← NEW service method
             │             ├─ getInvoiceById(invoice_id)
             │             ├─ buildInvoiceMessage(invoice)         ← extracted helper
             │             └─ retryWhatsappSend(originalSendId, replayPayload)
             │                   ├─ Layer-1 guards (status/endpoint)
             │                   ├─ INSERT new attempt row
             │                   └─ underlying svc.sendMessage()
             └─ on ok=true → router.refresh()  → list reloads → superseded row drops
```

No business logic in any UI component. No DB call in any UI component. The button is `<button>` + `<span>` + `<Icon>` — that's it.

---

## 7. Discipline observations

### 7.31 NEW (this session): Catalog #9 second-consumer extraction was the right call here

The send-invoice route's `buildInvoiceMessage` + `buildTemplateComponents` + `InvoiceLike` were inline since PR #141. This session added the second consumer (the retry route). Catalog #9 (abstract on second use): extraction warranted. The seam was bounded — move the functions + the interface to `packages/services/src/whatsapp/invoice-replay-payload.ts`, refactor send-invoice route to import from there, retry route imports too. Zero behavior change at the send-invoice route. The shared module gives both consumers the SAME payload for the SAME invoice, which is exactly the determinism the retry path needs.

### 7.32 NEW (this session): The brief named the staleness bug — and it was real

PHASE-0 § B was explicit: check what PR #152's list query actually returns after a retry. Confirmed: it would leave superseded failed rows in the list. The fix (two-query leaf-only filter) was contained — one method, +~30 LoC, +4 tests. The brief's PHASE-0 prompt naming the seam ahead of time made this a mechanical check + fix instead of a "we'll discover this in production" surprise.

### 7.33 NEW (this session): Five named bundle-temptations from the brief — all resisted

1. **Building automated/background retry** — that's #143, POST-LAUNCH, separate session. Resisted.
2. **Rebuilding the failed-sends page or list components** — extended via opt-in `retryConfig` prop instead. Resisted.
3. **Mutation logic inside packages/ui button** — kept pure; client wrapper in apps/ owns state. Resisted.
4. **Styling shortcut (one bg-* / one arbitrary value)** — zero. Negative-asserted in the button test. Resisted.
5. **Deferring idempotency guards as a follow-up** — all three layers shipped THIS PR. Resisted.

The "additional smell" temptation: opening a follow-up issue to file template-retry support. Filed inline as a known V1 scope cut + documented in the PR body — does NOT need a separate issue per Convention A (it's POST-LAUNCH by default). Resisted.

### 7.34 NEW (this session): Cadence pre-commit holds at FOURTEEN substantive PRs

Eight substantive PRs in the last day (#141 #146-150 #152 #155). This PR makes nine in 24h, fourteen substantive in the arc. Zero "while we're here" expansion fired despite the temptation to also touch #131 (branded-type cluster — close cousin) or #154 (RBAC auth-error sweep — adjacent surface). Both stay POST-LAUNCH.

### 7.35 NEW (this session): SB-1 closing is the first DoD burn-down

Per [`docs/launch/definition-of-done.md`](../launch/definition-of-done.md) v1.1: 4 → 3 ship-blockers. The launch run is real and measurable; the next agent session burns SB-3 (PITR playbook — pure doc work, ~1-2 hours).

---

## 8. CodeRabbit catalog preemption

All 9 catalog entries reviewed; applicable ones preempted:

- **#1 (value-contract):** route tests would assert structured value emissions if we had route tests; service tests assert `select` projection + `eq` predicate + `limit` arg values.
- **#2 (toHaveBeenNthCalledWith + Times):** the leaf-filtering tests assert the second `.from("whatsapp_sends")` call's projection (`select("original_send_id")`) AND the descendant filter shape.
- **#5 (no hardcoded line numbers):** every cross-reference uses symbol names (`buildInvoiceMessage`, `listFailedWhatsappSends`, etc.) — zero `line 189`-style refs.
- **#7 (generalize regex):** negative-asserts on tokens use `\bbg-red-\d+\b` not specific token literals.
- **#8 (enum exhaustiveness):** `WhatsAppSendStatus` exhaustiveness sentinel (PR #141) still fires — no new statuses added.
- **#9 (abstract on second use):** `invoice-replay-payload.ts` extraction is the textbook second-consumer trigger (send-invoice = first, retry-send = second).
- **#3 / #4 / #6:** N/A (no filesystem invariants / no file-text marker assertions / sweep-the-block applied across the four failed-sends-table tests).

---

## 9. Files (this PR)

```
NEW   packages/services/src/whatsapp/invoice-replay-payload.ts
NEW   apps/dashboard/app/api/whatsapp/retry-send/route.ts
NEW   apps/dashboard/app/ops-console/whatsapp/failed-sends/ops-whatsapp-failed-sends-client.tsx
NEW   packages/ui/src/components/composed/whatsapp/whatsapp-retry-button.tsx
NEW   packages/ui/src/components/composed/whatsapp/whatsapp-retry-button.test.tsx
NEW   docs/decisions/2026-05-17-whatsapp-retry-action.md
NEW   docs/retros/2026-05-17-whatsapp-retry-action.md  (this file)

EDIT  packages/services/package.json
        (export: ./whatsapp/invoice-replay-payload)
EDIT  packages/services/src/whatsapp-tracked.service.ts
        (+ getWhatsappSendById; leaf-filtering in listFailedWhatsappSends)
EDIT  packages/services/src/__tests__/whatsapp-tracked.service.test.ts
        (+ 3 getWhatsappSendById tests; +4 leaf-filtering tests; minor adjusts)
EDIT  apps/dashboard/app/api/whatsapp/send-invoice/route.ts
        (import builders from extracted module; remove inline copies)
EDIT  apps/dashboard/app/ops-console/whatsapp/failed-sends/ops-whatsapp-failed-sends-live.tsx
        (render client wrapper with canRetry)
EDIT  packages/ui/src/components/composed/whatsapp/failed-sends-table.tsx
        (+ opt-in retryConfig prop renders Retry column)
EDIT  packages/ui/src/components/composed/whatsapp/failed-sends-table.test.tsx
        (+ 4 retry-column tests; 9 total)
EDIT  packages/ui/src/components/composed/ops-console/pages/ops-whatsapp-failed-sends-view.tsx
        (forward optional retryConfig)
EDIT  docs/backlog/production-readiness.md
        (W2 → DONE; new refs)
EDIT  docs/launch/definition-of-done.md
        (SB-1 DONE; 4 → 3; burn-down order updated)
EDIT  docs/NEXT-SESSION-HANDOFF.md
        (replaced; § 6 names SB-3 as next lead)
```

---

## 10. Carry-forward

- **Next agent session:** SB-3 (D1 PITR / database restore playbook). ~1-2 hours of doc work. Per DoD § 4 burn-down order.
- **Convention A:** the template-retry V1 scope cut is POST-LAUNCH by default. No follow-up issue filed (Convention A: default POST-LAUNCH; promote only by explicit owner decision).
- **Convention B:** OWNER ACTIONS block ends this retro (§ 11) and the next handoff.
- **Cadence:** still no double-PR-per-substantive-session pressure; if owner wants SB-3 same day, that's the owner's call (the burn-down is per-session, not per-day).

---

## 11. OWNER ACTIONS — before next session

Per AGENTS.md launch-scope Convention B. Numbered, copy-pasteable, single block. Carries forward the still-unresolved items from PR #155's owner block plus what this session surfaces:

1. **Close [#142](https://github.com/cargotapan-collab/tac-express/issues/142)** — fully shipped (W2 PR 1 + this PR = both halves done).
2. **Close [#153](https://github.com/cargotapan-collab/tac-express/issues/153)** — closes when this PR merges (the close-link in the PR body).
3. **Close [#139](https://github.com/cargotapan-collab/tac-express/issues/139)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148). (Carried from #155 OWNER ACTIONS — still pending.)
4. **Close [#140](https://github.com/cargotapan-collab/tac-express/issues/140)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148). (Carried from #155 OWNER ACTIONS — still pending.)
5. **Reopen [#94](https://github.com/cargotapan-collab/tac-express/issues/94)** OR accept as tracker-less DoD item (SB-2 remains owner-runnable). (Carried.)
6. **Run SB-2** when convenient — `scripts/sentry/create-alert-rules.mjs` + verify one rule fires end-to-end + update `docs/runbooks/sentry-alert-rules.md`. (Carried.)
7. **Delete the stuck `tac-whatsapp-sends-102/` directory** in the primary clone (`C:\tac\tac-express\tac-whatsapp-sends-102/`). (Carried.)
8. **Decide OD-1** — is [#154](https://github.com/cargotapan-collab/tac-express/issues/154) a SHIP-BLOCKER? (Carried.)
9. **Decide OD-2** — should any of the other 4 E1 flows be SHIP-BLOCKERS? (Carried.)

Nothing else from this session is an owner action. Next agent-actionable work is SB-3 (PITR playbook).
