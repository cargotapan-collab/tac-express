# Next-Session Handoff — Start Here

> **The launch authority is [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md) (v1.2).** The customer-facing workstream detail lives in [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md). The UI/UX consistency playbook at [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) is the standing standard for any customer-facing UI session.

**Last code commit on `main`:** PR #179 — `fix(a11y): close LB-3 / #173 — Option B class-redirect for WCAG AA contrast`. Merge SHA `c21e56b`.
**Last docs commit on `main`:** PR #178 — `docs(launch): master reconciliation`. Merge SHA `0af5a9b`.
**This handoff covers:** the UX-playbook-and-plan session (2026-05-19) which produced the playbook, the customer-facing plan, and the MASTER-LAUNCH-PLAN.md v1.2 reconciliation (added LB-5 + LB-6 on top of v1.1's LB-3 closure). See [`docs/retros/2026-05-19-ux-playbook-and-plan.md`](retros/2026-05-19-ux-playbook-and-plan.md).
**Author of last session:** Claude Code (Opus 4.7) in PM + CTO + Senior Frontend Architect mode (delegated by owner).

---

## 1. LAUNCH VERDICT

> # **NOT READY** (BOOLEAN per the master plan)

**The finite launch surface is 6 items** (1 PRODUCTION-INCIDENT + 5 LAUNCH-BLOCKERs). v1.1 closed LB-3 (contrast). v1.2 added LB-5 + LB-6 — **both agent-actionable**, gated only on a 2-min owner env-var input. The agent's launch-blocker queue is no longer empty.

| | |
|---|---|
| 🚨 PI-1 | Activate migration-deploy pipeline + backfill 4 migrations (`contact_leads` + `whatsapp_sends` + 2 audit-logs migrations) |
| 🚀 LB-1 | SB-2 Sentry alert provisioning (~20 min owner-runnable) |
| 🚀 LB-2 | PL-2b live notifications (env vars + Meta template approval + e2e verify) |
| ~~🛠️ LB-3~~ | ✅ **DONE 2026-05-19** (PR #179 — Option B class-redirect across 4 sites; `AXE_FAIL_ON_VIOLATIONS=1` flipped) |
| 🛠️ LB-4 | SB-3 P1–P4 prerequisites in Supabase dashboard |
| 🚀 **LB-5 (new v1.2)** | **Replace `localhost:3001` hardcode with `NEXT_PUBLIC_DASHBOARD_URL` — agent-actionable, one PR with LB-6** |
| 🚀 **LB-6 (new v1.2)** | **Wire 11 dead in-page anchors — agent-actionable, one PR with LB-5** |

Critical path: ~1 hour of owner work + Meta template-approval latency (24–48h external) + ~45 min agent session for WS-1 (LB-5 + LB-6 together). See the full sequence in [`MASTER-LAUNCH-PLAN.md § 3`](launch/MASTER-LAUNCH-PLAN.md).

---

## 2. What changed in this session

Three artifacts shipped (zero feature code):

- **[`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md)** — the new standing standard for customer-facing UI sessions. Eight discipline areas, codebase examples, copy-pasteable PR checklist in § 8.
- **[`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md)** — WS-1 through WS-4 sequenced, bucketed, dependency-noted. Honest bucketing: 2 LBs + 18 POST-LAUNCH.
- **[`docs/launch/MASTER-LAUNCH-PLAN.md` v1.2](launch/MASTER-LAUNCH-PLAN.md)** — added LB-5 + LB-6 + § 4.7 owner env-var input + § 1.4 customer-facing workstream entry (on top of v1.1's LB-3 closure).

Workflow integration:
- AGENTS.md § 0 now points at the playbook as the customer-facing UI standard.
- CLAUDE.md § 1 task-classification table has a "Customer-facing UI (apps/web)" row pointing at the playbook FIRST.
- RESOLVER.md UI section routes customer-facing-surface intent at the playbook FIRST.
- routing.jsonl gains 3 trigger-phrase entries for the playbook.

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

1. [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) — the new standing standard.
2. [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md) — § 2 (WS-1, the next task's spec) + § 9 (audit source references).
3. [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md) — § 2.2 (LB-5 + LB-6) + § 4.7 (owner env-var input).
4. [`docs/retros/2026-05-19-ux-playbook-and-plan.md`](retros/2026-05-19-ux-playbook-and-plan.md) — full session retro.
5. § 6 of this file — the next task.

---

## 4. Read this first — do-NOT list

(Unchanged from prior sessions, with two v1.2 additions.)

1. **Do NOT skip `tac-express-onboarding`.** Mandatory per AGENTS.md § 0.
2. **Do NOT bump dependencies in feature PRs.**
3. **Do NOT add Sentry tag keys without updating all four artifacts.**
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner-only.
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.**
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** `docs/backlog/production-readiness.md` is authoritative.
8. **Do NOT promote a POST-LAUNCH item to SHIP-BLOCKER or PRODUCT-LAUNCH-BLOCKER without explicit owner decision.** Convention A.
9. **Do NOT mark SB-2 done on the owner's word alone.** The Sentry MCP must show the `api/diagnostics` synthetic event in the issue stream as evidence the runbook's § 5.3 procedure ran end-to-end.
10. **NEW v1.2 — Do NOT build WS-2 / WS-3 / WS-4 in the WS-1 session.** WS-1 is its own PR (LB-5 + LB-6 only). The customer-facing plan's WS items each get their own session per the one-PR-per-concern discipline. Bundling violates [`CUSTOMER-FACING-PLAN.md § 0`](launch/CUSTOMER-FACING-PLAN.md).
11. **NEW v1.2 — Do NOT touch the playbook's eight discipline areas in the WS-1 PR.** The playbook is the contract; WS-1 follows it (closes its pre-PR checklist in § 8), it does NOT amend it.

---

## 5. Open items snapshot

- **Open PRs:** the playbook-and-plan PR from this session (the one this handoff lives in). After merge → 0 open PRs.
- **Open issues:** 12 — #173 closed by PR #179. All remaining reconciled into [`MASTER-LAUNCH-PLAN.md § 1.2`](launch/MASTER-LAUNCH-PLAN.md). Customer-facing plan's WS-2 / WS-3 / WS-4 items are session-scope (not GitHub-issue-tracked).

---

## 6. Next session's lead task

**WS-1 — customer-facing launch-blockers (LB-5 + LB-6 — one PR).**

- **Scope:** see [`CUSTOMER-FACING-PLAN.md § 2`](launch/CUSTOMER-FACING-PLAN.md) for the full WS-1 spec.
  - LB-5: replace hardcoded `http://localhost:3001` in `packages/ui/src/components/composed/public-nav.tsx` with `NEXT_PUBLIC_DASHBOARD_URL`. Both mobile + desktop nav share the source. Build-time fallback fails build (NOT silently renders localhost) if env var unset.
  - LB-6: add `id="features"` / `id="how-it-works"` / `id="tracking"` to the SystemCompatibility, BusinessUtility, and Hero LOCATE-form sections respectively in `packages/ui/src/components/composed/wasteland-landing.tsx`. Or, owner-decision: rewire nav labels to dedicated routes. Default: keep labels, assign IDs.
- **Gated on:** owner sets `NEXT_PUBLIC_DASHBOARD_URL` on the apps/web Vercel project per [`MASTER-LAUNCH-PLAN.md § 4.7`](launch/MASTER-LAUNCH-PLAN.md). ~2 min owner action. Once set, the agent can run the WS-1 PR start-to-finish in ~45 min.
- **Done criterion:** Playwright `apps/web/e2e/landing.spec.ts` asserts (a) Dashboard nav goes to non-localhost in `VERCEL_ENV='production'` and (b) navigation to `#features` / `#how-it-works` / `#tracking` produces `scrollTop > 100`. Five quality gates green. UI playbook § 8 checklist filled in PR body.
- **Pre-PR skill load:** load [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md) FIRST, then `tac-ui-authoring`, then `tac-tdd` for the smoke tests.
- **Estimate:** ~45 min agent session.

If the owner instead prioritizes one of the owner-only LBs first (PI-1 / LB-1 / LB-2 / LB-4), the agent has no other launch-blocker work pending. WS-1 is the only agent-actionable launch-blocker.

---

## 7. OWNER ACTIONS — before next session

See [`docs/retros/2026-05-19-ux-playbook-and-plan.md § 8`](retros/2026-05-19-ux-playbook-and-plan.md) — the consolidated list. Most-urgent first: **PI-1** (production-incident → activate migration-deploy pipeline). Cross-referenced to [`MASTER-LAUNCH-PLAN.md § 4`](launch/MASTER-LAUNCH-PLAN.md).

1. 🚨 **PI-1** — Activate migration-deploy pipeline + backfill (~10 min). See [`§ 4.1`](launch/MASTER-LAUNCH-PLAN.md).
2. 🚀 **LB-1** — Run SB-2 Sentry alert provisioning (~20 min). See [`§ 4.2`](launch/MASTER-LAUNCH-PLAN.md).
3. 🚀 **LB-2** — Activate PL-2b live notifications (after PI-1 + template approval). See [`§ 4.3`](launch/MASTER-LAUNCH-PLAN.md). ~30 min.
4. 🛠️ **LB-4** — Verify SB-3 prereqs in Supabase dashboard. See [`§ 4.5`](launch/MASTER-LAUNCH-PLAN.md). ~10 min.
5. 🚀 **NEW v1.2 — LB-5 env-var input** — Set `NEXT_PUBLIC_DASHBOARD_URL` on the apps/web Vercel project (Production + Preview + Development). ~2 min. The single input that unblocks WS-1. See [`§ 4.7`](launch/MASTER-LAUNCH-PLAN.md).
6. **Cross-feature dependency note:** WS-3 and WS-4 both depend on PI-1 for production functionality. PI-1 is the load-bearing dependency for the customer-facing workstream's value-realization.

🤖 Handoff written by Claude (Opus 4.7), 2026-05-19, v1.2.
