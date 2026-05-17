# Next-Session Handoff — Start Here

> **You are picking up TAC Express after PR #<TBD> (W2 PR 1 — WhatsApp failed-sends operator view; the VISIBILITY half of the W2 read/retry split).** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last code commit on `main`:** post-PR-#<TBD> merge — `feat(ui): WhatsApp failed-sends operator view (W2 PR 1, visibility/read)`.
**Date this doc was written:** 2026-05-17 (seventh substantive session today — first UI-building session in the arc).
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + Senior Frontend Architect + Designer + CTO.

**Status of recent work (per `docs/backlog/production-readiness.md`):**
- **W1** (whatsapp_sends audit table): DONE (PR #141).
- **#136 backlog-drift sentinel + Unit tests CI gate**: DONE (PRs #146 + #149).
- **O1** (manifest.service.ts full test floor): DONE (PR #147).
- **#139 + #140** (whatsapp.service source bugs): DONE (PR #148).
- **O2** (`as unknown as` cast cleanup, invoice-pdf): DONE (PR #150).
- **W2** (operator retry UI): **PARTIAL** — PR 1 (visibility/read) DONE this session; **PR 2 (retry action / write) is the next session's natural lead** — see § 6 Option A.
- **W3 / W4 / W5** (whatsapp_sends follow-ups #143–#145): OPEN.

---

## 1. CADENCE PRE-COMMIT (load-bearing — THIRTEEN substantive PRs old)

**Status: HOLDS.** Thirteen real tests across the arc. This session resisted FIVE named bundle temptations from the brief:

1. **Adding automatic/background retry** — that's #143, multi-session build. Not started.
2. **Rebuilding a shadcn primitive** for the status badge — resisted; followed the `exception-severity-badge.tsx` composed-component pattern.
3. **Fetch/DB call inside a `packages/ui` component** — every reusable component is pure (props in, callbacks out); the live wrapper handles the fetch.
4. **Building UI in apps/dashboard** — every reusable piece is in `packages/ui/src/components/composed/`. Apps/ holds only the page entry + the server-side data wrapper.
5. **A styling shortcut — one Tailwind color class "just this once"** — zero. Verified by the negative-assertion in the badge component test: `expect(badge.className).not.toMatch(/\bbg-red-\d+\b/)`.

**New observation (this session):** the brief's design-system framing ("TAC Orbital + 0.125rem") was stale. Reality is "TAC Express v5.0 — Violet Grid + 0rem" per AGENTS.md + globals.css. Followed the authoritative sources. Recorded as discipline § 7.28 — when a brief's design-system label differs from AGENTS.md, AGENTS.md wins; the brief's law list correctly defers to globals.css.

---

## 2. READ THIS FIRST — seven things you must NOT do

(Unchanged.)

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5`.
2. **Do NOT bump dependencies in feature PRs.**
3. **Do NOT add Sentry tag keys without updating all four artifacts.**
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner runs it locally (#94, still pending).
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.**
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** [`docs/backlog/production-readiness.md`](backlog/production-readiness.md) is authoritative.

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 729 tests passing (post-this-PR; +17 from PR 1).
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
```

---

## 4. Current state snapshot

### Open PRs (0 after #<TBD> merges)

### Open issues — derive from [`docs/backlog/production-readiness.md`](backlog/production-readiness.md)

**The repo backlog file is authoritative.** Tracker numbers for cross-reference.

| Tracker | Title | In repo backlog as | Priority |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Sentry alert-rule notification action | **O3** | P2 (owner-runnable) |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | not in backlog (tooling) | own session |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded type cluster | not in backlog — SCOPE EXPANDED twice (PR #150 retro § 8.3; PR <TBD> retro § 9.3) | own session |
| [#142](https://github.com/cargotapan-collab/tac-express/issues/142) | Operator retry UI | **W2 — PARTIAL** (PR 1 done this session; PR 2 filed as follow-up) | medium |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated retry job | **W3** | low |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta delivery webhook | **W4** | medium-low |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | App-layer immutability sentinel | **W5** | low |
| [#151](https://github.com/cargotapan-collab/tac-express/issues/151) | proxy.ts cast cleanup | not in backlog | own session (small) |
| [#<TBD-W2-PR2>](TBD) | NEW: W2 PR 2 — retry action (button + POST /retry-send route) | added to backlog under W2 PR 2 scope | medium |

**Recently resolved:** the audit_logs+test-floor arc (PRs #133/#135/#138/#141/#147), the backlog-drift sentinel + Unit tests CI gate (PRs #146 + #149), whatsapp.service source bugs (#148), invoice-pdf cast (#150), **W2 visibility (this PR)**.

---

## 5. Critical context (the things that will trip you up)

### 5.1 — 5.10 (unchanged — see prior handoffs)

### 5.11 NEW: TAC Express v5.0 Violet Grid design-system policy (the authoritative reminder)

The design system on main IS **TAC Express v5.0 — Violet Grid**:
- `--radius: 0rem` (LAW 13). Zero radius. Sharp corners only.
- Brutalist offset shadows (`--shadow-*` resolve to 1px–16px offsets on `var(--border)`).
- Violet-anchored signal palette with semantic tokens (`--primary`, `--accent-warning`, `--destructive`, `--muted-foreground`).
- Plus Jakarta Sans / IBM Plex Mono / Lora fonts (declared only in `apps/*/app/layout.tsx`).
- Dark-first + Modern Ivory light theme.

When a session brief uses different terminology ("TAC Orbital", "0.125rem", etc.), the brief's preamble is stale — the brief's PROJECT LAWS list itself correctly defers to globals.css. AGENTS.md § 3 is the authoritative spec; globals.css is the authoritative variables.

### 5.12 NEW: WhatsApp failed-sends operator view exists (this PR)

`/ops-console/whatsapp/failed-sends` is a MANAGER+-gated page that lists failed WhatsApp sends in the last 7 days. Built on PR #141's `whatsapp_sends` table. The retry action does NOT yet exist — that's W2 PR 2 (filed as a follow-up).

Pure UI components in `packages/ui/src/components/composed/whatsapp/`:
- `WhatsAppSendStatusBadge` — status badge (mirrors `exception-severity-badge.tsx` pattern).
- `FailedSendsTable` — wraps the project's `DataTable` with WhatsApp-specific columns.

Page-shape view in `packages/ui/src/components/composed/ops-console/pages/`:
- `OpsWhatsAppFailedSendsView` — full view composition (OpsFrame + OpsPageHead + OpsCard + table).

App-side wrapper in `apps/dashboard/app/ops-console/whatsapp/failed-sends/`:
- `page.tsx` — server entry.
- `ops-whatsapp-failed-sends-live.tsx` — server component that role-gates + fetches.

New service method `listFailedWhatsappSends({ limit?, sinceDays? })` in `packages/services/src/whatsapp-tracked.service.ts`.

---

## 6. Your first task — recommended

**The next-lead source of truth is [`docs/backlog/production-readiness.md`](backlog/production-readiness.md).** Per the backlog's open items + this session's filed follow-up:

### Option A — W2 PR 2: retry action (button + POST /retry-send route) — RECOMMENDED DIRECT CONTINUATION

Visibility shipped this PR; the retry action is the natural next half. Scope:
- New `RetryWhatsappSendButton` component (pure UI in `packages/ui/src/components/composed/whatsapp/`).
- New `POST /api/whatsapp/retry-send` API route (role-gated MANAGER+; calls existing `retryWhatsappSend(originalSendId, replayPayload)` shipped in PR #141).
- Extend `FailedSendsTable` with a retry-button column.
- Extend `OpsWhatsAppFailedSendsLive` with the client-side mutation handler (in-flight disabled state, post-retry refetch or optimistic update — PHASE-0 decision).

Estimated: ~1 session. Pattern-reuses every primitive shipped in PR 1 + the `retryWhatsappSend` service method from PR #141.

### Option B — W3 / W4 / W5 — the other whatsapp_sends follow-ups

W4 (Meta delivery-callback webhook) is the most logically next after W2 PR 2 — it adds the missing `delivered` status to round out the whatsapp_sends model. W3 (automated retry) is multi-session. W5 (immutability sentinel) is defense-in-depth.

### Option C — #130 (regex-alternation LAW gate) — small tooling

Own session.

### Option D — #131 (branded type cluster) — SCOPE EXPANDED

Per the retro § 9.3, the cluster now spans ~12 service mappers + 3+ web consumers + 4 test-fixture helpers. Picking this up requires a PHASE-0 deciding the branded-type extension strategy.

### Option E — #151 — proxy.ts cast cleanup (~30 min)

### Option F — Permissions convergence cleanup (PR #149 carry-forward)

8 architecture-gates jobs to converge to `permissions: contents: read`.

### Option G — #94 (owner-runnable Sentry provisioning) — not an agent task

---

## 7. Cumulative discipline observations (carry-forward)

Distilled from PRs #105 → #<TBD>.

### 7.1 – 7.26 (unchanged — see prior handoffs)

### 7.27 NEW (this session): When a brief names a split seam AND the inventory confirms it, take the split

This session ran a deliberate bailout per the brief's read/retry seam. PR 1 (visibility) shipped independently coherent + valuable; PR 2 (retry action) is filed as a clean follow-up with explicit scope. The split kept design discipline tight — cramming both halves would have meant skimping on a11y / test depth / design-system attestation. Pattern: when a brief explicitly names a seam AND the PHASE-A inventory confirms the full feature exceeds one PR, take the split; don't force.

### 7.28 NEW (this session): When a brief's design-system framing differs from AGENTS.md, AGENTS.md wins

The brief used stale terminology ("TAC Orbital + 0.125rem"); AGENTS.md + globals.css have the authoritative current spec ("TAC Express v5.0 — Violet Grid + 0rem"). The brief's PROJECT LAWS list itself correctly says "Use ONLY the semantic CSS variables defined in globals.css" — that rule is the tiebreaker. Verify the design system from AGENTS.md/globals.css at the start of every UI session, regardless of what the brief preamble says.

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
# Service test floors:
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts
pnpm vitest run packages/services/src/__tests__/shipment.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp-tracked.service.test.ts   # NOW includes listFailedWhatsappSends cases (this PR)
pnpm vitest run packages/services/src/__tests__/manifest.service.test.ts
# Sentinels:
pnpm vitest run apps/dashboard/__tests__/backlog-refs-drift.test.ts                # NOW 43 cases (10 new symbol refs from this PR)
pnpm vitest run apps/dashboard/__tests__/audit-doc-references.test.ts
pnpm vitest run apps/dashboard/__tests__/api-routes-no-console.test.ts
pnpm vitest run apps/dashboard/__tests__/rbac-block-adoption.test.ts
pnpm vitest run packages/services/src/__tests__/silent-by-design.test.ts
pnpm vitest run packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
# NEW component tests this PR:
pnpm vitest run packages/ui/src/components/composed/whatsapp/whatsapp-send-status-badge.test.tsx
pnpm vitest run packages/ui/src/components/composed/whatsapp/failed-sends-table.test.tsx
node scripts/ci-watch-pr.mjs <pr-number>
```

---

## 9. Key file locations (additions this PR)

```
# Pure UI components (packages/ui)
packages/ui/src/components/composed/whatsapp/whatsapp-send-status-badge.tsx
packages/ui/src/components/composed/whatsapp/failed-sends-table.tsx
packages/ui/src/components/composed/ops-console/pages/ops-whatsapp-failed-sends-view.tsx

# UI component tests
packages/ui/src/components/composed/whatsapp/whatsapp-send-status-badge.test.tsx
packages/ui/src/components/composed/whatsapp/failed-sends-table.test.tsx

# App-side composition + role-gate + fetch (apps/dashboard)
apps/dashboard/app/ops-console/whatsapp/failed-sends/page.tsx
apps/dashboard/app/ops-console/whatsapp/failed-sends/ops-whatsapp-failed-sends-live.tsx

# Service-side
packages/services/src/whatsapp-tracked.service.ts  # listFailedWhatsappSends added
packages/services/src/__tests__/whatsapp-tracked.service.test.ts  # 5 new cases

# Types
packages/types/src/whatsapp-send.types.ts  # FailedWhatsappSendRow added

# Decision doc + retro
docs/decisions/2026-05-17-whatsapp-failed-sends-view.md
docs/retros/2026-05-17-whatsapp-retry-ui.md
```

---

## 10. The honest read

A first-UI session executed strictly to the project's design-system + 14 laws + monorepo structure. The bailout was the right call — PR 1 (visibility) ships independently coherent + valuable; PR 2 (retry action) is a clean follow-up.

Source diff: ~390 LoC of new code + ~260 LoC of new tests + ~750 LoC of docs. Tests 712 → 729 (+17). The brief's "DO NOT" list ran twelve items long; all twelve held — including one Tailwind color class, one rebuilt shadcn primitive, one DB call in `packages/ui`. The cadence-pre-commit is now THIRTEEN substantive PRs old and still holding.

**Recommended one-line summary for the next session's prompt:** "Pick up W2 PR 2 — the retry action (button + POST /retry-send route). Pattern-reuses PR 1's components + PR #141's `retryWhatsappSend` primitive. ONE PR. Decline any 'while we're here' expansion."

---

**Load the skills. Re-read § 1 (cadence pre-commit, THIRTEEN substantive PRs old). Pick a task from § 6 — or better, from `docs/backlog/production-readiness.md` directly. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff.
