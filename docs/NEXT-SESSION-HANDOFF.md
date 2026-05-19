# Next-Session Handoff — Start Here

> **The launch authority is [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md).** That single file is the reconciled rollup across every workstream (engineering DoD + product-launch readiness + Run-series outputs incl. #173/#174). Read it FIRST. The per-bar files (`definition-of-done.md` / `product-launch-readiness.md`) keep their SB-N / PL-N nomenclature and per-item testable-done criteria; the master plan is the rollup.

**Last code commit on `main`:** PR #177 — `ci: apps/web e2e workflow — smoke + a11y across 3 viewports (PL-4 followup)`. Merge SHA `180b93a`.
**Pending merge (Run 4):** `feat/lb3-contrast-option-b` — closes LB-3 / #173. Supersedes PR #176.
**Author of last session:** Claude Code (Run 4, 2026-05-19). See [`docs/retros/2026-05-19-lb3-contrast-option-b.md`](retros/2026-05-19-lb3-contrast-option-b.md).

---

## 1. LAUNCH VERDICT

> # **NOT READY** (BOOLEAN per the master plan)

LB-3 closed by Run 4. **The remaining finite launch surface is 4 items** (1 PRODUCTION-INCIDENT + 3 LAUNCH-BLOCKERs). All four are owner-gated. The agent's launch-blocker queue is empty.

| | |
|---|---|
| 🚨 PI-1 | Activate migration-deploy pipeline + backfill 4 migrations (`contact_leads` + `whatsapp_sends` + 2 audit-logs migrations) |
| 🚀 LB-1 | SB-2 Sentry alert provisioning (~20 min owner-runnable) |
| 🚀 LB-2 | PL-2b live notifications (env vars + Meta template approval + e2e verify) |
| ~~🛠️ LB-3~~ | ✅ **DONE 2026-05-19** — Run 4 PR applies Option B (class-redirect, typography-preserved) across all 4 sites the carve scan surfaced; `AXE_FAIL_ON_VIOLATIONS=1` flipped |
| 🛠️ LB-4 | SB-3 P1–P4 prerequisites in Supabase dashboard |

Critical path: ~1 hour of owner work + Meta template-approval latency (24–48h external). See the full sequence in [`MASTER-LAUNCH-PLAN.md § 3`](launch/MASTER-LAUNCH-PLAN.md).

---

## 2. Run-4 evidence summary (re-verified 2026-05-19)

- **#174 PRODUCTION-INCIDENT still open** — `mcp__supabase__list_tables` on project `mdvnphbucrpspntrezmj` continues to show `contact_leads` + `whatsapp_sends` ABSENT. `/api/contact` still 500s on first real submission.
- **SB-2 still NOT-RUN** — zero `api/diagnostics`-tagged issues across project lifetime. Owner-runnable per LB-1.
- **LB-3 closed via empirical axe verification.** Production build of `apps/web` served locally; axe scan across 27 tests (9 pages × 3 viewports) — 0 serious/critical color-contrast findings. `.github/workflows/e2e-web.yml` now gates regressions.
- **PR #176 superseded** — Run 4 carries the full fix (including the 3 sites #176 deliberately left open for design review).

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

1. [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md) — § 0–§ 3 for the 4-item finite picture.
2. [`docs/retros/2026-05-19-lb3-contrast-option-b.md`](retros/2026-05-19-lb3-contrast-option-b.md) — § 2 PHASE-0 decision, § 4 verification, § 6 verdict reconciliation.
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

- **Open PRs:** 1 — Run 4 `feat/lb3-contrast-option-b` (this branch; closes LB-3). After merge → 0 open PRs.
- **Open issues:** 12 (one less than prior — #173 closes on Run-4 merge). All reconciled into [`MASTER-LAUNCH-PLAN.md` § 1.2](launch/MASTER-LAUNCH-PLAN.md).

---

## 6. Next session's lead task

The agent's launch-blocker queue is **empty.** All 4 remaining items (PI-1 / LB-1 / LB-2 / LB-4) require owner inputs (credentials, template approval, or Supabase-dashboard verification) before any agent-actionable follow-up can begin.

Post-launch agent work available (non-launch-gating):

- **Visual-snapshot baselines for apps/web** (PL-4 follow-up). The carve is now contrast-stable thanks to Run 4. Visual snapshots can be captured against the same production-build output. ~1 session.
- **POST-LAUNCH burn-down** — one PR per item: #130, #131, #143, #144, #145, #151, #169. Each ~30 min to 1 hour. Per-item.

POST-LAUNCH-SECURITY (#154, #157, #158) remain leave-OPEN-for-human-review per the autonomous-run policy.

---

## 7. OWNER ACTIONS — before next session

See [`MASTER-LAUNCH-PLAN.md § 4`](launch/MASTER-LAUNCH-PLAN.md) for the copy-pasteable steps:

1. **PI-1 — activate migration-deploy pipeline** (most urgent; production-incident). 2 secrets + 1 variable + 1 `gh workflow run`.
2. **LB-1 — provision Sentry alert rules** (~20 min). 1 `project:write` PAT + 1 script run + 1 verification curl.
3. **LB-2 — PL-2b live notifications.** Depends on PI-1 + Meta template approval (24–48h external).
4. **LB-4 — verify SB-3 prerequisites** in Supabase dashboard (~10 min).

🤖 Handoff written by Claude (Run 4), 2026-05-19.
