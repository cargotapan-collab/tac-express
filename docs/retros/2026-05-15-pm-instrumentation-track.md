# Session Retro — 2026-05-15 PM (Instrumentation-track)

> Backwards-looking arc. Captures what shipped, why, what was learned. Permanent artifact (datestamped filename, not updated in place). Companion to:
>
> - [`docs/SESSION-RETRO-2026-05-15.md`](../SESSION-RETRO-2026-05-15.md) (CI-hardening track)
> - [`docs/retros/2026-05-15-pm-sentry-track.md`](./2026-05-15-pm-sentry-track.md) (Sentry-harness track)

**Author:** Claude Code (Opus 4.7), PM-mode
**Branch state at session start:** `main` at `3a02799` (post-#111)
**Branch state at session end:** `main` at `<post-PR-#113>` (single squash merge)
**Total commits added to main:** 1 squash merge

---

## 0. TL;DR

| PR | Title | Net effect |
|---|---|---|
| #113 | feat(sentry): packages/auth + packages/services Sentry instrumentation | Closes #110. Two helper modules + DI injector + canonical alert rules (b)+(c) wired end-to-end. 22 new tests (264 → 286). Adoption at 1 of 7+ sites; follow-up #112 covers the rest. |

Closing snapshot:
- 286 tests passing (264 → 286; +22 from this PR's three new test files)
- Six CI gates load-bearing on main (unchanged from #111)
- Five canonical Sentry alert rules (3 → 5; rules (b)+(c) added)
- Two new instrumentation modules + one cross-package contract sentinel
- One representative adoption at `payment.service.ts` → follow-up #112 covers the other 6 service files + RBAC call-site audit

---

## 1. The arc

### Phase 1 — Premise check

The handoff doc (replaced in #111) flagged #110 as the lead task and estimated ~200-400 LoC across ~1 hour. Premise checks during context load:

1. **`packages/auth` has no central denial path.** `canAccess` / `canDo` / `hasMinimumRole` return booleans. Callers decide whether `false` means "hide UI element" (silent) or "page-worthy denial" (alert). So packages/auth can't "instrument its denial path" — there isn't one. It needs to *provide* one.

2. **`packages/services` has 7 files with `.rpc(` calls.** Migrating all 7 in one PR would push the diff past §7a's 1500-LoC cap and re-trigger the bailout. The user prompt anticipated this: *"Ship the smallest correct PR that emits the two specific tag shapes that rules (b)+(c) consume from the canonical denial path and a single representative RPC wrapper."*

3. **`apps/web` does NOT depend on `@sentry/nextjs`.** A direct import of Sentry in `packages/services` would either force apps/web to install it or break apps/web's build. Same for `packages/auth`.

4. **`#110`'s example code used different tag shapes than the user's CURRENT prompt.** The issue body proposed `setTag('kind', 'rbac_denial')` and `setTag('source', 'supabase_rpc')`. The current prompt asked for `rbac.denial=true` + namespaced sub-keys, and `supabase.rpc=true` + namespaced sub-keys. Prompt wins.

### Phase 2 — Architecture decisions

Three coupled design decisions, each forced by the premise-check findings:

| Decision | Why |
|---|---|
| **Dependency injection over direct Sentry import.** Each package exports `registerSentry(emitter)` + `emitTaggedException(err, tags)`. `apps/dashboard/sentry-wire.ts` injects `@sentry/nextjs` at startup. | Apps without Sentry (apps/web) get silent no-ops; apps with Sentry get full emission. Avoids the peerDependency + bundle-bloat tradeoff. |
| **packages/auth ships `captureRbacDenial` helper; doesn't migrate call sites.** | The denial path lives in callers. The helper IS the canonical denial path packages/auth now offers. Adoption at every `canAccess` call site is a separate, larger concern → follow-up #112. |
| **packages/services ships `withRpc` wrapper + `captureSupabaseRpcError` lower-level; adopts only at `payment.service.ts:record_invoice_payment`.** | One representative adoption proves the wrapper works end-to-end. The other 6 service files + their fallback branches are domain-specific (each needs care about which error codes are expected fallbacks vs. real failures) and don't fit in one focused PR. |

### Phase 3 — Implementation in five commit-sized concerns

| Commit | Concern | Files |
|---|---|---|
| 1 | packages/auth instrumentation | `sentry-tagger.ts`, `rbac-instrumentation.ts`, `index.ts` |
| 2 | packages/services instrumentation + payment.service adoption | `shared/sentry-tagger.ts`, `shared/with-rpc.ts`, `payment.service.ts`, `index.ts` |
| 3 | apps/dashboard wiring | `sentry-wire.ts`, three `sentry.*.config.ts` edits |
| 4 | canonical-rules + lint extension + tests | `canonical-rules.mjs` (rules 4+5, EMITTED_TAG_KEYS, tagged_event validator), three test files |
| 5 | runbook + handoff + retro | `docs/runbooks/sentry-alert-rules.md`, `docs/NEXT-SESSION-HANDOFF.md`, this file |

All five quality gates green at session close:
- `pnpm typecheck` ✓ (all 7 workspaces)
- `pnpm lint` ✓ (max-warnings 0)
- `pnpm test` ✓ (286 / 286)
- `pnpm audit --prod --audit-level moderate` ✓
- `node scripts/sentry/lint-alert-rules.mjs` ✓ (5 rules valid; tagged_event validation extended)

---

## 2. Strategic findings + lessons

### 2.1. The cross-package contract sentinel is the most valuable test in this PR

The user prompt asked for: *"Sentinel test: assert that every tag key referenced in canonical-rules.mjs (b)+(c) IS actually emitted by the codebase. This is the load-bearing contract — if a future refactor deletes a tag emission, this test must fail."*

Implemented as `apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts`. It pulls in three artifacts from three different packages:

- `RBAC_DENIAL_TAG_KEYS` from `@workspace/auth`
- `SUPABASE_RPC_TAG_KEYS` from `@workspace/services`
- `CANONICAL_RULES` + `EMITTED_TAG_KEYS` from `scripts/sentry/canonical-rules.mjs`

And asserts they all reference the same string set. A rename in any of the three causes a loud test failure in CI, forcing the developer to align all three. Without this test, the three artifacts could silently drift — a rename in the package would leave the alert rule filtering on a tag no code emits anymore (dead config in Sentry).

**Pattern:** When three files must share a string constant, write a sentinel test that imports from all three and asserts equality. Don't try to share the string itself across the language/file-format boundary — JS strings, Markdown text, and YAML values can't reliably be DRYed up, but they CAN be verified.

### 2.2. Dependency injection is the right pattern for cross-package observability

Three candidate approaches were considered:

| Approach | Why rejected |
|---|---|
| Direct `import * as Sentry from "@sentry/nextjs"` in each package | apps/web doesn't have @sentry/nextjs; would either break its build or force a transitive dep that bloats its bundle. |
| `@sentry/nextjs` as a `peerDependency` | pnpm strict-peer-dependencies would still pull it into apps/web. Same problem. |
| Dynamic `import().catch()` with try/catch | Forces the emission API to be `async`, which is awkward for synchronous denial gates. |
| **Dependency injection (chosen)** | Each package owns a tiny `registerSentry()` injector; apps/dashboard registers at instrumentation time; apps without Sentry silently no-op. Zero new deps, synchronous API, fail-quiet posture matches PR #111. |

The DI pattern also future-proofs: if we ever add Datadog / OTLP / an audit-log table as an additional backend, the package side doesn't change at all — only the injector implementation in `apps/dashboard/sentry-wire.ts` does.

**Pattern:** When a workspace package needs an instrumentation backend that not all consumers have, inject the backend rather than importing it.

### 2.3. Lint extension was free; lint extension PLUS tag-key validation was load-bearing

The user prompt said: *"If the lint rule's validation surface needs to grow (new required field for tag-based filters), extend it — but only as far as the new rules require."*

The minimum extension was: validate that `TaggedEventFilter` entries have string `key`/`value`/`match`. (Sentry's REST API returns a confusing 400 if `key: undefined`.)

But while extending the validator, the natural next check was: validate that `filter.key` is in `EMITTED_TAG_KEYS`. That catches a strictly larger class of bug — not just "filter is malformed" but "filter is well-formed but references a tag the codebase doesn't emit." The latter is the silent-failure mode that makes alert rules dead-config.

Cost: ~10 LoC. Benefit: a class of bug that would otherwise only surface when the owner runs the script and the rule shows up in Sentry but never fires. Definition-correctness gate strengthened.

**Pattern:** When extending a validator for a specific new check, look for the strictly larger class of similar bug. The 10 extra LoC often catches an order of magnitude more issues.

### 2.4. "Adopt at one canonical site" is the right scope for representative-wrapper PRs

The bailout activated cleanly: the PR ships the wrapper + one adoption site, not the full migration. Without this discipline:

- Migrating all 7 service files would have been ~400-700 LoC of mechanical edits, each requiring per-call-site judgment (which errors are "real failures" vs. "expected fallback codes")
- The PR would have grown to 1500+ LoC and either blown the §7a cap or required a per-call-site review that doesn't fit in one focused PR
- Bot review (CodeRabbit / Macroscope) would have been hard-pressed to validate each migration without context on the specific RPC's fallback semantics

The follow-up issue #112 inherits the helper as a stable API + the adoption pattern proven at `payment.service.ts`. Migrating the remaining 6 files is mechanical with clear precedent.

**Pattern (third use of the bailout in three sessions):** wrapper + one canonical adoption + follow-up issue. This is now the standard shape for "introduce a new cross-cutting helper" PRs in this repo.

### 2.5. The instrumentation must never throw

Both `emitTaggedException` wrappers are guarded with `try/catch` that swallows backend exceptions. Rationale documented inline:

```ts
try {
  registered.captureException(error, tags)
} catch {
  // Swallow — instrumentation throwing would mask the actual error.
}
```

This is non-negotiable. If `Sentry.captureException` itself throws (network blip, malformed config, breakpoint in dev), the worst possible outcome is for that throw to propagate out of the instrumentation path and mask the actual RBAC denial / RPC error the caller was trying to handle. The test `swallows backend exceptions` in both test files pins this.

**Pattern:** Instrumentation code is implicitly safety-critical. Treat it like a `finally` block — it should never be the thing that breaks the surrounding flow.

---

## 3. What did NOT ship this session

Filed as follow-up #112:

- Migration of the other 6 service files (`manifest`, `shipment`, `booking`, `rate-card`, `exception`, `dashboard`) to `withRpc` — each needs per-call-site review of which error codes are expected fallbacks vs. real failures.
- Adoption of `captureRbacDenial` at API routes / server actions / server components that gate on `canAccess`/`canDo`. The helper is shipped; production call sites haven't migrated yet. Until they do, rule 5 (RBAC denial spike) will never fire — documented intent in the runbook.
- Owner-runnable verification: run the alert-rule provisioning script live, then synthesize the rule-4 + rule-5 events per the runbook recipes. Once verified, comment on #94 + close.

Other backlog (unchanged from prior session):
- Unit-test floor for `packages/services/payment.service.ts` (high-risk surface; this PR only added instrumentation)
- E2E coverage expansion
- Cosmetic follow-ups #54–#58 (small, batchable)
- #25 RHF + zod migration

---

## 4. The honest read

This PR is structural observability: it makes RBAC denials and Supabase RPC failures *visible* in Sentry. It does not by itself make any of those events visible — the call sites have to opt in to the helpers. The follow-up #112 is what closes that loop.

The pattern matters more than the per-call-site coverage right now. Three coupled artifacts (package emission, canonical rule, EMITTED_TAG_KEYS) are now contract-bound by a test, a CI gate, and a runbook. Any future addition to the observability surface inherits that contract — the workflow for "add a new alert rule with new tags" is now codified:

1. Add the tag-key constant + emission helper in the relevant package
2. Append the rule to `canonical-rules.mjs` keyed off the same constants
3. Add the tag key to `EMITTED_TAG_KEYS`
4. Run the sentinel test; if green, the three artifacts are in sync
5. Owner runs the script + synthesizes an event per the runbook

That workflow didn't exist before this PR. It does now. Future Sentry surface (e.g. WhatsApp delivery failures, signed-URL forgery attempts, webhook signature mismatches) plugs into it without re-deriving the architecture.

**This remains a logistics company web app.** Every observability decision serves the on-call engineer who needs to know within 60 seconds when a payment recording fails, a manifest scan times out, or an RBAC gate is being probed. The runbook recipes are how an on-call engineer at 2 AM verifies the alert pipeline is actually live without paging the PM.

---

## 5. Carryforward to next session

See [`docs/NEXT-SESSION-HANDOFF.md`](../NEXT-SESSION-HANDOFF.md). The Sentry-track version is superseded; the new version captures post-#113 state.

**Recommended lead task:** follow-up #112 — migrate the 6 remaining service files to `withRpc`, audit the 15+ `canAccess`/`canDo` call sites for adoption of `captureRbacDenial`. Splittable into two smaller PRs if needed (services migration; auth call-site adoption). ~300-500 LoC.

**Anti-recommendation:** do not adopt `captureRbacDenial` everywhere — apply judgment per call site. UI conditional rendering (`use-rbac.ts` consumers) is not page-worthy; server-side gates that 403/redirect are. Document the choice per site in the PR description.
