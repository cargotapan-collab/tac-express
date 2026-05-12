# Paper Ops Console — Production Backlog

> **Date:** 2026-05-11
> **Status:** Active — drives prioritisation for follow-up sprints
> **Authority:** PM decision after Anthropic Design handoff implementation + promotion
> **Companion docs:** [`OPS-CONSOLE-POLICY.md`](OPS-CONSOLE-POLICY.md), [`UI-AUDIT-BASELINE.md`](UI-AUDIT-BASELINE.md), [`VIOLET-GRID-QUALITY.md`](VIOLET-GRID-QUALITY.md)

After the May 2026 promotion of `/ops-console` to default, the dashboard is operational but not yet production-complete. 13 list-level routes are wired to live data, but **detail / create / wizard surfaces still render v6 Violet Grid** via deep-link fall-through.

This backlog tracks the work remaining to ship a fully consistent paper experience.

---

## HIGH priority — blocks core operator workflows

### 1. Detail page routing for all list views — LARGE · 5–7 days

The list views' "View" buttons are currently inert. The v6 detail pages render in Violet Grid via deep-link.

**Build per resource:**

| Resource | v6 detail file | Hooks to wire | Complexity |
|---|---|---|---|
| Shipment | `apps/dashboard/app/(dashboard)/shipments/[id]/page.tsx` | `useShipment`, `useTrackingEvents` | MEDIUM |
| Manifest | `apps/dashboard/app/(dashboard)/manifests/[id]/manifest-detail-client.tsx` | `useManifest`, `useManifestShipments` | MEDIUM |
| Invoice | `apps/dashboard/app/(dashboard)/finance/[id]/invoice-detail-client.tsx` (591 LoC; payment + WhatsApp + print) | `useInvoice`, `usePaymentsForInvoice`, `useRecordPayment`, `useMarkPaid`, `useSendInvoiceWhatsapp` | LARGE |
| Customer | `apps/dashboard/app/(dashboard)/customers/[id]/customer-detail-client.tsx` | `useCustomer`, `useCustomerShipments`, `useUpdateCustomer` | MEDIUM |
| Exception | `apps/dashboard/app/(dashboard)/exceptions/[id]/page.tsx` | `useException`, `useResolveException` | SMALL |

**New route paths to create:**
- `apps/dashboard/app/ops-console/shipments/[id]/page.tsx` + `ops-shipment-detail-live.tsx`
- `…/ops-console/manifests/[id]/` + live wrapper
- `…/ops-console/finance/[id]/` + live wrapper
- `…/ops-console/customers/[id]/` + live wrapper
- `…/ops-console/exceptions/[id]/` + live wrapper

**New paper components needed:**
- `OpsDetailFrame` (like `OpsFrame` but with side rail for status/actions)
- `OpsDetailTabs` (tabbed sections within detail)
- `OpsTimeline` (tracking events display)

### 2. Create / form / wizard routes — LARGE · 6–10 days

Operators can't create entities from paper. v6 forms still exist; they need paper equivalents.

| Form | v6 file | Mutation hook | Steps |
|---|---|---|---|
| New shipment | `apps/dashboard/app/(dashboard)/shipments/create/create-shipment-client.tsx` | `useCreateShipment` | 1 (long form) |
| Bulk shipment import | `apps/dashboard/app/(dashboard)/shipments/import/bulk-import-client.tsx` | `useBulkCreateShipments` | CSV upload + validate + commit |
| Manifest wizard | `apps/dashboard/app/(dashboard)/manifests/create/create-manifest-client.tsx` | `useCreateManifest` + `useAddShipmentToManifest` + `useCloseManifest` | 3 (setup → add shipments → review) |
| Invoice wizard | `apps/dashboard/app/(dashboard)/finance/create/create-invoice-client.tsx` | `useCreateInvoice` + `useGenerateAwbNumber` + `useRateLookupMutation` | 4 (customer → shipment → charges → confirm) — with autosave |
| Customer create/edit | `packages/ui/src/components/composed/customers/customer-form.tsx` | `useCreateCustomer`, `useUpdateCustomer` | 1 (address + contact) |
| Rate card create/edit | (modal in v6 rate-cards page) | `useCreateRateCard`, `useUpdateRateCard` | 1 (route + slab + charges) |

**Companion proxy updates:** Once paper forms exist, add to `LEGACY_TO_OPS_CONSOLE`:
- `/shipments/create` → `/ops-console/shipments/create`
- `/shipments/import` → `/ops-console/shipments/import`
- `/manifests/create` → `/ops-console/manifests/create`
- `/finance/create` → `/ops-console/finance/create`
- etc.

### 3. Loading + error + empty states in all 11 live wrappers — MEDIUM · 2–3 days

Every `ops-*-live.tsx` does `const { data = [] } = useXxx()` with no `isPending` / `isError` handling.

**Components to build:**
- `OpsSkeleton` — paper-styled pulse blocks
- `OpsEmptyState` — icon + eyebrow + headline + helpful copy + CTA (4-element pattern from `VIOLET-GRID-QUALITY.md`)
- `OpsErrorState` — accent-danger left bar + error code + retry button

**Files to update:** 11 `ops-*-live.tsx` files + their view components (add `isPending`, `isError` props).

### 4. Click-through wiring (View buttons → detail routes) — SMALL · 1 day

Each list view has an inert "View" button. Make them Links to the future detail routes.

| View file | Link target |
|---|---|
| `ops-shipments-view.tsx` | `/ops-console/shipments/[id]` |
| `ops-manifests-view.tsx` | `/ops-console/manifests/[id]` (currently cards, no View button — add href to card) |
| `ops-customers-view.tsx` | `/ops-console/customers/[id]` (table row click) |
| `ops-finance-view.tsx` | `/ops-console/finance/[id]` |
| `ops-exceptions-view.tsx` | `/ops-console/exceptions/[id]` |

Note: `ShipmentRow.id` currently holds the AWB string (for display). Need a separate `detailHref` field so the link target uses the UUID.

### 5. Toast / mutation feedback pattern — SMALL · 1–2 days

`sonner` is wired in `apps/dashboard/components/providers.tsx`. The v6 pattern (try/catch + `toast.success` / `toast.error`) needs to be standardised for paper forms.

**Deliverables:**
- Document the pattern in `OPS-CONSOLE-POLICY.md`
- Apply to the shipment create form as the canonical example
- Verify `sonner.toast` renders well against the paper aesthetic (may need a style override)

---

## MEDIUM priority — operator can work without

### 6. Management sub-flows — MEDIUM · 3–4 days

Staff invite, role change, hub assign, etc. v6 has `InviteStaffDialog`. Port to paper using `useStaffList`, `useUpdateRole`, `useSetActiveStatus`, `useHubs`, `useCreateHub`, `useUpdateHub`, `useToggleHubActive`.

### 7. Settings sub-flows (API keys, webhooks, profile) — MEDIUM · 2–3 days

v6 `/settings` has tabs for Profile / API Keys / Webhooks / Audit. Paper `/ops-console/settings` only renders the Profile pane. Wire the rest via `useApiKeys`, `useCreateApiKey`, `useRevokeApiKey`, `useWebhooks`, `useCreateWebhook`, `useDeleteWebhook`, `useAuditLogs`.

### 8. Sidebar notification badge (unread count) — SMALL · 1 day

Currently hardcoded to `"2"` on the Finance nav item in `ops-sidebar.tsx`. Wire to `useUnreadNotificationCount(userId)`. Also surface exception count on the Exceptions nav item.

### 9. Realtime subscription verification — SMALL · 1 day

Each live wrapper calls `useRealtime*()`. Confirm subscriptions actually invalidate React Query caches; smoke-test live updates.

### 16. Pagination wiring — SMALL · 1 day

List views have prev/next buttons but they're inert. Wire to pageOffset state + hook params. `Page X of Y` count.

---

## LOW priority — polish

### 10. Print routes verified untouched
✅ Already verified — `proxy.ts` does not redirect `/print/*`. Print uses `--print-bg` / `--print-fg` tokens, independent of theme.

### 11. Bulk actions — MEDIUM · 2–3 days
Multi-select checkbox + floating action bar. Paper design: hatch stripe on selected rows.

### 12. Keyboard shortcuts — SMALL · 1 day
`OpsKbd` component exists; wire global listeners for `⌘K` / `Esc` / `Enter`.

### 13. CSV export — SMALL · 1–2 days
Export button per list page. Build `useExport*` hooks if missing.

### 14. Exception escalation + POD capture — MEDIUM · 2–3 days
v6 exception detail likely has escalation; POD has its own component (`pod-capture.tsx`, already styled paper-friendly).

### 15. Manifest reconciliation — SMALL · 1 day
Close-manifest button on manifest detail page.

### 17. Advanced filtering / saved views — MEDIUM · 2–3 days
`useSavedViews` hook exists; build filter sidebar + saved view chips.

### 18. Sidebar collapsibility — SMALL · 1 day
Collapse button → narrow sidebar mode.

---

## Recommended Sprint Plan

| Sprint | Items | Theme | Days |
|---|---|---|---|
| **Sprint 1** | 4 + 3 (split: state primitives only) + 5 + 8 + 16 | "Plumbing" — make every list view feel finished | 4–5 |
| **Sprint 2** | 1 (shipments + exceptions) + 2 (shipment create) | "Core operator workflows" | 6–8 |
| **Sprint 3** | 1 (manifests + finance + customers) + 2 (manifest wizard + invoice wizard + customer form + rate card form) | "Full workflow coverage" | 8–10 |
| **Sprint 4** | 6 + 7 + 14 + 11 | "Admin + bulk" | 5–7 |
| **Sprint 5** | 12 + 13 + 17 + 18 | "Polish" | 4–5 |

**Critical path to "fully usable production paper UI": Sprints 1 + 2 + 3 → ~3 weeks.**

## What's executed in this session (May 2026)

Items shipped in the immediate follow-up after the audit:

### Sprint 1 plumbing
- **State primitives**: `OpsSkeleton` / `OpsSkeletonRow` / `OpsSkeletonStatCard`, `OpsEmptyState` (4-element pattern), `OpsErrorState` (with retry handler). Exported from `@workspace/ui/components/composed/ops-console`.
- **Click-through wiring**: shipments, manifests, finance list views — "View" buttons now link to `/ops-console/<resource>/<uuid>` (detail routes pending). Manifest cards are wrapped in a `<Link>` so the whole card is clickable. `detailHref` prop added to `ShipmentRow`, `ManifestRow`, `InvoiceRow` types.
- **Sidebar notification badge**: `OpsSidebar` now calls `useSession()` + `useUnreadNotificationCount()`. The hardcoded `"2"` badge on Finance was removed; the live unread count surfaces on the Notifications footer item (with `"99+"` cap).

### Sprint 2 form pattern
- **Paper shipment create form**: `OpsShipmentForm` in `packages/ui/src/components/composed/ops-console/forms/ops-shipment-form.tsx`. Single-page (vs. v6's 4-step wizard) — 4 sections (Sender, Receiver, Package, Service · Payment) with react-hook-form + zod resolver. Field error display uses `font-paper-mono` red ink. Submit button shows spinner + disabled state during mutation.
- **Live wrapper**: `apps/dashboard/app/ops-console/shipments/create/ops-create-shipment-live.tsx` — mirrors the v6 client's mutation mapping (form → `CreateShipmentDbInput`), `toast.success`/`toast.error` feedback, router-push to `/ops-console/shipments/<id>` on success.
- **Route mount**: `apps/dashboard/app/ops-console/shipments/create/page.tsx` — server component, `OpsFrame` + `OpsPageHead` chrome.
- **Proxy update**: `/shipments/create` → `/ops-console/shipments/create` in `LEGACY_TO_OPS_CONSOLE`.
- **Navigation**: the `+ New Shipment` button in the shipments list view is now a `<Link asChild>` to the create route.

---

## Canonical paper form pattern (for the other 5 forms)

Every remaining paper form (manifest wizard, invoice wizard, customer create, rate card, settings sub-flows) should follow this shape:

```
packages/ui/src/components/composed/ops-console/forms/ops-<resource>-form.tsx
  - "use client"
  - Zod schema (or import from @workspace/types)
  - Single React component using OpsCard "Section" helpers
  - All inputs via OpsFieldInput / OpsFieldSelect / OpsFieldLabel
  - Field-level errors in font-paper-mono red ink
  - react-hook-form + zodResolver
  - Submit button with spinner + disabled when isLoading
  - Reset button (variant="ghost")

apps/dashboard/app/ops-console/<resource>/create/ops-create-<resource>-live.tsx
  - "use client"
  - Call useCreate<Resource>() hook for { mutateAsync, isPending }
  - onSubmit: map form → service input, try/catch with toast.success/toast.error
  - On success: router.push to ops-console detail page

apps/dashboard/app/ops-console/<resource>/create/page.tsx
  - Server component
  - export const dynamic = "force-dynamic"
  - Mount: <OpsFrame><OpsPageHead .../><OpsCreate<Resource>Live /></OpsFrame>

apps/dashboard/proxy.ts
  - Add legacy redirect: "/<resource>/create": "/ops-console/<resource>/create"
```

**Multi-step variants** (manifest, invoice): same structure, but the form component manages `step` state internally and renders one section per step with `Previous` / `Next` actions. The `WizardActions` primitive at `packages/ui/src/components/primitives/wizard.tsx` exists in v6 and could be reused if reskinned in paper tokens — or build `OpsWizard` / `OpsWizardActions` from scratch.

**Loading + error states**: every live wrapper that reads data (not just submits) should destructure `{ isPending, isError, error, refetch }` from the hook and conditionally render `<OpsSkeleton*>` / `<OpsErrorState>` instead of the view. Pattern not yet propagated — see backlog item #3.
