# Next-Session Handoff — Start Here

> **The launch authority is [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md) (v1.3).** The customer-facing workstream detail lives in [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md). The UI/UX consistency playbook at [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) is the standing standard.

**Last code commit on main:** the WS-2B PR-2B-3 — `feat(landing): WS-2B PR-2B-3 — content sections (Groups 4 + 5 + 6)`. **Closes WS-2B.** Rubric 84 → 88.5.
**Previous on main:** PR #185 — WS-2B PR-2B-2 (page rhythm + motion-overlap).
**This handoff covers:** the PR-2B-3 build session (2026-05-19). See [`docs/retros/2026-05-19-ws2b-pr3-content.md`](retros/2026-05-19-ws2b-pr3-content.md).
**Author of last session:** Claude Code (Opus 4.7), Senior Frontend Architect + UI/UX Designer + PM + CTO mode.

---

## 1. LAUNCH VERDICT

> # **NOT READY** (BOOLEAN per the master plan)

**The finite launch surface is 4 items** (1 PRODUCTION-INCIDENT + 3 LAUNCH-BLOCKERs). Unchanged from PR #182. The agent-actionable launch-blocker queue is empty — all remaining items are owner-only. **WS-2B closed; landing rubric at 88.5 (premium-tier boundary).**

| | |
|---|---|
| 🚨 PI-1 | Activate migration-deploy pipeline + backfill 4 migrations |
| 🚀 LB-1 | SB-2 Sentry alert provisioning (~20 min owner-runnable) |
| 🚀 LB-2 | PL-2b live notifications (env vars + Meta template approval + e2e verify) |
| 🛠️ LB-4 | SB-3 P1–P4 prerequisites in Supabase dashboard |

---

## 2. What changed in this session

Code (2 files):
- **`packages/ui/src/components/composed/wasteland-landing.tsx`** — `ResultsChart`: testimonial reframed as un-attributed case study (no avatar, no founder, no quotes, no inverted-highlight box); chart preserved. `SystemCompatibility`: dock card `shadow-md → shadow-brutal`; feature list `gap-8 → gap-10`.
- **`packages/ui/src/components/composed/footer.tsx`** — 3 column headings → `.t-overline text-foreground mb-6`; lone GitHub icon row removed entirely (owner decision A); `Icon` import dropped.

Docs (3 files):
- **`docs/launch/WS-2B-LANDING-POLISH.md`** — Groups 4, 5, 6 marked DONE; § 7 cumulative rubric finalized; "WS-2B CLOSED" stamp.
- **`docs/launch/CUSTOMER-FACING-PLAN.md`** § 3.2 — WS-2B marked CLOSED with rubric 80 → 88.5.
- **`docs/retros/2026-05-19-ws2b-pr3-content.md`** (new).

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
2. [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md) — § 4 (WS-3 spec).
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
10. **Do NOT bundle WS-3 with WS-4.** Each is its own session.
11. **WS-2B is CLOSED.** Do not reopen unless a new defect surfaces; file as POST-LAUNCH-POLISH instead.

---

## 5. Open items snapshot

- **Open PRs:** the PR-2B-3 build PR (this branch). After merge → 0 open PRs.
- **Open issues:** 12. All reconciled into [`MASTER-LAUNCH-PLAN.md § 1.2`](launch/MASTER-LAUNCH-PLAN.md).

---

## 6. Next session's lead task

**WS-3 — AWB tracking dialog (UX migration from page → dialog).**

- **Scope:** see [`CUSTOMER-FACING-PLAN.md § 4`](launch/CUSTOMER-FACING-PLAN.md). The tracking service + `/track/[awb]` page already exist + work; WS-3 is a UX migration to surface results in a shadcn `<Dialog>` from the landing hero. Three commits: API route → dialog component → wire LOCATE form. Closes the criterion 7 (State Choreography) gap that's holding the rubric at 88.5.
- **Gated on:** nothing — independent of owner. Ready any time.
- **Done criterion:** LOCATE form opens dialog on submit, shows loading skeleton → result within ~500ms; deep-link-able via `?track=AWB123` URL param; all 4 states (loaded/loading/empty/error) designed; axe-clean; Playwright E2E for happy path. Rubric criterion 7 → 9, criterion 10 → 9-10. **Landing rubric 88.5 → 92+ (clean PREMIUM).**
- **Pre-PR skill load:** [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) FIRST, then `tac-ui-authoring` + `tac-forms` + `tac-tdd` + `tac-api-surface`.
- **Estimate:** ~half-day PR-scale session with its own PHASE-0.

Owner triggers with `start WS-3` (or `write the WS-3 prompt` to receive the prompt first — the prompt was drafted in a prior session and is ready to re-emit).

After WS-3 merges → WS-4 (Contact TAC rename + dashboard support inbox; PI-1-blocked for production functionality).

---

## 7. OWNER ACTIONS — before next session

1. 🚨 **PI-1** — Activate migration-deploy + backfill (~10-15 min). See [`§ 4.1`](launch/MASTER-LAUNCH-PLAN.md).
2. 🚀 **LB-1** — Run SB-2 Sentry alert provisioning (~20 min). See § 4.2.
3. 🚀 **LB-2** — Activate PL-2b live notifications (after PI-1 + Meta template approval). See § 4.3.
4. 🛠️ **LB-4** — Verify SB-3 prereqs in Supabase dashboard (~10 min). See § 4.5.

Vercel `NEXT_PUBLIC_DASHBOARD_URL` remains deferred. `npm audit` gate is green on main (PR #182).

🤖 Handoff written by Claude (Opus 4.7), 2026-05-19, post WS-2B closing PR-2B-3.
