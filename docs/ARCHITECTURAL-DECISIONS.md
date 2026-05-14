# TAC Express — Open Questions: Architectural Decisions

**Date:** 2026-04-30
**Status:** DECIDED — Ready for Phase 1
**Authority:** AGENTS.md → PROJECT-RULES.md → DESIGN_SYSTEM.md
**Companion to:** `TAC-PORTAL-BU-MIGRATION-MASTERPLAN.md` § 14

---

## Summary: Decision Matrix

| # | Question | Decision | Confidence | Reversibility |
|---|---|---|---|---|
| 1 | Map provider | OpenFreeMap + MapLibre GL JS | High | Easy (swap tile URL) |
| 2 | PDF runtime | Hybrid: `@react-pdf/renderer` (server) + `react-to-print` (browser) | High | N/A (both needed) |
| 3 | GSP for IRN/EWB | NIC Direct (sandbox first), abstracted behind `einvoice.service.ts` | High | Easy (swap impl) |
| 4 | Multi-tenant model | Single-org per session (data layer is multi-tenant) | High | Medium (2-3 day upgrade) |
| 5 | WhatsApp share | `wa.me` deeplinks; Business API behind feature flag | High | Easy (add later) |
| 6 | Supabase region | `ap-south-1` (Mumbai) — migrate if not already there | Critical | Hard (migration) |
| 7 | Org-level theme override | **Indigo only — no overrides** (LAW 1) | Absolute | Never |

---

## Decision 1 — Map Provider: **OpenFreeMap + MapLibre GL JS**

**Why:** Zero cost forever, no API key, no quota. MapLibre's open style spec lets us paint the dark Indigo Mission-Control basemap exactly to our OKLCH tokens. No proprietary lock-in (Mapbox ToS would forbid mixing tiles).

**Implementation path:**
```
packages/ui/src/components/maps/
├── maplibre-map.tsx         — <MapLibreMap> wrapping react-map-gl/maplibre
├── india-corridor-map.tsx   — <LiveCorridorMap> with hub markers + animated route arcs
├── map-style.ts             — Custom dark JSON style (Indigo Mission-Control)
└── map-utils.ts             — Coordinate helpers, route interpolation
```

- **Tile source:** `https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf`
- **Style:** Custom JSON derived from OSM Bright, recolored to dark indigo
- **Hub markers:** Custom `<div>` overlays styled with `tac-mono-label` + brutalist border
- **Route lines:** GeoJSON LineString per active manifest with `line-dasharray` interpolation
- **Bounds:** India bbox `[68.1, 6.5, 97.4, 35.7]` — locked, no world zoom

**Upgrade path if quality insufficient:** swap tile URL to MapTiler free tier (100k/mo) → self-host PMTiles on Supabase Storage / Cloudflare R2.

**Risk mitigation:**
- OpenFreeMap downtime → service-worker tile cache + static SVG India fallback
- OSM gaps in NE India → contribute to OSM + supplement key corridors with manual GeoJSON

---

## Decision 2 — PDF Runtime: **Hybrid `@react-pdf/renderer` + `react-to-print`**

**Why:** Two distinct use cases need two tools. Single-doc browser print = `react-to-print` (~200ms, no server). Batch generation, downloadable artifacts, server-emailed statements = `@react-pdf/renderer` Edge Function (pixel-perfect, font-embedded, consistent across browsers).

**Decision matrix:**

| Scenario | Method | Why |
|---|---|---|
| User clicks "Print" on single invoice | `react-to-print` | Instant, no server |
| User clicks "Download PDF" | Edge Function → `@react-pdf/renderer` | Consistent output |
| Batch "Download All Labels" (50+) | Edge Function → zip stream | Can't block browser |
| Scheduled statement emails | Edge Function (cron) | No browser involved |
| Thermal label (4×6) | Both | DOM print for direct thermal; PDF for archive |

**Implementation:**
```
packages/services/src/pdf/
├── invoice-pdf.tsx          — @react-pdf/renderer Document
├── manifest-pdf.tsx
├── shipping-label-pdf.tsx
├── statement-pdf.tsx
├── shift-report-pdf.tsx
└── pdf-fonts.ts             — Space Grotesk + JetBrains Mono registration

apps/dashboard/app/print/    — DOM-based print views (`@media print`)
├── label/[awb]/page.tsx
├── manifest/[id]/page.tsx
└── invoice/[id]/page.tsx

packages/ui/src/components/primitives/print-button.tsx
                             — <PrintButton> wraps react-to-print

packages/database/supabase/functions/generate-pdf/
                             — Edge Function routes per template
```

**Risks & mitigations:**
- Edge Function timeout on large batches → chunk into 50-doc batches; emit progress via Realtime
- Font mismatch DOM vs PDF → register identical fonts in both paths; snapshot test
- Thermal printer compatibility → test Zebra ZD421 + Brother QL-820NWB; provide `@page` size presets

---

## Decision 3 — GSP for IRN/EWB: **NIC Direct, abstracted via service interface**

**Why:** Zero per-invoice fee, no vendor lock-in, sandbox-first responsible engineering. Government API, well-documented, sufficient rate limits (100 req/min sandbox; production limits are ample for our volume). The single-file `einvoice.service.ts` interface lets us swap to Cleartax / MasterGST / MasterIndia later with zero UI changes.

**Implementation:**
```
packages/services/src/
├── einvoice.service.ts      — Interface + NIC implementation
│   ├── generateIRN(invoice)   → { irn, ackNo, ackDate, signedQR, signedInvoice }
│   ├── cancelIRN(irn, reason) → { cancelDate }
│   ├── generateEWB(shipment)  → { ewbNo, ewbDate, validUpto }
│   ├── cancelEWB(ewbNo)       → { status }
│   └── updateTransporter(ewb) → { status }
├── einvoice.types.ts        — Request/response types
└── einvoice.config.ts       — Env-switched URLs (sandbox vs production)

packages/database/supabase/functions/
├── einvoice-irn/index.ts    — Auth with IRP, generate IRN, store result
└── ewaybill-generate/index.ts — Auth with EWB portal, generate, store

packages/database/supabase/migrations/
└── 20260501000009_einvoice_ewaybill.sql
    — einvoice_records (id, invoice_id, irn, ack_no, ack_date, signed_qr, signed_invoice_json, status, error_json)
    — ewaybill_records (id, shipment_id, ewb_no, ewb_date, valid_upto, status, transporter_id, error_json)
```

**Migration trigger to GSP:** NIC uptime <99%/30d, OR volume >10k invoices/month, OR multi-GSTIN management pain.

---

## Decision 4 — Multi-Tenant Model: **Single-org per session**

**Why:** YAGNI. The **data layer** is already multi-tenant (`org_id` + RLS by `auth.jwt() ->> 'org_id'`). Building an org-switcher today adds state complexity, header real estate, security surface, and testing burden — for zero current user value (one org).

**What we DO build now:**
- `org_id` column on every new table (migrations 06–10) ✅
- RLS policies scoped by `auth.jwt() ->> 'org_id'` on every new table ✅
- `org_id` index on every new table for RLS performance ✅
- Org profile editor in `/settings/general` (name, GSTIN, logo, currency) ✅

**Upgrade path when 2nd tenant onboards (2-3 days, isolated):**
1. Add `organizations` table query to auth session hydration.
2. Add `<OrgSwitcher>` to `<UserMenu>` dropdown.
3. On switch: update JWT custom claim via Edge Function, invalidate all queries.
4. Add org-aware cache keys to `query-keys.ts`.

---

## Decision 5 — WhatsApp Share: **`wa.me` deeplinks now; Business API feature-flagged**

**Why:** Instant value, zero infra, privacy-respecting (TAC never sees recipient or message). Business API requires Meta Business verification, dedicated phone, template approval — multi-week onboarding that blocks shipping.

**Implementation:**
```ts
// packages/services/src/share.service.ts
export function generateWhatsAppShareUrl(params: {
  phone?: string  // Optional 10-digit Indian mobile
  text: string
}): string {
  const base = params.phone
    ? `https://wa.me/91${params.phone}`
    : `https://wa.me/`;
  return `${base}?text=${encodeURIComponent(params.text)}`;
}
```

**Upgrade trigger to Business API:** server-initiated messages, template broadcasts, OR >100 manual shares/day.

---

## Decision 6 — Supabase Region: **`ap-south-1` (Mumbai)**

**Why:** ~10× latency reduction. Every Indian user (Delhi 15ms, Imphal 45ms) vs US-East (180ms+). Scanning round-trip drops from ~500ms to ~100ms. Realtime channels feel "live" not "laggy." Co-located with NIC IRP/EWB APIs.

**Action items:**
1. Check current region in Supabase dashboard → Project Settings → General.
2. If NOT `ap-south-1`:
   - Schedule maintenance 2-4 AM IST.
   - Full `pg_dump` backup.
   - Migrate via project clone or Supabase support.
   - Update `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in deployment env.
   - Verify Edge Functions redeploy.
   - Re-upload Supabase Storage bucket contents if not auto-migrated.
3. Verify row counts pre/post.
4. Pre-warm critical Edge Functions (`generate-pdf`, `dispatch-webhook`).

---

## Decision 7 — Org-Level Theme Override: **NONE — Indigo only, by law**

**Why:** Org overrides would require runtime color injection — direct violation of LAW 1 (no color outside `globals.css`). WCAG AAA contrast cannot be guaranteed against arbitrary palettes. The brutalist Indigo Mission-Control aesthetic IS the product identity, not a skin. Theming-per-org multiplies test surface for marginal user value.

**What we DO offer:**

| Customization | Available | Where |
|---|---|---|
| Light / Dark / System | ✅ | `/settings/theme` |
| Reduced motion | ✅ | `prefers-reduced-motion` honored |
| Density (compact/comfortable/spacious) | ✅ | Per-list-page toggle |
| Org logo on header + invoices | ✅ | `/settings/general` upload |
| Org name on header + documents | ✅ | `/settings/general` |
| Custom primary color | ❌ | LAW 1 |
| Custom font | ❌ | LAW 4 |
| Custom radius | ❌ | LAW 13 (`--radius: 0rem`) |

---

## Decision 8 — Migration drift reconciliation: **Path A (production-as-baseline)**

**Status:** Pending owner confirmation as of 2026-05-15. Catalog filed in
`supabase/snapshots/MIGRATION-DRIFT-CATALOG-2026-05-15.md`.

**Context:** Production Supabase (`mdvnphbucrpspntrezmj`) carries 17
migrations under names that do not exist in the repo (`20260421*` family).
The repo has 11 migrations under different names (`20260430*`, `20260512000*`,
`20260514*`) that have never been applied to production. Independent
maintenance over six weeks produced **structurally different schemas** —
not just function-signature drift, but a fundamentally different model
(repo: enum types + lowercase values; production: TEXT + CHECK +
UPPERCASE values; different lifecycle states for shipments/manifests;
different role names; different helper-function names).

**Options considered** (full analysis in catalog §6):

- **Path A — Production is baseline (chosen).** Generate one consolidated
  baseline migration from production schema. Archive the divergent repo
  migrations. Insert production's filenames into
  `supabase_migrations.schema_migrations` once. Forward migrations only
  from here.
- **Path B — Repo is truth, push everything.** Rejected: high production
  risk, requires maintenance window for a live logistics app.
- **Path C — Edit repo migrations to match production.** Rejected after
  the May 15 snapshot: the divergence is structural, not cosmetic.
  Editing every migration to match would damage audit-trail integrity
  more than archiving them, and takes weeks instead of days.

**Why Path A:**

1. Production is already correct (modulo the `OPERATOR` RLS bug — see
   below) and serves real customer traffic. Treating it as the baseline
   minimizes change to live state.
2. One generation step + one archive move + one bookkeeping insert is
   bounded work. Editing 11 migrations to match a different schema
   model is unbounded.
3. Audit-trail integrity is preserved — archived migrations stay
   readable in `supabase/migrations/_archive/` for git-blame value.
4. CI gate `migrations-fresh-apply` becomes load-bearing immediately
   after the baseline lands. Today it runs against a fictional schema.

**Forward implications:**

- Repo enum types are abandoned. Domain code in `packages/services` /
  `packages/types` must use string literal unions matching production
  CHECK lists (UPPERCASE).
- The first forward migration after baseline fixes the latent
  `invoice_payments_insert` bug (policy references nonexistent role
  `'OPERATOR'` — only `SUPER_ADMIN` can currently insert payments).
- Future schema changes go through normal `supabase migration new` flow.
- The CI staleness gate added in #74 keeps `database-types.ts` in lock-step
  with the new baseline.

**What this does NOT change:**

- No production data is touched.
- No production schema is altered by this PR — it captures and catalogs
  only. The forward "fix `OPERATOR` role" migration ships separately.
- All RPC, RLS, and trigger semantics in production continue exactly
  as today.

— END OF DECISIONS —
