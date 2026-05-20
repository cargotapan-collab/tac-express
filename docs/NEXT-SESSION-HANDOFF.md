# Next-Session Handoff — Start Here

> **The launch authority is [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md).** Customer-facing detail: [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md). UI/UX standard: [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md).

**Last code commit on main:** `224d6e2` — `feat(landing): WS-4A — rename hero CTA "Contact Sales" → "Contact TAC"` (#189).
**This handoff covers:** the PI-1 deploy attempt + migration-history diagnostic (2026-05-20). See [`docs/retros/2026-05-20-pi-1-history-diagnostic.md`](retros/2026-05-20-pi-1-history-diagnostic.md).
**Author:** Claude Code (Opus 4.7), DevOps + PM lens.

---

## 1. LAUNCH VERDICT

> # **NOT READY** (BOOLEAN per the master plan)

Finite launch surface unchanged: 1 PRODUCTION-INCIDENT + 3 LAUNCH-BLOCKERs.

| | |
|---|---|
| 🚨 PI-1 | **BLOCKED on migration-history repair** (see § 6) — pipeline works, `db push` fails on pre-existing version drift |
| 🚀 LB-1 | SB-2 Sentry alert provisioning (~20 min owner-runnable; independent of PI-1 — can run now) |
| 🚀 LB-2 | PL-2b live notifications (env vars + Meta template approval + e2e); gated on PI-1 |
| 🛠️ LB-4 | SB-3 P1–P4 prerequisites in Supabase dashboard (~10 min) |

---

## 2. What happened this session (PI-1 attempt)

The owner set the pipeline secrets/variable; the agent triggered `migration-deploy.yml` twice:

- **Run `26174554451`** — "success" but **skipped all deploy steps**: `MIGRATION_DEPLOY_ENABLED` was created as a *secret*, not the *variable* the workflow reads. Owner fixed it.
- **Run `26175215585`** — gate passed, deploy steps ran, **`supabase db push` failed** on migration-history drift. Nothing applied.

**Root cause:** the `baseline_from_production` squash renumbered local migration files, but production `schema_migrations` still records the 20 original pre-squash versions → `db push` refuses to proceed. Diagnosed read-only; the post-baseline migrations are content-identical + idempotent, so the fix is pure bookkeeping reconciliation.

**Production is unchanged** (`contact_leads`, `whatsapp_sends`, `audit_logs.before_state`, the destructive-action CHECK all still absent). No agent production writes.

---

## 3. Durable principle reinforced

Agents do not write to production directly — deploys go through the owner-credentialed GHA pipeline. The repair (`supabase migration repair`) is owner-side. See [`docs/runbooks/pi-1-migration-history-repair.md`](runbooks/pi-1-migration-history-repair.md).

---

## 4. Open items

- **Open PRs:** this diagnostic docs PR. After merge → 0 open PRs.
- **Open issues:** #174 (PI-1) remains OPEN — do NOT close until the repair lands and the 4 tables/columns are verified in production.

---

## 5. Customer-facing status

WS-1, WS-2 + WS-2B, WS-3, WS-4A all closed (landing at clean PREMIUM ~92). **WS-4B (dashboard support inbox) is the last sizable build and is PI-1-gated** — it reads `contact_leads`, which does not yet exist in production. It becomes startable only after PI-1 lands.

---

## 6. Next session's lead task — execute the PI-1 migration-history repair

**Owner runs the repair**, then re-triggers PI-1:

1. Owner: follow [`docs/runbooks/pi-1-migration-history-repair.md`](runbooks/pi-1-migration-history-repair.md) — **Strategy B** (two `supabase migration repair` commands; no schema re-execution). Take a PITR checkpoint first (runbook § 6).
2. Confirm `supabase migration list --linked` shows **only** the 4 new migrations pending.
3. Tell the agent the repair is done → agent re-runs `gh workflow run migration-deploy.yml` (with explicit authorization), watches it, verifies the opt-in gate passed AND deploy steps executed (not skipped), then verifies read-only via MCP (tables + column + constraint + 4 versions + `get_advisors` clean on the 2 PII tables).
4. Agent stamps PI-1 EVIDENCED DONE + closes #174.

After PI-1: the **launch-readiness reconciliation** session (record PI-1 done, OD decisions, evidence the rest of the verdict), then **WS-4B** fires from a known-good state.

---

## 7. OWNER ACTIONS — before next session

1. 🚨 **PI-1 (blocked)** — run the migration-history repair per the runbook (Strategy B), take a PITR checkpoint first, then tell the agent to re-trigger the pipeline.
2. 🚀 **LB-1** — SB-2 Sentry alert provisioning (~20 min; **independent of PI-1, can run now in parallel**).
3. 🚀 **LB-2** — PL-2b live notifications (submit Meta template if not yet done; gated on PI-1).
4. 🛠️ **LB-4** — SB-3 prerequisites in Supabase dashboard (~10 min).

🤖 Handoff written by Claude (Opus 4.7), 2026-05-20, post PI-1 history diagnostic.
