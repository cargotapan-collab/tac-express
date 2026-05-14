# Next-Session Handoff — Start Here

> **You are picking up TAC Express where the 2026-05-14 session left off.** Read this top-to-bottom before opening any other file. It is designed to take 5 minutes and get you productive immediately.

**Restore point:** `git tag pre-audit-fixes-v1` (still valid; `git checkout pre-audit-fixes-v1` rolls back the entire prior session).
**Last commit on `main`:** `c526ef2` — `ci(arch-gates): supabase db reset on every PR touching migrations (#77)`
**Date this doc was written:** 2026-05-14
**Author of last session:** Claude Code (Opus 4.7)

---

## 0. READ THIS FIRST — three things you must NOT do

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** It is mandatory per `CLAUDE.md § 0.5` (the GBrain four-step gate). The previous session drifted for 6 hours by skipping it. Load it as your literal first action.
2. **Do NOT add to the audit/infrastructure backlog before resolving [#78](https://github.com/cargotapan-collab/tac-express/issues/78) (production-vs-repo migration drift).** Until that's resolved, every `CREATE OR REPLACE FUNCTION` migration may be a no-op in production. The previous session learned this the hard way — PR #76's role gates likely don't take effect.
3. **Do NOT start a new wizard (Phase 4c/4d) without a written `tac-brainstorming` spec.** No exceptions. The Phase 4b spec → approval → ship cycle is documented in [PR #82](https://github.com/cargotapan-collab/tac-express/pull/82) — copy that template.

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

### Open PRs (4) — these need your attention

| PR | Title | Status | Action |
|---|---|---|---|
| [#74](https://github.com/cargotapan-collab/tac-express/pull/74) | DB-types staleness gate + safe regen wrapper | UNSTABLE (gate firing as designed) | **Run on the branch:** `pnpm exec supabase login` → `pnpm supabase:types:remote` → commit the regenerated `database.types.ts` → push → merge. No Docker required (`--remote` mode). |
| [#81](https://github.com/cargotapan-collab/tac-express/pull/81) | Silence two recurring CI noise sources | UNSTABLE (advisory only) | Review + merge. After this lands, `pnpm audit:all` and `visual + a11y` jobs go clean for all future PRs. |
| [#82](https://github.com/cargotapan-collab/tac-express/pull/82) | **NextAdmin Phase 4b — V7 Shipment Wizard** | UNSTABLE (advisory) | Review + merge. Browser-verified end-to-end including draft restoration. |
| [#83](https://github.com/cargotapan-collab/tac-express/pull/83) | 2026-05-14 session retro + handoff doc | (this session's retro) | Review + merge. Doc-only. |

**Recommended merge order:** #83 → #82 → #81 → #74. None block each other; pick whatever you want first. #74 is the only one that needs you to do something locally before it can merge.

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
| **[#78](https://github.com/cargotapan-collab/tac-express/issues/78)** | **Reconcile repo migrations with production schema** | **P0 — read this first** | this session |
| [#79](https://github.com/cargotapan-collab/tac-express/issues/79) | Supabase advisors: 38 security warnings | P1 | this session |
| [#80](https://github.com/cargotapan-collab/tac-express/issues/80) | May-12 migration backlog (6 latent bugs from CI gate) | — | this session |

### Working-tree state to be aware of

These exist locally on the previous session's machine but were NOT committed (out of scope for any PR):

- `.claude/launch.json` — modified to add a `dashboard-preview` config (port 3011, autoPort) used for browser verification. Decide: keep / commit separately / discard.
- `supabase/templates/confirm.html` and `invite.html` — defensively created; not referenced by `supabase/config.toml`. Decide: keep / commit / delete.
- `supabase/.temp/` — Supabase CLI scratch dir. Add to `.gitignore`.

---

## 3. Critical context (the things that will trip you up)

### 3.1. Production migrations are NOT what's in the repo

Production has 17 migrations from April 21–22 + May 11–12. Repo has 11 from April 30 + May 12 + May 14. They are **independently maintained**. `supabase db push` skips by filename, so production is safe from accidental schema corruption — but every `CREATE OR REPLACE FUNCTION` in a fix migration creates a *new* function next to production's existing one (PostgreSQL function overloading). **PR #76's role-gate hardening is suspected ineffective in production** because production calls 3-arg signatures (`add_shipment_to_manifest(uuid, text, uuid)`) while the repo defines 2-arg ones.

Full details + resolution options: [issue #78](https://github.com/cargotapan-collab/tac-express/issues/78).

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

### Option A — Close the open queue (recommended; ~30 min)

The fastest path to a clean board. Merge #83, #82, #81 in any order. For #74, run the type regen on the branch then merge. After this, you have 0 open PRs and a clean baseline for new work.

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

### Option C — Resolve #78 (production-vs-repo migration drift) (high-leverage; ~one session)

The strategic finding from the prior session. Until this resolves, every migration PR is suspect. The four ranked resolution options are in [#78](https://github.com/cargotapan-collab/tac-express/issues/78). Recommended: schema-dump-based reconciliation. This unblocks the value of #76, validates the value of #77, and makes future migration work load-bearing again.

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

**Best practice in software is sometimes shipping the next PR, and sometimes calling the line.** When in doubt, ask: *does this work move us down the published roadmap, or am I discovering new work?* The first is product. The second is research that needs ratification before it becomes work.

This is a **logistics company web app**. Every UI decision serves an operator who is creating, dispatching, scanning, or invoicing a shipment under time pressure. Keep that operator at the centre of every decision.

---

**You've got the map. Load the skills. Pick a task from § 4. Ship one clean PR.**

When you're done, update or replace this file with a new handoff for the session after you. The discipline carries forward by hand, every time.
