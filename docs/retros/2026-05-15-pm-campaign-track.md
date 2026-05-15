# Campaign Retro — 2026-05-15 PM (Non-stop sequential campaign)

> Campaign-level retro covering four sequential PRs shipped end-to-end in one continuous session, gated by per-PR owner-typed `merge PR #N` authorization. Per-PR retros for the substantive PRs are at:
>
> - `docs/retros/2026-05-15-pm-sentry-track.md` (PR #111 — Sentry harness, prior session)
> - `docs/retros/2026-05-15-pm-instrumentation-track.md` (PR #113 — auth/services helpers, prior session)
> - `docs/retros/2026-05-15-pm-pr112-adoption.md` (PR #114 — broad adoption, this campaign's PR α)
>
> PRs β/γ/δ in this campaign did NOT get separate per-PR retros — campaign-level coverage here is the durable artifact.

**Author:** Claude Code (Opus 4.7), PM-mode
**Branch state at campaign start:** `main` at `e333e0c` (post-#113)
**Branch state at campaign end:** `main` at `2de96f7` (post-#118)
**Total PRs shipped:** 4 (squash merges)
**Total commits added to main:** 4

---

## 0. TL;DR — every PR shipped

| PR | Title | sha | LoC | Issues touched |
|---|---|---|---|---|
| [#114](https://github.com/cargotapan-collab/tac-express/pull/114) | feat(sentry): adopt withRpc + captureRbacDenial broadly | `e188cfb` | +801 / -20 | **closes #112**; advances #94; ticks #102 |
| [#116](https://github.com/cargotapan-collab/tac-express/pull/116) | feat(sentry): canonical rule 6 + parameterized notification + owner procedure | `9ebc497` | +385 / -7 | **advances #94** to one-step-from-owner-close; ticks #102 |
| [#117](https://github.com/cargotapan-collab/tac-express/pull/117) | feat(dashboard): pino logger for API routes | `8c8ab61` | +366 / -49 | **ticks 1× #102** (Sprint 1 Observability) |
| [#118](https://github.com/cargotapan-collab/tac-express/pull/118) | test(services): payment.service.ts unit-test floor | `2de96f7` | +592 / -10 | **ticks 2× #102** (Sprint 1 Test floor — payment.service + record_invoice_payment RPC) |
| **Total** | | | **+2144 / -86** across 28 files | 1 issue closed, 1 advanced, ≥4 checkboxes ticked, 2 follow-ups filed |

Plus filed: [#115](https://github.com/cargotapan-collab/tac-express/issues/115) (audit § 6 observability follow-ups) between PR α and PR β.

Closing snapshot:
- 362 tests passing (286 → 362; **+76 tests across the campaign**)
- Six CI gates load-bearing on main (unchanged shape; alert-rule-lint extended in PR α with key-in-EMITTED check; turbo.json env declarations grew by 2 for PR γ)
- 6 canonical Sentry alert rules (was 5; rule 6 added by PR β)
- Two new packages-side instrumentation helpers fully adopted at every fitting site (PR α)
- 3 API routes migrated to structured logging (PR γ)
- payment.service.ts test floor in place — financial surface no longer zero-coverage (PR δ)

---

## 1. The arc

### Phase 1 — Honest scoping (before any branch)

The campaign prompt named four PRs (α/β/γ/δ) and called out three CTO-level truths:
1. **#112: One disciplined PR closes it.** Confirmed during PR α — the helpers from PR #113 + the audit doc made adoption mechanical.
2. **#94: Owner explicitly documented as owner-only.** PR β advanced it; closure is still the owner's typed-command step (5-step procedure in runbook § 5.3).
3. **#102: Master tracking; 2–3 weeks of work; THIS SESSION delivers 3–4 sub-items, no more.** Confirmed — campaign ticks 4 checkboxes total (Observability pino, Sprint 1 payment.service, Sprint 1 record_invoice_payment, Sprint 1 Observability Sentry-rules already covered by #114). Parent issue stays open.

The premise checks during context load surfaced two #102 Immediate items that were ALREADY DONE but not ticked:
- `/api/health` endpoint (PR #103 shipped it)
- `INVOICE_PDF_SIGNING_SECRET` hex validation (already in `invoice-pdf-token.ts:67`)

These pivoted the original PR γ scope (hex validation) → became "promote PR δ (pino) into the γ slot, promote PR ε (payment tests) into δ". Captured in the campaign retro as the prompt anticipated reshuffling.

### Phase 2 — Sequential delivery, one merge gate per PR

```
PR α  →  CI green  →  owner: "merge PR #114"  →  merge  →  checkpoint
PR β  →  CI green  →  owner: "merge PR #116"  →  merge  →  checkpoint
PR γ  →  CI green  →  owner: "merge PR #117"  →  merge  →  checkpoint
PR δ  →  CI green (after CodeRabbit fixes)  →  owner: "merge PR #118"  →  merge
```

Checkpoint discipline (five questions between each PR):
| PR | Time | LoC cap | Complexity | CI health | Issue-drift |
|---|---|---|---|---|---|
| α | ~2h in, sustainable | 801 / 1500 | one PostgrestFilterBuilder type fix; no surprises | 6 gates green | filed #115 before β |
| β | ~3h in | 385 / 1500 | no surprises | 6 gates green | none |
| γ | ~3.5h in | 366 / 1500 | one turbo.json env-var declaration miss | 6 gates green | none |
| δ | ~4h in | 592 / 1500 | CodeRabbit caught 2 Major findings — both legitimate; fixed + replied | 6 gates green | none |

No checkpoint forced an early stop. The campaign ran to completion as scoped.

### Phase 3 — Bot-feedback discipline (PR δ)

CodeRabbit flagged two Major findings on PR δ's first push (commit `3438ef0`):

1. **Fallback call-order assertion was too weak.** The `toHaveBeenCalledWith` matcher only proved both tables were touched somewhere; it didn't enforce the `insert → select → update` flow. Strengthened to `toHaveBeenNthCalledWith(1,2,3)` + `toHaveBeenCalledTimes(3)` in commit `17417d4`.

2. **`PaymentMethod` enum sentinel wasn't exhaustive.** The hardcoded `ALL_METHODS` array could silently drift from the type definition. CodeRabbit's suggested TypeScript-native pattern (`satisfies readonly PaymentMethod[]` + `Exclude<>` exhaustiveness check) was strictly better than a runtime sentinel — `PaymentMethod` is a string-union (no runtime), so `Object.values()` doesn't apply. Adopted in `17417d4`.

Both fixes shipped, CI re-ran green, CodeRabbit ACK'd both. Reply-on-thread discipline applied per the ci-monitor instructions.

---

## 2. Strategic findings + lessons

### 2.1. The honest-scoping line in the campaign prompt was the most valuable part

The CTO-level scoping in the prompt's preamble ("THIS SESSION delivers 3-4 sub-items, no more") set the discipline for the entire campaign. Without it, the temptation to also tick the `as unknown as` cleanup (#102 Code Health) or the `whatsapp_sends` audit table (#102 Sprint 1 Observability) would have been real — both are tractable, both are listed in #102. The campaign held at 4 PRs because the prompt named the budget up front.

**Pattern:** when running a multi-PR sequence, the SESSION-LEVEL budget is the durable safeguard. Per-PR budgets (1500 LoC, #14 one-concern) protect against ballooning a single PR; session-level budgets protect against ballooning the session.

### 2.2. The PHASE A audit doc in PR α was the single most-leveraged artifact this campaign

Writing `docs/audits/2026-05-15-rbac-denial-audit.md` BEFORE any adoption code meant:
- Every reviewer (including bot reviewers + future me) had a binding contract for the bucketing.
- The judgment calls (which RPC sites get `withRpc` vs `captureSupabaseRpcError` selective vs DEFERRED marker; which RBAC sites are BLOCK vs GATE) had explicit rationale per file:line.
- The follow-up issue (#115) wrote itself — § 6 of the audit doc IS the follow-up scope.

Without the audit doc, PR α would have shipped 7 service-file migrations + 3 RBAC adoptions without a paper trail explaining WHY `dashboard.service.ts:228` was DEFERRED instead of wrapped. Reviewers would have had to reconstruct the reasoning from per-commit messages.

**Pattern (re-confirmed):** when a PR's substantive work is "apply pattern X at every fitting site," the audit doc that classifies fitting/non-fitting is the load-bearing artifact. Worth committing as commit-a-of-the-PR so reviewers see it before any code edits.

### 2.3. The bailout fires at PER-LINE granularity, not just per-PR

PR α's bailout discussion led to the DEFERRED marker pattern for `detect_sla_breaches` — instead of "ship everything OR file a follow-up PR," the right tradeoff was "ship the rest + leave one specific call site explicitly un-instrumented with an inline `SENTRY-MIGRATION-DEFERRED` comment + a 3-option decision tree + the follow-up issue link."

This is a refinement of the bailout pattern from prior PRs (#111, #113): the bailout doesn't have to be "ship a smaller PR" — it can be "ship the full PR but leave a marked-deferral at one site." The marker prevents future agents from accidentally completing the deferred site without the design discussion that needs to happen first.

**Pattern:** when an adoption sweep hits one site that needs a design decision rather than mechanical work, leave a `XXX-MIGRATION-DEFERRED` comment + a decision tree inline + a follow-up issue link. The comment IS the binding contract for the deferral.

### 2.4. Static-analysis sentinel tests replace heavyweight integration tests for "did we adopt the pattern correctly"

Two of this campaign's sentinel tests use file-text grep to enforce adoption contracts:
- PR α's `rbac-block-adoption.test.ts` — verifies each of the 3 BLOCK routes imports `captureRbacDenial` + invokes it with the audited surface string
- PR γ's `api-routes-no-console.test.ts` — verifies each of the 3 migrated routes has zero `console.*` calls + imports `logger` + binds a child logger

In both cases the alternative was a full Next.js route-handler integration test mocking cookies, NextResponse, Supabase, etc. — heavyweight, brittle, slow. The grep-style test is narrower (it pins the adoption pattern, not the behavior) but exactly what's needed when the pattern's RUNTIME behavior is already battle-tested upstream.

The brittleness tradeoff is documented inline: "if this test ever feels brittle, the right reaction is to delete it and replace with a real integration test — NOT to soften the assertion."

**Pattern:** for adoption-contract tests, static analysis is often the right tool. The contract IS the adoption pattern; runtime behavior is delegated to the library being adopted.

### 2.5. CodeRabbit's TypeScript-native exhaustiveness pattern is strictly better than the runtime-Object.values sentinel for string-union types

PR δ's first push used a hardcoded `ALL_METHODS` array with no compile-time tie-back to `PaymentMethod`. CodeRabbit caught this and proposed:

```ts
const ALL_METHODS = [...] as const satisfies readonly PaymentMethod[]
type _Missing = Exclude<PaymentMethod, (typeof ALL_METHODS)[number]>
const _allPaymentMethodsCovered: _Missing extends never ? true : never = true
```

This is bidirectional:
- `satisfies` gates "every element is a valid PaymentMethod"
- `Exclude<>` gates "every PaymentMethod is represented"

For string-union types (no runtime representation), this is the correct equivalent of `rbac.test.ts`'s `Object.values(UserRole)` sentinel. The compile-time error is the assertion — adding a new method fails `pnpm typecheck` (loudest possible feedback loop), not just the test run.

The project's "no derived sets for runtime assertions" law was about enum-backed authorization matrices. For string-union exhaustiveness, the TypeScript-native pattern is the right tool. CodeRabbit's review distinguished the two cases correctly.

**Pattern:** for runtime enums → `Object.values(Enum)` sentinel. For string-union types → `satisfies` + `Exclude<>` exhaustiveness pair.

### 2.6. The merge-phrase classifier is the single most useful safety check in this workflow

Across this campaign, every merge required the owner to type the exact phrase `merge PR #N`. Indirect language ("you decide", "go ahead", "do the merge") was blocked. This was the third campaign in this repo where the classifier mattered — the discipline is durable.

The friction is the feature: it forces the owner to BE the per-PR decision point, every time, with no possibility of an agent accidentally batching merges or rationalizing into self-driven sequencing.

**Pattern (third re-confirmation):** the merge-phrase classifier IS the system. Don't paper over it; lean into it.

---

## 3. What did NOT ship this campaign

Filed as follow-ups during this campaign:

- **[#115](https://github.com/cargotapan-collab/tac-express/issues/115)** — Observability follow-ups from PR #114 audit § 6 — the DEFERRED `detect_sla_breaches` decision + the AMBIGUOUS `isAdminOrAbove` sub-gate. Filed between PR α and PR β.

#102 sub-items NOT touched this campaign (deliberate budget — see § 2.1):
- `/api/health` endpoint — already DONE in #103; needs checkbox tick on #102
- INVOICE_PDF_SIGNING_SECRET hex validation — already DONE in `invoice-pdf-token.ts:67`; needs checkbox tick on #102
- WhatsApp delivery audit table (`whatsapp_sends` tracking)
- `as unknown as` cast cleanup (~10 sites across apps + packages)
- Document/archive orphaned UI components
- `invoice.service.ts` unit tests
- All Sprint 2 items (E2E coverage expansion, shipment/manifest/whatsapp service tests, form-variant alignment)
- All Backlog items (PITR runbook, on-call schedule, dashboard links, audit_logs table, etc.)

Owner-action remaining to close issues touched this campaign:
- **#94** — owner runs the 7-step procedure in runbook § 5.3 (≤5 min). Closure is on the owner; this campaign did everything that doesn't require running the live Sentry provisioning script.

---

## 4. The honest read

This campaign shipped 4 PRs in one continuous session. Net change to a user-facing pixel: zero. Same shape as the previous CI-hardening + Sentry tracks earlier on 2026-05-15.

But the cost of NOT doing this campaign was:
- The Sentry helpers in PR #113 (PR α's prerequisite) would have sat as dead-code surface — no actual emissions, no actual rule firing, observability "shipped" but not real.
- The pino migration would have stayed on the backlog while every API-route `console.log` continued producing unstructured stdout that's hard to grep at 2 AM.
- payment.service — the financial surface — would have stayed at 0% test coverage for at least another sprint, with the post-#8 RLS-fallback fix unverified in test code.

With this campaign shipped:
- Every alert rule has a real source-code emission feeding it (modulo `detect_sla_breaches`'s explicit DEFERRED marker).
- Owner is one ≤5-minute procedure away from closing the 6-week-old #94 alert-rule-notification issue.
- API-route logs are structured JSON in production.
- payment.service has 29 cases covering the full RPC-or-fallback decision tree + a compile-time PaymentMethod exhaustiveness sentinel.

The day's totals across all 2026-05-15 sessions:
- 10 PRs merged to main (#105 → #118)
- 286 tests → 362 tests (the prior session-pair brought 252 → 286)
- 6 canonical Sentry alert rules + cross-package tag-contract sentinel
- 6 load-bearing CI gates (audit + migrations + alert-rule-lint + registry-check + governance + bundle-size)
- 3 substantive new instrumentation modules (with-rpc, rbac-instrumentation, pino logger)
- Two test surfaces brought from 0 → real coverage (auth in PR #106, payment.service in PR #118)

**This remains a logistics company web app.** The 2-AM on-call engineer now has: a documented runbook, six load-bearing CI gates, a Sentry alert rule that actually pages them, structured JSON logs in stdout, and a financial-service test floor that covers the RLS-fallback regression that was the trigger for the whole observability arc.

---

## 5. Discipline observations

### 5.1. Did the bailout fire?
At per-PR level — NO (no PR breached the 1500-LoC cap). At per-line level — YES, once: `detect_sla_breaches` in PR α got a DEFERRED marker. That's the bailout pattern operating at the right granularity.

### 5.2. Did the no-bundle rule hold?
YES. Two near-misses to call out:
- **PR α temptation:** "while I'm wrapping `.rpc(`, I should also fix the `as unknown as` cast at `shipment.service.ts:119`." Resisted — `as unknown as` is a different #102 sub-item, deserves its own PR.
- **PR γ temptation:** "while I'm migrating console.* to pino, I could also add request-id correlation headers." Resisted — request-id correlation is its own design discussion, not a pino-migration sub-task.

Both temptations were exactly the failure mode the no-bundle rule exists to prevent.

### 5.3. Did the checkpoint protocol work?
YES, in the strict sense that no checkpoint forced an early stop. The five-question checkpoint between each PR became muscle memory by PR β — it's not a chore, it's a 30-second self-check that catches scope creep before it lands.

### 5.4. Did the issue-drift rule fire?
YES, once. Between PR α and PR β: filed #115 to track the audit § 6 follow-ups BEFORE starting PR β. Without that gate, the deferred items would have stayed unowned. Filing took 5 min; the alternative (forgetting + rediscovering them next session) costs significantly more.

### 5.5. Any near-misses?
- **The "easy ones surprise you most" rule almost bit on PR γ.** Adding pino felt like a 30-min job. Total elapsed was ~45 min including the turbo.json env-declaration surprise + the lint failure. The checkpoint discipline (run lint BEFORE pushing) caught it, but if I'd skipped lint and gone straight to push, CI would have caught it less elegantly.
- **PR δ's CodeRabbit findings were both legitimate AND non-obvious.** Not catching them in the first push isn't a failure — it's exactly why CodeRabbit exists. The discipline that mattered: read the findings carefully (don't dismiss them), fix both, reply on each thread one-by-one, push the fix in a single commit. Done in ~15 min from notification to ACK.

---

## 6. Carryforward to next session

See [`docs/NEXT-SESSION-HANDOFF.md`](../NEXT-SESSION-HANDOFF.md) (replaced as part of this campaign closeout).

**Recommended lead task for next session:**
The deferred #115 work (DEFERRED dashboard.service decision + AMBIGUOUS isAdminOrAbove sub-gate). Both are observability-completeness items, neither is correctness-critical. ~1 small PR. Good "low-energy" warm-up at session start.

After that, the highest-ROI #102 items are:
- `invoice.service.ts` unit-test floor (mirrors PR δ's pattern; ~400 LoC).
- WhatsApp delivery audit table (`whatsapp_sends`) — needs design discussion first; consider filing a brainstorming spec.

**Anti-recommendation:**
Do NOT pick up #102's `as unknown as` cast cleanup as a sweep. Each cast has its own root cause (type-system workaround, third-party type mismatch, mock builder); they don't share a uniform fix. Treat each as its own narrow PR or skip until a real refactor justifies revisiting them.

**Owner one-step-from-close:**
- **#94**: 7-step procedure in `docs/runbooks/sentry-alert-rules.md § 5.3`. ≤5 min.
- **#102 ticking**: the parent issue body needs checkbox updates for items #103, #105, #107, #108, #114, #117, #118 all silently completed without ticking. Owner can update the issue body directly OR ask an agent to draft the updated body in a follow-up.
