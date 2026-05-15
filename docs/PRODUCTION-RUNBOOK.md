# TAC Express — Production Runbook

**Last updated:** 2026-05-01
**Authority:** TAC-PORTAL-BU-MIGRATION-MASTERPLAN.md (Phases 1-9)
**Audience:** On-call engineers, deployment leads

> Companion document: `.planning/OPEN-QUESTIONS-DECISIONS-2026-04-30.md` for
> the architectural decisions behind the choices below.

---

## 1. Deployment topology

| Surface | Host | Region | Notes |
|---|---|---|---|
| Dashboard `apps/dashboard` | Vercel | Mumbai (`bom1`) | Next.js 16, Turbopack |
| Marketing `apps/web` | Vercel | Mumbai | Static + ISR |
| Supabase | Supabase Cloud | `ap-south-1` (Mumbai) | Decision 6 — confirmed |
| Edge Functions | Supabase | Mumbai (deno deploy) | `dispatch-webhook`, `generate-pdf`, `scheduled-sla-monitor`, `send-notification` |
| Tile basemap | OpenFreeMap | Edge POPs | Decision 1 — no API key |
| Observability | Sentry | EU/US | DSN per-project |
| Rate limiting | Upstash Redis | `ap-south-1` | REST API, edge-compatible |

**Network path:** browser → Vercel Edge (proxy.ts) → Vercel functions / SSR
→ Supabase Postgres (Mumbai). Edge rate limit gates `/api/public/**` +
auth surfaces before any function spin-up.

---

## 2. Required environment variables

### Public (browser-safe, prefixed `NEXT_PUBLIC_`)

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SENTRY_DSN=                  # optional — disables Sentry if unset
NEXT_PUBLIC_SENTRY_ENV=production
NEXT_PUBLIC_SENTRY_RELEASE=              # set per-deploy (commit SHA)
```

### Server-only (functions + middleware)

```bash
SUPABASE_SERVICE_ROLE_KEY=               # NEVER ship to client; used by Edge Functions only
SENTRY_DSN=                              # optional
SENTRY_ENV=production
UPSTASH_REDIS_REST_URL=                  # optional — disables rate limit if unset
UPSTASH_REDIS_REST_TOKEN=
SUPABASE_DB_URL=                         # for migrations + scheduled jobs
```

### India compliance (Phase 4.5+)

```bash
EINVOICE_PROVIDER=NIC                    # NIC | CLEARTAX | MASTERGST | MASTERINDIA
EINVOICE_GSTIN=                          # supplier GSTIN
EINVOICE_USER_ID=                        # IRP credentials
EINVOICE_PASSWORD=
EINVOICE_CLIENT_ID=                      # GSP only
EINVOICE_CLIENT_SECRET=
EWAYBILL_USER_ID=                        # EWB portal credentials
EWAYBILL_PASSWORD=
```

**Verification:** every variable defined here appears in `turbo.json`'s
`tasks.lint.env` array — `pnpm lint` warns on undeclared usage.

---

## 3. Pre-launch checklist

### A. Database

- [ ] Supabase project provisioned in `ap-south-1`
- [ ] Auth providers configured (email + magic link minimum)
- [ ] Migrations applied in order:
  - [ ] `20260430000001_extensions_enums.sql`
  - [ ] `20260430000002_core_schema.sql`
  - [ ] `20260430000003_functions_rpcs.sql`
  - [ ] `20260430000004_rls_policies.sql`
  - [ ] `20260430000005_storage_buckets.sql`
  - [ ] Phase 5.5–8.5 migrations (notes, payments, einvoice, anomalies, audit-diff, bookings)
- [ ] RLS verified on every table — `pg_policies` shows at least one policy per public-schema table
- [ ] Seed data loaded (hubs, default rate cards, super-admin)
- [ ] PITR enabled (Supabase paid tier) — daily backup retention ≥ 7 days
- [ ] Realtime channels enabled on `shipments`, `manifests`, `exceptions`, `notifications`

### B. Edge Functions

- [ ] `dispatch-webhook` deployed
- [ ] `generate-pdf` deployed (with embedded fonts)
- [ ] `scheduled-sla-monitor` deployed + cron registered
- [ ] `send-notification` deployed
- [ ] Phase 4.5+: `einvoice-irn`, `ewaybill-generate`
- [ ] Phase 8.5: `convert_booking_to_shipment` RPC
- [ ] Each function's `Deno.serve` returns within 8s p95 — verify via `supabase functions logs <name>`

### C. App build

- [ ] `pnpm typecheck` clean across all packages
- [ ] `pnpm lint` clean (or warnings whitelisted)
- [ ] `pnpm test` green (Vitest unit suites)
- [ ] `pnpm e2e:smoke` green against preview URL
- [ ] `pnpm e2e:a11y` green (no critical/serious axe violations)
- [ ] `pnpm e2e:visual` snapshots match committed baselines (light + dark)
- [ ] Lighthouse 95+ on `/`, `/track`, `/sign-in`, `/home` (top of funnel routes)
- [ ] Bundle analyzer: per-route JS budget < 200kb gzip

### D. Observability

- [ ] **Sentry Next.js project created** in `tapan-cargo-az` org (audited 2026-05-08: only `react-native` exists — wrong runtime; create a separate `tac-express-dashboard` project before relying on captures)
- [x] **`SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` set in production env** — verified 2026-05-15 via `mcp__sentry__search_issues` (real production events flowing)
- [ ] **Alert rule configured** — Sentry events arrive but no notification rule yet. Tracked in #94. Filter on `tags[kind]:payment_response_lost` → notify ops within 5 min once configured.
- [ ] Sentry alert rules: any error in production tagged `level: error`
- [ ] Sentry source maps uploaded per release (`SENTRY_RELEASE` env var on every deploy)
- [ ] Sentry replay budget set — see `sentry.client.config.ts` (5% session sample, 100% on error)
- [ ] Vercel Speed Insights enabled
- [ ] Supabase database advisors clean — `Database → Advisors` shows zero security warnings

### E. Security

- [ ] All forbidden packages still absent — `grep -r "from \"lucide-react\"" packages apps` returns empty
- [ ] All RLS-tagged tables have org_id index
- [ ] No service-role key in any client bundle — `grep -r "SUPABASE_SERVICE_ROLE_KEY" apps` returns empty
- [ ] CSP + security headers set (Vercel `vercel.json` or middleware)
- [ ] CAPTCHA on `/track` Book tab (Phase 8.5+)
- [ ] Idle timeout enforced — verified via Playwright spec

### F. India compliance

- [ ] GSTIN regex enforced on every customer + invoice form
- [ ] Auto IGST detection working (Phase 4 — `gstSplitMode`)
- [ ] E-Invoice IRP sandbox tested for at least 5 invoice types
- [ ] E-Way Bill API tested for shipments ≥ ₹50k declared value
- [ ] MFA requirement disclosed to admin users (NIC mandate from Apr 2026)

---

## 4. Runbook for common incidents

### Supabase outage

**Symptom:** Realtime drops, queries timeout, dashboard returns 503.

1. Check `status.supabase.com` — if Mumbai has an incident, post status banner via Vercel env flag `NEXT_PUBLIC_STATUS_BANNER`.
2. Browser-side queries auto-retry 2× via TanStack Query default; users see `<EmptyState>` with retry CTA.
3. Edge Functions return 502 — proxy.ts already returns the response; no action required.
4. After recovery, run `pnpm e2e:smoke` against production to confirm route health.

### Sentry rate limit hit

**Symptom:** Sentry rejects events, dashboard logs 429 spam in browser console.

1. `sentry.client.config.ts` already drops noisy `ResizeObserver` errors. Verify no new noise sources.
2. Drop `replaysSessionSampleRate` to 0.02 temporarily.
3. Quota top-up or upgrade Sentry tier.

### Upstash rate limit hit

**Symptom:** Public API returns 429s en masse; legitimate users complain.

1. Check Upstash dashboard analytics — identify the hot IP.
2. If single IP: confirm not a deploy-time monitor; otherwise blocklist via Upstash UI.
3. If broad: raise the `slidingWindow(60, "1m")` to `slidingWindow(120, "1m")` in `lib/rate-limit.ts`. Deploy.
4. Monitor for 30 min to confirm legitimate traffic is unblocked.

### Realtime channel saturation

**Symptom:** Tabs report "subscription cancelled" in console; dashboard widgets stop updating.

1. Each open dashboard tab subscribes to `shipments`, `manifests`, `exceptions`, `notifications`. With 100 concurrent staff sessions = 400 channels.
2. If approaching the 500-channel quota, gate `useRealtimeDashboard` behind a rolled-out feature flag.
3. Aggregate to a single broadcast channel via Edge Function fan-out — Phase 9.5 if recurring.

### Idle timeout false positives

**Symptom:** Users complain they're being logged out while typing.

1. Check `useIdleTimeout` storage key — `tac-idle-activity`. Tab focus + keystroke should bump it.
2. Confirm `prefers-reduced-motion` not interfering with the warning dialog.
3. Increase `idleMinutes` from 30 → 45 in `apps/dashboard/components/idle-guard.tsx`.

### POD upload failure

**Symptom:** Drivers report "POD didn't sync."

1. POD photos persist in Zustand `scan-queue.store` until reconciled with Supabase Storage.
2. Inspect `localStorage` `tac-scan-queue` — pending items should drain on reconnect.
3. If stuck: clear failed items from the scan queue UI on `/scanning`, ask driver to re-capture.
4. Storage bucket `shipment-docs/pod/` quota — confirm available space.

### Payment recording (RESOLVED 2026-05-15)

> Historical entry preserved for audit trail. Originally tracked as #9 + the `invoice_payments` migration backlog.

**State (current):** ✅ Live in production via the Path A baseline (#96) + #97 + #100.
- `public.invoice_payments` table exists with RLS policies
- `public.record_invoice_payment(...)` RPC exists, granted to `authenticated`
- Authorized roles: `SUPER_ADMIN, ADMIN, MANAGER, INVOICE, FINANCE_STAFF` (the `OPERATOR` typo bug discovered in the 2026-05-15 audit was fixed in #97)
- `function_search_path_mutable` advisor warning closed (#98)
- `EXECUTE` privilege correctly REVOKEd from `PUBLIC` and re-granted to `authenticated` only (#100)

**If a user reports "payment recording fails":**
1. Check `mcp__supabase__get_advisors` — should show ≤ 13 warnings
2. Check `has_function_privilege('authenticated', 'public.record_invoice_payment'::regprocedure, 'EXECUTE')` — should be `true`
3. Check the user's `profiles.role` — must be in `(SUPER_ADMIN, ADMIN, MANAGER, INVOICE, FINANCE_STAFF)`
4. Check Sentry for the actual error (DSN is wired and verified)

### Sentry telemetry — wiring + prod env verified (issue #22 closed 2026-05-15)

**State (current, verified 2026-05-15):**
- ✅ Sentry project exists: `tapan-cargo-az/javascript-nextjs` on `de.sentry.io`
- ✅ Code wiring complete — all four hooks active:
  - `apps/dashboard/sentry.{client,server,edge}.config.ts` — runtime init with logs + release support
  - `apps/dashboard/instrumentation.ts` — exports `onRequestError = Sentry.captureRequestError` for App Router server-component coverage
  - `apps/dashboard/app/global-error.tsx` — captures React render-time errors
  - `apps/dashboard/next.config.mjs` — wrapped with `withSentryConfig` for source map uploads + ad-blocker tunnel via `/sentry-tunnel`
- ✅ Production DSN is set — Sentry receives events end-to-end (verified via `mcp__sentry__search_issues`, 9 unresolved issues from real production traffic in last 30d as of 2026-05-15)
- ⚠️ **Alert rule still pending** — events arrive in Sentry but no rule fires a notification when a new error appears. Tracked in **#94**.

**Remaining work — alert-rule wiring (tracked in #94):**

Production env vars are set; events flow end-to-end (verified 2026-05-15). The
remaining gap is a notification rule: errors land in Sentry but no one gets
paged. To close #94:

1. **For reference, the env vars that must be set** (already configured in
   production; values stored in the deploy platform's secret store, NOT here):

   ```
   SENTRY_DSN=<DSN from Sentry → Settings → Client Keys (DSN)>
   NEXT_PUBLIC_SENTRY_DSN=<same value as SENTRY_DSN — public by design>
   SENTRY_ENV=production
   NEXT_PUBLIC_SENTRY_ENV=production
   # NEVER paste a real SENTRY_AUTH_TOKEN value into this file. Generate at
   # Settings → Account → API → Auth Tokens (scope: project:releases) and set
   # in the deploy platform's secret store only.
   SENTRY_AUTH_TOKEN=<generated, never committed>
   ```

2. **Configure the alert rule** at https://tapan-cargo-az.sentry.io/alerts:
   - Type: Issue Alert
   - Filter: `tags[kind]:payment_response_lost`
   - Threshold: any event matching, last 1 minute
   - Action: notify ops via Slack / email / PagerDuty
   - Save

3. **Verify the rule fires** via the in-app diagnostic endpoint (added per
   issue #22):

   ```bash
   # Sign in as MANAGER+ in a browser, copy the session cookie, then:

   # (a) Report-only: does Sentry think it's initialized?
   curl -H "Cookie: <session-cookie>" https://<deployed-host>/api/diagnostics/sentry
   # → { enabled: true, dsnHost: "...", ... }

   # (b) Fire a tagged smoke-test event:
   curl -X POST -H "Cookie: <session-cookie>" https://<deployed-host>/api/diagnostics/sentry
   # → { ok: true, eventId: "...", searchQuery: "tags.kind:sentry_smoke_test correlation_id:smoke-..." }
   ```

   The smoke-test event uses `tags.kind:sentry_smoke_test` so it does NOT
   trigger the `payment_response_lost` alert — by design. To verify that
   alert specifically, manually post a test event with the
   `payment_response_lost` tag (or wait for an organic one).

### Migration rollback

**Symptom:** A migration broke production and we need to revert.

1. Migrations are append-only; **don't delete files** — write a corrective forward migration.
2. If urgent rollback needed, restore via Supabase PITR to the most recent good timestamp (within retention window).
3. Coordinate via the `#tac-incidents` channel — every restore is logged in `audit_logs` automatically.

---

## 5. Deployment procedure

### Preview (per-PR)

1. PR opened → Vercel preview deploy auto-builds from the branch.
2. CI runs: `pnpm typecheck && pnpm lint && pnpm test && pnpm e2e:smoke`.
3. Preview URL shared in PR conversation.
4. QA validates against the preview before merge.

### Staging

1. Merge to `staging` branch → Vercel deploys to `staging.tac-express.in`.
2. Manual QA smoke pass (10 min) — sign-in, create shipment, build manifest, scan, generate invoice, public track.
3. Run `pnpm e2e:visual` — review snapshot diffs in the Playwright HTML report.
4. Run `pnpm e2e:a11y` — confirm zero critical violations.

### Production

1. Merge `staging` → `main`. Vercel deploys to `app.tac-express.in`.
2. Sentry release tagged with the commit SHA via `SENTRY_RELEASE` env var.
3. Source maps uploaded automatically (`@sentry/nextjs` build-time integration).
4. Supabase migrations applied via `pnpm supabase:reset` only on **staging** — production migrations are run via a controlled CLI session by the on-call DBA.
5. On-call engineer monitors Sentry + Vercel logs for the first 30 minutes.

### Rollback

- **Vercel:** instant rollback via the dashboard's "Promote previous deployment" button.
- **Supabase migrations:** see Migration rollback above.
- **Edge Functions:** `supabase functions deploy <name>` from the previous commit checkout.

---

## 6. On-call expectations

- **Severity 1** (production down, data loss): page on-call within 5 min via PagerDuty.
- **Severity 2** (partial outage, security alert): respond within 1 hour during business hours.
- **Severity 3** (degraded UX, non-blocking bug): triage by EOD next business day.

Every incident → post-mortem within 48 hours → action items into `.planning/`.

---

## 7. Dashboards

- **Sentry · Issues** — primary source of truth for client + server errors.
- **Vercel · Analytics** — TTFB, LCP, INP per route.
- **Supabase · Reports** — query slow log, RLS hit rate, storage utilization.
- **Upstash · Analytics** — rate-limit hits per identifier.
- **Status page** — see `apps/web/status` (TBD), powered by a public Supabase view.

---

## 8. Forbidden actions in production

These remain locked behind explicit approval, even at SUPER_ADMIN level:

- Direct row-level DB edits via the Supabase SQL editor (use migrations or RPCs)
- Disabling RLS on any table for any reason
- Service-role key in browser code
- Skipping the audit-log insert on a destructive operation
- Disabling the idle timeout
- Bypassing the rate limiter without a justified incident-response paper trail

— END RUNBOOK —
