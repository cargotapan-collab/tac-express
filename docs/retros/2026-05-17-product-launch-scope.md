# Retro — Product-launch scope (customer-facing surface) (2026-05-17)

**PR:** TBD.
**Type:** META scoping session — zero UI, zero production code.
**Role:** Senior Frontend Architect + UI/UX Designer + PM + CTO. PM + design lenses primary.
**Branch:** `docs/product-launch-scope` from main `f53cab4f`.

---

## 1. TL;DR

Audited the customer-facing surface end-to-end (apps/web public + apps/dashboard auth) and scoped the work into a FINITE PRODUCT-LAUNCH-BLOCKER list — same shape as PR #155 did for the engineering DoD. Result: **4 PRODUCT-LAUNCH-BLOCKERS** (PL-1 landing metadata; PL-2 customer-journey + CTA; PL-3 mobile responsiveness; PL-4 visual+a11y e2e baseline) and **7 OWNER DECISIONS REQUIRED** (OD-P1 through OD-P7), with OD-P1 (customer-journey model: sales-led B2B vs self-serve) as the load-bearing gate.

Bailout did NOT fire — the customer-facing surface is materially built (15 marketing pages, working operator sign-in via Supabase, comprehensive PublicNav + Footer, Violet Grid tokens in use). The single most surprising audit finding: **the landing page has no `metadata` export** (zero SEO/social-sharing preview on the most-shared URL).

---

## 2. Surface audit findings (PHASE-0 A)

| Surface | What exists | Quality |
|---|---|---|
| Landing `/` (apps/web) | `WastelandLanding` 481 LoC, Violet Grid tokens, motion/react entrances | Substantial build; **no metadata**; desktop-first treatment (`hidden md:block` HUD elements) |
| 14 other marketing routes (about, careers, case-studies, contact, developers, legal × 3, pricing, quote, services + slug, status, track + not-found) | All exist | All sampled (6 of 7) have Metadata, use Violet Grid tokens, real copy. Only `/track` has automated visual+a11y coverage in `e2e/`. |
| Operator sign-in × 2 (`apps/web/sign-in`, `apps/dashboard/(public)/sign-in`) | Both use shared `SignInSplitLayout` + `SignInPageClient` (Supabase email+password) | Working; `apps/dashboard` has `metadata` + `robots:noindex`; `apps/web` lacks metadata |
| Operator sign-up | `apps/dashboard/(public)/sign-up` redirects to sign-in | Sign-up intentionally DISABLED — operators added admin-side |
| Customer sign-up | None exists | TAC Express is operator-only today; customer journey is "marketing → contact/quote → human onboarding" |
| Shared chrome (PublicNav + Footer) | Both well-developed packages/ui components | Reasonable |

**Auth ground truth:** email + password only via Supabase (`createBrowserClient().auth.signInWithPassword`). No OAuth, no magic link, no surfaced password-reset flow.

---

## 3. Gap analysis + triage (PHASE-0 B + C)

### PRODUCT-LAUNCH-BLOCKERS (the finite list — 4 items)

Hard test: "can a real customer credibly land on the site, understand the product, and complete the intended journey?"

| PL-N | Item | Type | Gates |
|---|---|---|---|
| PL-1 | Landing page `metadata` export (title + description + OG + Twitter) | Pure UI / SEO | None — can ship first |
| PL-2 | Customer-journey + landing CTA finalized | Pure UI (if sales-led) / HIGH-RISK auth work (if self-serve) | **OD-P1 (gating)** |
| PL-3 | Mobile responsiveness on critical paths (landing + contact + quote + track) | Pure UI | OD-P2 + OD-P5 + OD-P6 |
| PL-4 | Visual + a11y e2e baseline for landing + critical paths | Pure UI / testing | OD-P5 |

### POST-LAUNCH-POLISH (real, not gating)

Rename `WastelandLanding` (cosmetic); e2e for the other 11 marketing routes; `apps/web/sign-in` metadata; password-reset flow (if OD-P4 says needed); OAuth / magic link (if OD-P4 says needed); loading/error states; `not-found.tsx` brand audit; Lighthouse; i18n.

### WONTFIX-WATCH

Customer sign-up flow IF OD-P1 = sales-led B2B (answering the wrong question).

### Triage bucket counts

- PRODUCT-LAUNCH-BLOCKER: **4**
- POST-LAUNCH-POLISH: **9** named, more possible
- WONTFIX-WATCH: **1** (conditional)

---

## 4. OWNER DECISIONS REQUIRED (PHASE-0 D)

| OD-P | Question | Lean documented (NOT a decision) | Gates |
|---|---|---|---|
| OD-P1 | Customer-journey model — sales-led B2B or self-serve? | Current surface IS sales-led B2B; switching to self-serve is a new workstream | PL-2 + every auth-surface decision |
| OD-P2 | Brand reference — Figma/mockup exists, or is current Violet Grid the brand? | Current implementation appears Violet-Grid-compliant; if no external mockup, the bar IS the current visual | PL-3, PL-4 |
| OD-P3 | Target audience — North-East India per about page; English-only or multilingual? | English-only confirmed = no i18n work | All copy/UX |
| OD-P4 | Auth methods at launch — email+password only / OAuth / magic link / password-reset? | Current = email+password only; admin-side password reset | Auth scope |
| OD-P5 | Public marketing scope at launch — all 15 pages, or MVP carve? | MVP carve allows tighter, more-tested launch | PL-3, PL-4 scope |
| OD-P6 | Mobile breakpoint priorities — 375w / 390w / 768w? | 375w + 768w is typical credible coverage | PL-3 spec range |
| OD-P7 | SEO/discoverability — organic ranking or outreach-linked? | "Both" is most common; informs PL-1 depth | PL-1 depth |

The agent CANNOT proceed with PL-2 / PL-3 / PL-4 work without OD-P1, OD-P2, OD-P5 answered. PL-1 ships independent of all OD-Ps (metadata is mechanical).

---

## 5. Build sequence (PHASE-0 E)

1. **PL-1** — landing metadata (pure UI; no auth touch; smallest; immediate SEO value) — can ship without ANY OD-P resolved
2. **PL-3** — mobile responsiveness on critical paths (pure UI) — gated on OD-P2 + OD-P5 + OD-P6
3. **PL-4** — visual+a11y e2e baseline (pure UI; extends existing harness) — gated on OD-P5
4. **PL-2** — customer-journey resolution — LOW if sales-led / **HIGH risk** if self-serve (would mean building a new customer-sign-up auth flow, its own ship-blocker workstream with PHASE-0)

**Auth-correctness risk distinction:** PL-1 / PL-3 / PL-4 are pure-UI work. PL-2 is the only blocker that MAY touch auth (only if OD-P1 = self-serve). If PL-2 expands into a customer-sign-up flow, that flow needs its OWN PHASE-0 scoping (auth + RLS + customer-side data model + new packages/services surface) — not part of this scope.

---

## 6. Discipline observations

### 6.1 The "while I'm here, fix this button" temptation — resisted

The audit surfaced concrete UI gaps (no landing metadata; desktop-first HUD; legacy `WastelandLanding` naming). The brief was explicit: "DO NOT build, redesign, or modify any landing/auth UI. This session scopes; it does not construct." Recorded each as a triage item; built nothing.

### 6.2 The "expand the blocker list to feel comprehensive" temptation — resisted

The natural pull is to inflate the blocker list ("we should also have password reset, OAuth, i18n, Lighthouse, all 15 routes e2e-covered..."). Each was individually defensible. None met the hard test ("a real customer cannot complete the intended journey without this"). All landed in POST-LAUNCH-POLISH or as OD-P-gated conditionals. **The finite blocker list is 4.**

### 6.3 The owner-decision discipline held

7 OD-P questions surfaced. None guessed. OD-P1 (customer-journey model) is the load-bearing gate; the agent cannot meaningfully scope PL-2 without it. Recorded explicitly with documented leans (not decisions).

### 6.4 The two-bars framing landed

The original DoD framed "production-ready" as an engineering bar. The owner's product-launch question was meaningfully different — and the existing DoD didn't cover it because it was scoped to operability, not customer-meeting. The two-files-two-bars framing in AGENTS.md is the durable codification: a launch requires `engineering_ready AND product_ready`, both finite, both verifiable, both maintained the same way.

---

## 7. Carry-forward

- **Next agent session:** PL-1 (landing metadata) — pure-UI, no OD-P gating, ~1 hour. The smallest concrete unit; doesn't need any owner answer to start.
- **Owner-side gating decisions:** OD-P1 (load-bearing) + OD-P2 + OD-P5 + OD-P6 (specific to PL-3/PL-4 scope). Owner should answer at least OD-P1 + OD-P2 + OD-P5 before PL-3 starts.
- **Independent from engineering DoD closeout:** the owner's SB-2 task + SB-3 P1–P4 verification + OD-1 + OD-2 are parallel; this workstream does not block them and is not blocked by them.

---

## 8. Files changed

```
NEW   docs/launch/product-launch-readiness.md       # the finite scope doc
NEW   docs/retros/2026-05-17-product-launch-scope.md # this file
EDIT  AGENTS.md                                      # two-files-two-bars authority block
EDIT  docs/NEXT-SESSION-HANDOFF.md                   # replaced
```

Zero application source touched. Zero UI built or modified.

---

## 9. OWNER ACTIONS — before next session

Per AGENTS.md Convention B. Numbered, copy-pasteable, single block. Combines the engineering DoD closeout items (carry-forward) + the NEW product-launch OWNER DECISIONS REQUIRED.

### Engineering DoD closeout (unchanged from prior session)

1. **🚀 RUN SB-2** — `scripts/sentry/create-alert-rules.mjs` + verify one rule fires (POST `/api/diagnostics/sentry`) + update [`docs/runbooks/sentry-alert-rules.md`](../runbooks/sentry-alert-rules.md). ~20 min.
2. **Verify SB-3 PREREQUISITES P1–P4** per [`DATABASE-RESTORE.md § 2`](../runbooks/DATABASE-RESTORE.md#2-prerequisites-owner-confirmed--verify-before-launch).
3. **(Optional)** Run the SB-3 dry-run walkthrough per `DATABASE-RESTORE.md § 9` (~30 min).
4. **Decide OD-1** — is [#154](https://github.com/cargotapan-collab/tac-express/issues/154) a SHIP-BLOCKER? Lean: POST-LAUNCH.
5. **Decide OD-2** — should any of the other 4 E1 flows be SHIP-BLOCKERS? Lean: payment-only-sufficient.
6. **Reopen [#94](https://github.com/cargotapan-collab/tac-express/issues/94)** OR accept as tracker-less DoD item.
7. **Delete `C:\tac\tac-express\tac-whatsapp-sends-102/`**.
8. **CodeRabbit billing** — update payment method or pay pending invoices.

### Product-launch decisions (NEW — from this scoping session)

9. **OD-P1 (gating)** — Customer-journey model: sales-led B2B or self-serve? Lean: current surface is sales-led B2B (no customer sign-up exists).
10. **OD-P2** — Brand reference: Figma/mockup, or is current Violet Grid the brand?
11. **OD-P3** — Target audience confirmation + language scope (English-only?).
12. **OD-P4** — Auth methods at launch: email+password only, OR add OAuth (which provider?), OR magic link, OR password-reset?
13. **OD-P5** — Public marketing scope at launch: all 15 pages, or MVP carve?
14. **OD-P6** — Mobile breakpoint priorities (375w / 390w / 768w?).
15. **OD-P7** — SEO/discoverability goal: organic ranking, outreach-linked, or both?

**Fifteen owner actions. Item 1 (SB-2) closes the engineering bar; items 9–15 unblock the product-launch workstream. The two workstreams are independent — owner can address them in parallel.**
