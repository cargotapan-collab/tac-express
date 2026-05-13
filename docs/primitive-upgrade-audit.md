# Primitive Upgrade Audit — shadcn 4.7.0 vs TAC current

Sprint 1–2 deliverable. Per-primitive diff vs the latest shadcn registry output, with explicit adopt/keep decisions. **No code changes from this audit alone** — visual-impacting swaps require Sprint 0 VRT baseline + per-PR verification.

| Audit date | shadcn version | TAC commit |
|---|---|---|
| 2026-05-13 | `4.7.0` | this PR |

---

## Universal observations

All shadcn 4.7.0 primitives now use:

1. **`radix-ui` namespace import** (`import { Slot } from "radix-ui"` + `Slot.Root`) instead of `@radix-ui/react-slot`. **Adoption decision: skip.** Both work; the namespace form bundles every Radix primitive into one import, which marginally increases bundle size if tree-shaking is loose. No visual or API impact.
2. **`rounded-none`** as the default radius (matches our LAW 13). **Already compliant** — TAC uses `rounded-[var(--radius-*)]` which resolves to `0rem`.
3. **`data-variant` / `data-size` attributes** on the root element. **Adoption decision: opportunistic.** Useful for CSS targeting; adding them is a one-line non-visual change. Will be picked up incrementally as primitives are touched for other reasons.
4. **`has-data-[icon=inline-end]` modifier** for child-icon-aware padding. **Adoption decision: defer.** Requires adding `data-icon="inline-end"` to icon children at every callsite (52 buttons, 20 badges). High-churn for marginal gain.
5. **`text-xs` as form-control text size** (12px). **Adoption decision: reject.** TAC currently uses `text-sm` (14px) on Button / Input / Textarea. Switching would shrink every form field by one type-step. Pure visual regression — fails the zero-diff constraint.
6. **`h-8` Button / Input default height** (32px). **Adoption decision: reject.** TAC uses `h-9` (36px). Same reasoning — 4px shrink across every form field.

These observations apply to **every** primitive below.

---

## Per-primitive findings

### Button (52 callers, Risk: Low)

**TAC additions over shadcn 4.7.0:**
- `glow` variant — used in hero CTAs (e.g. landing page primary action). No shadcn equivalent.
- Brutalist offset-shadow hover lift (`hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_0_var(--border)]`) — TAC's signature interaction.
- Premium focus bloom (`focus-visible:[box-shadow:0_0_8px_color-mix(...)]`) — replaces shadcn's `ring-1`.

**shadcn 4.7.0 additions worth considering:**
- `xs`, `icon-xs`, `icon-sm`, `icon-lg` sizes — TAC has none of these.
- `has-data-[icon=inline-end]:pr-2` padding-aware icon handling.

**Decision: KEEP TAC version.** Optionally append `xs` / `icon-xs` / `icon-sm` / `icon-lg` to the size variants in a future additive PR (no caller changes, no visual diff to existing callsites).

---

### Input (19 callers, Risk: Low)

**TAC additions over shadcn 4.7.0:**
- `h-9` height (`text-sm`) — TAC visual rhythm.
- `tac-focus-premium` instead of `ring-1 ring-ring/50`.

**shadcn 4.7.0 additions:**
- `field-sizing-content` on Textarea (Input is unchanged structurally).
- `disabled:bg-input/50` (TAC has `disabled:opacity-60`).

**Decision: KEEP TAC version.** No upstream-only improvements that don't have a TAC equivalent.

---

### Label (16 callers, Risk: Low)

**Delta**: Effectively identical. shadcn 4.7.0 uses `text-xs leading-none` + `group-data-[disabled=true]` pattern. TAC uses similar. The `text-xs` shift is the only delta.

**Decision: KEEP TAC version.** Type-size delta is the same visual-regression concern as Button/Input.

---

### Textarea (5 callers, Risk: Low)

**shadcn 4.7.0 has `field-sizing-content`** — content-aware auto-sizing (CSS-only, no JS). Modern browsers support it. TAC's Textarea is fixed-height.

**Decision: ADOPT `field-sizing-content` opportunistically.** Adding it doesn't shrink the existing visual; it just makes the field grow with content. Verify with VRT that no callsite regresses (e.g. fixed-height contexts that depend on consistent height).

---

### Badge (20 callers, Risk: Low)

**TAC additions over shadcn 4.7.0:**
- `tone` variants (`ok`, `warn`, `err`, `info`, `violet`) — TAC's status palette. shadcn 4.7.0 has `default / secondary / destructive / outline / ghost / link`.

**shadcn 4.7.0 additions:**
- `asChild` support via Slot. TAC's Badge doesn't have this.
- `[a]:hover:bg-primary/80` — link-child hover treatment.

**Decision: KEEP TAC version + ADD `asChild`** in a future additive PR. The `asChild` capability is genuinely useful (lets the badge wrap a `<Link>` without extra DOM).

---

### Separator (1 caller, Risk: Low)

**shadcn 4.7.0** uses `data-horizontal` / `data-vertical` attribute selectors instead of `data-[orientation=...]`. Cleaner CSS, same render.

**Decision: ADOPT.** Single caller — safe to swap. Will pick this up as part of the next primitive touch.

---

### Card (1 caller, Risk: Low)

**shadcn 4.7.0** is a major redesign — adds `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` with `@container` queries and `data-size="sm"` density. TAC's Card is a single component.

**Decision: KEEP TAC version.** TAC's composed cards (OpsCard, etc.) already provide richer composition than shadcn's. Adopting upstream would force a refactor of every composed-card consumer for zero visual gain.

---

## Summary

| Primitive | Decision | New PR needed? |
|---|---|---|
| Button | KEEP, additive `xs`/`icon-*` sizes optional | Optional additive |
| Input | KEEP | No |
| Label | KEEP | No |
| Textarea | ADOPT `field-sizing-content` | Yes — but additive only |
| Badge | KEEP + add `asChild` | Yes — additive |
| Separator | ADOPT | Yes — single-caller swap |
| Card | KEEP | No |

**No regressive swaps are needed.** TAC's primitives are already at or above shadcn 4.7.0's design intent. The three opportunistic adoptions (Textarea / Badge asChild / Separator) are all **additive** — they add capability without changing existing visuals — and ship as their own narrow PRs once Sprint 0 VRT baselines are captured.

---

## Cherry-pick backlog — non-visual improvements per primitive

The PM feedback called this out: "KEEP TAC version" is the right visual answer but doesn't address upstream bit-rot. Each row below is a future micro-PR — port the non-visual change, run VRT (must be 0 diff), merge.

| Primitive | Visual decision | Non-visual cherry-picks from shadcn 4.7.0 worth porting | Estimated effort |
|---|---|---|---|
| **Button** | KEEP TAC | • `data-variant` + `data-size` attributes (CSS-targeting hook, zero visual impact)<br>• Refactor `disabled:pointer-events-none disabled:opacity-50` → keep but match upstream's `disabled:bg-input/50` for `outline` only (a11y: clearer disabled-vs-enabled state) | S — 30 min, no caller changes |
| **Input** | KEEP TAC | • `field-sizing-content` is N/A here (Textarea only)<br>• `disabled:bg-input/50` (dim background reinforces disabled state; current TAC uses opacity-only — failing WCAG 1.4.11 non-text-contrast)<br>• `aria-invalid:ring-1 aria-invalid:ring-destructive/20` consolidation | S — 45 min, runtime-only |
| **Label** | KEEP TAC | • `group-data-[disabled=true]:pointer-events-none` — propagates disabled state from Field parent; required for Field composition fixes in shadcn 4.6+ | S — 15 min |
| **Textarea** | KEEP + ADOPT `field-sizing-content` | • `field-sizing-content` (additive auto-grow); already in audit summary<br>• Same disabled-bg-input/50 a11y fix as Input | M — 1h, VRT verify auto-grow doesn't expand any fixed-height callsite |
| **Badge** | KEEP + `asChild` | • `asChild` prop (lets Badge wrap a `<Link>` without extra DOM)<br>• `data-variant` attribute<br>• `has-data-[icon=inline-end]` modifier (only if any callsite uses inline-end icons; check inventory) | M — 1h, audit 20 callers for asChild conversions |
| **Separator** | ADOPT | • Already approved swap (1 caller). Includes `data-horizontal` / `data-vertical` semantics replacing `data-[orientation=...]` — cleaner CSS targeting | XS — single-file diff |
| **Card** | KEEP TAC | • shadcn 4.7.0 is a major redesign (CardHeader/Title/Description/Action/Content/Footer split with `@container` queries). Adoption would force every OpsCard caller to rewrite. **No port today.** Revisit when an OpsCard refactor is independently warranted. | XL — skip for now |
| **Select** | KEEP TAC | • Radix `@radix-ui/react-select` 2.2.x bump — RTL fix + improved `data-disabled` state<br>• `data-state="open"` selector consistency<br>• Portal `forceMount` option for animation testing | M — 1h, verify portal scope inheritance in `.ops-console` |
| **Checkbox** | KEEP TAC | • Currently zero callers — confirm via inventory grep, then delete the file entirely or import a compliant version in the same PR | XS — deletion candidate |
| **Radio Group** | KEEP TAC | • Same Radix bump (`@radix-ui/react-radio-group` 1.2.x) — focus-trap fix in groups | S |
| **Switch** | KEEP TAC | • Radix bump (`@radix-ui/react-switch` 1.1.x) — keyboard activation parity in Safari | S |
| **Dialog** | KEEP TAC | • **Radix Dialog 1.2.x** bump — focus-trap fix (focus restoration when content lacks autofocus), `forceMount` for nested Dialog testing<br>• `data-state="open|closed"` selector replacing legacy attribute<br>• New `requireDismiss` semantics for nested dialogs | M — 1.5h, verify nested AlertDialog inside Dialog still traps focus correctly |
| **Sheet** | KEEP TAC | • Inherits Dialog 1.2.x fixes (Sheet wraps Dialog).<br>• `side` variant uses `data-[side=*]` selectors (replaces hardcoded `aria-[orientation=*]`) | M |
| **Popover** | KEEP TAC | • Radix Popover 1.1.x bump — fixes `useId` hydration mismatch the TAC `suppressHydrationWarning` workaround was masking. **Worth porting** because it removes the workaround entirely.<br>• `align="start|center|end"` propagates to the new `data-align` attribute | M — 1h, REMOVE the `suppressHydrationWarning` once Radix bump lands |
| **Tooltip** | KEEP TAC | • Zero callers — same deletion candidate as Checkbox | XS |
| **Tabs** | KEEP TAC | • Radix Tabs 1.1.x bump — `activationMode="manual"` works reliably with keyboard nav<br>• `data-state` consolidation | S |
| **Accordion** | KEEP TAC | • Zero callers — deletion candidate | XS |
| **Collapsible** | KEEP TAC | • Zero callers — deletion candidate | XS |
| **Table** | KEEP TAC | • Zero non-visual upstream improvements in 4.7.0 (Table is a pure-style primitive) — composed `OpsTable` is the canonical consumer, no port needed | — |
| **Dropdown Menu** | KEEP TAC | • Radix DropdownMenu 2.2.x bump — submenu keyboard nav fix<br>• `data-state` consolidation | S |
| **Command** | KEEP TAC | • cmdk version bump (current is from prior shadcn) — search-result a11y announcements | S |
| **Alert Dialog** | KEEP TAC | • Inherits Dialog 1.2.x focus-trap fix; same recommendation | S |
| **Calendar** | KEEP TAC | • react-day-picker 9.14.x — already pinned recent. Verify against latest registry shadcn version for `Chevron` API parity | S |

**Total cherry-pick backlog**: 17 micro-PRs across 4–6 working days, each one VRT-gated to 0 diff. Run after Priority 1 (capture baselines) is closed.

### Three "near-zero-call-count" primitives flagged for deletion

`checkbox`, `tooltip`, `accordion`, `collapsible` — all show 0 callers in the inventory. Each is a separate one-line PR (`rm <file>` + barrel-export removal). Together they shave ~600 lines and remove the upstream-drift-tracking burden for primitives we don't use.

### Priority order for cherry-picks (highest leverage first)

1. **Popover** — remove `suppressHydrationWarning` workaround via Radix 1.1.x bump (debt reduction)
2. **Dialog + AlertDialog + Sheet** — focus-trap fix is a real a11y improvement
3. **Input + Textarea** — `disabled:bg-input/50` is a WCAG 1.4.11 a11y win
4. **Select** — Radix RTL fix matters for India/Imphal locale work
5. Everything else — opportunistic when the file is being touched anyway

---

## Sprint 2 — same audit, applied to higher-risk primitives

The plan's Sprint 2 covers Select, Checkbox, Radio, Switch, Dialog, Sheet, Popover, Tooltip, Tabs, Accordion, Collapsible, Table, Sonner. Same conclusion is expected for most: TAC's portal-based primitives (Dialog/Sheet/Popover) have **paper-scope token overrides** and **`suppressHydrationWarning` workarounds** that the bare shadcn output lacks. Verbatim swaps would regress.

Recommended action for Sprint 2: re-run the audit at the start of any primitive PR that's already being touched for an unrelated reason. **Don't open primitive-upgrade PRs purely for the sake of upgrading.** The shadcn output is the spec we work *from*, not a target we mechanically copy *to*.
