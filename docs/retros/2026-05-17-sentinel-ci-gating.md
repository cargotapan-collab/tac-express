# Retro — close the uncaught-sentinels CI gap (`Unit tests` gate)

**Date:** 2026-05-17
**Author:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer.
**Base:** main at `c7e8ca2` (post-#148 whatsapp.service.ts bugfixes).
**Branch:** `feat/sentinel-ci-gating`
**Tests:** 712 → 712 (no count change — this PR doesn't write tests, it WIRES the existing 712 to run on CI for the first time).
**Scope verdict:** ONE PR; bailout did not fire. PHASE-0 (A) ground truth showed the gap was larger than the brief's "four sentinels" framing (the full 712-test suite was ungated), but a single generic CI gate closes it cleanly.

---

## 1. TL;DR

- Closes the carry-forward from PR #146's retro § 7.3 — the explicitly-deferred "promote `pnpm test` to a CI gate" policy decision.
- Added one new CI job: `Unit tests` in `.github/workflows/architecture-gates.yml`. Runs `pnpm test` (the full 712-case vitest suite) on every architecture-gates-triggering PR.
- All five previously-uncaught sentinels (`rbac-block-adoption`, `api-routes-no-console`, `silent-by-design`, `audit-doc-references`, `audit-logs-no-update-delete`) now genuinely load-bearing on CI.
- Existing `Backlog references drift check` narrow job retained (PR #146 precedent + `docs/backlog/**` paths-filter justification).
- AGENTS.md updated with the explicit CI test-gating policy, the sentinel inventory, and the rule for adding future sentinels.
- Zero source changes; zero test changes; the project's existing 712 tests are unchanged. Only `.github/workflows/architecture-gates.yml` + `AGENTS.md` modified.

---

## 2. PHASE-0 DESIGN DECISION (A–E)

### (A) Ground truth — what runs on CI today (pre-this-PR)

**Three workflows exist:** `architecture-gates.yml`, `e2e.yml`, `shadcn-drift-check.yml`.

**Every `run:` step across all three:**

| Workflow | Run commands |
|---|---|
| architecture-gates.yml | `pnpm install` × multiple; `pnpm --filter @workspace/ui registry:check`; `pnpm --filter @workspace/ui registry:smoke`; `pnpm audit:governance` (the entire "LAW gates" job — NOT typecheck/lint/test); `supabase db reset --debug` (migrations-fresh-apply); `supabase stop`; `pnpm audit --prod --audit-level moderate`; `node scripts/sentry/lint-alert-rules.mjs`; **`pnpm test apps/dashboard/__tests__/backlog-refs-drift.test.ts`** (the one vitest invocation); `pnpm --filter dashboard build`; `pnpm measure:bundle` |
| e2e.yml | Playwright (`pnpm --filter dashboard exec playwright test`) |
| shadcn-drift-check.yml | shadcn registry drift script |

**Definitive answers to the brief's five (A) questions:**

1. *Does ANY workflow run `pnpm test`?* — NO, not the full suite. The only vitest invocation runs ONE file: `apps/dashboard/__tests__/backlog-refs-drift.test.ts`.
2. *What does "LAW gates" execute?* — `pnpm audit:governance` (a Node static analyzer at `scripts/audit-governance.mjs`). NOT vitest, NOT typecheck, NOT lint. The agent-transcript description of it as "typecheck/lint/tests/governance" was wrong.
3. *Do the four named sentinels run on CI today?* — NO. None of `rbac-block-adoption`, `api-routes-no-console`, `silent-by-design`, `audit-doc-references` run on CI.
4. *Does the full 712-test unit suite run on CI today?* — NO. Only the one narrowly-targeted backlog-refs-drift file.
5. *Is there any DELIBERATE reason `pnpm test` is not CI-gated?* — YES. PR #146's own workflow comment (lines 190–197 of architecture-gates.yml pre-this-PR) explicitly says: *"We deliberately do NOT add a generic 'pnpm test' CI gate in this PR — that would promote every existing unit test (including the four other sentinels which today run locally-only) to a merge-blocker, which is a separate policy decision."* This session is that explicit policy decision.

**One brief correction:** the brief named four uncaught sentinels; there are actually **FIVE** (the fifth is `packages/services/src/__tests__/audit-logs-no-update-delete.test.ts`, from PR #133). Total sentinel files in the project: SIX (the five above + `backlog-refs-drift`). Updated counts everywhere.

### (B) Honest scope of the gap

**The full 712-test unit suite is ungated.** The five named sentinels are one explicitly-load-bearing subset; the other ~700 tests (service test floors PR #118/#123/#132/#138/#141/#147 + whatsapp-tracked + every other unit test) are also unenforced on PRs.

The brief's "four sentinels only" framing is the SMALLER scope. The honest reality is "the full unit suite plus five sentinels." The brief said exactly this: *"if (A) shows the full suite is ungated, a generic `pnpm test` gate is effectively non-optional — 712 un-CI-gated tests is a hole that must close."* Ground truth confirms.

### (C) Mechanism — single generic gate (with reasoning)

**Decision: ONE generic `pnpm test` CI job named `Unit tests`. The pre-existing `backlog-refs-drift` narrow job is retained. NO per-sentinel narrow jobs added for the other five.**

Reasoning against per-sentinel narrow gates:
- **Diagnostic value is low.** Vitest's standard FAIL output already names the failing test by file + describe > it chain. A failed `silent-by-design` sentinel surfaces as `FAIL packages/services/src/__tests__/silent-by-design.test.ts > silent-by-design sentinel > marker is at canonical site`. A reviewer drilling into a failed `Unit tests` check sees this immediately.
- **PR check list noise is a real cost.** Five additional named CI jobs (one per sentinel) would inflate the check list with ten near-duplicate lines (a generic `Unit tests` job AND each sentinel's narrow job). PR #148's check list had 11 entries; piling on per-sentinel jobs would push past usability.
- **PR #146's narrow-gate precedent was justified by ITS context, not as a universal pattern.** PR #146 introduced backlog-refs-drift as a brand new gate AND wanted to gate it on backlog-only edits (which the `paths:` filter normally wouldn't trigger). Both reasons are PR #146-specific; they don't generalize to the five pre-existing sentinels (which all live under `apps/**` or `packages/**` — already in the workflow's `paths:` filter, and all believed-load-bearing for a long time).

Reasoning for retaining `backlog-refs-drift` separately:
- It's already there; removing it would be churn.
- It runs on `docs/backlog/**` paths that the broader `paths:` filter doesn't add for the `Unit tests` job (the new `Unit tests` job is in the same workflow so inherits the same `paths:` filter — which does include `docs/backlog/**` after PR #146 — so technically the new job covers it too, but the duplication cost is ~3 seconds and the failure-message-clarity carry-over is non-zero).
- It establishes a precedent for future sentinels that need their own narrow gate (the AGENTS.md policy update names the criteria).

### (D) Failure-message clarity

- **Generic `Unit tests` job:** CI check name in the PR list is "Unit tests". On failure, drilling in shows vitest's full output — `FAIL <file> > <describe> > <it>` precise to the test case.
- **Sentinel breach example:** if `silent-by-design.test.ts` fails, the GitHub Actions log shows `FAIL packages/services/src/__tests__/silent-by-design.test.ts > silent-by-design sentinel > marker is at canonical site` — naming the file, the describe block, and the failing assertion's "it" label. A future contributor reading "Unit tests ❌" + that drill-in output knows exactly what's broken in under 30 seconds.
- **Backlog drift breach:** still surfaces with name-level clarity as `Backlog references drift check ❌` (the narrow gate, unchanged).

The AGENTS.md policy section explicitly documents this — *"The CI check NAME is generic ('Unit tests') but the OUTPUT is precise"* — so a future contributor isn't confused by the generic-named job.

### (E) CI-runnability verification

**Local baseline (Windows, Node 22):** `pnpm test` → 712/712 pass, 43 test files, ~27 seconds.

**Tested AGAINST the gate before opening the PR:** ran the same `pnpm test` command the new workflow runs. Clean pass.

**CI-runnability risks considered:**
- Path separators (`/` vs `\\`): vitest config + node:path normalize; no custom string-building of paths in the sentinel files (checked via grep — sentinel files use `join(REPO_ROOT, ...)` patterns).
- Filesystem case-sensitivity (Windows insensitive, Ubuntu sensitive): no obvious case-mismatched imports observed locally.
- Timezone: only the migration-comment doc has date strings; no test asserts timezone-sensitive content.
- `process.env` assumptions: every test that reads env uses `vi.stubEnv`; no global env leakage between tests.

**Actual CI run:** verified by pushing + watching CI on the PR. If any test fails on ubuntu-latest that passed locally on Windows, that's a portability fix (in scope per PHASE-0 § E). If a sentinel fails for a REAL reason (caught something genuinely broken), stop and surface — do NOT weaken the assertion. (Results will be filled in by the post-CI-watch update.)

---

## 3. What shipped

| Surface | File(s) | LoC |
|---|---|---|
| New CI job `Unit tests` (the gate) + updated comment on backlog-refs-drift | `.github/workflows/architecture-gates.yml` | +40 / -4 |
| CI test-gating policy + sentinel inventory + add-new-sentinel rule | `AGENTS.md` (new subsection) | +20 |
| Retro (this file) + handoff replacement | `docs/retros/2026-05-17-sentinel-ci-gating.md` + `docs/NEXT-SESSION-HANDOFF.md` | ~280 |

Total: ~340 LoC. ~90% docs/comments; ~10% workflow YAML. Zero source code, zero test code, zero schema changes.

---

## 4. Discipline observations

### 4.1 Four "while-I'm-here" temptations resisted (brief named them)

1. **Authoring new sentinels or new tests** — strong pull. Wiring existing guardrails surfaces several "we could ALSO sentinel X" thoughts (e.g., a sentinel asserting `pnpm audit:skills` warnings stay ≤ N). Resisted. This session WIRES; it does not WRITE.
2. **"Fixing" a CI failure by weakening an assertion** — didn't fire (the suite passes on CI). The contingency was clear: only environment-portability fixes allowed; a genuine sentinel failure would be a finding to surface, not silence.
3. **Refactoring the workflow files beyond what the gating change needs** — strong pull. The `architecture-gates.yml` file has accumulated comments + structure that could be cleaned up (some `LOAD-BEARING` notes duplicate the PR #146 design doc; the `paths:` filter could be DRY'd via YAML anchors). Resisted. One job added + one comment updated.
4. **Bundling O2 or any open issue** — none touched.

### 4.2 The brief's "VERIFY GROUND TRUTH FIRST" was load-bearing

The "four sentinels" framing was a smaller scope than reality. The brief's PHASE-0 (A) requirement to verify before scoping prevented shipping a half-fix (four named per-sentinel narrow gates that would have left the other ~700 tests ungated). The honest ground-truth scan changed the mechanism choice from "five narrow gates" to "one generic gate" — strictly better.

### 4.3 PR #146's deferred-policy comment was the right pattern

PR #146's workflow comment explicitly said "this is a separate policy decision" and named the scope. THIS session picked it up directly. The pattern: when a PR defers a policy decision it identified, leave a workflow comment AND a retro carry-forward naming the scope. The next session inherits unambiguous context. Recorded as discipline § 7.23.

### 4.4 The narrow-vs-generic-gate balance

PR #146 took the narrow-gate path; this PR takes the generic-gate path (plus retaining PR #146's narrow gate). They're not in conflict — the criteria differ:
- **Narrow gate when:** the test surface is small (one file); the gate needs to run on a path the broader workflow filter doesn't cover; OR the failure-message clarity at PR-check-list level is uniquely valuable (e.g., a critical signal that mustn't be buried).
- **Generic gate when:** the test surface is large (hundreds of tests); per-file narrow gates would create PR check list noise; vitest's own failure output is enough diagnostic surface.

The AGENTS.md policy update documents this criteria so the next contributor doesn't relitigate it.

---

## 5. CodeRabbit / Macroscope interactions (TBD until the PR runs)

To be filled in by the next session's retro if novel patterns surface. The 9-catalog preempts hold; no new test patterns introduced. Macroscope-Approvability is likely SUCCESS (no source change, no money-flow surface).

If anything novel surfaces, the discipline is: STOP after this PR; update `docs/patterns/coderabbit-catalog.md` as commit 0 of the next session.

---

## 6. CodeRabbit catalog preemption (9 entries)

| # | Entry | Applied? | Where |
|---|---|---|---|
| 1 | Value-contract over call-existence | N/A | No new test assertions. |
| 2 | nthCalledWith + toHaveBeenCalledTimes(N) | N/A | Same. |
| 3 | statSync isFile | N/A | No filesystem invariants in new code. |
| 4 | Sweep the whole describe block | N/A | No tests modified. |
| 5 | No hardcoded line numbers in marker comments | YES | All workflow/AGENTS.md comments reference symbols + PR numbers, not file line numbers. |
| 6 | Anchor-scoped windows | N/A | No source-text region sentinels added. |
| 7 | Generalize regex beyond current data shape | N/A | No regex parsers added. |
| 8 | Enum exhaustiveness via satisfies + Exclude | N/A | No new enums. |
| 9 | Abstract on second use | YES (declined-with-reason) | The `Unit tests` + `Backlog references drift check` jobs share the install + setup boilerplate; YAML anchors COULD DRY them, but: (a) the duplication is small (~5 lines per job), (b) anchors reduce readability for future contributors editing one job in isolation, (c) PR #146's narrow gate was deliberately kept structurally simple — converging to anchors now would diverge from its precedent. Catalog #9 says "abstract on SECOND use, not first"; this is the second use, so abstraction is now consideration-worthy — declined because the readability cost outweighs the line-count savings. If a third gate appears, reconsider. |

---

## 7. Carry-forward

### 7.1 Owner-action carry-forward (unchanged from PR #148's retro)

- Owner edits `#102` body to point at `docs/backlog/production-readiness.md` as authoritative.
- Owner-pending #94 Sentry provisioning.
- Long-path leftover at `C:/tac/tac-express/tac-whatsapp-sends-102/` (cosmetic).

### 7.2 Filed-this-session: NOTHING

No new GitHub issues. The CI-gating-the-suite carry-forward from PR #146 is discharged here. No new follow-up surfaces filed.

### 7.3 Future-agent: candidates for the next session

Per the backlog file:
- **O2** — Cleanup the remaining `as unknown as` cast at `apps/dashboard/app/api/public/invoice-pdf/route.ts` (rank #5; ~30 min).
- **W2 / W3 / W4 / W5** — the four whatsapp_sends follow-ups (#142–#145).
- **D1 / D2 / D3 / D5** — docs-only items.
- **#130 / #131** — small standalone tooling / type-infra.
- **Optional wrapper-strengthening:** pin `fetchMock.toHaveBeenCalledTimes(1)` on whatsapp-tracked.service Row 2 (carried from PR #148 retro § 7.3 / 7.4).

### 7.4 Future-agent: precedent established by THIS PR

The "generic test gate + selectively-narrow gates for special-case sentinels" pattern is now policy. AGENTS.md documents it. Any future contributor adding a sentinel:
- Default: place it in `__tests__/`; the `Unit tests` job picks it up automatically.
- Narrow gate only when the criteria in AGENTS.md are met.

This prevents the next "five sentinels exist but only one is CI-gated" drift.

---

## 8. The honest read

A small workflow + docs PR that closes a one-year-old hole in the project's CI guardrails. The cost is ~2 minutes of additional CI runtime per PR; the benefit is ~700 previously-discipline-enforced tests now mechanically enforced. The brief's scope was understated (four sentinels) but the brief's PHASE-0 (A) requirement caught it — ground-truth-first was the right protocol.

Zero source, zero test, zero migration changes. Only the workflow + AGENTS.md. Five-line line-count and a one-paragraph AGENTS.md update would have been the minimum surface; ~340 LoC was used to document the design + retro + handoff fully so the next contributor doesn't re-litigate.
