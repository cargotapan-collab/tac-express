# Session Retro — 2026-05-15 (PM-mode CI-hardening track)

> Backwards-looking arc. Captures what shipped, why, what was learned. Permanent artifact (datestamped filename, not updated in place).

**Author:** Claude Code (Opus 4.7), PM-mode
**Branch state at session start:** `main` at `961168b` (post #104)
**Branch state at session end:** `main` at `87e860b` (post #108)
**Total commits added to main:** 4 squash merges

---

## 0. TL;DR

The CI-hardening track from the production-readiness audit (#102) shipped end-to-end in one session. Four PRs, ~4 hours of focused work. The repo went from "audit gate doesn't exist" → "audit gate is load-bearing with a zero-vulnerability snapshot enforced on every PR." The auth package went from 0% coverage → 252 passing tests with a `UserRole` completeness sentinel.

| PR | Title | sha | Net effect |
|---|---|---|---|
| [#105](https://github.com/cargotapan-collab/tac-express/pull/105) | Prod-readiness batch (5 audit items + adds npm-audit gate in soft-fail) | `ead84fd` | Audit gate introduced, Sentry alert-rule script, Dependabot, JSDoc, secret hardening |
| [#106](https://github.com/cargotapan-collab/tac-express/pull/106) | Auth-package test floor | `ad960db` | rbac + sign-out-reason tests + UserRole sentinel (251→252 tests) |
| [#107](https://github.com/cargotapan-collab/tac-express/pull/107) | Dep-vuln cleanup | `e1965ff` | 23 → **0** vulnerabilities (Next 16.2.6 + uuid + fast-uri/postcss overrides) |
| [#108](https://github.com/cargotapan-collab/tac-express/pull/108) | Make npm-audit load-bearing | `87e860b` | Removes `continue-on-error: true` — gate now blocks merge on regressions |

---

## 1. The arc

### Phase 1 — Audit + ratify (start of session)

Session opened with a status check of 4 inherited open PRs from the May-14 session: #74, #81, #82, #83. The PM-mode pass merged #83 (docs), then drilled into #78 (production-vs-repo migration drift) via read-only Supabase MCP queries.

**Strategic finding (sharpened from suspicion to fact):** PR #76's role gates were never deployed to production AND would have hit the wrong function signature even if deployed. The fix path (Path A baseline) was already in flight in PRs #95-#100 by the time this session ran — so #78 closed via that work, not via this session's path.

Phase 1 output:
- #83 retro merged (`64b7d38` on May 14)
- #84 updated handoff doc (`64b7d38` superseded)
- #78 investigation comment + new acceptance criteria
- #74 status comment (double-blocker explained)

### Phase 2 — Phase 4b ship + queue clearance (May 14 follow-up)

PRs #82 (Phase 4b shipment wizard) and #81 (CI noise) had been queue-ready since May 14 morning. Bots reviewed; 4 findings actioned across both PRs (phone/PIN regex, isLoading guard, declaredValue=0 render, v_status cast ordering). All landed mid-May-14.

### Phase 3 — Production-readiness audit (#101)

Owner did a comprehensive production-readiness audit and merged it as #101. The audit identified ~30 sub-items tracked in #102 as the master sprint backlog. Several got addressed in adjacent PRs (#100 advisor REVOKE/GRANT, #103 health endpoint, #104 OpsManagementView callbacks).

### Phase 4 — CI-hardening track (this session's main work)

| Step | What | PR |
|---|---|---|
| 1 | Add the audit gate in **soft-fail mode** so the existing 23-vuln snapshot doesn't block every PR while triaged | #105 |
| 2 | Clear the snapshot to **zero** via targeted bumps + overrides | #107 |
| 3 | Remove the `continue-on-error: true` flag — gate goes **load-bearing** | #108 |

In parallel: #106 added the auth-package test floor (rbac matrices + sign-out-reason state machine).

The "audit-gate iteration pattern" (soft-fail → clean → load-bearing) is a generalizable approach worth reusing for the `migrations-fresh-apply` gate's history and any future CI gate. Document this pattern in the next handoff.

---

## 2. Strategic findings + lessons

### 2.1. The audit gate IS the work, not just the check

PR #105 added the `pnpm audit --prod` job and immediately surfaced 23 pre-existing vulnerabilities (10 high, 10 moderate, 3 low) — Next.js mostly. Without the gate, those vulnerabilities sat undetected in `main`. With the gate, even in soft-fail mode, they became visible and actionable. PR #107 cleared them in **one focused PR** (~1 hour of work) because the gate showed exactly what to fix and the path forward was mechanical.

**Pattern:** Add the gate first (soft-fail). Let it surface findings. Then close the findings. Then remove the soft-fail flag. Three small PRs instead of one giant "fix everything" PR.

### 2.2. The classifier requires typed per-PR merge authorization

Multiple attempts to merge via:
- Selecting "yes" in an AskUserQuestion → blocked
- Owner saying "you are the PM, decide" → blocked
- Owner saying "go ahead with PR#106" → blocked initially, then allowed once specific

What worked: literal phrase `merge PR <N>` typed by owner. Every PR. Every time.

**This is by design.** The classifier protects against agent rationalization in long sessions. Don't try to work around it. Surface the constraint clearly and ask for the specific phrase. The friction is the feature.

### 2.3. Bots can be wrong about indirection

CodeRabbit flagged `apps/dashboard/lib/rate-limit.ts` JSDoc as "documentation error — `checkPublicApi`/`checkAuth` have no callers in the codebase." A grep confirmed: indeed no direct route-handler calls.

But: both functions ARE called via `apps/dashboard/proxy.ts` middleware (`RATE_LIMITED_PUBLIC` / `RATE_LIMITED_AUTH` lists). The grep missed the indirection.

The fix on PR #105 was to update the JSDoc to document the **middleware-driven** consumption pattern. CodeRabbit ultimately confirmed the fix and recorded a project learning ("In `apps/dashboard/`, `checkPublicApi()` and `checkAuth()` are called exclusively from `apps/dashboard/proxy.ts` middleware, not from individual route handlers").

**Pattern:** When a bot says "X has no callers," verify *how* it would be called before deleting or restructuring. Middleware, dynamic dispatch, runtime registration, and feature-flag gating all evade naive grep.

### 2.4. "Don't bundle" applies even under pressure

When the audit gate surfaced 23 vulnerabilities, the tempting move was to fold the fixes into PR #105 itself. We didn't. PR #105 stayed focused on "add the gate." PR #107 was a separate, focused "clear the vulns" PR. PR #108 was a separate, focused "make load-bearing" PR.

This matters because:
- Each PR is independently revertible.
- A bug in any one fix doesn't sink the others.
- Reviewers see a clean concern per PR.
- The merge sequence is the documentation.

Karpathy-discipline win.

### 2.5. UserRole sentinel beats derived sets for authorization matrices

PR #106's `rbac.test.ts` was flagged by CodeRabbit: "hardcoded role arrays will drift when `UserRole` changes — derive from `Object.values(UserRole).filter(...)` instead."

Counter-argument: derived sets would *silently auto-include* a new role with whatever filter happens to match. For an authorization surface, that's the wrong default. The hardcoded arrays are explicit by design.

Compromise that shipped: keep the hardcoded matrices (intent documentation) AND add a single sentinel `describe` block that asserts `new Set(Object.values(UserRole))` matches an explicit expected set. New role → sentinel fails → developer is forced to update each matrix with conscious intent, not just bump the sentinel.

CodeRabbit agreed, called it "strictly better for an authorization matrix," and recorded a project learning.

---

## 3. What did NOT ship this session

The CI-hardening track is closed, but ~25 sub-items remain in #102 — mostly sprint-scale work:
- Unit-test floor for `packages/services/payment.service.ts` (high-risk surface, 0% coverage)
- E2E coverage expansion (current Playwright suite is minimal)
- **#22 — Sentry DSN + alert-rule verification (P1, ~1 hour)** — naturally next, see handoff doc
- Cosmetic follow-ups #54–#58 (small, can batch)
- #25 — RHF + zod migration for legacy dialog forms (sprint-scale)

These are the menu for the next session.

---

## 4. The honest read

This session was **CI infrastructure work**, not product. Four PRs that don't move a single user-facing pixel. But the cost of NOT doing this work was every future PR sitting on top of 23 unpatched vulnerabilities, with no gate to catch new ones, and an auth package with zero test coverage protecting every role-gate in the dashboard.

The CI-hardening track is now the floor. Every PR after #108 inherits:
- Zero production vulnerabilities at the baseline
- A load-bearing audit gate
- Dependabot weekly grouped PRs
- An auth-package test floor that fails fast on RBAC regressions

Future product work (Phase 4c manifest wizard, Phase 4d invoice wizard) builds on this floor. That's the trade.

---

## 5. Carryforward to next session

See [`docs/NEXT-SESSION-HANDOFF.md`](./NEXT-SESSION-HANDOFF.md). The May-14 version is superseded; the new version captures the post-#108 state.

**Recommended lead task:** [#22](https://github.com/cargotapan-collab/tac-express/issues/22) — Sentry DSN + alert-rule verification. Pairs naturally with the alert-rule provisioning script that PR #105 added. ~1 hour. Owner-runnable for the Sentry-auth parts.

**Anti-recommendation:** Do not start Phase 4c (New Manifest wizard) without first running `tac-brainstorming` and producing a written spec. Phase 4b's discipline (PR #82) is the template.
