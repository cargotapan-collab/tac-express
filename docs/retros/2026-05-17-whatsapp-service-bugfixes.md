# Retro — whatsapp.service.ts bugfixes #139 + #140

**Date:** 2026-05-17
**Author:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer.
**Base:** main at `1d4a5cf` (post-#147 manifest test floor).
**Branch:** `fix/whatsapp-service-bugs-139-140`
**Tests:** 712 → 712 (no count change — three pre-existing tests FLIPPED from buggy-behavior pins to regression checks).
**Scope verdict:** ONE PR; bailout did not fire. Two bugs, two commits, two independent reverts.

---

## 1. TL;DR

- Closed [#139](https://github.com/cargotapan-collab/tac-express/issues/139) and [#140](https://github.com/cargotapan-collab/tac-express/issues/140) — both small source bugs in `packages/services/src/whatsapp.service.ts` filed as follow-ups from PR #138's test floor.
- ~30 LoC net source change across the two fixes; the bulk of the diff is the three test flips (pre-existing tests that pinned the buggy behavior).
- Source diff is **minimal**: zero opportunistic refactors. No third bug was fixed (no third bug surfaced).
- `whatsapp-tracked.service.ts` (PR #141 wrapper) untouched — consistency verified, no source change needed.
- The brief's per-commit split discipline held: commit 1 = #139, commit 2 = #140. Each commit is independently revertable.

---

## 2. PHASE-A BUG ANALYSIS — both bugs

### #139 — WAMID-null redundant form-encoded fetch

| Element | Detail |
|---|---|
| **Buggy site** | `createWhatsAppService.postSmart` shouldFallback decision (`status === 200` branch) — combined with `attemptPost`'s WAMID-null branch returning `status: res.status` (= 200) |
| **Mechanism** | Two semantically-different "HTTP 200 + error body" cases collapsed into one fallback decision: (a) `200 + parseable error envelope from PHP backend not parsing JSON` (fallback to form-encoded makes sense — different body format may parse), and (b) `200 + status:"success" + message_wamid:null` (WhatsApp semantically rejected the send — body parsed cleanly; retrying as form-encoded just produces the same rejection AND a redundant outbound API call per silent rejection). Pre-fix, every WAMID-null cost 2 fetches. |
| **Fix layer** | New optional `semanticFailure?: boolean` on the `WhatsAppResult` failure variant. `attemptPost`'s WAMID-null branch sets it true. `postSmart` short-circuits on the flag BEFORE computing `shouldFallback`. |
| **Why not a regex/string check on the error message** | Fragile — string-matching on error prose silently breaks when wording changes. Discriminated marker is the same shape as catalog #8 (use the type system, not string parsing). |
| **Test** | Two pre-existing tests in `WAMID-null silent-rejection guard` describe were flipped — they previously pinned `attemptedFormats: ["json", "form"]` + `toHaveBeenCalledTimes(2)` (the bug). Flipped to `["json"]` + `toHaveBeenCalledTimes(1)` + `semanticFailure: true`. A regression that re-introduces the fallback fires `mockFetchSequence`'s fail-loud exhaustion assertion. Single mock response replaces the pre-fix two-response fixture. |
| **Network-error fallback preservation** | The `status === 0` branch of shouldFallback still fires on transport failures (untouched). Pinned by the pre-existing test at `network error (status undefined / 0) DOES trigger form fallback per shouldFallback decision tree`. |

### #140 — Empty-string `WPBOX_BASE_URL` produces relative fetch URLs

| Element | Detail |
|---|---|
| **Buggy site** | `createWhatsAppService` line resolving `baseUrl`: `(config.baseUrl ?? "https://chat.leminai.com")` |
| **Mechanism** | `??` only coalesces null/undefined. When `WPBOX_BASE_URL=""` (legitimately possible in misconfigured prod env) → `config.baseUrl` is `""` → `??` passes it through → `baseUrl` is `""` → `fetch(`${baseUrl}${path}`)` builds relative URLs (e.g., `/api/wpbox/sendmessage`). Node's fetch rejects non-absolute URLs in production. |
| **Fix layer** | `createWhatsAppService` (the consumer), NOT `getWhatsAppConfig` (the env reader). One-token change: `??` → `\|\|`. `baseUrl` is `string \| undefined`; the only falsy strings are `""` (the case we want to coalesce) and `undefined` (already covered), so `\|\|` is safe — no other falsy value can legitimately be a base URL. |
| **Why consumer layer, not config layer** | Keeps `WhatsAppConfig` honest — `baseUrl?: string` keeps its declarative meaning ("if empty or undefined, the consumer treats it as missing"). Pushing the normalization into `getWhatsAppConfig` couples env semantics to a runtime default and obscures the type contract. Also: any other caller passing `{baseUrl: ""}` explicitly (tests, scripts) gets the correct behavior automatically. |
| **Test** | Pre-existing LATENT bug-doc test (`LATENT BUG: empty-string baseUrl propagates to relative fetch URL`) flipped to a regression check (`empty-string baseUrl resolves to the default WPBox base URL (#140 regression check)`). Assertion went from `expect(url).toBe("/api/wpbox/sendmessage")` to `expect(url).toBe("https://chat.leminai.com/api/wpbox/sendmessage")`. |

### Tracking-consistency check (#141 wrapper)

The whatsapp-tracked.service wrapper (PR #141) treats `result.ok=false` as a failed delivery row and writes `result.error` to `error_message`. Pre-fix, the wrapper's `Row 2: WAMID-null silent rejection` test was passing for the **wrong reason** — the redundant second fetch hit `mockFetchSequence`'s exhaustion guard, the form attempt's fetch-throw was caught by `attemptPost` and returned as `Network error: mockFetchSequence exhausted...`, and *that* error string (not the WAMID-null message) ended up as `error_message`. Post-#139, the single fetch + WAMID-null detection produces the original `WhatsApp rejected (message_wamid: null)...` error which the wrapper now correctly stores. The wrapper test passes either way (`status='failed'` is the load-bearing assertion); no wrapper source or test change was needed, but the diagnostic is recorded here so a future maintainer doesn't repeat the "passes for wrong reason" pattern.

### Independence check (bailout precondition)

Either commit reverts cleanly without affecting the other:
- Reverting commit 1 (#139): restores the buggy redundant-fallback; the two WAMID-null tests fail back to "fetch called twice". #140 fix unaffected.
- Reverting commit 2 (#140): restores `??` for baseUrl; the LATENT-now-regression test fails back. #139 fix unaffected.

Confirmed pre-implementation. The bailout could have fired along the commit boundary; it didn't because both fixes were small and uncontroversial.

---

## 3. What shipped

| Commit | Surface | LoC |
|---|---|---|
| `dc34981` — #139 | `packages/services/src/whatsapp.service.ts` (4-line postSmart early-return + 1 line on WAMID-null branch + 13 lines of comment/docstring on the `semanticFailure` field), `packages/services/src/__tests__/whatsapp.service.test.ts` (2 tests flipped — comments rewritten, assertions updated, mock fixtures reduced from 2 responses to 1) | +68 / -20 |
| `1d6054c` — #140 | `packages/services/src/whatsapp.service.ts` (1-line source change `??` → `\|\|` + 6 lines of comment), `packages/services/src/__tests__/whatsapp.service.test.ts` (1 LATENT test flipped — title, comments, assertion) | +28 / -19 |

Total PR diff: 4 files, ~96 +/- 39. ~30 LoC net source change; the rest is test-rewrite + comments.

### Test-count delta

712 → 712. No new test cases; three pre-existing tests had their assertions inverted. **This is the correct shape for a bug-fix PR** — the brief explicitly noted "Net test count may grow only slightly (+2 to +5) ... do NOT pad with unrelated cases." Zero new cases is the cleanest extreme of that range: each bug had a pre-existing buggy-behavior pin that becomes a regression check.

---

## 4. Discipline observations

### 4.1 Three "while-I'm-in-this-file" temptations resisted (brief named them all)

1. **Fixing a third bug noticed in-file.** No third bug surfaced. Had one appeared, the discipline was document + file follow-up.
2. **Refactoring `postSmart` / `getWhatsAppConfig` beyond the minimal fix.** Strong pull on `postSmart`'s shouldFallback decision tree (the comment about `status === 200` being "PHP backend likely didn't parse JSON" is conceptually entangled with the new `semanticFailure` path). Resisted — the comment was left adjacent but unchanged; only the new early-return + new optional field shipped.
3. **Expanding into `whatsapp-tracked.service.ts` (PR #141 wrapper) territory.** Strong pull because the wrapper's Row 2 test passes for the wrong reason (§ 2 tracking-consistency note). Resisted — the wrapper test still asserts `status='failed'` post-fix, which is the load-bearing assertion. Tightening Row 2 to also pin "fetch called exactly once" would belong to a wrapper-strengthening PR if anyone wants it; not here.

### 4.2 The two-bug batch held; the per-commit split discipline mattered

The brief's framing was specific: this is NOT a no-bundle violation because (a) same file, (b) both small, (c) both filed as PR #138 follow-ups, (d) low-contention. The per-commit split is the seam — `git revert dc34981` removes only #139; `git revert 1d6054c` removes only #140. The bailout precondition (the fixes are independent) was true; the bailout didn't need to fire.

If a future similar batch comes up (e.g., two small docstring fixes in the same file), the precedent is established here: one-PR is fine when the same-file + follow-up-of-the-same-PR + per-commit-revertability criteria all hold. The discipline is in the COMMIT structure, not the PR count.

### 4.3 The "test pre-existed because PR #138 documented the bug" pattern is gold

PR #138 (the WhatsApp test floor) wrote bug-documenting tests for both #139 and #140 as part of pinning current behavior. When the source got fixed in this PR, those tests broke — exactly the forcing function PR #138's "test-floors-expose-fixable-behavior; don't fix in the test PR" discipline created. The flip is mandatory, not optional. The bug-doc test → regression-check transition is a clean lifecycle:

1. PR #138 (test floor): write a test that asserts the BUG. Title prefixed `LATENT BUG: ...`. File a follow-up issue.
2. PR #X (bug fix): change the source. The LATENT test now fails. Flip its assertion + rename the title to `... regression check`. The test now guards against re-introducing the bug.

This pattern generalizes — any future test floor that finds an obvious bug should follow it. Recorded as a discipline observation in the handoff § 7.

### 4.4 The diagnostic finding (passing-for-wrong-reason) was caught by tracing, not by tests

The whatsapp-tracked.service wrapper's Row 2 test passed under the buggy source because the mock-exhaustion error coincidentally produced `result.ok=false`. The test's load-bearing assertion (`updatePayload.status='failed'`) was correct, just satisfied via the wrong path. This was caught by **mental tracing during PHASE-A**, not by any test failing. Recorded for the next maintainer: a passing test is not the same as a correct test. The pre-existing Row 2 test could have been strengthened to pin `fetchMock.toHaveBeenCalledTimes(1)` — but that's a wrapper-strengthening change, not a #139 fix.

---

## 5. CodeRabbit / Macroscope interactions (TBD until the PR runs)

Both bots cleared first-pass on the last three PRs (#141, #146, #147 — though #147 took one CodeRabbit round on test isolation). The 9-catalog preempts hold for this PR's surface — no new test patterns introduced; the three flips reuse the same `mockFetchSequence` shape that's already been bot-blessed across the floor.

If anything novel surfaces:
- **CodeRabbit** — likely candidates: question whether `semanticFailure` should be on the union or a separate result type; question whether `||` is "too permissive" vs an explicit empty-check. Both decisions are documented in source comments + the PR body — the bot may still flag and we may need to defend.
- **Macroscope** — this is a source-change PR touching a money-flow surface (WhatsApp sends). Expect `Approvability Check` to come back NEUTRAL (correct — human pass required per AGENTS.md § 7a).

---

## 6. CodeRabbit catalog preemption (9 entries)

| # | Entry | Applied? | Where |
|---|---|---|---|
| 1 | Value-contract over call-existence | YES | The flipped tests assert exact `attemptedFormats` array contents + `semanticFailure: true` + the resolved URL string — not bare call-existence. |
| 2 | nthCalledWith + toHaveBeenCalledTimes(N) | YES | `expect(fetchMock).toHaveBeenCalledTimes(1)` on both flipped WAMID-null tests — the exact count IS the regression signal. |
| 3 | statSync isFile | N/A | No filesystem invariants. |
| 4 | Sweep the whole describe block | YES | Both WAMID-null tests in the `WAMID-null silent-rejection guard` describe got the same flip — sibling-test sweep applied. |
| 5 | No hardcoded line numbers in marker comments | YES | All comments reference symbols (`postSmart`, `attemptPost`, `shouldFallback`, `semanticFailure`). |
| 6 | Anchor-scoped windows | N/A | No source-text region sentinels in this PR. |
| 7 | Generalize regex beyond current data shape | N/A | No regex parsing in source changes; assertions are exact-string compares because the URLs are exact-string contracts. |
| 8 | Enum exhaustiveness via satisfies + Exclude | N/A | No new enums; `semanticFailure` is a boolean flag, not an enum. |
| 9 | Abstract on second use | N/A | No new abstractions. The `semanticFailure` flag is a single-call-site marker in source; if a SECOND semantic-failure shape emerges (e.g., a different upstream error class), then `semanticFailure: true` on its return path is the trivial extension — same pattern, no abstraction needed yet. |

---

## 7. Carry-forward

### 7.1 Owner-action carry-forward (unchanged)

- Owner edits `#102` body to point at `docs/backlog/production-readiness.md` as authoritative (from PR #146's retro § 7.1).
- Owner-pending #94 Sentry provisioning (5-min owner task).
- Windows worktree-directory cleanup at `C:/tac/tac-express/tac-whatsapp-sends-102/` (from PR #141's morning cleanup).

### 7.2 Filed-this-session: NOTHING

No new GitHub issues. Zero scope creep.

### 7.3 Future-agent: candidates for the next session (per backlog file rank order)

- **O2** — Cleanup the remaining `as unknown as` cast at `apps/dashboard/app/api/public/invoice-pdf/route.ts` (rank #5; ~30 min standalone).
- **Promote `pnpm test` to a generic CI gate** OR add dedicated gates for the four other existing sentinels (PR #146 retro § 7.3 — completes the #136 forcing-function story).
- **W2 / W3 / W4 / W5** — the four whatsapp_sends follow-ups. W2 (operator retry UI) is the most user-facing.
- **#130 / #131** — small standalone tooling / type-infra. Each is its own session.
- **Wrapper test strengthening** (NEW, optional) — the wrapper's Row 2 test (WAMID-null) currently passes for the right reason post-#139 but doesn't pin fetch-call-count. A small follow-up could tighten it. NOT urgent — the source-side regression check in this PR already guards the underlying behavior. Mention in case anyone notices the asymmetry.

---

## 8. The honest read

A bounded bug-fix session. Two small bugs, two minimal fixes, three pre-existing tests flipped, no source-refactor expansion, no third-bug fix, no wrapper change. The brief's "DO NOT" list ran six items long; all six held.

Test count 712 → 712 (correct for a bug fix). Source diff: ~30 LoC net. Seven gates green locally; the backlog-refs-drift sentinel re-verifies on the PR.

The single most useful diagnostic from this session is § 2's tracking-consistency note: PR #141's wrapper Row 2 was passing for the wrong reason pre-fix. That's recorded for future maintainer pickup, but explicitly NOT acted on here (would be scope creep into the wrapper's test surface).
