# Next-Session Handoff — Start Here

> **You are picking up TAC Express after the 2026-05-15 PM CI-hardening session.** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last commit on `main`:** `87e860b` — `ci(arch-gates): make npm-audit load-bearing (#108)`
**Date this doc was written:** 2026-05-15 (PM session)
**Author of last session:** Claude Code (Opus 4.7) in PM mode

---

## 0. READ THIS FIRST — four things you must NOT do

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5` (the GBrain four-step gate). Load it as your literal first action of every session.

2. **Do NOT bump dependencies in feature PRs.** The `npm-audit` gate is now **load-bearing** (per #108) — it blocks merge on any new moderate-or-above vulnerability. If a feature PR needs a dep bump, that's a separate concern and should be its own PR with rationale. Dependabot will catch the bulk of bumps weekly. If you find yourself bumping in a feature PR, stop and split.

3. **Do NOT start a new wizard (Phase 4c / 4d) without a written `tac-brainstorming` spec.** No exceptions. The Phase 4b spec → approval → ship cycle is documented in [PR #82](https://github.com/cargotapan-collab/tac-express/pull/82) and the May-14 session retro. Copy that template exactly.

4. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** The classifier reads "you decide", "go ahead", "act as PM" as too indirect for `main`-branch writes. The owner must type the literal phrase `merge PR <N>` for each PR. To avoid the friction long-term, the owner can add `mcp__github__merge_pull_request` to `.claude/settings.local.json` permissions — but that's a deliberate decision, not an agent action.

---

## 1. First 5 minutes — mandatory ramp

```bash
# 1. Confirm you have the latest main
git checkout main && git pull origin main
# Expected: 87e860b at HEAD

# 2. Confirm quality gates pass on a clean main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 252 tests passing

# 3. Confirm the load-bearing audit gate is clean
pnpm audit --prod --audit-level moderate
# Expected: "No known vulnerabilities found"
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
| **[#22](https://github.com/cargotapan-collab/tac-express/issues/22)** | **Verify Sentry DSN + alert rule wiring before #9's deploy** | **P1** | Naturally next — pairs with PR #105's alert-rule script |
| [#25](https://github.com/cargotapan-collab/tac-express/issues/25) | Audit + migrate dialogs/forms to react-hook-form + zod | — | Sprint-scale; multiple legacy dialog forms |
| [#54](https://github.com/cargotapan-collab/tac-express/issues/54) | OpsManagementView role-select + Invite Staff actions | follow-up | Most addressed in #104; verify residual |
| [#55](https://github.com/cargotapan-collab/tac-express/issues/55) | Scope SVG linearGradient IDs to component instance | follow-up | Cosmetic |
| [#56](https://github.com/cargotapan-collab/tac-express/issues/56) | Move prettifyHubCode re-export to lib/ | follow-up | Cosmetic |
| [#57](https://github.com/cargotapan-collab/tac-express/issues/57) | Replace inline empty-row in OpsExceptionsView with OpsEmptyState | follow-up | Cosmetic |
| [#58](https://github.com/cargotapan-collab/tac-express/issues/58) | Align OpsRateCardsView Add Rate Card button label | follow-up | Cosmetic |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta | ~25 sub-items remain; see "what didn't ship" in the retro |

#78 (production schema drift) — **closed** via the Path A consolidated baseline (#95–#100). The repo and production now share one migration history; the audit gate is also load-bearing for migrations (`migrations-fresh-apply` blocks on `db reset` failure).

#79 (Supabase advisors) — addressed via #98 (search_path + REVOKE anon on 17 functions) + #100 (REVOKE FROM PUBLIC + GRANT TO authenticated for RPCs). Verify with `mcp__supabase__get_advisors security` if working in that area.

### Working-tree state

Repo synced. Working tree clean. There is one stash from earlier in the session containing `.claude/launch.json` (dashboard-preview config), `supabase/templates/`, `supabase/.temp/`. Decide pop/drop on first interaction. There are 35 stale local branches (31 `[gone]` + 4 orphan/diverged) — pure noise, all content represented on `main`. Bulk-delete safe; classifier requires owner-typed authorization for the destructive command. See § 6.

---

## 3. Critical context (the things that will trip you up)

### 3.1. The npm-audit gate is load-bearing as of `87e860b`

`.github/workflows/architecture-gates.yml` job `npm-audit` no longer has `continue-on-error: true`. **Any moderate-or-above vulnerability fails the gate and blocks merge.** Patched baseline is zero vulns as of #107 (Next 16.2.6 + uuid 11.1.1 + `pnpm.overrides` for fast-uri ≥3.1.2 + postcss ≥8.5.10).

If a future PR fails this gate:
1. **Don't disable the gate.** Read the audit output.
2. **Don't bundle the fix into a feature PR.** Open a focused dep-bump PR like #107.
3. **Check if Dependabot already has an open PR for the affected dep.** Weekly cadence, Mondays 9am IST.

### 3.2. The migrations-fresh-apply gate is also load-bearing

`migrations-fresh-apply` lost `continue-on-error: true` in #99 after the Path A baseline (#96) reconciled the repo with production. If `supabase db reset` fails on a PR, **fix the migration** — don't soft-fail it.

### 3.3. v7 design is opt-in via localStorage

```js
// In the browser DevTools console:
localStorage.setItem('tac-design', 'v7'); location.reload()  // see v7
localStorage.setItem('tac-design', 'v6'); location.reload()  // back to default
```

Or use the admin design-version toggle in Settings → Profile sidebar (live since PR #61).

### 3.4. The dashboard's `dev` script hardcodes port 3001

If port 3001 is taken, `pnpm --filter dashboard dev` fails. There's an alternate `dashboard-preview` launch config in `.claude/launch.json` (auto-port) — currently in the stashed working-tree changes from the prior session.

### 3.5. The auth package now has a test floor

`packages/auth/src/rbac.test.ts` has a `UserRole` completeness sentinel at the top. **If you add a new `UserRole`**, the sentinel will fail — that's the trigger to update each authorization matrix below it with conscious intent. Do not just bump the sentinel to make the test green; do the matrix updates.

### 3.6. Sentry alert-rule provisioning is now scripted

PR #105 added `scripts/sentry/create-alert-rules.mjs`. Owner sets `SENTRY_AUTH_TOKEN` in env and runs once. Two canonical rules ship in the script. The script is idempotent (skips by name). Replaces the prior 4-click manual setup.

---

## 4. Your first task — recommended

### Option A — Close #22 (Sentry DSN + alert-rule verification) (Recommended; ~1 hour)

The natural close to PR #105's alert-rule script. P1. Concrete steps:

```
1. Load skills: tac-express-onboarding → tac-debug (Sentry is observability)
2. Verify SENTRY_DSN is wired in:
   - apps/dashboard runtime (apps/dashboard/.env.local should have it)
   - Edge functions (supabase/functions/*/index.ts — if any need it)
3. Owner runs: node scripts/sentry/create-alert-rules.mjs
   (needs SENTRY_AUTH_TOKEN env; one-time)
4. Owner verifies alert rules live at:
   https://tapan-cargo-az.sentry.io/alerts/rules/javascript-nextjs/
5. Fire a synthetic error via /api/diagnostics/sentry to confirm notifications arrive
6. Write docs/observability.md capturing: where DSN lives, how to add a new
   alert rule, how to fire a synthetic test, who gets paged
7. Comment "alert rule live, target=<channel>" on #22 and close it
```

Why this is the right next task:
- It's P1.
- It pairs with the script we just shipped — without this, the script is dormant.
- Closes a real observability gap (edge functions are currently flying blind).
- ~1 hour, fits a clean session.
- Owner-runnable for the auth parts; agent-doable for the wiring + docs.

### Option B — Start NextAdmin Phase 4c (New Manifest wizard) (~one focused session)

Same template as Phase 4b. Use [PR #82](https://github.com/cargotapan-collab/tac-express/pull/82) as the reference implementation. Generalize the `useShipmentDraft` hook to `useFormDraft<T>` first (small refactor PR) so the manifest wizard can reuse it.

The discipline:

```
1. Load skills: tac-express-onboarding → tac-brainstorming → tac-tdd
2. Write the spec (mirror PR #82's spec format)
3. Get explicit owner approval
4. RED → GREEN → COMMIT per unit
5. Browser-verify (write-path mandate)
6. Open PR with screenshots
```

### Option C — Payment service test floor (~1 focused session)

`packages/services/src/payment.service.ts` is high-risk (money flows) with 0% coverage. PR #106 established the test-floor pattern for `packages/auth`. Apply the same pattern: write `payment.service.test.ts` with state-machine + edge-case coverage. Use `tac-tdd` skill.

### Option D — Cosmetic follow-ups (#54–#58) (~1 hour, can batch)

Five small UI items, ~10 min each. Owner-friendly because each is reviewable in seconds. Good "low-energy session" or "warm-up" work. Bundle as one PR titled "chore(ui): cosmetic follow-ups for #54-58".

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

# Provision Sentry alert rules (owner, one-time)
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
docs/SESSION-RETRO-2026-05-14.md               # May-14 session retro
docs/SESSION-RETRO-2026-05-15.md               # May-15 session retro (this session)
docs/NEXTADMIN-REFACTOR-SESSION-RETRO.md       # Original NextAdmin retro (still authoritative)
docs/NEXT-SESSION-HANDOFF.md                   # ← this file
docs/ROLLBACK-PLAYBOOK.md                      # 5-layer rollback recipes

# Core rules + skills
CLAUDE.md                                       # Claude Code entry point
AGENTS.md                                       # Master rules (Fourteen Laws, monorepo, git)
DESIGN_SYSTEM.md                                # Violet Grid visual spec
.claude/skills/RESOLVER.md                      # Intent → skill dispatch table
.claude/skills/conventions/                     # Cross-cutting rules

# Reference implementations
packages/ui/src/components/composed/customers/v7-customer-form.tsx        # Phase 4a — single-page form
packages/ui/src/components/composed/shipments/v7-create-shipment-wizard.tsx # Phase 4b — multi-step wizard (reference for 4c/4d)
packages/ui/src/hooks/use-shipment-draft.ts                               # Draft persistence — generalize to useFormDraft<T>
packages/ui/src/components/composed/forms/form-primitives.tsx             # Phase 4a primitives
packages/auth/src/rbac.test.ts                                            # Test-floor pattern with UserRole sentinel
scripts/sentry/create-alert-rules.mjs                                     # Idempotent Sentry alert provisioning
```

---

## 6. Local hygiene (optional, owner runs)

The repo is in sync with origin. Local has 35 stale branches and 1 stash worth cleaning. None contain unique unpushed work (all verified via the May-15 PM session's sync audit).

```bash
# Bulk-delete stale [gone] branches (31 of them)
git fetch --prune
git branch -vv | awk '/: gone]/{print $1}' | xargs -r git branch -D

# Delete the 4 inspected orphan/diverged branches (content all on main)
git branch -D claude/eager-sinoussi-00d5b1 claude/focused-hugle-a3132d feat/r0-audit-and-wizard-restoration claude/sharp-jemison-b97ff8

# Decide on the stash (contains .claude/launch.json mod + supabase templates):
git stash show -p stash@{0}   # inspect
git stash pop                 # keep + apply
# OR
git stash drop                # discard
```

Reflog keeps deletions recoverable for ~90 days.

---

## 7. The discipline pattern that worked this session

The CI-hardening track shipped 4 PRs in ~4 hours using this exact sequence:

```
For each concern:
1. Load tac-express-onboarding (mandatory first action)
2. Load tac-karpathy-discipline (Think → Simplify → Surgical → Goal)
3. Match concern to specialist skill via RESOLVER.md
4. Write surgical edits — one concern per PR
5. Run all 5 quality gates locally
6. Commit + push + open PR
7. Address bot findings as separate commits on the same PR
8. Reply on each bot thread (gh api on the comment ID)
9. Wait for typed "merge PR <N>" authorization
10. Merge (squash) — keep main commit history one-PR-one-commit
11. Update todos
12. Move to next concern
```

The CI-hardening track was 3 PRs (#105, #107, #108) sequenced as soft-fail → clean snapshot → load-bearing. Reused: same pattern that `migrations-fresh-apply` followed when it graduated from soft-fail in #99.

---

## 8. The honest read

The CI-hardening track is closed. The audit-gate floor is in place. The next session has a clean baseline and a concrete recommended lead task (#22).

**This is a logistics company web app.** Every UI decision serves an operator who is creating, dispatching, scanning, or invoicing a shipment under time pressure. The CI hardening from this session doesn't move a pixel — but it's the substrate every future PR runs on. Without it, the next 6 months of feature work would have shipped on top of 23 unpatched vulnerabilities and an untested auth surface. With it, every PR's `npm audit` and `vitest` runs are real signal.

Future product work (Phase 4c manifest wizard, Phase 4d invoice wizard, payment service test floor) builds on this floor. That was the trade this session made.

---

**You've got the map. Load the skills. Pick a task from § 4. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff for the session after you. The discipline carries forward by hand, every time.
