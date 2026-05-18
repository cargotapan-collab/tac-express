# Retro — Post-#162 follow-up (2026-05-18)

**PR:** TBD (PR A — docs/scope) + sibling source PR (PR B — PL-1).
**Type:** META cleanup + 1 source unit (PL-1).
**Role:** PM + CTO (delegated; owner asked "you decide" mode).
**Branch:** `chore/post-162-followup-scope` from main `5755520`.

---

## 1. TL;DR

PR #162 (the customer-facing surface scoping doc) shipped clean but left five
open threads: an unresolved auth-provider question, a design-system naming
disagreement claimed by the brief, a stuck untracked directory, an
unverified self-report, and PL-1 still open. This session closes all five:

| Thread | Verdict |
|---|---|
| **P1 Auth-provider** | Supabase email+password only; the `[[...sign-in]]` catch-all is dead Clerk-shaped scaffolding. POST-LAUNCH-POLISH (cleanup); NOT a violation. |
| **P2 Design-system name** | "TAC Express v5.0 Violet Grid" wins (canonical in every authoritative file). "TAC Orbital" is the legitimate **telemetry subsystem** name — kept. Three stale comment headers in non-chart components folded into PR B. |
| **P3 Worktree cleanup + process fix** | `tac-whatsapp-sends-102/` removed; new "Worktree & artifact hygiene" section added to `tac-karpathy-discipline` skill. |
| **P4 Verify #162 claims** | All claims hold: merge SHA on main, 9/9 CI checks `success`, no application source touched. |
| **P5 PL-1** | Implemented in PR B (sibling source PR) — landing-page `metadata` export. |

Five threads, five answers, two PRs.

---

## 2. P1 — Auth-provider audit (the source investigation)

### What #162 noticed but did not resolve

The `[[...sign-in]]` and `[[...sign-up]]` optional-catch-all route folders
are Clerk's canonical mounting convention for capturing Clerk's nested
routes (e.g. `/sign-in/factor-one`, `/sign-in/sso-callback`). The project
mandates Supabase auth, so this is either a violation or stale scaffolding.
#162 sidestepped by reframing as "operator-facing only" — a different
question from "which provider is actually in use."

### How the source investigation settled it

| Check | Evidence | Result |
|---|---|---|
| Dependencies | `apps/web/package.json` deps list | No `@clerk/*`; uses `@workspace/database` + `@workspace/services` |
| Repo-wide grep | `git ls-files \| grep -i clerk` | Empty — zero tracked references |
| Sign-in form | `packages/ui/.../sign-in-page-client.tsx` | Calls `createBrowserClient().auth.signInWithPassword` — pure Supabase |
| Sign-up | `apps/dashboard/.../sign-up/[[...sign-up]]/page.tsx` | `redirect("/sign-in")` — intentionally disabled |
| Middleware / env | `proxy.ts` + Supabase env keys | Supabase-only |

**Classification:** (b) Supabase with dead Clerk-shaped routing.

### What ships in this PR

- AGENTS.md gets a new subsection "Auth routing shape — Supabase, with stale Clerk-style catch-all (post-#162 audit 2026-05-18)" stating the verdict + the evidence trail.
- `product-launch-readiness.md` § B.3 adds a LOW-severity row for the stale routing shape.
- § C.2 adds a POST-LAUNCH-POLISH item: rename the catch-all folders to plain `app/sign-in/page.tsx`.
- § J.1 documents the audit in full.

**Auth is NOT rewired.** Source-side, only the route folders need renaming, and that's POST-LAUNCH polish — not gating the launch and not landing in PR A.

---

## 3. P2 — Design-system naming reconciliation

### What the brief claimed vs what is actually true

The brief asserted: "the standing project conventions name it 'TAC Orbital.'"
On current main this is incorrect. The standing project conventions name the
design system **"TAC Express v5.0 Violet Grid"** everywhere authoritative:
AGENTS.md § 3, AGENTS.md § 9 (corrections table explicitly retires "TAC
Orbital"), DESIGN_SYSTEM.md, CLAUDE.md, README.md, and every
`.claude/skills/**/SKILL.md` that names the system.

### The actual situation

"TAC Orbital" survives in two distinct contexts:

1. **As a legitimate scoped subsystem name** — the telemetry/charts adapter
   (`orbital.service.ts`, `orbital.types.ts`, `charts/index.ts`, the
   `--telemetry-*` token block in `globals.css`, `docs/CHARTS-ORBITAL.md`).
   That subsystem uses Violet Grid tokens; the name is scoped to that
   adapter. **KEEP these references.**

2. **As stale comment headers attributing components to "TAC Orbital" as
   the design system** — three files:
   - `packages/ui/src/components/composed/auth/sign-in-split-layout.tsx:26`
   - `packages/ui/src/components/composed/maps/maplibre-map.tsx:47`
   - `packages/ui/src/components/composed/shipments/shipping-label.tsx:71`

   **FIX these to read "TAC Express v5.0 Violet Grid" / "Violet Grid".**

### What ships in this PR

PR A (docs/scope) adds the canonical-name reconciliation to AGENTS.md § 3
and `product-launch-readiness.md` § J.2 (with the full disambiguation
between design-system and subsystem). The three comment-header fixes are
trivial-but-source changes; PR A's classifier confirmed they belong in
PR B (the source PR alongside PL-1) — folded there.

---

## 4. P3 — Worktree cleanup + process fix

### Cleanup

`C:\tac\tac-express\tac-whatsapp-sends-102/` was an untracked stale clone
of the repo, sitting at the repo root (NOT a registered git worktree —
`git worktree list` did not show it; no `.git` directory inside it). It
polluted grep results (40+ files with "TAC Orbital" matched were inside it)
and made `git status` output noisier. Removed.

### Process fix

Added a new section **"Worktree & artifact hygiene (end-of-session teardown)"**
to [`.claude/skills/tac-karpathy-discipline/SKILL.md`](../../.claude/skills/tac-karpathy-discipline/SKILL.md).
The section codifies:

- **Worktree placement:** outside the repo root — `C:/tac/tw-<short-task>` —
  matching the existing `tw-dod`, `tw-launch`, `tw-prodscope`, `tw-sb1`
  pattern. Never clone a sibling repo inside the primary clone.
- **End-of-session checklist:** `git worktree list` → identify
  session-created ones → `git worktree remove <path>` + `git branch -D`
  if merged/abandoned.
- **Stale non-worktree dirs:** verify NOT registered + no `.git` inside,
  confirm with owner if uncommitted-work risk, `rm -rf` otherwise.
- **Skillify trigger:** if the same artifact recurs, escalate to a
  hooked cleanup step.

### Bailout-seam awareness

This is a thin-process-discipline fix — written rule + end-of-session
checklist. The bailout (`tac-skillify` if recurrence) is named explicitly
so the next time this comes up, the answer is "convert to hook," not
"write more discipline."

---

## 5. P4 — #162 self-report verification

Method: against the repo and CI directly, NOT against the handoff prose.

| Claim | Evidence | Status |
|---|---|---|
| Merge SHA on main | `git log 5755520 -1` → "docs(launch): product-launch readiness scope (#162)"; `gh pr view 162` confirms `MERGED` at `2026-05-18T00:22:20Z` | ✅ |
| `backlog-refs-drift` sentinel passes | `gh api repos/.../commits/5755520.../check-runs` → `Backlog references drift check` `success` | ✅ |
| CI state on merge commit | All 9 jobs `success` (Bundle size, Unit tests, registry, migrations, drift, Sentry lint, LAW gates, npm audit, visual + a11y) | ✅ |
| Scope: docs-only | 4 files: `AGENTS.md`, `docs/NEXT-SESSION-HANDOFF.md`, `docs/launch/product-launch-readiness.md` (ADD), `docs/retros/2026-05-17-product-launch-scope.md` (ADD) | ✅ |

No discrepancies. #162's self-report is accurate.

---

## 6. P5 — PL-1 (sibling PR B)

Branched separately from main to keep PR A pure docs/scope. PR B adds:

- `metadata` export at `apps/web/app/(public)/page.tsx` with `title`,
  `description`, `openGraph` (title/description/type/locale/image),
  `twitter` (card/title/description/image).
- The three stale "TAC Orbital" comment-header fixes in
  `sign-in-split-layout.tsx`, `maplibre-map.tsx`, `shipping-label.tsx`.

PR B has the full code-review surface (architecture-gates triggers on
`apps/web/**` + `packages/ui/**`). PR A's path footprint stays out of
the heavy gates.

---

## 7. Discipline observations

### 7.1 The classifier as a forcing function for clean PR splits

The PR-A worktree blocked the three comment-header fixes because the user
designated PR A as docs/scope. The right move was not to override the
classifier — it was to accept the split as the right shape and fold the
comment fixes into PR B (which is already source). The classifier was
doing the work I should have planned for upfront.

**Lesson:** when the user splits a session into "docs PR + source PR,"
mechanical-but-source changes belong in the source PR by default,
**even if they're trivial.** The split exists so source review stays
honest.

### 7.2 Premise check before answering

The brief asserted "standing project conventions name it 'TAC Orbital.'"
A trusted-but-verify pass on current main showed the premise was wrong:
"TAC Express v5.0 Violet Grid" is canonical everywhere authoritative.
Answering the original framing would have produced the wrong cleanup
(renaming `orbital.service.ts` etc., destroying a legitimate subsystem
name). The disambiguation between design-system-name and subsystem-name
is the actual answer.

### 7.3 Bailout-seam naming in P3

P3 was named in advance ("worktree cleanup + process fix") which made the
mechanical split call — `rm` the dir, add a written section to one skill.
If it had been framed as "fix worktree drift across the project," the
same work would have grown into multiple skill edits, a hook, and
durable infra. The 2-PR seam plus the explicit-bailout-clause approach
(memory: `feedback_bailout_seam_naming.md`) earned its keep this session.

---

## 8. Files changed

PR A (docs/scope):

```
EDIT  AGENTS.md                                              # § 3 design-system canonical-name + new auth-routing-shape subsection
EDIT  docs/launch/product-launch-readiness.md               # § B.3 routing-shape gap + § C.2 polish items + new § J audit log
EDIT  .claude/skills/tac-karpathy-discipline/SKILL.md       # new "Worktree & artifact hygiene" section
EDIT  docs/NEXT-SESSION-HANDOFF.md                          # post-#162 follow-up state
NEW   docs/retros/2026-05-18-post-162-followup.md           # this file
DEL   tac-whatsapp-sends-102/                                # untracked stale clone (NOT in any commit; pre-existing untracked)
```

Zero application source touched in PR A. The architecture-gates workflow's
`paths:` filter does not include `AGENTS.md`, `docs/launch/**`, or
`.claude/**` — so the heavy CI surface is skipped for this PR.

PR B (source) — separately scoped:

```
EDIT  apps/web/app/(public)/page.tsx                                                 # PL-1 metadata export
EDIT  packages/ui/src/components/composed/auth/sign-in-split-layout.tsx              # comment header: TAC Orbital → Violet Grid
EDIT  packages/ui/src/components/composed/maps/maplibre-map.tsx                      # comment header: TAC Orbital → Violet Grid
EDIT  packages/ui/src/components/composed/shipments/shipping-label.tsx               # comment header: TAC Orbital → Violet Grid
```

---

## 9. OWNER ACTIONS — before next session

Per AGENTS.md Convention B. Carry-forward from #162 + this session's
findings. Nothing new beyond what #162 surfaced; the post-#162 follow-up
**did not add new owner work.**

### Engineering DoD closeout (still pending, unchanged)

1. **🚀 RUN SB-2** — `scripts/sentry/create-alert-rules.mjs` + verify one rule fires (POST `/api/diagnostics/sentry`) + update [`docs/runbooks/sentry-alert-rules.md`](../runbooks/sentry-alert-rules.md). ~20 min.
2. **Verify SB-3 PREREQUISITES P1–P4** per [`DATABASE-RESTORE.md § 2`](../runbooks/DATABASE-RESTORE.md#2-prerequisites-owner-confirmed--verify-before-launch).
3. **Decide OD-1** — is #154 a SHIP-BLOCKER? Lean: POST-LAUNCH.
4. **Decide OD-2** — should any of the other 4 E1 flows be SHIP-BLOCKERS? Lean: payment-only.
5. **Reopen #94** OR accept as tracker-less DoD item.
6. **CodeRabbit billing** — update payment method.

### Product-launch decisions (the load-bearing thread is OD-P1)

7. **OD-P1 (gating) — Customer-journey model:** sales-led B2B (landing → contact/quote → human onboarding) OR self-serve (landing → customer sign-up → customer dashboard)? *Current surface is sales-led B2B; switching to self-serve is a new auth + RLS + dashboard workstream.* **This unblocks PL-2 and indirectly shapes PL-3/PL-4 scope.** No other PL-blocker can be sized until OD-P1 is answered.
8. **OD-P2** — Brand reference: Figma/mockup exists, or is current Violet Grid the brand?
9. **OD-P3** — Target audience + language scope (English-only?).
10. **OD-P4** — Auth methods at launch: email+password only / OAuth (which provider?) / magic link / password-reset?
11. **OD-P5** — Public marketing scope at launch: all 15 pages, or MVP carve?
12. **OD-P6** — Mobile breakpoint priorities (375w / 390w / 768w?).
13. **OD-P7** — SEO/discoverability goal: organic ranking, outreach-linked, or both?

**Thirteen actions; OD-P1 is the load-bearing one.** Items 7–13 unblock the product-launch workstream. Items 1–6 close the engineering bar. The two are independent.
