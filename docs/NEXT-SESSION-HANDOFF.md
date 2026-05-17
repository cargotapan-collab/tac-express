# Next-Session Handoff — Start Here

> **You are picking up TAC Express after PR #<TBD> (eliminate the `as unknown as` cast in invoice-pdf route — backlog item O2).** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last code commit on `main`:** post-PR-#<TBD> merge — `fix(types): eliminate cargo-cult cast in invoice-pdf route (backlog O2)`.
**Date this doc was written:** 2026-05-17 (sixth substantive session today — closes the last GENUINELY-OPEN-AND-REAL service-quality item in the production-readiness backlog).
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer.
**Status of recent work (per `docs/backlog/production-readiness.md`):**
- **W1** (whatsapp_sends audit table): DONE (PR #141).
- **#136 backlog-drift sentinel + Unit tests CI gate**: DONE (PRs #146 + #149).
- **O1** (manifest.service.ts full test floor): DONE (PR #147).
- **#139 + #140** (whatsapp.service source bugs): DONE (PR #148).
- **O2** (`as unknown as` cast in invoice-pdf route): DONE (this PR — outcome 1, cargo-cult cast removed).
- **W2/W3/W4/W5** (whatsapp_sends follow-ups #142–#145): OPEN; refs pending.

> **The "service-quality" cluster in the production-readiness backlog is now DONE.** What remains on the backlog: the four whatsapp_sends follow-ups (W2–W5), the docs items (D1–D5), the WONTFIX rows, and the E2E flows bucket. Plus the off-backlog items (#130, #131, etc.).

---

## 1. CADENCE PRE-COMMIT (load-bearing — TWELVE substantive PRs old)

**Status: HOLDS.** Twelve real tests across the arc. This session resisted four named bundle temptations:

1. **Folding in #131 (branded ServiceLevel).** Strong pull — the cast-inventory scan made the sibling relationship obvious. Resisted. #131 stays its own session; the inventory finding (see § 5.10 below) gives it a clearer scope when picked up.
2. **Refactoring the invoice-pdf route beyond the cast.** Resisted.
3. **Building a test floor for the route.** Resisted.
4. **Fixing other `as unknown as` casts found during the scan.** 18 found; 17 untouched. ONE follow-up filed (proxy.ts middleware casts) per the brief's "find one → document + file" rule.

**New observation (this session):** the cast was *deceptively documented*. The pre-fix comment claimed `@react-pdf/renderer` library boundary; the actual library boundary lives inside the service, not the route. The cast was cargo-cult from PR #128's earlier cleanup work. Recorded as discipline § 7.25 — when a cast's "why" comment names a library boundary, verify the cast IS at that boundary; rationale can be inherited from sibling sites that DO sit at the boundary.

---

## 2. READ THIS FIRST — seven things you must NOT do

(Unchanged.)

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5`.
2. **Do NOT bump dependencies in feature PRs.**
3. **Do NOT add Sentry tag keys without updating all four artifacts.**
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner runs it locally (#94, still pending).
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.**
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** [`docs/backlog/production-readiness.md`](backlog/production-readiness.md) is authoritative; `Backlog references drift check` CI gate verifies on every PR.

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 712 tests passing.
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
```

---

## 4. Current state snapshot

### Open PRs (0 after #<TBD> merges)

### Open issues — derive from [`docs/backlog/production-readiness.md`](backlog/production-readiness.md)

**The repo backlog file is authoritative.** Tracker numbers for cross-reference.

| Tracker | Title | In repo backlog as | Priority |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Sentry alert-rule notification action | **O3** | P2 (owner-runnable) |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta — body pointer-only | meta |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | not in backlog (tooling) | own session |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` type | not in backlog (type-infra) — but SCOPE EXPANDED per this session; see § 5.10 | own session |
| [#142](https://github.com/cargotapan-collab/tac-express/issues/142) | Operator retry UI for failed WhatsApp sends | **W2** | medium |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated background retry job | **W3** | low |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta delivery-callback webhook | **W4** | medium-low |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | App-layer immutability sentinel (whatsapp_sends) | **W5** | low |
| [#<TBD-PROXY-CAST>](TBD) | NEW: `as unknown as` cleanup in apps/web/proxy.ts middleware | not in production-readiness backlog (sibling of O2) | own session (small) |

**Recently resolved:** the entire service-quality cluster from PR #133 → this PR. O1 / W1 / O2 all DONE. The audit_logs + whatsapp_sends + manifest test-floor + CI gating + bug fixes + cast cleanup arc is complete.

---

## 5. Critical context (the things that will trip you up)

### 5.1 audit_logs adoption (post-#135) — unchanged

### 5.2 Cross-package tag-emission contract — unchanged

### 5.3 Shared mock-db helpers — unchanged

### 5.4 EIGHT CI gates load-bearing — unchanged from PR #149

(`LAW gates`, `@tac registry sync + smoke`, `migrations apply on fresh DB`, `npm audit`, `Sentry alert-rule structure lint`, `Bundle size`, `Backlog references drift check`, `Unit tests`, plus `visual + a11y` in the e2e workflow.)

### 5.5 CodeRabbit pattern catalog (9 entries) — unchanged. Five consecutive PRs cleared the bots near-clean.

### 5.6 NEW: CI test-gating policy (PR #149) — unchanged

### 5.7 NEW: `WhatsAppResult.semanticFailure` flag (PR #148) — unchanged

### 5.8 NEW: Bug-doc test → regression-check lifecycle (PR #148) — unchanged

### 5.9 NEW: Cast-rationale verification — recorded this session

When a `as unknown as` cast's comment claims it's at a library boundary, verify the cast IS at that boundary before trusting the rationale. This session's O2 cast claimed a `@react-pdf/renderer` library type-gap; the actual library boundary lives one file deeper, INSIDE `packages/services/src/pdf/invoice-pdf.tsx::renderInvoicePdfToBuffer`. The route's cast was cargo-cult from sibling sites that DID sit at the boundary.

### 5.10 NEW: #131's scope is wider than its title

The inventory scan during this session found ~12 branded-type mapper-fallthrough casts across `customer.service`, `exception.service`, `invoice.service`, `manifest.service`, `scan-sync.service`, and their web consumers (`apps/web/app/(public)/quote/rate-calculator.tsx`). All of these are siblings of #131 — the title says "ServiceLevel" but the actual cluster is "ALL branded-type mapper fallthroughs across all services + their consumers." Future #131 session: scope to the cluster, not just `ServiceLevel`. The retro § 4 of this PR has the full inventory.

---

## 6. Your first task — recommended

**The next-lead source of truth is now [`docs/backlog/production-readiness.md`](backlog/production-readiness.md), NOT this handoff.** Per the backlog's open items + the off-backlog cluster:

### Option A — W2: Operator retry UI for failed WhatsApp sends (#142) — RECOMMENDED FIRST WHATSAPP FOLLOW-UP

Most user-facing of the four W-cluster items. The service-layer `retryWhatsappSend(originalSendId, replayPayload)` exists since PR #141; needs a `/ops-console/whatsapp/failed-sends` page or a "Resend" button on the invoice-detail page + a new `/api/whatsapp/retry-send` route + tests. ~1 session per PHASE-0.

### Option B — #131 (branded type cluster) — NOW WITH BROADER SCOPE

Per § 5.10 above, the cluster is bigger than the title suggests. Pick this if you want a focused type-safety session — ~12 sites to fix; needs PHASE-0 to decide the type-extension shape (branded all the way through, or branded at the API boundary + plain strings inside services?).

### Option C — #130 (regex-alternation LAW gate)

Own session. Small tooling addition.

### Option D — Permissions convergence cleanup (PR #149 carry-forward)

Converge the 8 architecture-gates jobs to use explicit `permissions: contents: read` blocks. Currently only the new `Unit tests` job + `shadcn-drift-check` have them. Small (8 × 2 lines + comment update).

### Option E — `as unknown as` cleanup in apps/web/proxy.ts (this session's filed follow-up)

Small middleware cast cleanup. ~30 min.

### Option F — D1 / D2 / D3 / D5 — docs-only items in the backlog

Each ~30 min to 1–2 hours.

### Option G — W3 / W4 / W5

Each is its own session; W3 is multi-session (needs job-runner PHASE-0).

### Option H — #94 (5-min owner-runnable Sentry provisioning) — not an agent task

---

## 7. Cumulative discipline observations (carry-forward)

Distilled from PRs #105 → #<TBD>.

### 7.1 – 7.24 (unchanged — see prior handoffs)

### 7.25 NEW (this session): Verify cast-rationale before trusting it

When a `as unknown as` cast's "why" comment names a library boundary, verify the cast IS at that boundary. Comments can be inherited from sibling sites via cargo-culting; the comment's shape is right but the file is wrong. Recorded with the O2 example — the cast claimed `@react-pdf/renderer` boundary; the actual boundary was one file deeper. Lesson: when reading a cast, trace BOTH directions (where does the typed value come from AND where does it flow to). If the "to" side already accepts the type, the cast is hiding nothing regardless of what the comment says.

### 7.26 NEW (this session): The PHASE-A three-outcome framework prevented an over-fix

The brief framed the cast resolution as "outcome 1 (static fix), 2 (runtime guard), or 3 (library-boundary narrow + guard + comment)." Walking through the three outcomes deliberately forced the realization that the cast was hiding nothing (outcome 1) — rather than auto-piloting toward outcome 3 because the existing comment said library-boundary. If I had skipped the framework I would have added a runtime guard (over-engineered) or narrowed the cast to a "less-bad" form (same bypass, more words). The framework was load-bearing.

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
# Service test floors:
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts
pnpm vitest run packages/services/src/__tests__/shipment.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp-tracked.service.test.ts
pnpm vitest run packages/services/src/__tests__/manifest.service.test.ts
# Sentinels:
pnpm vitest run apps/dashboard/__tests__/backlog-refs-drift.test.ts
pnpm vitest run apps/dashboard/__tests__/audit-doc-references.test.ts
pnpm vitest run apps/dashboard/__tests__/api-routes-no-console.test.ts
pnpm vitest run apps/dashboard/__tests__/rbac-block-adoption.test.ts
pnpm vitest run packages/services/src/__tests__/silent-by-design.test.ts
pnpm vitest run packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
node scripts/ci-watch-pr.mjs <pr-number>
```

---

## 9. Key file locations

(Unchanged from PR #149 handoff.)

```
# Service test floors (six in total)
packages/services/src/__tests__/payment.service.test.ts
packages/services/src/__tests__/invoice.service.test.ts
packages/services/src/__tests__/shipment.service.test.ts
packages/services/src/__tests__/whatsapp.service.test.ts
packages/services/src/__tests__/whatsapp-tracked.service.test.ts
packages/services/src/__tests__/manifest.service.test.ts

# Sentinel tests (six, all CI-gated as of PR #149)
apps/dashboard/__tests__/rbac-block-adoption.test.ts
apps/dashboard/__tests__/api-routes-no-console.test.ts
packages/services/src/__tests__/silent-by-design.test.ts
apps/dashboard/__tests__/audit-doc-references.test.ts
packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
apps/dashboard/__tests__/backlog-refs-drift.test.ts

# Authoritative backlog + decision docs
docs/backlog/production-readiness.md
docs/decisions/2026-05-16-audit-logs-mechanism.md
docs/decisions/2026-05-17-whatsapp-sends-mechanism.md
docs/decisions/2026-05-17-backlog-drift-sentinel.md
```

---

## 10. The honest read

A genuinely 30-minute fix. The O2 cast turned out to be cargo-cult; removing it was a one-line change. The real value-add was the inventory scan finding (18 `as unknown as` casts across the codebase, ~12 of them in the same branded-type-mapper category that #131 was filed for) — recorded for the future #131 session.

Tests 712 → 712. Source diff: ~6 net lines in one route file. Zero new dependencies. The brief's "DO NOT" list ran six items long; all six held. No bailout fired; one follow-up issue filed for proxy.ts cast cleanup.

The service-quality cluster in the production-readiness backlog (O1 + W1 + O2) is now complete. What remains on the backlog is product-priority work (W2–W5 whatsapp_sends follow-ups) + docs items + E2E flows.

**Recommended one-line summary for the next session's prompt:** "Pick up the whatsapp_sends operator retry UI follow-up (W2 / #142). ONE PR. Decline any 'while we're here' expansion." (Or one of options B–H per owner priority — the cluster split point per the handoff.)

---

**Load the skills. Re-read § 1 (cadence pre-commit, TWELVE substantive PRs old). Pick a task from § 6 — or better, from `docs/backlog/production-readiness.md` directly. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff.
