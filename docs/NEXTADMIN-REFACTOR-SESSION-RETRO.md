# NextAdmin Refactor — Session Retro & Handoff

**Session date:** 2026-05-13 → 2026-05-14 (single continuous session)
**Branch line:** `main`
**Baseline tag:** `pre-nextadmin-refactor-v1` @ `38e8848`
**Final commit:** `444482e` (Phase 4a — Form primitives + V7CustomerForm)
**PRs merged this session:** 12 (#59, #60, #61, #62, #63, #64, #65, #66, #67, #68, #69, #70)
**Cumulative diff vs baseline:** ~3,200 LoC added, 53 LoC removed, 18 files created, 11 files modified.

This document closes the session cleanly, captures what worked / what didn't, and hands the next session a clean line to start from.

---

## 1. Executive summary

The NextAdmin-inspired v7 refactor shipped its **safe, reversible foundation**:

- A complete v6 / v7 design-flag system gated by `useDesignVersion()` with a tested SSR-safe initial state.
- Four KPI surfaces and four list surfaces on v7 (Dashboard, Inventory, Finance, Shift Report; Customers, Shipments, Manifests, Rate Cards).
- Phase-1 primitives (`StatCard`, `PageShell` `wide`, design tokens) consolidated.
- Phase-3 list primitive (`DataTableCard`) shipped and used by 4 routes.
- Phase-4 form primitives (`FormCard` / `FormSection` / `FormGrid` / `FormField` / `FormFooter`) shipped and proven with the first consumer (Customer create form).
- A 5-layer rollback playbook with a doomsday git tag, per-PR revert path, per-user flag, deploy-wide flag, and DB-migration recipe (Phase 6 only).
- Two real production-shape bugs caught and fixed via mid-session browser verification (`useDesignVersion` mount-time desync + SSR hydration mismatch root cause).

The session **deliberately stopped before** the four invoice/shipment/manifest wizards (Phase 4b–4d), the global hybrid search (Phase 6), and the visual-baseline regeneration (Phase 7). Reasons in § 4.

---

## 2. What shipped — PR-by-PR

| # | Phase | Subject | Highlights |
|---|---|---|---|
| [#59](https://github.com/cargotapan-collab/tac-express/pull/59) | 1 | feat(ui): NextAdmin refactor Phase 1 — tokens, PageShell wide, StatCard, AdminDesignVersionToggle | 11 spacing tokens, `width="wide"`, `StatCard` with 24 Vitest cases, RBAC-gated admin toggle, `design-flag.ts` + `useDesignVersion()` hook, hardlinks-aware audit allowlist |
| [#60](https://github.com/cargotapan-collab/tac-express/pull/60) | infra | fix(audit): unblock audit:all on pre-existing skill + design-spec failures | Cleared 14 pre-existing audit failures so future PRs don't trip on baseline debt |
| [#61](https://github.com/cargotapan-collab/tac-express/pull/61) | 2a | feat(ui): wire AdminDesignVersionToggle into Settings | Layer-3 rollback toggle lives in Settings → Profile sidebar |
| [#62](https://github.com/cargotapan-collab/tac-express/pull/62) | 2b | feat(ui): V7OpsDashboard reference + flag-gated route branch | First flag-branched route; 4 StatCards (Active / In Transit / Open Exceptions / Next Flight) |
| [#63](https://github.com/cargotapan-collab/tac-express/pull/63) | 2c | feat(ui): V7OpsDashboard chart panels — Growth + Volume + Upcoming | Reused Paper Ops chart primitives in v7 frames; transitional |
| [#64](https://github.com/cargotapan-collab/tac-express/pull/64) | 2d | feat(ui): V7OpsInventory + hydration-safe useDesignVersion | **Root-cause fix:** split `getDefaultDesignVersion()` from `getDesignVersion()` so SSR + initial-client render agree; per-user override applies post-mount. Eliminates the Next.js "Hydration failed" overlay |
| [#65](https://github.com/cargotapan-collab/tac-express/pull/65) | 2e+2f | feat(ui): V7OpsFinance + Shift Report PageShell wrap | V7 Finance: 4 KPIs + Aging Breakdown + Recent Invoices. Shift Report: flag-gated PageShell width |
| [#66](https://github.com/cargotapan-collab/tac-express/pull/66) | 3a | feat(ui): DataTableCard + V7OpsCustomers | `DataTableCard` primitive (header/body/footer slots) + first consumer (Customers list) |
| [#67](https://github.com/cargotapan-collab/tac-express/pull/67) | 3b | feat(ui): V7OpsShipments via DataTableCard | 7-column shipment list; search by AWB |
| [#68](https://github.com/cargotapan-collab/tac-express/pull/68) | 3c | feat(ui): V7OpsManifests via DataTableCard | 6-column manifest list; search by manifest # |
| [#69](https://github.com/cargotapan-collab/tac-express/pull/69) | 3d | feat(ui): V7OpsRateCards via DataTableCard | 7-column rate cards list; search by route |
| [#70](https://github.com/cargotapan-collab/tac-express/pull/70) | 4a | feat(ui): Form primitives + V7CustomerForm | `FormCard` / `FormSection` / `FormGrid` / `FormField` / `FormFooter` + first consumer (Customer create) |

### v7 route coverage on `main` at session end

| Route | v6 (default) | v7 (`tac-design=v7`) |
|---|---|---|
| `/ops-console` | Paper Ops Console | PageShell wide + 4 StatCards + 3 chart panels |
| `/ops-console/inventory` | Paper Ops Console | PageShell wide + 4 KPI StatCards + hub-card grid |
| `/ops-console/finance` | Paper Ops Console | PageShell wide + 4 StatCards + Aging Breakdown + Recent Invoices |
| `/ops-console/shift-report` | existing (PageShell content) | existing (PageShell wide) |
| `/ops-console/customers` | Paper Ops Console list | PageShell wide + DataTableCard + 7-column TanStack table |
| `/ops-console/customers/create` | OpsCustomerForm | V7CustomerForm (Form primitives) |
| `/ops-console/shipments` | Paper Ops Console list | PageShell wide + DataTableCard + 7-column table |
| `/ops-console/manifests` | Paper Ops Console list | PageShell wide + DataTableCard + 6-column table |
| `/ops-console/rates` | Paper Ops Console list | PageShell wide + DataTableCard + 7-column table |
| `/ops-console/settings` | Paper Ops Console; admin sees design-version toggle | (unchanged — admin toggle visible in both) |
| **Everything else** | unchanged in both | falls through to v6 |

---

## 3. Pending work — what's NOT done

| Phase | Scope | Status |
|---|---|---|
| **4b** — New Shipment wizard | Multi-step form, draft persistence, rate calc, address validation | Pending — Form primitives ready |
| **4c** — New Manifest wizard | Multi-step, manifest-building flow | Pending — Form primitives ready |
| **4d** — New Invoice wizard | Multi-step with PII + financial state, draft persistence (IndexedDB) | Pending — **highest-risk surface** |
| **5** — Chart-component v7 redesign | Paper labels → `.t-overline`, paper-violet → primary on `OpsGrowthAreaChart` / `OpsVolumeBarChart` / `OpsUpcomingCalendar` | Pending — cosmetic, low priority |
| **6** — Global hybrid search | Postgres FTS, pgvector, HNSW indexes, embedding pipeline, `global_search` RPC, GlobalSearch UI | **Paused — user authorization required** for DB migrations + external embedding API + customer PII |
| **7** — V7 visual baselines | Playwright `@visual` baselines for the 4 v7 routes | Pending — mechanical post-stabilization |

### Why the wizards aren't done

Each wizard is a **stateful, business-critical surface**: multi-step navigation, localStorage / IndexedDB draft persistence, cross-field validation, address autocomplete, rate calculation, attachment uploads. **Skipping per-wizard browser verification would risk silently corrupting customer-facing flows** — particularly the invoice wizard, which handles real PII + financial state.

This is a different risk class than the list migrations, which the session intentionally bulk-applied without per-route browser verification because the changes were presentational only. The right pattern for wizards is one-per-PR with end-to-end browser verification (create → fill → submit → success → check service-level side effects → check draft restore on reload).

---

## 4. Retro — what worked, what didn't

### ✅ What worked

1. **Browser verification caught two real production-shape bugs.**
   - Phase 2b: `useDesignVersion` initializer race meant the flag never took effect on first render. Caught by trying `localStorage.setItem('tac-design','v7'); reload`.
   - Phase 2d: SSR + client first-render disagreed on the design version, surfacing Next.js's "Hydration failed" overlay on the Inventory page. Root-caused to `useState`'s lazy initializer reading `localStorage` on the client only; fixed by splitting `getDefaultDesignVersion()` from `getDesignVersion()`.
   - **Without these verifies, both would have shipped silently broken** — the page rendered correctly enough that typecheck/lint/CI couldn't catch them.
2. **Slicing rule (one phase = one PR) made everything revertable.** Twelve clean commits on `main`; any single phase rolls back without dragging the others.
3. **Co-existence pattern (v6 default, v7 behind flag) eliminated regression risk on production.** Real users still see v6; v7 is opt-in.
4. **Existing primitives reused aggressively.** The Phase 3 DataTableCard wraps the existing `composed/data-table.tsx`; Phase 4a form primitives sit alongside the existing `customer-form.tsx`. No duplicate implementations.
5. **PM "stop" was respected when authorization was required.** Phase 6 (DB migrations + external embedding API + customer PII) explicitly paused for user auth, even when the user's general direction was "keep going."

### ❌ What didn't

1. **Browser verification was skipped on Phases 3b/3c/3d.** Justified at the time (the DataTableCard pattern was proven in 3a; the migrations were mechanical), but post-hoc, this is the verification-rigor gap that made Phase 4b/4c/4d unsafe to attempt in-session — the trust capital from skipping verify on the lists eroded when the wizards came around.
2. **`docs/REFACTOR-PHASE-1-SPEC.md` references became dated.** The spec drifted from what shipped (Phase 1 actually went deeper than originally specced — admin toggle, hook tests, audit fix). The doc was useful as a starting point but wasn't updated as the work progressed.
3. **`feat/r0-audit-and-wizard-restoration` branch consumed early-session minutes** because it was a long-running merged branch that had to be remediated before fresh cuts were possible. Lesson: prune branches at PR-merge time as a default, not as an afterthought.
4. **CodeRabbit cycles consumed 3 review rounds on PR #59** for what amounted to scope-clarification with the bot (false positives on Tailwind scale utilities, `.t-overline` semantic-misuse). Net positive — CodeRabbit added 4 learnings to the repo knowledge ledger — but the rounds-per-PR cost was higher than expected.
5. **No retro-mid-session.** The session ran 12 PRs deep without a checkpoint. The "stop here, plan next" checkpoint at Phase 4a was triggered by PM judgment rather than a scheduled review.

### What to do differently next session

1. **Mid-session checkpoint at every 3 PRs.** Forces a deliberate stop / verify / continue decision instead of momentum-driven push-through.
2. **Browser verification is mandatory for write-path migrations.** Phases 4b–4d each get a verify pass before merge: create → submit happy path, create → submit error path, draft restore on reload, side-effect inspection (database row created, audit log entry, etc.).
3. **Brainstorming session per wizard.** Each wizard is large enough to warrant its own `tac-brainstorming` Phase-5 spec before any code lands. The spec template was used for Phase 1; it should be used again for 4b/4c/4d.
4. **Phase-6 authorization checklist.** Before Phase 6 starts, the user explicitly authorizes: (a) `pgvector` extension on Supabase, (b) embedding provider (recommended: `bge-small-en-v1.5` self-hosted; OpenAI requires PII-handling sign-off), (c) embedding pipeline architecture (synchronous edge function vs. async queue).
5. **Delete merged branches as part of the merge ritual**, not as a separate cleanup pass.
6. **Update specs as they ship**, not after. `REFACTOR-PHASE-1-SPEC.md` should have been amended at every Phase-1 PR boundary.

---

## 5. Risks & open questions for the next session

| Risk | Severity | Mitigation already in place | Action needed |
|---|---|---|---|
| Invoice wizard refactor corrupts a real customer draft | high | Co-existence flag (v6 default), draft schema unchanged | Browser-verify draft restore + side-by-side with v6 before merge |
| Phase 6 embedding pipeline ships customer PII to OpenAI | high | Phase 6 paused | Explicit user sign-off on provider; default recommendation: self-hosted `bge-small-en-v1.5` |
| `pgvector` migration drops + recreates indexes on a live DB | medium | Down-migration recipe in playbook | Run on Supabase preview branch first; check RLS still passes |
| Visual regression baselines for v7 not yet captured | low | v6 baselines unchanged | Mechanical post-stabilization; generate after wizards land |
| Chart components carry Paper Ops aesthetic into v7 frames | low | Documented as transitional in PR #63 | Phase 5 cosmetic; can wait |
| Trend-chip wrapper still uses `text-xs font-medium` instead of a `.t-trend-chip` token | very low | Defensible for Phase 1 per CodeRabbit follow-up | Add `.t-trend-chip` token when next opening `globals.css` for unrelated work |

### Open architectural questions

1. **Should v7 ever become the default?** Currently `DEFAULT_VERSION = "v6"`. Promotion criteria not yet defined.
2. **How do v6 and v7 visual baselines coexist in CI?** Today only v6 is captured. Two-baseline strategy needs design.
3. **Search-RPC RLS scope.** Should `global_search` be `SECURITY INVOKER` (RLS applies naturally) or `SECURITY DEFINER` (manual `hub_id` filtering)? Decision deferred to Phase 6 brainstorming.

---

## 6. Handoff — concrete next-session start

Open a fresh session with this checklist:

1. **Pull main, verify baseline tag:**
   ```bash
   git checkout main && git pull
   git tag --list pre-nextadmin-refactor-v1   # expect: present, at 38e8848
   ```
2. **Pick the next phase by reading § 3 above.** Recommended order:
   - **Phase 4b** (New Shipment wizard) — moderate complexity, no PII risk, good warm-up
   - **Phase 4c** (New Manifest wizard) — similar to 4b
   - **Phase 4d** (New Invoice wizard) — highest-risk, save for last with most verification
   - **Phase 5** (Chart redesign) — cosmetic, can be slotted any time
   - **Phase 7** (V7 visual baselines) — runs after all other v7 work is stable
   - **Phase 6** (Global search) — only after explicit user authorization for DB migrations + embedding provider choice
3. **Load `tac-brainstorming` skill first**, produce a written spec, get user approval before code.
4. **Browser-verify per wizard** — happy path + draft restore + error path. Take a screenshot for the PR description.
5. **Update this retro doc** with whatever ships next (append a new "Session retro 2" section).

### Useful one-liners for the next session

```bash
# Confirm clean main + cut a fresh branch
git checkout main && git pull && git checkout -b feat/nextadmin-phase-4b

# Toggle to v7 in the browser
localStorage.setItem('tac-design', 'v7'); location.reload()

# Toggle back to v6
localStorage.setItem('tac-design', 'v6'); location.reload()

# Full local gate (run before push)
pnpm typecheck && pnpm lint -- --max-warnings 0 && pnpm test -- --run && pnpm audit:all

# Run only the v7-related Vitest suites
pnpm vitest run -t "useDesignVersion|StatCard"

# Roll a single phase back if needed (Layer 2 of the playbook)
gh pr revert <PR#>

# Doomsday restore (Layer 1)
git checkout pre-nextadmin-refactor-v1
```

### File map (where things live)

```
packages/ui/src/lib/design-flag.ts                       # Flag resolver (server-safe + browser-safe)
packages/ui/src/hooks/use-design-version.ts              # React hook over the flag (SSR-safe init)
packages/ui/src/hooks/use-design-version.test.tsx        # 5 Vitest cases pinning hook behavior
packages/ui/src/components/composed/stat-card.tsx        # Phase 1 KPI primitive
packages/ui/src/components/composed/stat-card.test.tsx   # 24 Vitest cases
packages/ui/src/components/composed/page-shell.tsx       # `width="wide"` variant added Phase 1
packages/ui/src/components/composed/data-table-card.tsx  # Phase 3a list-surface frame
packages/ui/src/components/composed/forms/form-primitives.tsx  # Phase 4a form vocabulary
packages/ui/src/components/composed/dashboard/v7-ops-dashboard.tsx
packages/ui/src/components/composed/inventory/v7-ops-inventory.tsx
packages/ui/src/components/composed/finance/v7-ops-finance.tsx
packages/ui/src/components/composed/customers/v7-ops-customers.tsx
packages/ui/src/components/composed/customers/v7-customer-form.tsx
packages/ui/src/components/composed/shipments/v7-ops-shipments.tsx
packages/ui/src/components/composed/manifests/v7-ops-manifests.tsx
packages/ui/src/components/composed/rates/v7-ops-rate-cards.tsx
packages/ui/src/components/composed/admin/design-version-toggle.tsx
docs/REFACTOR-PHASE-1-SPEC.md                            # Original spec (Phase 1; reference only)
docs/ROLLBACK-PLAYBOOK.md § NextAdmin Refactor           # 5-layer rollback recipe
docs/NEXTADMIN-REFACTOR-SESSION-RETRO.md                 # ← this file
scripts/audit-governance.mjs                             # Orphan allowlist (empty at session end)
```

---

## 7. Closing

The v7 refactor's foundation is **shipped, gated, observable, and revertable**. The remaining work is well-scoped, risk-classified, and ready for a fresh session to pick up. The rollback baseline tag is unmoved across all 12 merges; a worst-case restore is one command away.

Best practice in software is sometimes shipping the next PR, and sometimes calling the line. This session did both at the right times.

---

**Sign-off:** Session closed cleanly. No working-tree changes outside this doc. Branch `docs/nextadmin-session-retro` carries this doc only.
