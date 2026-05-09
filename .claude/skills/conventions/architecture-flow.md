# Architecture Flow Convention

**Read before writing ANY data-touching code.** This is LAWs 5, 6, 7, 8 in
one diagram. Every TAC Express skill that touches data defers to this rule.

## The Flow (inviolable)

```
UI Component (apps/* OR packages/ui/)
   │  props / hooks only — NO business logic, NO DB calls
   ▼
packages/services/   ← business logic per domain
   │  typed function calls only — uses createXxxService(db) factory
   ▼
packages/database/   ← @supabase/* SDK is confined here
   │  factory pattern: createBrowserClient / createServerClient / createAdminClient
   ▼
Supabase (cloud) — Postgres + RLS + Storage + Auth + Edge Functions
```

## Hard rules

1. **No `@supabase/*` import outside `packages/database/`** (LAW 8).
   - Enforced by `pnpm audit:auth-boundary` and ESLint `no-restricted-imports`.
2. **No DB call from a component** (LAW 6) — components consume hooks like
   `useShipments()` from `packages/services/hooks/`.
3. **No business logic in a component** (LAW 7) — rate calculations, validations,
   entity merging, status derivation all live in services.
4. **No UI in `apps/*/components/`** (LAW 5) — only providers, app-shell glue,
   and page-level client wrappers belong in apps.

## Acceptable in `apps/<app>/components/`

Narrow allowlist; everything else is a LAW 5 violation:

- `providers.tsx` (composition of QueryClient + ThemeProvider + Toaster)
- App-shell glue (idle-guard wrapper around a UI component)
- Page-level client wrappers that thread server props into a UI component
- Route-segment loading.tsx / error.tsx / not-found.tsx

## Service factory pattern (memorize)

```ts
// packages/services/src/shipments.service.ts
export function createShipmentsService(db: Database) {
  return {
    list: async (filters: ShipmentFilters) => { /* db.from("shipments")... */ },
    create: async (input: CreateShipmentInput) => { /* validate + insert */ },
    // … all shipment business logic
  }
}

// packages/services/src/hooks/use-shipments.ts
export function useShipments(filters: ShipmentFilters) {
  return useQuery({
    queryKey: ["shipments", filters],
    queryFn: () => createShipmentsService(getBrowserDb()).list(filters),
  })
}
```

Components only ever see the hook.

## Why this matters

- **RLS by role** — keeping DB access in one place means `packages/database/`
  is the single audit surface for service-role escapes (`tac-supabase-schema`).
- **Type safety** — `pnpm db:generate-types` regenerates `packages/types/database.ts`;
  any service-layer drift is caught at typecheck.
- **Testability** — services accept a `db` argument, so unit tests inject a mock,
  and the same code path runs in browser, server, and edge contexts.
- **No N+1 in components** — when DB is in services, hooks can batch and cache;
  when DB is in components, every render becomes a query.

## Skill chain when touching this flow

| You're changing | Load these skills |
|---|---|
| A component that needs new data | `tac-data-layer` (add hook + service method first) |
| A service method | `tac-data-layer` → `tac-tdd` (test the service in isolation) |
| The DB shape | `tac-supabase-schema` → regenerate types → `tac-data-layer` → `tac-tdd` |
| A new client (browser/server/admin) | `tac-auth` (only place that's allowed to touch this) |

## Anti-patterns

- ❌ `import { createClient } from "@supabase/supabase-js"` in `apps/dashboard/`
- ❌ `await supabase.from("shipments").select()` inside a React component
- ❌ Computing invoice totals inline in `<InvoicePrintView>` — call `invoiceService.compute(input)`
- ❌ A "small one-off" SQL string built in a component "just for this view"

## Reference

- Skills: `tac-data-layer`, `tac-supabase-schema`, `tac-auth`, `tac-api-surface`
- Memory: `feedback_layer_dependency_direction.md`
- Audits: `pnpm audit:auth-boundary`, `pnpm audit:governance`
