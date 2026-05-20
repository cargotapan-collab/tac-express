# Next-Session Handoff — Start Here

> **The launch authority is [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md) (v1.3).** The customer-facing workstream detail lives in [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md). The UI/UX consistency playbook at [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) is the standing standard.

**Last code commit on main:** the WS-3 PR-WS-3b — `feat(ui): WS-3 PR-WS-3b — tracking dialog + LOCATE wire-up`. **Closes WS-3.** Landing rubric ~92 (clean PREMIUM).
**Previous on main:** PR #187 — WS-3 PR-WS-3a (the `/api/track/[awb]` route).
**This handoff covers:** the PR-WS-3b build session (2026-05-20). See [`docs/retros/2026-05-20-ws3-prb-tracking-dialog.md`](retros/2026-05-20-ws3-prb-tracking-dialog.md).
**Author of last session:** Claude Code (Opus 4.7), Senior Frontend Architect + Full-Stack Engineer + PM + CTO mode.

---

## 1. LAUNCH VERDICT

> # **NOT READY** (BOOLEAN per the master plan)

**The finite launch surface is 4 items** (1 PRODUCTION-INCIDENT + 3 LAUNCH-BLOCKERs). Unchanged. WS-3 closed (POST-LAUNCH). The customer-facing landing + tracking experience is now at clean PREMIUM; the remaining launch gate is entirely owner-side credential/permission work.

| | |
|---|---|
| 🚨 PI-1 | Activate migration-deploy pipeline + backfill 4 migrations |
| 🚀 LB-1 | SB-2 Sentry alert provisioning (~20 min owner-runnable) |
| 🚀 LB-2 | PL-2b live notifications (env vars + Meta template approval + e2e verify) |
| 🛠️ LB-4 | SB-3 P1–P4 prerequisites in Supabase dashboard |

---

## 2. What changed in this session

Code (4 source files + 2 tests):
- **`packages/ui/src/components/composed/awb-input.tsx`** (new) — shared AWB input primitive (hero/default sizes).
- **`packages/ui/src/components/composed/awb-input.test.tsx`** (new) — 8 tests.
- **`packages/ui/src/components/composed/tracking-result-dialog.tsx`** (new) — shadcn-Dialog-wrapped tracking dialog; 4 states; fetches `/api/track/[awb]`.
- **`packages/ui/src/components/composed/tracking-result-dialog.test.tsx`** (new) — 6 tests.
- **`packages/ui/src/components/composed/wasteland-landing.tsx`** — hero uses `<AwbInput>`; LOCATE opens the dialog; `?track=AWB` History-API URL sync; mount auto-open; `useRouter` removed.
- **`apps/web/e2e/landing.smoke.spec.ts`** — 3 new dialog smokes (open-on-submit + URL, Esc-close + clear, deep-link auto-open).

Docs (2 files):
- **`docs/launch/CUSTOMER-FACING-PLAN.md`** § 4 — WS-3 marked CLOSED (PR-WS-3a + PR-WS-3b).
- **`docs/retros/2026-05-20-ws3-prb-tracking-dialog.md`** (new).

---

## 3. Mandatory ramp (5 minutes)

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 803 tests pass (was 789 + 14 new: 8 AwbInput, 6 dialog).
pnpm audit --prod --audit-level moderate
```

Then read in order:

1. [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) — load FIRST for any UI work.
2. [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md) — § 5 (WS-4 scope).
3. [`docs/retros/2026-05-20-ws3-prb-tracking-dialog.md`](retros/2026-05-20-ws3-prb-tracking-dialog.md) — § 7 names WS-4's split.
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
10. **Do NOT design the WS-4B schema in a planning session.** WS-4B (dashboard support inbox) reads `contact_leads` PII — its RLS + schema + service are PHASE-0 work for that build session.
11. **Do NOT bundle WS-4A (rename) with WS-4B (inbox).** They're separate per the plan; WS-4A bundles with LB-2 activation.

---

## 5. Open items snapshot

- **Open PRs:** the PR-WS-3b build PR (this branch). After merge → 0 open PRs.
- **Open issues:** 12. All reconciled into [`MASTER-LAUNCH-PLAN.md § 1.2`](launch/MASTER-LAUNCH-PLAN.md).

---

## 6. Next session's lead task

**WS-4 — "Contact Sales" → "Contact TAC" + dashboard support inbox.** See [`CUSTOMER-FACING-PLAN.md § 5`](launch/CUSTOMER-FACING-PLAN.md).

Two halves, genuinely separate:
- **WS-4A — the rename.** "Contact Sales" → "Contact TAC" across the landing (one occurrence at `wasteland-landing.tsx` CONTACT SALES button). ~10-min change. **Bundles with LB-2 activation** per the plan — renaming a button that links to a 500-ing `/api/contact` has limited value until PI-1 deploys `contact_leads`. Recommend the owner ship this alongside the LB-2 owner step.
- **WS-4B — dashboard support inbox.** NEW `apps/dashboard/app/ops-console/support/` surface reading `contact_leads`. **PI-1-blocked** (the table must exist in production). Needs its own PHASE-0: RLS policy for MANAGER+ read, additive schema columns (read_at/triaged_by/etc.), service-layer methods, 3 composed UI components, audit-trail wiring. ~half-day PR-scale session.

Owner triggers with `write the WS-4 prompt`, `start WS-4A`, or another priority (e.g., the deferred WS-2 closing-CTA polish, or the carry-forward POST-LAUNCH-POLISH items).

**Note:** the agent-actionable customer-facing UI burn-down is now substantial-complete — WS-1 (launch-blockers), WS-2 + WS-2B (consistency + premium polish), and WS-3 (tracking dialog) are all closed. WS-4B is the last sizable build, and it's PI-1-gated. **The critical path to launch is now almost entirely the owner's 4-item queue.**

---

## 7. OWNER ACTIONS — before next session

1. 🚨 **PI-1** — Activate migration-deploy + backfill (~10-15 min). See [`§ 4.1`](launch/MASTER-LAUNCH-PLAN.md). **Now doubly relevant:** it unblocks both the contact form AND verifies the new tracking dialog against live shipment data.
2. 🚀 **LB-1** — Run SB-2 Sentry alert provisioning (~20 min). See § 4.2.
3. 🚀 **LB-2** — Activate PL-2b live notifications (after PI-1 + Meta template approval). See § 4.3. Bundle the WS-4A "Contact TAC" rename here.
4. 🛠️ **LB-4** — Verify SB-3 prereqs in Supabase dashboard (~10 min). See § 4.5.

Vercel `NEXT_PUBLIC_DASHBOARD_URL` remains deferred. `npm audit` gate is green on main (PR #182).

🤖 Handoff written by Claude (Opus 4.7), 2026-05-20, post WS-3 closing PR-WS-3b.
