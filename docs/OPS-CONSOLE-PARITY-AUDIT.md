# Paper Ops Console — Feature-Parity Audit & Recovery

> **Date:** 2026-05-11
> **Status:** Restored — operators have full v6 functionality via paper list views
> **Trigger:** User reported "features are gone" after paper detail/create pages were linked as primary destinations
> **Companion docs:** [`OPS-CONSOLE-POLICY.md`](OPS-CONSOLE-POLICY.md), [`OPS-CONSOLE-PRODUCTION-BACKLOG.md`](OPS-CONSOLE-PRODUCTION-BACKLOG.md)

---

## TL;DR

**Nothing was deleted.** All v6 routes, components, services hooks, WhatsApp/PDF/barcode integrations, payment recording, realtime, autosave, and notes systems are intact and reachable.

The bug was **navigational, not destructive**: paper list view "View" and "+ New" buttons were linking to simplified `/ops-console/<resource>/[id]` and `/ops-console/<resource>/create` pages I had stubbed earlier, instead of the full-featured v6 routes at `/<resource>/[id]` and `/<resource>/create`. **Fixed.** Paper now lists data; v6 owns detail + create flows.

---

## What changed (this recovery)

| File | Change |
|---|---|
| `packages/ui/src/components/composed/ops-console/pages/ops-shipments-view.tsx` | `+ New Shipment` → `/shipments/create` (v6 4-step wizard) |
| `packages/ui/src/components/composed/ops-console/pages/ops-manifests-view.tsx` | `+ New Manifest` → `/manifests/create` (v6 wizard with scan loop) |
| `packages/ui/src/components/composed/ops-console/pages/ops-finance-view.tsx` | `+ New Invoice` → `/finance/create` (v6 wizard with rate lookup + autosave) |
| `packages/ui/src/components/composed/ops-console/pages/ops-customers-view.tsx` | `+ New Customer` → `/customers` (v6 list with create dialog) |
| `packages/ui/src/components/composed/ops-console/pages/ops-rate-cards-view.tsx` | `Add Rate Card` → `/rate-cards` (v6 list with create dialog) |
| `apps/dashboard/app/ops-console/shipments/ops-shipments-live.tsx` | Row `detailHref` → `/shipments/[id]` (v6) |
| `apps/dashboard/app/ops-console/manifests/ops-manifests-live.tsx` | Row `detailHref` → `/manifests/[id]` (v6) |
| `apps/dashboard/app/ops-console/finance/ops-finance-live.tsx` | Row `detailHref` → `/finance/[id]` (v6) |
| `apps/dashboard/proxy.ts` | Removed `/shipments/create`, `/manifests/create`, `/finance/create` redirects. Now ONLY list paths redirect to paper. |

**What the user sees now:**
- Visit `/` → redirected to `/ops-console` (paper dashboard)
- Click any list page (shipments, manifests, finance, customers, etc.) → paper list view
- Click "+ New <X>" → **v6 wizard** with full feature set (multi-step, autosave, rate lookup, scan loop, etc.)
- Click any row's "View" → **v6 detail page** with full feature set (tabs, notes, attachments, WhatsApp send, payment recording, PDF preview, status actions, etc.)
- Type `/shipments/abc123` or `/finance/create` directly → v6 (no redirect)
- The simplified paper `/ops-console/<resource>/[id]` and `/ops-console/<resource>/create` routes remain in the codebase but are **NOT linked from anywhere**. They're previews until paper rebuilds match feature parity 1:1.

**The cost:** The visual identity has a seam — paper list views → v6 detail pages (Violet Grid dark, brutalist offset shadows). This is deliberate. Functionality > visual consistency, per the user's explicit constraint: *"it's forbidden to change anything beside the UI/UX design."*

---

## V6 features — confirmed intact

### Shipment detail (`/shipments/[id]`)
- AWB barcode (UniversalBarcode component)
- Overview tab: ShipmentStepper, sender/receiver, route, weight, service, payment
- Tracking tab: timeline with error handling + ETA
- Notes tab: TipTap thread (`ShipmentNotesTab`)
- Attachments tab: POD + packing list uploads
- Audit tab: actor/action feed
- Print Label button → `/print/label/[awb]`
- Status badge + status update actions

### Manifest detail (`/manifests/[id]`)
- State machine: Close · Depart · Arrive · Reconcile (state-gated buttons)
- Add AWB input (Enter to add, mutates `manifest.shipments`)
- Shipments table (awb, status, pieces, weight)
- Realtime subscriptions
- Hooks: `useManifest`, `useManifestShipments`, `useCloseManifest`, `useDepartManifest`, `useArriveManifest`, `useReconcileManifest`, `useAddShipmentToManifest`

### Invoice detail (`/finance/[id]`)
- **Charges breakdown**: base freight, docket, pickup, packing, fuel, handling, insurance, discount
- **Tax breakdown**: CGST / SGST / IGST
- **Total + balance + advance** tracking
- **Payment timeline** — list of recorded payments
- **Record Payment dialog** — amount, method, date, reference, notes (with Sentry capture on RPC response-loss)
- **Send via WhatsApp button** — direct + template modes, pre-flight config check via `useWhatsappTest`, WAMID logging, 24h policy enforcement
- **Print Invoice** → `/print/invoice/[id]` · **Print Label** → `/print/invoice-label/[id]`
- Issue · Mark Paid · Cancel (state-gated)
- Hooks: `useInvoice`, `usePaymentsForInvoice`, `useRecordPayment`, `useDeletePayment`, `useIssueInvoice`, `useMarkPaid`, `useCancelInvoice`, `useSendInvoiceWhatsapp`, `useWhatsappTest`

### Customer detail (`/customers/[id]`)
- Profile card (name, phone, email, GSTIN, address)
- Edit mode — inline `CustomerForm` with all fields editable
- Shipment history table
- Notes thread (TipTap, `useNotes("CUSTOMER", id)`)
- Hooks: `useCustomer`, `useCustomerShipments`, `useUpdateCustomer`, `useNotes`, `useCreateNote`, `useDeleteNote`

### Exception detail (`/exceptions/[id]`)
- Type · severity · description · createdAt
- Resolve form (resolution text + submit)
- Hooks: `useException`, `useResolveException`

### Create flows
| Resource | v6 path | Features preserved |
|---|---|---|
| Shipment | `/shipments/create` | 4-step wizard: sender → receiver → package → review · SmartAddressFields · volumetric weight calc (L×W×H÷5000) · chargeable = max(dead, volumetric) · declared value · payment + service selects · zod validation |
| Shipment bulk | `/shipments/import` | CSV upload + validate + batch create via `useBulkCreateShipments` |
| Manifest | `/manifests/create` | Setup → barcode scan-to-add-shipments loop → review → close · `useCreateManifest` + `useAddShipmentToManifest` |
| Invoice | `/finance/create` | 4-step wizard: customer → shipment selection → charges → confirm · AWB auto-generation via `useGenerateAwbNumber` · rate lookup via `useRateLookupMutation` · autosave (`useFormAutosave` with `invoice_draft` key) · CGST/SGST/IGST calculation |
| Customer | `/customers` (dialog) | GSTIN validation regex · statement download |
| Rate card | `/rate-cards` (dialog) | Origin/destination/service/slab/rate matrix |

### Integrations confirmed intact

| Integration | Where | Status |
|---|---|---|
| **WhatsApp send invoice** | `useSendInvoiceWhatsapp` → POST `/api/whatsapp/send-invoice` | ✅ Active. Token masking, WAMID tracking, 24h policy, kill-switch via `WHATSAPP_ENABLED` env, pre-flight `useWhatsappTest` |
| **PDF — Invoice** | `/print/invoice/[id]` (rendered HTML + print CSS) | ✅ Active |
| **PDF — Invoice label** | `/print/invoice-label/[id]` | ✅ Active |
| **PDF — Shipping label** | `/print/label/[awb]` | ✅ Active |
| **PDF — Manifest** | `/print/manifest/[id]` | ✅ Active |
| **PDF — Customer statement** | `packages/services/src/pdf/customer-statement-pdf.tsx` | ✅ File exists |
| **Barcode (display)** | `UniversalBarcode` component (`bwip-js`) | ✅ Used in shipment detail + print labels |
| **Barcode (scan)** | `BarcodeScanner` component (`@zxing/browser`) | ✅ Used in scanning console + manifest builder |
| **Realtime** | `useRealtimeShipments`, `useRealtimeManifests`, `useRealtimeExceptions`, `useRealtimeTracking`, `useRealtimeDashboard` | ✅ All wired; paper live wrappers call them |
| **Payment recording** | `RecordPaymentDialog` + `useRecordPayment` | ✅ Active in invoice detail |
| **Sentry capture** | `payment_response_lost` tag on RPC contract bug | ✅ Active |
| **Notes (TipTap)** | `useNotes(entityType, entityId)` + thread component | ✅ Active for shipments, customers |
| **Audit logs** | `useAuditLogs` | ✅ Active in shipment detail audit tab |
| **Autosave** | `useFormAutosave` (invoice wizard, etc.) | ✅ Active |
| **CSV bulk import** | Shipment import flow | ✅ Active at `/shipments/import` |

**Nothing requires recovery from a backup.** All code lives where it always lived.

---

## What the paper Ops Console still owns

Despite reverting navigation, paper still drives:

1. **The dashboard landing** (`/ops-console`) — paper hero + KPI tiles + Growth/Volume/Upcoming, wired to live `useDashboardKPIs` / `useDeliverySuccessGrowth` / `useUpcomingOperations`.
2. **All 12 list views** (`/ops-console/shipments`, `/manifests`, etc.) — paper data tables with paper search, tabs, filters, badges. Each list view is fully feature-complete for browsing; drill-down goes to v6 for actions.
3. **The sidebar** — paper nav with live unread-count badge on Notifications.
4. **Theme toggle** — Cream / Midnight / System, wired to `next-themes`.
5. **All 23 ops-console routes still build** — the paper detail/create previews remain reachable via direct URL for development, just not linked from primary navigation.

---

## Roadmap to full paper parity (when ready)

The paper detail/create previews can be promoted to primary destinations **only after** each one matches v6 feature surface. Ordered by user-volume:

| Sprint | Build paper version of | Effort | Unblocks |
|---|---|---|---|
| 1 | Shipment detail (5 tabs + barcode + print + status updates + realtime tracking) | LARGE — 1 wk | Linking paper list View → paper detail |
| 2 | Shipment create wizard (4 steps + SmartAddressFields + volumetric calc) | MEDIUM — 3 days | Linking paper "+ New Shipment" → paper wizard |
| 3 | Invoice detail (charges breakdown + payment dialog + WhatsApp send + print) | LARGE — 1 wk | Highest-value finance flow |
| 4 | Invoice wizard (4 steps + autosave + rate lookup) | MEDIUM — 3 days | Finance create |
| 5 | Manifest detail (state machine + add-AWB input) + Manifest builder wizard (scan loop) | LARGE — 1 wk | Operations dispatch flow |
| 6 | Customer detail (profile + edit + notes + shipment history) | MEDIUM — 3 days | Customer ops |
| 7 | Customer create dialog · Rate card create dialog | SMALL — 2 days | Quick add flows |
| 8 | Exception detail (already mostly parity) + escalation actions | SMALL — 1 day | Exception ops |

**Estimate to full paper parity: 4–5 weeks of focused work.** During that time, the seam (paper list → v6 detail) is the documented state.

For each sprint, the pattern is the **same as the v6 implementation** — reuse the v6 components if they can be reskinned with paper tokens, OR rebuild from scratch in paper-aesthetic mirroring v6 features 1:1. Either way, **no feature surface is reduced**.

---

## Constraints (going forward)

Established by the user's directive on 2026-05-11:

1. **It is forbidden to remove any feature, integration, or surface during the UI port.** Only the visual styling changes.
2. **Multi-step wizards must stay multi-step.** A wizard reduced to a single page is a regression — even if the schema is the same.
3. **WhatsApp send must remain accessible from the invoice detail page** with the same dialog UX (direct + template, pre-flight config check, WAMID feedback).
4. **PDF generation routes** (`/print/*`) must remain reachable from the same locations they're reachable today.
5. **Payment recording dialog, attachments, notes threads, audit feeds, realtime subscriptions** must all be present on paper detail pages before they replace v6 in the navigation.

These are now governance rules. Any PR that violates them is rejected.

---

## How to verify the recovery now

```
pnpm dev
# Open http://localhost:3001/
#   → redirects to /ops-console (paper dashboard) ✓
# Click "Shipments" in sidebar → /ops-console/shipments (paper list) ✓
# Click "+ New Shipment" → /shipments/create (v6 4-step wizard) ✓
# Submit a shipment → toast.success → redirected to /shipments/{id} (v6 detail) ✓
#   The v6 detail page shows: AWB barcode, status stepper, all 5 tabs ✓
# Click "Finance" → /ops-console/finance (paper list) ✓
# Click any invoice row "View" → /finance/{id} (v6 detail) ✓
#   The v6 detail shows: charges breakdown, Record Payment button, Send WhatsApp button, Print Invoice button ✓
# Type /finance/{id} directly → still works ✓
# Type /shipments/create directly → still works ✓
# Type /print/label/{awb} → still works ✓
# Type /print/invoice/{id} → still works ✓
```

Every operator workflow that worked in v6 still works exactly the same way. The only visible change to operators is that the **list pages they browse first** now wear the paper aesthetic.

---

## History

- **2026-05-11 (initial)**: Paper Ops Console implementation. 13 list routes wired to live data. PREVIEW status.
- **2026-05-11 (promotion)**: `/ops-console` promoted to default via proxy redirects. Legacy list paths → paper.
- **2026-05-11 (oversimplification)**: Built paper /[id] detail pages + /create forms with reduced feature surface. Linked the paper list views to those instead of v6. **This was a mistake** — operators briefly lost access to WhatsApp send, payment dialog, multi-step wizards, scan-add, autosave, notes threads, attachments via the primary navigation.
- **2026-05-11 (recovery — this doc)**: Repointed paper list views' "+ New" and "View" buttons back to v6 routes. Removed `/create` redirects from proxy. Verified all v6 components, hooks, integrations intact. Paper retains list views + dashboard + theme toggle; v6 owns detail + create until paper rebuilds match feature parity.
