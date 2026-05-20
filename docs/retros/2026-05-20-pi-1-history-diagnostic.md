# Session Retro — PI-1 migration-history diagnostic

> **Session type:** read-only diagnostic + docs PR (DevOps + PM lens).
> **Output:** the owner-runnable repair runbook + master-plan blocked-note + this retro + handoff.
> **Main HEAD at start:** `224d6e2` (WS-4A, #189).
> **Production writes by agent:** NONE. No `apply_migration`, no `db push`, no pipeline re-trigger.
> **Result:** PI-1 root cause diagnosed; a verified, owner-runnable repair plan shipped. **PI-1 remains NOT DONE** — it depends on the owner executing the repair.

---

## 1. TL;DR

The PI-1 migration-deploy pipeline runs correctly but `supabase db push` aborts
before applying anything: the production migration-history table records 20
versions that have no matching local migration file. Root cause is pre-existing
drift from the `baseline_from_production` squash — the local files were
renumbered, the remote history kept the original timestamps. A read-only diff
proved the 3 post-baseline migrations are content-identical and idempotent and
the baseline is idempotent, so the fix is pure bookkeeping reconciliation
(**Strategy B**: two `supabase migration repair` commands) followed by a clean
`db push` of only the 4 new migrations. Full plan:
[`docs/runbooks/pi-1-migration-history-repair.md`](../runbooks/pi-1-migration-history-repair.md).

## 2. The two pipeline runs (the incident record)

- **Run `26174554451`** — reported "success" but **skipped every deploy step**.
  Cause: `MIGRATION_DEPLOY_ENABLED` was created as a *secret*, but the workflow
  reads `${{ vars.MIGRATION_DEPLOY_ENABLED }}` (a *variable*). The opt-in gate
  `exit 0`'d (kill-switch by design), making a no-op look indistinguishable from
  success. Owner fixed it (added the variable, deleted the secret).
- **Run `26175215585`** — opt-in gate passed, deploy steps executed, and
  `supabase db push` **failed** on the history-drift check. Nothing applied.

### 2.2 Merge-phrase note (carried for the classifier)

Per the established workflow, the owner authorizes merge by typing literally
`merge PR #<N>` — the exact phrase. The agent does not merge without it.

## 3. Findings (read-only)

- Remote `schema_migrations`: **21** versions. Local: **8** files. 20 remote
  versions have no local file (17 squashed-into-baseline + 3 post-baseline
  recorded under pre-squash timestamps).
- `baseline_from_production` (`20260515000001`) on remote is a **marker row,
  `stmt_count = 0`** — adopted via `repair --status applied`; it ran nothing.
  The 17 granular migrations did the real schema work.
- The 3 POST-BASELINE-MISMATCHED migrations diffed **byte-identical** local-vs-
  remote (modulo comment headers) and are all idempotent
  (`drop-if-exists`/`create-or-replace`/`revoke`/`grant`).
- Baseline is idempotent (34 `if not exists`, 20 `create or replace`, 8 `drop
  if exists`; the 8 `insert into` are function-body logic, not data seeds).
- → **Strategy C ruled out** (no content divergence). Strategy B recommended;
  Strategy A acceptable.

## 4. Recommended fix (see runbook for exact commands)

**Strategy B — reconcile, re-execute nothing.**
1. `supabase migration repair --status reverted <20 orphaned versions>`
2. `supabase migration repair --status applied 20260515000002 20260515000003 20260515000004`
3. `supabase migration list --linked` → confirm only the 4 new are pending
4. Re-authorize + re-run the pipeline → `db push` applies only the 4 new
5. Agent verifies read-only via MCP, stamps PI-1, closes #174

Take a PITR checkpoint / snapshot before running (runbook § 6).

## 5. Discipline notes — what this session did NOT do

- No `migration repair`, no `db push`, no `apply_migration`, no pipeline
  re-trigger. The repair is owner-side (durable production-write boundary).
- No "just deploy the 4 via MCP and fix drift later" — the drift is the problem;
  working around it compounds it.
- `docs/backlog/production-readiness.md` was checked and **not edited**: it is
  the #102 tracker and does not carry a PI-1 item (PI-1 lives in the master
  plan). Forcing an edit would risk the backlog-refs-drift sentinel and be
  fabrication.

## 6. Owner action

Execute the runbook (Strategy B), confirm `migration list` shows only the 4 new
pending, then tell the agent to re-run PI-1. PI-1 is not done until the tables
exist in production and `get_advisors` is clean on the two PII tables.
