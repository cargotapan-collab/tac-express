# Phase R0 — Regression Audit Checklist (visual judgment items)

> **Gate:** This + `apps/dashboard/e2e/regression/phase-r0.spec.ts` must both
> clear before we capture the VRT baseline PNGs. Capturing baselines now
> would lock in whatever latent bugs exist as the "expected" output.

**Why this exists.** The shadcn upgrade + single-shell migration + ESLint
LAW gates landed in a tight burst. Static gates + Playwright smokes prove
the booleans; this document covers the things a human has to see —
charts rendering, hub-config persistence across reloads, print-view
layout, idle-timeout behavior, console cleanliness.

Run it on a real dev server with seeded data:

```bash
pnpm --filter dashboard dev
# in a second terminal
open http://localhost:3001
```

**Sign-in once at the top, keep the same window open for the whole run.**
Mark each checkbox as you go; file a regression issue + dismiss the
checkbox if anything fails. Don't carry forward unchecked items into
"done."

---

## Pre-flight

- [ ] Playwright spec `phase-r0.spec.ts` is **green** locally
  (`pnpm --filter dashboard test:e2e -- e2e/regression/phase-r0.spec.ts`)
- [ ] CI has `E2E_USER_EMAIL` + `E2E_USER_PASSWORD` configured
  (verify with `gh secret list`)
- [ ] DevTools Console is open in a separate panel for the full run —
  ANY red entry is a fail. (We accept yellow warnings only from known
  third-parties: Sentry replay, Recharts ResizeObserver loop, hydration
  warnings from `next-themes` first paint.)
- [ ] Network panel shows no failed (red) requests on initial load of
  `/ops-console`

---

## C1. Dashboard charts (4 chart panels)

Open `/ops-console` after sign-in.

- [ ] **Growth chart** (stacked area, Delivered + Exceptions)
      renders with both series visible
- [ ] Growth chart **7D / 30D / 90D** toggle re-renders the area without
      flicker, no console error
- [ ] **Volume chart** (stacked bars, Inbound + Outbound) bars are
      vertically aligned and tooltip appears on hover
- [ ] **Revenue radial chart** renders all service-class segments with
      legend; no overlap between label and arc
- [ ] **Shipment bar chart** (6-month analytics) renders all 6 months
      with bars NOT clipped at the right edge
- [ ] Resize the browser to ~900px wide → all 4 charts reflow
      (no horizontal scrollbar inside the chart card)
- [ ] No `ResizeObserver loop limit exceeded` red error (yellow warning
      OK — recharts is noisy)

## C2. Upcoming Calendar widget

Open `/ops-console` (or wherever the calendar lives).

- [ ] Left / right chevron buttons are inset from the OpsCard corners,
      NOT escaping into the card border
- [ ] Clicking the chevrons changes the visible month
- [ ] Days with scheduled departures (modifier-styled) are visually
      distinct (violet dot / outline)
- [ ] Today's date is highlighted
- [ ] Keyboard nav: arrow keys move the focused day, Enter/Space
      selects it
- [ ] No layout shift when navigating between months

## C3. Hub Inventory (persistence stress test)

Open `/ops-console/inventory`.

- [ ] Default hubs **IMPHAL** and **NEW_DELHI** are visible
- [ ] Click **Add hub**, name it `R0-TEST-HUB`, save
- [ ] Reload the page → `R0-TEST-HUB` is still listed
- [ ] Rename `R0-TEST-HUB` to `R0-RENAMED`, save → label updates
- [ ] Reload → renamed label persists
- [ ] Delete `R0-RENAMED` → it disappears from the list
- [ ] Reload → it stays deleted
- [ ] In a different browser profile / incognito window, the default
      hubs reappear (proves localStorage scope is correct, not a
      cross-tab broadcast)
- [ ] After all of the above, open DevTools → Application → Local
      Storage and confirm key `tac-hub-config-v1` exists with the
      expected JSON shape

## C4. Settings — Hubs tab

Open `/ops-console/settings` → Hubs tab.

- [ ] Hub list matches what `/ops-console/inventory` shows
- [ ] Hidden hubs section exists and any hub you deleted in C3 (before
      cleanup) shows up there as "hidden"
- [ ] "Unhide" restores a hidden hub to the active list
- [ ] "Reset all" wipes everything back to IMPHAL + NEW_DELHI defaults
- [ ] **After Reset all**, the dashboard chart panels still render
      (no NaN, no empty state crash)

## C5. Manifests list — tabs + empty/error states

Open `/ops-console/manifests`.

- [ ] All 7 status tabs render: All / Draft / Building / Open / Closed /
      Departed / Arrived
- [ ] Each tab filters the table (sample 3 random tabs)
- [ ] Switch to a tab that legitimately has no rows → empty state
      `NO "<TAB>" MANIFESTS` appears with the "New Manifest" CTA
- [ ] Click the row's `View →` link → lands on
      `/ops-console/manifests/<uuid>` detail page
- [ ] Click the manifest ID itself → also lands on detail page
      (both link paths work; this is the test the bot-review flagged)

## C6. Customer list — search

Open `/ops-console/customers`.

- [ ] Type any letter into the search box → table filters live
- [ ] Empty the search → full list returns
- [ ] Click any customer → lands on `/ops-console/customers/<uuid>` with
      the right name (no "not found" — this was the Promise<params>
      regression we fixed)

## C7. Shipment detail — Notes tab

Open any shipment from `/ops-console/shipments` → click → detail page.

- [ ] **Notes** tab is present and switchable
- [ ] Notes content renders (it was deleted+restored during the move)
- [ ] Other tabs (Status, History, Documents) still switch cleanly

---

## E. Print views

These are server-rendered routes that bypass the ops shell. Open each
in a new tab; the browser's built-in print preview is the eyeball test.

- [ ] `/print/invoice/<id>` — invoice prints on A4 with no clipping
      at the right margin
- [ ] `/print/invoice-label/<id>` — invoice + shipping label both fit
      one A4 page
- [ ] `/print/label/<id>` — barcode is scannable from the screen
      (use any phone barcode app to verify; if it reads the AWB
      we're good)
- [ ] `/print/manifest/<id>` — every shipment row is visible; long
      manifests paginate without losing the header on page 2+
- [ ] Open browser **Print preview** (Ctrl+P) on any of the above →
      no sidebar / no top-nav bleed-through; only the document
- [ ] **No dark-mode print artifacts** — page is light-on-white
      regardless of system theme

---

## F. Server / boot smokes (visual)

- [ ] Cold-start the dev server (`pnpm --filter dashboard dev`) → no
      red stack trace in terminal during boot
- [ ] First-paint of `/ops-console` shows the **Modern Ivory** light
      palette (NOT the previous Warm Linen, NOT dark) — body bg
      should read `#FFFDF7`-ish, NOT `#F7F4ED`
- [ ] No FOUC (flash of unstyled content) on first load
- [ ] No FOUC of the dark theme then snap-to-light (means localStorage
      seed is working)
- [ ] Sidebar renders **identically** on `/ops-console` and on any
      `/ops-console/<deep>/<route>` — same width, same items, same
      group headings (this was the 4-cycle audit fix)

---

## H. Idle-timeout + auth edge cases (manual — hard to automate)

- [ ] Sign in. Leave the tab open for the configured idle window
      (check `apps/dashboard/components/idle-guard.tsx` for the
      threshold — ~15 min). When it triggers, the idle modal
      appears
- [ ] Click "Extend session" → modal dismisses, can continue working
- [ ] Sign out from the user menu → land on `/sign-in`
- [ ] Hit back button after sign-out → **redirects back to
      `/sign-in`**, does NOT show a cached protected page
- [ ] In DevTools → Application → Cookies, manually delete the
      `sb-*` Supabase cookies and reload `/ops-console` → you're
      redirected to `/sign-in`, no 500 (this is the
      `AuthApiError("Invalid Refresh Token")` recovery path)

---

## I. Console cleanliness (final pass)

Walk through `/ops-console` → analytics → shipments → manifests →
customers → finance → settings, then sign out. At each step:

- [ ] Console has zero **red** entries
- [ ] Network panel has zero failed (red) requests
- [ ] No "hydration mismatch" warnings (one known exception:
      `PopoverTrigger` has `suppressHydrationWarning` set — this is
      fine and was added intentionally)

---

## Sign-off

When every checkbox above is ticked:

```text
Phase R0 — Regression Audit
Status: ✅ Clear
Date:   <YYYY-MM-DD>
Auditor: <name>
Build:  <git short SHA>
```

Then — **and only then** — proceed to:

1. Capture VRT baseline PNGs
   (`pnpm --filter dashboard exec playwright test --update-snapshots e2e/visual/baseline.spec.ts`)
2. Commit the snapshots
3. Deploy the @tac registry host
4. Resume the per-primitive cherry-pick queue

If anything failed → file a regression issue with reproducer steps,
fix in a focused PR, re-run **this whole checklist**. Partial re-runs
are how regressions slip through.
