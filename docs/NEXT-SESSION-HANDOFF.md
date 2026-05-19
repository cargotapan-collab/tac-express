# Next-Session Handoff — Start Here

> **The launch authority is [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md) (v1.3).** The customer-facing workstream detail lives in [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md). The UI/UX consistency playbook at [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) is the standing standard.

**Last code commit on main:** the WS-2B PR-2B-1 — `feat(landing): WS-2B PR-2B-1 — hero refinement (Group 1)`. Closes WS-2B Group 1. Rubric 80 → 82.
**Previous on main:** PR #183 — WS-2B PHASE 1 plan.
**This handoff covers:** the PR-2B-1 build session (2026-05-19). See [`docs/retros/2026-05-19-ws2b-pr1-hero.md`](retros/2026-05-19-ws2b-pr1-hero.md).
**Author of last session:** Claude Code (Opus 4.7), Senior Frontend Architect + UI/UX Designer + PM + CTO mode.

---

## 1. LAUNCH VERDICT

> # **NOT READY** (BOOLEAN per the master plan)

**The finite launch surface is 4 items** (1 PRODUCTION-INCIDENT + 3 LAUNCH-BLOCKERs). Unchanged from PR #182. The agent-actionable launch-blocker queue is empty — all remaining items are owner-only. WS-2B is POST-LAUNCH; PR-2B-1 closed Group 1 / lifted the landing rubric to 82.

| | |
|---|---|
| 🚨 PI-1 | Activate migration-deploy pipeline + backfill 4 migrations |
| 🚀 LB-1 | SB-2 Sentry alert provisioning (~20 min owner-runnable) |
| 🚀 LB-2 | PL-2b live notifications (env vars + Meta template approval + e2e verify) |
| 🛠️ LB-4 | SB-3 P1–P4 prerequisites in Supabase dashboard |

---

## 2. What changed in this session

Code (1 file):
- **`packages/ui/src/components/composed/wasteland-landing.tsx`** — `LogisticsHero` only. AWB form wrapper restyled with real input shell (`bg-card border-2 border-border focus-within:border-primary focus-within:shadow-brutal-sm transition-colors`); secondary CTAs `h-14 px-10 text-sm` → `h-11 px-6 text-xs` + smaller icons + `gap-3 → gap-2`.

Docs (3 files):
- **`docs/launch/WS-2B-LANDING-POLISH.md`** — § 5 Group 1 marked DONE; § 7 cumulative rubric updated with the +2 delta.
- **`docs/launch/CUSTOMER-FACING-PLAN.md`** § 3.2 — PR-2B-1 marked DONE.
- **`docs/retros/2026-05-19-ws2b-pr1-hero.md`** (new).

---

## 3. Mandatory ramp (5 minutes)

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green.
pnpm audit --prod --audit-level moderate
```

Then read in order:

1. [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) — load if working on any UI surface.
2. [`docs/launch/WS-2B-LANDING-POLISH.md`](launch/WS-2B-LANDING-POLISH.md) — § 5 Groups 2 + 3 (next PR spec) + § 7 cumulative rubric.
3. § 6 of this file — the next task.

---

## 4. Read this first — do-NOT list

(Unchanged.)

1. **Do NOT skip `tac-express-onboarding`.**
2. **Do NOT bump dependencies in feature PRs.**
3. **Do NOT add Sentry tag keys without updating all four artifacts.**
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner-only.
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.**
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.**
7. **Do NOT derive task references from `#102`-the-GitHub-issue.**
8. **Do NOT promote a POST-LAUNCH item to SHIP-BLOCKER without explicit owner decision.**
9. **Do NOT mark SB-2 done on the owner's word alone.**
10. **Do NOT bundle PR-2B-2 with PR-2B-3** — each ships independently per the WS-2B-LANDING-POLISH plan.
11. **Do NOT redesign sections in PR-2B-2/3** — refinement only.

---

## 5. Open items snapshot

- **Open PRs:** the PR-2B-1 build PR (this branch). After merge → 0 open PRs.
- **Open issues:** 12. All reconciled into [`MASTER-LAUNCH-PLAN.md § 1.2`](launch/MASTER-LAUNCH-PLAN.md).

---

## 6. Next session's lead task

**PR-2B-2 — page rhythm + motion-overlap (WS-2B Groups 2 + 3).**

- **Scope:** see [`WS-2B-LANDING-POLISH.md § 5`](launch/WS-2B-LANDING-POLISH.md) Groups 2 + 3. Section padding ladder `py-24 → py-20` on `BusinessUtility` / `ResultsChart` / `SystemCompatibility`; header `mb-16 → mb-12`; `whileInView viewport margin -100px → -50px` on all 3 sections; `SystemCompatibility` two-col gap `gap-16 → gap-12`; left-col heading `mb-12 → mb-8`.
- **Gated on:** nothing — independent of owner. Ready any time.
- **Done criterion:** rubric criterion 3 (Rhythm) → 10; criterion 5 (Motion) → 10. axe-clean. No two sections' entrance animations overlap on slow scroll.
- **Pre-PR skill load:** [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) FIRST, then `tac-design-tokens` + `tac-micro-interactions`.
- **Estimate:** ~30 min build session.

After PR-2B-2 merges → PR-2B-3 (content sections). After PR-2B-3 merges → WS-2B closed → WS-3 spec is the next workstream.

---

## 7. OWNER ACTIONS — before next session

1. 🚨 **PI-1** — Activate migration-deploy + backfill (~10-15 min). See [`§ 4.1`](launch/MASTER-LAUNCH-PLAN.md).
2. 🚀 **LB-1** — Run SB-2 Sentry alert provisioning (~20 min). See § 4.2.
3. 🚀 **LB-2** — Activate PL-2b live notifications (after PI-1 + Meta template approval). See § 4.3.
4. 🛠️ **LB-4** — Verify SB-3 prereqs in Supabase dashboard (~10 min). See § 4.5.

Vercel `NEXT_PUBLIC_DASHBOARD_URL` remains deferred per the standing owner call. `npm audit` gate is green on main (PR #182).

🤖 Handoff written by Claude (Opus 4.7), 2026-05-19, post PR-2B-1.
