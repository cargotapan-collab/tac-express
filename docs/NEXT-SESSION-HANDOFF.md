# Next-Session Handoff — Start Here

> **You are picking up TAC Express after the 2026-05-15 Sentry-track session.** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last commit on `main`:** post-#111 — `feat(sentry): close #22 verification — runbook + dry-run + init test + CI lint`
**Date this doc was written:** 2026-05-15 (Sentry-track session, after the CI-hardening track)
**Author of last session:** Claude Code (Opus 4.7) in PM mode

---

## 0. READ THIS FIRST — five things you must NOT do

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5` (the GBrain four-step gate). Load it as your literal first action of every session.

2. **Do NOT bump dependencies in feature PRs.** The `npm-audit` gate has been **load-bearing** since #108 — it blocks merge on any new moderate-or-above vulnerability. If a feature PR needs a dep bump, that's a separate concern and should be its own PR. Dependabot will catch the bulk of bumps weekly.

3. **Do NOT start a new wizard (Phase 4c / 4d) without a written `tac-brainstorming` spec.** No exceptions. The Phase 4b spec → approval → ship cycle is documented in [PR #82](https://github.com/cargotapan-collab/tac-express/pull/82). Copy that template exactly.

4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** The script needs `SENTRY_AUTH_TOKEN` and the token must NOT enter the agent transcript. The owner runs it locally (one-time). Agents may inspect with `--dry-run` ONLY if a token is already present in the local env. See [docs/runbooks/sentry-alert-rules.md](./runbooks/sentry-alert-rules.md).

5. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** The classifier reads "you decide", "go ahead", "act as PM" as too indirect for `main`-branch writes. The owner must type the literal phrase `merge PR <N>` for each PR.

---

## 1. First 5 minutes — mandatory ramp

```bash
# 1. Confirm you have the latest main
git checkout main && git pull origin main

# 2. Confirm quality gates pass on a clean main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 264 tests passing (+12 sentry-init smoke tests from this session)

# 3. Confirm the load-bearing audit gate is clean
pnpm audit --prod --audit-level moderate
# Expected: "No known vulnerabilities found"

# 4. Confirm the new alert-rule lint passes
node scripts/sentry/lint-alert-rules.mjs
# Expected: "✓ canonical-rules.mjs is valid (3 rules)."
```

Then in your agent harness:

```
1. Load skill: tac-express-onboarding
2. Open: .claude/skills/RESOLVER.md
3. Match your task to a specialist skill
4. Load that skill BEFORE writing code
```

If the agent asks "what's the task?", see § 4.

---

## 2. Current state snapshot

### Open PRs (0)

No open PRs at session end. Clean slate.

### Open Issues — short list (full backlog in #102)

| # | Title | Priority | Notes |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Verify + wire Sentry alert-rule notification action | P2 | Script + runbook ship in this session; **owner runs the script** to close the live-action half |
| [#110](https://github.com/cargotapan-collab/tac-express/issues/110) | Sentry instrumentation: Supabase RPC + RBAC denial tags | P2 | Filed this session as the bailout from #22 — see § 4 |
| [#25](https://github.com/cargotapan-collab/tac-express/issues/25) | Audit + migrate dialogs/forms to react-hook-form + zod | — | Sprint-scale |
| [#54](https://github.com/cargotapan-collab/tac-express/issues/54) | OpsManagementView role-select + Invite Staff actions | follow-up | Most addressed in #104; verify residual |
| [#55–#58](https://github.com/cargotapan-collab/tac-express/issues/55) | Cosmetic follow-ups (gradient IDs, re-export move, empty-state, button label) | follow-up | ~10min each; batchable |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta | ~23 sub-items remain; see retro |

**Resolved this session:**
- [#22](https://github.com/cargotapan-collab/tac-express/issues/22) — Sentry DSN + alert-rule verification — verification artifacts shipped; closed at issue level (was already CLOSED before session, handoff doc said otherwise — corrected).

### Working-tree state

Repo synced. Working tree clean. The 35 stale local branches + 1 stash from the prior CI-hardening session may still be present — bulk-delete safe per the previous handoff (see § 6 in `SESSION-RETRO-2026-05-15.md`).

---

## 3. Critical context (the things that will trip you up)

### 3.1. CI gates are now load-bearing (audit + migrations + alert-rule)

`.github/workflows/architecture-gates.yml` runs five jobs that all block merge:

| Job | What it checks |
|---|---|
| `registry-check` | `@tac` shadcn registry in sync with sources |
| `governance` | LAW 2 / LAW 8 / design-system specifics |
| `migrations-fresh-apply` | `supabase db reset` succeeds (no broken migrations) |
| `npm-audit` | Zero moderate-or-above vulns in production deps |
| `alert-rule-lint` (**NEW this session**) | `scripts/sentry/canonical-rules.mjs` structure |
| `bundle-size` | `apps/dashboard/.bundle-budget.json` honored |

If a PR fails the alert-rule-lint job, see `docs/runbooks/sentry-alert-rules.md § 7`.

### 3.2. Sentry alert-rule provisioning is owner-runnable + idempotent

PR #105 added `scripts/sentry/create-alert-rules.mjs`. This session refactored the rule definitions into [`scripts/sentry/canonical-rules.mjs`](../scripts/sentry/canonical-rules.mjs) and added:

- `--dry-run` flag (no writes; prints the diff)
- A third canonical rule (`Production error volume spike` — frequency-based)
- CI lint job that validates rule structure without calling Sentry
- 12 smoke tests covering the SDK init wiring (DSN, env, release, privacy posture)
- A complete owner runbook at [docs/runbooks/sentry-alert-rules.md](./runbooks/sentry-alert-rules.md)

**Owner one-time setup remaining:** run the script live once (with `SENTRY_AUTH_TOKEN` from `apps/dashboard/.env.local`) to provision the rules in Sentry. Then fire a synthetic event via `/api/diagnostics/sentry` to verify end-to-end. See runbook § 0 + § 5.

### 3.3. Two planned alert rules require source-code instrumentation

Issue #22's acceptance criteria asked for three rules:

- **(a)** Unhandled exceptions >5/min → **shipped** as `Production error volume spike` (no instrumentation needed; generic level≥error filter)
- **(b)** Supabase RPC failures tagged at error level → **pending** — needs `packages/services` to call `Sentry.setTag('source', 'supabase_rpc')` on RPC-error `captureException` paths
- **(c)** Auth/RBAC denial spike >20/min → **pending** — needs `packages/auth` to `captureException` with `kind: 'rbac_denial'` from the role-gate failure path

`packages/auth` and `packages/services` currently have **zero** Sentry instrumentation. Adding the instrumentation + appending the two rules to `canonical-rules.mjs` is a single focused PR — see § 4 Option A.

### 3.4. v7 design opt-in via localStorage (unchanged from prior handoff)

```js
localStorage.setItem('tac-design', 'v7'); location.reload()  // see v7
localStorage.setItem('tac-design', 'v6'); location.reload()  // back to default
```

### 3.5. Auth-package test floor (unchanged from prior handoff)

`packages/auth/src/rbac.test.ts` has a `UserRole` completeness sentinel. New role → sentinel fails → developer must update each authorization matrix with conscious intent.

---

## 4. Your first task — recommended

### Option A — Sentry instrumentation for Supabase RPC + RBAC tags (~1 hour) RECOMMENDED

The natural close to this session's bailout. The runbook + script + lint already accept new rules; the missing piece is the source-code emission of the tags the rules will filter on.

```
1. Load skills: tac-express-onboarding → tac-tdd (mocked Sentry tests follow the
   same pattern as apps/dashboard/sentry-init.test.ts)
2. Add packages/services instrumentation:
   - Wrap the Supabase RPC call sites (search for `.rpc(`) in a thin helper
     that captures error responses to Sentry with setTag('source', 'supabase_rpc')
   - Test: mock the Supabase client, fire an RPC error, assert
     captureException was called with the tag
3. Add packages/auth instrumentation:
   - In the role-gate denial path (withRole / canAccess failure), call
     captureException with setTag('kind', 'rbac_denial')
   - Test the same way
4. Append two new entries to scripts/sentry/canonical-rules.mjs covering the
   new tags + the lint will validate them automatically
5. Update docs/runbooks/sentry-alert-rules.md § 4 — move rows 4 + 5 from
   "Not yet shipped" to the active table
6. Open PR — should be ~200-400 LoC across packages/auth, packages/services,
   scripts/sentry, and one runbook tweak
```

Why this is the right next task:
- Closes the structural half of observability (rules without sources are dead config).
- Pairs cleanly with the rule schema this session shipped.
- ~1 hour of focused work; revertible per package.
- After this lands, the owner runs the script once and #94 closes.

### Option B — Payment service test floor (~1 focused session)

`packages/services/src/payment.service.ts` is high-risk (money flows) with 0% coverage. PR #106 established the pattern. Apply it: write `payment.service.test.ts` with state-machine + edge-case coverage.

### Option C — Cosmetic follow-ups (#54–#58) (~1 hour, batchable)

Five small UI items, ~10 min each. Bundle as one PR titled "chore(ui): cosmetic follow-ups for #54-58". Good "low-energy session" or "warm-up" work.

### Option D — Start NextAdmin Phase 4c (New Manifest wizard) (~one focused session)

Same template as Phase 4b. Use PR #82 as the reference. Generalize `useShipmentDraft` to `useFormDraft<T>` first.

---

## 5. Quick reference

### Skills you'll load most

```
tac-express-onboarding   # Mandatory first action of every session
tac-brainstorming        # Mandatory before any new feature
tac-tdd                  # Mandatory for any non-trivial unit
tac-karpathy-discipline  # Apply to everything
tac-fourteen-laws        # When uncertain whether something is allowed
tac-forms                # When touching any form
tac-ui-authoring         # When writing any UI component
tac-data-layer           # When writing services or hooks
tac-supabase-schema      # When touching migrations / RLS / RPCs
tac-domain-logistics     # When touching shipments / manifests / AWBs
tac-debug                # When something breaks (root-cause first)
tac-code-review          # Pre-merge or pre-PR
```

### Common commands

```bash
# Quality gates (run before every commit)
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate

# Lint the canonical Sentry alert rules (no token, no network)
node scripts/sentry/lint-alert-rules.mjs

# Dry-run the Sentry alert-rule provisioning (no writes; needs token for GET)
SENTRY_AUTH_TOKEN=<token> node scripts/sentry/create-alert-rules.mjs --dry-run

# Provision Sentry alert rules live (owner, one-time)
SENTRY_AUTH_TOKEN=<token> node scripts/sentry/create-alert-rules.mjs

# Regenerate Supabase types from production (no Docker needed)
pnpm exec supabase login           # one time
pnpm supabase:types:remote         # writes packages/database/src/database.types.ts

# Roll back a single PR after merge
gh pr revert <PR#>
```

### Key file locations

```
# Roadmap + planning
docs/SESSION-RETRO-2026-05-15.md               # May-15 CI-hardening retro
docs/retros/2026-05-15-pm-sentry-track.md      # This session's retro (Sentry track)
docs/NEXT-SESSION-HANDOFF.md                   # ← this file
docs/ROLLBACK-PLAYBOOK.md                      # 5-layer rollback recipes
docs/runbooks/sentry-alert-rules.md            # Sentry alert-rule owner playbook (NEW this session)

# Core rules + skills
CLAUDE.md
AGENTS.md
DESIGN_SYSTEM.md
.claude/skills/RESOLVER.md
.claude/skills/conventions/

# Sentry observability (this session)
scripts/sentry/canonical-rules.mjs             # Single source of truth for alert-rule definitions
scripts/sentry/create-alert-rules.mjs          # Owner-runnable provisioning script (+ --dry-run)
scripts/sentry/lint-alert-rules.mjs            # CI gate (no token, no network)
apps/dashboard/sentry.{server,edge,client}.config.ts  # SDK init (verified by smoke test)
apps/dashboard/sentry-init.test.ts             # 12-case mocked init wiring test
apps/dashboard/instrumentation.ts              # Next.js register hook → wires the configs

# Reference implementations
packages/ui/src/components/composed/customers/v7-customer-form.tsx
packages/ui/src/components/composed/shipments/v7-create-shipment-wizard.tsx
packages/ui/src/hooks/use-shipment-draft.ts
packages/auth/src/rbac.test.ts
```

---

## 6. The discipline pattern that worked this session

Sentry track shipped one focused PR by **honoring the bailout clause** in the prompt: when the acceptance criteria required source code that didn't exist (the (b)+(c) tag emissions in `packages/auth` and `packages/services`), the agent stopped and scoped a follow-up issue rather than silently expanding the PR.

```
For each acceptance criterion:
1. Check what the codebase actually emits today
2. If the rule depends on un-emitted tags → file a follow-up issue
3. Ship only the rule + harness that works with current source code
4. Document the deferred work in the runbook + handoff
```

This is the inverse of "force the original scope through." The user's bailout clause was load-bearing — without it, the PR would have either (a) shipped dead alert rules that never fire (bad) or (b) bundled `packages/auth` + `packages/services` instrumentation into the same change (worse — violates the one-concern-per-PR rule from #14).

---

## 7. The honest read

The Sentry observability floor now has:
- A documented owner runbook + dry-run path
- A CI lint that catches malformed rule definitions on PR
- 12 mocked smoke tests verifying the SDK init contract
- Three canonical rules — one of which (volume-spike) closes the (a) criterion of #22 with no instrumentation work needed
- A clean punch list (`canonical-rules.mjs` "Coverage matrix" comment) for what's still missing

The two deferred rules (b)+(c) are not a regression — they're correctly scoped follow-up work. The next session has a ~1-hour task that closes both alert-rule planning AND adds the first Sentry instrumentation to `packages/auth` and `packages/services`. That instrumentation will pay dividends across the entire RBAC + RPC surface area, not just these two rules.

**This remains a logistics company web app.** Every observability decision serves the on-call engineer who needs to know within 60 seconds when a payment recording fails, a manifest scan times out, or an RBAC gate is being probed. The CI hardening + Sentry track from this set of sessions don't move a single pixel — but they're the substrate every future PR runs on.

---

**You've got the map. Load the skills. Pick a task from § 4. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff for the session after you. The discipline carries forward by hand, every time.
