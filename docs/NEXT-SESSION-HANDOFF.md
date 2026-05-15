# Next-Session Handoff — Start Here

> **You are picking up TAC Express after the 2026-05-15 Instrumentation-track session.** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last commit on `main`:** post-#113 — `feat(sentry): packages/auth + packages/services Sentry instrumentation`
**Date this doc was written:** 2026-05-15 (Instrumentation-track, third track of the day)
**Author of last session:** Claude Code (Opus 4.7) in PM mode

---

## 0. READ THIS FIRST — five things you must NOT do

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5` (the GBrain four-step gate). Load it as your literal first action of every session.

2. **Do NOT bump dependencies in feature PRs.** The `npm-audit` gate has been load-bearing since #108. Dep bumps belong in their own PR.

3. **Do NOT add Sentry tag keys without updating all four artifacts.** The cross-package contract is enforced by a sentinel test — the four are:
   - The package's tag-key constant (e.g. `RBAC_DENIAL_TAG_KEYS`, `SUPABASE_RPC_TAG_KEYS`)
   - The canonical alert rule's `TaggedEventFilter.key` in `scripts/sentry/canonical-rules.mjs`
   - `EMITTED_TAG_KEYS` in the same file
   - The sentinel test at `apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts`
   Drift in any one fails the sentinel + the `alert-rule-lint` CI gate.

4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** The script needs `SENTRY_AUTH_TOKEN` and the token must NOT enter the agent transcript. Owner runs it locally. Agents may inspect with `--dry-run` only if the token is already in local env.

5. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** The classifier requires the owner to type the literal phrase `merge PR <N>` for each PR.

---

## 1. First 5 minutes — mandatory ramp

```bash
# 1. Confirm you have the latest main
git checkout main && git pull origin main

# 2. Confirm quality gates pass on a clean main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 286 tests passing (+22 instrumentation tests from this session)

# 3. Confirm the load-bearing audit gate is clean
pnpm audit --prod --audit-level moderate
# Expected: "No known vulnerabilities found"

# 4. Confirm the alert-rule lint passes (5 rules now)
node scripts/sentry/lint-alert-rules.mjs
# Expected: "✓ canonical-rules.mjs is valid (5 rules)."
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

No open PRs at session end. Clean slate.

### Open Issues — short list (full backlog in #102)

| # | Title | Priority | Notes |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Verify + wire Sentry alert-rule notification action | P2 | Script + runbook + 5 canonical rules ship; **owner runs the script** to close the live-action half |
| [#112](https://github.com/cargotapan-collab/tac-express/issues/112) | Adopt withRpc + captureRbacDenial at remaining call sites | P2 | Filed this session as the next-logical-step from #110. Recommended lead task — see § 4 |
| [#25](https://github.com/cargotapan-collab/tac-express/issues/25) | Audit + migrate dialogs/forms to react-hook-form + zod | — | Sprint-scale |
| [#54](https://github.com/cargotapan-collab/tac-express/issues/54) | OpsManagementView role-select + Invite Staff actions | follow-up | Most addressed in #104 |
| [#55–#58](https://github.com/cargotapan-collab/tac-express/issues/55) | Cosmetic follow-ups | follow-up | ~10min each; batchable |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta | ~21 sub-items remain |

**Resolved this session:**
- [#110](https://github.com/cargotapan-collab/tac-express/issues/110) — Sentry instrumentation for Supabase RPC + RBAC denial tags. Helpers shipped; rules 4+5 in `canonical-rules.mjs` are live in CI; one canonical adoption at `payment.service.ts`. Per-call-site adoption tracked as #112.

---

## 3. Critical context (the things that will trip you up)

### 3.1. Cross-package tag-emission contract (NEW this session — load-bearing)

The Sentry observability surface is held together by a cross-package contract enforced at three levels:

| Level | Artifact | Enforcement |
|---|---|---|
| CI gate | `node scripts/sentry/lint-alert-rules.mjs` | Validates rule shape + that every `TaggedEventFilter.key` is in `EMITTED_TAG_KEYS` |
| Vitest sentinel | `apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts` | Asserts that `RBAC_DENIAL_TAG_KEYS` + `SUPABASE_RPC_TAG_KEYS` exports match `EMITTED_TAG_KEYS` + the canonical rules |
| Runbook | `docs/runbooks/sentry-alert-rules.md § 4` | Documents the package → helper → tag-keys → rule mapping for human review |

**To add a new alert rule that filters on a new tag:**

```
1. Add a tag-key constant to the relevant package (e.g. WHATSAPP_DELIVERY_TAG_KEYS)
   in a new instrumentation module. Export from index.ts.
2. Add the helper that emits via emitTaggedException(err, tags) using the constant.
3. Append the rule to scripts/sentry/canonical-rules.mjs with TaggedEventFilter
   referencing the new key.
4. Add the key to EMITTED_TAG_KEYS in the same file.
5. Extend apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts to
   import the new tag-keys constant and assert it appears in EMITTED_TAG_KEYS.
6. Run pnpm test + node scripts/sentry/lint-alert-rules.mjs — both must pass.
```

Skipping any of the four artifacts → the sentinel test fails OR the lint gate fails.

### 3.2. Dependency injection for Sentry across workspace packages

`packages/auth` and `packages/services` do NOT depend on `@sentry/nextjs`. Instead, each package exports `registerSentry(emitter)`. `apps/dashboard/sentry-wire.ts` injects the Sentry SDK at startup (called from `sentry.{server,edge,client}.config.ts` after `Sentry.init`). Apps without Sentry (apps/web) silently no-op.

If you need to add another instrumentation backend (Datadog, OTLP, audit table): edit `apps/dashboard/sentry-wire.ts`. The package side stays Sentry-agnostic.

### 3.3. The runner is owner-only; the linter is the only CI Sentry-touching artifact

`scripts/sentry/create-alert-rules.mjs` needs `SENTRY_AUTH_TOKEN` (`project:write`). It MUST NOT enter the agent transcript or any CI workflow. Owner runs locally, one-time after the canonical rules change.

`scripts/sentry/lint-alert-rules.mjs` makes ZERO network calls and requires NO token. Wired as a CI gate in `architecture-gates.yml`.

### 3.4. Six CI gates load-bearing on main (unchanged from #111)

| Job | What it checks |
|---|---|
| `registry-check` | `@tac` shadcn registry in sync with sources |
| `governance` | LAW 2 / LAW 8 / design-system specifics |
| `migrations-fresh-apply` | `supabase db reset` succeeds |
| `npm-audit` | Zero moderate-or-above vulns in production deps |
| `alert-rule-lint` | `canonical-rules.mjs` structure + tagged_event key coverage |
| `bundle-size` | `apps/dashboard/.bundle-budget.json` honored |

### 3.5. The handoff doc is a snapshot, not a contract (lesson from prior session)

Always re-verify with `gh issue view <N>` before committing to claims about issue state. The May-15 CI-hardening handoff claimed #22 was open; it was already CLOSED. Update this doc aggressively at session close — stale handoffs are misinformation.

---

## 4. Your first task — recommended

### Option A — Close #112 (adopt withRpc + captureRbacDenial at remaining call sites) (~1 focused session) RECOMMENDED

The natural close to this session's bailout. The helpers + rules + contract are shipped; the missing piece is migrating the call sites. Splittable into two PRs if you want narrower scope.

```
1. Load skills: tac-express-onboarding → tac-debug (instrumentation is observability)
2. packages/services migration (6 service files):
   - For each of manifest.service, shipment.service, booking.service,
     rate-card.service, exception.service, dashboard.service:
     - Find every db.rpc("x", args) call site
     - Replace with withRpc("x", () => db.rpc("x", args))
     - If the file has a fallback branch (like payment.service's issue-#9
       path), use captureSupabaseRpcError selectively on the real-error branch
   - Existing service tests should still pass — withRpc preserves the {data, error} shape
3. packages/auth call-site adoption (audit + adopt):
   - Grep for canAccess|canDo across apps/dashboard
   - For each call site that 403s/redirects on false: replace with
     `throw captureRbacDenial({ requiredRole, actualRole, surface })`
   - Skip UI conditional rendering (use-rbac.ts consumers) — not page-worthy
4. Owner runs the synthetic-event recipes in docs/runbooks/sentry-alert-rules.md
   § 5.1 + § 5.2 in a deploy preview to confirm rules 4 + 5 actually fire
5. Open PR — should be ~300-500 LoC; can split as two PRs if needed
```

Why this is the right next task:
- Closes #112 + makes alert rules 4 + 5 actually fire (currently dead until adoption)
- After this lands, owner runs the provisioning script + verifies live, and #94 closes
- Mechanical adoption with clear precedent at `payment.service.ts` + `captureRbacDenial` test patterns

### Option B — Payment service test floor (~1 focused session)

`packages/services/src/payment.service.ts` is high-risk (money flows) with limited coverage. PR #106 established the pattern; PR #113 added Sentry instrumentation. Now add the test floor.

### Option C — Cosmetic follow-ups (#54–#58) (~1 hour, batchable)

Five small UI items. Good warm-up session.

### Option D — Start NextAdmin Phase 4c (~one focused session)

Same template as Phase 4b. Use PR #82 as the reference.

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

# Cross-package tag-contract sentinel (verifies emit-keys + rules are aligned)
pnpm vitest run apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts

# Owner-runnable Sentry provisioning (NEVER in agent transcript)
SENTRY_AUTH_TOKEN=<token> node scripts/sentry/create-alert-rules.mjs --dry-run
SENTRY_AUTH_TOKEN=<token> node scripts/sentry/create-alert-rules.mjs

# Synthetic event for rule verification (after provisioning)
curl -X POST https://<host>/api/diagnostics/sentry
```

### Key file locations

```
# Roadmap + planning
docs/SESSION-RETRO-2026-05-15.md                    # May-15 CI-hardening retro
docs/retros/2026-05-15-pm-sentry-track.md           # PR #111 retro
docs/retros/2026-05-15-pm-instrumentation-track.md  # PR #113 retro (this session)
docs/NEXT-SESSION-HANDOFF.md                        # ← this file
docs/runbooks/sentry-alert-rules.md                 # Sentry alert-rule owner playbook

# Sentry observability — packages
packages/auth/src/sentry-tagger.ts                  # DI injector for packages/auth
packages/auth/src/rbac-instrumentation.ts           # captureRbacDenial + RBAC_DENIAL_TAG_KEYS
packages/services/src/shared/sentry-tagger.ts       # DI injector for packages/services
packages/services/src/shared/with-rpc.ts            # withRpc + SUPABASE_RPC_TAG_KEYS
packages/services/src/payment.service.ts            # First canonical adoption site

# Sentry observability — apps + scripts
apps/dashboard/sentry-wire.ts                       # Wires @sentry/nextjs into both packages
apps/dashboard/sentry.{server,edge,client}.config.ts # Calls wireWorkspaceSentry after init
apps/dashboard/sentry-init.test.ts                  # 12-case SDK init smoke test
apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts  # Cross-package contract sentinel
scripts/sentry/canonical-rules.mjs                  # 5 canonical rules + EMITTED_TAG_KEYS
scripts/sentry/create-alert-rules.mjs               # Owner-runnable provisioning + --dry-run
scripts/sentry/lint-alert-rules.mjs                 # CI gate (no token, no network)

# Core rules + skills
CLAUDE.md
AGENTS.md
DESIGN_SYSTEM.md
.claude/skills/RESOLVER.md
```

---

## 6. The discipline patterns that worked this session

### 6.1. The bailout (third use of the pattern)

The PR shipped helpers + ONE canonical adoption. Migrating all 7 service files + auditing all 15+ RBAC call sites would have pushed the diff past 1500 LoC and forced the bailout anyway. Filed #112 to track the remaining adoption. Same shape as #110 was to #22 (b)+(c): wrapper now, follow-up later.

### 6.2. The cross-package contract sentinel (new pattern)

Three artifacts (package emission, canonical rule, EMITTED_TAG_KEYS) share string constants but can't be DRYed across the JS / Markdown / YAML boundary. The sentinel test imports from all three and asserts equality. Definition-correctness gate, third of its kind in this repo.

### 6.3. Dependency injection over peerDependency / direct import (new pattern)

Workspace packages don't import @sentry/nextjs. apps/dashboard injects via `registerSentry`. apps/web silently no-ops. Future backends (Datadog, audit table) plug in by editing the injector, not the packages.

---

## 7. The honest read

The Sentry observability floor is structurally complete after this PR:

- DSN wired + tested (PR #111)
- Owner runbook with dry-run + idempotency + rollback (PR #111)
- 5 canonical alert rules covering production errors, payment-response-lost, volume spike, Supabase RPC failures, RBAC denial spike (PR #105 + #111 + #113)
- Cross-package tag-contract enforced by CI lint + vitest sentinel (PR #113)
- Helpers in packages/auth + packages/services with one canonical adoption each (PR #113)

What's still operationally pending:
- Per-call-site adoption (tracked as #112)
- Owner one-time live provisioning + synthetic-event verification (tracked as #94)

**This remains a logistics company web app.** The on-call engineer at 2 AM now has a runbook, a CI-enforced contract, and a five-alert coverage map. The helpers are the rails; the next session lays the cars on them.

---

**You've got the map. Load the skills. Pick a task from § 4. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff for the session after you. The discipline carries forward by hand, every time.
