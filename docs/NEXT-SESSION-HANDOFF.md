# Next-Session Handoff — Start Here

> **The launch authority is [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md) (v1.3).** The customer-facing workstream detail lives in [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md). The UI/UX consistency playbook at [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) is the standing standard.

**Last code commit on main:** the WS-3 PR-WS-3a — `feat(api): public /api/track/[awb] route + tests`. WS-3 split per pre-named bailout seam; UI layer is PR-WS-3b.
**Previous on main:** PR #186 — WS-2B PR-2B-3 (closed WS-2B; rubric 88.5).
**This handoff covers:** the PR-WS-3a build session (2026-05-20). See [`docs/retros/2026-05-20-ws3-pra-track-route.md`](retros/2026-05-20-ws3-pra-track-route.md).
**Author of last session:** Claude Code (Opus 4.7), Senior Frontend Architect + Full-Stack Engineer + PM + CTO mode.

---

## 1. LAUNCH VERDICT

> # **NOT READY** (BOOLEAN per the master plan)

**The finite launch surface is 4 items** (1 PRODUCTION-INCIDENT + 3 LAUNCH-BLOCKERs). Unchanged. WS-3 is POST-LAUNCH; this session shipped the API contract half (PR-WS-3a). UI half (PR-WS-3b) is the next agent session.

| | |
|---|---|
| 🚨 PI-1 | Activate migration-deploy pipeline + backfill 4 migrations |
| 🚀 LB-1 | SB-2 Sentry alert provisioning (~20 min owner-runnable) |
| 🚀 LB-2 | PL-2b live notifications (env vars + Meta template approval + e2e verify) |
| 🛠️ LB-4 | SB-3 P1–P4 prerequisites in Supabase dashboard |

---

## 2. What changed in this session

Code (4 files):
- **`apps/web/app/api/track/[awb]/route.ts`** — new. Public GET handler. Zod-validates AWB, rate-limits, calls `createPublicTrackingService` server-side, returns JSON.
- **`apps/web/app/api/track/[awb]/route.test.ts`** — new. 6 value-capturing tests covering 200 / 404 / 400-too-short / 400-illegal-chars / 429 / XFF parsing.
- **`apps/web/lib/rate-limit.ts`** — new `trackLookupRateLimit` + `checkTrackLookup` helper (30 req / 1 min / IP).
- **`vitest.config.ts`** — new workspace alias `@workspace/services/<name>` → `packages/services/src/<name>.ts` (mirrors the existing UI alias). First consumer: this PR's route test.

Docs (2 files):
- **`docs/launch/CUSTOMER-FACING-PLAN.md`** § 4 — recommended PR shape rewritten as PR-WS-3a (done) + PR-WS-3b (next).
- **`docs/retros/2026-05-20-ws3-pra-track-route.md`** (new).

---

## 3. Mandatory ramp (5 minutes)

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 787 tests pass (was 781 + 6 new route tests).
pnpm audit --prod --audit-level moderate
```

Then read in order:

1. [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) — load FIRST for any customer-facing UI work.
2. [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md) — § 4.1 (PR-WS-3b scope).
3. [`docs/retros/2026-05-20-ws3-pra-track-route.md`](retros/2026-05-20-ws3-pra-track-route.md) — § 8 names PR-WS-3b's 3 commits.
4. § 6 of this file — the next task.

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
10. **Do NOT modify the `/track/[awb]` page route** in PR-WS-3b. It's the surviving deep-link / SEO / share surface. Dialog wraps `<TrackingResultView>` only.
11. **Do NOT duplicate AWB validation** between the route and the dialog. The route owns validation. Dialog surfaces the route's error response.

---

## 5. Open items snapshot

- **Open PRs:** the PR-WS-3a build PR (this branch). After merge → 0 open PRs.
- **Open issues:** 12. All reconciled into [`MASTER-LAUNCH-PLAN.md § 1.2`](launch/MASTER-LAUNCH-PLAN.md).

---

## 6. Next session's lead task

**PR-WS-3b — `<AwbInput>` + `<TrackingResultDialog>` + LOCATE-form wire-up.**

The API contract is now stable on main; PR-WS-3b composes against it.

- **Scope:** see [`CUSTOMER-FACING-PLAN.md § 4.1`](launch/CUSTOMER-FACING-PLAN.md) (PR-WS-3b row) + [`docs/retros/2026-05-20-ws3-pra-track-route.md § 8`](retros/2026-05-20-ws3-pra-track-route.md). Three commits:
  1. **`feat(ui): <AwbInput> primitive`** — `packages/ui/src/components/composed/awb-input.tsx`. Variants `size: "hero" | "default"`. Refactor hero LOCATE to use it (second consumer triggers extraction per playbook § 4).
  2. **`feat(ui): <TrackingResultDialog> composed`** — Wraps shadcn `<Dialog>` primitive from `packages/ui/src/components/primitives/dialog.tsx`. Fetches `/api/track/${awb}`. Four states (LOADED / LOADING / EMPTY / ERROR) per playbook § 6.
  3. **`feat(landing): wire LOCATE → TrackingResultDialog with ?track sync`** — Hero LOCATE submit opens dialog + `router.replace` shallow `?track=AWB`. Mount-read opens dialog from `?track=` URL. Close clears param. Playwright smoke + a11y additions.
- **Gated on:** nothing — independent of owner.
- **Done criterion:** LOCATE on landing opens dialog with skeleton within 100ms → result within 500ms; deep-link-able via `?track=AWB123`; `/track/[awb]` page route unchanged; axe-clean with dialog open; Playwright covers happy path + empty state + URL deep-link + Esc-close. Lifts rubric criterion 7 (State Choreography) 5 → 9.
- **Pre-PR skill load:** [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) FIRST, then `tac-ui-authoring` + `tac-forms` + `tac-tdd`.
- **Estimate:** ~45-90 min build session.

Owner triggers with `start PR-WS-3b` (or `write the PR-WS-3b prompt` to receive a fresh prompt first).

After PR-WS-3b merges → WS-3 closed → WS-4 (Contact TAC rename + dashboard support inbox; PI-1-blocked) is next.

---

## 7. OWNER ACTIONS — before next session

1. 🚨 **PI-1** — Activate migration-deploy + backfill (~10-15 min). See [`§ 4.1`](launch/MASTER-LAUNCH-PLAN.md).
2. 🚀 **LB-1** — Run SB-2 Sentry alert provisioning (~20 min). See § 4.2.
3. 🚀 **LB-2** — Activate PL-2b live notifications (after PI-1 + Meta template approval). See § 4.3.
4. 🛠️ **LB-4** — Verify SB-3 prereqs in Supabase dashboard (~10 min). See § 4.5.

Vercel `NEXT_PUBLIC_DASHBOARD_URL` remains deferred. `npm audit` gate is green on main (PR #182).

🤖 Handoff written by Claude (Opus 4.7), 2026-05-20, post PR-WS-3a (bailout split).
