# Next-Session Handoff — Start Here

> **The launch authority is [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md) (v1.3).** The customer-facing workstream detail lives in [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md). The UI/UX consistency playbook at [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) is the standing standard.

**Last code commit on main:** the WS-2B PR-2B-2 — `feat(landing): WS-2B PR-2B-2 — page rhythm + motion-overlap (Groups 2 + 3)`. Rubric 82 → 84.
**Previous on main:** PR #184 — WS-2B PR-2B-1 (hero refinement).
**This handoff covers:** the PR-2B-2 build session (2026-05-19). See [`docs/retros/2026-05-19-ws2b-pr2-rhythm-motion.md`](retros/2026-05-19-ws2b-pr2-rhythm-motion.md).
**Author of last session:** Claude Code (Opus 4.7), Senior Frontend Architect + UI/UX Designer + PM + CTO mode.

---

## 1. LAUNCH VERDICT

> # **NOT READY** (BOOLEAN per the master plan)

**The finite launch surface is 4 items** (1 PRODUCTION-INCIDENT + 3 LAUNCH-BLOCKERs). Unchanged from PR #182. WS-2B is POST-LAUNCH; PR-2B-2 lifted the landing rubric to 84.

| | |
|---|---|
| 🚨 PI-1 | Activate migration-deploy pipeline + backfill 4 migrations |
| 🚀 LB-1 | SB-2 Sentry alert provisioning (~20 min owner-runnable) |
| 🚀 LB-2 | PL-2b live notifications (env vars + Meta template approval + e2e verify) |
| 🛠️ LB-4 | SB-3 P1–P4 prerequisites in Supabase dashboard |

---

## 2. What changed in this session

Code (1 file):
- **`packages/ui/src/components/composed/wasteland-landing.tsx`** — section padding `py-24 → py-20` on 3 content sections; headers `mb-16 → mb-12` on 2 centered sections; `whileInView margin "-100px" → "-50px"` on 6 sites across BusinessUtility / ResultsChart / SystemCompatibility; SystemCompatibility two-col `gap-16 → gap-12`; left-col heading `mb-12 → mb-8`.

Docs (3 files):
- **`docs/launch/WS-2B-LANDING-POLISH.md`** — Groups 2 + 3 marked DONE; § 7 cumulative rubric updated with the +2 delta.
- **`docs/launch/CUSTOMER-FACING-PLAN.md`** § 3.2 — PR-2B-2 marked DONE; PR-2B-3 named as the remaining work.
- **`docs/retros/2026-05-19-ws2b-pr2-rhythm-motion.md`** (new).

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
2. [`docs/launch/WS-2B-LANDING-POLISH.md`](launch/WS-2B-LANDING-POLISH.md) — § 5 Groups 4 + 5 + 6 (next PR spec) + § 7 cumulative rubric.
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
10. **Do NOT redesign sections in PR-2B-3** — refinement only. The testimonial reframe is a content swap to an un-attributed case study; no invented customer name or quote.

---

## 5. Open items snapshot

- **Open PRs:** the PR-2B-2 build PR (this branch). After merge → 0 open PRs.
- **Open issues:** 12. All reconciled into [`MASTER-LAUNCH-PLAN.md § 1.2`](launch/MASTER-LAUNCH-PLAN.md).

---

## 6. Next session's lead task

**PR-2B-3 — content sections (WS-2B Groups 4 + 5 + 6). Closes WS-2B.**

- **Scope:** see [`WS-2B-LANDING-POLISH.md § 5`](launch/WS-2B-LANDING-POLISH.md) Groups 4 + 5 + 6.
  - **Group 4** — Testimonial → un-attributed case study (`ResultsChart`). Section eyebrow → `CASE STUDY · NORTH-EAST CORRIDOR FLEET`. Body → factual case-study statement (no quotes, no avatar, no founder line). `bg-foreground text-background` inline highlight → `text-primary font-bold`. **NO INVENTED CUSTOMER NAME OR QUOTE.**
  - **Group 5** — Integration dock card `shadow-md → shadow-brutal`; left-col feature `gap-8 → gap-10` + `lg:justify-between` for vertical fill.
  - **Group 6** — Footer column headings → `.t-overline text-foreground mb-6`. **Owner decision at PR merge:** lone GitHub icon — (A) drop the row [default], (B) add second link, (C) keep.
- **Gated on:** nothing — independent of owner. Ready any time.
- **Done criterion:** rubric criterion 9 (Content Voice) → 9; criterion 10 (Anti-AI-Slop) → 8. axe-clean. No `bg-foreground text-background` inline highlights remaining. No `text-sm font-bold ... tracking-paper-20` raw class strings in footer.
- **Pre-PR skill load:** [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) FIRST, then `tac-design-tokens` + `tac-ui-rubric`.
- **Estimate:** ~45 min build session.

After PR-2B-3 merges → WS-2B closed → WS-3 (AWB tracking dialog) is the next workstream (prompt already drafted).

---

## 7. OWNER ACTIONS — before next session

1. 🚨 **PI-1** — Activate migration-deploy + backfill (~10-15 min). See [`§ 4.1`](launch/MASTER-LAUNCH-PLAN.md).
2. 🚀 **LB-1** — Run SB-2 Sentry alert provisioning (~20 min). See § 4.2.
3. 🚀 **LB-2** — Activate PL-2b live notifications (after PI-1 + Meta template approval). See § 4.3.
4. 🛠️ **LB-4** — Verify SB-3 prereqs in Supabase dashboard (~10 min). See § 4.5.

Vercel `NEXT_PUBLIC_DASHBOARD_URL` remains deferred. `npm audit` gate is green on main (PR #182).

🤖 Handoff written by Claude (Opus 4.7), 2026-05-19, post PR-2B-2.
