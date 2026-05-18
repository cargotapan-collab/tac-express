# Next-Session Handoff — Start Here

> **The launch authority is now [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md).** That single file is the reconciled rollup across every workstream (engineering DoD + product-launch readiness + Run-series outputs incl. #173/#174). Read it FIRST. The per-bar files (`definition-of-done.md` / `product-launch-readiness.md`) keep their SB-N / PL-N nomenclature and per-item testable-done criteria; the master plan is the rollup.

**Last code commit on `main`:** PR #177 — `ci: apps/web e2e workflow — smoke + a11y across 3 viewports (PL-4 followup)`. Merge SHA `180b93a`.
**This handoff covers:** the master-reconciliation session (2026-05-18) which produced MASTER-LAUNCH-PLAN.md and reclassified #174 as a PRODUCTION-INCIDENT. See [`docs/retros/2026-05-18-master-reconciliation.md`](retros/2026-05-18-master-reconciliation.md).
**Author of last session:** Claude Code (Opus 4.7) in PM + CTO mode (delegated by owner).

---

## 1. LAUNCH VERDICT

> # **NOT READY** (BOOLEAN per the master plan)

**The finite launch surface is 5 items** (1 PRODUCTION-INCIDENT + 4 LAUNCH-BLOCKERs). Every Tier-1 item is currently owner-gated. The agent's launch-blocker queue is empty until owner inputs land.

| | |
|---|---|
| 🚨 PI-1 | Activate migration-deploy pipeline + backfill 4 migrations (`contact_leads` + `whatsapp_sends` + 2 audit-logs migrations) |
| 🚀 LB-1 | SB-2 Sentry alert provisioning (~20 min owner-runnable) |
| 🚀 LB-2 | PL-2b live notifications (env vars + Meta template approval + e2e verify) |
| 🛠️ LB-3 | #173 contrast — owner design call on PR #176, then agent applies to 3 sites |
| 🛠️ LB-4 | SB-3 P1–P4 prerequisites in Supabase dashboard |

Critical path: ~1 hour of owner work + Meta template-approval latency (24–48h external) + ~1 agent session for LB-3 follow-through. See the full sequence in [`MASTER-LAUNCH-PLAN.md § 3`](launch/MASTER-LAUNCH-PLAN.md).

---

## 2. Master-reconciliation evidence summary

- **#174 PRODUCTION-INCIDENT confirmed via Supabase MCP** — `mcp__supabase__list_tables` on project `mdvnphbucrpspntrezmj` returned 13 tables; neither `contact_leads` nor `whatsapp_sends` is in remote `public`. `/api/contact` would 500 on first real submission.
- **SB-2 NOT-RUN confirmed via Sentry MCP** — zero `api/diagnostics`-tagged issues across project lifetime; zero unresolved last 7 days. The synthetic event from the runbook's § 5.3 has never landed.
- **No active production error signal** — separate from SB-2 (no plumbing means a real incident wouldn't notify the owner anyway).
- **WastelandLanding "deprecated" claim** — false. Component uses current Violet Grid tokens; rename is cosmetic POST-LAUNCH-POLISH. Documented across runs.

---

## 3. Mandatory ramp (5 minutes)

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 774+ unit tests + 117+ Playwright tests passing.
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
```

Then read in order:

1. [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md) — § 0–§ 3 for the 5-item finite picture.
2. [`docs/retros/2026-05-18-master-reconciliation.md`](retros/2026-05-18-master-reconciliation.md) — § 1–§ 6 for the reconciliation discipline.
3. § 6 of this file — the next task.

---

## 4. Read this first — do-NOT list

(Unchanged from prior session.)

1. **Do NOT skip `tac-express-onboarding`.** Mandatory per AGENTS.md § 0.
2. **Do NOT bump dependencies in feature PRs.**
3. **Do NOT add Sentry tag keys without updating all four artifacts.**
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner-only.
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.**
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** `docs/backlog/production-readiness.md` is authoritative.
8. **Do NOT promote a POST-LAUNCH item to SHIP-BLOCKER or PRODUCT-LAUNCH-BLOCKER without explicit owner decision.** Convention A.
9. **Do NOT mark SB-2 done on the owner's word alone.** The Sentry MCP must show the `api/diagnostics` synthetic event in the issue stream as evidence the runbook's § 5.3 procedure ran end-to-end.

---

## 5. Open items snapshot

- **Open PRs:** 1 — [#176](https://github.com/cargotapan-collab/tac-express/pull/176) (a11y contrast demo; deliberately held for owner design review).
- **Open issues:** 13 — all reconciled into [`MASTER-LAUNCH-PLAN.md` § 1.2](launch/MASTER-LAUNCH-PLAN.md).

---

## 6. Next session's lead task

**LB-3 follow-through — apply owner-chosen contrast approach to the 3 remaining sites + flip `AXE_FAIL_ON_VIOLATIONS=1`.**

- **Gated on:** owner decision on PR #176 (which of token-scoped / class-redirect / per-site-shim approaches A/B/C — see master plan § 4.4).
- **Owner-actionable or agent-actionable?** Currently **owner-gated**. The agent cannot start until a comment on PR #176 names an approach.
- **Estimate:** 1 owner session (review + decision) + 1 agent session (apply to landing-mobile + pricing badge + /track/[awb] + flip env var + open follow-up PR).
- **Cross-reference:** [`MASTER-LAUNCH-PLAN.md § 4.4`](launch/MASTER-LAUNCH-PLAN.md).

If the owner instead prioritizes the PRODUCTION-INCIDENT or other LBs first (recommended), the agent has **no actionable launch-burn-down task** until at least one of PI-1 / LB-1 / LB-2 / LB-3 / LB-4 returns an actionable agent-side follow-up.

Tier 2 / Tier 3 issues remain available (POST-LAUNCH burn-down once launch is READY), but the brief explicitly excludes them from PHASE 2 trivial-execution.

---

## 7. OWNER ACTIONS — before next session

See [`docs/retros/2026-05-18-master-reconciliation.md § 8`](retros/2026-05-18-master-reconciliation.md) — the consolidated 6-item list (5 launch-surface + 1 housekeeping). Most-urgent first: **PI-1** (production-incident → activate migration-deploy pipeline). Cross-referenced to [`MASTER-LAUNCH-PLAN.md § 4`](launch/MASTER-LAUNCH-PLAN.md).
