# Next-Session Handoff — Start Here

> **The launch authority is [`docs/launch/MASTER-LAUNCH-PLAN.md`](launch/MASTER-LAUNCH-PLAN.md).** Customer-facing detail: [`docs/launch/CUSTOMER-FACING-PLAN.md`](launch/CUSTOMER-FACING-PLAN.md). UI/UX standard: [`docs/playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md`](playbooks/UI-UX-CONSISTENCY-PLAYBOOK.md).

**Last code commit on main:** `21d77d6` (PI-1 diagnostic docs, #190). This PR adds the PI-1-done docs.
**This handoff covers:** the PI-1 production deploy (2026-05-20). See [`docs/retros/2026-05-20-pi-1-deploy.md`](retros/2026-05-20-pi-1-deploy.md).
**Author:** Claude Code (Opus 4.7), DevOps + PM lens.

---

## 1. LAUNCH VERDICT

> # **NOT READY** (BOOLEAN per the master plan) — but PI-1 is now cleared.

The production-incident is resolved. Remaining surface: 3 owner-gated launch-blockers.

| | |
|---|---|
| ✅ PI-1 | **EVIDENCED DONE** — 4 migrations deployed (run `26180576599`); `contact_leads` + `whatsapp_sends` live, RLS correct, security advisors clean |
| 🚀 LB-1 | SB-2 Sentry alert provisioning (~20 min) — independent, runnable now |
| 🚀 LB-2 | PL-2b live notifications — now unblocked by PI-1; needs Meta WhatsApp template approval + WPBOX env vars + production e2e |
| 🛠️ LB-4 | SB-3 prereqs — **open owner decision**: Free plan blocks P1 (Pro) + P2 (PITR); upgrade vs accept-the-limitation |

---

## 2. What happened this session

PI-1 deployed after a four-attempt arc (skipped run → history-drift failure → repair runbook in PR #190 → CLI-not-installed false repair → CLI install + history repair → successful deploy `26180576599`). Full story + lessons in the retro. Production verified read-only via Supabase MCP; the perf-advisor call (non-blocking) was made explicitly by the owner. No agent production writes — the agent triggered the pipeline (authorized) and verified read-only.

---

## 3. Open items

- **Open PRs:** this PI-1-done docs PR. After merge → 0 open PRs.
- **Open issues:** #174 closed this session.
- **Deferred, non-blocking:** perf-tuning for the 2 new PII tables (FK indexes + `(select auth.uid())` RLS wrapping) — see retro § 6. Not a launch gate.

---

## 4. Customer-facing status

WS-1, WS-2 + WS-2B, WS-3, WS-4A all closed (landing at clean PREMIUM ~92). **WS-4B (dashboard support inbox) is NOW UNBLOCKED** — `contact_leads` exists in production. It's the last sizable agent build and needs its own PHASE-0 (RLS for MANAGER+ read, additive schema columns, service-layer methods, composed UI, audit-trail wiring).

---

## 5. Next session's lead task — launch-readiness reconciliation

Per the original PI-1 plan, the next session is **not** a build — it's the **launch-readiness reconciliation**:
1. Record PI-1 EVIDENCED DONE in the DoD / launch verdict (this PR stamps the master plan; the reconciliation evidences the rest of the verdict).
2. Capture OD decisions if available.
3. **Resolve the LB-4 / Free-plan question** (upgrade to Pro for PITR vs accept the limitation + document residual risk).
4. Re-evaluate the launch verdict against the remaining LB-1 / LB-2 owner work.

After reconciliation, **WS-4B** fires from a known-good production state.

---

## 6. OWNER ACTIONS — before next session

1. ✅ **PI-1 — DONE.** No action.
2. 🚀 **LB-1** — SB-2 Sentry alert provisioning (~20 min). Independent of everything else; can run now.
3. 🚀 **LB-2** — PL-2b live notifications: submit the Meta WhatsApp template for approval (the one item on a real external clock — start it early), set WPBOX env vars, then production e2e. Now unblocked by PI-1.
4. 🛠️ **LB-4** — decide Supabase Free vs Pro (PITR/P1/P2). Open decision for the reconciliation session.

🤖 Handoff written by Claude (Opus 4.7), 2026-05-20, post PI-1 deploy.
