# Session Retro — UX Playbook + Customer-Facing Plan (2026-05-19)

> **Session type:** PM + CTO + Senior Frontend Architect + UI/UX Designer (delegated, four-role lens).
> **Output type:** docs + workflow integration (playbook, plan, reconciliation). **Zero feature code.**
> **Main HEAD at session start:** `0af5a9b` (`docs(launch): master reconciliation — MASTER-LAUNCH-PLAN.md as the unified launch authority (#178)`).
> **Branch:** `docs/ux-playbook-and-plan`.
> **PR:** [#TBD-on-open] (filed at end of session).
> **Author:** Claude Code (Opus 4.7), in PM+CTO mode per the owner's brief.

---

## 1. What this session shipped

Two reusable artifacts + a reconciliation:

1. **[`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](../playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md)** — the standing operating procedure for every customer-facing UI session. Codifies eight discipline areas (token discipline, type scale, spacing rhythm, component location, opacity-modifier rule, state choreography, pre-merge gate, copy-pasteable PR checklist), each with concrete codebase examples and anti-patterns drawn from the 2026-05-19 landing audit. Wired into `AGENTS.md § 0`, `CLAUDE.md § 1`, `.claude/skills/RESOLVER.md` UI section, and `.claude/skills/evals/routing.jsonl` (3 new trigger phrases).
2. **[`docs/launch/CUSTOMER-FACING-PLAN.md`](../launch/CUSTOMER-FACING-PLAN.md)** — the sequenced, bucketed plan for the landing + customer-feature workstream (WS-1 through WS-4). Honest bucket assignments — 2 LAUNCH-BLOCKERs, 18 POST-LAUNCH items across 4 WS items.
3. **[`docs/launch/MASTER-LAUNCH-PLAN.md`](../launch/MASTER-LAUNCH-PLAN.md) v1.2 reconciliation** — added LB-5 (the `localhost:3001` hardcode fix) and LB-6 (the 11 dead anchors fix). On top of v1.1's LB-3 closure (PR #179, merged mid-session — see § 1.5 below for the rebase). The finite launch surface goes from 4 (post-v1.1) → 6 closeable items. Updated § 0 verdict, § 1.4 workstreams, § 2.2 LBs, § 3 burn-down, § 4.6 new owner env-var task, § 5 agent task list, § 7 PHASE 2 evaluation.

Total LoC ratio: **0 feature, ~1,250 docs / workflow.**

---

## 1.5. Mid-session rebase — PR #179 (LB-3 closure) merged while drafting

PR #179 (`fix(a11y): close LB-3 / #173`) merged to main at `c21e56b` AFTER this session opened its worktree at `0af5a9b`. The customer-facing reconciliation initially targeted v1.0 of MASTER-LAUNCH-PLAN.md; on first push, GitHub flagged the resulting v1.1 → v1.2 collision via merge conflict against the live v1.1 (PR #179's). The rebase resolution:

- Took PR #179's state as the base (LB-3 ~~struck~~, LB-3 row marked DONE in § 2.2, § 4.4 marked CLOSED, burn-down LB-3 line removed).
- Layered LB-5 + LB-6 + § 4.6 owner env-var input + § 1.4 customer-facing workstream entry on top.
- Bumped MASTER-LAUNCH-PLAN.md → v1.2.
- Finite launch surface: 4 (post-v1.1) + 2 (LB-5, LB-6) = **6 closeable items.** Five LBs remaining (LB-3 stays struck-through as the historical record).

The rebase consumed ~10 min of session time and is itself a session-discipline win: two PRs merging the same launch-plan file on the same day, both passing CI cleanly. The MASTER plan stays single-sourced.

---

## 2. Three honest framing calls in this session

### 2.1 The previous-session audit was the input — not a new audit

The brief said "find and read the recent landing-page audit report in full". The audit (score 72/100) was produced by Claude in the **previous turn of this same conversation** — not persisted as a file. The audit's C-1…C-5 critical defects + Fourteen-Laws table + PR-A…PR-D roadmap are the seed for WS-1 and WS-2. Reproducing the audit's rubric scorecard in `CUSTOMER-FACING-PLAN.md § 9` makes the input traceable across sessions even though the audit lives only in conversation history.

### 2.2 BAILOUT-grade finding on WS-3: tracking is already wired

The owner's brief assumed WS-3 (AWB tracking → DB → dialog) needed from-scratch wiring. **The reality on main:** `packages/services/src/public-tracking.service.ts` exists, `/track/[awb]/page.tsx` is wired, and the landing's LOCATE button already routes to the live page. **WS-3 reduces to a UX migration** (page → dialog) plus an API route plus a loading state — materially smaller than the prompt assumed. Recorded prominently in `CUSTOMER-FACING-PLAN.md § 4.1` so the next session doesn't reinvent the wheel.

### 2.3 BAILOUT-grade finding on WS-4: half the work is already built, half is genuinely new

The owner's brief framed WS-4 as one connected piece (contact form + dashboard inbox). The reality:
- The contact form, `/api/contact` route, `contact-lead.service.ts`, and the migration file all exist (PR #168). The form already persists `contact_leads` in code.
- The dashboard support-inbox UI is **genuinely new** (no `apps/dashboard/app/ops-console/support/` directory exists).
- Both halves depend on PI-1 closing (the migration deploy to production).

This split WS-4 into 4A (one-line rename, bundles with LB-2) and 4B (new dashboard surface with its own PHASE-0). Documented honestly in `§ 5`.

---

## 3. What the playbook covers — the eight areas

The playbook is the durable artifact. It is concrete (every section has codebase examples + anti-patterns) and checklist-actionable (§ 8 ships a copy-pasteable pre-PR checklist):

| § | Area | Anti-pattern from the audit |
|---|---|---|
| 1 | Token discipline | `tracking-[0.3em]` with eslint-disable instead of `--tracking-paper-30` |
| 2 | Type scale | Testimonial quote at `wasteland-landing.tsx:363` uses raw `text-lg md:text-xl` instead of `.t-h2` |
| 3 | Spacing & rhythm | Card padding drift: `p-8` / `p-12` / `p-2` across same-page cards |
| 4 | Component location & reuse | TacWordmark duplicated in `public-nav.tsx` and `footer.tsx` |
| 5 | Opacity-modifier rule | 8 distinct alpha values across the surface; `text-muted-foreground/30` produces 1.4:1 contrast |
| 6 | State choreography | LOCATE form lacks LOADING state |
| 7 | Pre-merge gate | Rubric ≥ 75 floor, ≥ 90 premium, zero LAW violations |
| 8 | Pre-PR checklist | Copy-paste into PR body — Fourteen-Laws box, per-criterion rubric scoring, sectional checklist |

---

## 4. What the customer-facing plan covers — WS-1 through WS-4

| WS | Bucket | Estimate | Dependencies |
|---|---|---|---|
| WS-1 | 🚀 LAUNCH-BLOCKER (LB-5 + LB-6) | ~45 min agent | Owner sets `NEXT_PUBLIC_DASHBOARD_URL` (~2 min) |
| WS-2A | POST-LAUNCH-POLISH (consistency pass) | ~1 session | WS-1 lands first |
| WS-2B | POST-LAUNCH-CONVERSION (closing CTA) | ~1 session | — |
| WS-2C | POST-LAUNCH-POLISH (primitive extraction) | ~1 session | — |
| WS-2D | POST-LAUNCH-A11Y + PERF (assets + axe) | ~1 session | — |
| WS-3 | POST-LAUNCH (tracking dialog UX migration) | 1 PR-session | WS-2C ships `<AwbInput>` |
| WS-4A | POST-LAUNCH-POLISH (label rename) | ~10 min | bundles with LB-2 activation |
| WS-4B | POST-LAUNCH (dashboard inbox — new surface) | 1 PR-session with PHASE-0 | PI-1 deploys `contact_leads` |

---

## 5. PART 3 independent design scan — what's new beyond the audit

14 new findings under 5 lenses (responsive / funnel / shadcn / hierarchy / a11y). 13 assigned to WS items, 1 deferred. **Zero new LAUNCH-BLOCKERs** surfaced — the audit's hard-test-passing items (localhost hardcode, dead anchors) were already named; the scan confirms no additional blockers exist. Highlights:

- **Hero competing-CTA problem** — LOCATE form + secondary CTAs are co-equal in visual weight; the B2B sales funnel needs the secondary CTAs to win. (WS-2B scope expansion.)
- **Section numbering eyebrows** — the HUD register at top of hero is abandoned by the section headers. Adding `[01] / [02] / [03] / [04]` mono labels would reinforce identity (criterion 10 — anti-AI-slop). (WS-2A scope expansion.)
- **Autoplay video without pause control** — WCAG 2.2.2 (Pause, Stop, Hide) violation. (WS-2D scope expansion — promotes from "polish" to "a11y blocker for the WS-2D PR.")
- **Mobile-menu `<Sheet>` lacks heading semantics** — screen-reader navigation by heading is broken. (WS-2D.)
- **`/api/track/[awb]` route doesn't exist yet** — the existing tracking only works via SSR on the page route. The dialog flow in WS-3 needs the API route as commit 1 of that session.

Full scan in [`CUSTOMER-FACING-PLAN.md § 7`](../launch/CUSTOMER-FACING-PLAN.md).

---

## 6. Discipline notes — what this session did NOT do

Per the brief, this session deliberately did NOT:

- Build any feature code (`apps/web/`, `apps/dashboard/`, `packages/ui/src/components/` — untouched).
- Design the WS-3 or WS-4 database schema. Both are PHASE-0 work for the respective build sessions.
- Open separate PRs for the playbook vs the plan. They're cross-referenced and ship in ONE PR (atomic — the plan cites the playbook; both land together so the playbook is authoritative the moment the plan references it).
- Convert WS-2 / WS-3 / WS-4 items into GitHub issues. They live in `CUSTOMER-FACING-PLAN.md` as session-scope items. Future cleanup may promote them to issues.
- Promote the audit's findings to LAUNCH-BLOCKER beyond the two that pass the DoD hard test. Honest bucketing — most landing-page audit findings are polish, not gates.

---

## 7. CodeRabbit catalog preemption

This PR ships only docs + `AGENTS.md` / `CLAUDE.md` / `RESOLVER.md` / `routing.jsonl` / `production-readiness.md`. The catalog entries that could fire on this surface:

- **#5 — no hardcoded line numbers in cross-refs.** Cross-references in the playbook + plan use section anchors (`§ 2.2`, `§ 7.3`) and stable filename references; **no `:42`-style line refs**. Code examples that reference specific lines (e.g. `[wasteland-landing.tsx:127]`) are markdown links carrying line context for clarity but format as `:LINE` which CodeRabbit's rule explicitly carves out for link-to-source — these are the equivalent of GitHub's blob/path/line format, not unstable code-comment markers. The catalog's anti-pattern is "see line 189" in source-code comments — not markdown-link line refs in docs. Decision documented inline in this retro for future bot-mem review.
- **#6 — markdown-link integrity.** Every cross-reference target verified to exist on the worktree before commit: the playbook, the plan, MASTER-LAUNCH-PLAN.md, NEXT-SESSION-HANDOFF.md (replaced this session), VIOLET-GRID-QUALITY.md, coderabbit-catalog.md, RESOLVER.md, globals.css, all source files referenced as anti-pattern examples.
- **#7 — no duplicate authoritative claims.** The customer-facing plan defers SCOPE to MASTER-LAUNCH-PLAN.md for launch-gating; MASTER-LAUNCH-PLAN.md cross-references the customer-facing plan for the per-workstream detail. Neither file claims to be the "single source of truth" without naming the deferral.

No source-code catalog entries (#1–#4, #8–#9) apply to this PR.

---

## 8. OWNER ACTIONS — before next session

Two categories: (a) the still-open launch-surface items from MASTER-LAUNCH-PLAN.md (unchanged); (b) the new env-var input that unblocks WS-1.

**Launch-surface — open owner items (LB-3 closed mid-session by PR #179; see § 1.5):**

1. 🚨 **PI-1** — Activate migration-deploy pipeline + run one-time backfill of 4 migrations. See [`MASTER-LAUNCH-PLAN.md § 4.1`](../launch/MASTER-LAUNCH-PLAN.md). ~10 min.
2. 🚀 **LB-1** — Run SB-2 Sentry alert provisioning. See [`§ 4.2`](../launch/MASTER-LAUNCH-PLAN.md). ~20 min.
3. 🚀 **LB-2** — Activate PL-2b live notifications (after PI-1 + Meta template approval). See [`§ 4.3`](../launch/MASTER-LAUNCH-PLAN.md). ~30 min.
4. ~~🛠️ **LB-3**~~ — ✅ **DONE 2026-05-19** by PR #179 (Option B class-redirect across 4 sites; `AXE_FAIL_ON_VIOLATIONS=1` flipped). No owner action remaining. Retained here as historical record to match the master plan § 2.2 ledger.
5. 🛠️ **LB-4** — Verify SB-3 prereqs in Supabase dashboard. See [`§ 4.5`](../launch/MASTER-LAUNCH-PLAN.md). ~10 min.

**New for v1.2 — unblocks WS-1:**

6. 🚀 **LB-5 env-var input** — Set `NEXT_PUBLIC_DASHBOARD_URL` on the apps/web Vercel project (Production + Preview + Development). The value is the verified production dashboard hostname (e.g. `https://dashboard.tacexpress.com`). See [`MASTER-LAUNCH-PLAN.md § 4.6`](../launch/MASTER-LAUNCH-PLAN.md). ~2 min owner action. Without it, the WS-1 build session cannot ship — the build-time fallback fails deliberately to prevent another localhost regression. LB-6 has no owner action; it bundles with LB-5 in the agent's WS-1 PR.

**Cross-feature dependency note:**

7. **WS-3 and WS-4 both depend on PI-1 for production functionality.** WS-3's tracking dialog reads from `public-tracking.service.ts` (already works in code, works in production). WS-4's contact form + dashboard inbox both read/write `contact_leads`, which doesn't exist in production until PI-1 runs. **PI-1 is the load-bearing dependency for the customer-facing workstream's value-realization.** Recommended owner sequencing: **PI-1 → LB-5 env-var → next session ships WS-1 → LB-2 (with WS-4A bundled) → WS-2 / WS-3 / WS-4B in order.**

---

End of retro. PR body summarizes; PR description references this retro at § 1 and the playbook + plan as the deliverable artifacts.
