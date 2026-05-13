## Execution log — 2026-05-13

**Status: PR 2–6 landed. Recovery complete. Awaiting live re-audit (PR 7).**

| PR | What | Files | Gates |
|---|---|---|:-:|
| PR 1 | Verification — detail pages NOT silent-regressed | (audit-only) | n/a |
| PR 2 | Invoice wizard restored at `/ops-console/finance/create` | `apps/dashboard/app/ops-console/finance/create/{page,ops-create-invoice-live}.tsx`, `apps/dashboard/e2e/regression/phase-r0.spec.ts` (B4) | ✅ typecheck ✅ lint |
| PR 3 | Manifest builder restored at `/ops-console/manifests/create` | same shape, manifests/ | ✅ ✅ |
| PR 4 | Shipment wizard restored at `/ops-console/shipments/create` | same shape, shipments/ | ✅ ✅ |
| PR 5 | Dead MVP forms deleted | rm `packages/ui/.../forms/{ops-invoice,ops-manifest,ops-shipment}-form.tsx`; clean `forms/index.ts` | ✅ ✅ |
| PR 6 | Orphan-component gate + 39-entry baseline | `scripts/audit-governance.mjs`, `scripts/audit-orphans-baseline.json`, `package.json` (`audit:orphans:refresh-baseline`) | ✅ governance |
| PR 7 | **(pending)** Live re-audit via Claude_Preview against restored wizards | — | — |

**Damage assessment (production DB, query at audit time):**
- 1 invoice, 2 manifests, 2 shipments, 2 customers, 0 rate cards
- All within a 30-min window on 2026-05-12 22:13–22:59 IST, all flagged as test data ("Big Poppa" / "Big Rock")
- No customer-comms recovery needed

**Orphan gate output (PR 6, baseline 2026-05-13 04:33 UTC):**
- 39 pre-existing orphan files snapshotted to `scripts/audit-orphans-baseline.json`
- Any NEW orphan added in future PRs fails CI with a pointer to this doc
- `pnpm audit:orphans:refresh-baseline` shrinks the baseline as orphans get wired up or deleted; growing the baseline requires a deliberate same-PR diff

**Re-audit (PR 7) — manual step:**
```
1. Stop your dev server (Get-NetTCPConnection -LocalPort 3001 → Stop-Process -Id)
2. Say "re-audit" — I fire Claude_Preview again, navigate to the three
   restored wizards, run axe + LAW 3 + LAW 13 + console passes
3. Diff against the 2026-05-13 morning baseline at docs/r0-audit-findings.md
4. New axe / LAW issues introduced by the wizards (if any) get appended to
   the existing tier C/H/M ranking
```

The phase-r0.spec.ts E2E suite (85 tests) is the boolean gate. The Claude_Preview pass is the visual-judgment + a11y gate. Both should clear before VRT baselines are captured. The wizards are visually heavier surfaces than the MVP forms; expect new findings on color-contrast inside the Wizard primitive's step indicator.

---

# v6 → Ops Console MVP Regression Audit

> **Generated:** 2026-05-13. **Trigger:** screenshot of `/ops-console/finance/create` shows literal banner: _"Single-page MVP. Multi-step invoice wizard with rate lookup + line-item breakdown lives at /finance/create on the v6 flow until ported."_
>
> The "v6 flow" was **deleted** in the single-shell migration. The MVP forms shipped as temporary stubs. The full wizards were never ported back. Three of five create surfaces are regressed; their **componentry is still intact in `packages/ui`** — only the route-level wiring was lost.
>
> **Bottom line:** this is not a rebuild. It's a re-wire. ~1 day of work, not weeks.

## Method

For each `/ops-console/*/create` route, we recovered the previous v6 route shell from git (`git show HEAD:apps/dashboard/app/(dashboard)/.../create/*-client.tsx` — files are deleted but unstaged, so `HEAD` still has them) and diff it against the present `ops-create-*-live.tsx`.

For each `/ops-console/*/<uuid>` detail route, the v6 detail client was recovered the same way.

Inventory (in `.audit-cache/v6-*.tsx`) anchors every finding in this doc.

## Headline scoreboard

| Surface | v6 | Current MVP | Regression | Component intact? |
|---|---|---|:-:|:-:|
| **`/finance/create`** | 1107-line `InvoiceWizard` (4 steps: header → cargo → charges → review) + 322-line client (rate lookup, AWB auto-gen, autosave, restore-draft) | `OpsInvoiceForm`: **5 fields** (AWB, customer, total, payment, due date) | 🔴 **MAJOR** | ✅ `invoice-wizard.tsx` (1107L) |
| **`/manifests/create`** | `ManifestBuilderWizard` 4-step (setup → add-shipments → review → close, with barcode scan + AWB validation + save-vs-close) | `OpsManifestForm`: **4 fields** (origin, dest, mode, notes) | 🔴 **MAJOR** | ✅ `manifest-builder-wizard.tsx` + 3 step files |
| **`/shipments/create`** | 4-step `CreateShipmentForm` wizard (sender → receiver → package → review) with `SmartAddressFields` (pincode autocomplete) + dimensional-weight calc | `OpsShipmentForm`: same fields, **single page**, no review, no SmartAddress | 🟠 **PARTIAL** | ✅ `create-shipment-form.tsx` (322L) |
| `/customers/create` | _(did not exist in v6)_ | `OpsCustomerForm`: contact + address two-card layout | — | n/a |
| `/rates/create` | _(did not exist in v6)_ | `OpsRateCardForm` | — | n/a |
| `/finance/<uuid>` | 591-line `InvoiceDetailClient` with: issue, mark-paid, cancel, record-payment dialog, WhatsApp send, print/PDF, payment-timeline | 716-line `OpsInvoiceDetailLive` — _likely at-parity or better, needs spot-check_ | 🟡 **VERIFY** | ✅ all dialogs |
| `/manifests/<uuid>` | 173-line `ManifestDetailClient` | _spot-check pending_ | 🟡 **VERIFY** | — |
| `/customers/<uuid>` | 181-line `CustomerDetailClient` | _spot-check pending_ | 🟡 **VERIFY** | — |
| `/exceptions/<uuid>` | 59-line `ExceptionDetailClient` | _spot-check pending_ | 🟡 **VERIFY** | — |
| `/shipments/<uuid>` notes tab | 36-line `notes-tab.tsx` | restored in earlier session | 🟢 OK | — |

---

## 🔴 MAJOR — `/finance/create` Invoice Wizard

### What was lost
File `.audit-cache/v6-create-invoice-client.tsx` (322 lines) shows the v6 route shell wired up:

| Feature | v6 implementation | MVP today |
|---|---|---|
| **Multi-step wizard** | `InvoiceWizard` primitive with 4 steps: Header → Cargo → Charges → Review | Single-page form |
| **AWB auto-reservation** | `useGenerateAwbNumber()` mutates server on mount → pre-fills field | User must hand-type AWB |
| **AWB regenerate button** | ↻ button calls `generateAwb.mutateAsync()` + toast | Absent |
| **Rate-card auto-lookup** | `useRateLookupMutation()` — given origin/dest/serviceLevel/weight, auto-populates `ratePerKg`, `baseFreight`, `fuelSurcharge`, `docketCharge`, `handlingFee` | No origin/dest/serviceLevel inputs exist |
| **Customer combobox** | `useCustomers({ pageSize: 200 })` → 200-customer searchable lookup with GSTIN/phone meta | Plain text input |
| **Draft autosave** | `useFormAutosave({ key: 'invoice_draft', intervalMs: 5000 })` — persists to localStorage every 5s; restore-prompt on remount | None — refresh kills work |
| **Consignor block** | name + phone + address | Absent |
| **Consignee block** | name + phone + address | Absent |
| **Billing address** | `SmartAddressFields` structured (line1, line2, city, state, zip) + legacy joined string for back-compat | Absent |
| **Charges** | base_freight, pickup_charge, packing_charge, docket_charge, fuel_surcharge, handling_fee, insurance, discount, advance_paid | `total: number` (one field, no breakdown) |
| **GST computation** | `computeInvoiceTotals(state, gstRate/100)` → CGST/SGST/IGST split + total + balance | None |
| **Declared value, actual weight, booking date, nature of quantity** | Stored under `notes` JSON | Absent |
| **Permission-aware errors** | 403/RLS → "Insufficient permissions. A Finance role (MANAGER, INVOICE, or FINANCE_STAFF) is required."; 409/FK → "AWB not found." | Generic `Failed to create: ${msg}` |
| **Notification store** | `useNotificationStore` for cross-page persistence | `toast` (sonner) only — vanishes on nav |

### What's intact (no rebuild needed)
- `packages/ui/src/components/composed/finance/invoice-wizard.tsx` — **1107 lines**, untouched
- `INITIAL_INVOICE_STATE`, `computeInvoiceTotals`, `ComboboxOption` — all exported
- `@workspace/services/invoice-draft.service` (`normalizeBillingDraft`)
- `useGenerateAwbNumber`, `useRateLookupMutation`, `useCreateInvoice`, `useCustomers` — all in `@workspace/services`
- `@workspace/ui/hooks/use-form-autosave`

### Re-wire plan (≈ 1 hour)
Replace `apps/dashboard/app/ops-console/finance/create/ops-create-invoice-live.tsx` (currently uses `OpsInvoiceForm`) with the v6 route-shell logic from `.audit-cache/v6-create-invoice-client.tsx`, with three adjustments:
1. `router.push('/finance/${id}')` → `router.push('/ops-console/finance/${id}')`
2. Wrap in `OpsFrame` + `OpsPageHead` for shell consistency
3. Delete the banner "Single-page MVP. Multi-step invoice wizard … lives at /finance/create on the v6 flow until ported." — this becomes false the moment the re-wire ships
4. Keep `OpsInvoiceForm` as a deprecated component **only if** another caller exists; otherwise delete it from `packages/ui/.../forms/`

---

## 🔴 MAJOR — `/manifests/create` Manifest Builder

### What was lost
File `.audit-cache/v6-create-manifest-client.tsx` (117 lines) wired up a true builder, not a form:

| Feature | v6 implementation | MVP today |
|---|---|---|
| **Multi-step builder** | `ManifestBuilderWizard` with 4 steps: Setup → Add Shipments → Review → Close | Single 4-field form |
| **Hub picker** | `useHubs(true)` → 200-hub combobox with `name · code` labels | Free-text input |
| **AWB barcode scan loop** | Step "Add Shipments" — repeated scan-or-type input, pre-validates AWB via `shipmentService.getShipmentByAwb(awb)`, attaches via `addAwb.mutateAsync({ manifestId, awb })`, builds running table of `consignee/consignor/pieces/weight/status` | Absent — manifest is created with zero shipments |
| **Duplicate / not-found / error scan results** | Returns `SUCCESS` / `DUPLICATE` / `ERROR` with reason string | Absent |
| **Save vs Close distinction** | Save → manifest stays DRAFT/BUILDING, navigable. Close → `useCloseManifest()` locks loadlist into CLOSED state, ready to depart | No state distinction |
| **Notification store integration** | Success/error toasts persist to notification panel | `toast` only |
| **Transport mode** | `setup.type` (AIR/ROAD/RAIL/SEA) | text input "mode" with the same enum but no validation |

### What's intact
- `packages/ui/src/components/composed/manifests/manifest-builder/manifest-builder-wizard.tsx`
- `step-setup.tsx`, `step-add-shipments.tsx`, `step-review.tsx`
- `useCreateManifest`, `useAddShipmentToManifest`, `useCloseManifest`, `useHubs`
- `shipmentService.getShipmentByAwb`

### Re-wire plan (≈ 1.5 hours)
Replace `ops-create-manifest-live.tsx`'s use of `OpsManifestForm` with the v6 route-shell logic. Same redirect-path adjustment + frame wrapping as the invoice case. The barcode scan loop is the most user-critical regression here — operators currently can't build a multi-AWB manifest without going to detail page and adding shipments one-by-one.

---

## 🟠 PARTIAL — `/shipments/create`

### What's different
Both surfaces have the same field set. The regression is structural:

| Aspect | v6 (`CreateShipmentForm`) | Current (`OpsShipmentForm`) |
|---|---|---|
| **Layout** | 4-step `Wizard` primitive: Sender → Receiver → Package → Review | Single tall page with all sections stacked |
| **Pincode autocomplete** | `SmartAddressFields` — type pincode → city/state auto-fill | Absent — user types all 3 fields |
| **Dimensional weight** | L×B×H computed live → volumetric (÷5000) → chargeable (max(actual, volumetric)) → preview | Fields exist but no live computation displayed |
| **Review step** | Final step shows summary before submit | Submit goes direct |

### What's intact
- `packages/ui/src/components/composed/shipments/create-shipment-form.tsx` (322 lines, the wizard)
- `packages/ui/src/components/composed/smart-address-fields.tsx` (the autocomplete)
- `useCreateShipment` mutation

### Re-wire plan (≈ 45 minutes)
Same pattern — swap `OpsShipmentForm` for `CreateShipmentForm`, fix redirect path, drop banner. Verify `SmartAddressFields` still ships with the city/pincode dataset (it was the source of one of our LAW 3 audit findings — 200 city records).

---

## 🟡 VERIFY — detail pages

These weren't included in the live audit because the live audit ran resting-state and routed-state checks. The git-recovered v6 detail clients were **deleted at the route level only**; the dialogs/components they consumed are still in `packages/ui`. Spot-check each current `/ops-console/<x>/[id]/*-live.tsx` against the v6 client below.

| Detail surface | v6 LOC | Current LOC | Features to verify present |
|---|---:|---:|---|
| `/finance/<uuid>` | 591 | **716** | Issue + Mark Paid + Cancel + Record Payment dialog + WhatsApp send dialog + Print/PDF + PaymentTimeline + tax breakdown rendering |
| `/manifests/<uuid>` | 173 | _check_ | Reopen + Depart + Arrive state transitions, shipment table, action bar |
| `/customers/<uuid>` | 181 | _check_ | Edit profile + outstanding-balance pane + shipment history table |
| `/exceptions/<uuid>` | 59 | _check_ | Escalate + Resolve + Notes |
| `/shipments/<uuid>` Notes tab | 36 | OK | Already restored in earlier session |

**Verify the current invoice detail (716L) actually exercises all 7 features above** — the LOC is bigger than v6 but that could just be more chrome / different decomposition. If any of `useIssueInvoice`, `useMarkPaid`, `useCancelInvoice`, `useRecordPayment`, `useSendInvoiceWhatsapp` aren't imported, that's a regression hiding in plain sight.

A 30-second grep:
```bash
for f in apps/dashboard/app/ops-console/{finance/[id],manifests/[id],customers/[id],exceptions/[id]}/*-live.tsx ; do
  echo "=== $f ===" ; grep -E "(useIssueInvoice|useMarkPaid|useCancelInvoice|useRecordPayment|useDeletePayment|useSendInvoiceWhatsapp|useWhatsappTest|useCloseManifest|useDepartManifest|useArriveManifest|useReopenManifest)" "$f" | wc -l
done
```

Per-detail hook coverage = quick proxy for "all v6 actions are still callable from this page."

---

## What this audit does NOT cover (transparent)

- **Field-level parity on detail pages** — needs a side-by-side `OpsInvoiceDetailLive` vs `InvoiceDetailClient` read (716 vs 591 lines, ~2 hours)
- **Print-view routes** (`/print/invoice`, `/print/invoice-label`, `/print/label`, `/print/manifest`) — neither audit (R0 nor this) touched them. They live outside the `ops-console` route group; if the data shape they expect (e.g. parsed `notes` JSON with consignor / consignee / billing) is no longer populated because the MVP create flow doesn't capture it, print views may render empty fields silently. **High-risk silent regression.**
- **Server actions / API routes** — the wizards talked to `useCreateInvoice`, `useCreateManifest`, etc. These hooks still exist and the MVP forms call the same hooks with smaller payloads. The hooks themselves and the underlying tables are not regressed.
- **`/track` public view** — no v6/MVP wizard there.

---

## Recovery sequence

**Order matters** — each PR should be small + green before the next:

1. **PR 1 — Audit detail pages and confirm** (≈ 1 hour)
   - Run the grep above
   - For each detail page where any v6 hook is missing, file a regression issue
   - Spot-check print views consuming `notes` JSON
   - Output: this doc updated with detail-page verification table fully filled

2. **PR 2 — Restore invoice wizard** (≈ 1 hour)
   - Replace `ops-create-invoice-live.tsx` body with v6 client logic
   - Drop the MVP banner
   - Update redirect path to `/ops-console/finance/${id}`
   - Add E2E test in `phase-r0.spec.ts` for the new step navigation (was already there for single-page; needs wizard-step assertions)

3. **PR 3 — Restore manifest builder** (≈ 1.5 hours)
   - Same pattern; ensure barcode-scan loop works in the preview environment
   - Add E2E test for the scan flow with a known seeded AWB

4. **PR 4 — Restore shipment wizard** (≈ 45 minutes)
   - Swap `OpsShipmentForm` → `CreateShipmentForm`
   - Confirm `SmartAddressFields` autocomplete works

5. **PR 5 — Clean up dead components** (≈ 30 minutes)
   - Decide whether `OpsInvoiceForm`, `OpsManifestForm`, `OpsShipmentForm` have any remaining callers
   - If none, delete from `packages/ui/.../forms/`
   - Update `phase-r0.spec.ts` ID selectors that pointed at MVP form IDs (e.g. `#inv-awb` → wizard-step input IDs)

6. **PR 6 — Update audit harness** (≈ 30 minutes)
   - Add wizards to the audit route list in `Claude_Preview` runs (`docs/r0-audit-findings.md` "Audit gaps to close" section lists `/shipments/create`, `/manifests/create`, `/rates/create` as deferred — they all need a re-pass after wiring)

**Estimated total: ≈ 5 hours of focused work** (excluding the field-by-field detail-page audit, which is separately ≈ 1 hour).

After these land, **then** `phase-r0.spec.ts` is meaningful — it currently asserts on routes that aren't doing what they appear to be doing.

---

## How this slipped through

Three controls failed:

1. **Playwright tests asserted on form rendering, not feature parity.** `B5. Rate card create — renders + validates` is green even though the rate-card create route is feature-equivalent to v6. But `B1. Customer create` is green AND `/customers/create` didn't exist in v6 — so green ≠ proof. The tests don't know what the wizards used to do.
2. **The TODO banner was the contract.** "Until ported" was supposed to be a temporary state. Without an issue or tracking mechanism, "temporary" became permanent.
3. **R0 a11y audit treats components as opaque.** axe doesn't notice that a 5-field form replaced a 4-step wizard with rate-lookup. The semantic check that matters is "does this route do what the v6 route did?" — and that requires either a feature-parity test or an audit like this one.

**Mitigation going forward:** add a per-feature regression test that creates an invoice end-to-end with consignor + consignee + rate-lookup + draft-restore. If any of those features evaporate again, the test breaks. Same shape as the existing `phase-r0.spec.ts` but with assertions on `rate-card-lookup` button + `consignor-name` field presence, not just render.

---

## Decision required before any of the PRs run

The user kicked this off with: _"audit all the multistep form in the dashboard … restore their fields, functionalities, features, API etc."_ The mechanical re-wire is the easy part. The product question is:

**Was the MVP downgrade intentional, or accidental?**

- If **accidental** (Phase 1 of single-shell migration shipped stubs intending to port back, but the porting was deprioritized) → execute the recovery sequence as-is, target ~1 day end-to-end
- If **intentional** (someone consciously decided that the wizards were too heavy and a 5-field invoice MVP is the new product direction) → don't re-wire; instead document the decision and **delete the v6 wizard components from `packages/ui` so the dead-code surface doesn't keep tempting "let's just port it back"**

The banner copy ("until ported") suggests **accidental**. Confirm with the product owner (you) before I open PRs.
