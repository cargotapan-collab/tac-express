# Session Retro — whatsapp.service.ts test floor

**Date:** 2026-05-16
**Session shape:** fourth substantive Sprint 2 session (post META re-validation PR #137); sixth cadence test
**Predecessor:** PR #137 (META re-validation) — corrected the prior handoff and named this task as the risk-correct lead
**Successor:** likely `whatsapp_sends` audit table (risk-rank #2 per `docs/audits/2026-05-16-102-revalidation.md § 8.2`)

---

## 1. TL;DR

Shipped the whatsapp.service.ts unit-test floor — fourth in the series (payment / invoice / shipment / whatsapp). 47 new cases; tests 556 → 603. Pattern reuse from PRs #118 / #123 / #132 was clean structurally; the deliberate divergence was the mocking surface (HTTP fetch, not Supabase), which PHASE-A named and chose explicitly.

**PHASE-A key call:** the service has no SupabaseClient dependency. The canonical `makeDb` + `makeBuilderSpy` helpers are N/A — there is nothing for them to mock. The actual external boundary is `globalThis.fetch`. Mocking strategy: `vi.stubGlobal("fetch", mockFetchSequence(...))` per test, with `vi.unstubAllGlobals()` in afterEach. Single new helper (`mockFetchSequence`) is inline in the test file — first consumer; extract-on-second-use per catalog entry #9 if a future consumer appears.

**Bailout did not fire.** Initial scope estimate was ~49 cases / ~1000 LoC, right at the upper smell threshold. The actual file landed at 47 cases / 1006 LoC — comfortably within scope. No need to split along the § 8.3 seam.

**One real source-behavior discovery during execution** (documented below, NOT fixed): the WAMID-null silent-rejection branch returns `{ ok: false, status: 200, ... }`, which triggers `postSmart`'s `shouldFallback` (status === 200) and produces a SECOND identical fetch attempt. Production behavior currently makes two API calls when WPBox returns a WAMID-null response. This was my first-iteration test-mock blind spot; correcting the mocks revealed the production cost. Documented in the PR body's PHASE-A audit + a follow-up flag in § 7 below.

---

## 2. PHASE-A audit summary (full version in PR body)

**Method × branch × error matrix:**
- 5 public methods (`sendMessage`, `sendTemplate`, `makeContact`, `getContact`, `getTemplates`)
- 2 private helpers (`postSmart` with JSON↔form fallback, `getJson`)
- 4 pure module-level helpers (`buildHeaderMediaComponent`, `getWhatsAppConfig`, `createWhatsAppServiceFromEnv`, `normalizePhone`)
- 2 internal helpers covered indirectly (`maskToken`, `readErrorMessage`)

**External-call surface map:**
- ALL external WPBox calls go through `globalThis.fetch` via `postSmart`/`attemptPost` (POST endpoints) or `getJson` (GET endpoints).
- NO HTTP-client wrapper module; NO SDK; NO dependency-injection seam.
- Therefore: `vi.stubGlobal("fetch", ...)` is the only minimally-invasive boundary. `mockFetchSequence(...steps)` is a 10-line helper that returns a `vi.Mock` resolving Responses in order (or throwing for network errors). Exhausted-sequence errors loud if the SUT makes an unexpected extra call.

**Bailout-seam pre-call (per § 8.3):**
- Estimated ~49 cases / ~1000 LoC. Threshold from PR #132: 50 cases / 860 LoC.
- LoC was the more conservative bound; estimate landed comfortably below 1500.
- Decision: ONE PR. Split-ready at the natural seam (postSmart/sendMessage/sendTemplate/makeContact on one side; getJson/pure-helpers on the other) IF the file ballooned, but it didn't.

**WhatsApp-API failure modes covered:**
- JSON 4xx with body (triggers form fallback)
- JSON 5xx without body (no fallback — transport problem)
- JSON 200 with app-error envelope (triggers form fallback — PHP-backend signal)
- Network error / fetch throws (status:0, triggers fallback)
- Both attempts failing (final attemptedFormats: ["json","form"])
- Non-JSON body (HTML error page) preserved as raw text
- WAMID-null silent rejection on send endpoints
- WAMID-null pass-through on non-send endpoints (makeContact)
- Various app-error envelope shapes: `{ status: "error" }`, `{ success: false }`, `{ error: "string" }`
- Form-encoded body construction (null/undefined skipped, objects JSON-stringified)

---

## 3. The mocking-strategy decision (the new wrinkle, executed cleanly)

The task brief named this as the genuine new piece of this PR. The decision was straightforward once PHASE-A inventoried the external-call surface:

- The service uses `globalThis.fetch` directly. There's no wrapper module to swap.
- `vi.stubGlobal("fetch", ...)` is the standard vitest pattern; restores cleanly via `vi.unstubAllGlobals()`.
- A single helper `mockFetchSequence(...steps)` keeps each test compact while making mock-exhaustion fail loud — catches the bug shape where the SUT makes more API calls than the test anticipated.
- Console-suppression via `vi.spyOn(console, "log").mockImplementation(() => undefined)` (plus `warn` + `error`) in `beforeEach` — the source intentionally logs request/response for dev debugging, and uncolored test output would be noisy.

What I deliberately did NOT do:
- Did NOT install `msw` or any HTTP-mocking library. The fetch-stub pattern is sufficient; introducing a dependency would have been a framework, not a helper.
- Did NOT mock at the HTTP-client level (there isn't one).
- Did NOT add a fetch-injection seam to the source. Tests-only PR.
- Did NOT use `nock` (Node-specific HTTP interceptor — overkill for this surface and would constrain the runtime).

---

## 4. The fixth cadence test (sixth overall)

Bundle temptations resisted:

1. **`whatsapp_sends` audit table** — the most predictable smell. The service is now tested; the audit table is the obvious next move. Resisted. Filed in `docs/audits/2026-05-16-102-revalidation.md § 8.2` as risk-rank #2; will land in its own session per the cadence rule.

2. **The console-logging cleanup** — the service logs every request + response with the token redacted. Useful in dev, slightly noisy in CI. Resisted touching the source; just spy-suppressed in the test layer. The log behavior is a source decision, not a test concern.

3. **Source-fix temptation** — the WAMID-null fallback finding (see § 7) is a real production-cost issue: two fetch calls per WAMID-null response. The temptation was to add a `WAMID_NULL_NO_FALLBACK` guard in `postSmart`'s `shouldFallback`. Resisted. Documented in the PR body + this retro; if the cost matters in production traffic patterns, a separate PR addresses it with a proper PHASE-0.

---

## 5. CodeRabbit-preempt sweep

| # | Pattern | Applied here |
|---|---|---|
| 1 | Value-contract over call-existence | Every fetch-mock test reads the URL + `init.method` + `init.headers["Content-Type"]` + `init.body` (JSON.parse or URLSearchParams) and asserts shape. No bare `toHaveBeenCalled`. |
| 2 | Multi-step `nthCalledWith` | The JSON→form fallback tests assert `fetchMock.mock.calls[0]` vs `[1]` independently, equivalent shape for multi-step assertion. |
| 3 | `statSync(...).isFile()` | N/A — no file-existence invariants. |
| 4 | Sweep whole describe block | Every WAMID-null test follows the same two-attempt mock shape now (sendMessage + sendTemplate + makeContact-pass-through). Every send-method dispatch test follows the same URL+body assertion shape. |
| 5 | No hardcoded line numbers | All comments reference symbol names (`postSmart`, `shouldFallback`, `attemptPost`, `WAMID-null guard`). |
| 6 | Anchor-scoped windows | N/A — no file-content-scanning assertions in this PR. |
| 7 | Generalize regex | N/A — no regexes. |
| 8 | Enum exhaustiveness | `WhatsAppHeaderMedia.kind` pinned via `satisfies` + `Exclude` at the bottom of `buildHeaderMediaComponent`'s describe block. |
| 9 | Abstract on second use | `mockFetchSequence` and `mockResponse` are inline / single-file — first consumer. If a future test file needs them, extraction triggers. |

---

## 6. Discipline observations

### 6.1. PHASE-A's first-iteration mocking-strategy was right

The task brief flagged the external-integration surface as "the new wrinkle." PHASE-A named the boundary as `globalThis.fetch` immediately upon reading the source — no exploration required. The decision to use `vi.stubGlobal` was bounded by what the source actually does. Same shape as the `makeDb` decision for Supabase services: mock at the boundary the SUT touches; let everything else run as real code.

### 6.2. The exhausted-sequence assertion paid for itself immediately

First-iteration test runs surfaced 3 failures, all flagging `mockFetchSequence exhausted: only 1 step(s) configured, but a 2-th fetch call was made.` The error message named the problem directly — not "expected X to contain Y" — and the debugging path was immediate. If the helper had silently returned `undefined` or a default `{ ok: true }` on exhausted calls, the failures would have surfaced as "assertion mismatch on result.error" with no breadcrumb to "the SUT made an unexpected extra fetch."

### 6.3. SOURCE-BEHAVIOR FINDING — WAMID-null triggers a redundant form-encoded retry

Discovered while fixing the WAMID-null test failures. The flow:
1. JSON attempt returns 200 with `message_wamid: null`
2. `attemptPost` recognizes the silent rejection and returns `{ ok: false, status: 200, error: "...", rawResponse: "..." }`
3. `postSmart`'s `shouldFallback` reads `status === 200` and decides to retry as form-encoded
4. Form-encoded attempt returns the SAME WAMID-null response
5. Final result: form attempt's error, `attemptedFormats: ["json", "form"]`

Production cost: every WAMID-null response causes a redundant second WPBox API call. Not a bug (the form attempt is harmless — WAMID-null is a deterministic upstream rejection, not a transport problem), but unnecessary network traffic + WPBox rate-limit consumption + log volume.

**NOT fixed in this PR** (zero-source-change rule). Recommended follow-up: tighten `shouldFallback` to skip the retry when the JSON attempt's failure was a recognized application-level signal that the form attempt cannot improve (WAMID-null is the canonical case). PHASE-0 would weigh:
- Tag WAMID-null as `noFallback: true` in the result
- vs an explicit branch in `shouldFallback` checking for the WAMID-null error string
- vs leaving the redundancy and documenting it

The first is cleanest. **Decision for THIS PR: document, don't fix.** Filed as a flag below.

### 6.4. The "while I'm here" temptation was strongest on the WAMID-null cost

The fix is mechanical (~5 LoC). It would have been trivial to add. Resisting required restating: the test-floor PR's job is to test what the source DOES. A behavior-change PR has its own PHASE-0 contract. Bundling them would have made the test floor harder to review and made the behavior change harder to audit.

---

## 7. Carry-forward / flags

- **WAMID-null redundant-fallback finding** — needs its own follow-up issue (filed alongside the PR). Cost: 1 extra WPBox API call per silent rejection. Fix scope: ~5 LoC in `postSmart`'s `shouldFallback` branch decision, plus 2-3 test cases pinning the new behavior.

- **whatsapp_sends audit table** is unblocked. The service is now tested; wiring `whatsapp_sends` audit on top of it becomes the known-shape PR PR #133/#135 demonstrated for the other destructive ops. PHASE-0 at that PR's time decides whether to extend `DESTRUCTIVE_OP_REGISTRY` or to introduce a parallel `whatsapp_event_registry` (the events are not strictly destructive — they're external send attempts).

- **Catalog `9 entries` accuracy holds.** No new CodeRabbit-pattern surfaced this session; the 9-entry catalog is still complete.

- **freshWhatsappService factory** — not strictly needed because whatsapp.service.ts has no module-level state to reset. The `freshService()` helper here is a per-test factory that just calls `createWhatsAppService(TEST_CONFIG)`. Future tests can extend the helper if module-level state is added.

---

## 8. Honest read

- **What went well:** PHASE-A's mocking-strategy decision was decisive. The first-iteration test run failed in exactly the way the exhausted-sequence assertion was designed to catch — no debugging hunt. Pattern reuse from PR #132 was structural; the deliberate divergence (no makeDb) was named in PHASE-A and the PR body, not discovered mid-write.
- **What was friction:** my first-iteration WAMID-null mocks supplied only one fetch response. Correcting them surfaced the production-side redundant-retry behavior (§ 6.3). That's information gain, not waste — but the initial mock blind spot is worth noting for the next external-integration test floor session.
- **What I'd flag to the next session:** the WAMID-null follow-up (see § 7) is small and unambiguous; ideal "between bigger items" PR. Risk-correct next lead remains `whatsapp_sends` audit table per the re-validation doc, but the WAMID-null fix is a cleanup-tier item that could pair with another doc-scale PR if/when one materializes — separate session per the cadence rule.

Ready to merge once owner reviews + types `merge PR #<N>`.
