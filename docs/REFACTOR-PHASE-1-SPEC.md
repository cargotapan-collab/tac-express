# NextAdmin Refactor — Phase 1 Spec

> Written per `tac-brainstorming` Phase 5. Approval required before any
> implementation commit. Subsequent phases (2 → 6c) get their own specs.

## Goal

Bring TAC Express dashboard pages into one container rhythm — consistent
gutters, card padding, gaps, and a wider page variant for KPI-heavy
surfaces — so every page looks composed instead of ad-hoc, without
porting NextAdmin's rounded-corner + soft-shadow chrome.

## Scope

- **Packages changed:**
  - `packages/ui/src/styles/globals.css` (add tokens only)
  - `packages/ui/src/components/composed/page-shell.tsx` (add `wide` width variant)
  - `packages/ui/src/components/HeroStatsCard.tsx` → generalize into `packages/ui/src/components/composed/stat-card.tsx`
- **New components:**
  - `StatCard` (composed) — token-driven, supports `value` / `label` /
    `trend` / `visual` / `onClick`. Replaces every ad-hoc KPI card.
  - `AdminDesignVersionToggle` (composed) — admin-only Settings widget
    that toggles the `useDesignVersion()` flag (rollback Layer 3).
- **New services/hooks:** None.
- **DB changes:** None.

## Component Tree

```
PageShell width="wide"               // new variant — 1536px cap
  PageHeader (existing)
  <grid cols=4 gap=card-gap>
    StatCard label value trend visual onClick
    StatCard …
    StatCard …
    StatCard …
  </grid>
  <rest of page>
```

```
Settings → System section
  AdminDesignVersionToggle           // visible to roles ≥ ADMIN only
    └─ RadioGroup (v6 | v7)
```

## Data Flow

Token additions are CSS-only; no data flow change.

`StatCard` is a leaf component — props in, JSX out. Callers source
`value` / `trend` from their existing service hooks (e.g.
`useDashboardKpis()`); the card does no fetching.

`AdminDesignVersionToggle` reads `useSession()` for the role check
(via existing `@workspace/auth` `isAdminOrAbove`) and
`useDesignVersion()` for the flag value. Setter writes localStorage,
which the hook re-reads on the next `storage` event.

## Design Notes

### New tokens (added to `globals.css`)

```css
/* Layout — responsive page gutters (NextAdmin parity, Violet-Grid-translated) */
--page-pad-x-sm:   1rem;     /* 16px  — mobile                       */
--page-pad-x-md:   1.5rem;   /* 24px  — tablet+                      */
--page-pad-x-lg:   2.5rem;   /* 40px  — 2xl+ desktops                */
--page-pad-y-sm:   1rem;
--page-pad-y-md:   1.5rem;
--page-pad-y-lg:   2rem;

/* Card rhythm — internal padding + gap between sibling cards */
--card-pad:        1.5rem;   /* 24px  — internal padding on every card           */
--card-pad-lg:     1.875rem; /* 30px  — generous padding for hero / KPI surfaces */
--card-gap:        1.5rem;   /* 24px  — gap-6 — gutter between cards in a grid   */

/* PageShell — wider variant for KPI-heavy dashboards (NextAdmin-1536 parity) */
--spacing-page-wide: 96rem;  /* 1536px — wide variant cap (KPI dashboards) */
```

### `PageShell` variant additions

```ts
variants: {
  width: {
    content: "max-w-page-content",   // existing — 1280px
    control: "max-w-control",        // existing — 1600px hardware frame
    wide:    "max-w-page-wide",      // NEW — 1536px, KPI-heavy pages only
    full:    "",                     // existing
  },
}
```

### `StatCard` anatomy (Violet Grid translation of NextAdmin's CRM KPI card)

| Slot | Token / class | NextAdmin parity check |
|---|---|---|
| Container | `bg-card border border-border shadow-[var(--shadow-brutal-sm)] p-[var(--card-pad)] rounded-none` | NextAdmin `bg-white shadow-1 p-6 rounded-[10px]` → translated to sharp + brutalist |
| Value | `t-display` or `t-h1` font-bold | NextAdmin 32–40px → token-driven |
| Label | `t-overline text-muted-foreground` | NextAdmin small/muted → matched |
| Trend chip | `inline-flex gap-1 text-signal-positive` or `text-signal-negative` | NextAdmin green/red → **translated to Violet Grid signal palette** (NOT raw green/red) |
| Visual slot | right-aligned, optional `<Sparkline>` or donut | NextAdmin sparkline → identical role |
| Interactive | `data-clickable` when `onClick` set; focus ring violet | — |

### Variant matrix

| Variant | Use when | Padding | Visual slot |
|---|---|---|---|
| `default` | Dashboard, Inventory, Shift Report KPIs | `--card-pad` | optional |
| `compact` | 4-across rows on the Dashboard | `--card-pad` | none |
| `hero` | Single-most-important KPI | `--card-pad-lg` | required |

### Forbidden patterns (Phase 1 — auto-rejected in code review)

- Any `rounded-lg` / `rounded-[10px]` on the new StatCard
- Any `bg-white` literal — must be `bg-card`
- Any `text-green-500` / `text-red-500` / hex green/red — must be `text-signal-positive` / `text-signal-negative`
- Any `shadow-sm` raw — must be `shadow-[var(--shadow-brutal-sm)]` or the aliased Tailwind utility
- Importing `HeroStatsCard` from a new caller — it remains until all callers migrate, then deleted in the same PR

## Non-Goals

- **DataTableCard / Form primitives** — Phase 3 and 4.
- **Global Search** — Phase 6a–6c.
- **Per-section Save/Cancel on Settings** — separate Phase 1b spec.
- **Reskinning NextAdmin chrome** (rounded corners, soft shadows) — explicitly rejected. The visual language stays Violet Grid v6.
- **Adding a new theme** — Modern Ivory + dark remain the only themes.
- **Replacing `PageHeader`** — it ships unchanged. Phase 1 is layout-only.

## Definition of Done

- [ ] Tokens added to `packages/ui/src/styles/globals.css`
- [ ] `max-w-page-wide` Tailwind utility resolves via `@theme inline`
- [ ] `PageShell` accepts `width="wide"` (CVA + types)
- [ ] `StatCard` component lives in `packages/ui/src/components/composed/stat-card.tsx`
- [ ] `StatCard` test covers: renders value + label, renders trend with correct signal-color class, renders click behavior, no `rounded-lg` / `bg-white` / `text-green-*` in computed classes
- [ ] `HeroStatsCard` either deleted or re-exported as a thin wrapper around `StatCard`, all internal callers migrated
- [ ] `AdminDesignVersionToggle` lives in `packages/ui/src/components/composed/admin/design-version-toggle.tsx`
- [ ] Toggle is wired into the Settings page (`apps/dashboard/app/ops-console/settings/`) under a System section, gated by `isAdminOrAbove`
- [ ] Visual regression baseline regenerated with the new variant rendered on the Dashboard page (1 baseline image diff expected; reviewed in PR)
- [ ] `pnpm lint --max-warnings 0`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm audit:all` all pass
- [ ] `docs/ROLLBACK-PLAYBOOK.md § NextAdmin Refactor` references the Phase 1 PR number once merged
- [ ] No new dependencies installed

## Open Items (decide before Phase 2)

1. **Sparkline implementation** — TAC has Recharts and a `composed/charts/` library. Phase 1 leaves `visual` as a `ReactNode` slot; the concrete Sparkline + Donut primitives ship with Phase 2.
2. **Settings "System" section placement** — does the toggle sit alongside `ApiKeysClient` / `WebhooksClient`, or in a new tab? Phase 1 places it inline in the main Settings card to avoid a routing change.

## Cross-cutting playbook check

- **Architecture flow** (`conventions/architecture-flow.md`): no DB calls, no service work — Phase 1 is pure UI / tokens. ✓
- **Brain-first** (`conventions/brain-first.md`): existing primitives (`PageShell`, `HeroStatsCard`, `Card`) extended rather than duplicated. ✓
- **Quality gates** (`conventions/quality-gates.md`): all five gates green required before PR. ✓
- **Violet Grid (LAW 9/10/11/13)**: zero radius, brutalist offset shadow, token-only colors. ✓
- **Karpathy discipline** (`tac-karpathy-discipline`): scope ≤ ~600 LoC additions, surgical, no speculative abstractions. ✓
