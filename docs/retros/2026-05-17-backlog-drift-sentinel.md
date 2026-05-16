# Retro — #136 Backlog-drift sentinel: repo-mirror + reference-existence CI gate

**Date:** 2026-05-17
**Author:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer
**Base:** main at `1458486` (post-#141 whatsapp_sends merge).
**Branch:** `feat/136-backlog-drift-sentinel`
**Tests:** 636 → 659 (+23 cases from the new sentinel).
**Scope verdict:** ONE PR, no bailout fired.

---

## 1. TL;DR

- Closes [#136](https://github.com/cargotapan-collab/tac-express/issues/136). The mechanism (repo-mirror + sentinel) was chosen in `docs/audits/2026-05-16-102-revalidation.md § 9`; this PR builds it.
- New authoritative production-readiness backlog file at `docs/backlog/production-readiness.md` (15 items: 1 DONE-dogfood, 2 OPEN-with-refs, 4 NEW-OPEN-pending-refs, 5 OPEN-no-code-refs, 2 WONTFIX, 1 maintenance section).
- New sentinel test at `apps/dashboard/__tests__/backlog-refs-drift.test.ts` (the FIFTH in the family). Parses fenced ```` ```refs ... ``` ```` blocks; verifies `file:`, `symbol:`, `table:`, `rpc:` existence; loud per-item failure messages.
- New CI job `backlog-refs-drift` in `architecture-gates.yml` — narrowly scoped (runs ONLY this one test file) so the failure-message clarity is unambiguous AND we don't quietly promote `pnpm test` to a generic CI gate.
- AGENTS.md updated with the new convention: the backlog file is authoritative, `#102` is a pointer, drift is a CI question.
- The five interlocking PHASE-0 decisions (A–E) are recorded in `docs/decisions/2026-05-17-backlog-drift-sentinel.md`. Each protects against a specific failure mode the brief warned about (re-curation creep, mirror-that-drifts, hardcoded line numbers, scope creep beyond reference-existence).

---

## 2. PHASE-0 decision (A–E) — short form

Full text + interlocks in `docs/decisions/2026-05-17-backlog-drift-sentinel.md`. Compressed:

| # | Question | Decision | Load-bearing reason |
|---|---|---|---|
| **A** | Mirror scope + seed-delta reconciliation | Mirror ALL open items (incl. the 2 WONTFIX rows for searchability); the sentinel only asserts on items carrying `refs`. Apply the two known deltas vs the seed audit doc: whatsapp_sends → DONE (with real refs — first dogfood case); #142/#143/#144/#145 → added as new OPEN items. | The seed audit doc was already STALE within 24 hours of being written — see § 4.1 below. Recording the deltas explicitly preserves the "what changed since the seed" audit trail. |
| **B** | Source of truth | `docs/backlog/production-readiness.md` IS authoritative for the open-item list. `#102`-the-GitHub-issue is a human-facing pointer. | If the repo file is merely a mirror, the original drift problem recurs. Authority must live somewhere the sentinel can read; the only such place is the repo. |
| **C** | Reference format | Fenced ```` ```refs ... ``` ```` block per item; lines are `<kind>: <value>` where `<kind>` ∈ {`file`, `symbol`, `table`, `rpc`}. NO bare line numbers anywhere. Items without code artifacts use the explicit `` `refs: none — not-sentinel-checked (reason)` `` opt-out marker. | Catalog #5 applied (line numbers are exactly the rot pattern `#102` already suffered). Custom mini-format because `js-yaml` would be a new dependency (forbidden). The opt-out marker is what distinguishes "intentionally not asserted on" from "forgot the refs block." |
| **D** | Sentinel boundary | EXISTENCE ONLY. `file:` → `statSync.isFile()`. `symbol: <file>::<name>` → file exists AND contains `<name>` as substring. `table:` → some non-archived migration has the table. `rpc:` → some `packages/` or `supabase/` file calls or defines it. **Does NOT verify done-ness, correctness, types, signatures, or RPC arguments.** | The boundary IS the maintainability contract. Each of the four existing sentinels holds the same discipline (one mechanical check each). Extending to semantic verification leads to per-item rules and an un-maintainable forcing function. |
| **E** | CI wiring | NEW dedicated narrow-name job `backlog-refs-drift` in `architecture-gates.yml`. Runs ONLY the new sentinel via root `pnpm test <path>`. NOT folded into a generic "all unit tests" gate. | **Key finding:** `pnpm test` is NOT a CI gate today — the brief's assumption was wrong. Neither `architecture-gates.yml` nor `e2e.yml` runs vitest. The four existing sentinels run **only locally**. Promoting `pnpm test` to a CI gate is a separate policy decision; this PR does the minimum to make THIS sentinel load-bearing without quietly making every unit test in the repo a merge-blocker. Narrow gate also gives unambiguous failure-message clarity in the PR check list. |

---

## 3. What shipped

| Surface | File(s) | LoC (added) |
|---|---|---|
| PHASE-0 decision doc | `docs/decisions/2026-05-17-backlog-drift-sentinel.md` | 220 |
| Authoritative backlog file | `docs/backlog/production-readiness.md` | 285 |
| Sentinel test (5th in family) | `apps/dashboard/__tests__/backlog-refs-drift.test.ts` | 380 |
| CI gate (job + paths filter entry) | `.github/workflows/architecture-gates.yml` | ~40 net |
| Authoritative-backlog convention | `AGENTS.md` (1 new subsection) | 10 |
| Retro (this file) + handoff replacement | `docs/retros/2026-05-17-backlog-drift-sentinel.md` + `docs/NEXT-SESSION-HANDOFF.md` | ~440 |

Total: ~1,370 LoC. ~70% docs; ~30% code+config.

### Sentinel coverage on PR merge

3 backlog items carry verifiable `refs` today:
- **W1** (whatsapp_sends — DONE dogfood): 5 files, 7 symbols, 1 table = 13 ref-existence assertions.
- **O1** (manifest.service.ts test floor): 2 files, 2 symbols = 4 assertions.
- **O2** (`as unknown as` cast remaining site): 1 file, 1 symbol = 2 assertions.
- Plus 3 structural invariants (format pre-check, dogfood guard, no-silent-skips guard).

Total: 23 test cases. 636 → 659.

The remaining 12 items carry the explicit `refs: none — not-sentinel-checked (reason)` opt-out marker. Each opt-out has a documented reason (work not started; pure documentation task; owner-runnable provisioning; etc.). The "no-silent-skips" structural invariant verifies every item has EITHER refs OR the opt-out marker — a contributor who adds an item without making this decision fails CI.

---

## 4. Discipline observations

### 4.1 The irony: the seed audit doc was stale within 24 hours

The seed for the backlog file is `docs/audits/2026-05-16-102-revalidation.md`, dated yesterday. By the time this PR is being authored:
- whatsapp_sends is no longer GENUINELY-OPEN-AND-REAL — it merged in PR #141 this morning.
- Four new follow-up issues (#142–#145) exist that didn't when the audit doc was written.

So the seed doc was **one day old** and **already required deltas**. That IS the exact failure mode #136 exists to prevent. The PR body's PHASE-0 (A) names this explicitly. The backlog file's existence + the sentinel gating it means: the next time the equivalent of "the seed doc is stale" question is asked, the answer is "what does CI say." The discipline question becomes a tooling question — that's the forcing-function payoff in one sentence.

### 4.2 The brief said `pnpm test` was a CI gate; it isn't

The brief's PHASE-0 (E) said *"the sentinel runs in pnpm test (already a load-bearing gate)."* Grep'ing `.github/workflows/` showed: no workflow runs vitest. The four existing sentinels at `apps/dashboard/__tests__/audit-doc-references.test.ts` / `api-routes-no-console.test.ts` / `rbac-block-adoption.test.ts` and `packages/services/src/__tests__/silent-by-design.test.ts` / `audit-logs-no-update-delete.test.ts` are gated only by the local pre-commit-checklist discipline.

The minimum-blast-radius fix: add a narrow dedicated job that runs ONLY this sentinel. The broader question — should `pnpm test` become a load-bearing CI gate, retroactively promoting all five sentinels (and every other unit test) to merge-blockers? — is its own decision. Filed as a carry-forward (§ 7 below), not bundled.

The narrow-gate choice has a secondary benefit: the PR check list shows `Backlog references drift check ❌` instead of `pnpm test ❌`. A future contributor sees the failure name and immediately knows what to fix.

### 4.3 The "while I'm mirroring the backlog I could also tick items" temptation was resisted

The brief named three smells; the strongest pull was the first — *"while I'm authoring the repo backlog file I could just tick everything that's actually done and re-renounce the stale items"*. That would be re-doing the PR #137 re-validation. Avoided. The backlog file's DONE-BUT-UNTICKED items from the seed audit doc are NOT included in the file — those are an owner-action concern (the `#102`-the-issue tick-state cleanup), not the open-backlog concern this file owns. Conflating them would make the file a worse tool.

### 4.4 The "extend the sentinel to verify done-ness" temptation was resisted

The second named smell. The temptation: have the sentinel check that items marked `**Status:** DONE` are actually merged to main (via blame or git history). That requires either (a) per-item semantic rules (what does "merged" mean for a docs-only item?) or (b) coupling the sentinel to git history (fragile in CI). Avoided. The boundary `EXISTENCE ONLY` is recorded explicitly at the top of the sentinel file's docstring and in PHASE-0 (D). A future agent reading the sentinel will see the boundary statement before considering extending it.

### 4.5 The calendarized-ritual mechanism was not built

The third named smell. The PR #137 re-validation already chose mechanism (b) over mechanism (a) at the audit doc's § 9; building both would be redundant + dilute the forcing function (an opt-in ritual cancels out the mechanical check). Mechanism (a) is mentioned in the decision doc only as "the alternative we rejected."

### 4.6 The sentinel's own code obeys catalog #5/#8/#11

- **#5 (no hardcoded line numbers in marker comments):** the sentinel has zero hardcoded line numbers in its own source. All references are by symbol name (`expect.fail` with the parsed `lineNumber` is a runtime-computed value, not a hardcoded comment).
- **#8 (generalize beyond current data shape):** `KIND_HANDLERS` is a Record-of-handlers; the parser doesn't hardcode the set of valid kinds in its loop. Adding a new kind = one entry. Adding "url:" or "component:" in a future PR doesn't touch the parser.
- **#11 (statSync isFile, not bare existsSync):** every `file:` ref check does both `existsSync` AND `statSync(...).isFile()` — a directory accidentally referenced as a file fails loudly, not silently.

### 4.7 The bug caught during local-gate iteration

First sentinel run found 0 items because the heading regex expected `## ID — Title` but the backlog file uses `### ID — Title` (item headings are level-3; section dividers are level-2). The "dogfood guard" (`at least one item carries a non-empty refs block`) fired immediately — the structural invariant working as intended. Fix was a one-line regex change; tests went to 23/23.

This is a healthy sign: the sentinel-of-the-sentinel guards (catalog #6 equivalent — assert ≥ 1 match) caught a parser bug at test-authoring time. Without them, the sentinel would have silently "passed" with zero items checked — exactly the failure mode the guard exists to prevent.

---

## 5. CodeRabbit / Macroscope interactions (TBD until the PR runs)

To be filled in by the next session's retro if CodeRabbit finds novel patterns. All 9 catalog entries were considered (decision doc § C / § D / sentinel docstring); the applicable ones (#5, #8, #11) are preempted.

If any NEW pattern surfaces, the discipline is: STOP after this PR, update `docs/patterns/coderabbit-catalog.md` as commit 0 of the next session. Do NOT bundle the catalog update into this PR.

---

## 6. Sentinel-family lineage update

| # | Sentinel | Location | Originating PR | What it guards |
|---|---|---|---|---|
| 1 | rbac-block-adoption | `apps/dashboard/__tests__/rbac-block-adoption.test.ts` | PR #114 | Every BLOCK site calls `captureRbacDenial` with a registered surface tag |
| 2 | api-routes-no-console | `apps/dashboard/__tests__/api-routes-no-console.test.ts` | PR #117 | The three pino-migrated routes have zero `console.*` calls |
| 3 | silent-by-design | `packages/services/src/__tests__/silent-by-design.test.ts` | PR #120 | The `SENTRY-SILENT-BY-DESIGN` marker is at the canonical site |
| 4 | audit-doc-references | `apps/dashboard/__tests__/audit-doc-references.test.ts` | PR #121 | The 2026-05-15 RBAC-denial audit doc's file/RPC/route references resolve |
| 4b | audit-logs-no-update-delete | `packages/services/src/__tests__/audit-logs-no-update-delete.test.ts` | PR #133 | No code path UPDATEs or DELETEs `audit_logs` |
| **5** | **backlog-refs-drift** | **`apps/dashboard/__tests__/backlog-refs-drift.test.ts`** | **PR #<TBD> (this PR)** | **Every code reference in `docs/backlog/production-readiness.md` still resolves on current main** |

#5 is the first sentinel to be CI-gated by its own dedicated workflow job (the prior four run only locally — see § 4.2). #5 is also the first to parse a structured docs format (vs. greps against source files).

---

## 7. Carry-forward (open items + owner actions)

### 7.1 Owner-action carry-forward

| Item | Action |
|---|---|
| `#102` body still has the stale checkbox list + the PR #137 tick-list corrections were never pasted | Owner edits `#102`'s body to: (a) replace the open-item checklist with a one-sentence pointer at `docs/backlog/production-readiness.md` on main; (b) keep the issue OPEN as a permanent home for cross-cutting discussion + historical context. AGENTS.md now documents that the repo file is authoritative; the issue body needs to reflect that. |
| `#94` Sentry alert-rule notification action still pending | 5-min owner action; not agent-runnable. The script side is done (`scripts/sentry/canonical-rules.mjs` + lint-alert-rules.mjs). Owner runs `scripts/sentry/create-alert-rules.mjs` locally with a project:write token. |
| Windows worktree-directory cleanup at `C:/tac/tac-express/tac-whatsapp-sends-102/` | The dir is git-untracked (worktree was removed from git's tracking this morning) but the filesystem dir remains due to the Windows long-path issue with nested node_modules. Cleanup: `rd /s /q \\?\C:\tac\tac-express\tac-whatsapp-sends-102` from cmd.exe (the `\\?\` prefix bypasses the 260-char limit) OR PowerShell `Remove-Item -LiteralPath '\\?\C:\tac\tac-express\tac-whatsapp-sends-102' -Recurse -Force`. The new worktree this session created at `C:/tac/tw136` uses a short path explicitly to avoid recurring this issue. |

### 7.2 Filed-this-session: NOTHING (zero scope creep)

No new GitHub issues filed this session. Every adjacent surface that was tempting to expand into (re-curation, semantic verification, ritual mechanism, promoting `pnpm test` to a generic CI gate) was resisted. The single new convention is in AGENTS.md.

### 7.3 Future agent: the `pnpm test` promotion decision (NOT this PR)

The four existing sentinels (rbac-block-adoption / api-routes-no-console / silent-by-design / audit-doc-references / audit-logs-no-update-delete) run only locally today. The discipline is "developers run `pnpm test` before commit." That works as long as the discipline holds.

A future PR could promote `pnpm test` to a generic CI gate via a job in `architecture-gates.yml` that runs `pnpm test` (similar to the new `backlog-refs-drift` job but covering everything). Pros: every sentinel + every unit test becomes a merge-blocker. Cons: ~3-5 min added to every PR's CI; every flaky test becomes a recurring merge-blocker; the policy implication is larger than this PR can responsibly make.

That decision belongs in its own session. Not bundled.

### 7.4 Future agent: the application-layer immutability sentinel for `whatsapp_sends` (#145)

Distinct from THIS sentinel. `#145` polices the WRAPPER allow-list ("no INSERT/UPDATE on `whatsapp_sends` outside `packages/services/src/whatsapp-tracked.service.ts`"). This PR's #136 sentinel polices the BACKLOG file. Both are forcing functions; they protect different invariants. Do not conflate them.

---

## 8. The honest read

This session built infrastructure that costs ~3 minutes of CI per PR for the rest of the project's life and makes one entire class of failure (backlog references pointing at code that no longer exists) mechanically impossible. The 24-hour staleness of the seed audit doc — the exact failure mode being engineered against — provided the validating real-world example, mid-session. The decision-doc-first discipline produced a sentinel where the scope boundary is recorded at the top of every relevant file (`EXISTENCE only`, never done-ness), so the next agent who's tempted to extend it has the rule in their face.

PR diff: ~1,370 LoC across 6 files; 70% docs, 30% code+config. Tests 636 → 659 (+23). Zero new dependencies. Zero items in the master backlog re-curated. Six gates green locally; the seventh (the new `backlog-refs-drift` job itself) self-validates on this same PR — meta-validation, as the brief required.
