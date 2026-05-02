# TAC Express

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/cargotapan-collab/tac-express?utm_source=oss&utm_medium=github&utm_campaign=cargotapan-collab%2Ftac-express&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

> Mission-control logistics for the North-East corridor. Public marketing site at **`apps/web`**, operations dashboard at **`apps/dashboard`**, shared platform in **`packages/`**, schema in **`supabase/`**.

**Authority documents (must read before contributing):**
- [`AGENTS.md`](AGENTS.md) — agent rules & protocols (governs AI contributors)
- [`PROJECT-RULES.md`](PROJECT-RULES.md) — the Fourteen Laws + monorepo enforcement
- [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — TAC Express v5.0 — Violet Grid (the visual spec)
- [`CLAUDE.md`](CLAUDE.md) — Claude Code-specific workflow

**Operational + reference docs:**
- [`docs/PRODUCTION-RUNBOOK.md`](docs/PRODUCTION-RUNBOOK.md) — deployment topology, rollback, on-call
- [`docs/ARCHITECTURAL-DECISIONS.md`](docs/ARCHITECTURAL-DECISIONS.md) — map provider, PDF runtime, multi-tenant model, etc.
- [`docs/CODEBASE-AUDIT-2026-05.md`](docs/CODEBASE-AUDIT-2026-05.md) — most recent full-project audit + outstanding follow-ups

**Skill files (load these before non-trivial AI-agent tasks):**
- `.claude/skills/*/SKILL.md` — canonical Claude Code skills (16 skills, all Violet-Grid-aligned)
- `.agents/skills/*/SKILL.md` — preserved redirects for the GSD framework (point to `.claude/skills/`)

---

## Repository layout

```
tac-express/
├── apps/
│   ├── web/                  Next.js 16 — public landing & tracking (port 3000)
│   └── dashboard/            Next.js 16 — operations dashboard (port 3001)
├── packages/
│   ├── ui/                   @workspace/ui — components, tokens, icons
│   ├── auth/                 @workspace/auth — Supabase auth wrapper, RBAC
│   ├── database/             @workspace/database — Supabase SSR clients only
│   ├── services/             @workspace/services — business logic per domain
│   ├── types/                @workspace/types — domain types, brands, schemas
│   ├── eslint-config/        shared ESLint config
│   └── typescript-config/    shared TS config
├── supabase/
│   ├── config.toml           local Supabase config
│   ├── migrations/           versioned DDL (5 files, init schema)
│   ├── functions/            edge functions (dispatch-webhook, generate-pdf, …)
│   └── seed.sql              hub & rate-card seed data
└── scripts/                  governance audits
```

## Quick start

```bash
pnpm install                       # Node 20+, pnpm 10+
cp .env.example apps/web/.env.local
cp .env.example apps/dashboard/.env.local
# fill in Supabase URL + anon key in both .env.local files

# Local Supabase (optional — requires Docker + Supabase CLI):
pnpm supabase:start
pnpm supabase:reset                # applies migrations + seed.sql
pnpm supabase:types                # regenerates packages/database/src/database.types.ts

# Run the apps:
pnpm dev                           # turbo dev — starts both apps
```

Web: http://localhost:3000   ·   Dashboard: http://localhost:3001

## Quality gates

Run before every commit:

```bash
pnpm lint --max-warnings 0
pnpm typecheck
pnpm test
pnpm audit:all       # governance + auth-boundary + skills + design-spec
```

## The Fourteen Laws

| # | Law | Failure mode |
|---|-----|--------------|
|  1 | No color value outside `packages/ui/src/styles/globals.css` | ESLint error |
|  2 | No icon except `@remixicon/react` via `@workspace/ui/icons` | ESLint error |
|  3 | Animation only via `motion`, `tw-animate-css`, or `@keyframes` in globals.css | ESLint error |
|  4 | Fonts declared only in the two `apps/*/app/layout.tsx` files | PR rejection |
|  5 | UI components only in `packages/ui` | ESLint + CI |
|  6 | No DB calls in components — only via `packages/services` | PR rejection |
|  7 | No business logic in components | PR rejection |
|  8 | `@supabase/supabase-js` only in `packages/database` | ESLint + CI |
|  9 | No hardcoded spacing / radius / shadow values | ESLint |
| 10 | No Tailwind color classes (`bg-blue-500` etc.) | ESLint + CI |
| 11 | No arbitrary Tailwind values (`w-[347px]`) | ESLint |
| 12 | `pnpm` only — no `npm` or `yarn` | pre-commit hook |
| 13 | Straight lines only — no curves, no `rounded-full` | PR rejection |
| 14 | Wrap shadcn primitives — never rebuild | PR rejection |

Full list with rationale: [`PROJECT-RULES.md`](PROJECT-RULES.md).

## License

Proprietary. All rights reserved.
