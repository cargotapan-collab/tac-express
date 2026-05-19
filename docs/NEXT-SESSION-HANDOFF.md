# Next-Session Handoff — Start Here

> **The launch authority is [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md) (v1.3).** The customer-facing workstream detail lives in [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md). The UI/UX consistency playbook at [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) is the standing standard for any customer-facing UI session.

**Last code commit on main:** the WS-1+WS-2 build PR — `feat(landing): WS-1 + WS-2 — launch-blockers + consistency pass`. Closes LB-5 + LB-6. Rubric 72 → 80/100.
**Previous on main:** PR #180 — playbook + plan + master reconciliation.
**This handoff covers:** the WS-1 + WS-2 build session (2026-05-19) which fixed the 2 customer-facing LBs + the 6 audit consistency items in one PR. See [`docs/retros/2026-05-19-landing-ws1-ws2.md`](retros/2026-05-19-landing-ws1-ws2.md).
**Author of last session:** Claude Code (Opus 4.7), in Senior Frontend Architect + UI/UX Designer + PM + CTO mode (delegated).

---

## 1. LAUNCH VERDICT

> # **NOT READY** (BOOLEAN per the master plan)

**The finite launch surface is 4 items** (1 PRODUCTION-INCIDENT + 3 LAUNCH-BLOCKERs). v1.3 closed LB-5 + LB-6. The agent-actionable launch-blocker queue is empty — all remaining items are owner-only.

| | |
|---|---|
| 🚨 PI-1 | Activate migration-deploy pipeline + backfill 4 migrations |
| 🚀 LB-1 | SB-2 Sentry alert provisioning (~20 min owner-runnable) |
| 🚀 LB-2 | PL-2b live notifications (env vars + Meta template approval + e2e verify) |
| ~~🛠️ LB-3~~ | ✅ DONE 2026-05-19 (PR #179) |
| 🛠️ LB-4 | SB-3 P1–P4 prerequisites in Supabase dashboard |
| ~~🚀 LB-5~~ | ✅ DONE 2026-05-19 (WS-1+WS-2 PR) — `NEXT_PUBLIC_DASHBOARD_URL` env-var pattern wired |
| ~~🚀 LB-6~~ | ✅ DONE 2026-05-19 (WS-1+WS-2 PR) — 11 in-page anchors resolve |

Critical path: ~1 hour of owner work + Meta template-approval latency (24–48h external). See [`MASTER-LAUNCH-PLAN.md § 3`](launch/MASTER-LAUNCH-PLAN.md).

---

## 2. What changed in this session

Code (3 files):
- **`packages/ui/src/components/composed/public-nav.tsx`** — extracted `DASHBOARD_URL` const from `process.env.NEXT_PUBLIC_DASHBOARD_URL`; applied to desktop + mobile-sheet nav.
- **`packages/ui/src/components/composed/wasteland-landing.tsx`** — `id="tracking"` / `id="how-it-works"` / `id="features"` + `scroll-mt-20`; placeholder contrast lifted; metric grid → equal `md:grid-cols-3`; chart card padding `p-12` → `p-8`; hero CTA heights unified to h-14; testimonial quote → `.t-h3 font-mono uppercase`; 4 opacity modifiers → named overlay tokens.
- **`packages/ui/src/components/composed/footer.tsx`** — dead `shadow-brutal-t` removed; 2 opacity modifiers → named overlay tokens.

Docs (4 files):
- **`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`** — overlay-token name correction (§ 5: `bg-primary-soft` etc., not `bg-overlay-primary-soft`).
- **`docs/launch/CUSTOMER-FACING-PLAN.md`** v1.1 — WS-1 + WS-2A marked DONE.
- **`docs/launch/MASTER-LAUNCH-PLAN.md`** v1.3 — LB-5 + LB-6 struck-through; finite surface 6 → 4 items.
- **`docs/retros/2026-05-19-landing-ws1-ws2.md`** (new).

---

## 3. Mandatory ramp (5 minutes)

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green.
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
```

Then read in order:

1. [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) — load if working on any UI surface.
2. [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md) — § 4 (WS-3 spec for the tracking dialog).
3. [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md) — § 2.2 for the remaining owner-only LBs.
4. [`docs/retros/2026-05-19-landing-ws1-ws2.md`](retros/2026-05-19-landing-ws1-ws2.md) — full session retro.
5. § 6 of this file — the next task.

---

## 4. Read this first — do-NOT list

(Unchanged.)

1. **Do NOT skip `tac-express-onboarding`.**
2. **Do NOT bump dependencies in feature PRs.**
3. **Do NOT add Sentry tag keys without updating all four artifacts.**
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner-only.
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.**
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.**
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** `docs/backlog/production-readiness.md` is authoritative.
8. **Do NOT promote a POST-LAUNCH item to SHIP-BLOCKER without explicit owner decision.**
9. **Do NOT mark SB-2 done on the owner's word alone.** Sentry MCP must show the synthetic event.
10. **Do NOT bundle WS-3 with WS-4 or any other workstream.**

---

## 5. Open items snapshot

- **Open PRs:** the WS-1+WS-2 build PR (this branch). After merge → 0 open PRs.
- **Open issues:** 12. All reconciled into [`MASTER-LAUNCH-PLAN.md § 1.2`](launch/MASTER-LAUNCH-PLAN.md).

---

## 6. Next session's lead task

**WS-3 — AWB tracking dialog (UX migration from page → dialog).**

- **Scope:** see [`CUSTOMER-FACING-PLAN.md § 4`](launch/CUSTOMER-FACING-PLAN.md). The tracking service + `/track/[awb]` page already exist + work; WS-3 is a UX migration to surface results in a shadcn `<Dialog>` from the landing hero (cheaper for visitors with one quick lookup) while keeping the page route for deep-linking + SEO. Three commits: API route → dialog component → wire LOCATE form.
- **Gated on:** nothing — independent of owner. Ready any time.
- **Done criterion:** LOCATE form opens dialog on submit, shows loading skeleton → results within ~500ms; deep-link-able via `?track=AWB123` URL param; all 4 states (loaded/loading/empty/error) designed; axe-clean; Playwright E2E for happy path.
- **Pre-PR skill load:** [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) FIRST, then `tac-ui-authoring` + `tac-forms` + `tac-tdd`.
- **Estimate:** ~half-day PR-scale session with its own PHASE-0.

Alternative if owner prefers: the `chore(deps)` PR for the pre-existing npm-audit moderates (`@sentry/nextjs` + `@supabase/supabase-js` minor bumps). ~30 min. Slot-filler.

---

## 7. OWNER ACTIONS — before next session

See [`docs/retros/2026-05-19-landing-ws1-ws2.md § 8`](retros/2026-05-19-landing-ws1-ws2.md). Most-urgent first: **PI-1** (production-incident → activate migration-deploy pipeline).

1. 🚨 **PI-1** — Activate migration-deploy + backfill (~10-15 min). See [`§ 4.1`](launch/MASTER-LAUNCH-PLAN.md).
2. 🚀 **LB-1** — Run SB-2 Sentry alert provisioning (~20 min). See § 4.2.
3. 🚀 **LB-2** — Activate PL-2b live notifications (after PI-1 + Meta template approval, 24-48h external). See § 4.3. WS-4A "Contact TAC" rename bundles with this owner step.
4. 🛠️ **LB-4** — Verify SB-3 prereqs in Supabase dashboard (~10 min). See § 4.5.
5. 🛠️ **Verify `NEXT_PUBLIC_DASHBOARD_URL`** is set on apps/web Vercel project — required so the LB-5 nav link resolves to the live dashboard in production (the fallback is the localhost URL). ~2 min.
6. (Optional) Bump `@sentry/nextjs` + `@supabase/supabase-js` minors to clear pre-existing `npm audit` moderates. Or tell the next agent session to ship it as the slot-filler before WS-3.

🤖 Handoff written by Claude (Opus 4.7), 2026-05-19, post WS-1+WS-2.
