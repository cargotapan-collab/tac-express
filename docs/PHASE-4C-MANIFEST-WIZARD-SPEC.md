# NextAdmin Phase 4c — V7 Create-Manifest Wizard

> **Status:** SPEC ONLY — awaiting owner approval per `tac-brainstorming` Phase 6.
> No code lands until this spec is signed off.
>
> **Author:** Claude Code (agent), 2026-05-14
> **Skill loaded:** `tac-brainstorming`
> **Pattern:** mirrors Phase 4b ([PR #82](https://github.com/cargotapan-collab/tac-express/pull/82))

---

## Goal

Operators in the dashboard can build a new manifest through a guided multi-step wizard rendered in the Violet Grid v7 visual language, with **localStorage draft persistence** so an interrupted shift resumes intact. Behavior identical to the existing v6 `ManifestBuilderWizard`; only the composition + form primitives + draft hook change.

Manifests are the daily dispatch ritual in this logistics workflow — every shipment going out of a hub gets bundled into one. The wizard *is* the operator's daily driver.

---

## Why this and not other open work

- Mirrors the NextAdmin retro's recommended next step (4b → 4c → 4d wizard sequence).
- Phase 4b shipped clean (#82 merged). The form-primitive + `useShipmentDraft` template now exists — 4c is the second consumer that proves the pattern generalizes.
- Generalizing `useShipmentDraft` → `useFormDraft<T>` as a tiny pre-requisite PR unlocks 4d (Invoice) for free.
- Independent of the #78 production-vs-repo migration drift work — manifest service calls `add_shipment_to_manifest` with the 3-arg signature, which is what production has and what `database.types.ts` already declares.

---

## Phase 1 — Clarify (per `tac-brainstorming`)

1. **What is the user's exact goal?** A dispatch operator at a hub can scan / pick a set of AWBs that are going to the same destination, bundle them into one manifest record, set the truck/flight, and produce a printable manifest sheet plus a database manifest row. They do this once per outbound batch.
2. **Which app?** `apps/dashboard` only. Public web is not involved.
3. **Does a similar component already exist?** Yes — `packages/ui/src/components/composed/manifests/manifest-builder/` has `manifest-builder-wizard.tsx` + 3 step files (setup, add-shipments, review). v6. The v7 wizard wraps the same logic in v7 primitives.
4. **Which packages will change?**
   - `packages/ui` — new V7 wizard component + `useFormDraft<T>` hook (generalization of `useShipmentDraft`)
   - `apps/dashboard` — wire v6/v7 branch into `ops-create-manifest-live.tsx`
   - `packages/services` — no change (existing `manifest.service.ts` `createManifest()` + `addShipmentToManifest()` called as-is)
   - `packages/types` — no change
   - `packages/database` — no change
   - `supabase/migrations` — no change
5. **Auth / RLS / roles?** Operations and warehouse roles. RLS already in place on `manifests` + `manifest_shipments` tables. Wizard gates behind same auth as existing create route.
6. **DB schema change?** No.
7. **Failure mode if it breaks?** Operator cannot create a new manifest → outbound shipments can't be bundled → dispatch backs up. **Highest-volume daily workflow per hub.** Browser verification is mandatory (per retro + per #82 precedent).

---

## Phase 2 — Existing component check (DONE)

| File | What it is | What we do with it |
|---|---|---|
| `packages/ui/src/components/composed/manifests/manifest-builder/manifest-builder-wizard.tsx` | v6 wizard wrapper | **Reused** — wraps the steps + handles state |
| `.../manifest-builder/step-setup.tsx` | Step 1: origin/dest/mode/date | **Reused as logic reference;** v7 redraws via form primitives |
| `.../manifest-builder/step-add-shipments.tsx` | Step 2: shipment picker | Same |
| `.../manifest-builder/step-review.tsx` | Step 3: totals + submit | Same |
| `packages/ui/src/components/composed/manifests/v7-ops-manifests.tsx` | v7 LIST page (already shipped) | Sibling to the new wizard |
| `packages/services/src/manifest.service.ts` | `createManifest()`, `addShipmentToManifest()` | Called as-is by the wizard's submit handler |
| `packages/ui/src/hooks/use-shipment-draft.ts` | Phase 4b draft hook | **Generalize to `useFormDraft<T>`** before 4c starts |

---

## Phase 3 — Architecture fit

```
UI:
  packages/ui/src/components/composed/manifests/
    v7-create-manifest-wizard.tsx        NEW — Phase 4c entry point
    v7-create-manifest-wizard.test.tsx   NEW — Vitest unit tests
  packages/ui/src/hooks/
    use-form-draft.ts                    NEW — generalised useShipmentDraft
    use-form-draft.test.ts               NEW
    use-shipment-draft.ts                MODIFIED — delegates to useFormDraft

Service (no change):
  packages/services/src/manifest.service.ts

App shell:
  apps/dashboard/app/ops-console/manifests/create/
    ops-create-manifest-live.tsx         MODIFIED — useDesignVersion branch
```

Same architecture flow as Phase 4b. UI → services → database, no skipping. Same v6/v7 co-existence via flag.

---

## Phase 4 — Violet Grid v5.0 fit checklist

- [x] Dark-first: uses `bg-card` / `bg-background` via FormCard (inherits v7 chrome)
- [x] Sharp: `var(--radius)` = 0 — inherited
- [x] Brutalist offset shadow — `shadow-brutal-sm` on FormCard
- [x] Fonts: `font-sans` (Plus Jakarta) for labels, `font-mono` for AWBs/weights/dimensions
- [x] Signal palette: violet for active stepper bullet + Submit; amber for warning chips on Step 2 (e.g., "5 shipments out of origin hub mismatch")
- [x] No glassmorphism: solid surfaces with 1px borders
- [x] Icons: `@workspace/ui/icons` (Remix)
- [x] FUI utilities: `.tac-mono-label` on AWB/code columns; `.t-data-sm` on totals
- [x] Type scale: `.t-overline` for section headers, `.t-data` for totals

---

## Phase 5 — The Feature Spec

### Component tree

```
V7CreateManifestWizard (client component, ~500 LoC budget)
├─ FormCard (Phase 4a primitive, maxWidth="lg")
│  ├─ WizardStepper (existing primitive — reused)
│  └─ Step content (one of):
│     ├─ Step 1 — Setup
│     │  └─ FormSection
│     │     └─ FormGrid cols=2
│     │        ├─ FormField — Origin hub (Select)
│     │        ├─ FormField — Destination hub (Select)
│     │        ├─ FormField — Transport mode (Select: AIR / TRUCK / OCEAN)
│     │        └─ FormField — Departure date (Input type=date)
│     ├─ Step 2 — Add shipments
│     │  ├─ Search/filter row (AWB / sender / receiver)
│     │  ├─ Available shipments table (multi-select)
│     │  │   — filtered to shipments at the chosen origin hub
│     │  │   — with status in ('CREATED', 'PICKED_UP', 'RECEIVED_AT_ORIGIN')
│     │  └─ Selected shipments preview (running totals: count / pieces / weight)
│     └─ Step 3 — Review
│        ├─ Manifest header summary (origin → dest, mode, date, manifest # placeholder)
│        ├─ Shipments table (read-only with AWBs + receivers)
│        └─ Totals row (count, pieces, chargeable weight, declared value)
└─ WizardActions (Back / Next / Create Manifest)
```

### Data flow

```
V7CreateManifestWizard
  ↓ react-hook-form + zod resolver
  ↓ defaultValues: useFormDraft hydrate (24h TTL)
  ↓ shipments-list useShipmentsByHub() hook on Step 2 mount
  ↓ on Submit (last step):
manifest.service.createManifest({ origin, dest, mode, departureDate })
  ↓ returns { id, manifest_number }
manifest.service.addShipmentToManifest(manifest.id, awb, staffId) × N
  ↓ in a Promise.all() — each RPC is independent
useFormDraft.clear()
router.push(`/ops-console/manifests/${manifest.id}`)
```

### Zod schema (proposed)

```ts
export const createManifestSchema = z.object({
  originHub: z.string().min(2),
  destHub: z.string().min(2).refine(
    (v, ctx) => v !== (ctx.parent as { originHub: string }).originHub,
    { message: "Destination must differ from origin." },
  ),
  transportMode: z.enum(["AIR", "TRUCK", "OCEAN"]),
  departureDate: z.string().refine(d => !Number.isNaN(Date.parse(d)), {
    message: "Valid date required.",
  }),
  selectedAwbs: z.array(z.string()).min(1, "Add at least one shipment."),
})
```

Note: uppercase enum values to match **production** (`shipments.status`, `manifests.transport_mode` CHECK constraints), not the repo's lowercase enum. The 4c wizard must work against production reality, not the divergent repo enums (see #78).

### Draft persistence contract

Key: `tac-manifest-draft-v1` (versioned per same convention as `tac-shipment-draft-v1`).
TTL: 24h.
Schema-version bump (`v1` → `v2`) silently invalidates older drafts when the zod schema changes shape.

### Design notes

- **Mono numerics** for AWB, pieces, kg, value — `font-mono tabular-nums` per Violet Grid
- **Warning amber** chip on Step 3 if any selected shipment has a status that's no longer eligible (e.g., shipment got delivered while operator was filling the wizard)
- **Reduced-motion** safe stepper transitions
- **aria-live="polite"** on the running-totals panel so screen readers hear updates as shipments are added

### Non-goals (deferred to follow-up PRs)

- Print preview integration (existing `manifest-print-view.tsx` is for the detail page, not in-wizard)
- Bulk-scan integration (operators currently scan in the Scanning route; deeplinking to the wizard with pre-selected AWBs is a separate PR)
- Edit-existing-manifest flow (only CREATE here; status transitions like close/depart/arrive/reconcile are separate operator actions)
- Multi-driver / multi-vehicle splits — single manifest = single conveyance for v7
- Origin-mismatch auto-correction (only warn; operator decides)

### Verification strategy (mandatory per retro)

This is a **write-path** PR. Mandatory per the May-14 retro:

- [ ] **Vitest** units on `useFormDraft` (save / load / TTL / corrupt-data fallback / cross-instance isolation) — generalised tests from `useShipmentDraft`
- [ ] **Vitest** units on the wizard component (4 tests minimum — mirror Phase 4b's structure):
  - Renders Step 1 by default
  - Hydrates fields from a localStorage draft on mount
  - Blocks Next when current step invalid; zod errors surface
  - Race-prevention: rapid double-click on Next doesn't double-advance
- [ ] **Playwright** E2E happy path: open `/ops-console/manifests/create` with `tac-design=v7` → fill 3 steps → submit → assert manifest row exists AND each `manifest_shipments` row created AND redirect to detail page
- [ ] **Playwright** E2E draft restore: fill Step 1 → reload → assert all fields rehydrated
- [ ] **Browser screenshot** at 1280 + 1920 widths attached to the PR
- [ ] **Service-level side effect** verification via the dashboard list — created manifest shows in `/ops-console/manifests`

### Definition of Done

- [ ] Spec approved (this document)
- [ ] `tac-tdd` skill loaded
- [ ] `useFormDraft<T>` generalization landed FIRST as its own tiny PR (~80 LoC); `useShipmentDraft` rewritten as a thin alias
- [ ] Wizard component lives at `packages/ui/src/components/composed/manifests/v7-create-manifest-wizard.tsx`
- [ ] Dashboard wiring branches via `useDesignVersion()` in `ops-create-manifest-live.tsx`
- [ ] All 5 quality gates pass: typecheck, lint, test, build, audit:all
- [ ] Browser verification steps completed and recorded in PR body with screenshots
- [ ] ONE PR (excluding the `useFormDraft` pre-req). ≤ 1,500 LoC. Diff stat in PR description.
- [ ] Mid-session checkpoint after each unit: hook → component → wiring; don't push through

---

## Recommended PR sequence

| # | Branch | Concern | Est. LoC |
|---|---|---|---|
| **Pre-1** | `refactor/use-form-draft-generalize` | Rename `useShipmentDraft` → `useFormDraft<T>`; keep `useShipmentDraft` as alias for back-compat; update 1 test file. Unlocks 4c and 4d. | ~100 |
| **1** | `feat/nextadmin-phase-4c-manifest-wizard` | The wizard + dashboard wiring + tests + browser verification | ~600 |

Two PRs, lowest-risk sequence. The generalization PR is independent and can merge first.

---

## Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| Operator creates manifest with wrong origin hub | High | Step 1 origin defaults to operator's current hub (per `current_user_hub()` if it exists in production — needs verification) |
| Selected shipment gets delivered while wizard is open → invalid manifest | Medium | Step 3 re-fetches each AWB's status pre-submit; warns on mismatch; operator confirms |
| Production has `manifests.status` TEXT (uppercase) not enum — schema fit | Medium | Zod schema uses uppercase enum values matching production CHECK constraint |
| `add_shipment_to_manifest` returns `void` in production — caller can't read manifest #s | Low | Caller already knows `manifest.id` from `createManifest()`; doesn't need RPC return value |
| Draft persistence corrupts a real customer manifest | High | Versioned key, TTL eviction, restore unit test mirroring Phase 4b |
| ≤ 1,500 LoC budget exceeded | Low | Estimate: ~600 LoC component + ~100 hook + ~200 tests = ~900. Headroom. |

---

## What this spec is NOT

- Not Phase 4d (Invoice wizard) — separate session, separate PR
- Not a v6 rewrite — v6 stays default
- Not unblocked by #78 production-vs-repo work — wizard targets production reality, the strategic decision can wait
- Not a Phase 6 (global search) prerequisite

---

## Approval gate (Phase 6 — STOP HERE until owner confirms)

**Open questions for owner:**

1. **Origin hub default** — should Step 1 pre-fill origin from the operator's `profiles.hub_code`? (Production has this column.) If yes, what if the operator has no hub_code set?
2. **Status filter on Step 2** — production's `shipments.status` CHECK lists 11 statuses (CREATED, PICKUP_SCHEDULED, PICKED_UP, RECEIVED_AT_ORIGIN, IN_TRANSIT, RECEIVED_AT_DEST, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RTO, EXCEPTION). Which subset should be eligible for adding to a new manifest? Suggesting `CREATED / PICKED_UP / RECEIVED_AT_ORIGIN`.
3. **Selected-shipment ordering** — by `created_at desc` (newest first) or `awb_number asc` (numeric sort)?
4. **Submit transactionality** — `createManifest()` then N × `addShipmentToManifest()`. If the Nth `addShipmentToManifest` fails, the manifest exists but is partial. Acceptable, or do we want a transaction wrapper RPC? (Would need a new migration.)
5. **24-hour TTL** — same as Phase 4b. Confirm or override for shift-aware drafts?

Defaults if no answer:
1. Pre-fill from `profiles.hub_code`; warn if missing
2. `CREATED / PICKED_UP / RECEIVED_AT_ORIGIN`
3. `created_at desc`
4. Accept partial-manifest risk; operator can re-add failed shipments via the detail page
5. 24h

**One sentence answer is enough.** Once you confirm, I'll execute the generalization PR first, then the wizard PR per the per-PR contract.
