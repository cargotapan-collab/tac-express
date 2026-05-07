# TAC Orbital · Telemetry Chart System

A single, brutalist chart language for the entire TAC Express dashboard.
Replaces the donut-and-curve mess with a coherent set of primitives that
honour the design system laws: straight lines only, monospace labels,
0.125rem radius, two-hue maximum per chart.

---

## Install order

1. **Patch `packages/ui/src/styles/globals.css`** with the contents of
   `globals.css.additions.css`. The `@layer base`, `@theme inline`, and
   `@layer components` blocks merge into your existing equivalents.
2. **Drop the `charts/` folder** into `packages/ui/src/components/`.
3. **Verify peer deps** in `packages/ui`:
   - `recharts` (already a peer of shadcn charts)
   - `motion` (`motion/react` import path)
   - `@remixicon/react`
4. **Wire the pages** — see `apps/web/app/(dashboard)/page.tsx` and
   `apps/web/app/(dashboard)/analytics/page.tsx` for reference.
5. **Implement the service contracts** documented in
   `packages/services/analytics.contract.ts`. The UI never reaches into
   the database.

---

## Primitive map

| Use case | Component |
|---|---|
| KPI tile (number + spark + delta) | `KpiTile` |
| Time series (shipments, revenue, volume) | `StepAreaChart` |
| Composition (status, service mix) | `SegmentBar` |
| Ranking (hubs, customers) | `RankBarChart` |
| Percentage progress (success rate, growth) | `ProgressMeter` |
| SLA state per day | `StackedColumnChart` |
| Origin × destination | `LaneHeatmap` |
| Below threshold data | `ChartEmptyState` |
| Universal chart shell | `ChartFrame` |
| Recharts tooltip body | `OrbitalTooltip` |

---

## Color rules

There are exactly five places color comes from:

```
--chart-primary         brand purple, the only saturated hue in normal flow
--chart-primary-muted   secondary series, never standalone
--chart-ramp-1..5       single-hue intensity ramp for heatmap / density
--chart-ontime/late/breached   SLA STATE ONLY
--chart-axis/grid/track structural greys
```

**Hard rule:** `ontime / late / breached` are reserved for components
that communicate SLA state. They are never used to communicate
"high is good" or as decorative tones. The Success Rate ring is
`--chart-primary`, not green.

A single chart uses at most two hues: a primary and a muted variant.
The heatmap is the only exception — and it stays inside one ramp.

---

## Server vs client

| Component | Mode |
|---|---|
| `ChartFrame`, `ChartEmptyState` | Server-safe |
| `KpiTile` (sparkline is pure SVG) | Server-safe |
| `SegmentBar`, `RankBarChart`, `LaneHeatmap` | Server-safe |
| `ProgressMeter` (uses `motion/react`) | Client (`"use client"`) |
| `StepAreaChart`, `StackedColumnChart` (Recharts) | Client (`"use client"`) |
| `OrbitalTooltip` (used inside Recharts) | Client (`"use client"`) |

Server components cascade — server-safe primitives can be composed
inside server pages without a client boundary.

---

## Empty states

Every chart that depends on N data points renders `ChartEmptyState`
when `N < minimum`. The default thresholds are sensible per primitive:

| Primitive | Default minimum |
|---|---|
| `StepAreaChart` | 3 points |
| `StackedColumnChart` | 2 buckets |
| `RankBarChart` | 1 item |
| `LaneHeatmap` | 1 non-zero cell |
| `KpiTile` sparkline | 2 points (sparkline simply hidden, not error) |

---

## What's intentionally not here

- **Donuts / pies.** The system has no donut primitive. Composition
  uses `SegmentBar`. Percentage uses `ProgressMeter`.
- **Smooth curves.** No `type="monotone"` anywhere. Time series is
  always `stepAfter`.
- **Multi-hue palettes for categorical encoding.** When you need to
  distinguish many categories, rank them and use the ramp — don't
  paint each category its own colour.

---

## File index

```
packages/ui/src/styles/globals.css.additions.css
packages/ui/src/components/charts/
  index.ts
  types.ts
  chart-frame.tsx
  chart-tooltip.tsx
  chart-empty-state.tsx
  kpi-tile.tsx
  step-area-chart.tsx
  segment-bar.tsx
  rank-bar-chart.tsx
  progress-meter.tsx
  stacked-column-chart.tsx
  lane-heatmap.tsx

apps/web/app/(dashboard)/page.tsx
apps/web/app/(dashboard)/analytics/page.tsx

packages/services/analytics.contract.ts
```
