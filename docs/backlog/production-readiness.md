# Production-Readiness Backlog

> **This file IS authoritative for the open-item list backing [#102](https://github.com/cargotapan-collab/tac-express/issues/102).**
>
> `#102`-the-GitHub-issue is a human-facing pointer for discussion + historical context. The truth — what's open, what's done-with-real-refs, what's intentionally not-sentinel-checked — lives here. **Every PR that closes or alters a backlog item updates this file.**
>
> **Drift is mechanically detected.** Every code reference below is verified on every PR by [`apps/dashboard/__tests__/backlog-refs-drift.test.ts`](../../apps/dashboard/__tests__/backlog-refs-drift.test.ts) (the fifth in the sentinel-test family). A renamed file, a deleted symbol, a dropped table, a removed RPC → the sentinel fails CI with the item name and the rotted ref.
>
> **Reference format** (per [PHASE-0 decision C](../decisions/2026-05-17-backlog-drift-sentinel.md#c-reference-format--fenced-refs-blocks)):
>
> Each item has a fenced ```` ```refs ... ``` ```` block. Lines are `<kind>: <value>` where `<kind>` ∈ {`file`, `symbol`, `table`, `rpc`}. Items without code artifacts use `` `refs: none — not-sentinel-checked (reason)` `` to be explicit about why the sentinel skips them.

**Date last refreshed:** 2026-05-17
**Seed:** [`docs/audits/2026-05-16-102-revalidation.md`](audits/2026-05-16-102-revalidation.md) + the two known deltas since (whatsapp_sends DONE in #141; #142–#145 filed alongside #141).

---

## Reading guide

- **`## ID — Title`** — `ID` is a short stable handle (`O1`, `O2`, ..., `W1` for whatsapp_sends-related, `D1` for docs). The numbers are NOT risk ranks — see `**Risk:**` line for that.
- **`**Risk:**`** — risk rank from the 2026-05-16 re-validation § 6, carried verbatim. A few items are NEW (postdate the seed) and have approximate ranks.
- **`**Status:**`** — `OPEN` | `DONE` | `WONTFIX` | `RENOUNCED`. DONE items remain in the file as long as they're a useful reference; rotated out at the next handoff cycle.
- **`**Tracker:**`** — the GitHub issue, optional.

---

## Risk-ranked open items (with code references)

These are the items the sentinel actively guards.

---

### W1 — WhatsApp delivery audit table + retry path (`whatsapp_sends`)

**Risk:** rank #2 (now DONE) — formerly rank #2 of remaining items per re-validation § 6.
**Status:** DONE — merged in PR #141 on 2026-05-17.
**Tracker:** [#102](https://github.com/cargotapan-collab/tac-express/issues/102) line item; PR [#141](https://github.com/cargotapan-collab/tac-express/pull/141).

The first dogfooded item carrying verifiable refs. Backing table, wrapper service, types, route wiring, and tests all present on main.

```refs
file: supabase/migrations/20260517000001_whatsapp_sends_table.sql
file: packages/services/src/whatsapp-tracked.service.ts
file: packages/types/src/whatsapp-send.types.ts
file: packages/services/src/__tests__/whatsapp-tracked.service.test.ts
file: docs/decisions/2026-05-17-whatsapp-sends-mechanism.md
symbol: packages/services/src/whatsapp-tracked.service.ts::createTrackedWhatsAppService
symbol: packages/services/src/whatsapp-tracked.service.ts::retryWhatsappSend
symbol: packages/services/src/whatsapp-tracked.service.ts::createTrackedWhatsAppServiceFromEnv
symbol: packages/services/src/server.ts::createTrackedWhatsAppServerService
symbol: packages/types/src/whatsapp-send.types.ts::WhatsAppSendStatus
symbol: packages/types/src/whatsapp-send.types.ts::WhatsAppSendEndpoint
symbol: packages/types/src/whatsapp-send.types.ts::WHATSAPP_SEND_TAG_KEYS
table: whatsapp_sends
```

---

### O1 — `manifest.service.ts` full test floor

**Risk:** rank #4 per re-validation § 6.
**Status:** DONE — PR #<TBD-MANIFEST-FLOOR>. Full coverage of all 10 public methods (the 9 previously-uncovered plus the audit-wired `removeShipmentFromManifest` from PR #135) landed; `freshManifestService` factory mirrors the established floor pattern; ManifestStatus enum exhaustiveness pinned via dual sentinel.
**Tracker:** [#102](https://github.com/cargotapan-collab/tac-express/issues/102) line item.

Sentinel-checked refs below pin the full set of methods exercised by the floor — drift on any of them (rename, deletion, signature change) fails CI.

```refs
file: packages/services/src/manifest.service.ts
file: packages/services/src/__tests__/manifest.service.test.ts
symbol: packages/services/src/manifest.service.ts::createManifestService
symbol: packages/services/src/manifest.service.ts::getManifests
symbol: packages/services/src/manifest.service.ts::getManifestById
symbol: packages/services/src/manifest.service.ts::getManifestShipments
symbol: packages/services/src/manifest.service.ts::createManifest
symbol: packages/services/src/manifest.service.ts::addShipmentToManifest
symbol: packages/services/src/manifest.service.ts::removeShipmentFromManifest
symbol: packages/services/src/manifest.service.ts::closeManifest
symbol: packages/services/src/manifest.service.ts::departManifest
symbol: packages/services/src/manifest.service.ts::arriveManifest
symbol: packages/services/src/manifest.service.ts::reconcileManifest
```

---

### O2 — `as unknown as` cast cleanup at `apps/dashboard/app/api/public/invoice-pdf/route.ts`

**Risk:** rank #5 per re-validation § 6.
**Status:** OPEN — 1 cast site remains (3 of 4 cleaned in PR #128).
**Tracker:** [#102](https://github.com/cargotapan-collab/tac-express/issues/102) line item; bounded to the financial / public-tracking boundary; ~30 min standalone or fold into next PDF-touching PR.

```refs
file: apps/dashboard/app/api/public/invoice-pdf/route.ts
symbol: apps/dashboard/app/api/public/invoice-pdf/route.ts::headerBuffer
```

---

## NEW open items (post-seed; filed alongside PR #141)

These four items were filed yesterday as follow-ups to whatsapp_sends. They postdate the re-validation doc. None have code yet — refs are marked `pending` per format spec.

---

### W2 — Operator retry UI for failed WhatsApp sends

**Risk:** approximate rank #5–6 (medium).
**Status:** OPEN — not started.
**Tracker:** [#142](https://github.com/cargotapan-collab/tac-express/issues/142).

A `/ops-console/whatsapp/failed-sends` page OR a "Resend" button on the invoice-detail page, gated MANAGER+. Service-layer primitive `retryWhatsappSend` exists in `packages/services/src/whatsapp-tracked.service.ts` (verified by W1's refs above); this item adds the route + UI.

`refs: none — not-sentinel-checked (work not started; no code artifacts exist yet on main; refs added when the PR opens)`

---

### W3 — Automated background retry job for failed WhatsApp sends

**Risk:** approximate rank #9 (low — only matters at operational pain).
**Status:** OPEN — not started; multi-session build (needs job-runner PHASE-0).
**Tracker:** [#143](https://github.com/cargotapan-collab/tac-express/issues/143).

Picks a job runner (Vercel Cron / Inngest / pg_cron), polls failed sends, retries with exponential backoff. No job-runner infrastructure exists in main today.

`refs: none — not-sentinel-checked (work not started; multi-session; depends on PHASE-0 job-runner choice)`

---

### W4 — Meta WhatsApp delivery-callback webhook

**Risk:** approximate rank #7 (medium-low).
**Status:** OPEN — not started.
**Tracker:** [#144](https://github.com/cargotapan-collab/tac-express/issues/144).

Public webhook endpoint with HMAC verification, replay protection. Adds `delivered`/`read` status to `whatsapp_sends` via webhook-written rows linked by `wamid`. Extends the row-model's `WhatsAppSendStatus` enum, triggering the exhaustiveness sentinel as the forcing function.

`refs: none — not-sentinel-checked (work not started; introduces a new public route + a migration adding the delivered/read CHECK literals)`

---

### W5 — Application-layer immutability sentinel for `whatsapp_sends`

**Risk:** approximate rank #10 (low — defense-in-depth; current discipline holds).
**Status:** OPEN — not started.
**Tracker:** [#145](https://github.com/cargotapan-collab/tac-express/issues/145).

Mirror of `audit-logs-no-update-delete.test.ts` for the whatsapp_sends wrapper boundary. Distinct from the present PR's backlog-drift sentinel (#136) — that polices the BACKLOG; this one polices the WRAPPER allow-list.

`refs: none — not-sentinel-checked (work not started; will live at packages/services/src/__tests__/whatsapp-sends-allowlist.test.ts or similar)`

---

## Open items without code references (sentinel intentionally skips)

The sentinel skips these because there is no code artifact to verify. Each line documents why so a future maintainer doesn't add empty refs to "include it."

---

### O3 — Sentry alert-rule notification action (owner-runnable provisioning)

**Risk:** rank #3 per re-validation § 6.
**Status:** OPEN — owner task; not agent-actionable.
**Tracker:** [#94](https://github.com/cargotapan-collab/tac-express/issues/94).

Script-side is done (`scripts/sentry/canonical-rules.mjs` + `scripts/sentry/lint-alert-rules.mjs`). The remaining step is the owner running `scripts/sentry/create-alert-rules.mjs` locally with a project:write token. 5-min owner action.

`refs: none — not-sentinel-checked (the open work is owner-runnable provisioning, not a code artifact in the repo)`

---

### D1 — PITR / database restore playbook

**Risk:** rank #6 per re-validation § 6.
**Status:** OPEN — no procedure exists in `docs/PRODUCTION-RUNBOOK.md` or `docs/runbooks/`.
**Tracker:** [#102](https://github.com/cargotapan-collab/tac-express/issues/102) line item.

Becomes rank #1 the day a DB-loss incident happens. Until then, a documentation gap.

`refs: none — not-sentinel-checked (the work IS writing a doc; the sentinel checks code refs, not future doc paths)`

---

### D2 — Upstash Redis outage runbook entry

**Risk:** rank #7 per re-validation § 6.
**Status:** OPEN — rate-limit fails open; no documented incident response.
**Tracker:** [#102](https://github.com/cargotapan-collab/tac-express/issues/102) line item.

`refs: none — not-sentinel-checked (the work IS writing a doc; the sentinel checks code refs, not future doc paths)`

---

### D3 — Live monitoring dashboard links in PRODUCTION-RUNBOOK.md

**Risk:** rank #8 per re-validation § 6.
**Status:** OPEN — `grep "grafana\|monitoring dashboard"` in the runbook returns 0 dashboard URLs.
**Tracker:** [#102](https://github.com/cargotapan-collab/tac-express/issues/102) line item.

`refs: none — not-sentinel-checked (the work IS editing a doc to add URLs; not code artifacts)`

---

### D4 — WhatsApp rate-limit bucket JSDoc

**Risk:** rank #9 per re-validation § 6.
**Status:** OPEN — `grep "@bucket\|rate-limit.*bucket"` in `whatsapp.service.ts` returns 0 hits.
**Tracker:** [#102](https://github.com/cargotapan-collab/tac-express/issues/102) line item.

Pure documentation improvement; no behavior risk. ~30 min.

`refs: none — not-sentinel-checked (the work IS adding JSDoc to existing code; nothing for the sentinel to assert on until done — at which point this item becomes DONE and is rotated out)`

---

### D5 — Create `docs/RELEASE-CHECKLIST.md`

**Risk:** rank #10 per re-validation § 6.
**Status:** OPEN — file does not exist.
**Tracker:** [#102](https://github.com/cargotapan-collab/tac-express/issues/102) line item.

Useful if a manual-release event becomes possible (currently continuous deploy).

`refs: none — not-sentinel-checked (the work IS creating a doc; no code refs)`

---

### E1 — E2E flows (5 grouped items)

**Risk:** rank #11 per re-validation § 6 (grouped; aggregate scope is large but per-flow per-day risk is moderate).
**Status:** OPEN — none of the 5 flows have specs.
**Tracker:** [#102](https://github.com/cargotapan-collab/tac-express/issues/102) line item.

Five flows: payment recording (POST + assert), full shipment creation wizard (steps 2–4), full manifest creation with bulk shipment select, role-based RLS isolation (warehouse cross-hub), exception lifecycle (create / escalate / resolve). Each ~1 session; cumulative is the biggest unticked-item bucket.

The payment-recording E2E is UNBLOCKED by W1 (whatsapp_sends) — it asserts against delivery state, which now has a queryable home.

`refs: none — not-sentinel-checked (the work IS creating Playwright specs that don't exist yet; refs added per-flow as each is built)`

---

## WONTFIX (still valid per CLAUDE.md § 6)

Present for searchability. Trigger conditions preserved verbatim from the re-validation doc; re-evaluate 2026-08-16 per the cadence rule.

---

### X1 — Pick canonical form variant per domain (v7 vs original) and archive the loser

**Risk:** WONTFIX-STILL-VALID per CLAUDE.md § 6.1 (re-validation § 2 row 24).
**Status:** WONTFIX-UNLESS-TRIGGERED.

Trigger conditions: design freeze on v6 or v7; wizard PR blocked ≥ 1 session on variant choice; roadmap names a target architecture state; brainstorming produces a written spec.

`refs: none — not-sentinel-checked (deferred organizational call; no code action)`

---

### X2 — On-call schedule + escalation policy

**Risk:** WONTFIX-STILL-VALID per CLAUDE.md § 6.2 (re-validation § 4 row 27).
**Status:** WONTFIX-UNLESS-TRIGGERED.

Trigger conditions: team size ≥ 2 engineers with shared production responsibility; first 24/7 incident; Sentry rule 6 (production-errors owner-targeted) fires ≥ 3× in a 30-day window.

`refs: none — not-sentinel-checked (organizational; no code action while solo-owner)`

---

## RENOUNCED (do not bring back)

For searchability — these were items in early `#102` drafts that have been formally renounced. A future agent grepping `#102`'s body might re-add them by accident; this section catches that.

- **"7 dashboard cards" sub-bullet of orphan UI item** — RENOUNCED in PR #126 comment on `#102`. Cards are LIVE behind the `tac-design` v7 flag. See `packages/ui/src/components/composed/_archive/2026-05-16/README.md § "NOT in this archive"`.
- **`NEXT-SESSION-HANDOFF.md` archive sub-bullet** — RENOUNCED in PR #126 comment on `#102`. Promoted to load-bearing cross-session protocol artifact. See `docs/_archive/2026-05-14/README.md § "What is NOT archived"`.
- **`manifest_revert` CHECK enum value** — STALE. Reconciled to `manifest_shipment_remove` in migration `20260516000002`. See `docs/decisions/2026-05-16-audit-logs-mechanism.md § 5.1`.

---

## Maintenance

When you close an item:
1. Update its `**Status:**` line.
2. Move DONE items to the top section (with their now-verifiable refs).
3. Rotate items DONE for ≥ 2 sprints out of this file via a "Recently DONE" section in the handoff doc (the backlog file is for ACTIVE state).
4. The sentinel guards refs of OPEN-and-DONE items equally — a regressed file deletion fails CI for either.

When you add a new item:
1. New section with `## <ID> — <Title>`.
2. `**Risk:**`, `**Status:**`, `**Tracker:**` lines.
3. A `refs` block (use `refs: none — not-sentinel-checked (reason)` if there's no code artifact yet).

When you renounce an item:
1. Move it to the "RENOUNCED" section with the renunciation rationale + stable reference (PR comment URL, archive README, etc.).
2. Remove its `refs` block (a renounced item has no refs to verify).

---

**End of authoritative backlog.** The sentinel guards this file on every PR. `#102`-the-issue is a pointer.
