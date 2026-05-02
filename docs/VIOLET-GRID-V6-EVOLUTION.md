# Violet Grid v6 — Evolution Spec

> **Status:** Phase 1 foundations landed 2026-05-02. Phases 2-5 are scoped + ordered; ship them as separate PRs.
> **Authority:** This document supersedes `DESIGN_SYSTEM.md` for forward-looking direction. `DESIGN_SYSTEM.md` remains the canonical reference for v5.0 (current shipping state).
> **Target tier:** Linear (precision) · Stripe (clarity) · Vercel (performance) · Apple (polish).

---

## 0. Why v6

v5.0 Violet Grid is **architecturally elite, visually controlled** — strict tokens, dark-first, sharp 0rem corners, brutalist offset shadows, mission-control density. It is enforced by the Fourteen Laws and ESLint.

But the audit (2026-05-02) makes the gap honest:

| Dimension | v5.0 status | What top-1% UI does |
|---|---|---|
| Color tokens | ✅ Strict OKLCH semantic tokens | ✅ Same |
| Architecture | ✅ packages/ui, packages/services, RLS at DB | ✅ Same |
| Geometry | ✅ Zero radius, brutalist shadows | ✅ Same |
| **Surface depth** | ❌ Flat — only `bg-card` and `bg-surface` | ✅ 6-tier surface hierarchy |
| **Color mixing** | ⚠️ Used in some FUI utilities, not exposed as tokens | ✅ Standard pattern for hover/focus/borders |
| **Container queries** | ⚠️ Used on `card-header` only | ✅ Components adapt to their own width |
| **Subgrid** | ❌ Not used | ✅ Used for table + form alignment |
| **Motion layers** | ⚠️ 4 duration tokens, no semantic vocabulary | ✅ 3-layer system: instant / smooth / expressive |
| **Hover intelligence** | ⚠️ Border-color change | ✅ Lift + glow + sub-pixel translate |
| **Focus polish** | ⚠️ Generic `ring-[3px] ring-ring/50` | ✅ Ring + bloom + scale, choreographed |
| **Density modes** | ❌ Single density | ✅ Compact / comfortable / spacious |

v6 closes that gap. **Additively.** No breaking changes — every v6 utility is optional; existing components keep working.

---

## 1. The seven v6 pillars

### 1.1 Surface depth tiers

Six logical tiers. Each maps to a distinct OKLCH lightness so panels read in correct stacking order without leaning on shadows.

| Tier | Token | Use |
|---|---|---|
| **base** | `--surface-base` | Page canvas (= `--background`) |
| **elevated** | `--surface-elevated` | Default panels (= `--card` today) |
| **floating** | `--surface-floating` | Popovers, dropdowns, dialogs (= `--popover` today) |
| **interactive** | `--surface-interactive` | Idle state of interactive cards (rows, KPIs) |
| **hover** | `--surface-hover` | Hover state of `interactive` |
| **active** | `--surface-active` | Active/pressed state of `interactive` |

In dark mode, each tier is **+1.5% lightness** from the previous (very subtle — depth via tonal shift, not blur).

### 1.2 Color-mix overlay tokens

Pre-mixed transparency layers exposed as tokens, so components stop inlining `color-mix(in oklch, var(--primary) 10%, transparent)` ad-hoc.

```css
--overlay-primary-soft:    color-mix(in oklch, var(--primary) 5%, transparent);
--overlay-primary-subtle:  color-mix(in oklch, var(--primary) 10%, transparent);
--overlay-primary-medium:  color-mix(in oklch, var(--primary) 15%, transparent);
--overlay-primary-strong:  color-mix(in oklch, var(--primary) 25%, transparent);

--overlay-fg-soft:         color-mix(in oklch, var(--foreground) 4%, transparent);
--overlay-fg-subtle:       color-mix(in oklch, var(--foreground) 8%, transparent);
```

Tailwind utilities: `bg-primary-soft`, `bg-primary-subtle`, `bg-primary-medium`, `bg-primary-strong`, `bg-fg-soft`, `bg-fg-subtle`.

### 1.3 3-layer motion vocabulary

Replace the duration scale's mechanical naming with **intent-named** tokens.

| Layer | Duration | Easing | Use |
|---|---|---|---|
| **Instant** | 80ms | `ease-linear` | Mission-control: hover, toggle, instant feedback. The default. |
| **Smooth** | 180ms | `--ease-smooth` | Marketing/branded: modal open, sheet slide, tab switch |
| **Expressive** | 320ms | `--ease-spring` | Hero / onboarding / KPI value count-up. Use sparingly. |

Tokens:
```css
--motion-instant:    80ms var(--ease-linear);
--motion-smooth:     180ms var(--ease-smooth);
--motion-expressive: 320ms var(--ease-spring);
```

Component usage:
```tsx
className="transition-[background,border-color,transform] duration-[80ms] ease-linear"
// or via the new utilities:
className="transition-[var(--transition-instant)]"
```

### 1.4 Hover intelligence

Replace single-property hover (`hover:bg-primary/90`) with a **multi-axis hover signal**: tonal background shift + border accent + sub-pixel translate. Composed in one utility class.

```css
.tac-hover-lift {
  transition: background var(--motion-instant),
              border-color var(--motion-instant),
              transform var(--motion-instant);
}
.tac-hover-lift:hover {
  background: var(--surface-hover);
  border-color: var(--primary);
  transform: translate3d(-1px, -1px, 0);
}
.tac-hover-lift:active {
  background: var(--surface-active);
  transform: translate3d(0, 0, 0);
}
```

This preserves the brutalist offset (no soft shadow) but adds the multi-axis signal that reads as "premium" without violating LAW 13.

### 1.5 Focus polish

Replace generic Tailwind `focus-visible:ring-[3px] ring-ring/50` with a token-based **2-layer focus signal**: 1px hard outline + 8px primary bloom (the existing `.tac-signal-glow` exists; v6 standardizes its application).

```css
.tac-focus-premium {
  outline: 1px solid var(--primary);
  outline-offset: 1px;
  box-shadow: 0 0 8px color-mix(in oklch, var(--primary) 40%, transparent);
}
```

Apply via `focus-visible:tac-focus-premium`.

### 1.6 Container queries everywhere

Stop writing breakpoint-driven layouts inside components. **The component is the breakpoint.** Tailwind v4 supports container queries natively.

Pattern:
```tsx
<div className="@container">
  <div className="@sm:grid-cols-2 @lg:grid-cols-4 grid gap-4">
    {/* adapts to component width, not viewport */}
  </div>
</div>
```

Apply at every panel root that contains a layout, not just the page level.

### 1.7 Density modes

A `data-density="compact"` (or `comfortable` / `spacious`) attribute on the dashboard root toggles three coherent rhythms.

| Density | Row padding | Mono cell | Default heading | Use |
|---|---|---|---|---|
| compact | `py-1.5` | `text-2xs` | `text-sm` | Power users / tables |
| comfortable | `py-2.5` | `text-xs` | `text-base` | Default |
| spacious | `py-4` | `text-sm` | `text-lg` | Onboarding / public surfaces |

Tokens:
```css
[data-density="compact"]    { --row-py: 0.375rem; --cell-text: 0.625rem; }
[data-density="comfortable"]{ --row-py: 0.625rem; --cell-text: 0.75rem; }
[data-density="spacious"]   { --row-py: 1rem;     --cell-text: 0.875rem; }
```

The existing `density-toggle.tsx` primitive already exists — wire it to this attribute and the system flows through every consumer.

---

## 2. Component-level prescriptions

The current state of each top-tier component, with the exact v6 upgrade.

### 2.1 `Button` (primitives/button.tsx) — Phase 1 ✅

| v5.0 state | v6 upgrade |
|---|---|
| `React.forwardRef` legacy pattern | Modern function component (React 19 forwards refs natively) |
| Hover: single `bg-primary/90` | `tac-hover-lift` — bg shift + border-primary + translate3d |
| Focus: generic `ring-[3px] ring-ring/50` | `tac-focus-premium` — 1px outline + 8px primary bloom |
| Active: `translate-y-px` | `translate3d(0, 0, 0)` (returns from hover lift) |
| Default size: `h-9 px-4` | unchanged |
| Variant `glow`: `bg-primary` | Keep — but `hover` uses overlay-primary-strong |

**Status:** landed in this session as Phase 1 proof.

### 2.2 `Card` (primitives/card.tsx) — Phase 2

| v5.0 state | v6 upgrade |
|---|---|
| Single variant `bg-card` (= `--card`) | New variants: `surface` (= `--surface-elevated`), `interactive` (= `--surface-interactive` + `tac-hover-lift`), `floating` (for popovers) |
| No hover | `interactive` variant gets full `tac-hover-lift` |
| `@container/card-header` on header only | Add `@container/card` on root so children can write `@sm:grid-cols-2` etc. |
| Inner border: none | Optional `inner-border` modifier — adds `inset 0 0 0 1px var(--overlay-fg-soft)` for micro-contrast |

### 2.3 `KPI Card` (composed/dashboard/kpi-card.tsx) — Phase 3

| v5.0 state | v6 upgrade |
|---|---|
| Hardcoded `SPRING = { duration: 0.5, ease: [0.16,1,0.3,1] }` | Use `--motion-expressive` token via CSS-driven motion |
| Surface: `tac-fui-panel` (flat) | `bg-surface-interactive` + `tac-hover-lift` |
| Edge highlight on left (manual) | Promote to `data-accent-edge` slot — render via `::before` with brand color |
| Value drop-shadow (`drop-shadow-sm`) | Replace with `text-glow-primary` on dark mode hero KPIs only |
| Number formatting plain | Add `motion`/react `useSpring` count-up animation on mount |

### 2.4 `Dialog` / `AlertDialog` / `Sheet` (primitives) — Phase 2

| v5.0 state | v6 upgrade |
|---|---|
| Overlay: `bg-background/80` (just landed earlier session) | Add subtle inner border on the panel: `ring-1 ring-overlay-fg-subtle` |
| Panel: `bg-popover` flat | `bg-surface-floating` + 1px border + brutalist offset shadow |
| Open animation: `data-open:animate-in fade-in-0` | Add `data-open:slide-in-from-top-1` for sheet, `zoom-in-[0.98]` for dialog (uses motion-smooth) |

### 2.5 `Sidebar` (composed/dashboard-sidebar.tsx) — Phase 4

| v5.0 state | v6 upgrade |
|---|---|
| Active item: `bg-sidebar-accent` | Add 2px left-edge accent in primary; `data-active="true"` slot |
| Hover item: bg shift only | `tac-hover-lift` (no transform — sidebar items shouldn't translate) |
| Group title: monochrome | `tac-mono-label` consistency check |
| Width: fixed | Container query: collapse to icon-only when sidebar < 80px |

### 2.6 `Data Table` (composed/data-table.tsx) — Phase 4

| v5.0 state | v6 upgrade |
|---|---|
| Row hover: `bg-muted/30` | `bg-surface-hover` (uses density-aware row height) |
| Row selection: checkbox-only | Selected row gets `border-l-2 border-l-primary` |
| Cell density: fixed | `data-density` attribute on table root drives row-py via the density tokens |
| Column resize: not visible | Optional resizable columns with handle border |

### 2.7 `Welcome Hero` (composed/dashboard/welcome-hero.tsx) — Phase 5

| v5.0 state | v6 upgrade |
|---|---|
| Just landed: removed backdrop-blur | Add subtle violet gradient layer: `linear-gradient(135deg, color-mix(in oklch, var(--primary) 6%, transparent), transparent)` |
| Static text | Use `motion`/react staggered word reveal at `--motion-expressive` |
| Static badge | `tac-fui-crosshair` accent on hover |

---

## 3. Phase plan

Each phase is a separate PR. Phase 1 lands now; Phases 2-5 are scoped for later sessions.

### ✅ Phase 1 — Foundation (2026-05-02, this session)
1. Surface depth tiers added to `globals.css` `@theme inline`
2. Color-mix overlay tokens (`--overlay-primary-{soft,subtle,medium,strong}`, `--overlay-fg-{soft,subtle}`)
3. 3-layer motion vocabulary (`--motion-instant/smooth/expressive`)
4. Two new utility classes: `.tac-hover-lift`, `.tac-focus-premium`
5. `Button` primitive upgraded as visible proof-of-direction (legacy `forwardRef` modernized, hover-lift applied, premium focus, sub-pixel translate)

**Effort:** ~1h. **Risk:** zero (additive). **All gates still green.**

### Phase 2 — Surface system applied (1 PR, ~3-4h)
- Update `Card` primitive with surface tier variants + container query at root
- Update `Dialog` / `AlertDialog` / `Sheet` to consume surface-floating + inner border
- Update `Popover`, `DropdownMenu`, `Tooltip` to use surface-floating
- Add `bg-surface-{elevated,floating,interactive,hover,active}` Tailwind utilities to `@theme`

### Phase 3 — Interaction layer (1 PR, ~2-3h)
- Apply `tac-hover-lift` to: `KPI Card`, sidebar items (without translate), data-table rows
- Apply `tac-focus-premium` consistently across all interactive primitives
- KPI Card: replace inline SPRING object with `--motion-expressive` token; add count-up animation
- Add `prefers-reduced-motion` audit for the motion utility classes

### Phase 4 — Layout intelligence (1 PR, ~4-6h)
- Add `@container` at every panel root in composed components (sidebar, header, KPI grid, charts container, table)
- Switch dashboard-sidebar to container-query collapse (icon-only at < 80px)
- Switch data-table to subgrid for column alignment
- Use subgrid in form fields (label/control/error grouping)

### Phase 5 — Premium polish (1 PR, ~3-4h)
- Welcome Hero: violet gradient layer + staggered word reveal
- Hero illustration max-width tuning + aspect ratio enforcement
- Density toggle wires to `data-density` attribute on the dashboard layout root
- Audit-skills CHECK: ensure no component imports motion-react with hardcoded duration values (must use motion tokens)

---

## 4. Migration discipline

- **No v5 deprecation.** Every v6 token / utility is additive. v5 components keep working.
- **Per-component opt-in.** Components migrate to v6 patterns one at a time, in a tracked PR.
- **Audit gate.** New ESLint rule (`no-hardcoded-motion-duration`) lands in Phase 5 to prevent regression.

---

## 5. The premium feel — what to internalize

The user-perceivable upgrade comes from **multi-axis signals at every interaction**, not from any single dramatic change.

A button hover today = bg darkens. A v6 button hover = bg shifts + border activates + element lifts 1px + focus ring tightens — all in 80ms. The user can't articulate the difference. They just know the product feels "Linear-tier."

The same compounding principle applies to:
- Cards (idle vs hover vs active surface tiers)
- Dialogs (overlay + inner border + scale-from-98%)
- KPI values (count-up + violet glow + spring entrance)
- Sidebar items (accent edge + bg shift + width-aware collapse)

When every interaction has 3+ coordinated axes responding, the product reads as expensive.

---

## 6. References

- [Tailwind v4 release notes](https://tailwindcss.com/blog/tailwindcss-v4)
- [CSS Container Queries (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [CSS Subgrid (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid)
- [`color-mix()` — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)
- [`:has()` selector — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)
- Linear's design philosophy — public-facing examples
- Stripe Dashboard — public examples
- [`docs/CODEBASE-AUDIT-2026-05.md`](./CODEBASE-AUDIT-2026-05.md) — the audit that surfaced the gap
- [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) — current canonical (v5.0) spec
