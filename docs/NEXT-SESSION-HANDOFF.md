# Next-Session Handoff — Start Here

> **TAC Express now has TWO independent launch bars.** Engineering DoD: 3 of 4 SBs done; SB-2 is the last engineering gate (~20-min owner task). Product-launch readiness (NEW workstream this session): 0 of 4 PLs done; PL-1 is agent-ready; PL-2/3/4 gated on owner decisions (OD-P1–OD-P7).
>
> A credible launch = `engineering_ready AND product_ready`. Both bars must pass. They are independent — engineering can be 4/4 done with product 0/4 done, or vice versa.

**Last code commit on `main`:** PR #160 — `test(e2e): payment-recording money-flow E2E (SB-4 / E1 carve-out)`.
**Last governance PR on `main`:** #162 — Product-launch scope (customer-facing surface). Merge SHA `5755520`.
**This handoff covers:** the post-#162 follow-up (2026-05-18) — auth-provider audit, design-system naming reconciliation, worktree cleanup + process fix, #162-claims verification, and PL-1 implementation (sibling source PR). See [`docs/retros/2026-05-18-post-162-followup.md`](retros/2026-05-18-post-162-followup.md).
**Date this doc was written:** 2026-05-18 (post-#162 follow-up).
**Author of last session:** Claude Code (Opus 4.7) in PM + CTO mode (delegated by owner).

**LAUNCH STATUS — TWO BARS:**

| Bar | Authority | Status |
|---|---|---|
| Engineering readiness | [`docs/launch/definition-of-done.md`](launch/definition-of-done.md) | 3/4 done; **SB-2** (Sentry alerting) remains — owner task |
| Customer-facing readiness | [`docs/launch/product-launch-readiness.md`](launch/product-launch-readiness.md) (NEW) | 0/4 done; **PL-1/2/3/4** outstanding; PL-2/3/4 gated on owner decisions OD-P1–OD-P7 |

---

## 1. TWO INDEPENDENT WORKSTREAMS

The engineering DoD closeout (SB-2 + SB-3 P1–P4 + OD-1/OD-2) and the product-launch workstream (PL-1 → PL-4 + OD-P1–OD-P7) are independent. Owner can address them in parallel. **They are not in conflict; they are not sequential; both must pass for launch.**

The agent-actionable next step after #162 was **PL-1 (landing page metadata)** — implemented this session in the sibling source PR (PR B). After PL-1 merges: PL-2/PL-3/PL-4 are gated on owner decisions (OD-P1 is load-bearing). SB-2 remains owner-only.

### Post-#162 follow-up findings (resolved this session — see retro § 1–6)

- **Auth provider:** Supabase email+password only — confirmed via source audit. The `[[...sign-in]]` / `[[...sign-up]]` optional-catch-all folders are stale Clerk-style scaffolding (no Clerk dep anywhere). NOT a violation; classified POST-LAUNCH-POLISH (rename folders).
- **Design-system name:** "TAC Express v5.0 Violet Grid" is canonical in every authoritative source. "TAC Orbital" is the legitimate **telemetry subsystem** name (`orbital.service.ts`, `charts/`, `--telemetry-*` tokens) — KEEP. Three stale comment headers in non-chart components were folded into the source PR for cleanup.
- **Worktree hygiene:** `tac-whatsapp-sends-102/` removed (was untracked, not a registered worktree). New "Worktree & artifact hygiene" section in `tac-karpathy-discipline` codifies end-of-session teardown.
- **#162 self-report verification:** All claims hold — merge SHA `5755520` on main, 9/9 CI checks `success`, no application source touched in #162.

---

## 2. READ THIS FIRST — nine things you must NOT do

(Unchanged.)

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per CLAUDE.md § 0.5.
2. **Do NOT bump dependencies in feature PRs.**
3. **Do NOT add Sentry tag keys without updating all four artifacts.**
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner-only.
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.**
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** [`docs/backlog/production-readiness.md`](backlog/production-readiness.md) is authoritative.
8. **Do NOT promote a POST-LAUNCH item to SHIP-BLOCKER or PRODUCT-LAUNCH-BLOCKER without explicit owner decision.** Convention A.
9. **Do NOT mark SB-2 done on the owner's word alone.** The Sentry MCP must show the `api/diagnostics` synthetic event in the issue stream as evidence the runbook's § 5.3 procedure ran end-to-end.

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 774 unit tests + 117+ Playwright tests passing.
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
```

Then read in order:

1. [`docs/launch/definition-of-done.md`](launch/definition-of-done.md) § 3a — engineering verdict (SB-2 remaining).
2. [`docs/launch/product-launch-readiness.md`](launch/product-launch-readiness.md) — product-launch scope (4 PLs + 7 OD-Ps).
3. This handoff § 6 — your first task.

---

## 4. Current state snapshot

### Open PRs: 0 (after THIS one merges).

### Open issues (9, all POST-LAUNCH per the engineering DoD § 6 + this session left tracker unchanged)

| Tracker | Title | Bucket |
|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) (CLOSED on tracker) | Sentry alert provisioning | **ENGINEERING SHIP-BLOCKER SB-2 — the launch gate** |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | POST-LAUNCH |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` cluster | POST-LAUNCH |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated retry job (W3) | POST-LAUNCH |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta delivery webhook (W4) | POST-LAUNCH |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | Immutability sentinel (W5) | POST-LAUNCH |
| [#151](https://github.com/cargotapan-collab/tac-express/issues/151) | proxy.ts cast cleanup | POST-LAUNCH |
| [#154](https://github.com/cargotapan-collab/tac-express/issues/154) | RBAC auth-error sweep | POST-LAUNCH (pending OD-1) |
| [#157](https://github.com/cargotapan-collab/tac-express/issues/157) | TOCTOU retry concurrency hardening | POST-LAUNCH |
| [#158](https://github.com/cargotapan-collab/tac-express/issues/158) | Request-signing sweep | POST-LAUNCH |

### NEW — Customer-facing surface (product-launch workstream)

| PL-N | Item | Status |
|---|---|---|
| **PL-1** | Landing page metadata (title + description + OG + Twitter) | OPEN — agent-ready, no OD-P gating |
| PL-2 | Customer-journey + CTA finalized | OPEN — gated on **OD-P1** (load-bearing) |
| PL-3 | Mobile responsiveness on landing + contact + quote + track | OPEN — gated on OD-P2 + OD-P5 + OD-P6 |
| PL-4 | Visual + a11y e2e baseline for landing + critical paths | OPEN — gated on OD-P5 |

### Backlog-only items

| ID | Title | Bucket |
|---|---|---|
| **O3** | Sentry alert provisioning (= #94 work) | **SHIP-BLOCKER SB-2 — engineering gate** |
| D2 / D3 / D4 / D5 | Runbook / monitoring / JSDoc / RELEASE-CHECKLIST | POST-LAUNCH |
| E1 (other 4 flows) | Shipment / manifest / RBAC RLS / exception E2Es | POST-LAUNCH (pending OD-2) |
| X1 / X2 | Form variant / on-call | WONTFIX-WATCH |

---

## 5. Critical context

### 5.1 – 5.17 (unchanged; see prior handoffs)

### 5.18 NEW: TWO launch bars — both authoritative, both independent

`docs/launch/definition-of-done.md` (engineering) and `docs/launch/product-launch-readiness.md` (customer-facing) are sibling authorities. AGENTS.md § "Launch-scope authority — TWO files, TWO bars" codifies this. The launch verdict = `engineering_ready AND product_ready`.

### 5.19 NEW: Customer-facing surface audit results

Verified 2026-05-17 against main `f53cab4f`:
- **apps/web** has 15 marketing routes (landing + 11 other public + 2 special + redirect). All sampled marketing pages have Metadata except the **landing page itself**.
- **Landing component** is named `WastelandLanding` (legacy naming per AGENTS.md § 9) but USES current Violet Grid tokens. Renaming is cosmetic.
- **Auth surface** is operator-only via Supabase email+password. `apps/dashboard/(public)/sign-up` redirects to sign-in (intentional). No customer-sign-up flow exists.
- The customer-journey question (sales-led B2B vs self-serve) is **OD-P1** in the new product-launch readiness file — the load-bearing owner decision.

---

## 6. Your first task

### If you are the OWNER reading this:

Two independent tracks; pick either or both:

**Track A — engineering gate (~20 min):**
Run SB-2 per [`docs/runbooks/sentry-alert-rules.md § 5.3`](runbooks/sentry-alert-rules.md). After this, the next engineering reconciliation pass marks SB-2 DONE.

**Track B — product-launch unblock:**
Answer at least **OD-P1** (customer-journey model: sales-led B2B vs self-serve) so the agent can scope PL-2. Ideally also OD-P2 + OD-P5 + OD-P6 so PL-3 + PL-4 can start. See [`docs/launch/product-launch-readiness.md § D`](launch/product-launch-readiness.md).

### If you are an AGENT picking up the next session:

**PL-1 is the only agent-ready blocker that needs zero owner input** — landing page `metadata` export (title + description + Open Graph + Twitter Card). Pure UI / SEO; ~1 hour. See [`docs/launch/product-launch-readiness.md § C.1`](launch/product-launch-readiness.md) for the testable DONE criterion.

For PL-2 / PL-3 / PL-4, wait for the relevant OD-P answer.

For SB-2 — DO NOT run from an agent session (owner-only). For SB-2 verification only — query the Sentry MCP for `api/diagnostics` issues (see § 5.17 of the prior handoff).

---

## 7. Cumulative discipline observations (carry-forward)

### 7.1 – 7.43 (see prior handoffs/retros)

### 7.44 NEW (this session): "Production-ready" is two bars, not one

The original DoD framed production-readiness as engineering operability. The owner correctly identified a SECOND bar — customer-facing readiness — that the engineering DoD never measured. **Pattern: when a single "ready" definition starts feeling incomplete, the right move is usually splitting it into independent bars, not adding more items to the existing list.** The two-files-two-bars framing is the durable codification.

### 7.45 NEW (this session): A scoping session whose anti-pattern list says "do not build" produces a finite list when the build temptations are sharply rejected

The audit found concrete UI gaps. Each was triaged into a bucket; none was acted on. The PRODUCT-LAUNCH-BLOCKER list is 4 items — same disciplined size as the engineering DoD's original 4. **The finite list is the deliverable; the buildable items live in their own subsequent per-blocker PRs.**

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
# E2E:
pnpm --filter dashboard exec playwright test
# Sentinels:
pnpm vitest run apps/dashboard/__tests__/backlog-refs-drift.test.ts
node scripts/ci-watch-pr.mjs <pr-number>
# Sentry MCP — SB-2 verification:
# mcp__sentry__search_issues({ organizationSlug: "tapan-cargo-az",
#   regionUrl: "https://de.sentry.io", projectSlugOrId: "javascript-nextjs",
#   query: "api/diagnostics" })
```

---

## 9. Key file locations (additions this PR — docs only)

```
NEW:
  docs/launch/product-launch-readiness.md         # the new product-launch authority file
  docs/retros/2026-05-17-product-launch-scope.md  # this session's retro
EDITED:
  AGENTS.md                                        # two-files-two-bars authority block
  docs/NEXT-SESSION-HANDOFF.md                     # this file
```

Zero application source touched. Zero UI built or modified.

---

## 10. The honest read

The project is closer to launch than the previous handoff implied — SB-2 was always the ENGINEERING gate, and that part hasn't changed (still owner-task, ~20 min). What this session surfaced: there's a second, distinct PRODUCT bar that the engineering DoD wasn't measuring. The audit found that bar is largely built (15 public pages, working auth, comprehensive chrome) — the gap to a credible customer-launch is 4 finite items, with the load-bearing question being a single owner decision (OD-P1: sales-led B2B vs self-serve).

**Recommended one-line summary for the next session's prompt:** "Build PL-1 — landing page `metadata` export. Pure UI / SEO. ~1 hour. No owner-decision gating. See `docs/launch/product-launch-readiness.md § C.1` for the testable DONE criterion."

---

## 11. OWNER ACTIONS — before launch

Per AGENTS.md Convention B. Numbered, copy-pasteable, single block. Combines the engineering DoD closeout + the NEW product-launch decisions.

### Engineering DoD closeout (carry-forward)

1. **🚀 RUN SB-2 — the engineering launch gate.** `scripts/sentry/create-alert-rules.mjs` + verify one rule fires (POST `/api/diagnostics/sentry`) + update [`docs/runbooks/sentry-alert-rules.md`](runbooks/sentry-alert-rules.md). ~20 min.
2. **Verify SB-3 PREREQUISITES P1–P4** per [`DATABASE-RESTORE.md § 2`](runbooks/DATABASE-RESTORE.md#2-prerequisites-owner-confirmed--verify-before-launch).
3. **(Optional)** Run the SB-3 dry-run walkthrough per `DATABASE-RESTORE.md § 9` (~30 min).
4. **Decide OD-1** — is [#154](https://github.com/cargotapan-collab/tac-express/issues/154) a SHIP-BLOCKER? Lean: POST-LAUNCH.
5. **Decide OD-2** — should any of the other 4 E1 flows be SHIP-BLOCKERS? Lean: payment-only-sufficient.
6. **Reopen [#94](https://github.com/cargotapan-collab/tac-express/issues/94)** OR accept as tracker-less DoD item.
7. **Delete `C:\tac\tac-express\tac-whatsapp-sends-102/`** (untracked worktree artifact).
8. **CodeRabbit billing** — update payment method or pay pending invoices.

### Product-launch decisions (NEW — from this scoping session)

9. **OD-P1 (gating)** — Customer-journey model: sales-led B2B or self-serve? Lean: current surface is sales-led B2B (no customer sign-up exists).
10. **OD-P2** — Brand reference: Figma/mockup, or is the current Violet Grid the brand?
11. **OD-P3** — Target audience confirmation + language scope (English-only?).
12. **OD-P4** — Auth methods at launch: email+password only / OAuth / magic link / password-reset?
13. **OD-P5** — Public marketing scope at launch: all 15 pages, or MVP carve?
14. **OD-P6** — Mobile breakpoint priorities (375w / 390w / 768w?).
15. **OD-P7** — SEO/discoverability goal: organic ranking / outreach-linked / both?

**Fifteen owner actions. Item 1 closes the engineering bar; items 9–15 unblock the product-launch workstream. The two workstreams are independent.**
