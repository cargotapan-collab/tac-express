# Retro — Definition of Done + launch re-frame (2026-05-17)

**PR:** TBD (this PR).
**Type:** META session — zero production code, one finite governance artifact.
**Role:** PM + CTO primary; engineer + designer advisory.
**Branch:** `chore/definition-of-done` from main `1ff8bd5d`.

---

## 1. TL;DR

Re-framed TAC Express from an open-ended "what's the next backlog item" loop to a finite, closeable launch run. Reconciled every open issue + every backlog item against main at `1ff8bd5d`; produced a 4-item Definition of Done; added two governance conventions (follow-ups default POST-LAUNCH; OWNER ACTIONS block ends every handoff) to AGENTS.md.

**Bucket counts:** 4 SHIP-BLOCKERS / 13 POST-LAUNCH / 2 WONTFIX-WATCH / 2 OWNER-DECISION-REQUIRED.
**Realistic launch burn-down:** 3-4 sessions.

---

## 2. The reconciliation findings (PHASE 1)

Verified every open tracker issue + every backlog item against main:

| Verdict | Count | Detail |
|---|---|---|
| FIXED-BUT-OPEN | 2 | #139, #140 — both FIXED by PR #148; the `\|\|` baseURL coalesce + the `shouldFallback` semanticFailure logic both present on main (verified) |
| PARTIALLY-DONE | 1 | #142 — read half DONE in PR #152; retry half = #153. Recommended: close #142, let #153 carry the remainder under one-feature-one-open-issue convention |
| CLOSED-BUT-NOT-DONE | 1 | #94 — tracker closed prematurely on 2026-05-15; owner-runnable Sentry provisioning remains (backlog O3) |
| INTENTIONALLY-CLOSED + stale-pointer-in-backlog | 1 | #102 — closed when authority moved to backlog file (per AGENTS.md § 0); the per-item `Tracker: #102` lines are now historical. Annotated the backlog file header. |
| GENUINELY-OPEN | 14 | 8 tracker issues + 6 backlog-only items |
| WONTFIX-STILL-VALID | 2 | X1, X2 (CLAUDE.md § 6) |

**Bailout did NOT fire.** The divergence is the three known cases (the brief named #139/#140/#142) plus the #94/#102 backlog-pointer hygiene. Not a re-validation crisis; just documentation alignment.

---

## 3. The triage (PHASE 2)

Applied the hard test ([`docs/launch/definition-of-done.md § 1`](../launch/definition-of-done.md#1-the-hard-test-how-an-item-earns-ship-blocker-status)) — data loss / security / money / broken-irrecoverable-journey / legal — to every genuinely-open item:

- **4 items meet the bar** → SHIP-BLOCKER
- **13 items do not** → POST-LAUNCH (real, valuable, parking-lot)
- **2 stay deferred** → WONTFIX-WATCH (re-evaluate 2026-08-16)
- **2 require owner judgment** to finalize → OWNER-DECISION-REQUIRED (OD-1, OD-2)

The list IS finite. The launch IS reachable.

---

## 4. The Definition of Done — finite, ordered

| # | SHIP-BLOCKER | Tracker | Why | Est. |
|---|---|---|---|---|
| SB-1 | Failed-send retry action | [#153](https://github.com/cargotapan-collab/tac-express/issues/153) | Broken core user journey — operator can SEE but not RETRY failed sends | 1 session |
| SB-2 | Sentry alert notification action | [#94](https://github.com/cargotapan-collab/tac-express/issues/94) (closed; owner-runnable) / backlog O3 | Silent-incident shape — alerting is the difference between "incident" and "outage" | ~20 min owner |
| SB-3 | PITR / database restore playbook | backlog D1 | Data loss recovery — procedure must exist BEFORE the incident | ~1-2 hours |
| SB-4 | Payment-recording E2E | backlog E1 (carve-out) | Money-flow correctness — unit tests cover service layer; need E2E for full round-trip | 1 session |

**Recommended burn-down order:** SB-1 → SB-3 → SB-4 → SB-2 (owner-async).

See [`docs/launch/definition-of-done.md`](../launch/definition-of-done.md) for the full criteria and rationale per SB.

---

## 5. Two new conventions (codified in AGENTS.md)

**A. Follow-up issues default to POST-LAUNCH.** Stops the maintenance-loop regeneration that produced #151 / #153 / #154 in one day. Promotion to SHIP-BLOCKER requires explicit owner decision + a justification matching the hard test.

**B. OWNER ACTIONS block ends every handoff and every retro.** Owner-only chores stop trickling out across handoffs. Single, predictable, numbered, copy-pasteable.

---

## 6. Discipline observations

### 6.1 The "triage don't fix" rule held

Same discipline as the prior re-validation ([`docs/audits/2026-05-16-102-revalidation.md § 10.1`](../audits/2026-05-16-102-revalidation.md)). The session resisted the temptation to close #139 and #140 via the API in-session (which the agent has authorization for via `gh issue close`) — surfacing as OWNER ACTIONS preserves the audit boundary between agent-discovery and owner-decision. The brief explicitly forbids silent mutation of issue state.

### 6.2 The bailout clause had a genuine fork to evaluate

PHASE 1 surfaced two divergences (#94 closed-but-not-done; #102 backlog-pointer staleness) beyond the three the brief named. The bailout language: "if the tracker is FAR MORE divergent from main than the three known cases." Honest read: the divergences are real but pattern-aligned and small in count (5 cases total, not 15). Bailout did not fire. Documented the call inline.

### 6.3 The hard test was ruthless on purpose

The post-launch bucket count (13) is larger than the ship-blocker count (4) by a factor of 3+. That's by design. If the SHIP-BLOCKER bucket were larger than ~5-6 items, the test wasn't being applied ruthlessly enough — the file would become "everything we'd like" again, defeating the re-frame. Cross-checked by walking each rejected item back through the hard test and accepting the rejection.

### 6.4 The payment-recording E2E carve-out

E1 is grouped — the prior re-validation kept all 5 flows together. The DoD split it: payment-recording (money) → SHIP-BLOCKER; the other 4 (shipment, manifest, RBAC RLS, exception) → POST-LAUNCH. This is the only place where the hard test produced a non-binary outcome on a grouped item; documented the split as OD-2 (owner can override the carve-out either direction).

### 6.5 Cadence pre-commit observation

FOURTEEN substantive PRs old (PR #152 was the 13th; this PR is the 14th if META PRs count, or stays at 13 if they don't — historical pattern has been to count META PRs separately, like the maximum-sweep in PR #126). No "while we're here" expansion fired in this session despite multiple temptations:

- Closing #139 / #140 via API (~30 seconds of API calls)
- Fixing the `#102` stale-pointer in every backlog item by hand (~5 min)
- Filing a follow-up issue for OD-1 / OD-2 to give them tracker visibility (~3 min)
- Writing the SB-3 PITR playbook in-session (it's a doc; agent could do it) (~1-2 hours)

All declined. The session deliverable is the DoD file + the reconciliation + the conventions — nothing more.

---

## 7. Carry-forward (NOT owner actions — work for the agent next session)

- **Next session lead:** SB-1 (#153 — failed-send retry action). The DoD § 4 burn-down order names this as the next session's lead task.
- **Burn-down state after this PR:** 4 of 4 SHIP-BLOCKERS open; 0 done. After SB-1 ships, 3 remain.
- **Convention enforcement on this PR:** the OWNER ACTIONS block convention (B) fires on this very session — see § 9 below.

---

## 8. Files changed (no production code; all docs/governance)

```
NEW   docs/launch/definition-of-done.md
NEW   docs/audits/2026-05-17-launch-reframe-triage.md
NEW   docs/retros/2026-05-17-definition-of-done.md  (this file)
NEW   docs/NEXT-SESSION-HANDOFF.md                  (full replacement)
EDIT  docs/backlog/production-readiness.md          (added **Bucket:** lines + header annotation)
EDIT  AGENTS.md                                     (added launch-scope authority + two conventions)
```

The backlog-refs-drift sentinel verifies every `refs:` block in `docs/backlog/production-readiness.md`. The `**Bucket:**` additions do not modify any `refs:` block, so the sentinel stays green on this PR.

---

## 9. OWNER ACTIONS — before next session

Per Convention B (now codified in AGENTS.md). Numbered, copy-pasteable, single block:

1. **Close [#139](https://github.com/cargotapan-collab/tac-express/issues/139)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148) (the `shouldFallback` semantic-failure logic shipped + verified present on main).
2. **Close [#140](https://github.com/cargotapan-collab/tac-express/issues/140)** as FIXED-BY [PR #148](https://github.com/cargotapan-collab/tac-express/pull/148) (the `||` baseURL coalesce shipped + verified present on main).
3. **Resolve [#142](https://github.com/cargotapan-collab/tac-express/issues/142)** — recommended: close it (read half shipped in PR #152; retry half = [#153](https://github.com/cargotapan-collab/tac-express/issues/153)). Adopts the one-feature-one-open-issue convention.
4. **Reopen [#94](https://github.com/cargotapan-collab/tac-express/issues/94)** OR accept as a tracker-less DoD item — the owner-runnable Sentry provisioning work remains (DoD SB-2 / backlog O3).
5. **Run SB-2** — `scripts/sentry/create-alert-rules.mjs` with a `project:write` Sentry token; verify one rule fires end-to-end (deliberate trip); update `docs/runbooks/sentry-alert-rules.md` with the live channel config.
6. **Delete the stuck `tac-whatsapp-sends-102/` directory** in the primary clone (`C:\tac\tac-express\tac-whatsapp-sends-102/`) — leftover from a prior worktree creation, currently untracked and inert. (Also `.tmp/` if no longer needed.)
7. **Decide OD-1** — is [#154](https://github.com/cargotapan-collab/tac-express/issues/154) (RBAC auth-error sweep) a SHIP-BLOCKER? Lean: POST-LAUNCH (page refresh is acceptable workaround). If "yes": adds SB-5; +1 session to burn-down.
8. **Decide OD-2** — should the other 4 E1 flows (shipment wizard, manifest wizard, RBAC RLS isolation, exception lifecycle) be SHIP-BLOCKERS? Lean: payment-only is sufficient. If "yes" to any: each promotion adds 1 session.

Nothing else from this session is an owner action. § 7 carry-forward items are agent-actionable next-session work.
