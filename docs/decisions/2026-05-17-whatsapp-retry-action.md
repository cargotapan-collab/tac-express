# PHASE-0 — WhatsApp failed-send retry action (SB-1 / #153 / W2 PR 2)

**Date:** 2026-05-17
**Closes:** [SB-1 in DoD](../launch/definition-of-done.md#sb-1--failed-send-retry-action-153) / [#153](https://github.com/cargotapan-collab/tac-express/issues/153) / backlog [W2 (PR 2)](../backlog/production-readiness.md#w2--operator-retry-ui-for-failed-whatsapp-sends).
**Predecessor:** [PR #152](https://github.com/cargotapan-collab/tac-express/pull/152) (W2 read half — visibility view). This PR is the write half.
**Builds on:** [PR #141 — `retryWhatsappSend` primitive](https://github.com/cargotapan-collab/tac-express/pull/141) + [`docs/decisions/2026-05-17-whatsapp-sends-mechanism.md`](2026-05-17-whatsapp-sends-mechanism.md) (append-only-per-attempt row model).

---

## A. Retry action path

The flow is strictly layered — pure UI emits an intent; apps/ owns the mutation; packages/services owns the side effect.

```
[ Pure button — packages/ui ]
   |  onRetry(row)          (callback emitted to caller)
   v
[ Client wrapper — apps/dashboard ]
   |  fetch POST /api/whatsapp/retry-send { originalSendId }
   v
[ Route — apps/dashboard ]
   |  - role-gate (MANAGER+) mirroring send-invoice
   |  - read failed row via service (RLS-checked)
   |  - load invoice via existing invoice service
   |  - reconstruct replay payload via the EXTRACTED builders
   |  - call retryWhatsappSend(originalSendId, replayPayload)
   v
[ Service — packages/services ]
   |  retryWhatsappSend (already shipped, PR #141):
   |  - read original row, verify status='failed' and endpoint matches
   |  - INSERT new attempt row (attempt_no = previous + 1, original_send_id = previous.id)
   |  - call underlying svc.sendMessage / svc.sendTemplate
   |  - UPDATE new row with outcome
   v
[ Route ]
   |  return { ok: true, newSendId } or { ok: false, error }
   v
[ Client wrapper ]
   |  router.refresh()       (server-side re-fetch → list updates)
```

**File-level placement:**

| Layer | File | New / extended |
|---|---|---|
| Pure UI button | `packages/ui/src/components/composed/whatsapp/whatsapp-retry-button.tsx` | NEW |
| Pure UI button test | `packages/ui/src/components/composed/whatsapp/whatsapp-retry-button.test.tsx` | NEW |
| Pure table (extended) | `packages/ui/src/components/composed/whatsapp/failed-sends-table.tsx` | EXTENDED — optional `retryConfig` prop; tests extended |
| Client wrapper (apps/) | `apps/dashboard/app/ops-console/whatsapp/failed-sends/ops-whatsapp-failed-sends-client.tsx` | NEW (`"use client"`) |
| Server live (extended) | `apps/dashboard/app/ops-console/whatsapp/failed-sends/ops-whatsapp-failed-sends-live.tsx` | EXTENDED — passes `canRetry` + renders the client wrapper instead of the view directly |
| Route | `apps/dashboard/app/api/whatsapp/retry-send/route.ts` | NEW |
| Route tests | `apps/dashboard/app/api/whatsapp/__tests__/retry-send-route.test.ts` | NEW |
| Replay-payload builders (extracted) | `packages/services/src/whatsapp/invoice-replay-payload.ts` | NEW (extraction; catalog #9 second-consumer pattern) |
| send-invoice route (refactored) | `apps/dashboard/app/api/whatsapp/send-invoice/route.ts` | EXTENDED — imports `buildInvoiceMessage` + `buildTemplateComponents` + `InvoiceLike` from the extracted module instead of inline functions. Zero behavior change. |

The pure button is `<WhatsAppRetryButton row={…} canRetry={…} isInflight={…} lastError={…} onRetry={…} />` — no fetch, no business logic. The client wrapper holds the per-row in-flight Map + lastError Map and owns the API call.

## B. Post-retry state + list coherence

**The row model (per [decision § A](2026-05-17-whatsapp-sends-mechanism.md)):** append-only-per-attempt. A retry creates a NEW `whatsapp_sends` row with `attempt_no = previous + 1` and `original_send_id = previous.id`. The original failed row is NEVER mutated.

**The staleness bug in PR #152's query (verified):** `listFailedWhatsappSends` currently selects `WHERE status='failed' AND completed_at >= now() - 7d`. After a retry:
- if retry SUCCEEDS → new row has `status='sent'` → the original failed row STAYS in the list (it's still `status='failed'`)
- if retry FAILS again → two failed rows for the same logical send

Operator-visible: the failed-sends list shows the original even after a successful retry. Bad UX, but worse — it invites the operator to retry AGAIN, double-sending the customer. **This is a money-flow correctness bug surfaced by the retry action and MUST be fixed in this PR.**

**The fix:** filter to LEAF failed rows only — a failed row is shown only when no other row points to it as `original_send_id`. This correctly handles:
- Successful retry: original has a descendant → filtered out (and descendant is `sent` → also filtered by the `status='failed'` clause)
- Failed retry: original has a descendant → filtered out (descendant is `failed` + no descendant of its own → shown as the latest failed attempt for that logical send)
- Multi-attempt chains: only the most recent leaf shows

**Implementation:** PostgREST doesn't support correlated NOT EXISTS subqueries directly, but the two-query pattern is bounded:
1. Get candidate failed rows (existing query; double the limit to absorb filtered-out rows).
2. Get the set of `original_send_id` values from any rows that point INTO that candidate set.
3. Filter candidates whose `id` appears in that set.

At a 50-row cap, both queries return tiny result sets; one extra round-trip per page render.

**Operator-visible behavior:**
- On retry SUCCESS → router.refresh() → row drops off the failed list.
- On retry FAILURE → router.refresh() → row stays (or is replaced by the new failed attempt with `attempt_no = N+1`); inline error indicator shown for the operator to see what happened.

## C. In-flight / loading / disabled

The retry button has three orthogonal states per row:

| State | What | Source |
|---|---|---|
| `canRetry` | Is this row in principle retryable? | Server-side: `true` if `invoice_id IS NOT NULL` AND the caller has MANAGER+ role. Passed once from the server wrapper to the client wrapper. Constant across the page lifecycle. |
| `isInflight` | Is THIS row currently being retried? | Client-side Map keyed by row id; set on click, cleared on response. |
| `lastError` | Did the LAST retry attempt fail with a structured error? | Client-side Map keyed by row id; set on response; cleared on next click. |

Multiple distinct rows can be retried independently (separate Map entries). The same row cannot be double-retried: click → `isInflight=true` → button disabled until response → `isInflight=false`. The client wrapper short-circuits any additional click while `isInflight` is true (double-defense against the disabled-but-still-clickable race in fast browsers).

ARIA / a11y: `aria-busy={isInflight}`, `aria-disabled={!canRetry || isInflight}`, screen-reader-visible label that reflects the state. The status is conveyed by both text label + icon — never by color alone.

## D. Retry result feedback

Per TAC Orbital (mission-control, functional, anti-decorative): feedback is INLINE on the row, not a toast.

- **Default state:** retry button with icon + "Retry" label.
- **In-flight:** spinner icon + "Retrying…" label. Button disabled.
- **Success:** router.refresh() removes the row from the list — the disappearance IS the success signal (the row is no longer a failed send). No persistent indicator needed.
- **Failure:** error icon + small inline error text below the button cell (truncated to 80 chars; full text in `title=` per the existing failed-sends-table pattern). Button re-enables for another attempt.

A toast / banner would be decorative noise on a mission-control surface. The row IS the result indicator.

**Semantic tokens used (all from `globals.css`, no new tokens needed):**
- Default: `text-foreground` + `border-border`
- In-flight: `text-muted-foreground` (animated spinner via `motion/react`)
- Error: `text-destructive` + `border-destructive/40`

If, during implementation, a needed state has no existing semantic token, I will add one narrowly-named to globals.css (e.g., `--accent-retry` style) — NEVER a Tailwind color class.

## E. Idempotency + safety (the money-flow crux)

Layered defense — each layer is independently sufficient for its narrowest failure mode; together they cover the realistic attack surface:

### Layer 1 — Service guards (already shipped in PR #141, verified on main)

`retryWhatsappSend` already rejects (returns `{ ok: false, error: ... }`, no INSERT, no underlying send) when:
- Row not found (or RLS-hidden — same response, correct privacy posture).
- Row `status !== 'failed'` (a `queued` or `sent` row cannot be retried).
- `replayPayload.endpoint !== origRow.endpoint` (caller can't switch a message-failure into a template-send under the guise of "retry").

These are the LOAD-BEARING guards. The route layer trusts them.

### Layer 2 — Route guards (new in this PR)

The new POST /api/whatsapp/retry-send route adds:

- **Role gate (MANAGER+).** Mirrors `send-invoice` route (and the same role required to SEE failed sends in PR #152). Non-MANAGER → `403` + `captureRbacDenial(surface: "/api/whatsapp/retry-send")`.
- **Invoice-linkage required (V1).** The route reconstructs the replay payload from the linked invoice. If the failed row has `invoice_id IS NULL`, return `422 Replay not supported for non-invoice sends`. (All current sends are invoice-linked; this guard exists for future-proof safety as new send shapes are added.)
- **Invoice still readable + retryable.** Re-load the invoice via the existing service; if it's been cancelled / deleted since the original send, return `422 Invoice no longer in a retryable state (status=<X>)`. Cancelled invoices should NOT be re-sent to the customer.
- **WHATSAPP_ENABLED kill switch.** Mirrors `send-invoice` — if `process.env.WHATSAPP_ENABLED !== "true"`, return `503` immediately. The same operational toggle that disables fresh sends MUST disable retries.
- **Rate limit.** Per-user `checkWhatsApp(\`user:${user.id}\`)` rate-limit (Upstash; mirrors send-invoice). Operators can't burst-retry the entire failed list — same per-user ceiling as fresh sends.

### Layer 3 — UI guards (defensive, in-page)

- **In-flight lock per row** (PHASE-0 C). Double-click during in-flight is a no-op at the client wrapper.
- **`canRetry=false` rows** show a disabled button with `title="Retry not available"` — purely cosmetic; the server is the trust boundary.

### What is explicitly NOT in scope this PR

- **No idempotency-key store.** The natural idempotency key here is `original_send_id` itself; the service uses it as a relational identifier. A true cross-request idempotency-key store (e.g., Redis-backed deduplication across HTTP retries from the operator's browser) is not required because the service-layer "status must be failed" guard fires deterministically — a SECOND retry against the SAME `original_send_id` succeeds with a NEW attempt only when the previous attempt is genuinely failed. The case "operator clicks retry, network blip, browser retries the POST" produces at most ONE additional send (the second POST sees the first INSERT's effects: either the first attempt is in-flight → still `queued` → second POST is rejected by the next-retry guard, or first completed → status reflects outcome → second retry behaves correctly). The combination of the in-flight UI lock + service-layer status guard covers this. A genuine idempotency-key store is POST-LAUNCH if double-send incidents are observed in production.
- **No "max retries per send" cap.** The service allows unbounded retry chains. An operational policy (e.g., "max 3 retries") is a POST-LAUNCH enhancement; for V1 the operator's judgment is the policy.
- **No multi-row "retry all".** One row, one retry. The button is per-row.

### What happens if a retry is requested for a non-retryable send

Three rejection paths, each with a clear inline operator-facing error:

| Rejection | Path | UI display |
|---|---|---|
| Row not failed (race: someone else retried since the page loaded) | Layer 1 service guard | "This send is no longer in a retryable state — refresh the page." |
| Endpoint mismatch (impossible under the current UI; defense-in-depth) | Layer 1 service guard | "Replay endpoint mismatch — cannot retry." |
| Invoice cancelled / deleted | Layer 2 route guard | "Invoice no longer in a retryable state — cannot retry." |
| WhatsApp kill switch | Layer 2 route guard | "WhatsApp sending is disabled. Try again later." |
| Rate limit | Layer 2 route guard | "Too many retries. Try again in a minute." |
| Network error | UI catch | "Network error — try again." (button re-enables) |

The operator NEVER sees a silent failure. Every rejection produces a structured response the UI can display.

---

## Bailout check

The brief's bailout conditions:

- **(E) idempotency requires infrastructure that doesn't exist?** NO — the layered defense above is sufficient for V1. The combination of service-layer status guard + UI in-flight lock prevents the realistic attack surface (double-click, network-blip browser retry). An idempotency-key store is a POST-LAUNCH enhancement contingent on observed pain. Bailout does not fire.
- **(B) list query needs more than a contained adjustment?** NO — the two-query "leaf failed rows only" approach is a bounded change to `listFailedWhatsappSends` (one method on one service). Bailout does not fire.
- **PR #152 read query MUST be adjusted in scope.** Confirmed; adjustment is contained.
- **CodeRabbit catalog growth?** Not yet — finishing the PR before assessing.

---

## Verdict

Ship as planned. PHASE-0 (A–E) gives the full implementation roadmap. Pure UI button + per-row in-flight state + route with layered safety + extracted replay-payload builders + adjusted list query for retry coherence. ~+700 LoC source + ~+400 LoC tests. SB-1 closed.
