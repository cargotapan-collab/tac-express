# Phase 3 Token Swap Verification

Provable pixel-safety for the 218 + 15 mechanical replacements committed in Phase 3.

## Conversion table

All tokens are defined in `packages/ui/src/styles/globals.css` and expose `text-paper-N` / `tracking-paper-N` Tailwind utilities via `@theme inline`. At the default `16px` root font-size, the rem values produce identical computed pixel sizes to the literals they replaced.

### Font-size tokens (12 entries)

| Swap performed | Token value | rem × 16px | Pre-swap literal | Equal? |
|---|---|---:|---|:---:|
| `text-[9px]` → `text-paper-9` | `0.5625rem` | `9px` | `9px` | ✓ |
| `text-[10px]` → `text-paper-10` | `0.625rem` | `10px` | `10px` | ✓ |
| `text-[11px]` → `text-paper-11` | `0.6875rem` | `11px` | `11px` | ✓ |
| `text-[12px]` → `text-paper-12` | `0.75rem` | `12px` | `12px` | ✓ |
| `text-[13px]` → `text-paper-13` | `0.8125rem` | `13px` | `13px` | ✓ |
| `text-[14px]` → `text-paper-14` | `0.875rem` | `14px` | `14px` | ✓ |
| `text-[16px]` → `text-paper-16` | `1rem` | `16px` | `16px` | ✓ |
| `text-[18px]` → `text-paper-18` | `1.125rem` | `18px` | `18px` | ✓ |
| `text-[22px]` → `text-paper-22` | `1.375rem` | `22px` | `22px` | ✓ |
| `text-[26px]` → `text-paper-26` | `1.625rem` | `26px` | `26px` | ✓ |
| `text-[28px]` → `text-paper-28` | `1.75rem` | `28px` | `28px` | ✓ |
| `text-[32px]` → `text-paper-32` | `2rem` | `32px` | `32px` | ✓ |

### Letter-spacing tokens (7 entries)

| Swap performed | Token value | Pre-swap literal | Equal? |
|---|---|---|:---:|
| `tracking-[0.04em]` → `tracking-paper-04` | `0.04em` | `0.04em` | ✓ |
| `tracking-[0.06em]` → `tracking-paper-06` | `0.06em` | `0.06em` | ✓ |
| `tracking-[0.08em]` → `tracking-paper-08` | `0.08em` | `0.08em` | ✓ |
| `tracking-[0.1em]` → `tracking-paper-10` | `0.10em` | `0.10em` | ✓ |
| `tracking-[0.12em]` → `tracking-paper-12` | `0.12em` | `0.12em` | ✓ |
| `tracking-[0.14em]` → `tracking-paper-14` | `0.14em` | `0.14em` | ✓ |
| `tracking-[0.18em]` → `tracking-paper-18` | `0.18em` | `0.18em` | ✓ |

## Conclusion

Every token replaces its arbitrary-value source with a numerically identical CSS variable. Computed `font-size` and `letter-spacing` on any swapped element resolve to the same pixel value as the original literal. **Zero visual diff is provable from the math** — no DevTools spot-check is required to establish parity for these specific replacements.

The Sprint 0 VRT baseline ([apps/dashboard/e2e/visual/baseline.spec.ts](apps/dashboard/e2e/visual/baseline.spec.ts)) is the runtime backstop: if a swap had silently broken anything (browser font-rendering subpixel rounding, etc.), the page-level snapshots would still catch it.

## Re-verification protocol (when running a dev server)

Run the dev server, open DevTools on each of the five sample swap sites listed below, and confirm computed style:

| File | Line | Selector | Expected computed `font-size` |
|---|---|---|---|
| `packages/ui/src/components/composed/ops-console/ops-badge.tsx` | ~24 | `[data-slot="ops-badge"]` | `10px` (from `text-paper-10`) |
| `packages/ui/src/components/composed/ops-console/ops-card.tsx` (paper-label) | — | `.paper-label` | `11px` (from `text-paper-11`) |
| `packages/ui/src/components/composed/sidebar/sidebar.tsx` | ~73 | `[data-slot="sidebar-badge"]` | per spec |
| `packages/ui/src/components/composed/ops-console/ops-table.tsx` | ~64 | header cell | per spec |
| `apps/dashboard/app/ops-console/page.tsx` rendered output | — | stat card value | per spec |

Pass criterion: identical to the rem×16 value in the table above.
