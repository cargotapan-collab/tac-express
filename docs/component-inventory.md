# Component Inventory — TAC Express

Source-of-truth catalogue for the shadcn-upgrade & compliance plan (May 2026). Captures every UI building block, its callers, and its risk profile so per-primitive upgrades in Phase 4 are mechanical, not exploratory.

Generated: 2026-05-13. Maintainer regenerates when adding a primitive or moving a composed component.

---

## 1. Primitives — `packages/ui/src/components/primitives/`

These are the shadcn-derived atoms. Each row corresponds to **one file** in `primitives/` (plus `button.tsx` and `select.tsx` at the `components/` root). The shadcn version targeted post-upgrade is **4.7.0** (pinned in `packages/ui/package.json` and `.mcp.json`).

| Primitive | Path | Callers | TAC modifications | Risk | Upgrade order |
|---|---|---:|---|---|---:|
| Button | `components/button.tsx` | 52 | CVA variants with paper/v6 dual styling; `asChild` via Radix `Slot` | Low | 1 |
| Input | `primitives/input.tsx` | 19 | Token-only colors; `tac-focus-premium` ring | Low | 2 |
| Label | `primitives/label.tsx` | 16 | None — straight Radix | Low | 2 |
| Textarea | `primitives/textarea.tsx` | 5 | Token-only colors | Low | 2 |
| Badge | `primitives/badge.tsx` | 20 | Status-tone CVA mapped to `--paper-ok/warn/err/info` | Low | 3 |
| Separator | `primitives/separator.tsx` | 1 | None | Low | 3 |
| Card | `primitives/card.tsx` | 1 | Zero-radius override (LAW 13) | Low | 4 |
| Select | `components/select.tsx` | 3 | Token colors | Medium | 5 |
| Checkbox | `primitives/checkbox.tsx` | 0 | None — unused; consider deletion | Medium | 5 |
| Radio Group | `primitives/radio-group.tsx` | 1 | Token colors | Medium | 5 |
| Switch | `primitives/switch.tsx` | 4 | Token colors | Medium | 5 |
| Dialog | `primitives/dialog.tsx` | 6 | Paper-scoped overlay token | Medium | 6 |
| Sheet | `primitives/sheet.tsx` | 1 | Paper-scoped overlay token | Medium | 6 |
| Popover | `primitives/popover.tsx` | 6 | `suppressHydrationWarning` on Trigger (Radix `useId` workaround) | Medium | 6 |
| Tooltip | `primitives/tooltip.tsx` | 0 | None — unused; consider deletion | Medium | 6 |
| Tabs | `primitives/tabs.tsx` | 9 | Token colors | Medium | 7 |
| Accordion | `primitives/accordion.tsx` | 0 | None — unused; consider deletion | Medium | 7 |
| Collapsible | `primitives/collapsible.tsx` | 0 | None — unused; consider deletion | Medium | 7 |
| Table | `primitives/table.tsx` | 1 | Zero-radius override | High | 8 |
| Dropdown Menu | `primitives/dropdown-menu.tsx` | 1 | Token colors | Medium | 6 |
| Command | `primitives/command.tsx` | 3 | Used by Combobox + CommandPalette | Medium | 7 |
| Alert Dialog | `primitives/alert-dialog.tsx` | 3 | Token colors | Medium | 6 |
| Calendar | `primitives/calendar.tsx` | — | `nav` `z-10` + `months relative` (DayPicker layout fix from prior audit) | Medium | 7 |
| Date Picker | `primitives/date-picker.tsx` | — | Composed wrapper over Calendar + Popover | Medium | 7 |
| Date Range Picker | `primitives/date-range-picker.tsx` | — | Same | Medium | 7 |
| Combobox | `primitives/combobox.tsx` | — | Composed wrapper | Medium | 7 |
| Multi Select | `primitives/multi-select.tsx` | — | Composed | Medium | 7 |
| Empty State | `primitives/empty-state.tsx` | — | TAC original | Low | n/a |
| Error Boundary | `primitives/error-boundary.tsx` | — | TAC original | Low | n/a |
| Wizard | `primitives/wizard.tsx` | — | TAC original — multi-step shell | Low | n/a |
| Skeleton | `primitives/skeleton.tsx` | — | None | Low | 3 |
| Toggle Group / Toggle | `primitives/toggle*.tsx` | — | Token colors | Low | 6 |
| Scroll Area | `primitives/scroll-area.tsx` | — | None | Low | 4 |
| SLA Badge | `primitives/sla-badge.tsx` | — | TAC original (chart-related) | Low | n/a |
| Density Toggle | `primitives/density-toggle.tsx` | — | TAC original | Low | n/a |

**TAC-original primitives** (no shadcn equivalent — do not upgrade): `animated-text`, `barcode-scanner`, `breadcrumbs`, `bulk-action-bar`, `density-toggle`, `empty-state`, `error-boundary`, `file-dropzone`, `multi-select`, `print-button`, `rich-text-editor`, `signature-pad`, `sla-badge`, `time-picker`, `transition-link`, `universal-barcode`, `wizard`.

**Heroes (top-level top-folder)**: `HeroBadge.tsx` — TAC original, not a shadcn primitive. Consider moving to `composed/dashboard/` for LAW 2 cleanliness. `HeroStatsCard.tsx` was deleted in Phase 1 of the NextAdmin refactor; consumers now use `composed/stat-card.tsx`.

---

## 2. Composed components — `packages/ui/src/components/composed/`

Composed components compose primitives + business state. Each one is a single instance in the codebase post-sidebar-consolidation (see `tac-skillify` + sidebar VRT). New variants must be added via CSS scope, not duplicate files.

| Component | Path | Primitives consumed | Variants | Risk |
|---|---|---|---|---|
| **Sidebar** | `composed/sidebar/sidebar.tsx` | Link, icons | One — `.ops-console` CSS scope reskins | Low — VRT-locked |
| **OpsShell** | `composed/ops-console/ops-shell.tsx` | Sidebar, OpsTopbar | One | Low |
| OpsFrame | `composed/ops-console/ops-frame.tsx` | — | One | Low |
| OpsCard | `composed/ops-console/ops-card.tsx` | — | CVA: pad, accent, ticks | Low |
| OpsBadge | `composed/ops-console/ops-badge.tsx` | — | CVA: tone | Low |
| OpsButton | `composed/ops-console/ops-button.tsx` | — | CVA: variant, size | Low |
| OpsTable | `composed/ops-console/ops-table.tsx` | — | One | Low |
| OpsFieldInput / OpsFieldSelect | `composed/ops-console/ops-field.tsx` | Native `<input>` / `<select>` | Two | Low |
| OpsTabs | `composed/ops-console/ops-tabs.tsx` | — | One | Low |
| OpsKbd | `composed/ops-console/ops-kbd.tsx` | — | One | Low |
| OpsSkeleton | `composed/ops-console/ops-skeleton.tsx` | — | One | Low |
| OpsEmptyState | `composed/ops-console/ops-empty-state.tsx` | — | One | Low |
| OpsErrorState | `composed/ops-console/ops-error-state.tsx` | — | One | Low |
| OpsTimeline | `composed/ops-console/ops-timeline.tsx` | — | One | Medium |
| OpsListState | `composed/ops-console/ops-list-state.tsx` | — | One | Low |
| OpsShipmentStepper | `composed/ops-console/ops-shipment-stepper.tsx` | — | One | Medium |
| OpsPanelTabs | `composed/ops-console/ops-panel-tabs.tsx` | Radix Tabs | One | Low |
| OpsGrowthAreaChart | `composed/ops-console/ops-growth-chart.tsx` | Recharts + Chart primitive | One | Low |
| OpsVolumeBarChart | `composed/ops-console/ops-volume-chart.tsx` | Recharts + Chart primitive | One | Low |
| OpsShipmentBarChart | `composed/ops-console/ops-shipment-bar-chart.tsx` | Recharts + Chart primitive | One | Low |
| OpsRevenueRadialChart | `composed/ops-console/ops-revenue-radial-chart.tsx` | Recharts + Chart primitive | One | Low |
| OpsUpcomingCalendar | `composed/ops-console/ops-upcoming-calendar.tsx` | Calendar primitive | One | Medium |
| OpsPages (manifests, customers, finance, analytics, inventory, settings views) | `composed/ops-console/pages/*` | Multiple primitives + OpsCard/Frame | One per page | Medium |
| OpsForms (customer create, manifest create) | `composed/ops-console/forms/*` | Form primitives | One per flow | Medium |
| Manifest Builder Wizard | `composed/manifests/manifest-builder/*` | Wizard primitive | One — three steps | High |
| Customer Form | `composed/customers/customer-form.tsx` | Wizard, Input, Label, SmartAddressFields | One | Medium |
| Smart Address Fields | `composed/smart-address-fields.tsx` | Popover, Command, Input | One | Medium |
| Data Table | `composed/data-table.tsx` | Table primitive, @tanstack/react-table | One | High |
| Notes Panel | `composed/notes/notes-panel.tsx` | TipTap | One | Medium |
| Dashboard widgets (sla-monitor-card, etc.) | `composed/dashboard/*` | Card primitive | One per widget | Low |
| Notification Bell | `composed/notification-bell.tsx` | Dropdown Menu | One | Low |
| Page Shell / Page Header | `composed/page-shell.tsx`, `composed/page-header.tsx` | — | One each | Low |

---

## 3. LAW 2 violations — UI components living under `apps/*/components/`

LAW 2 mandates that all UI components live in `packages/ui/`. Wrappers around React Context (providers, guards) are not strictly UI and may stay in apps; everything else must move.

| Path | App | Type | Action |
|---|---|---|---|
| `apps/dashboard/components/providers.tsx` | dashboard | React Query + Theme + Toaster provider wrapper | **Keep** — app-specific glue (instantiates QueryClient with app-specific defaults) |
| `apps/dashboard/components/theme-provider.tsx` | dashboard | next-themes wrapper | **Keep** — thin app wrapper |
| `apps/dashboard/components/session-guard.tsx` | dashboard | Auth subscription side-effect | **Keep** — uses `next/router`, app-specific |
| `apps/dashboard/components/idle-guard.tsx` | dashboard | Idle-timeout side-effect | **Keep** — uses `next/router` + `useRBAC`, app-specific |
| `apps/web/components/theme-provider.tsx` | web | next-themes wrapper | **Keep** — thin app wrapper |

**Conclusion**: zero pure UI components live under `apps/*/components/`. The five files are all React Context bridges or auth side-effects that legitimately depend on the app's Next router and provider stack. **No LAW 2 violations to remediate** at this time. The CI guard added in Phase 8 will catch any future drift.

---

## 4. Risk legend

- **Low** — single-instance, small caller count (< 10), well-isolated, no portal/state concerns
- **Medium** — moderate caller count (10–25) or Radix portal / state-machine concerns
- **High** — wide caller surface (> 25) or composition rules changed in recent shadcn (Form / Field), or central to multiple flows (Data Table)
- **n/a** — TAC-original, not subject to shadcn upgrade

---

## 5. Maintenance

When adding a primitive or composed component:

1. Add a row to the appropriate table above
2. Update the caller count via:
   ```bash
   grep -rl 'from "@workspace/ui/components/<path>"' packages/ui apps --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v .next | wc -l
   ```
3. If it's a duplicate of an existing primitive, **don't add** — extend the existing one via CSS scope (see `Sidebar` precedent)

When deleting a primitive (e.g. retiring `accordion` due to 0 callers): cross-check the inventory, run the same grep against the deleted path, then delete the file + the inventory row in the same PR.

---

## 6. Outstanding lint warnings — mapped to owning phase (Sprint 0 / S0.4)

After Phase 3 the lint surface stabilised at **36 warnings**, all in `packages/ui` composed components (zero primitives). Distribution by phase:

| Phase | Count | Notes |
|---|---:|---|
| Phase 4 (primitives) | 0 | All primitives are token-clean post-Phase 3 |
| **Phase 5 (composed audit)** | 36 | Resolved per file during the composed audit pass |
| Phase 6 (LAW 2) | 0 | No LAW 2 violations exist today |

### File-level ownership

Every file below is owned by **Phase 5** unless re-classified. Resolution happens as part of the composed-audit pass: either tokenise the value (add a named token), keep with a `// design-locked: <reason>` comment, or document in `docs/design-exceptions.md` (see S0.5).

| File | Warnings | Notes |
|---|---:|---|
| `packages/ui/src/components/composed/auth/sign-in-split-layout.tsx` | n | Split-layout auth surface |
| `packages/ui/src/components/composed/bookings/bookings-inbox.tsx` | n | Bookings list |
| `packages/ui/src/components/composed/finance/aging-buckets.tsx` | n | Receivables aging strip |
| `packages/ui/src/components/composed/footer.tsx` | n | App footer |
| `packages/ui/src/components/composed/manifests/manifest-builder/step-add-shipments.tsx` | n | Wizard step 2 — scan loop |
| `packages/ui/src/components/composed/notes/notes-panel.tsx` | n | TipTap notes thread |
| `packages/ui/src/components/composed/notifications/notification-inbox.tsx` | n | Notification list |
| `packages/ui/src/components/composed/ops-console/ops-growth-chart.tsx` | n | Dashboard area chart |
| `packages/ui/src/components/composed/ops-console/ops-revenue-radial-chart.tsx` | n | Analytics radial chart |
| `packages/ui/src/components/composed/ops-console/ops-shipment-bar-chart.tsx` | n | Analytics bar chart |
| `packages/ui/src/components/composed/ops-console/ops-volume-chart.tsx` | n | Dashboard bar chart |
| `packages/ui/src/components/composed/ops-console/pages/ops-manifests-view.tsx` | n | Manifests table page |
| `packages/ui/src/components/composed/ops-console/pages/ops-notifications-view.tsx` | n | Notifications page |
| `packages/ui/src/components/composed/ops-console/pages/ops-rate-cards-view.tsx` | n | Rate cards page |
| `packages/ui/src/components/composed/ops-console/pages/ops-scanning-view.tsx` | n | Scanning page |
| `packages/ui/src/components/composed/ops-console/pages/ops-settings-view.tsx` | n | Settings page |
| `packages/ui/src/components/composed/ops-console/pages/ops-shipments-view.tsx` | n | Shipments page |
| `packages/ui/src/components/composed/scanning/arrival-audit-stats.tsx` | n | Arrival audit stats |
| `packages/ui/src/components/composed/shipments/awb-barcode.tsx` | n | AWB barcode strip |
| `packages/ui/src/components/composed/sidebar/sidebar.tsx` | n | Sidebar (1 spacing + 1 tracking — both intentional, see exceptions doc) |
| `packages/ui/src/components/composed/smart-address-fields.tsx` | n | Address form |
| `packages/ui/src/components/composed/wasteland-landing.tsx` | n | Public landing page |

(Per-file warning counts not recorded here because they fluctuate as warnings are resolved incrementally. Source of truth is `pnpm lint 2>&1 | grep "TAC LAW"`.)

### Exit criterion (S0.4)

Every TAC-LAW warning has a phase assignment. **Unassigned warnings are not permitted in this list** — every line must point at Phase 5 (the only valid owner for current warnings) or carry an explicit `design-locked` justification.

