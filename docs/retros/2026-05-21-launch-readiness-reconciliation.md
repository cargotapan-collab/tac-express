# Session Retro — Launch-readiness reconciliation

> **Session type:** docs-only reconciliation (PM lens).
> **Output:** master plan v1.4, LB-4 resolved-as-stance, LB-2 split, handoff refreshed, 30-day review issue (#192).
> **Production writes:** none. No code changes.

---

## 1. TL;DR

PI-1 is closed, so the launch surface dropped **4 → 2 actionable owner items**
(LB-1 Sentry, LB-2 Meta-template + e2e). **LB-4 was resolved** as an active
stance — *operate on Supabase Free for launch, upgrade only when warranted* —
not a deferred TODO. The agent-does-not-write-to-production principle, which
survived four false-success modes during PI-1, is now codified in the master
plan's production-deploy policy.

## 2. What changed

- **Launch verdict (§ 0):** still NOT READY, but reframed — 2 owner actions remain; customer-facing burn-down complete; WS-4B unblocked and sequenced next.
- **Production-deploy policy codified (§ 0):** migrations deploy via `migration-deploy.yml` only; no MCP `apply_migration` / manual SQL / off-pipeline `db push`; two-signal verification + `pg_dump`-before-destructive on Free tier.
- **PI-1 (§ 2.1, § 4.1):** EVIDENCED DONE, run `26180576599` — consistent across master plan, the PI-1 retro, and the #174 close comment.
- **LB-2 split:** LB-2a (submit Meta template — external-clock long-pole) + LB-2b (WPBOX env + production e2e, gated on Meta approval).
- **LB-4 (§ 4.5):** RESOLVED — Free-tier stance with rationale, residual-risk acceptance, operational compensations, 5 upgrade triggers, and a 30-day review cadence tracked by #192.

## 3. LB-4 resolution — the reasoning

Pre-launch, the product has zero customer traffic, no measured SLA need, and no
incident history requiring PITR. Pro-tier features (PITR, daily backups,
dedicated compute, paid SLA) buy insurance whose value scales with production
load that does not yet exist. The decision is therefore *Free now, Pro when a
specific observable condition fires* — captured as 5 triggers (incident needing
PITR; sustained latency from noisy-neighbor; contractual SLA; data-loss becoming
commercially material at ~100+ leads/day; revenue making the fee trivial at
~$500+/mo GMV). Residual risk is accepted with named compensations (`pg_dump`
discipline, pipeline-only deploys, Sentry monitoring, two-signal verification).
Pricing intentionally not hardcoded — verify at supabase.com/pricing.

## 4. The principle that earned its keep

Agent-does-not-write-to-production was tested at the worst moment — repeated CLI
failures made MCP `apply_migration` look like a 5-minute shortcut. Holding the
line cost ~5 terminal commands and kept the deploy pipeline exercised and the
migration history clean. It is now an architectural invariant (master plan
production-deploy policy), not just a preference. Full PI-1 arc + lessons:
[`docs/retros/2026-05-20-pi-1-deploy.md`](2026-05-20-pi-1-deploy.md).

## 5. Inherited going forward

- **Two-signal verification** — pair every action-layer claim with a state-layer read; it caught all four PI-1 false-success modes.
- **Pipeline-only deploys** — `migration-deploy.yml` is the single sanctioned path.
- **`pg_dump` before destructive ops** on the Free tier — the standing backup substitute until/unless Pro/PITR is adopted.

## 6. Next

WS-4B (dashboard support inbox) — unblocked by PI-1, parallelizable with the
owner-side LB-1/LB-2 work. See the refreshed handoff § 6.
