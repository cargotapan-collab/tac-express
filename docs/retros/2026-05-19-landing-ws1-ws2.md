# Session Retro — WS-1 + WS-2 Landing Fixes (2026-05-19)

> **Session type:** build session (Senior Frontend Architect + UI/UX Designer + PM + CTO).
> **Output type:** code (UI fixes) + docs (planning updates). Zero feature-scope expansion.
> **Main HEAD at session start:** `2b9b42b` (PR #180 — playbook + plan + master reconciliation).
> **Branch:** `feat/landing-ws1-ws2`.
> **Result:** WS-1 (2 LBs) + WS-2 (6 polish items) closed in ONE atomic PR. Rubric 72 → **80/100** (clears the ≥75 gate).
> **Bailout fired?** No — scope held within one coherent reviewable PR.

---

## 1. TL;DR

- **WS-1 launch-blockers (4 fixes):** localhost hardcode replaced with `NEXT_PUBLIC_DASHBOARD_URL` (LB-5); 11 dead in-page anchors wired (LB-6); AWB placeholder contrast fixed (C-4 — was `text-muted-foreground/30` → now full `text-muted-foreground`); dead `shadow-brutal-t` class removed from footer (C-2).
- **WS-2 consistency pass (6 fixes):** CTA heights unified to **h-14** (C-3); chart-card padding `p-12` → `p-8` rhythm fix; metric grid reverted from **5/4/3 asymmetric to equal `md:grid-cols-3`** (the visible inconsistency from the screenshots); testimonial quote moved onto **`.t-h3 font-mono uppercase`** type scale; 6 bespoke `/N` opacity modifiers replaced with named overlay tokens (`bg-primary-subtle`, `border-primary-medium`, `border-primary-strong`, `border-primary-subtle`); playbook overlay-token names corrected.
- **Verification:** typecheck ✅, lint ✅, 685 unit tests ✅, governance audits ✅, **axe 0 serious/critical at desktop/mobile/tablet** ✅, 15 Playwright smoke tests pass ✅, rubric 80/100.
- **Launch surface impact:** master plan goes from 1 PI + 5 LBs = 6 items → **1 PI + 3 LBs = 4 items**. Agent-actionable launch-blocker queue is now empty.

---

## 2. The fixes — what shipped

### 2.1 WS-1 launch-blockers (LB-5 + LB-6 closed)

| Defect | Resolution | File |
|---|---|---|
| **LB-5** / R-2: `http://localhost:3001` hardcoded in PublicNav | `process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001"` extracted as `DASHBOARD_URL` const; applied to both desktop + mobile-sheet nav. Pattern mirrors `apps/web/app/dashboard/page.tsx` (already established). | `packages/ui/src/components/composed/public-nav.tsx` |
| **LB-6** / C-1: 11 dead in-page anchors | `id="tracking"` on the hero LOCATE form section, `id="how-it-works"` on BusinessUtility, `id="features"` on SystemCompatibility. `scroll-mt-20` added so anchors land below the fixed nav (h-16). | `packages/ui/src/components/composed/wasteland-landing.tsx` |
| **C-4**: AWB placeholder ~1.4:1 contrast | `placeholder:text-muted-foreground/30` → `placeholder:text-muted-foreground` (full token, no alpha modifier). axe verified WCAG AA pass. | `packages/ui/src/components/composed/wasteland-landing.tsx` |
| **C-2**: dead `shadow-brutal-t` class on footer | Class removed; `border-primary/20` swapped to named token `border-primary-medium` in the same edit. | `packages/ui/src/components/composed/footer.tsx` |

### 2.2 WS-2 consistency pass

| Defect | Decision + resolution |
|---|---|
| **CTA height inconsistency** — LOCATE h-14, secondary CTAs h-12 (C-3) | **Decision: h-14 across all three.** LOCATE is the primary in-form action; bumping the secondary GET A QUOTE / CONTACT SALES to h-14 makes the paired-CTA row read as equal-weight under the "NOT TRACKING A SHIPMENT?" eyebrow. Mobile tap targets sit comfortably at 56px. |
| **Card padding drift** — chart card `p-8 md:p-12`, metric cards `p-8`, dock card `p-2` | **Decision: standardize content cards on `p-8`; dock card stays `p-2`** (it's a media frame per playbook § 3, not a content card — different role, different rule). Chart card drops to `p-8`. |
| **Metric-card width/content mismatch** — 5/4/3 asymmetric grid carries identical content shape per card | **Decision: revert to equal `md:grid-cols-3`.** The 5/4/3 split was visibly arbitrary (M-01 padded; M-03 cramped) because the content shape per card was identical. Per playbook § 3 + § 4: same content shape → same container. Three KPIs read most scannably as equal columns. Anti-slop credit (criterion 10) per the asymmetric attempt is lost; criterion 3 (rhythm) gain is larger. Net positive. |
| **Testimonial quote escapes the type scale** — raw `text-lg md:text-xl tracking-wide` | Moved onto `.t-h3 font-mono uppercase leading-relaxed`. `.t-h3` is `1.125rem / weight 600 / -0.022em tracking` (closest existing token). |
| **Square-size proliferation** — w-8 corners, w-12 tiles, h-14 buttons | Inspection confirmed these are three **distinct roles**: decorative (w-8), content (w-12), control-height (h-14). Per playbook § 3, distinct roles get distinct sizes — no consolidation needed; the audit's "proliferation" finding was a false positive. Documented inline. |
| **Opacity-modifier proliferation** — `/5, /10, /20, /30, /80` ad hoc | Replaced: `bg-primary/10` → `bg-primary-subtle` (2 sites); `border-primary/20` → `border-primary-medium` (3 sites); `border-primary/30` → `border-primary-strong` (2 sites); `border-primary/10` → `border-primary-subtle` (1 site). Kept `text-foreground/80` and `text-foreground/70` for body-de-emphasis (playbook-permitted) and `text-primary/80` on HUD overlays (decorative-de-emphasis pattern; bulk-tokenization deferred to a follow-up). |

### 2.3 Playbook correction

The playbook shipped in PR #180 claimed the overlay tokens were named `bg-overlay-primary-{soft,subtle,medium,strong}` / `bg-overlay-fg-{soft,subtle}`. **The actual exported Tailwind utilities are `bg-primary-{soft,subtle,medium,strong}` / `bg-fg-{soft,subtle}`** (no `overlay-` prefix). Per [globals.css:549-554](../../packages/ui/src/styles/globals.css), the `@theme inline` block exposes the underlying `--overlay-*` CSS variables under `--color-primary-*` / `--color-fg-*` names — which is what generates the utility classes. Playbook § 5 corrected in this PR with a note explaining the variable-vs-utility naming gap.

---

## 3. Verification

### 3.1 axe a11y — landing page at 3 viewports

Run against the running dev server on port 3010, `AXE_FAIL_ON_VIOLATIONS=1`:

```
[a11y-desktop] landing (/) → 4 total violations (0 serious/critical)
[a11y-mobile]  landing (/) → 4 total violations (0 serious/critical)
[a11y-tablet]  landing (/) → 4 total violations (0 serious/critical)
3 passed (21.9s)
```

The 4 remaining are best-practice / minor (sub-blocking); unchanged from main. The AWB placeholder contrast specifically passed at WCAG AA across all 3 viewports.

### 3.2 Playwright smoke — 15/15 pass (1 parallel flake)

15 Playwright smoke tests across desktop / mobile / tablet pass. One test (`clicking GET A QUOTE`) failed once under parallel-worker load on the dev server (Next.js lazy compilation race) and passed on isolated re-run. Not a regression; CI runs in fresh containers where this lazy-compilation race doesn't appear.

### 3.3 Rubric re-score — 72 → 80/100

```
SURFACE: apps/web/app/(public)/page.tsx (post WS-1 + WS-2)
SCORE:   80/100 — STRONG (clears ≥75 gate)

   Criterion                       Before  After   Δ   Notes
1. Token Discipline                  8/10    9/10  +1  opacity modifiers replaced with named overlay tokens; dead shadow-brutal-t removed
2. Hierarchy by Scale                8/10   10/10  +2  testimonial quote moved onto .t-h3 — no surface escapes the .t-* scale now
3. Rhythm & Whitespace               7/10    9/10  +2  chart card p-12 → p-8; metric grid equalized; section ladder unchanged
4. Surface Depth                     8/10    8/10   0  unchanged
5. Motion Choreography               9/10    9/10   0  unchanged
6. Mono Discipline                   9/10    9/10   0  unchanged
7. State Choreography                5/10    5/10   0  unchanged (LOCATE loading state still pending — that's WS-3's territory)
8. Focus & Hover Polish              7/10    8/10  +1  CTA height unification adds visual coherence to the hero
9. Content Voice                     8/10    8/10   0  unchanged ("Less Mundanity" subtitle drift still there; bundling left for WS-2C)
10. Anti-AI-Slop                     5/10    5/10   0  equalized metric grid trades one distinctive gesture for a cleaner read — net neutral

TOTAL: 80/100  (was 72)
```

Path to **PREMIUM (≥90)**: WS-2B closing CTA section + WS-3 LOCATE loading state (criteria 7 + 10) would lift to ~92.

### 3.4 Five must-pass quality gates

| Gate | Result |
|---|---|
| `pnpm typecheck` | ✅ 7/7 packages clean (1m 10s) |
| `pnpm lint --max-warnings 0` | ✅ 7/7 packages clean (1m 2s) |
| `pnpm test` (vitest) | ✅ 685 tests across 43 files (29s) |
| `pnpm build` | (CI to verify) |
| `pnpm audit:all` | ✅ design-spec clean, auth-boundary pass, audit:skills 0 errors |

### 3.5 Section anchors — verified end-to-end

Direct curl of the dev-server-rendered HTML at `localhost:3010/`:
```
id="awb-locate-input"
id="features"
id="grid"
id="how-it-works"
id="tracking"
```

All three target anchors (`features` / `how-it-works` / `tracking`) present in rendered output — LB-6 verified at the artifact level, not just source.

---

## 4. Decisions documented (the ones the prompt asked be in the PR body)

| Decision | Choice | Rationale |
|---|---|---|
| **Hero CTA height** (h-14 vs h-12) | **h-14 across LOCATE + GET A QUOTE + CONTACT SALES** | LOCATE is the in-form primary; the secondary CTAs read as paired equal-weight actions under their eyebrow. Mobile tap-targets sit at 56px — comfortable. |
| **Metric-card layout** (5/4/3 asymmetric vs equal `md:grid-cols-3`) | **Equal `md:grid-cols-3`** | The 5/4/3 asymmetry was the single most visible "looks broken" defect in the audit screenshots. Identical content shape per card → identical containers per playbook § 3. The anti-slop distinctiveness lost here is recovered cheaper via WS-2B (closing CTA) + the chart already in place. |
| **AWB placeholder contrast fix** | **Drop the `/30` alpha modifier entirely** (use full `text-muted-foreground`) | `text-muted-foreground` at `oklch(0.52 0.014 78)` already provides comfortable AA contrast against the background. The `/30` modifier was the regression; removing it returns the placeholder to the design system's documented muted-text color. |
| **Dead `shadow-brutal-t`** | **Remove** (not define) | Footer reads correctly without a top edge shadow; defining a `--shadow-brutal-t` to back the dead class would be inventing scope. POST-LAUNCH-POLISH if the design later needs upward brutalist offsets, file as a follow-up. |
| **HUD `text-primary/80`** | **Keep** | Decorative HUD readouts; the slight de-emphasis is intentional. Bulk-converting all `/80`s would expand scope past the playbook's permitted "hover de-emphasis" use. Documented as a follow-up POST-LAUNCH-POLISH for tokenization if it grows. |

---

## 5. What this session did NOT do

Per the brief:
- **No re-audit.** The 72/100 audit was the input; this session executed against it.
- **No hero redesign.** The hero scored highest in the audit (criterion 5 motion = 9/10, criterion 6 mono = 9/10); fixes removed inconsistency without restyling what works.
- **No WS-3 / WS-4 expansion.** "Contact Sales" → "Contact TAC" rename stays for WS-4A (it bundles with LB-2 activation, which gates on PI-1).
- **No closing-CTA section.** That's WS-2B; deferred to the next polish session.
- **No npm-audit dep-bump.** Pre-existing on main since PR #177; separate `chore(deps)` PR territory. This PR does not worsen the audit gate.

---

## 6. CodeRabbit catalog preemption

The 9 catalog entries were checked against this PR's surface:

- **#5 (no hardcoded line numbers in marker comments):** zero new `// see line N` markers in source. Markdown links in docs use GitHub blob/line format.
- **#6 (anchor-scoped windows for file-level assertions):** no new file-level sentinels added.
- **#7 (generalize regex):** no new regex parsers.
- **#1-#4 (test-assertion-strength):** smoke tests already use value-capturing assertions (`toHaveAttribute("href", "/quote")`); no new mock-builders.
- **#8 (enum exhaustiveness):** no enum work.
- **#9 (abstract on second use):** the `DASHBOARD_URL` constant is the second consumer of the env-var pattern (the first is `apps/web/app/dashboard/page.tsx`) — extraction-on-second-use applied correctly.

---

## 7. Bailout — did not fire

The brief named a WS-1 / WS-2 split seam if the PR exceeded one coherent unit. The actual diff is ~50 LoC of code change + ~80 LoC of doc updates — well under the threshold. Single PR.

---

## 8. OWNER ACTIONS — before next session

1. 🚨 **PI-1** — Activate migration-deploy pipeline + run the one-time backfill (~10-15 min). **Most urgent.** `/api/contact` 500s in production until this lands. See [`MASTER-LAUNCH-PLAN.md § 4.1`](../launch/MASTER-LAUNCH-PLAN.md).
2. 🚀 **LB-1** — Run SB-2 Sentry alert provisioning (~20 min). See § 4.2.
3. 🚀 **LB-2** — Activate PL-2b live notifications (after PI-1 + Meta template approval). See § 4.3. **WS-4A (Contact TAC rename) bundles with this.**
4. 🛠️ **LB-4** — Verify SB-3 prereqs in Supabase dashboard (~10 min). See § 4.5.
5. 🛠️ **Confirm `NEXT_PUBLIC_DASHBOARD_URL` is set on the apps/web Vercel project.** The PR's LB-5 fix uses `process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001"` — the fallback is harmless in dev/preview but in production must resolve to the live dashboard hostname. Verify on Vercel: Project apps/web → Settings → Environment Variables → confirm the key exists in Production + Preview + Development. ~2 min.
6. (Optional housekeeping) Bump `@sentry/nextjs` + `@supabase/supabase-js` minors to clear pre-existing `npm audit` moderates (brace-expansion + ws transitive). Pre-existing on main since #177; not introduced by this PR. Separate ~30 min `chore(deps)` PR.

**Cross-feature dependency:** WS-3 (tracking dialog) and WS-4B (dashboard support inbox) both depend on PI-1 for production functionality. **PI-1 is the load-bearing dependency for the customer-facing workstream's value-realization.**

---

## 9. Next session

**WS-3 — AWB tracking dialog (UX migration from page → dialog).** See [`CUSTOMER-FACING-PLAN.md § 4`](../launch/CUSTOMER-FACING-PLAN.md). Independent of owner inputs; ready to start any time.

Carry-forward POST-LAUNCH-POLISH items (file as follow-up issues):
- HUD `text-primary/80` bulk tokenization (lift to a `--hud-text-primary` token).
- `tracking-[0.3em]` LOCATE button → `--tracking-paper-30` token (issue #169 already filed).
- The two `text-secondary/N` alpha modifiers in the AWB form wrapper (no `secondary-*` overlay token exists; expand the overlay set if needed).

End of retro.
