# Retro — Database Restore Playbook (SB-3 / D1) — 2026-05-17

**PR:** TBD (this PR).
**Type:** META session — zero production code, one operational-readiness runbook.
**Role:** SRE + CTO primary; PM-mode discipline throughout.
**Branch:** `docs/database-restore-playbook` from main `ad38f76`.

---

## 1. TL;DR

Shipped [`docs/runbooks/DATABASE-RESTORE.md`](../runbooks/DATABASE-RESTORE.md) — a complete executable runbook for the three in-scope restore scenarios (bad migration; data deletion/corruption; full project loss), built on this project's verified Supabase mechanism (project ref `mdvnphbucrpspntrezmj`, Postgres 17 in `ap-northeast-1`). Decision tree per scenario, 4-step verification covering money-flow joins, 5 safety guards. Earlier WONTFIX stub at `PITR-PLAYBOOK.md` converted to a redirect. **SB-3 DONE.**

**Ship-blocker count: 4 → 2 remaining** (SB-2 owner-runnable Sentry; SB-4 payment-recording E2E).

---

## 2. The PHASE-0 scoping decision

Full doc: [`docs/decisions/2026-05-17-database-restore-playbook.md`](../decisions/2026-05-17-database-restore-playbook.md).

**A — Scenarios in scope:** 3 distinct failure modes (bad migration / data deletion / full loss). Each has its own decision branch.

**B — Mechanism ground truth (verified via Supabase MCP `get_project` + `list_tables`):**
- Project: `mdvnphbucrpspntrezmj` (`tac-express`), Postgres 17.6.1.104, region `ap-northeast-1`, status `ACTIVE_HEALTHY`
- 13 public tables, all RLS-enabled; row counts captured for the verification floor (invoices 23 / invoice_payments 6 / audit_logs 0 / etc.)
- Plan tier + PITR availability + retention window + Owner role: **NOT verifiable via MCP** — escalated as OWNER-CONFIRMED PREREQUISITES P1–P4 in the runbook

**C — Decision points:** 4 named judgment calls the operator faces (in-place vs parallel; target timestamp; single-table vs full; stage vs live). Runbook renders each as a concrete tree.

**D — Verification:** V1 schema integrity → V2 row-count floor → V3 referential integrity on money joins → V4 application smoke test. STOP on any failure.

**E — Safety guards:** 5 (authorize Owner only / pre-restore snapshot / row-count baseline / announce / abort path / application-write blocker on in-place restores).

---

## 3. The major PHASE-0 finding (and the call)

`docs/runbooks/PITR-PLAYBOOK.md` ALREADY EXISTED as a deliberate WONTFIX-UNLESS-TRIGGERED stub from 2026-05-16 (PR #136-ish). The stub argued: "decisions must be made by an alert human, not pre-baked." That argument was correct PRE-launch-framing. The DoD re-frame in PR #155 promoted D1 to SHIP-BLOCKER for the exact reason the stub undervalued: pre-launch, deferral was correct; at launch, "decisions are situational" loses to "a money-flow project with no documented restore path cannot launch."

**The call:** ship the substantive runbook at the brief's prescribed `DATABASE-RESTORE.md` filename (matches DoD criterion); convert `PITR-PLAYBOOK.md` to a redirect (preserves grep handle + history). The stub's "When triggered, write here" outline became the structural skeleton of the new runbook — credit retained.

---

## 4. What the runbook covers

| § | Content |
|---|---|
| 0 | TL;DR (7-step quick path) + RTO targets |
| 1 | Authorization (Owner only) |
| 2 | OWNER-CONFIRMED PREREQUISITES P1–P4 (fill-in confirmation block) |
| 3 | First 15 minutes — scenario identification |
| 4 | Safety guards S1–S5 (run BEFORE any restore action) |
| 5 | Decision tree per scenario (A bad migration / B data corruption / C full loss) |
| 6 | Verification V1–V4 (schema / row counts / referential integrity / smoke test) |
| 7 | Cutover (in-place vs parallel-project paths) |
| 8 | Postmortem template |
| 9 | Dry-run walkthrough (owner-side validation procedure ~30 minutes) |
| 10 | Linked items |

---

## 5. OWNER-CONFIRMED PREREQUISITES surfaced

The runbook ships with FOUR prerequisites the owner must verify before relying on the PITR-based scenarios (5.A and 5.B in-place):

| # | Prerequisite | Where |
|---|---|---|
| P1 | Pro plan or above | Dashboard → project → Settings → General → Plan |
| P2 | PITR enabled + retention window recorded | Dashboard → project → Database → Backups → PITR |
| P3 | Daily logical backups present at expected cadence | Dashboard → project → Database → Backups → Scheduled |
| P4 | Owner role present on the org | Dashboard → org → Team |

If P1 OR P2 is unconfirmed/absent: PITR-based scenarios do NOT apply — restore degrades to scenario 3 (logical backup, higher RPO). Marked as SHIP-BLOCKER-candidate finding in the runbook + this retro. **The owner must verify P1+P2 before launch.**

---

## 6. Discipline observations

### 6.1 The bailout clause had a fork to evaluate

The brief's bailout clause: "if the project's actual restore capability is inadequate, surface as a finding." PHASE-0 § B established that MCP cannot verify plan/PITR — those facts depend on the owner's dashboard. The bailout was re-evaluated as PARTIAL — the runbook ships assuming P1+P2 hold (Supabase Pro is the standard tier for revenue-bearing projects + the existing stub's `Why this is a stub today` section also documents this assumption); the prerequisite confirmation is the gate. Bailout did not fire because the runbook accurately reflects what is currently known + names what is owner-only-confirmable.

### 6.2 The "write an automation tool" temptation — resisted

The brief explicitly cautioned against writing a restore script or automation. The temptation surfaced twice during this session: (a) the verification SQL could be a script; (b) the prerequisite-confirmation could be an MCP-driven check. Both declined. Reasons: (a) the verification SQL belongs in the runbook itself so the operator can copy-paste it under pressure — a script adds dependency on Node being installed; (b) the prerequisite confirmation needs OWNER credentials at the time of confirmation — automating it would require persisted credentials, which we don't have today. Both are POST-LAUNCH candidates if the owner wants them.

### 6.3 The "general DR overhaul" temptation — resisted

The brief cautioned against expanding to a general backup-strategy / DR overhaul. The runbook stayed scoped to the three PHASE-0 (A) scenarios. Examples of expansion-temptations declined:
- Cross-region failover (not in scope; single-region project today)
- Automated regression-detection (not in scope)
- A standalone backup snapshot tool (not in scope; Supabase already provides this)

Each was noted in PHASE-0 § A as "explicitly OUT of scope (POST-LAUNCH if needed)" rather than silently ignored.

### 6.4 The aspirational-step trap — guarded against

Every command in the runbook was either:
- Verified via the existing repo state (`pnpm migrations-fresh-apply` exists; `supabase db dump` is in the Supabase CLI), OR
- Documented via the Supabase official docs (linked at the top), OR
- Marked as part of the owner-side dry-run validation (§ 9) the owner walks through to confirm UI labels and exact CLI flags

No command in the runbook is "I think this is how it works." The runbook's § 9 names this honestly: "executable claims are based on Supabase official documentation; some details may differ from the live experience; the dry-run validates."

### 6.5 The earlier-stub call — preserved with credit

The 2026-05-16 stub's WONTFIX rationale was CORRECT for its moment; it was UNDERVALUED only against the launch-framing. The retro records this so future contributors don't see the WONTFIX rationale as a discipline failure. The same kind of judgment is what produced AGENTS.md Convention A (default POST-LAUNCH). The lesson: a deferral is correct UNTIL a triggering event reframes the calculus. **The launch IS that trigger.**

---

## 7. Carry-forward (NOT owner actions)

- **Next session lead:** SB-4 (payment-recording E2E) per DoD § 4 burn-down order. SB-2 is owner-async + can run in parallel.
- **Burn-down state after this PR:** 2 of 4 SHIP-BLOCKERS remain. After SB-4 ships, 1 remains (SB-2 owner-only).
- **Convention-B enforcement:** this retro's § 9 OWNER ACTIONS block carries forward all unresolved items from PR #156's owner block + adds this session's prerequisite-confirmation prerequisites.

---

## 8. Files changed (no production code; all docs/governance)

```
NEW   docs/runbooks/DATABASE-RESTORE.md                # substantive runbook
NEW   docs/decisions/2026-05-17-database-restore-playbook.md  # PHASE-0
NEW   docs/retros/2026-05-17-database-restore-playbook.md     # this file
EDIT  docs/runbooks/PITR-PLAYBOOK.md                   # converted to redirect
EDIT  docs/launch/definition-of-done.md                # SB-3 DONE, 3 → 2
EDIT  docs/backlog/production-readiness.md             # D1 DONE
EDIT  docs/NEXT-SESSION-HANDOFF.md                     # full replacement
```

Backlog-refs-drift sentinel: green — D1's entry has no `refs:` block (doc-only item, was always `refs: none — not-sentinel-checked`); other items unchanged.

---

## 9. OWNER ACTIONS — before next session

Per AGENTS.md Convention B. Numbered, copy-pasteable, single block. **Carries forward all unresolved items from PR #156's owner block; adds this session's prerequisite-confirmation tasks.**

1. **Verify SB-3 PREREQUISITES P1–P4** against the Supabase dashboard (per [`DATABASE-RESTORE.md § 2`](../runbooks/DATABASE-RESTORE.md#2-prerequisites-owner-confirmed--verify-before-launch)):
   - P1 — confirm Pro plan or above
   - P2 — confirm PITR enabled + record retention window
   - P3 — confirm daily logical backups present
   - P4 — confirm Owner role present on the org
   Fill in the confirmation block in the runbook + commit as a `chore(docs):` PR.
2. **(Optional but recommended)** Run the SB-3 dry-run walkthrough per `DATABASE-RESTORE.md § 9` — create a Supabase branch, PITR-restore it 1h back, run § 6 V1–V4, drop the branch. ~30 min. Validates the runbook's executable claims against the live UI.
3. **Close [#142](https://github.com/cargotapan-collab/tac-express/issues/142)** — fully shipped (W2 PR 1 + PR #156 = both halves). (Still pending from PR #156 OWNER ACTIONS.)
4. **Close [#139](https://github.com/cargotapan-collab/tac-express/issues/139)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148). (Still pending.)
5. **Close [#140](https://github.com/cargotapan-collab/tac-express/issues/140)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148). (Still pending.)
6. **Reopen [#94](https://github.com/cargotapan-collab/tac-express/issues/94)** OR accept as tracker-less DoD item (SB-2 owner-runnable). (Still pending.)
7. **Run SB-2** when convenient — `scripts/sentry/create-alert-rules.mjs` + verify one rule fires end-to-end + update `docs/runbooks/sentry-alert-rules.md`. (Still pending.)
8. **Delete the stuck `tac-whatsapp-sends-102/` directory** in the primary clone. (Still pending.)
9. **Decide OD-1** — is [#154](https://github.com/cargotapan-collab/tac-express/issues/154) a SHIP-BLOCKER? Lean POST-LAUNCH. (Still pending.)
10. **Decide OD-2** — should any of the other 4 E1 flows be SHIP-BLOCKERS? Lean payment-only sufficient. (Still pending.)

**That's it. Ten owner actions, all listed. Next agent session burns SB-4 (payment-recording E2E).**
