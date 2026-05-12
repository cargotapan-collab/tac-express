# Convention — Architecture Flow

> Cross-cutting rule. Applies to every task regardless of which specialist skill loaded.
> Authority: `AGENTS.md` § 4 LAW 6 / LAW 7 / LAW 8.

---

## The Inviolable Flow

```
UI Component
    ↓  (props / hooks only)
packages/services/   ← business logic lives here
    ↓  (typed function calls only)
packages/database/   ← Supabase client lives here
    ↓
Supabase (cloud)
```

No skipping. No detours. No shortcuts.

## Hard rules

- **Components** never import `@supabase/*` — LAW 8.
- **Components** never contain conditional business logic beyond display state — LAW 7.
- **`packages/database`** is the only place `@supabase/supabase-js` and `@supabase/ssr` may be imported.
- **`packages/services`** is the only place where DB queries are composed.
- **Server components** may call services directly; client components must go through hooks (`use-*`) which call services.
- **Edge functions** (`supabase/functions/*`) are services too — they live in `packages/services/edge/` shape mirrored on Supabase.

## Package boundaries (LAW 5)

| Lives in | Examples |
|---|---|
| `packages/ui/` | every UI component, every hook, every icon, every chart primitive, every form field |
| `packages/services/` | all business logic, all data fetching, all RPC wrappers, all derivations |
| `packages/database/` | Supabase client factories (browser, server, middleware, admin), generated types |
| `packages/types/` | branded types, enums, zod schemas |
| `packages/auth/` | signIn / signOut / getSession / role checks |
| `apps/web/` | landing pages, marketing, public surfaces — composed from `@workspace/ui` |
| `apps/dashboard/` | logistics operations — composed from `@workspace/ui` |

`apps/*/components/` is forbidden — that's a LAW 5 violation. Apps consume `@workspace/ui` only.

## Test boundary

Mock at the **services layer**, never inside components. Components get props + mocked service factories.

## Migration / RLS / RPC

Schema changes always include:
1. Migration file in `supabase/migrations/` with timestamp prefix
2. RLS policy (or explicit `comment on table is 'public read'` / similar justification)
3. Generated types regen: `pnpm supabase:types`
4. RPC function (if needed) with `SECURITY DEFINER` only when necessary

Never apply a migration to a remote project without local testing first.

## What to do when in doubt

1. Could a malicious user reach this from the browser without auth? → It needs RLS.
2. Could this hold business rules that may need to change without redeploying? → Move to services.
3. Could a chart in the dashboard share this logic with the marketing page? → Move to `@workspace/ui`.
