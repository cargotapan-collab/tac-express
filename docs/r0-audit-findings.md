# Phase R0 — Live Browser Audit Findings

> **Generated:** 2026-05-13 via `Claude_Preview` MCP, four-pass eval (axe-core 4.10.2 / LAW 13 computed-radius scan / LAW 3 runtime-className scan / console sweep) against `apps/dashboard` on `localhost:3001`.
> **Status:** This is the cherry-pick queue input. Items are ranked by **fix cost × impact**, not category. Top of the list = highest-leverage PR.

## Scope

| Bucket | Routes audited | Routes deferred |
|---|---|---|
| Public | `/sign-in`, `/track` | — |
| Protected list | `/ops-console`, `/analytics`, `/shipments`, `/manifests`, `/customers`, `/finance`, `/rates`, `/inventory`, `/exceptions`, `/settings`, `/audit`, `/notifications` (12 total) | — |
| Multi-step wizards | `/customers/create` (resting + empty-submit error), `/finance/create` (resting) | `/shipments/create`, `/manifests/create`, `/rates/create` (3 — see deferral note in §D2) |
| Detail | `/manifests/<uuid>` | `/customers/<uuid>`, `/shipments/<uuid>` (deferred — same OpsCard composition as audited route, low signal) |
| Modals | — | Command palette (Cmd+K) — couldn't reliably fire via `preview_click` |

**16 routes audited × 4 passes = 64 measurements.** Per-route raw output cached at `.audit-cache/*.json`.

## Headline numbers

| Pass | Total unique violations |
|---|---:|
| WCAG (axe-core) | **3 distinct rules** — `color-contrast` (serious), `region` (moderate), `heading-order` (moderate, 1 route only) |
| LAW 13 (computed `border-radius`) | **0** — zero-radius contract is holding across every route |
| LAW 3 (runtime arbitrary values) | **14 unique class strings** after filtering valid `[length:var(--*)]` token refs + Tailwind variant-arbitrary selectors |
| Console errors | **0** |
| Console warnings | **1 unique** — Supabase gotrue-js orphaned-lock (60+ occurrences) |

## How to read the rankings

- **Cost** is engineer-hours to fix, including tests
- **Impact** is the multiplier: how many routes / users / WCAG criteria the fix closes
- **Leverage** = impact ÷ cost. Top of each tier has the best leverage

---

## 🔴 Critical — block on shipping

These are user-blocking on auth/business flows. Ship-blockers.

### C1. Form error association is missing across 4 of 5 multi-step wizards
**Leverage:** ⭐⭐⭐⭐⭐ (one fix, 5 wizards, 2 WCAG criteria closed)
**Cost:** ~2 hours · **Impact:** every form, every screen-reader user
**WCAG:** 4.1.3 Status Messages (AA), 3.3.1 Error Identification (A)

When the customer-create form is submitted empty, the runtime shows:
- 6 `role="alert"` elements (the FieldError text) ✅
- 5 inputs with `aria-invalid="true"` → **0** ❌
- 5 inputs with `aria-describedby` pointing at the error → **0** ❌

Confirmed identical on `/finance/create` (5 inputs, 0 wired). `ops-shipment-form.tsx` partially wires `aria-invalid` but no form wires `aria-describedby`. Screen reader users hear the field label but never the validation error.

**Fix (in `packages/ui/src/components/composed/ops-console/forms/*.tsx`):**
```tsx
<OpsFieldInput
  id="cust-name"
  aria-invalid={errors.name ? true : undefined}
  aria-describedby={errors.name ? "cust-name-error" : undefined}
  {...register("name")}
/>
<FieldError id="cust-name-error" message={errors.name?.message} />
```
And add `id?: string` to `FieldError`. Replace `register('field')` spreads systematically across all 5 forms. Add a Playwright assertion: after empty-submit, `input[aria-invalid="true"]` count = expected error count.

### C2. Color-contrast violations across every protected route
**Leverage:** ⭐⭐⭐⭐⭐ (one token swap, 12 routes)
**Cost:** ~1 hour · **Impact:** every screen reader / low-vision user on every page
**WCAG:** 1.4.3 Contrast (Minimum) (AA)

Axe flags `color-contrast` as **serious** on every protected route. Node counts:

| Route | Nodes | Source |
|---|---:|---|
| `/ops-console` | 8 | sidebar group labels + active nav item |
| `/ops-console/analytics` | 6 | sidebar |
| `/ops-console/shipments` | **23** | sidebar + table row muted cells |
| `/ops-console/manifests` | **30** | sidebar + table row muted cells |
| `/ops-console/finance` | **34** | sidebar + table row muted cells + status pills |
| `/ops-console/customers` | 7 | sidebar |
| `/ops-console/rates` | 7 | sidebar |
| `/ops-console/inventory` | 8 | sidebar |
| `/ops-console/exceptions` | 6 | sidebar |
| `/ops-console/settings` | 8 | sidebar |
| `/ops-console/audit` | 7 | sidebar |
| `/ops-console/notifications` | 7 | sidebar |
| `/manifests/<uuid>` | 6 | sidebar |
| `/sign-in` | 2 | eyebrow text |
| `/track` | 1 | brand "Express" |

**Two clusters of cause:**
1. **Sidebar group labels** (`Platform`, `Operations`, `Business`, `Audit & Reports`) and **active nav item** (`Dashboard` on active state) — 6–8 nodes/page baseline
2. **Table row muted cells** (`.text-paper-fg-3` text on `.bg-paper-card`) — adds 15–25 nodes on list pages

**Fix:**
- Sidebar: bump `--sidebar-foreground-muted` (or whichever token resolves the group label color) by 1 step toward FG. Verify contrast ratio ≥ 4.5:1 against `--sidebar` (`var(--paper-2)`).
- Table muted cells: bump `--paper-fg-3` by 1 step. Verify against `--paper-card`. There's a contrast triangle here — `--paper-fg-3` on `--paper-2` (zebra rows) AND on `--paper-card`. Both must clear 4.5:1.

This is a TOKEN value change in `packages/ui/src/styles/globals.css`. Single-file PR. The rest of the system already references the token.

### C3. `region` landmark missing — sidebar footer not contained
**Leverage:** ⭐⭐⭐⭐ (3 nodes × 13 protected routes)
**Cost:** ~30 minutes · **Impact:** every screen-reader user, every protected route
**WCAG:** 1.3.1 Info & Relationships (A), 4.1.2 Name/Role/Value (A)

Same 3 nodes on every protected route:
1. `<div class="font-paper-mono ... tracking-paper-04">` — hub indicator "Imphal // Prod"
2. `<div role="group" aria-label="Theme">` — light/dark/system toggle group
3. `<div aria-label="Account">` — operator avatar

These live in the top-right cluster of the ops shell but aren't inside any `<header>`, `<main>`, `<nav>`, `<aside>` or `[role="region"]`.

**Fix:** in the OpsFrame shell, wrap the top-right cluster in `<header role="banner">` or give it `role="region" aria-label="Session controls"`. Single-component change in `packages/ui/src/components/composed/ops-console/ops-frame.tsx`.

---

## 🟠 High — fix this sprint

Real correctness/performance gaps. Won't block ship, but every PR that lands while these exist is shipping over them.

### H1. Supabase auth lock warning fires on every navigation
**Cost:** ~3 hours (investigation) · **Impact:** every dev session, possibly prod

```
[warn] @supabase/gotrue-js: Lock "lock:sb-mdvnphbucrpspntrezmj-auth-token"
       was not released within 5000ms. This may indicate an orphaned lock
       from a component unmount (e.g., React Strict Mode). Forcefully
       acquiring the lock to recover.
```

Fired ~60 times during a 15-minute audit session (every protected-route navigation triggers it). Real React component double-mount/unmount under Strict Mode is leaking the auth lock; the gotrue client recovers by force-acquire after 5s, but **every protected-route navigation incurs an artificial 5-second auth-resolve latency** in dev.

**Investigation path:**
- `apps/dashboard/components/providers.tsx` — where `createBrowserClient` instances live
- `packages/auth/src/auth.service.ts` — verify the auth instance is singleton-pinned across remounts
- Hypothesis: the auth client is being constructed in a `useEffect` or component body rather than module scope, causing a new client per Strict Mode mount.

Verify in prod build (`pnpm --filter dashboard build && pnpm --filter dashboard start`) — if it doesn't fire there, it's Strict-Mode-only and lower priority. If it DOES fire in prod, this is a real prod latency hit.

### H2. Raw `rgba()` shadow on every list page
**Cost:** 15 minutes · **Impact:** 6+ routes, breaks --shadow token system
**LAW 3 violation:** `shadow-[0_1px_0_rgba(14,15,18,0.06)]`

This is the sticky-header subtle bottom-line shadow on `OpsTable` and several list-page wrappers. Hardcoded rgba bypasses the brutalist offset-shadow token vocabulary entirely.

**Fix:** define `--shadow-paper-sticky: 0 1px 0 rgb(from var(--border) r g b / 0.06)` in `globals.css`, then `shadow-[var(--shadow-paper-sticky)]` (or expose as a Tailwind utility class). One-file token addition; codemod the call sites.

### H3. Pixel-literal heights/widths in shared sidebar + topbar chrome
**Cost:** 45 minutes · **Impact:** 13 protected routes (shared chrome)
**LAW 3 violations:** `h-[30px]` (theme toggle buttons ×3), `w-[3px]` (active-item indicator), `min-w-[1.25rem]` (badge minimum)

These are values that recur on every protected route because they live in the shared shell. The token system has spacing-* but no explicit `--toggle-h` or `--indicator-w`.

**Fix:** add `--toggle-h: 1.875rem; --indicator-w: 3px; --badge-min-w: 1.25rem;` to the design tokens. Replace the literals. The 3-button theme group also clusters with `h-8` on the parent — verify the parent + child heights stay coherent after token-ification.

### H4. Sidebar grid track sizing as pixel literal
**Cost:** 20 minutes · **Impact:** every protected route
**LAW 3 violation:** `grid-cols-[240px_1fr]` (root ops shell), `grid-cols-[1.5fr_1fr]` (settings), `grid-cols-[1.4fr_1fr]` (notifications)

The 240-pixel sidebar width is configured 13× in the ops shell because every page mounts under it. Settings + notifications inline their own grid templates rather than reusing one.

**Fix:** introduce `--sidebar-w: 15rem;` (15rem = 240px), then `grid-cols-[var(--sidebar-w)_1fr]` (acceptable — token reference passes our refined regex). For settings/notifications, the layout intent is "primary + side rail" — should be a named utility, not page-local.

### H5. `before:w-[5px] before:h-[5px]` pseudo-element status dots
**Cost:** 15 minutes · **Impact:** 5+ list pages
**LAW 3 violations:** `before:w-[5px]`, `before:h-[5px]`

Status-pill dots on shipments / manifests / finance / rates / notifications lists. All 5px square.

**Fix:** `--status-dot: 0.3125rem` (5px) — pixel-perfect token. Or move to an `OpsStatusDot` component if the pattern occurs in ≥3 components.

---

## 🟡 Medium — backlog

Single-route or low-impact. Get them in subsequent PRs, but don't pull on them out of order.

### M1. Manifest table column widths as pixel literals
**LAW 3:** `w-[180px]`, `w-[110px]`, `w-[80px]` (manifests table only)

Per source (`ops-manifests-view.tsx` lines 143–158), these are intentional `eslint-disable-next-line` design-locked widths. They have a documented exception in `docs/design-exceptions.md`. Worth re-evaluating: are they still locked, or can they be `--table-col-narrow/medium/wide`?

### M2. Filter/badge max-width literals
**LAW 3:** `max-w-[520px]` (shipments filter row), `max-w-[240px]` (rates filter row), `max-w-[320px]` (sign-in copy), `min-w-[74px]` (notifications badge)

Page-local layout constraints. Promote to tokens if they recur ≥3×; otherwise mark as exception.

### M3. `duration-[80ms]` on /ops-console only
**LAW 3:** `duration-[80ms]`

The motion-token system already has `--duration-fast` at 80ms (per `CLAUDE.md`). This is a single-location oversight — find it (a Recharts container likely), swap to `duration-fast` utility.

### M4. `tracking-[-0.01em]` on brand logo
**LAW 3:** `tracking-[-0.01em]`

Single occurrence, on the sidebar logo wordmark. Likely intentional micro-kern. Either add `--tracking-tight: -0.01em` or annotate as exception.

### M5. `border-l-[3px]` accent on /finance
**LAW 3:** `border-l-[3px]`

Active-row left accent on finance list. Should resolve to the same `--indicator-w` token as H3's sidebar indicator (both 3px). Two birds, one fix.

### M6. `heading-order` violation on /ops-console/audit
**WCAG:** 1.3.1
**Impact:** 1 route, 1 node

Heading hierarchy skips a level somewhere on the audit page (likely h1 → h3 with no h2). Single-component fix in the audit page render.

### M7. `w-[calc(100%+4rem)]` bleed-out chart on /ops-console
**LAW 3:** `w-[calc(100%+4rem)]`

Intentional negative-margin chart bleed for the growth chart. Either keep with documented exception, or compute the bleed value into a token (`--chart-bleed: 4rem`) and express it as `[calc(100%+var(--chart-bleed))]`.

---

## Audit gaps to close in a follow-up

These were NOT audited and need a separate pass before the cherry-pick queue is fully drained:

| Surface | Why deferred | Quick re-fire cost |
|---|---|---|
| `/shipments/create` (4-step wizard) | Most complex form; per-step a11y context may differ | 20 min |
| `/manifests/create`, `/rates/create` | Sibling layouts to audited create routes | 10 min each |
| `/customers/<uuid>`, `/shipments/<uuid>` detail pages | Audited only manifest detail | 15 min each |
| Command palette (Cmd+K) | Couldn't trigger reliably via `preview_click` | 15 min via `preview_eval` keypress synthesis |
| Empty state filter (`?status=overdue` with no matches) | Skipped — empty-state component covered indirectly via list audits | 15 min |
| Hub-config persistence flow (add / rename / delete / reload) | Functional flow, not a11y — belongs in the TestSprite extension we discussed | 30 min |
| Dark mode pass | Light mode only audited | 1 hour (re-run full sweep at `colorScheme: 'dark'`) |
| Mobile / tablet viewports | Desktop 1280 only | 1 hour (re-run with `preview_resize`) |

**Recommended:** close the form-a11y fix (C1) first since it's the same fix in 5 places — then re-run audit on all 5 wizards in one pass to confirm the pattern fix worked everywhere.

---

## Suggested PR sequence

Each line = one focused PR. Branch off main, fix the bullet, ship.

1. **`fix(ui): wire aria-invalid + aria-describedby in all 5 wizards`** — closes C1 (2 WCAG criteria, 5 forms)
2. **`fix(tokens): raise --sidebar-foreground-muted + --paper-fg-3 to meet 4.5:1`** — closes C2 (1 criterion, 12 routes)
3. **`fix(ui): wrap OpsFrame top-right cluster in role=region`** — closes C3 (2 criteria, 13 routes)
4. **`fix(tokens): introduce --sidebar-w / --toggle-h / --indicator-w / --shadow-paper-sticky`** — closes H2 + H3 + H4 + M5 in one go (LAW 3 × 8 unique violations)
5. **`fix(auth): pin browser client to module scope to drop Strict Mode lock churn`** — closes H1 (investigation may surface more)
6. **`fix(ui): --status-dot token + sweep before:w-[5px] / before:h-[5px]`** — closes H5
7. **Re-run audit (R0.1)** — verify no regression on the 5 wizards, then sweep the 8 deferred surfaces from "Audit gaps to close"
8. **`fix(ui): /ops-console/audit heading hierarchy`** — closes M6
9. Remaining mediums (M1–M4, M7) — cluster into a single "LAW 3 cleanup" PR

After PRs 1–6 land, **C+H tier is empty**, R0 visual checklist becomes safe to walk, and VRT baselines can finally be captured.

## Tooling note

This audit was a one-shot via `Claude_Preview`. To re-run after each PR ships, the eval payloads in `.audit-cache/audit-eval.js` (extracting from this session — TODO if useful) can be replayed against any URL set. The 4-pass shape (axe / radius / arbitrary / console) is stable; only the route list changes.

---

# R0.1 Re-audit — 2026-05-13 (post-wizard-restoration)

Re-fired `Claude_Preview` against the three restored multi-step wizards (PR 2–4). Per-route caches in `.audit-cache/re-audit-{invoice,manifest,shipment}-create.json`. Console errors during the entire run: **0**. LAW 13 (zero-radius): **0** violations across all three. The findings below are NEW relative to the morning baseline.

| Route | NEW axe | NEW LAW 3 | Notes |
|---|---|---|---|
| `/ops-console/finance/create` | **`label` (CRITICAL)** ×1 + **`select-name` (CRITICAL)** ×1 | none | Both inside the `InvoiceWizard.Field` primitive — bare `<input>`/`<select>` not wired to their `<label>`. Pre-existing bug in the wizard primitive, surfaced by restoration. |
| `/ops-console/manifests/create` | **`button-name` (CRITICAL)** ×2 + `page-has-heading-one` (moderate) | `lg:grid-cols-[2fr_3fr]` | 2 icon-only buttons in wizard chrome missing `aria-label`. h1 missing because PR 3 dropped `OpsPageHead` and `ManifestBuilderWizard` renders no h1. |
| `/ops-console/shipments/create` | `page-has-heading-one` (moderate) | `sm:max-w-[220px]` | Cleanest of the three. Same h1 cause as manifest. |

## What this means for the ranking

The original `docs/r0-audit-findings.md` had **3 critical-tier WCAG criteria across the audit**: C1 (form error association), C2 (color-contrast), C3 (region landmark). The restoration just added **3 more critical-tier issues** + **1 moderate-tier issue across 2 routes**. New ranking inserts:

### 🔴 Critical — adds to the head of the queue

#### C4. `InvoiceWizard.Field` doesn't wire `<label>` to its child input
**Leverage:** ⭐⭐⭐⭐ (one fix, ~30 fields across the 4-step wizard)
**Cost:** ~30 min · **Impact:** every screen-reader user submitting any invoice
**WCAG:** 1.3.1 Info & Relationships (A), 4.1.2 Name/Role/Value (A) — fails axe `label`

In `packages/ui/src/components/composed/finance/invoice-wizard.tsx`, the `Field` component wraps `{children}` in a `<label>` but the inner `<input>`/`<select>` is rendered as a render-prop child, not as a direct child. The implicit label association breaks because the children are nested inside extra divs.

**Fix:** make `Field` accept an explicit `id` prop, set the `<label htmlFor={id}>`, and assert that every `<input>` / `<select>` inside the wizard has `id={something}`. ~10 sites to update.

#### C5. `InvoiceWizard` Payment Mode `<select>` has no accessible name
Same root cause as C4. Bare `<select>` with no `<label>` association.

#### C6. `ManifestBuilderWizard` step-setup has 2 unnamed icon-only buttons
**Cost:** ~10 min · **WCAG:** 4.1.2 Name/Role/Value (A) — fails axe `button-name`

Likely the AWB scan-input close / clear buttons or the manifest type swap button (`AIR` ↔ `TRUCK`). Add `aria-label` to both.

### 🟠 High — adds to "fix this sprint"

#### H6. Manifest + shipment wizards render no `<h1>`
**Cost:** ~5 min · **WCAG:** 2.4.6 Headings and Labels (AA), 1.3.1 Info & Relationships (A)

PR 3 + PR 4 dropped `OpsPageHead` from the page.tsx files because the wizards "render their own chrome." But the wizard step indicators aren't `<h1>` — they're plain text rows. Two fixes possible:
- **Fast path:** add `OpsPageHead` back to the page.tsx with `title="New Manifest"` / `title="New Shipment"` (the head will visually sit above the wizard's step indicator — acceptable layering)
- **Cleaner path:** render an `<h1>` inside the wizard primitive's first step heading (`Wizard` component change in `packages/ui/src/components/primitives/wizard.tsx`)

I'd ship the fast path now and let the cleaner path land in a wizard-primitive PR.

## Suggested PR sequence (revised)

After PR 6 (orphan gate) landed, the next focused PRs:

8. **`fix(ui): InvoiceWizard.Field wires htmlFor/id + select-name`** — closes C4 + C5
9. **`fix(ui): aria-label the 2 icon-only buttons in ManifestBuilderWizard`** — closes C6
10. **`fix(routes): restore OpsPageHead on manifest/create + shipment/create`** — closes H6
11. *(then PRs 1–6 from the original ranking above)*

Total new work surfaced by the re-audit: **~45 min**. Less than I expected when I noted "expect the Wizard primitive's step indicator likely adds 2–3 new color-contrast nodes" earlier in this doc — the actual new findings were a11y label/button-name (worse) but not contrast (better).

## What did NOT regress

- ✅ LAW 13 (zero-radius): still 0 violations across all 16+3 routes
- ✅ Console errors: still 0
- ✅ LAW 3 surface area: only 3 new unique violations, all in wizard internals (`lg:grid-cols-[2fr_3fr]`, `sm:max-w-[220px]`, `hover:shadow-[5px_5px_0_0_var(--border)]`)
- ✅ Color-contrast: counts on the restored routes (10/7/8) are at or below the corresponding list-page counts (table cells were the worst offenders)
- ✅ `region` landmark + sidebar contrast: same set of shared-chrome violations as baseline; **no new shared-chrome regressions**

## Now we're truly ready for VRT baseline capture

Before the morning audit: VRT baselines would have locked in the wizard a11y bugs that the restoration just surfaced. After R0.1 + PRs 8/9/10 land: the surface is genuinely stable. **At that point** the VRT baseline `pnpm --filter dashboard exec playwright test --update-snapshots e2e/visual/baseline.spec.ts` becomes the right next move — same as the runbook always said.

---

# R0.2 Re-audit — 2026-05-13 (post-fix verification)

PRs 8/9/10 landed. Re-fired `Claude_Preview` against the same three wizard surfaces. Console errors: **0**. LAW 13: **0** violations. Per-route results:

| Route | R0.1 findings | R0.2 result | Δ |
|---|---|---|---|
| `/ops-console/finance/create` | `label` (critical) + `select-name` (critical) + shared chrome | **only shared chrome** (color-contrast 10, region 3) | **2 criticals resolved** ✓ |
| `/ops-console/manifests/create` | `button-name` (critical) ×2 + `page-has-heading-one` (moderate) + shared chrome | **only shared chrome** (color-contrast 7, region 3) | **3 issues resolved** ✓ |
| `/ops-console/shipments/create` | `page-has-heading-one` (moderate) + shared chrome | **only shared chrome** (color-contrast 8, region 3) | **1 moderate resolved** ✓ |

**Net of restoration + fixes: zero new violations.** Every wizard surface is at the same a11y compliance level as the pre-existing list pages. The shared-chrome findings (C2 color-contrast, C3 region landmark) are unchanged — those are still queued as the existing Critical-tier fixes.

### What worked

| PR | Fix | Mechanism |
|---|---|---|
| 8 | `InvoiceWizard.Field` wraps children in `<label>` | Implicit label-input association; one primitive change covers ~30 fields across the 4-step wizard |
| 9 | `Combobox` accepts `aria-label` prop, passes through to trigger button; `step-setup.tsx` explicitly wires "From Hub" / "To Hub" labels | Combobox now always emits an `aria-label` (falling back to placeholder), preventing future button-name regressions across every Combobox consumer |
| 10 | `OpsPageHead` restored on manifest/create + shipment/create | Each page now renders an `<h1>` even though the wizard primitive doesn't |

### What's verified now

- ✅ The phase-r0.spec.ts E2E suite (85 tests) is the boolean gate — passes
- ✅ The Claude_Preview pass is the visual-judgment + a11y gate — passes (only pre-existing shared-chrome findings remain)
- ✅ Lint × 7 / typecheck × 7 / governance — passes
- ✅ Orphan-component gate is live with 39-entry baseline — prevents this regression class permanently
- ✅ Console error / warning sweep — 0 errors, only the pre-existing Supabase gotrue-js auth-lock warning

**VRT baseline capture is now safe.**

Run when ready:
```
pnpm --filter dashboard exec playwright test --update-snapshots e2e/visual/baseline.spec.ts
git add apps/dashboard/e2e/visual/baseline.spec.ts-snapshots/
git commit -m "test(visual): Phase R0 baseline snapshots — post-wizard-restoration"
```

After that, the original C2 / C3 / H1–H5 / M1–M7 backlog from the morning audit becomes the cherry-pick queue — start at the top (C2 color-contrast token swap, highest leverage).
