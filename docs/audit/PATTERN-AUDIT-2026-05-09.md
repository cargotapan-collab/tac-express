# TAC Express — Pattern Audit (Cross-Screen Consistency)

> **Date:** 2026-05-09
> **Scope:** Pattern-level inconsistencies across user-facing screens — wizards, headers, button copy, type utilities, LAW 11 surface area.
> **Complements:** [`docs/CODEBASE-AUDIT-2026-05.md`](../CODEBASE-AUDIT-2026-05.md) (architecture, services, auth boundary, quality gates).
> **Roadmap context:** [`docs/VIOLET-GRID-V6-EVOLUTION.md`](../VIOLET-GRID-V6-EVOLUTION.md) (additive evolution; phases 2–5 pending).
> **Authority:** Pattern findings here defer to `globals.css` + `DESIGN_SYSTEM.md` + the Fourteen Laws.

---

## 0. TL;DR

- **Architecture audit is closed.** All five quality gates green, all eight 2026-05-02 carry-forwards landed. The codebase is *structurally* in good shape.
- **Token discipline is excellent.** Zero LAW 10 violations (Tailwind palette colors), zero LAW 1 violations (color literals in arbitrary syntax).
- **The remaining drift is at the pattern layer**, not the token layer:
  1. **Four distinct wizard implementations** across four sibling forms — two extracted with divergent APIs, two still inline. Single biggest UX cost.
  2. **~289 literal-unit arbitrary-value occurrences** (LAW 11), 76 of which concentrate in two print views (legitimate physical-paper constraints, partly).
  3. **Ad-hoc type styling** drift — components hand-roll `font-mono text-xs uppercase tracking-wider` instead of using the `.t-*` premium utilities.
- **Top-priority next PR:** consolidate the four wizards behind one canonical `<Wizard />` primitive in `packages/ui/src/components/primitives/`. Estimated 500–800 LoC across one PR (or two if split by extraction-vs-migration).

---

## 1. Quantitative baseline

Reproducible greps run against the entire repo TS/TSX surface. Date-stamp the result so future runs can measure progress.

### 1.1 LAW-violation counts

| Law | Pattern | Count | Status |
|-----|---------|-------|--------|
| LAW 1 | `-[#hex]`, `-[rgb(...)]`, `-[oklch(...)]` color literals in Tailwind arbitrary syntax | **0** | ✅ clean |
| LAW 10 | `(bg\|text\|border\|...)-(slate\|gray\|...\|rose)-(50..950)` palette classes | **0** | ✅ clean |
| LAW 11 | `-[N{px,rem,em,vh,vw,fr,%,ms,deg}]` literal-unit arbitrary values | **318** total · **29** legitimate `var(--*)` refs · **~289** real violations | ⚠️ surface area |
| LAW 11 (var refs only) | `-[var(--*)]` | **29** across 18 files | ✅ legitimate |

> The first two counts being zero is notable. LAW 1 + LAW 10 are the laws that previous design systems most often regress against. They are clean here because the lint pipeline (`pnpm audit:design-spec`) catches them and `globals.css` exposes semantic tokens for every common case.

### 1.2 Top LAW 11 offenders (literal-unit arbitrary values)

| Rank | File | Count | Notes |
|------|------|-------|-------|
| 1 | `packages/ui/src/components/composed/finance/invoice-print-view.tsx` | 50 | Print surface — partly legit (physical paper sizes); recent PR #44 (`extract font-size scale`) attacks this surface |
| 2 | `packages/ui/src/components/composed/manifests/manifest-print-view.tsx` | 26 | Same — print surface |
| 3 | `packages/ui/src/components/composed/wasteland-landing.tsx` | 18 | Marketing landing — likely refactorable to spacing/size tokens |
| 4 | `packages/ui/src/components/composed/shipments/shipping-label.tsx` | 13 | Print surface — PR #41 already extracted print-surface tokens |
| 5 | `packages/ui/src/components/composed/scanning/scanning-console.tsx` | 11 | Hub-floor mission control |
| 5 | `packages/ui/src/components/composed/shift-report/shift-report-view.tsx` | 11 | Operational report |
| 7 | `packages/ui/src/components/composed/management/hubs-manager.tsx` | 10 | Admin |
| 7 | `apps/dashboard/app/track/[awb]/page.tsx` | 10 | Public tracking page |

**Print surfaces alone account for 76 of 289 (~26%).** Per recent commits (`#41`, `#44`), there is an active token-extraction effort targeting print. Continue that pattern; the rest of LAW 11 cleanup is a long tail.

### 1.3 Reproduction commands

```bash
# LAW 1 — color literals in arbitrary syntax (expect 0)
rg -t tsx -t ts -c '-\[(#[0-9a-fA-F]{3,8}|rgb|rgba|hsl|hsla|oklch)\(?'

# LAW 10 — Tailwind palette classes (expect 0)
rg -t tsx -t ts -c '(bg|text|border|ring|fill|stroke|outline|decoration|placeholder|caret|accent|from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)'

# LAW 11 — literal-unit arbitrary values
rg -t tsx -t ts -c '-\[\d+(\.\d+)?(px|rem|em|vh|vw|fr|%|ms|deg)\]'

# LAW 11 — legitimate var(--*) refs (subtract from above for the real-violation count)
rg -t tsx -t ts -c '-\[var\(--'
```

---

## 2. Pattern fragmentation — wizards

The single highest-leverage finding. Four distinct wizard implementations exist for four sibling create-flows. A user filling out a shipment, a manifest, an invoice, and a customer in sequence sees four different visual treatments of the same concept.

### 2.1 Inventory

| # | Source | Status | Consumer |
|---|--------|--------|----------|
| 1 | [`packages/ui/src/components/composed/finance/wizard-stepper.tsx`](../../packages/ui/src/components/composed/finance/wizard-stepper.tsx) | Extracted | [`finance/invoice-wizard.tsx:1028`](../../packages/ui/src/components/composed/finance/invoice-wizard.tsx) |
| 2 | [`packages/ui/src/components/composed/manifests/manifest-builder/wizard-stepper.tsx`](../../packages/ui/src/components/composed/manifests/manifest-builder/wizard-stepper.tsx) | Extracted | [`manifest-builder-wizard.tsx:178`](../../packages/ui/src/components/composed/manifests/manifest-builder/manifest-builder-wizard.tsx) |
| 3 | [`packages/ui/src/components/composed/customers/customer-form.tsx`](../../packages/ui/src/components/composed/customers/customer-form.tsx) (inline `Stepper` at line 109) | Inline | [`apps/dashboard/.../customers/customers-client.tsx`](../../apps/dashboard/app/(dashboard)/customers/customers-client.tsx) |
| 4 | [`packages/ui/src/components/composed/shipments/create-shipment-form.tsx`](../../packages/ui/src/components/composed/shipments/create-shipment-form.tsx) (inline; `STEPS` tuple at line 38) | Inline | [`apps/dashboard/.../shipments/create/create-shipment-client.tsx`](../../apps/dashboard/app/(dashboard)/shipments/create/create-shipment-client.tsx) |
| 5 | [`packages/ui/src/components/composed/shipments/shipment-stepper.tsx`](../../packages/ui/src/components/composed/shipments/shipment-stepper.tsx) | Extracted (likely status timeline, not creation wizard) | TBD — not yet inventoried |

### 2.2 API divergence

| Aspect | #1 finance | #2 manifest | #3 customer (inline) | #4 shipment (inline) |
|--------|-----------|-------------|---------------------|---------------------|
| Active-step prop | `currentIndex: number` | `current: number` | `current: number` (private) | `step: number` (private state) |
| Step shape | `{ id, label, description? }` | `{ id, label }` | `{ id, label, caption, fields, icon }` | `string` (literal tuple) |
| Click navigation | `onStepClick?` (clickable when ≤ current) | none | none | none |
| Numbering | `idx + 1` | `String(i+1).padStart(2,"0")` | `Step {idx+1} / {STEPS.length}` | TBD |
| Completed-state visual | `RiCheckLine` icon | filled-bg + foreground text | TBD | TBD |
| Per-step icon | no | no | yes (`RiUserLine` etc.) | no |
| Container element | `<ol>` | `<nav aria-label>` | TBD | TBD |
| Known LAW 11 violation | none | `text-[10px]` (line 42, 49) | TBD | TBD |

**No two implementations agree on the prop name for the active step.** That alone is a maintenance burden — every consumer learns the local convention.

### 2.3 Visual divergence (from screenshots in the broader plan)

| Screen | Visual | Forward-button copy | Backward-button copy |
|--------|--------|--------------------|---------------------|
| Create Shipment | Numbered boxes 1–4 with line connectors, two-line labels | `NEXT` (all-caps, no arrow) | `BACK` (all-caps, ghost) |
| Create Manifest | `01 SETUP` horizontal bars, no connectors | `Next →` (sentence, arrow) | `Cancel` (sentence, text link) |
| Create Invoice | Two-row card tabs (`STEP N / Name`) | `Continue →` (sentence, arrow, *different word*) | `← Cancel` |
| New Customer | Two cards side-by-side (`STEP N / M` + icon + name) | `NEXT →` (all-caps, arrow) | `← BACK` |

**Four variants of the primary forward action across four sibling wizards.** Four variants of the backward action.

### 2.4 Recommended consolidation

Promote the wizard pattern to a real primitive at `packages/ui/src/components/primitives/wizard.tsx`. Pick one API. Suggested signature (informed by the union of the four current shapes):

```ts
interface WizardStep {
  id: string
  label: string
  description?: string
  icon?: ComponentType<{ className?: string }>  // optional — supports the customer-form pattern
}

interface WizardProps {
  steps: WizardStep[]
  currentIndex: number
  onStepClick?: (index: number) => void  // omit to disable navigation
  variant?: 'cards' | 'bars'              // 'cards' = #1 visual; 'bars' = #2 visual; pick one default and demote the other
  className?: string
}
```

Plus a `<WizardActions>` sub-component that owns the back/next button row and locks the casing/wording rule (canonical: `← BACK` / `NEXT →`, all-caps, primary forward, ghost backward).

**Migration sequence (one PR each, or one bundled PR if scope allows):**
1. Create `<Wizard>` + `<WizardActions>` in `primitives/`. Replace `composed/finance/wizard-stepper.tsx` re-exports with a thin shim that imports from primitives. Update one consumer (invoice) to confirm shape works.
2. Migrate `manifest-builder-wizard.tsx` to the primitive. Delete `composed/manifests/manifest-builder/wizard-stepper.tsx`.
3. Extract `Stepper` from `customer-form.tsx` to use the primitive. Verify the per-step icon prop survives.
4. Migrate `create-shipment-form.tsx` to the primitive.

**Estimated total scope:** 500–800 LoC across the four PRs, mostly mechanical replacement once #1 lands.

---

## 3. Pattern strength — `<PageHeader>`

Counter-evidence that consolidation works. [`packages/ui/src/components/composed/page-header.tsx`](../../packages/ui/src/components/composed/page-header.tsx) is used in **23 dashboard files**. Slot contract: `overline` / `title` / `description` / `actions` / `gradient?`.

The earlier plan flagged "three different uses of top-right" — that drift came from consumers passing different *content* into the `actions` slot (a button vs. a text link vs. a status badge). The primitive itself is fine; what's missing is documentation of the slot contract — specifically what visual treatment `actions` content should adopt for each semantic class (primary action, transient status, dismissive link).

**Recommended follow-up (low priority):** add a JSDoc on `actions` enumerating its accepted shapes, and consider promoting `<PageHeaderAction>` and `<PageHeaderStatus>` as named sub-components to lock visual treatment.

---

## 4. Ad-hoc type styling drift

Spot-found in [`customers-client.tsx:57`](../../apps/dashboard/app/(dashboard)/customers/customers-client.tsx):

```tsx
className="font-mono text-xs font-bold uppercase tracking-wider rounded-none"
```

Three issues in one className:
- Re-rolls what `.t-overline` (and to a lesser degree `.t-mono`) already encode — bypasses the premium type scale.
- `rounded-none` is redundant given LAW 13 (`--radius: 0rem`).
- Hand-rolled letter-spacing (`tracking-wider`) competes with the `.t-overline`'s baked-in tracking.

**Why this matters:** every component that hand-rolls type styling becomes a place that drifts when the type scale evolves. The premium type utilities (`.t-display`, `.t-h1..h4`, `.t-overline`, `.t-data`, `.t-mono`) exist precisely so this doesn't happen.

**Detection grep (one-shot, run when bored):**

```bash
rg -t tsx 'font-mono.*uppercase.*tracking' -l
rg -t tsx 'rounded-none' -l   # any occurrence is redundant; LAW 13 already gives 0rem
```

**Recommended fix pattern:** replace `font-mono text-xs uppercase tracking-wider` with the appropriate `.t-overline` / `.t-mono` utility. Delete `rounded-none` everywhere — it's cargo-culted from systems that have non-zero default radius.

---

## 5. Mapping inconsistencies → v6 evolution phases

The [`docs/VIOLET-GRID-V6-EVOLUTION.md`](../VIOLET-GRID-V6-EVOLUTION.md) roadmap (phases 2–5 pending) closes some of these gaps automatically. Cross-reference:

| Inconsistency | v6 phase that helps | Notes |
|---------------|---------------------|-------|
| Wizard fragmentation | none directly | Wizard consolidation is **orthogonal** to v6 — should ship before or alongside |
| Surface depth ambiguity in step indicators (active vs. done vs. pending) | Phase 1.1 (surface depth tiers — **already shipped**) | Use `--surface-elevated` / `--surface-interactive` / `--surface-hover` / `--surface-active` rather than ad-hoc `bg-muted/40` and `bg-primary/5` |
| Hover treatment of step buttons | Phase 1.4 (hover intelligence — `.tac-hover-lift`) | Apply when reachable steps become clickable |
| Animation timing on step transitions | Phase 1.3 (motion vocabulary) | `--motion-instant` for state changes, `--motion-smooth` for entry |
| LAW 11 cleanup in print views | (own concern) | PRs #41, #44 are the existing approach — extract tokens, don't refactor wholesale |

**Implication:** the wizard PR should land **using v6 tokens** (surface tiers, motion vocabulary, hover-lift), not the v5 fallbacks. This way the consolidated primitive is the v6 reference implementation for wizard surfaces, and any future v6-tier work doesn't have to revisit it.

---

## 6. Recommended next PRs (priority-ordered)

1. **Consolidate `<Wizard>` primitive** *(critical)* — promote, pick one API, migrate all four current implementations. Single biggest cross-screen consistency win. Use v6 surface/motion tokens. **~500–800 LoC, 1–2 PRs.**

2. **Continue print-surface token extraction** *(high — already in motion)* — recent PRs #41, #44 are the right pattern. Top remaining offenders: `invoice-print-view.tsx` (50 occurrences after font-size extraction; remaining ones likely page geometry), `manifest-print-view.tsx` (26). **~200–400 LoC per PR.**

3. **`wasteland-landing.tsx` LAW 11 cleanup** *(medium)* — 18 literal-unit values in one marketing file; non-physical surface (no print constraint), should be tokenizable wholesale. **~150 LoC.**

4. **Replace ad-hoc type styling with `.t-*` utilities** *(low — long tail)* — ship as a sweep PR after the wizard consolidation lands; the wizard PR will incidentally clean some of these. Use the grep in §4 to find candidates. **~200 LoC across many tiny diffs.**

5. **Document `<PageHeader>` slot contract** *(low)* — add JSDoc for `actions` and consider `<PageHeaderAction>` / `<PageHeaderStatus>` sub-components. **~50 LoC.**

6. **Inventory `shipment-stepper.tsx`** *(housekeeping)* — confirm it's a tracking-timeline (not creation wizard) and rename if so to disambiguate from the wizard primitive. **~30 LoC.**

---

## 7. Open decisions that gate the wizard PR

These are owner-decisions, not implementation details. The wizard PR shouldn't start until they're answered.

| # | Decision | Default if no answer |
|---|----------|----------------------|
| D1 | **Visual variant.** Cards (#1, finance) vs. Bars (#2, manifest)? Pick one default; demote the other to a `variant` prop or remove. | Cards — denser information, supports description, supports completed-state icons cleanly. |
| D2 | **Step numbering style.** `1` (finance) vs. `01` (manifest) vs. `Step 1 / 4` (customer)? | `Step N / M` — matches mission-control density, gives location context, scales beyond 9 steps. |
| D3 | **Forward-button copy.** `NEXT →` (all-caps + arrow) vs. `Continue` (sentence, semantic-when-different)? | `NEXT →` always; `SUBMIT` only on the final step. Reserve `Continue` for genuinely-different semantics (resume an interrupted flow). |
| D4 | **Backward-button copy.** `← BACK` (all-caps + arrow ghost) vs. `Cancel` (text link)? | `← BACK` for in-flow regress; `Cancel` only at step 0 (where it dismisses the wizard entirely). |
| D5 | **Click navigation.** Should completed steps be clickable to jump back? (#1 yes, #2/#3/#4 no.) | Yes — `onStepClick` becomes the canonical pattern; non-clickable wizards just don't pass it. |
| D6 | **Per-step icon support.** (#3 customer-form has it; others don't.) | Yes — optional `icon?: ComponentType` on `WizardStep`. Removed if unused at the consumer site. |

The defaults above are reasonable starting points. If the owner picks differently, the implementation cost is roughly the same.

---

## 8. What this audit does **not** cover

To set scope expectations:

- **Visual regression baseline.** No Storybook or Chromatic yet. Component-level screenshots are deferred until the wizard primitive lands (no point baselining the inconsistent ones).
- **Accessibility audit.** axe-core/WCAG checks are deferred to a separate sweep — see `tac-accessibility` skill for that workflow.
- **Mobile responsiveness.** All screen audits to date are desktop. Mobile breakpoints + touch-target sizing is a separate concern.
- **Form-pattern audit beyond wizard chrome.** Field labels, casing, required-field markers, helper-text patterns — these are downstream of the wizard work and folded into the `tac-forms` skill conventions.
- **The `apps/web` (marketing) surface.** Audit focused on `apps/dashboard`. Marketing has its own design language considerations (denser hero work, gradient utilities, motion-expressive easing) covered in `tac-design-tokens`.

---

## 9. References

- [`AGENTS.md`](../../AGENTS.md) — agent rules
- [`PROJECT-RULES.md`](../../PROJECT-RULES.md) — Fourteen Laws
- [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) — Violet Grid v5.0 spec (canonical visual identity)
- [`docs/VIOLET-GRID-V6-EVOLUTION.md`](../VIOLET-GRID-V6-EVOLUTION.md) — v6 roadmap (phases 2–5 pending)
- [`docs/CODEBASE-AUDIT-2026-05.md`](../CODEBASE-AUDIT-2026-05.md) — architecture/services/auth-boundary audit (2026-05-01/02)
- [`packages/ui/src/styles/globals.css`](../../packages/ui/src/styles/globals.css) — single source of truth for tokens

---

**End of audit.** Single most-leveraged next action: the canonical `<Wizard>` primitive PR (Recommendation #1). Owner to bless decisions D1–D6 before implementation begins.
