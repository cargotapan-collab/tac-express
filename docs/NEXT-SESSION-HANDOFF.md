# Next-Session Handoff — Start Here

> **You are picking up TAC Express where the 2026-05-14 session left off.** Read this top-to-bottom before opening any other file. It is designed to take 5 minutes and get you productive immediately.

**Restore point:** `git tag pre-audit-fixes-v1` (still valid; `git checkout pre-audit-fixes-v1` rolls back the entire prior session).
**Last commit on `main`:** `64b7d38` — `docs: 2026-05-14 session retro + next-session handoff (#83)`
**Date this doc was written:** 2026-05-14 (updated by the PM-mode follow-up session same day)
**Author of last session:** Claude Code (Opus 4.7), then a second PM-mode pass that merged #83 and ratified #78 via read-only investigation

> **Updated 2026-05-14 PM session:** #83 merged. #78's P0 has been **confirmed and sharpened** — not just suspected. PRs #82/#81 are queue-ready but were classifier-blocked from agent-merge in this session; they need either a typed authorization phrase from you or a permission rule. See § 0, § 2, § 3.1 below for the updated reality.

---

## 0. READ THIS FIRST — three things you must NOT do

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** It is mandatory per `CLAUDE.md § 0.5` (the GBrain four-step gate). The previous session drifted for 6 hours by skipping it. Load it as your literal first action.
2. **Do NOT add new schema work before #78 closes — it is now confirmed P0, not suspected.** The PM-mode investigation update on [#78](https://github.com/cargotapan-collab/tac-express/issues/78#issuecomment-4448164120) found three things: (a) PR #76 was never deployed to production (production's migration history ends at May 12); (b) even if deployed, it targets the wrong signature (2-arg in repo, 3-arg in production and in the app); (c) the repo is internally inconsistent — `database.types.ts` and app code disagree with the repo's own migration. Every `CREATE OR REPLACE FUNCTION` PR you ship inherits this disease until #78 step 1 (rewrite `functions_and_rpcs.sql` to 3-arg) lands.
3. **Do NOT start a new wizard (Phase 4c/4d) without a written `tac-brainstorming` spec.** No exceptions. The Phase 4b spec → approval → ship cycle is documented in [PR #82](https://github.com/cargotapan-collab/tac-express/pull/82) — copy that template.
4. **Do NOT attempt to merge from a fresh agent session without explicit typed authorization or a permission rule.** The PM session learned this — the classifier reads "act as PM" as too indirect for high-severity actions like merging to `main`. To unblock cleanly, either (a) type "merge PR #N now" verbatim per PR, or (b) add a permission rule for `mcp__github__merge_pull_request` in `.claude/settings.local.json`.

---

## 1. First 5 minutes — mandatory ramp

Run these in order. Each is a single command.

```bash
# 1. Confirm you have the latest main
git checkout main && git pull origin main

# 2. Verify the doomsday restore point still exists
git tag --list pre-audit-fixes-v1
# Expected: pre-audit-fixes-v1

# 3. Confirm quality gates pass on a clean main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 215+ tests passing
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

### Open PRs (3 + this one) — these need your attention

| PR | Title | Status | Action |
|---|---|---|---|
| [#74](https://github.com/cargotapan-collab/tac-express/pull/74) | DB-types staleness gate + safe regen wrapper | UNSTABLE — **double-blocked, see status comment** | Stale base (4 commits behind main) AND needs `pnpm exec supabase login`. Per [my comment on #74](https://github.com/cargotapan-collab/tac-express/pull/74#issuecomment-4448167664): rebase → `supabase login` → `pnpm supabase:types:remote` → commit → push → merge. **Better to wait until #78 step 1 closes** (rewriting the migration to 3-arg) so the regen doesn't pull in production-only signatures the migration doesn't define. |
| [#81](https://github.com/cargotapan-collab/tac-express/pull/81) | Silence two recurring CI noise sources | UNSTABLE (advisory only) — ready to merge | **Awaiting your explicit merge.** Classifier blocked the PM-session attempt; needs a typed authorization like "merge PR #81 now". |
| [#82](https://github.com/cargotapan-collab/tac-express/pull/82) | **NextAdmin Phase 4b — V7 Shipment Wizard** | UNSTABLE (advisory) — ready to merge | **Awaiting your explicit merge.** Same classifier story as #81. Browser-verified end-to-end including draft restoration. |
| [this PR] | Handoff doc update (PM session) | TBD | Review + merge after the other three land so the handoff reflects the new state. |

**Recommended merge order:** #82 → #81 → this PR → (later, after #78) → #74. #82 first because it's the user-facing product value; #81 second because it cleans CI noise; this PR third so the handoff is current. None block each other.

> **Why the PM session couldn't merge #82/#81 itself:** the auto-mode classifier reads "act as PM" or AskUserQuestion answers as too indirect for `mcp__github__merge_pull_request` to `main`. To grant durable authorization, add this to `.claude/settings.local.json`:
> ```json
> { "permissions": { "allow": ["mcp__github__merge_pull_request"] } }
> ```
> Or just type `merge PR 82` / `merge PR 81` verbatim to a future agent. One-time typed authorization is also fine.

### Open Issues (10) — full backlog

| # | Title | Priority | Created |
|---|---|---|---|
| [#22](https://github.com/cargotapan-collab/tac-express/issues/22) | Verify Sentry DSN + alert rule wiring before #9's deploy | P1 | last week |
| [#25](https://github.com/cargotapan-collab/tac-express/issues/25) | Audit + migrate dialogs/forms to react-hook-form + zod | — | last week |
| [#54](https://github.com/cargotapan-collab/tac-express/issues/54) | OpsManagementView role-select + Invite Staff actions | follow-up | yesterday |
| [#55](https://github.com/cargotapan-collab/tac-express/issues/55) | Scope SVG linearGradient IDs to component instance | follow-up | yesterday |
| [#56](https://github.com/cargotapan-collab/tac-express/issues/56) | Move prettifyHubCode re-export to lib/ | follow-up | yesterday |
| [#57](https://github.com/cargotapan-collab/tac-express/issues/57) | Replace inline empty-row in OpsExceptionsView with OpsEmptyState | follow-up | yesterday |
| [#58](https://github.com/cargotapan-collab/tac-express/issues/58) | Align OpsRateCardsView Add Rate Card button label | follow-up | yesterday |
| **[#78](https://github.com/cargotapan-collab/tac-express/issues/78)** | **Reconcile repo migrations with production schema** | **P0 — confirmed, see [investigation comment](https://github.com/cargotapan-collab/tac-express/issues/78#issuecomment-4448164120)** | this session |
| [#79](https://github.com/cargotapan-collab/tac-express/issues/79) | Supabase advisors: 38 security warnings | P1 | this session |
| [#80](https://github.com/cargotapan-collab/tac-express/issues/80) | May-12 migration backlog (6 latent bugs from CI gate) | — | this session |

### Working-tree state to be aware of

These exist locally on the previous session's machine but were NOT committed (out of scope for any PR):

- `.claude/launch.json` — modified to add a `dashboard-preview` config (port 3011, autoPort) used for browser verification. Decide: keep / commit separately / discard.
- `supabase/templates/confirm.html` and `invite.html` — defensively created; not referenced by `supabase/config.toml`. Decide: keep / commit / delete.
- `supabase/.temp/` — Supabase CLI scratch dir. Add to `.gitignore`.

---

## 3. Critical context (the things that will trip you up)

### 3.1. Production migrations are NOT what's in the repo — and the repo is internally inconsistent

Production has 17 migrations from April 21–22 + May 11–12. Repo has 11 from April 30 + May 12 + May 14. They are **independently maintained**. `supabase db push` skips by filename, so production is safe from accidental schema corruption — but the divergence has compounded into three problems:

1. **PR #76 was never deployed to production.** Confirmed via `mcp__supabase__list_migrations`: production's history ends at `20260512164008`. The May-14 migrations (#73, #76) are not there. So the role-gate hardening is currently inactive on production. Production is running the original April-21 RPC definitions with no explicit role gates.

2. **PR #76 targets the wrong signature.** Production has 3-arg `add_shipment_to_manifest(uuid, text, uuid)` from `20260422145228_fix_manifest_rpc_optional_staff_id`. Repo's migration defines the 2-arg version. So even if you pushed #76 to production today, PostgreSQL would create a new 2-arg overload alongside the existing 3-arg function — and the app keeps calling the 3-arg one ungated.

3. **The repo is internally inconsistent.** `packages/database/src/database.types.ts:640` and the app code (`manifest.service.ts:90-93`, `manifest.repo.ts:56-83`) all assume the 3-arg signature with `p_staff_id`. But the repo's `supabase/migrations/20260430000003_functions_and_rpcs.sql:114` defines the 2-arg version. So `supabase db reset` locally would produce a broken environment (PostgREST can't find a 3-arg overload). The types file was clearly generated against production, where the 3-arg version exists.

**Resolution sequence (per [my comment on #78](https://github.com/cargotapan-collab/tac-express/issues/78#issuecomment-4448164120)):**

1. Rewrite `functions_and_rpcs.sql` to the 3-arg signatures so the repo becomes self-consistent and `supabase db reset` works.
2. Snapshot production schema → check in as frozen reference (`supabase/snapshots/production-schema-2026-05-14.sql`).
3. Rewrite PR #76's migration to target the corrected 3-arg signatures.
4. Deploy. Verify gates actually gate by trying a customer-role call against `update_shipment_status` and expecting SQLSTATE `42501`.
5. Remove `continue-on-error` from `migrations-fresh-apply` in `.github/workflows/architecture-gates.yml`.

~2 hours for steps 1-3, ~30 min for steps 4-5. Much less than the "two weeks" estimate in the original #78 body — we're aligning *current state*, not reconstructing *history*.

### 3.2. The CI gate that finds bugs is in soft-fail mode

`.github/workflows/architecture-gates.yml` job `migrations-fresh-apply` has `continue-on-error: true`. It still runs and surfaces issues in the checks tab, but doesn't block merges. This is intentional — the gate uncovered 6 latent bugs in the May-12 batch on its first run; it stays soft until [#80](https://github.com/cargotapan-collab/tac-express/issues/80) closes (PR #81 closes most of it).

If you see a "Migrations apply on fresh DB: failed" check on a PR, **read the log** to confirm it's a known issue from #80, then proceed. Do not start fixing the bugs unless you've explicitly chosen "infra cleanup" as this session's task.

### 3.3. `database.types.ts` may be empty in your working tree

If you cloned fresh, the tracked version (780 lines) is correct. If you pulled the [#74](https://github.com/cargotapan-collab/tac-express/pull/74) branch, the working-tree version may be a 0-byte file from a failed `supabase gen types` run. Recover with:

```bash
git checkout HEAD -- packages/database/src/database.types.ts
```

This is exactly what PR #74's safe wrapper (`scripts/supabase-types.mjs`) prevents going forward.

### 3.4. v7 design is opt-in via `localStorage`

```js
// In the browser DevTools console:
localStorage.setItem('tac-design', 'v7'); location.reload()  // see v7
localStorage.setItem('tac-design', 'v6'); location.reload()  // back to default
```

Or use the admin design-version toggle in Settings → Profile sidebar (live since PR #61).

### 3.5. The dashboard's `dev` script hardcodes port 3001

If port 3001 is already taken (by another dev server), `pnpm --filter dashboard dev` will fail. Two paths:
- Free port 3001 first
- Or use the `dashboard-preview` launch config from `.claude/launch.json` (autoPort, runs `next dev` directly without the `--port` flag) — this is the change in the working tree per § 2.

---

## 4. Your first task — recommended

**Pick ONE of these. Do NOT bundle.**

### Option A — Close the open queue (recommended; ~15 min)

The fastest path to a clean board. #83 is already merged. Merge **#82 → #81 → this handoff-update PR** in that order (type the merge command explicitly so the classifier doesn't block). Defer #74 until #78 step 1 lands. After this you have 1 deferred PR (#74) and a clean baseline for new work.

### Option B — Start NextAdmin Phase 4c (New Manifest wizard) (recommended; ~one focused session)

Same template as Phase 4b. Use [PR #82](https://github.com/cargotapan-collab/tac-express/pull/82) as the reference implementation. The path:

```
1. Load skills: tac-express-onboarding → tac-brainstorming → tac-tdd
2. Write the spec (mirror PR #82's spec format from the conversation)
3. Get explicit user approval
4. RED → GREEN → COMMIT for each unit (hook → component → wiring)
5. Browser-verify (write-path mandate per retro)
6. Open PR with screenshots
```

The hook from #82 (`useShipmentDraft`) can be generalized to `useFormDraft<T>` and reused for the manifest wizard's draft persistence. Even better: do the generalization as a tiny refactor PR FIRST (one concern), then the manifest wizard PR depends on it.

### Option C — Resolve #78 (production-vs-repo migration drift) (high-leverage; ~2-3 hours, NOT a full session anymore)

The PM-mode investigation in this session sharpened the resolution path. See § 3.1 for the 5-step sequence — it is now a concrete checklist, not an open exploration. The 5-step plan unblocks the value of #76, validates the value of #77, makes #74 cleanly mergeable, and de-risks all future schema PRs. **This is the highest-leverage single task on the board.**

Concretely:
1. Load `tac-supabase-schema` skill.
2. Rewrite `supabase/migrations/20260430000003_functions_and_rpcs.sql` so every RPC the app calls (see grep `db.rpc("` in `packages/`) has the signature that matches both `database.types.ts` AND production.
3. Run `pnpm vitest` — current tests will catch any remaining inconsistency.
4. Snapshot production schema. (Owner runs `pg_dump --schema-only` — needs interactive Supabase login.)
5. Rewrite PR #76's migration to target the corrected signatures. Open as a separate PR that depends on step 2.
6. Owner deploys with `supabase db push` (needs interactive login).
7. Verify gates with a manual test from a customer-role session.
8. Open PR that removes `continue-on-error` from architecture-gates.yml and closes #78.

### Option D — Address #79 (Supabase advisors) (lower priority; can batch with B or C)

Mostly mechanical (`ALTER FUNCTION ... SET search_path` + `REVOKE EXECUTE FROM anon`). Must use **production's** function signatures (so blocked on #78 if you want correctness in production).

### Option E — Fix #22 (Sentry DSN verification) (small but P1; ~1 hour)

Hidden P1. Without it, edge-function observability is null — you'll be blind to failures in `dispatch-webhook`, `send-notification`, and `scheduled-sla-monitor`. Worth knocking out before any wizard work that depends on observability.

---

## 5. Quick reference

### Skills you'll load most

```
tac-express-onboarding   # Mandatory first action of every session
tac-brainstorming        # Mandatory before any new feature
tac-tdd                  # Mandatory for any non-trivial unit (RED→GREEN→COMMIT)
tac-karpathy-discipline  # Apply to everything (Think→Simplify→Surgical→Goal)
tac-fourteen-laws        # When uncertain whether something is allowed
tac-forms                # When touching any form
tac-ui-authoring         # When writing any UI component
tac-data-layer           # When writing services or hooks
tac-supabase-schema      # When touching migrations / RLS / RPCs
tac-domain-logistics     # When touching shipments / manifests / AWBs / customers
tac-debug                # When something breaks (root-cause first)
tac-code-review          # Pre-merge or pre-PR
```

### Common commands

```bash
# Quality gates (run before every commit)
pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm audit:all

# Run only the v7 / wizard tests
pnpm vitest run packages/ui/src/hooks/use-shipment-draft.test.ts
pnpm vitest run packages/ui/src/components/composed/shipments/v7-create-shipment-wizard.test.tsx

# Regenerate Supabase types from production (no Docker needed)
pnpm exec supabase login           # one time
pnpm supabase:types:remote         # writes packages/database/src/database.types.ts

# Confirm migrations apply on a fresh DB locally (needs Docker)
supabase start && supabase db reset

# Roll back a single PR after merge
gh pr revert <PR#>

# Doomsday rollback (wipes the entire May-14 session)
git checkout pre-audit-fixes-v1
```

### Key file locations

```
# Roadmap + planning
docs/NEXTADMIN-REFACTOR-SESSION-RETRO.md       # The original NextAdmin retro (still authoritative)
docs/SESSION-RETRO-2026-05-14.md               # The May-14 session retro (full detail)
docs/AUDIT-FIXES-PLAN-2026-05-14.md            # P0/P1 sequencing plan from the audit
docs/NEXT-SESSION-HANDOFF.md                   # ← this file
docs/ROLLBACK-PLAYBOOK.md                      # 5-layer rollback recipes

# Core rules + skills
CLAUDE.md                                       # Claude Code entry point
AGENTS.md                                       # Master rules (Fourteen Laws, monorepo, git)
DESIGN_SYSTEM.md                                # Violet Grid v5.0 visual spec
.claude/skills/RESOLVER.md                     # Intent → skill dispatch table
.claude/skills/conventions/                    # Cross-cutting rules

# Phase 4 reference implementations
packages/ui/src/components/composed/customers/v7-customer-form.tsx        # Phase 4a — single-page form
packages/ui/src/components/composed/shipments/v7-create-shipment-wizard.tsx # Phase 4b — multi-step wizard (reference for 4c/4d)
packages/ui/src/hooks/use-shipment-draft.ts                               # Draft persistence — generalize to useFormDraft<T> for 4c/4d
packages/ui/src/components/composed/forms/form-primitives.tsx             # Phase 4a — FormCard, FormSection, FormGrid, FormField, FormFooter
```

---

## 6. The discipline pattern that worked in PR #82

Copy this exactly for any new feature work:

```
1. Load tac-express-onboarding             (Step 0 of CLAUDE.md § 0.5)
2. Load tac-brainstorming                   (mandatory before new feature)
3. Read existing components in the area    (don't duplicate — extend / wrap)
4. Write the spec                          (Phase 5 template inside tac-brainstorming)
5. Get explicit user approval               (Phase 6)
6. Load tac-tdd
7. RED test for the smallest unit
8. Confirm RED for the right reason         (file doesn't exist, etc.)
9. Write minimal code                      (GREEN)
10. Confirm GREEN
11. Refactor if needed (don't if not)
12. Run all 5 quality gates
13. Commit
14. Repeat 7-13 for the next unit          (NEVER batch RED-GREEN cycles)
15. Wire into the apps shell via flag      (LAW 5 — UI in packages/ui only)
16. Browser-verify in preview              (write-path mandate)
17. Push branch
18. Open PR with: spec link, screenshots, gate evidence, rollback recipe
```

The May-14 session shipped Phase 4b in ~3 hours by following this exactly. The session's first 6 hours skipped it and produced 8 PRs of remediation that may not even take effect in production.

---

## 7. The honest read

The previous session shipped real value (one production-breaking bug fix, one product feature, three strategic findings) but drifted hard for half its duration before correcting. The corrective half is the template. The drift half is the cautionary tale.

**The PM-mode follow-up session (this update)** did three things in roughly an hour: merged #83, ratified #78 via read-only investigation (and sharpened it from "suspected P0" to "confirmed P0 with concrete resolution sequence"), and posted blocker status on #74. It also discovered that the auto-mode classifier will refuse to merge production PRs from indirect authority ("act as PM"). That friction is the system working as intended — but it means agent sessions cannot blind-clear queues; the owner is in the loop for `main` writes.

**Best practice in software is sometimes shipping the next PR, and sometimes calling the line.** When in doubt, ask: *does this work move us down the published roadmap, or am I discovering new work?* The first is product. The second is research that needs ratification before it becomes work. The PM session leaned hard on the *ratification* mode for #78 — that's why it stayed read-only and didn't try to fix anything, just produced a concrete plan for the next session to execute.

This is a **logistics company web app**. Every UI decision serves an operator who is creating, dispatching, scanning, or invoicing a shipment under time pressure. Keep that operator at the centre of every decision.

---

**You've got the map. Load the skills. Pick a task from § 4. Ship one clean PR.**

When you're done, update or replace this file with a new handoff for the session after you. The discipline carries forward by hand, every time.
