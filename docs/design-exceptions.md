# Design Exceptions — Documented Arbitrary Values

Registry for the arbitrary Tailwind values that remain in `packages/ui/src/components/composed/**` after Phase 3's mechanical token swaps. **Sprint 0 / S0.5** requires every remaining raw value to be classified into one of three resolutions:

| Resolution | Criteria | Action |
|---|---|---|
| **TOKENIZE** | Used 3+ times across files | Add a named token to `globals.css`, swap classes, remove the exception |
| **DESIGN-LOCKED** | Single intentional use; rounding to nearest token would shift design | Keep with a `// design-locked: <one-line reason>` comment and a per-file ESLint disable for the specific rule |
| **EXCEPTION** | No exact token equivalent and rounding is unacceptable in the operator's visual context | Document below with screenshot reference + justification |

**Source of truth:** this file. Adding a new arbitrary value to the codebase requires either tokenising it (S0.5) or adding a row here.

---

## Tracking arbitraries (12 occurrences)

The Paper Ops Console's `tracking-paper-*` scale (`0.04 / 0.06 / 0.08 / 0.10 / 0.12 / 0.14 / 0.18em`) does not include `0.15em / 0.20em / 0.25em / 0.30em / -0.01em`. These are used in display/wordmark contexts where the visual rhythm was hand-tuned.

| Value | Count | Files | Resolution | Plan |
|---|---:|---|---|---|
| `tracking-[0.2em]` | 7 | landing, wasteland, badge variants | **TOKENIZE** | Add `--tracking-paper-20: 0.20em` to globals.css in Phase 5 |
| `tracking-[0.25em]` | 1 | invoice print view | **DESIGN-LOCKED** | One-off print-strip mark; rounding to 0.24 (paper-24?) would re-flow the strip |
| `tracking-[0.3em]` | 2 | invoice tax-band; landing-hero LOCATE button (`awb-input.tsx`, also `wasteland-landing.tsx`) | **DESIGN-LOCKED** | Invoice: print-only brand emboss. Hero CTA: deliberately wider than the field's `tracking-paper-20` (0.20em) for primary-action hierarchy — tokenizing to paper-20 would flatten the field/button contrast. Add `--tracking-paper-30` if a third caller appears. |
| `tracking-[0.15em]` | 1 | one widget | **TOKENIZE** | Add `--tracking-paper-15` in Phase 5 if a second consumer appears; otherwise round down to `tracking-paper-14` after VRT check |
| `tracking-[-0.01em]` | 1 | sidebar wordmark | **DESIGN-LOCKED** | Tight kerning on the brand mark; matches paper-spec wordmark |

---

## Width / height / inset arbitraries (~28 occurrences)

Geometric arbitraries that don't map cleanly to the spacing scale. Many are intentional (icon-sized dots, page-aspect heroes), some are sloppy and can be rounded.

| Value | Count | Files | Resolution | Plan |
|---|---:|---|---|---|
| `w-[110px]` | 4 | manifests table column widths | **DESIGN-LOCKED** | Column widths sized to fit content + status badges; rounding to `w-28` (112px) would re-wrap headers |
| `gap-[18px]` | 3 | settings two-col grid | **TOKENIZE** | Add `--spacing-gutter-md: 1.125rem` in Phase 5 (3 occurrences = meets tokenise threshold) |
| `w-[3px]` | 2 | active-state indicator strip | **DESIGN-LOCKED** | 3px is design spec for the active-tab/sidebar marker; below the spacing scale floor |
| `w-[5px]` | 1 | badge dot | **DESIGN-LOCKED** | Sub-spacing-scale dot — already documented in `OpsBadge` CVA |
| `h-[220px]` / `h-[200px]` / `h-[260px]` | 4+ | charts | **TOKENIZE** | Add `--spacing-chart-md: 200px`, `--spacing-chart-lg: 220px` in Phase 5 (used by every dashboard chart) |
| `min-w-[8rem]` | 2 | command palette items | **DESIGN-LOCKED** | Matches Radix Command spec |
| `min-w-[1.25rem]` | 1 | sidebar badge min-width | **DESIGN-LOCKED** | Min-width for 1-digit badges to keep circles consistent |
| `min-w-[74px]` | 1 | wizard step pill | **TOKENIZE** | Round to `min-w-20` (80px) once VRT verifies no overflow |
| `max-w-[240px]` / `[320px]` / `[520px]` / `[640px]` | 5 | dialog widths, hero copy | **DESIGN-LOCKED** | Content-driven max-widths tuned per surface |
| `max-w-[calc(100%-2rem)]` | 2 | mobile sheets | **DESIGN-LOCKED** | Responsive constraint relative to viewport; can't tokenise without losing the calc |
| `top-[50%]` / `left-[50%]` | 4 | centered overlays | **DESIGN-LOCKED** | Standard absolute-center pattern; could replace with `inset-1/2` once Tailwind has the alias — for now intentional |
| `top-[20%]` / `left-[18px]` | 2 | command palette positioning | **DESIGN-LOCKED** | Command-palette spec |
| `px-[18px]` / `p-[18px]` | 2 | OpsCard / Settings | **TOKENIZE** | Same `--spacing-gutter-md: 1.125rem` as the `gap-[18px]` above; coordinate in Phase 5 |
| `min-h-[220px]` / `[240px]` / `[360px]` | 3 | empty-state heroes | **TOKENIZE** | Already in spacing-panel-* tokens; swap should be mechanical |
| `max-h-[28rem]` | 2 | scroll containers | **DESIGN-LOCKED** | Picked to fit ~10 rows of compact density; tied to content |
| `max-h-[60vh]` / `[70vh]` | 2 | mobile sheets | **DESIGN-LOCKED** | Viewport-relative — can't tokenise |
| `max-h-[273mm]` | 1 | A4 print page | **DESIGN-LOCKED** | Print-only, mm units, ISO paper standard |
| `max-h-[260px]` / `[300px]` | 2 | command palette / popovers | **DESIGN-LOCKED** | Floating-element constraint |
| `w-[calc(100%+4rem)]` | 1 | dashboard banner full-bleed | **DESIGN-LOCKED** | Negative-margin bleed pattern documented in the banner component itself |
| `w-[92vw]` | 1 | mobile dialog | **DESIGN-LOCKED** | Viewport-relative |
| `w-[80px]` / `[180px]` / `[360px]` | 3 | one-off layout widths | **DESIGN-LOCKED** | Per-component sizing; round-trip via VRT would catch regression |
| `h-[5px]` / `[30px]` | 2 | dividers / icons | **DESIGN-LOCKED** | Below or between spacing-scale steps |
| `w-[0_1px_0_rgba(…)]` / `w-[0_0_12px]` | 2 | box-shadow declarations matched as `w-[...]` pattern | **FALSE POSITIVE** | These are `box-shadow` values inside arbitrary utilities, not widths; lint rule should be tightened in Phase 8 |

---

## Summary

| Resolution | Count |
|---|---:|
| TOKENIZE (resolved in Phase 5) | ~12 |
| DESIGN-LOCKED (kept with per-file disable + comment) | ~35 |
| FALSE POSITIVE (regex-improvement work) | 2 |

**Exit criterion (S0.5)**: every remaining arbitrary value in `packages/ui/src/components/composed/**` has a row here. Phase 5 resolves the TOKENIZE bucket (adds new tokens, swaps classes). The DESIGN-LOCKED bucket stays — those values are intentional spec, not sloppy code.
