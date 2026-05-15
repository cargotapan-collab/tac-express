# TAC Express — Production-Readiness Report

**Date:** 2026-05-15  
**Authored by:** Claude (CTO/PM mode)  
**Audit scope:** Full monorepo — security, code health, CI/CD, ops, tests, docs  
**Audit method:** Four parallel exploration agents + cross-validation against live production state

---

## TL;DR — where we stand

**The good news:** TAC Express is in much better shape than this morning. The Path A migration reconciliation closed the P0 silent-divergence issue (#78), the advisor warnings dropped 48 → 13 (#79), Sentry is verified live (#22 closed earlier), and the CI migration gate is now load-bearing.

**The honest news:** there are real production-readiness gaps that the recent firefighting masked. None are launch-blockers in the sense of "production breaks tomorrow," but several would convert ANY incident into a multi-hour blind triage session because we'd lack the test coverage, observability, or runbook to recover quickly.

**Top 5 immediate moves** (each ~1-3 hours of work):

1. **Update PRODUCTION-RUNBOOK.md** — three load-bearing claims are stale (Sentry not wired, invoice_payments missing, two phantom migrations). Done in this PR.
2. **Add `/api/health` endpoint** — `proxy.ts` already whitelists it but no handler exists. ~10 LOC fix.
3. **Add unit tests for `payment.service.ts` + `record_invoice_payment` RPC** — financial code with zero tests is the single biggest correctness risk. Tests would have caught the OPERATOR role bug before it ever shipped.
4. **Fix the 5 production bugs Sentry surfaced (#93)** — three of them are `transformAlgorithm` recurrences on `/ops-console`, the other two are missing icon imports. Cheap fixes, real visible bugs.
5. **Wire Sentry alert rules (#94)** — events arrive in Sentry, but no rule fires a notification. If the dashboard breaks at 3am, no one knows.

Detail below. Each finding cites file:line where applicable.

---

## Methodology

I spawned four read-only exploration agents in parallel, each scoped to one dimension:
1. **Security** — secrets, auth surface, public APIs, signing, forbidden packages
2. **Code health** — dead code, type debt, orphaned components, duplicate patterns
3. **CI/CD + tests** — workflow health, soft-fails, test coverage by package, E2E gaps
4. **Ops + observability** — Sentry, logging, runbooks, background jobs, public surfaces

Then I **cross-validated** their findings against current production state via Supabase MCP and direct file reads. This caught stale documentation pretending to be ground truth — see "Validation deltas" below.

---

## Validation deltas (audit vs. reality)

The ops audit report was reading `docs/PRODUCTION-RUNBOOK.md` which **predates the May 14-15 reconciliation**. Three "critical" claims it surfaced are no longer true:

| Stale runbook claim | Actual current state | Caught how |
|---|---|---|
| `invoice_payments` table does not exist | **Exists in production** — verified via `list_tables` and the live `record_invoice_payment` RPC | Path A baseline includes it; PR #97 + #100 deployed the corrective work |
| `record_invoice_payment` RPC does not exist | **Exists and works** — deployed via PR #97 + #100 | `has_function_privilege('authenticated', oid, 'EXECUTE')` returns true |
| `SENTRY_DSN` not yet set in production | **Set and verified** — Sentry receives events end-to-end | Issue #22 closed earlier this session with verification evidence |
| Migrations `20260501000001` + `20260501000002` need to be added | These filenames never existed; the work landed under different filenames | Path A consolidated baseline includes the table + RPC |

These deltas are themselves a finding — runbooks rot fast. The runbook fix lands in this same PR.

---

## Section 1 — Security

**Headline:** No critical vulnerabilities. Two sprint-worthy hardening items. Several patterns to praise (which is why I'm calling them out as "this is correct, don't regress").

### 1.1 Critical findings
**None.**

### 1.2 Sprint-worthy
- **`INVOICE_PDF_SIGNING_SECRET` validation is length-only** — accepts any 64-char string, including non-hex like `aaaaaaaa…`. A misconfigured operator could set a weak secret without warning.
  - File: [packages/services/src/pdf/invoice-pdf-token.ts:56-70](packages/services/src/pdf/invoice-pdf-token.ts:56)
  - Fix: add `if (!/^[0-9a-f]{64}$/i.test(secret)) throw …`
  - Effort: 5 minutes
- **WhatsApp rate-limit bucket scope undocumented** — risk of future endpoints colliding on the same bucket key.
  - File: [apps/dashboard/lib/rate-limit.ts:51-58](apps/dashboard/lib/rate-limit.ts:51)
  - Fix: JSDoc above each export listing its consumers
  - Effort: 10 minutes

### 1.3 Patterns to preserve (don't regress these)
- `apps/dashboard/lib/public-origin.ts:41-95` — `isPubliclyReachableHttpUrl()` correctly blocks loopback / RFC1918 / IPv6-ULA / IPv4-mapped IPv6 bypasses. Keep this.
- ESLint forbidden-package gates work — zero `axios`/`moment`/`lodash` violations in the tree.
- `SUPABASE_SERVICE_ROLE_KEY` is correctly confined to Edge Functions only.
- Sentry replay integration masks all text + blocks all media + redacts Supabase URLs in breadcrumbs. Privacy-by-default.

---

## Section 2 — Code health

**Headline:** TypeScript strictness is broadly good. The two real issues are: (1) `as unknown as` escape hatches that paper over real type bugs, and (2) ~10 orphaned components in `packages/ui` that confuse the canonical-pattern story.

### 2.1 Critical (silent-failure risk)
- **`as unknown as` casts indicate type-contract drift** — these compile but break in production.
  - [apps/dashboard/app/api/public/invoice-pdf/route.ts:118](apps/dashboard/app/api/public/invoice-pdf/route.ts:118) — `headerBuffer` cast
  - [apps/dashboard/app/ops-console/finance/create/ops-create-invoice-live.tsx:88](apps/dashboard/app/ops-console/finance/create/ops-create-invoice-live.tsx:88) — `invoice as Record<string, unknown>` (the type should already be correct)
  - [apps/dashboard/proxy.ts:21-22](apps/dashboard/proxy.ts:21) — middleware client cast (×2)
  - [apps/dashboard/app/track/[awb]/page.tsx](apps/dashboard/app/track/[awb]/page.tsx) — repeated `shipment as unknown as { serviceLevel?: string }` cast — the shipment type is missing `serviceLevel`, fix at the type definition
- **Action:** Sprint-sized cleanup PR. Each cast either reveals a missing type field or a real bug.

### 2.2 Sprint-worthy
- **Orphaned UI components** (zero imports, not exported) — clutter that makes "what's the canonical pattern?" unclear:
  - `packages/ui/src/components/composed/dashboard-header.tsx`
  - `packages/ui/src/components/composed/lottie-hero.tsx`
  - `packages/ui/src/components/composed/marquee.tsx`
  - `packages/ui/src/components/composed/text-matrix-rain.tsx`
  - 7 dashboard cards in `packages/ui/src/components/composed/dashboard/`
  - **Action:** Either re-export with intent + docs, or move to `packages/ui/src/components/_archive/`

- **Duplicate form variants** — both kept "for fallback" but no living doc says which is canonical:
  - `customer-form.tsx` vs `v7-customer-form.tsx`
  - `rate-card-form.tsx` vs `ops-rate-card-form.tsx`
  - **Action:** Pick a winner per domain in CLAUDE.md or archive the loser.

### 2.3 Backlog
- A few `eslint-disable` comments without owner/issue links. Three locations, all in known-edge cases (realtime hooks, exhaustive-deps).

---

## Section 3 — CI/CD + Test coverage

**Headline:** Workflow health is great post-#99. Test coverage has critical holes — `packages/auth` and `packages/database` have **zero unit tests**, and most domain services are untested.

### 3.1 Critical
- **`packages/auth` has 0 unit tests** — session helpers, `withRole()`, role checks. A regression here means privilege escalation could ship without anyone noticing.
- **`packages/database` has 0 unit tests** — generated types + query helpers. Schema drift between repo and runtime would only surface in production.
- **`payment.service.ts` (12.8KB), `invoice.service.ts` (7.9KB), `shipment.service.ts` (9.2KB), `manifest.service.ts` (7.3KB)** — all untested. These are the financial + domain core. The OPERATOR role bug we fixed today (#97) would have been caught by a single test on `record_invoice_payment`.
- **No dependency vulnerability scanning** — no `pnpm audit` in CI, no Dependabot. The 18KB `whatsapp.service.ts` and the payment service depend on external SDKs with no SCA coverage.

### 3.2 Sprint-worthy E2E gaps
Critical user flows not covered end-to-end:
- ❌ **Payment recording happy path** — wizard renders but POST + assert not exercised
- ❌ **Full shipment creation** (steps 2-4) — only step 1 covered
- ❌ **Manifest with bulk shipment selection** — only step 1 covered
- ❌ **Role-based RLS isolation** — no E2E proves WAREHOUSE user can't see other hubs' data
- ❌ **Exception lifecycle** — create / escalate / resolve untested

### 3.3 Workflow health (good)
- ✅ `migrations-fresh-apply` is now load-bearing (PR #99)
- ✅ All actions on v4+ (no deprecated versions)
- ✅ Architecture gates run on PR + push to main
- ✅ Path filters scoped correctly

---

## Section 4 — Operations + observability

**Headline:** The plumbing is good. The runbook is stale and there are gaps in failure-mode coverage that would slow incident response.

### 4.1 Critical (validated)
- **No `/api/health` endpoint handler exists** — `proxy.ts:29` whitelists it as public but there's no route. Load balancers and external monitors can't health-check the app.
  - File needed: `apps/dashboard/app/api/health/route.ts` (~10 LOC)
- **WhatsApp has no delivery audit table or retry path** — kill-switch exists, but if WPBox returns 200 with `wamid: null` (silent rejection), the message is lost forever and ops have no way to know.
  - Recommended: add `whatsapp_sends` audit table + scheduled poll job
- **Sentry alert rules not wired** — events arrive (verified) but no rule fires a notification. Tracked separately as #94. **THIS is the #22 carve-out** that's still open.

### 4.2 Sprint-worthy
- **Console-only logging** in route handlers and server actions — no structured logger, no request-correlation IDs. Triage requires raw substring grep.
  - Locations: `apps/dashboard/app/api/whatsapp/send-invoice/route.ts:426,432,443,473,506,530`, `apps/dashboard/app/api/diagnostics/sentry/route.ts:59,67`, `apps/dashboard/app/api/public/invoice-pdf/route.ts:55,123`
- **Edge function cron registration not documented** — `scheduled-sla-monitor` exists but the runbook doesn't say how it's scheduled or how to verify it runs
- **No PITR / restore playbook** — runbook mentions PITR but has no "database lost — restore" procedure
- **No Upstash outage scenario** — if Redis is down, rate-limit fails open. No runbook mentions this.

### 4.3 Backlog
- No on-call schedule or escalation policy in runbook
- No live links to Sentry / Vercel / Supabase / Upstash dashboards in the runbook
- No audit trail table for destructive ops (invoice cancellation, payment deletion)

### 4.4 Stale runbook entries (fixed in this PR)
- Lines 195-209 of `PRODUCTION-RUNBOOK.md` claim `invoice_payments` and `record_invoice_payment` don't exist — both are live in production as of today
- Lines 224-232 claim `SENTRY_DSN` is not set in production — verified set, events flow end-to-end
- Lines 205-206 reference migration filenames `20260501000001`/`20260501000002` that never existed; the actual work landed under the consolidated Path A baseline

---

## Section 5 — Documentation hygiene

- ✅ `CLAUDE.md` is current and well-maintained
- ✅ ADR Decision 8 captures the Path A pivot
- ✅ Migration drift catalog documents the divergence in detail
- ❌ `PRODUCTION-RUNBOOK.md` had three stale load-bearing claims (fixed in this PR)
- ❌ No `RELEASE-CHECKLIST.md` documenting the release process
- ❌ No `DATABASE-RESTORE.md` for PITR scenarios
- ❌ Several files in `docs/` without clear ownership (likely candidates for archive: `AUDIT-FIXES-PLAN-2026-05-14.md`, `NEXT-SESSION-HANDOFF.md`, `SESSION-RETRO-2026-05-14.md` — these were session-scratchpads, not living docs)

---

## Section 6 — Action plan

### Immediate (this PR or next, ~1-3 hours each)
- [x] Update `PRODUCTION-RUNBOOK.md` — done in this PR
- [ ] Add `/api/health` endpoint
- [ ] Fix the 5 production bugs Sentry surfaced (#93)
- [ ] Add `INVOICE_PDF_SIGNING_SECRET` hex-format validation

### Sprint 1 (~1 week)
- [ ] Unit tests for `payment.service.ts`, `record_invoice_payment` RPC, `invoice.service.ts`
- [ ] Unit tests for `packages/auth` (session + withRole + RBAC helpers)
- [ ] Wire Sentry alert rules + notification action (#94)
- [ ] Fix `as unknown as` casts (cleanup PR)
- [ ] Add `pnpm audit --production` job to architecture-gates.yml
- [ ] Enable Dependabot for monorepo

### Sprint 2 (~1 week)
- [ ] E2E coverage for payment recording happy path
- [ ] E2E coverage for full shipment creation (steps 2-4)
- [ ] E2E coverage for full manifest creation with bulk select
- [ ] Unit tests for `shipment.service.ts`, `manifest.service.ts`, `whatsapp.service.ts`
- [ ] WhatsApp audit table + scheduled delivery poll
- [ ] Structured logger (pino) across route handlers

### Backlog (track but no committed sprint)
- [ ] Archive orphaned UI components or document their purpose
- [ ] Pick canonical form variant per domain (v7 vs v6) and archive the loser
- [ ] PITR restore playbook
- [ ] Upstash outage runbook entry
- [ ] On-call schedule + escalation policy
- [ ] Live monitoring dashboard links in runbook
- [ ] `audit_logs` table for destructive operations

---

## Section 7 — What's not in this report (out of scope)

- **Performance audit** — bundle size CI gate exists; Lighthouse scores not measured
- **A11y audit** — `e2e/a11y.spec.ts` runs AXE; no comprehensive WCAG conformance review
- **i18n** — single-locale today; no i18n infrastructure
- **Mobile / responsive audit** — VRT covers desktop only at this point
- **Cost optimization** — no review of Supabase / Vercel / Upstash spend curves

These are legitimate areas but outside this audit's scope. Track separately if/when they become priority.

---

## How to use this report

1. **Owner reviews** the immediate-section action items, prioritizes top 3-5
2. **Each remaining item gets its own GitHub issue** — referenced from a single tracking issue (created alongside this PR)
3. **Re-audit cadence:** Recommend running this same parallel-agent audit at the end of every major project phase (e.g., after Phase 5 / Phase 6) to catch drift early

The biggest correctness risk on this list is the **0% test coverage on financial services**. Everything else has a workaround; financial bugs cost real money and are nearly impossible to detect post-fact.

---

*Generated 2026-05-15 from a clean main (post-PR #100). Re-run by spawning the same four Explore agents — prompts saved in this session's transcript.*
