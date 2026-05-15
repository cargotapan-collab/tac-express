# Next-Session Handoff — Start Here

> **You are picking up TAC Express after the 2026-05-15 PM non-stop campaign session.** That session shipped 4 sequential PRs (#114 → #118) on top of the prior Sentry-track + Instrumentation-track from earlier the same day. Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last commit on `main`:** `2de96f7` — `test(services): payment.service.ts unit-test floor (#118)`
**Date this doc was written:** 2026-05-15 (post-campaign — third+fourth tracks of the day)
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO simultaneously

---

## 0. READ THIS FIRST — six things you must NOT do

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5`. Load it as your literal first action of every session.

2. **Do NOT bump dependencies in feature PRs.** The `npm-audit` gate has been load-bearing since #108. Dep bumps belong in their own PR.

3. **Do NOT add Sentry tag keys without updating all four artifacts** (the cross-package tag-emission contract):
   - The package's tag-key constant (`RBAC_DENIAL_TAG_KEYS`, `SUPABASE_RPC_TAG_KEYS`)
   - The canonical alert rule's `TaggedEventFilter.key` in `scripts/sentry/canonical-rules.mjs`
   - `EMITTED_TAG_KEYS` in the same file
   - The sentinel test at `apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts`
   Drift in any one fails the sentinel + the `alert-rule-lint` CI gate.

4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** The script needs `SENTRY_AUTH_TOKEN` (and now `SENTRY_ALERT_NOTIFICATION_ACTION` for rule 6); both must NOT enter the agent transcript. Owner runs it locally. Agents may inspect with `--dry-run` only if the token is already in local env.

5. **Do NOT regress to `console.*` in `apps/dashboard/app/api/{diagnostics,public/invoice-pdf,whatsapp}` routes.** The sentinel test at `apps/dashboard/__tests__/api-routes-no-console.test.ts` fails loudly on any regression. Use `logger` from `@/lib/logger` instead. See PR #117.

6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** The classifier requires the owner to type the literal phrase `merge PR <N>` for each PR. This is the third campaign where this safety has mattered — lean into it.

---

## 1. First 5 minutes — mandatory ramp

```bash
# 1. Confirm you have the latest main
git checkout main && git pull origin main
# Expected: 2de96f7 at HEAD

# 2. Confirm quality gates pass on a clean main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 362 tests passing

# 3. Confirm the load-bearing audit gate is clean
pnpm audit --prod --audit-level moderate
# Expected: "No known vulnerabilities found"

# 4. Confirm the alert-rule lint passes (6 rules now)
node scripts/sentry/lint-alert-rules.mjs
# Expected: "✓ canonical-rules.mjs is valid (6 rules)."
```

Then in your agent harness:

```
1. Load skill: tac-express-onboarding
2. Open: .claude/skills/RESOLVER.md
3. Match your task to a specialist skill
4. Load that skill BEFORE writing code
```

If the agent asks "what's the task?", see § 4.

---

## 2. Current state snapshot

### Open PRs (0)

Clean slate.

### Open Issues — short list (full backlog in #102)

| # | Title | Priority | Notes |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Verify + wire Sentry alert-rule notification action | P2 | **One owner step from close.** Run the 7-step procedure in `docs/runbooks/sentry-alert-rules.md § 5.3`. ≤5 min. |
| ~~[#115](https://github.com/cargotapan-collab/tac-express/issues/115)~~ | ~~Observability follow-ups from PR #114 audit § 6~~ | ~~P2~~ | **RESOLVED** in follow-up PR (silent-by-design decisions documented in runbook § 4.1; sentinel test pins the source markers). |
| [#25](https://github.com/cargotapan-collab/tac-express/issues/25) | Audit + migrate dialogs/forms to react-hook-form + zod | — | Sprint-scale |
| [#54](https://github.com/cargotapan-collab/tac-express/issues/54) | OpsManagementView role-select + Invite Staff actions | follow-up | Most addressed in #104 |
| [#55–#58](https://github.com/cargotapan-collab/tac-express/issues/55) | Cosmetic follow-ups | follow-up | ~10min each; batchable |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta | ~18 sub-items remain (was ~21; campaign ticked at least 4) |

**Resolved during this campaign (2026-05-15 PM non-stop):**
- [#112](https://github.com/cargotapan-collab/tac-express/issues/112) — Sentry instrumentation adoption (closed by PR #114; full helper + canonical-rule + adoption-contract sweep landed).

**Owner-runnable close pending:**
- [#94](https://github.com/cargotapan-collab/tac-express/issues/94) — owner runs the 7-step procedure in runbook § 5.3.

### #102 checkboxes that should be ticked (owner action — these were silently completed)

| Sub-item | Completed by | PR | Status |
|---|---|---|---|
| Add `/api/health` endpoint | #103 | merged | DONE; checkbox not ticked |
| Fix 5 production bugs (#93) | #93 closure | merged | DONE; checkbox not ticked |
| `INVOICE_PDF_SIGNING_SECRET` hex-format validation | already in code (`invoice-pdf-token.ts:67`) | merged | DONE; checkbox not ticked |
| Unit tests for `packages/services/src/payment.service.ts` | this campaign | #118 | DONE; checkbox not ticked |
| Unit tests for `record_invoice_payment` RPC | this campaign | #118 | DONE; checkbox not ticked |
| Unit tests for `packages/auth/*` | prior session | #106 | DONE; checkbox not ticked |
| Wire Sentry alert rules | prior sessions + this campaign | #105, #111, #113, #114, #116 | DONE script-side; OWNER-CLOSE remaining for live wiring (#94) |
| Replace `console.log` with structured logger (pino) | this campaign | #117 | DONE; checkbox not ticked |
| Add `pnpm audit --production` job | prior session | #105 | DONE; checkbox not ticked |
| Enable Dependabot | prior session | #105 | DONE; checkbox not ticked |

Owner can update #102's body directly or ask an agent to draft an updated body. The campaign retro at `docs/retros/2026-05-15-pm-campaign-track.md` § 4 has the full ledger.

---

## 3. Critical context (the things that will trip you up)

### 3.1. Cross-package tag-emission contract is enforced at THREE levels (unchanged from PR #113)

| Level | Artifact | What enforces it |
|---|---|---|
| CI gate | `node scripts/sentry/lint-alert-rules.mjs` | Validates rule shape + that every `TaggedEventFilter.key` is in `EMITTED_TAG_KEYS` |
| Vitest sentinel | `apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts` | Asserts package tag-key exports match `EMITTED_TAG_KEYS` + the canonical rules. PR β extended this with rule-6 shape pinning. |
| Runbook | `docs/runbooks/sentry-alert-rules.md § 4` | Documents the package → helper → tag-keys → rule mapping for human review |

### 3.2. PR α's PHASE A audit doc IS the binding contract for adoption

[`docs/audits/2026-05-15-rbac-denial-audit.md`](audits/2026-05-15-rbac-denial-audit.md) classifies every RPC call site as DIRECT-WRAP / SELECTIVE / DEFERRED and every RBAC site as BLOCK / GATE / AMBIGUOUS. The bucketing is the contract for what `withRpc` / `captureSupabaseRpcError` / `captureRbacDenial` are adopted at.

**Critical:** if you add a new RPC site or a new role-gate, classify it in this audit doc FIRST (or update the doc), THEN write the adoption code. The order matters for reviewer sanity.

### 3.3. Six CI gates load-bearing on main (unchanged)

| Job | What it checks |
|---|---|
| `registry-check` | `@tac` shadcn registry in sync with sources |
| `governance` | LAW 2 / LAW 8 / design-system specifics |
| `migrations-fresh-apply` | `supabase db reset` succeeds |
| `npm-audit` | Zero moderate-or-above vulns in production deps |
| `alert-rule-lint` | `canonical-rules.mjs` structure + tagged_event key coverage |
| `bundle-size` | `apps/dashboard/.bundle-budget.json` honored |

### 3.4. Rule 6 (parameterized notification action) needs env var to provision

PR β added rule 6 ("Production errors (owner-targeted) — javascript-nextjs") which uses a `PARAMETERIZED_NOTIFICATION_ACTION` sentinel id. The runner intercepts the sentinel and replaces it with the action JSON from `SENTRY_ALERT_NOTIFICATION_ACTION` env var. If the env var is missing, rule 6 is SKIPPED with a warning; rules 1–5 provision normally.

Owner procedure to provision + close #94: `docs/runbooks/sentry-alert-rules.md § 5.3` (7 steps, ≤5 min).

### 3.5. Three API routes use pino, NOT console.* (PR γ)

`apps/dashboard/lib/logger.ts` exports the configured `logger`. Three routes import it:
- `apps/dashboard/app/api/diagnostics/sentry/route.ts`
- `apps/dashboard/app/api/public/invoice-pdf/route.ts`
- `apps/dashboard/app/api/whatsapp/send-invoice/route.ts`

Each binds a child logger with `route: <path>`. The sentinel test fails on any regression to `console.*` in these files.

`LOG_LEVEL` env var sets the minimum level (defaults: `info` in prod, `debug` elsewhere). Both `LOG_LEVEL` and `SENTRY_ALERT_NOTIFICATION_ACTION` are declared in `turbo.json` env list.

### 3.6. The "no derived sets" law applies to runtime enums; string-union types use TypeScript-native exhaustiveness

PR δ's `PaymentMethod` sentinel uses:
```ts
const ALL_METHODS = [...] as const satisfies readonly PaymentMethod[]
type _Missing = Exclude<PaymentMethod, (typeof ALL_METHODS)[number]>
const _allPaymentMethodsCovered: _Missing extends never ? true : never = true
```

This is the correct equivalent of `rbac.test.ts`'s `Object.values(UserRole)` sentinel for string-union types (which have no runtime representation). Two different tools for two different shapes — both achieve the same goal: catch drift at compile time.

### 3.7. Day's totals (2026-05-15 across all sessions)

- 10 PRs merged to main (#105 → #118; was 0 open PRs at start of CI-hardening session early in the day; 0 open PRs at campaign close)
- 252 tests → 362 tests (+110 across the day)
- 6 canonical Sentry alert rules (was 0 at start of day)
- 6 load-bearing CI gates (was 4 at start of day)
- 3 new instrumentation modules + 1 logger wrapper + 1 cross-package tag-contract sentinel

---

## 4. Your first task — recommended

### Option A — `invoice.service.ts` unit-test floor (~1 focused session) RECOMMENDED

Mirror PR #118's pattern. `invoice.service.ts` is the next financial surface at 0 tests after `payment.service.ts` got coverage. Same mocked-Supabase pattern, same module-level state isolation via `vi.resetModules()`. ~400 LoC.

### Option B — Owner runs the #94 procedure (5 min, owner-only)

Not an agent task — but flag it explicitly so the owner can knock it out. After this, #94 closes and the day's observability arc is fully done.

### Option C — Phase 4c Manifest wizard (~1 focused session)

Same template as Phase 4b. Use PR #82 as reference. Generalize `useShipmentDraft` to `useFormDraft<T>` first.

---

## 5. Quick reference

### Skills you'll load most

```
tac-express-onboarding   # Mandatory first action of every session
tac-brainstorming        # Mandatory before any new feature
tac-tdd                  # Mandatory for any non-trivial unit
tac-karpathy-discipline  # Apply to everything
tac-fourteen-laws        # When uncertain whether something is allowed
tac-data-layer           # When writing services or hooks
tac-debug                # When something breaks (root-cause first)
tac-code-review          # Pre-merge or pre-PR
```

### Common commands

```bash
# Quality gates (run before every commit)
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate

# Alert-rule lint (no token, no network — CI gate runs this too)
node scripts/sentry/lint-alert-rules.mjs

# Cross-package tag-contract sentinel
pnpm vitest run apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts

# Sentinel for the BLOCK-site captureRbacDenial adoption (PR #114)
pnpm vitest run apps/dashboard/__tests__/rbac-block-adoption.test.ts

# Sentinel for the API-route pino migration (PR #117)
pnpm vitest run apps/dashboard/__tests__/api-routes-no-console.test.ts

# Service adoption tests
pnpm vitest run packages/services/src/__tests__/services-rpc-adoption.test.ts
pnpm vitest run packages/services/src/__tests__/with-rpc.test.ts
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts

# Owner-runnable Sentry provisioning (NEVER in agent transcript)
SENTRY_AUTH_TOKEN=<token> node scripts/sentry/create-alert-rules.mjs --dry-run
# To provision rule 6 (owner-targeted):
SENTRY_AUTH_TOKEN=<token> SENTRY_ALERT_NOTIFICATION_ACTION='<json>' node scripts/sentry/create-alert-rules.mjs

# Synthetic event for rule verification (after provisioning)
curl -X POST https://<host>/api/diagnostics/sentry
```

### Key file locations

```
# Roadmap + planning
docs/SESSION-RETRO-2026-05-15.md                      # May-15 CI-hardening retro
docs/retros/2026-05-15-pm-sentry-track.md             # PR #111 retro
docs/retros/2026-05-15-pm-instrumentation-track.md    # PR #113 retro
docs/retros/2026-05-15-pm-pr112-adoption.md           # PR #114 retro (campaign PR α)
docs/retros/2026-05-15-pm-campaign-track.md           # Non-stop campaign retro (PRs α–δ)
docs/NEXT-SESSION-HANDOFF.md                          # ← this file
docs/runbooks/sentry-alert-rules.md                   # Sentry alert-rule owner playbook (§ 5.3 is the #94 closure procedure)
docs/audits/2026-05-15-rbac-denial-audit.md           # PHASE A audit — binding contract for adoption

# Sentry observability — packages
packages/auth/src/sentry-tagger.ts                    # DI injector for packages/auth
packages/auth/src/rbac-instrumentation.ts             # captureRbacDenial + RBAC_DENIAL_TAG_KEYS
packages/services/src/shared/sentry-tagger.ts         # DI injector for packages/services
packages/services/src/shared/with-rpc.ts              # withRpc + SUPABASE_RPC_TAG_KEYS
packages/services/src/payment.service.ts              # adopted; partial-coverage payment ops
packages/services/src/{booking,manifest,shipment,rate-card,exception}.service.ts  # all adopted by PR #114
packages/services/src/dashboard.service.ts            # DEFERRED marker at :228 (#115)

# Sentry observability — apps + scripts
apps/dashboard/sentry-wire.ts                         # Wires @sentry/nextjs into both packages
apps/dashboard/sentry.{server,edge,client}.config.ts  # Calls wireWorkspaceSentry after init
apps/dashboard/sentry-init.test.ts                    # SDK init smoke tests (PR #111)
apps/dashboard/lib/logger.ts                          # pino-based structured logger (PR γ / #117)
apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts  # Cross-package contract sentinel
apps/dashboard/__tests__/rbac-block-adoption.test.ts  # BLOCK-site adoption sentinel (PR #114)
apps/dashboard/__tests__/api-routes-no-console.test.ts  # Pino-migration sentinel (PR #117)
scripts/sentry/canonical-rules.mjs                    # 6 canonical rules + EMITTED_TAG_KEYS + PARAMETERIZED_ACTION_SENTINEL
scripts/sentry/create-alert-rules.mjs                 # Owner-runnable provisioning + --dry-run + parameterized action support
scripts/sentry/lint-alert-rules.mjs                   # CI gate (no token, no network)

# Core rules + skills
CLAUDE.md
AGENTS.md
DESIGN_SYSTEM.md
.claude/skills/RESOLVER.md
```

---

## 6. Discipline patterns from this campaign (worth preserving)

### 6.1. Honest scoping at session-start beats per-PR discipline
The campaign prompt named the budget up front ("3-4 sub-items, no more"). The session-level cap kept the campaign from drifting into adjacent #102 items even when they were tractable.

### 6.2. PHASE A audit doc IS the adoption contract
PR α's `docs/audits/2026-05-15-rbac-denial-audit.md` was the single most-leveraged artifact. Reviewers, bots, and future agents all read the same per-line classification.

### 6.3. The bailout fires at PER-LINE granularity
`dashboard.service.ts:228`'s `SENTRY-MIGRATION-DEFERRED` comment is the bailout at a per-call-site level. Leaving an explicit marker + decision tree + follow-up issue is the right tradeoff when the surrounding sweep is otherwise mechanical.

### 6.4. Static-analysis sentinel tests for adoption contracts
Three new sentinel tests this campaign (rbac-block-adoption, api-routes-no-console, canonical-rules-tag-contract extensions). Each uses file-text grep to pin the adoption pattern without heavyweight integration mocks. Document the brittleness tradeoff inline — "if this feels brittle, replace with integration; never soften."

### 6.5. CodeRabbit findings are signal, not friction
PR δ shipped with 2 Major findings; both legitimate. Fix carefully + reply on each thread + push the fix. Don't dismiss bot findings as noise — they catch real things the agent missed.

### 6.6. The merge-phrase classifier is the system
Every merge required the owner to type `merge PR #N` exactly. Indirect phrasing blocked. Third campaign where this safety has mattered — lean into the friction.

---

## 7. The honest read

Two-and-a-half observability arcs landed today:
- Morning: CI-hardening floor (audit gate, vuln cleanup, Dependabot).
- Mid-day: Sentry harness + canonical rules + cross-package contract (#111, #113).
- This campaign: broad adoption + parameterized rule 6 + pino + payment.service test floor.

The next session opens on a substantially stronger foundation. The on-call engineer at 2 AM now has:
- Six load-bearing CI gates protecting every merge
- Six canonical Sentry alert rules wired to real source-code emissions
- Structured JSON logs from every migrated API route
- A documented owner runbook for live alert-rule provisioning
- A financial-service test floor that pins the RLS-fallback regression contract

Future product work (Phase 4c manifest, Phase 4d invoice, the cosmetic followups) inherits all of this. Zero pixels moved today, but the next 6 months of features ship on top of the substrate the day's work built.

---

**You've got the map. Load the skills. Pick a task from § 4. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff. The discipline carries forward by hand, every time.
