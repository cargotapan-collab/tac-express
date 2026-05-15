# Next-Session Handoff — Start Here

> **You are picking up TAC Express after the pre-Sprint-2 consolidation session.** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last commit on `main`:** `<post-PR β>` — `docs: CodeRabbit catalog + two-day arc chapter retro consolidation`
**Date this doc was written:** 2026-05-16 (consolidation session — PRs #124 + this PR)
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO simultaneously

---

## 0. REQUIRED PRE-READING (added by the consolidation session)

Before writing ANY code in a session, load these two artifacts:

1. **[`docs/patterns/coderabbit-catalog.md`](patterns/coderabbit-catalog.md)** — 9 entries × 4 categories. The accumulated test-pattern discipline from PRs #114/#117/#118/#120/#121/#123. Several are CodeRabbit long-term-memory learnings — writing the pattern correctly first time saves the round-trip.

2. **[`docs/retros/2026-05-15-2026-05-16-two-day-arc.md`](retros/2026-05-15-2026-05-16-two-day-arc.md)** — chapter-level retro covering the 16-PR arc. § 1 (what survived), § 5 (cadence shift), § 8 (honest read) are the load-bearing sections.

Plus this file's § 1 (cadence pre-commit) below.

---

## 1. CADENCE PRE-COMMIT (load-bearing — read FIRST)

**Starting with the session after this one, the cadence shifts.**

The 2026-05-15 work pattern was multi-PR campaigns: 3-5 sequential PRs in one session, each 30-400 LoC, gated by per-PR owner-typed merge phrases. That cadence was right for the work-shape of those days — small enough that the per-PR overhead (branch + audit + commits + tests + retro + PR + CI + merge) was a non-trivial fraction of total time.

**Sprint 2 is different.** The remaining service-test items are session-scale individually:

| Sprint 2 item | Size | Session shape |
|---|---|---|
| `shipment.service.ts` test floor | ~9.2KB source, ~400-600 LoC tests | ONE PR per session |
| `manifest.service.ts` test floor | ~7.3KB source, ~400-600 LoC tests | ONE PR per session |
| `whatsapp.service.ts` test floor | ~18KB source, external integration, ~600-900 LoC tests | ONE PR per session, possibly TWO |
| E2E flows (5 named in #102) | Each touches multiple route handlers + dashboard fixtures | ONE PR per flow, possibly stretched |

**Pre-commit:** starting with the NEXT session, the pattern shifts:
- **ONE PR per session, NOT 3-5.**
- The per-PR retro IS the session retro — no separate campaign-level retro needed.
- Mandatory context load expands to include the cumulative discipline observations from this two-day arc (see § 7 below).
- The handoff doc each session produces should NAME the cadence explicitly if the agent finds itself wanting to spawn additional branches.

If the next session attempts a multi-PR campaign on Sprint 2 work, that's the signal this pre-commit didn't transfer. Failure mode: the agent reads "campaign retro" in prior docs and carries the multi-PR shape forward by inertia. **DO NOT.** A session that ships one disciplined ~500-LoC test floor is fully productive; spawning a second PR on top of that within the same session is the smell.

---

## 2. READ THIS FIRST — six things you must NOT do

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5`.

2. **Do NOT bump dependencies in feature PRs.** The `npm-audit` gate has been load-bearing since #108.

3. **Do NOT add Sentry tag keys without updating all four artifacts** (the cross-package tag-emission contract — see § 3.1).

4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner runs it locally with the auth token (still pending — #94).

5. **Do NOT regress to `console.*` in the three pino-migrated API routes.** Sentinel at `apps/dashboard/__tests__/api-routes-no-console.test.ts`.

6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.

---

## 3. First 5 minutes — mandatory ramp

```bash
# 1. Confirm you have the latest main
git checkout main && git pull origin main

# 2. Confirm quality gates pass on a clean main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 465 tests passing (post-#124 ci-watch fix)

# 3. Confirm the load-bearing audit gate is clean
pnpm audit --prod --audit-level moderate
# Expected: "No known vulnerabilities found"

# 4. Confirm the alert-rule lint passes (6 rules)
node scripts/sentry/lint-alert-rules.mjs
# Expected: "✓ canonical-rules.mjs is valid (6 rules)."
```

Then in your agent harness:

```
1. Load skill: tac-express-onboarding
2. Open: .claude/skills/RESOLVER.md
3. Match your task to a specialist skill
4. Load that skill BEFORE writing code
```

---

## 4. Current state snapshot

### Open PRs (0)

Clean slate.

### Open Issues — short list

| # | Title | Priority | Notes |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Verify + wire Sentry alert-rule notification action | P2 | **5-min owner action.** Runbook § 5.3 has the 7-step procedure. Activates the full observability arc. |
| [#122](https://github.com/cargotapan-collab/tac-express/issues/122) | CI-watch helper rebinds to stale sha after force-push | tech-debt | Filed during the post-#121 debrief. Tooling debt; ~10-20 LoC fix. |
| [#25](https://github.com/cargotapan-collab/tac-express/issues/25) | Audit + migrate dialogs/forms to react-hook-form + zod | — | Sprint-scale |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta | ~16 sub-items remain |

**Resolved during recent sessions:** #22, #110, #112, #115, plus the invoice.service test floor sub-item from #102 ticked by this PR.

### #102 checkboxes worth ticking (owner action)

Updated paste-ready blob in the PR body of this PR's commit. Notable from this session:
- **Unit tests for `packages/services/src/invoice.service.ts`** → DONE in this PR. 40 cases.

---

## 5. Critical context (the things that will trip you up)

### 5.1. Cross-package tag-emission contract — three-level enforcement

(Same as the post-#120 handoff — unchanged.)

| Level | Artifact |
|---|---|
| CI gate | `node scripts/sentry/lint-alert-rules.mjs` |
| Vitest sentinel | `apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts` |
| Runbook | `docs/runbooks/sentry-alert-rules.md § 4` |

### 5.2. Shared mock-db helper now extracted

PR #118's inline `makeDb` was extracted to `packages/services/src/__tests__/helpers/make-db.ts` as commit 1 of this PR. **Use this helper for all new service tests.** The older `helpers/mock-db.ts` exposes a different (heavier) shape used by hub.service.test.ts and others — leave it alone.

Distinction:
- `makeDb` (new canonical shape) — focused `{ rpcResult, fromResults }` config; light surface; let withRpc + sentry-tagger run as real code. Use for new service tests.
- `mockDb` (older) — DeepPartial<SupabaseClient> overrides with full client API. Use only if storage/auth surfaces are needed.

### 5.3. Six CI gates load-bearing on main

Unchanged: `registry-check`, `governance`, `migrations-fresh-apply`, `npm-audit`, `alert-rule-lint`, `bundle-size`.

### 5.4. invoice.service.ts has no Sentry instrumentation

Documented in the test file docstring as an explicit absence. If a future refactor adds `captureSupabaseRpcError` calls (e.g. wrapping a new RPC), the negative-assertion sentinel at the bottom of `invoice.service.test.ts` will fail, forcing the developer to update `EMITTED_TAG_KEYS` + the cross-package contract sentinel.

### 5.5. CodeRabbit pattern catalog (carry-forward across all future PRs)

Three patterns this codebase has now learned to preempt:

| Pattern | Source PR | Rule |
|---|---|---|
| Multi-step `.from()` chains | PR #118 | Use `toHaveBeenNthCalledWith(1, ...), (2, ...)` + `toHaveBeenCalledTimes(N)`. Never bare `toHaveBeenCalledWith` on multi-step paths. |
| Enum exhaustiveness (string-unions) | PR #118 | `satisfies readonly EnumType[]` + `Exclude<EnumType, (typeof list)[number]>`. Not `Object.values` for assertion matrices. |
| Marker line numbers | PR #120 | NEVER hardcode line numbers in test assertions or marker comments. Use stable symbol references. |
| File-level `toContain` | PR #120 | Too coarse. Use anchor-scoped ±N-char windows. |
| `existsSync` for file invariants | PR #121 | Add `statSync(path).isFile()` — `existsSync` returns true for directories. |
| Regex narrow to current data | PR #121 | Generalize. Don't hardcode `../../`-prefix when matching relative links. |

---

## 6. Your first task — recommended

Per the cadence pre-commit (§ 1), pick ONE of these — not multiple in the same session:

### Option A — `shipment.service.ts` test floor (~one focused session) RECOMMENDED

The natural successor to this PR. ~9.2KB source — slightly larger than payment.service or invoice.service. Mirror this PR's structure: PHASE-A audit matrix first, then test file using the same `makeDb` helper, same `freshShipmentService()` factory shape, same CodeRabbit preempts.

Estimate: ~500-700 LoC test code, ~50-60 cases, one disciplined session.

**Concrete starter:** the service has an RPC call (`generate_awb_number`, `bulk_create_shipments` per PR #114's audit) AND a SELECTIVE adoption (`bulk_create_shipments` uses `captureSupabaseRpcError` on the real-error branch, skips the issue-#19 fallback). That's BOTH branches of PR #118's RPC-or-fallback decision tree applicable here — full pattern reuse.

### Option B — Owner runs the #94 procedure (5 min, owner-only)

Not an agent task. Flag explicitly so the owner can knock it out. After this, #94 closes and the observability arc is fully live.

### Option C — Fix #122 (CI-watch friction) — small standalone tooling PR (~30 min)

The CI-watch helper rebinds to stale sha after force-push. Filed during the post-#121 debrief. ~10-20 LoC fix. Low priority but bundleable into a small session if Option A doesn't fit the available time window.

---

## 7. Cumulative discipline observations (carry-forward — required reading for Sprint 2)

Distilled from the two-day arc (PRs #105 → this PR). These are the patterns that survived the bot-review loop, the bailout clause activations, and the per-PR retros. Next session's mandatory context load includes this section.

### 7.1. PHASE-A audit document IS the load-bearing artifact

When a PR sweeps a pattern across many sites (PR #114) or covers a complex method tree (PR #118 + this PR), the method × branch × error matrix written BEFORE any test code is what keeps the work coherent. The matrix can live in the PR body or as a committed scratch doc. Either way: produce it first, commit it before the test code, treat it as the binding contract.

### 7.2. Forcing-function sentinel pattern

Across PR #114 (BLOCK adoption), #117 (pino migration), #120 (silent-by-design), #121 (audit-doc references): every cross-cutting contract this codebase ships now has a sentinel test that fails loudly when the contract drifts. The pattern is:
- A hardcoded list (or auto-extracted with a meta-sentinel asserting ≥1 element)
- An assertion that each list item maps to source-of-truth (file/symbol/marker present)
- A meta-sentinel pinning the list size — forcing conscious intent on additions/removals

This is now standard. Every new contract should ship with its sentinel.

### 7.3. Bailout fires at per-line granularity, not just per-PR

`SENTRY-SILENT-BY-DESIGN` (#115) is the bailout at a per-call-site level. Leaving an explicit marker + decision tree inline + follow-up issue is the right tradeoff when the surrounding sweep is otherwise mechanical and one site needs design judgment.

### 7.4. CodeRabbit findings are signal, not friction

Five PRs in this arc shipped CodeRabbit-improved iterations (#118, #120, #121, plus two on prior PRs). Every Major finding was legitimate. The discipline: read findings carefully, fix the underlying issue, reply on the thread, push. Don't dismiss as noise.

### 7.5. Merge-phrase classifier is the system

Every merge across this arc required the owner to type `merge PR <N>` exactly. The friction is the feature.

### 7.6. Shared helpers extract on second use, not first

The `makeDb` was inline in PR #118. It got extracted in THIS PR (commit 1) when needed for a second test file. That's the right timing — first instance proves the pattern, second instance triggers the extraction. Don't pre-abstract.

---

## 8. Common commands

```bash
# Quality gates
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate

# Alert-rule lint
node scripts/sentry/lint-alert-rules.mjs

# Cross-package tag-contract sentinel
pnpm vitest run apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts

# Service test floors (all passing)
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts    # 29 cases
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts    # 40 cases
pnpm vitest run packages/services/src/__tests__/silent-by-design.test.ts   # 11 cases

# Audit-doc-references sentinel
pnpm vitest run apps/dashboard/__tests__/audit-doc-references.test.ts      # 41 cases

# Owner-runnable Sentry provisioning (NEVER in agent transcript)
SENTRY_AUTH_TOKEN=<token> SENTRY_ALERT_NOTIFICATION_ACTION='<json>' node scripts/sentry/create-alert-rules.mjs
```

---

## 9. Key file locations

```
# Planning + retros
docs/SESSION-RETRO-2026-05-15.md                       # May-15 CI-hardening retro
docs/retros/2026-05-15-pm-sentry-track.md              # PR #111
docs/retros/2026-05-15-pm-instrumentation-track.md     # PR #113
docs/retros/2026-05-15-pm-pr112-adoption.md            # PR #114
docs/retros/2026-05-15-pm-campaign-track.md            # 5-PR campaign retro
docs/retros/2026-05-16-invoice-service-tests.md        # this PR's retro
docs/NEXT-SESSION-HANDOFF.md                           # ← this file
docs/runbooks/sentry-alert-rules.md                    # Sentry alert-rule playbook
docs/audits/2026-05-15-rbac-denial-audit.md            # PHASE-A audit reference

# Service test floors (the pattern)
packages/services/src/__tests__/helpers/make-db.ts     # CANONICAL shared mock builder
packages/services/src/__tests__/payment.service.test.ts # template
packages/services/src/__tests__/invoice.service.test.ts # this PR

# Sentry observability — packages
packages/auth/src/sentry-tagger.ts
packages/auth/src/rbac-instrumentation.ts
packages/services/src/shared/sentry-tagger.ts
packages/services/src/shared/with-rpc.ts

# Sentry observability — apps + scripts
apps/dashboard/sentry-wire.ts
apps/dashboard/sentry.{server,edge,client}.config.ts
apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts
apps/dashboard/__tests__/rbac-block-adoption.test.ts
apps/dashboard/__tests__/api-routes-no-console.test.ts
apps/dashboard/__tests__/audit-doc-references.test.ts
scripts/sentry/canonical-rules.mjs
scripts/sentry/create-alert-rules.mjs
scripts/sentry/lint-alert-rules.mjs

# Core rules + skills
CLAUDE.md
AGENTS.md
DESIGN_SYSTEM.md
.claude/skills/RESOLVER.md
```

---

## 10. The honest read

The two-day arc shipped 14 PRs (#105 → this PR), grew tests from 252 → 454, added 6 canonical Sentry alert rules + 6 load-bearing CI gates + 4 sentinel test files following the same forcing-function discipline.

This PR closes the last comfortably-session-scale-fits-in-a-session test floor. The remaining Sprint 2 items (shipment/manifest/whatsapp) are each a session by themselves. The cadence pre-commit in § 1 is the load-bearing carry-forward.

**Recommended one-line summary for the next session's prompt:** "Mirror this PR's pattern verbatim for shipment.service.ts. ONE PR. Take the full session."

---

**Load the skills. Re-read § 1 (cadence pre-commit). Pick a task from § 6. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff.
