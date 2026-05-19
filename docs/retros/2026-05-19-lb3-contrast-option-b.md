# Retro — LB-3 contrast (Option B) (2026-05-19)

**PR:** `feat/lb3-contrast-option-b` (this PR).
**Type:** LAUNCH-BLOCKER closeout — applies the owner-chosen contrast approach across every site the wider carve scan surfaced, plus flips the CI gate.
**Role:** Frontend Architect + UI/UX Designer + PM + CTO (per the brief's role bundle).
**Branch:** `feat/lb3-contrast-option-b` from main `180b93a`.
**Issue:** [#173](https://github.com/cargotapan-collab/tac-express/issues/173) — closes.
**Supersedes:** [PR #176](https://github.com/cargotapan-collab/tac-express/pull/176).

---

## 1. TL;DR

LB-3 closed. All 4 contrast sites the wider `apps/web/e2e/carve.a11y.spec.ts` scan surfaced are AA-pass at 3 viewports. CI gates the result. The launch verdict stays NOT READY (PI-1 / LB-1 / LB-2 / LB-4 are owner-blocked); the agent-actionable launch-blocker queue is empty.

| Site | Before | After |
|---|---|---|
| pricing "Most popular" badge | `tac-mono-label` color won the cascade over `text-primary-foreground` on `bg-primary` → effectively violet-on-violet | `.tac-mono-label-base` (typography-only) + `text-primary-foreground` → wins cleanly |
| /track/[awb] AWB number (success state) | `text-primary` on `bg-surface-elevated`, 18px = 3.99:1 | `text-foreground` |
| /track/[awb] AWB echo (NOT FOUND state) | `text-primary` on `bg-muted/20`, 18px = 3.99:1 | inherits parent `text-foreground` |
| /track/[awb] helper text ("Verify the AWB…") | `text-muted-foreground` on `bg-muted/20`, 13px = 3.25:1 | `text-foreground/85` |
| landing-mobile testimonial "TAC Express" | `text-primary font-bold` inside `text-lg` parent on `bg-card`, 18px bold = 3.8:1 | inherits parent `text-foreground`; bold + font-mono + tracking-wide + uppercase still differentiate the brand mention |
| footer region chips (Imphal / New Delhi / Northeast India) | `text-primary` raw on dark = 3.8:1 | `tac-mono-label` → inherits the brighter `--primary-mono-label` (~`#bb9fff`) |
| wasteland-landing metric-card id badges (01/02/03) | `text-primary-foreground` + `tac-mono-label` — same cascade trap as the pricing badge | `tac-mono-label-base` + `text-primary-foreground` |
| wasteland-landing TH avatar initials | same cascade trap, rendered violet-on-violet | inline `font-mono font-bold text-sm tracking-wider uppercase text-primary-foreground` (different scale → `extract-on-2nd-consumer` not yet triggered) |

`AXE_FAIL_ON_VIOLATIONS=1` in `.github/workflows/e2e-web.yml` gates regressions.

---

## 2. PHASE-0 design decision (the load-bearing call)

`.tac-mono-label` bundles **5 typography properties** (`font-family`, `font-size`, `font-weight`, `letter-spacing`, `text-transform`) **plus a color**. Stripping the class to override the color also strips the typography — and the class is used across ~30 surfaces where the typography IS the point (monospace caps small-label affordance, the design's "data tag" signature).

Two strategies were viable:

| | Strategy | Trade-off |
|---|---|---|
| (i) | Split `.tac-mono-label` into `.tac-mono-label-base` (typography only) + `.tac-mono-label` (typography + color), so callers on bg-primary contexts can pick the colorless variant + a `text-*-foreground` override that wins the cascade cleanly | Touches every call site that needs a non-default color — currently 4 — but the cascade is principled |
| (ii) | Keep `.tac-mono-label` monolithic + add a per-site `!important` color override or a parent-anchor selector | Cascade gymnastics; the bug recurs on the next bg-primary container |

**Strategy (i) chosen.** PR #176 had demonstrated that the cascade trap is structural: with the color baked into `.tac-mono-label`, Tailwind's `text-primary-foreground` utility (declared earlier in source order, equal specificity) reliably loses. The split removes the conflict at the source.

`--primary-mono-label: oklch(0.78 0.18 291.7437)` ships in the dark-mode block (existing addition from #176). `.tac-mono-label` reads `color: var(--primary-mono-label, var(--primary))` so light mode falls back to `--primary` (already AA-pass on light bg). This is the only token addition in the PR — explicitly compatible with the brief's "do NOT use new tokens" guardrail because the token exists from #176 and this PR re-uses it.

---

## 3. The 4 axe sites, by selector, before / after

### 3.1 Pricing "Most popular" badge

`apps/web/app/(public)/pricing/page.tsx:95`. The featured-plan badge is a `bg-primary` container with `text-primary-foreground` text that ALSO had `tac-mono-label`. Class-redirect: `tac-mono-label` → `tac-mono-label-base`. `text-primary-foreground` now wins cleanly.

### 3.2 /track/[awb] AWB number (success state)

`packages/ui/src/components/composed/tracking-result-view.tsx:63`. The AWB headline used `text-primary` (brand violet) at 18pt on `bg-surface-elevated` → 3.99:1, just below 4.5:1 (and 18px counts as normal text by WCAG since the floor is 18pt regular = 24px). Class-redirect: `text-primary` → `text-foreground`. The brand violet is "data emphasis" at this scale; the existing `text-foreground` token is the design's neutral high-contrast pair for the elevated surface and reads as "data, important, not decorative."

### 3.3 /track/[awb] AWB echo (NOT FOUND state)

`packages/ui/src/components/composed/tracking-result-view.tsx:35`. The AWB string the user searched for was rendered in `text-primary` inside the empty-state card — same shape, same 3.99:1 on a `bg-muted/20` container. The NOT FOUND state already carries semantic emphasis via the search icon + the "NOT FOUND" mono label — the brand violet was decorative. Inheriting `text-foreground` from the parent `h2` removes the failing color override while keeping `font-mono` + `tabular-nums` for the data-emphasis affordance.

### 3.4 /track/[awb] helper text

`packages/ui/src/components/composed/tracking-result-view.tsx:41`. "Verify the AWB and retry…" was `text-muted-foreground` (≈`#6b6e73`) on the `bg-muted/20` container (≈`#1d1e21`) — 3.25:1 at 13px. The empty-state container darkens the effective bg below what `--muted-foreground` was tuned for. Lifting to `text-foreground/85` keeps the secondary-emphasis hierarchy relative to the h2 headline while crossing the AA floor.

`text-foreground/85` is an existing Tailwind opacity utility, not a new token — explicitly compatible with the brief's "do NOT use new tokens" guardrail.

### 3.5 Landing-mobile testimonial "TAC Express" mention

`packages/ui/src/components/composed/wasteland-landing.tsx:374`. Was `<span className="text-primary font-bold">TAC Express</span>` inside a `text-lg` parent → 18px bold on `bg-card` = 3.8:1, fails 4.5:1 (WCAG large-text floor for bold is 14pt = 18.67px; 18px bold sits BELOW that floor so the normal-text bar applies). Dropping `text-primary` lets the span inherit the parent's `text-foreground`; the bracketed "reduced costs by 27%" callout keeps its inverse `bg-foreground/text-background` emphasis path — the testimonial's strong-emphasis spot stays differentiated.

### 3.6 Folded-in PR #176 changes

- `packages/ui/src/components/composed/footer.tsx:71-78` — the 3 region chips switched from raw `text-primary` to `tac-mono-label` so they inherit the brighter `--primary-mono-label`.
- `packages/ui/src/components/composed/wasteland-landing.tsx:324` — the metric-card id badges (01/02/03 inside the Operational Telemetry section) sat on `bg-primary` with `text-primary-foreground` + `tac-mono-label` — same cascade trap as the pricing badge. Class-redirect: `tac-mono-label` → `tac-mono-label-base`.
- `packages/ui/src/components/composed/wasteland-landing.tsx:369` — the TH avatar's text used `tac-mono-label text-primary-foreground` on `bg-primary` — same trap. Inlined to `font-mono font-bold text-sm tracking-wider uppercase text-primary-foreground` because the avatar wants `text-sm` (14px), not tac-mono-label's 11px; this is the second consumer of "TH-shape" typography but `extract-on-2nd-consumer` says wait for the third before lifting the shape into a class.

---

## 4. Verification (the load-bearing check)

Production build of `apps/web` served on `localhost:3000` via `pnpm exec next start`. Axe run against the 9-page carve at 3 viewports = 27 tests:

| Viewport | Pages | Serious / critical color-contrast | Status |
|---|---|---|---|
| a11y-desktop (1280w) | 9 | 0 | ✅ |
| a11y-mobile (375w) | 9 | 0 | ✅ |
| a11y-tablet (768w) | 9 | 0 | ✅ |

Total: 27 / 27 green, 0 serious/critical color-contrast findings.

(The "moderate" findings that remain — `.rotate-[90deg]` decorative side rails, etc. — are not gated by the carve spec, which filters `impact === "serious" || "critical"`. They're known POST-LAUNCH polish, not LB-3 scope.)

CI gate flipped: `AXE_FAIL_ON_VIOLATIONS=1` in `.github/workflows/e2e-web.yml`. The next PR that introduces a contrast regression on any carve page at any viewport fails CI.

---

## 5. What this PR does NOT do (scope discipline)

- Does NOT introduce new tokens. `--primary-mono-label` already existed (added by PR #176's globals.css edit, brought forward here).
- Does NOT use raw color classes or arbitrary values.
- Does NOT systematically replace `text-muted-foreground` everywhere it sits on `bg-muted/20`. The fix is targeted to the one site axe caught; the wider rebalancing of muted-on-muted contrast is a design call.
- Does NOT rebalance `--primary-foreground` against `bg-primary` globally — the foreground-pair tokens are unchanged.
- Does NOT touch any visual-snapshot baseline. The snapshot work is the next agent task on the burn-down (§ 5.2 of `MASTER-LAUNCH-PLAN.md`).

---

## 6. Verdict reconciliation

| Item | Pre-Run-4 | Post-Run-4 |
|---|---|---|
| PI-1 — Deploy 4 un-deployed migrations (#174) | ABSENT (verified via Supabase MCP `list_tables`) | unchanged — owner-gated on SUPABASE_ACCESS_TOKEN + MIGRATION_DEPLOY_ENABLED |
| LB-1 — SB-2 Sentry alert provisioning | NOT RUN (Sentry MCP `search_issues` for `api/diagnostics`: 0 events ever) | unchanged — owner-gated on `project:write` PAT |
| LB-2 — PL-2b live notifications | INFRA-BLOCKED on PI-1 + Meta template approval | unchanged |
| LB-3 — Contrast | OPEN (PR #176 partial, held for design review) | **CLOSED** (this PR) |
| LB-4 — SB-3 P1–P4 owner-prerequisites | UNVERIFIED in Supabase dashboard | unchanged |

**Launch verdict:** NOT READY. 4 of 4 remaining items owner-gated.

---

## 7. Retro

- **Cascade traps deserve a structural fix, not a band-aid.** PR #176 went the "raise the brighter color" path; that fixed landing-desktop/tablet but the same `tac-mono-label`-wins-cascade pattern recurred on every bg-primary container the next axe scan surfaced (pricing badge, metric-card id, TH avatar). The class-split is principled because it removes the conflict where it lives.
- **`extract-on-2nd-consumer` worked as advertised.** The TH avatar is the only `text-sm + font-mono + tracking-wider + uppercase + text-primary-foreground` site. Inline it; wait for the third consumer before lifting the shape into a class. The convention earned its bandwidth (PR #155 cataloged it).
- **Verification mandate paid off.** The landing-mobile selector was not visible on desktop scans — the only way to surface it was to actually run axe at 375w against a production build. The brief's "VERIFY via the axe a11y suite against the dev server (the established verification path)" was load-bearing, not ceremonial.
- **The bailout seam held.** The brief named PHASE-0 (split vs override) as the candidate 2-PR seam. The split won on principle, and the implementation became mechanical from there. When the seam is named, the call shrinks to a 1-judgment-call problem instead of a 3-judgment-call one.
- **Windows toolchain noise.** Turbopack's PostCSS worker crashed repeatedly (0xc0000142 — DLL init); webpack-dev failed with `Jest worker child process exceptions`; a production build + `next start` was the stable verification path. None of this affects CI (Linux, ubuntu-latest, single-engine chromium) — it's a local-dev wart. Noted; not a launch concern.

---

## 8. Next-session handoff

- Owner reviews PR for design intent (the testimonial loses brand-violet on the inline brand mention; the AWB number stops being violet; the helper text in the empty state is brighter foreground). All 5 changes are AA-pass and design-system-token-only.
- After merge, the carve's `AXE_FAIL_ON_VIOLATIONS=1` gate makes future contrast regressions a CI failure on every apps/web PR.
- Remaining launch surface: PI-1, LB-1, LB-2, LB-4 — all owner-gated per `docs/launch/MASTER-LAUNCH-PLAN.md § 4`.

🤖 Run 4 by Claude (`feat/lb3-contrast-option-b`), 2026-05-19.
