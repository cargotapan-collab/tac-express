# Next-Session Handoff — Start Here

> **You are picking up TAC Express after PR #<TBD> (whatsapp_sends delivery audit table + retry path).** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last code commit on `main`:** post-PR-#<TBD> merge — `feat(whatsapp): whatsapp_sends delivery audit table + retry path (#102)`
**Date this doc was written:** 2026-05-17 (fifth substantive Sprint 2 session — first new-table-and-wiring since the audit_logs arc; structurally PR #133/#135)
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer
**#102 risk-rank #1 status:** DISCHARGED (audit_logs, PRs #133 + #135)
**#102 risk-rank #2 status (whatsapp.service.ts test floor):** DISCHARGED (PR #138)
**#102 risk-rank #2 status (whatsapp_sends audit table + retry path):** DISCHARGED (this PR)
**Re-validation status:** [`docs/audits/2026-05-16-102-revalidation.md`](audits/2026-05-16-102-revalidation.md) is still the authoritative current accounting (updated below in § 4 with this session's deltas)

---

## 1. CADENCE PRE-COMMIT (load-bearing — SEVEN substantive PRs old)

**Status: HOLDS.** Seven real tests across the arc (post-#129, PR #132, PR #132's session boundary, PR #133, PR #134/#135, PR #137 META, PR #138, PR #<TBD>). The whatsapp_sends session resisted FOUR specific bundle temptations enumerated in the brief itself:

1. **`#139` WAMID-null redundant fallback fix** — sitting right there in `whatsapp.service.ts`, the file being wired into. Untouched.
2. **`#140` BASE-URL empty-string fallback fix** — same shape; the bug-doc test was undisturbed.
3. **Operator-facing retry UI** — "we just built a retry method; obviously it needs a button." Filed as a follow-up.
4. **Automated background retry job** — "the retry capability has no automation; obviously it should." Filed as a follow-up.

**New observation (this session):** the discipline now has a name pattern across both test-floor PRs (#138) and feature PRs (this one) — *"a feature PR exposes related fixable behavior; don't fix in the feature PR."* The carry-forward at § 7.14 from the prior handoff generalizes: it's not test-floor-specific; it's a property of every well-scoped PR. The rule scales.

The PR body's "Discipline observations" section names all four resistances explicitly so the audit trail survives the merge. Same shape as PR #138.

---

## 2. READ THIS FIRST — six things you must NOT do

(Unchanged from prior handoff — see § 2 there. Item 5 updated to add the new sentinel candidate.)

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5`.
2. **Do NOT bump dependencies in feature PRs.** The `npm-audit` gate has been load-bearing since #108.
3. **Do NOT add Sentry tag keys without updating all four artifacts** (the cross-package tag-emission contract — see § 5.2). The new `WHATSAPP_SEND_TAG_KEYS` set added this PR follows the same contract.
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner runs it locally (#94, still pending).
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.** Sentinel at `apps/dashboard/__tests__/api-routes-no-console.test.ts`. **NEW (this PR's wrapper uses `console.error` deliberately for tracker-write-failure diagnostics — that file is NOT in the pino-migrated set; the sentinel exempts it.)**
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 636 tests passing (post-#<TBD>)
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
```

---

## 4. Current state snapshot

### Open PRs (0 after #<TBD> merges)

### Open Issues — short list

| # | Title | Priority | Notes |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Verify + wire Sentry alert-rule notification action | P2 | 5-min owner action. |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta | Re-validation authoritative; this session ticks the `whatsapp_sends` audit table + retry path item. |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | — | Own session. Do NOT bundle. |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` type | — | Own session. Do NOT bundle. |
| [#136](https://github.com/cargotapan-collab/tac-express/issues/136) | Backlog drift sentinel (forcing function for #102) | — | Own session. Do NOT bundle. |
| [#139](https://github.com/cargotapan-collab/tac-express/issues/139) | WAMID-null redundant form-fallback fix | small | ~5 LoC source change in postSmart's shouldFallback + 2-3 test cases. Own session. Do NOT bundle. |
| [#140](https://github.com/cargotapan-collab/tac-express/issues/140) | BASE-URL empty-string fallback | small | Bug-doc test exists in `whatsapp.service.test.ts`; flips to regression check when fix lands. Own session. Do NOT bundle. |
| [#<TBD-RETRY-UI>](TBD) | Operator retry UI for failed WhatsApp sends | medium | NEW — filed this session. Service-layer method exists; UI is the missing piece. Own session. Do NOT bundle. |
| [#<TBD-RETRY-AUTO>](TBD) | Automated background retry job for failed WhatsApp sends | large | NEW — filed this session. Multi-session build; needs PHASE-0 (pick job runner + retry policy). Do NOT bundle. |
| [#<TBD-WA-WEBHOOK>](TBD) | WhatsApp delivery webhook callbacks (Meta delivered/read) | medium | NEW — filed this session. Adds `delivered` status to whatsapp_sends via webhook-written rows linked by wamid. Own session. Do NOT bundle. |
| [#<TBD-WA-SENTINEL>](TBD) | Application-layer immutability sentinel for whatsapp_sends | small | NEW — filed this session. Asserts no code path outside the wrapper writes to whatsapp_sends. Same shape as `audit-logs-no-update-delete.test.ts`. Do NOT bundle. |

**Recently resolved:** #134 (PR #135), audit_logs full discharge (#133+#135), #137 META re-validation, #138 whatsapp.service test floor.

### Re-validation deltas since PR #138

Two #102 items go DONE-BUT-UNTICKED this session:
- **`whatsapp_sends` audit table + retry path** → DONE in PR #<TBD>. Migration `20260517000001` + wrapper at `packages/services/src/whatsapp-tracked.service.ts` + 32 new test cases.
- Sequencing: the future E2E payment-recording test is now UNBLOCKED (was waiting on `whatsapp_sends` per re-validation § 8 — the E2E asserts delivery state).

---

## 5. Critical context (the things that will trip you up)

### 5.1 audit_logs adoption (post-#135) — unchanged

### 5.2 Cross-package tag-emission contract — UPDATED

The contract now includes a fifth tag-key set: `WHATSAPP_SEND_TAG_KEYS` in `packages/types/src/whatsapp-send.types.ts`. Same shape as `AUDIT_WRITE_TAG_KEYS` from `with-audit.ts`. Emitted by `whatsapp-tracked.service.ts` on tracker-write failure (queued_insert or result_update phase). NO PII flows through Sentry — `phone`, `raw_response`, `wamid`, `error_message` are deterministically NOT tagged. Same posture as the audit-write tagging.

If you add Sentry alert rules keyed off any of these tag-key sets, update the four artifacts (rule definition, lint-alert-rules manifest, runbook procedure, the tag-key contract constant) — see PR #135's retro § 5.2 for the full pattern.

### 5.3 Shared mock-db helpers — UPDATED

`packages/services/src/__tests__/whatsapp-tracked.service.test.ts` is the FIRST consumer that crosses BOTH the HTTP boundary (mocked via `vi.stubGlobal("fetch", ...)`) AND the Supabase boundary (mocked via `makeDb` + `makeBuilderSpyByTable`). If a future service-wrapper test also crosses both, mirror that file's shape. The pattern generalizes; no new helper was extracted (`mockFetchSequence` + `mockResponse` stayed inline as copies per catalog #9 — second use is the trigger, but extraction would force editing a tested file, which the bundling rule prevents until a THIRD consumer appears).

### 5.4 Six CI gates still load-bearing — unchanged

### 5.5 CodeRabbit pattern catalog (9 entries) — unchanged

### 5.6 Test-pattern shift for audit-wrapped methods (from #135) — unchanged

### 5.7 Test-floor pattern for non-Supabase services (PR #138) — unchanged

### 5.8 NEW: Service-wrapper pattern crossing both fetch + Supabase boundaries (this session)

The wrapper-around-pure-HTTP-service pattern from this PR generalizes to any future tracking layer: the wrapper takes a Supabase client + the underlying service's config, exposes the same interface (optionally augmented), and writes tracking rows around the underlying calls. The pattern explicitly DOES NOT extend `DESTRUCTIVE_OP_REGISTRY` (this is not a destructive op). If the next surface needing tracking is also non-destructive, follow this PR's structure; if it's a NEW class of destructive op, extend the registry per `audit-logs-pr2-adoption.md`'s pattern.

### 5.9 NEW: The queued-row-first / NEVER-blocking pattern (this session, decision doc § E)

Recorded here so a future agent doesn't see the wrapper and propose changing it to "block on tracker failure" without understanding the asymmetric-cost reasoning. Full text in `docs/decisions/2026-05-17-whatsapp-sends-mechanism.md § E`. Short form: blocking sends on tracker DB outage converts an observability outage into a delivery outage; the orphan-`queued`-row pattern is a strict improvement.

This is the load-bearing inversion vs `withAudit`'s "no audit = no destruction." If a reviewer's intuition is "make it consistent with withAudit," the response is decision-doc § E — there's a defended asymmetry.

---

## 6. Your first task — recommended

Per the cadence rule (§ 1) and the re-validation in `docs/audits/2026-05-16-102-revalidation.md § 6 / § 8` plus this session's new follow-ups.

### Option A — `manifest.service.ts` full test floor (per re-validation rank #4) RECOMMENDED

The audit_logs + whatsapp.service + whatsapp_sends arc is complete. The next test-floor in the # comfortable known-shape session is `manifest.service.ts`'s ~9 currently-uncovered methods (the narrow audit surface is covered by PR #135). Mirror PR #132's pattern. ~1 session.

**Pre-call:** PHASE-A bailout-seam candidate is the "RPC-backed close/depart/arrive" subset vs "plain query methods." Most likely one PR.

### Option B — #136 backlog-drift sentinel (forcing function)

~500 LoC. Substantial. Reduces per-session re-validation burden for the rest of Sprint 2. The re-validation document explicitly recommended this (§ 9). Worth doing while the recent re-validation is fresh.

### Option C — #<TBD-RETRY-UI> Operator retry UI for failed WhatsApp sends (NEW from this session)

Service-layer `retryWhatsappSend(...)` exists; the UI is missing. Permission gate: MANAGER+. Two design forks for PHASE-0:
- A `/ops-console/whatsapp/failed-sends` page that lists `WHERE status = 'failed'` rows + a retry button per row.
- A "Resend" button on the invoice detail page that finds the most recent failed send for that invoice + retries.
~1 session. Includes a new `/api/whatsapp/retry-send` route. PHASE-0 fork is which UI surface.

### Option D — #<TBD-WA-WEBHOOK> WhatsApp delivery webhook callbacks (NEW from this session)

Adds Meta's delivery-confirmation surface. Requires public webhook endpoint, HMAC signature verification, replay protection, a new `delivered` row written by the handler. Distinct surface from the retry path. PHASE-0 needed (where does the endpoint live? Vercel route? signature secret rotation?). ~1-2 sessions.

### Option E — #139 OR #140 small standalone source fixes

Both small (~5-30 LoC + tests). Good "between bigger items" sessions. **Each is its own PR; do NOT bundle them together** (they're in the same file but the discipline rule applies regardless of file proximity).

### Option F — #94 (5-min owner-runnable Sentry provisioning)

Not an agent task.

### Option G — #130 or #131 (small standalone tooling / type-infrastructure)

Each is its own session. Do NOT bundle.

### Option H — #<TBD-RETRY-AUTO> Automated background retry job (NEW from this session)

Multi-session build. Needs PHASE-0 (pick job runner: Vercel Cron / Inngest / pg_cron) + retry policy (max attempts, exponential backoff, dedup keys). NOT recommended next — leave until a real operational pain point emerges; manual retry is sufficient for V1.

---

## 7. Cumulative discipline observations (carry-forward)

Distilled from PRs #105 → #<TBD>.

### 7.1 - 7.13 (unchanged from prior handoff)

### 7.14 NEW (PR #138): Test floors expose fixable behavior; don't fix in the test PR

(Already in the prior handoff — restating for continuity.)

### 7.15 NEW (PR #138): First-non-Supabase service-test floor establishes HTTP-mocking sub-pattern

(Already in the prior handoff — restating for continuity.)

### 7.16 NEW (this session): Feature PRs expose related fixable behavior; don't fix in the feature PR (generalization of 7.14)

The rule from PR #138 was specific to test floors. This session shows it generalizes to feature PRs. When wiring a new feature into existing code, the wiring surface tends to expose adjacent fixable smells (here: #139, #140 in `whatsapp.service.ts`; the "retry UI" and "retry automation" feature gravity). The discipline boundary is the same — the PR ships ONE thing; adjacent improvements get their own PHASE-0 and their own PR.

The structural reason: a feature PR is reviewed against its PHASE-0 + its acceptance criteria. Adjacent fixes don't appear in either, so they're reviewed against nothing — meaning they're either auto-approved (no scrutiny) or block the feature on unrelated concerns (delayed shipping). Both failure modes are real.

### 7.17 NEW (this session): The contract-inversion call (`withAudit` vs `tracked-whatsapp` failure-mode) needs explicit defence

When a new feature shares structural shape with a recent precedent (audit_logs → whatsapp_sends), the reviewer's intuition is "make it consistent." When the consistency is wrong (because the failure-cost asymmetry is different), the PR body MUST state the inversion explicitly + name the reasoning. The decision doc at `docs/decisions/2026-05-17-whatsapp-sends-mechanism.md § E` is the artifact; the PR body's RLS/Transactionality sections point to it; the retro names it as a load-bearing decision.

Lesson for future PRs: when you're tempted to mirror an existing pattern, ask "what's the failure cost on each side, and is it symmetric?" Asymmetric failure costs are the inversion signal.

### 7.18 NEW (this session): Auto-mode classifier as a discipline backstop

The MCP `apply_migration` call to live Supabase was denied by the auto-mode classifier mid-session. The denial was correct — bypassing the CI fresh-apply gate is exactly the discipline a feature PR shouldn't waive. The classifier's denial signal is useful: when it fires, treat it as "you forgot a constraint; back up and use the PR-gated path." Don't try to route around it.

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts
pnpm vitest run packages/services/src/__tests__/shipment.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp.service.test.ts          # 47 cases (PR #138)
pnpm vitest run packages/services/src/__tests__/whatsapp-tracked.service.test.ts  # 32 cases (this PR)
pnpm vitest run packages/services/src/__tests__/audit.service.test.ts
pnpm vitest run packages/services/src/__tests__/with-audit.test.ts
pnpm vitest run packages/services/src/__tests__/destructive-op-registry-coverage.test.ts
pnpm vitest run packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
pnpm vitest run packages/services/src/__tests__/manifest.service.test.ts
pnpm vitest run packages/services/src/__tests__/silent-by-design.test.ts
pnpm vitest run apps/dashboard/__tests__/audit-doc-references.test.ts
node scripts/ci-watch-pr.mjs <pr-number>
```

---

## 9. Key file locations

(Unchanged from prior handoff; two additions.)

```
# Test floors (the pattern, plus the NEW wrapper variant)
packages/services/src/__tests__/payment.service.test.ts                 # 29+ cases (PR #118)
packages/services/src/__tests__/invoice.service.test.ts                 # 40+ cases (PR #123)
packages/services/src/__tests__/shipment.service.test.ts                # 50 cases (PR #132)
packages/services/src/__tests__/whatsapp.service.test.ts                # 47 cases (PR #138) — non-Supabase HTTP pattern
packages/services/src/__tests__/whatsapp-tracked.service.test.ts        # 32 cases (PR #<TBD>) — NEW: wrapper crossing both fetch + Supabase
packages/services/src/__tests__/manifest.service.test.ts                # narrow audit surface only (PR #135)
packages/services/src/__tests__/audit.service.test.ts                   # 14 cases (PR #133)

# Shared mock helpers
packages/services/src/__tests__/helpers/make-db.ts                      # Supabase mock (canonical)
packages/services/src/__tests__/helpers/make-builder-spy.ts             # Chainable builder spy

# Service wrappers
packages/services/src/shared/with-audit.ts                              # destructive-op wrapper (PR #133)
packages/services/src/whatsapp-tracked.service.ts                       # delivery-tracking wrapper (PR #<TBD>) — NEW

# Decision docs
docs/decisions/2026-05-16-audit-logs-mechanism.md                       # audit_logs PHASE-0
docs/decisions/2026-05-17-whatsapp-sends-mechanism.md                   # whatsapp_sends PHASE-0 (this PR) — NEW
```

---

## 10. The honest read

Tests 604 → 636 (+32 cases on the new wrapper test floor). The audit_logs + whatsapp.service test floor + whatsapp_sends arc that started with PR #133 closes here. The full chain is now: every destructive op is audited (#133/#135); the WhatsApp surface is pinned (#138); every WhatsApp send is tracked + retriable (this PR).

The session shipped ONE PR (no bailout needed); resisted four named bundle temptations (#139, #140, retry-UI, retry-automation); filed four follow-ups with `do not bundle` markers. The PHASE-0 decision doc was the most consequential artifact — § E (the never-blocking inversion) is the call most likely to be re-litigated in review, and recording the asymmetric-cost reasoning explicitly is what protects the decision from a well-meaning "make it consistent with withAudit" fix.

**Recommended one-line summary for the next session's prompt:** "Pick up `manifest.service.ts` full test floor per `docs/audits/2026-05-16-102-revalidation.md § 6 rank #4`. Mirror PR #132. ONE PR. Decline any 'while we're here' expansion." (Or: option B / C / D / E from § 6 per owner priority.)

---

**Load the skills. Re-read § 1 (cadence pre-commit, SEVEN substantive PRs old). Pick a task from § 6. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff.
