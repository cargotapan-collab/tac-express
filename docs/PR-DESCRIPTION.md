# Comprehensive audit + cleanup + Violet Grid v6 (full evolution: Phases 1–5)

Multi-day session covering governance audit, redundancy cleanup, eight carry-forward closures, the **Violet Grid v6 design-system evolution** (all five phases), and re-baselining the GitHub repo against the working project state.

---

## TL;DR

| Gate | Status |
|---|---|
| `pnpm typecheck` | 🟢 7/7 packages |
| `pnpm lint --max-warnings 0` | 🟢 0 warnings |
| `pnpm test` | 🟢 32 tests / 7 files |
| `pnpm build` | 🟢 both apps cold-built in 1m15s |
| `pnpm audit:all` | 🟢 governance + auth-boundary + skills + design-spec |

This is the first time the **entire CI gate suite is simultaneously green** in the project's history.

---

## Why this PR is large

The repo on GitHub had only one commit (`b191c72` — 130-byte bootstrap README). The actual project lived as untracked work in the local working tree. This PR is the **first real push** of the project and contains the accumulated work of the audit + cleanup + v6 evolution session.

Five atomic commits structure the PR for review:

| # | Commit | Theme | Files | Lines |
|---|---|---|---|---|
| 1 | `012c4e2` | Comprehensive audit, cleanup, carry-forward closures, v6 Phase 1 foundations | 495 | +52,245 / -8,124 |
| 2 | `3e48823` | v6 Phase 2 — surface tiers across floating primitives + Card variants | 6 | +40 / -9 |
| 3 | `a78aa83` | v6 Phase 3 — interaction layer (hover-lift, focus-premium, KPI count-up) | 5 | +82 / -21 |
| 4 | `b199224` | v6 Phase 5 — premium polish (hero gradient, density modes, motion ESLint rule) | 5 | +161 / -14 |
| 5 | `f6e9334` | v6 Phase 4 — layout intelligence (container queries) | 3 | +13 / -8 |

Read the commits in order: each builds on the prior. CodeRabbit can review per-commit.

---

## Commit 1 — `012c4e2` (the baseline)

### Governance & skills (single canonical identity)
- Identity unified to **TAC Express v5.0 Violet Grid** across `AGENTS.md`, `CLAUDE.md`, `PROJECT-RULES.md`, `DESIGN_SYSTEM.md`, `README.md` (was fragmented into 3 stale identities: TAC Orbital, TAC Precision, Velox)
- `.claude/skills/*` curated to 16 canonical skills:
  - 5 stale skills rewritten (`tac-ui-authoring`, `tac-code-review`, `tac-accessibility`, `tac-brainstorming`, `tac-forms`)
  - 2 stub skills expanded to full content (`tac-express-onboarding`, `tac-fourteen-laws`)
  - 2 net-new skills authored (`tac-design-tokens`, `tac-api-surface`)
- `.agents/skills/*` duplicates collapsed to 1-line redirects pointing at `.claude/skills/` (kept for GSD-framework compatibility)
- `INDIGO_MISSION_CONTROL_STYLE` renamed to `VIOLET_GRID_MAP_STYLE` (last surviving "Indigo" reference)

### Doc cleanup (-10K lines redundancy removed)
- Deleted: `docs/_archive/` (9 obsolete plans), `.windsurf/skills/` (7 duplicates), `MASTER-RULES.md` (orphan), 9× `PHASE-N-COMPLETE.md` (historical), 5 superseded `.planning/` plans, broken `generate-claude-skills.js`
- Promoted: `PRODUCTION-RUNBOOK.md` and `ARCHITECTURAL-DECISIONS.md` to `docs/`

### Eight carry-forward closures
1. ✅ Sign-in client deduplicated → `packages/ui/src/components/composed/auth/sign-in-page-client.tsx`
2. ✅ Service-boundary types tightened: `createShipment` + `createInvoice` use `TablesInsert<>` from generated DB types. **Surfaced + fixed two real bugs**: phantom `billing_address` column (silently dropped by Supabase), bulk-import missing 8 NOT NULL fields (imports may have been failing at the DB layer)
3. ✅ Raw HTML form elements → shadcn primitives (`contact-form.tsx`, `rate-calculator.tsx`)
4. ✅ 6 dashboard direct-DB calls now broker through services or `@workspace/auth/{client,server}`. New helpers: `signOutBrowser`, `getServerAuth`, `useApiKeys`, `useWebhooks`, `shipmentService` + `adminService` browser singletons
5. ✅ Rate-limited public tracking mirrored into `apps/web` (Upstash configured; previously unprotected)
6. ✅ Sidebar-badges orphan UI hook deleted (canonical service hook already existed)
7. ✅ Role-based idle timeout (15min warehouse / 30min default / 45min manager / 60min admin)
8. ✅ Pre-existing `TrendDataPoint.dispatched` typecheck error closed

### Quality gates
- 24 lint warnings → 0 (LAW-9 closed via 5 new `--spacing-*` tokens; ESLint config: `argsIgnorePattern: '^_'`)
- 3 backdrop-blur LAW violations removed from `dialog.tsx`, `alert-dialog.tsx`, `welcome-hero.tsx`
- `audit-governance.mjs` exempts `supabase/functions/` for LAW 8 (Deno edge functions legitimately import via JSR)
- `audit-skills.ts` CHECK 9: word-boundary regex + forbidden-example block recognition

### Violet Grid v6 Phase 1 foundations
- [`docs/VIOLET-GRID-V6-EVOLUTION.md`](docs/VIOLET-GRID-V6-EVOLUTION.md): 7-pillar evolution spec, 5-phase rollout plan, component-level prescriptions
- `globals.css`:
  - 6-tier surface depth system (`--surface-{base,elevated,floating,interactive,hover,active}`)
  - Color-mix overlay tokens (`--overlay-primary-{soft,subtle,medium,strong}` + `--overlay-fg-{soft,subtle}`)
  - 3-layer motion vocabulary (`--motion-instant 80ms` / `--motion-smooth 180ms` / `--motion-expressive 320ms`)
  - `.tac-hover-lift` multi-axis hover utility + `.tac-focus-premium` token-based focus
- Button primitive: modernized (`forwardRef` removed — React 19 native), multi-axis hover (bg shift + sub-pixel translate + brutalist offset shadow grows 3px → 5px), premium focus (1px primary outline + 8px primary bloom)

---

## Commit 2 — `3e48823` (v6 Phase 2 — surfaces)

| Primitive | v6 upgrade |
|---|---|
| `dialog.tsx` (Content) | `bg-popover` → `bg-surface-floating` + `ring-fg-soft` inner micro-contrast + `shadow-[var(--shadow-brutal)]` (was missing) |
| `alert-dialog.tsx` (Content) | Same surface-floating + ring-fg-soft upgrade |
| `sheet.tsx` (Content) | `bg-popover` → `bg-surface-floating`; `shadow-lg` (resolved to none globally) → `shadow-[var(--shadow-brutal)]` |
| `popover.tsx` (Content) | + ring-fg-soft inner border |
| `dropdown-menu.tsx` (Content + SubContent) | Same upgrade — both menu surfaces now floating tier |
| `card.tsx` | New variants: `surface`, `floating`, `interactive` (last one auto-applies `tac-hover-lift`); added `@container/card` at root; new `microContrast` boolean prop |
| `tooltip.tsx` | Intentionally NOT changed — already inverts (bg-foreground / text-background) for the brutalist tag look |

---

## Commit 3 — `a78aa83` (v6 Phase 3 — interaction)

| Surface | v6 upgrade |
|---|---|
| KPI Card | `tac-fui-hover` → `tac-hover-lift`; new `data-accent-edge` slot (accent strip fades in on group-hover); numeric values now animate via motion's `useSpring` + `useTransform` (count-up from 0, respects `useReducedMotion`); `@container/kpi-card` for adaptive nested layout |
| Sidebar nav items | `transition-all` → scoped `transition-[background-color,border-color,color]` at motion-instant; active state uses `bg-primary-subtle` (token); `focus-visible:tac-focus-premium` for keyboard nav |
| Data table rows | `bg-accent/5` → `bg-surface-hover`; selected rows: `bg-primary-subtle` + 2px primary left edge driven by `data-[state=selected]` |

---

## Commit 4 — `b199224` (v6 Phase 5 — premium polish)

### Welcome Hero (composed/dashboard/welcome-hero.tsx)
- Inline `from-primary/20` gradient → tokenized `linear-gradient(... var(--overlay-primary-medium) ...)`
- Added 1px top-edge highlight (`linear-gradient(... var(--overlay-primary-strong) ...)`) for premium inner-border feel without glassmorphism
- Display headline: `dark:text-glow-primary` (violet text-shadow bloom only on dark mode hero)
- Role badge inherits `tac-hover-lift` for the multi-axis hover signal

### Density modes (NEW runtime)
- `packages/ui/src/components/composed/density-provider.tsx` (NEW): React context + `useDensity()` hook; `data-density={"compact"|"comfortable"|"spacious"}` flows to descendants; localStorage persisted (`tac-density` key)
- `globals.css`: 3 token bindings (`--row-py`, `--cell-text`, `--panel-px`) in `:root` + `.dark`, plus `[data-density="…"]` cascade selectors that override per mode
- `apps/dashboard/app/(dashboard)/layout.tsx`: `<DensityProvider>` wraps the dashboard root (existing `DensityToggle` primitive can be wired anywhere downstream)

### ESLint rule — motion-duration discipline
- New `no-restricted-syntax` rule blocks `duration-[Nms]` arbitrary values except the v6 vocabulary tokens (`duration-[80ms]`, `duration-[180ms]`, `duration-[320ms]`)
- Tailwind native scale (`duration-75/150/300`) remains allowed
- Prevents future drift to ad-hoc durations

---

## Commit 5 — `f6e9334` (v6 Phase 4 — layout intelligence)

### Container queries everywhere
- `apps/dashboard/app/(dashboard)/layout.tsx`: `@container/dashboard-content` on the main scrollable wrapper. Names the container so descendants target it specifically.
- KPI Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` → `@container/kpi-grid grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-4`. Self-adapts to container width (works inside narrow drawers / split panes).
- Welcome Hero: viewport `md:`/`sm:`/`lg:` breakpoints → container `@md:`/`@sm:`/`@lg:` modifiers bound to `dashboard-content`.

### Deferred from this PR (deliberate, not bugs)
- **Data Table subgrid** — would require migrating `<table>` to CSS Grid; significant refactor; subgrid is the right fix for column alignment but warrants its own focused PR.
- **Sidebar container-collapse** — sidebar sits at the viewport edge so its container width effectively IS the viewport. Container queries add no value here; existing `useState`-driven explicit collapse stays.

---

## Files-of-interest map (for CodeRabbit)

### Spec / governance docs
- `docs/VIOLET-GRID-V6-EVOLUTION.md` — the design-system evolution spec
- `docs/CODEBASE-AUDIT-2026-05.md` — full audit + carry-forward roadmap
- `docs/ARCHITECTURAL-DECISIONS.md` — decisions log
- `docs/PRODUCTION-RUNBOOK.md` — ops runbook
- `AGENTS.md`, `CLAUDE.md`, `PROJECT-RULES.md`, `DESIGN_SYSTEM.md`, `README.md` — root governance (canonical Violet Grid identity)

### Design tokens
- `packages/ui/src/styles/globals.css` — surface tiers, overlay tokens, motion vocabulary, density cascade, hover-lift / focus-premium utilities

### Primitives upgraded
- `packages/ui/src/components/button.tsx` (Phase 1)
- `packages/ui/src/components/primitives/{dialog,alert-dialog,sheet,popover,dropdown-menu}.tsx` (Phase 2)
- `packages/ui/src/components/primitives/card.tsx` (Phase 2 — variant expansion)

### Composed components upgraded
- `packages/ui/src/components/composed/dashboard/{welcome-hero,kpi-card,kpi-grid}.tsx`
- `packages/ui/src/components/composed/{dashboard-sidebar,data-table,density-provider}.tsx`

### Audit / governance scripts
- `scripts/audit-governance.mjs` — Deno edge-function exemption
- `scripts/audit-skills.ts` — word-boundary regex + forbidden-example block recognition
- `scripts/audit-auth-boundary.mjs` — allowlist trim
- `scripts/audit-design-spec.mjs` — unchanged

### App-level changes
- `apps/dashboard/app/(dashboard)/layout.tsx` — DensityProvider mount + container declaration
- `apps/web/proxy.ts` — rate-limit mirror
- 6 dashboard pages refactored to broker DB calls through services (carry-forward #4)

---

## What this PR is NOT

- ❌ A push of just the v6 design system in isolation — also includes session-accumulated cleanup
- ❌ A breaking change — every v6 token / utility is **additive**; v5 components still work
- ❌ A complete v6 implementation — Data Table subgrid deferred to a follow-up PR (noted above)
- ❌ A schema change — no Supabase migration changes; existing `database.types.ts` still drives the typed insert paths

---

## Risk / mitigation

| Risk | Mitigation |
|---|---|
| Rebase against existing `b191c72` was infeasible | Histories diverged with no common ancestor; bootstrap commit was 130 bytes of placeholder. Force-push (Strategy Z) replaces with the real project. |
| Build edge cases under Turbopack | Cleared `.next` caches and ran `pnpm build` cold — both apps build in 1m15s with zero errors |
| LAW violations sneaking in | All four sub-audits pass: governance, auth-boundary, skills, design-spec |
| Stale design-system identities | Active sweep removed every "TAC Orbital", "Indigo Mission-Control", "TAC Precision", "Velox", "Wasteland" reference |
| Unintended deletion | Done in deliberate phases with explicit user approval at each destructive step; 26 redundant files removed via `git rm` (reversible until commit) |

---

## Verification commands (reproducible locally)

```bash
pnpm install
pnpm typecheck       # 7/7 packages
pnpm lint            # 0 warnings
pnpm test            # 32 tests
pnpm audit:all       # all four sub-audits
rm -rf apps/*/.next  # cold build
pnpm build           # both apps, ~1m15s
```

---

## Co-author / attribution

Most commits authored as `cargotapan-collab <cargotapan@gmail.com>` (the org owner identity). Two pre-session commits (`f8d0840`, `865f5bf`) retain their original `TAC Express Dev <dev@tac-express.in>` authorship.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
